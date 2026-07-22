
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { 
  SpeakingSession, 
  SpeakingProgress, 
  SpeakingScenario, 
  AIConversationSession, 
  SpeakingAssessment, 
  StudentSpeakingGoals 
} from '@/types/speaking';

const getCurrentUserId = async (): Promise<string | null> => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase configuration is required');
  }
  
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
};

export const speakingPracticeService = {
  async getScenarios(cefrLevel?: string): Promise<SpeakingScenario[]> {
    let query = supabase
      .from('speaking_scenarios')
      .select('*')
      .eq('is_active', true)
      .order('difficulty_rating', { ascending: true });

    if (cefrLevel) {
      query = query.eq('cefr_level', cefrLevel);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching scenarios:', error);
      throw error;
    }
    return data || [];
  },

  async getScenariosByType(type: 'role_play' | 'picture_talk' | 'random_questions'): Promise<SpeakingScenario[]> {
    const { data, error } = await supabase
      .from('speaking_scenarios')
      .select('*')
      .eq('type', type)
      .eq('is_active', true)
      .order('difficulty_rating', { ascending: true });

    if (error) {
      console.error('Error fetching scenarios by type:', error);
      throw error;
    }
    return data || [];
  },

  async createSession(sessionData: Omit<SpeakingSession, 'id' | 'created_at' | 'completed_at' | 'student_id'>): Promise<SpeakingSession> {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      throw new Error('User must be authenticated to create a speaking session');
    }
    
    const sessionWithUser = {
      ...sessionData,
      student_id: userId,
      completed_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('speaking_sessions')
      .insert([sessionWithUser])
      .select()
      .single();

    if (error) {
      console.error('Error creating session:', error);
      throw error;
    }
    
    return data;
  },

  async getUserSessions(limit: number = 10): Promise<SpeakingSession[]> {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      return [];
    }
    
    const { data, error } = await supabase
      .from('speaking_sessions')
      .select('*')
      .eq('student_id', userId)
      .order('completed_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching user sessions:', error);
      throw error;
    }
    return data || [];
  },

  async getUserProgress(): Promise<SpeakingProgress | null> {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      return null;
    }
    
    const { data, error } = await supabase
      .from('speaking_progress')
      .select('*')
      .eq('student_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user progress:', error);
      throw error;
    }
    return data;
  },

  async initializeProgress(): Promise<SpeakingProgress | null> {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      throw new Error('User must be authenticated to initialize progress');
    }
    
    const { data, error } = await supabase
      .from('speaking_progress')
      .insert([{
        student_id: userId,
        current_cefr_level: 'A1',
        total_speaking_time: 0,
        total_sessions: 0,
        current_streak: 0,
        longest_streak: 0,
        speaking_xp: 0,
        badges_earned: []
      }])
      .select()
      .single();

    if (error) {
      console.error('Error initializing progress:', error);
      throw error;
    }
    
    return data;
  },

  async updateBadges(newBadge?: string): Promise<void> {
    const userId = await getCurrentUserId();
    
    if (!userId || !newBadge) return;
    
    const progress = await this.getUserProgress();
    if (!progress) return;

    const currentBadges = progress.badges_earned || [];
    if (currentBadges.includes(newBadge)) return;

    const { error } = await supabase
      .from('speaking_progress')
      .update({
        badges_earned: [...currentBadges, newBadge],
        updated_at: new Date().toISOString()
      })
      .eq('student_id', userId);

    if (error) {
      console.error('Error updating badges:', error);
      throw error;
    }
    
  },

  async getTodaysSpeakingTime(): Promise<number> {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      return 0;
    }
    
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('speaking_sessions')
      .select('duration_seconds')
      .eq('student_id', userId)
      .gte('completed_at', `${today}T00:00:00`)
      .lt('completed_at', `${today}T23:59:59`);

    if (error) {
      console.error('Error fetching today\'s speaking time:', error);
      throw error;
    }
    
    return (data || []).reduce((total, session) => total + session.duration_seconds, 0);
  },

  // Enhanced level-based scenario retrieval
  async getStudentAppropriateScenarios(): Promise<SpeakingScenario[]> {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      throw new Error('User must be authenticated');
    }

    const { data, error } = await supabase.rpc('get_student_appropriate_scenarios', {
      student_uuid: userId
    });

    if (error) {
      console.error('Error fetching student scenarios:', error);
      throw error;
    }

    return data || [];
  },

  // AI Conversation Sessions
  async createAIConversationSession(sessionData: {
    session_type: 'live_chat' | 'voice_practice' | 'assessment';
    scenario_id?: string;
    conversation_topic?: string;
    ai_personality?: string;
    voice_enabled?: boolean;
  }): Promise<AIConversationSession> {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      throw new Error('User must be authenticated');
    }

    const { data, error } = await supabase
      .from('ai_conversation_sessions')
      .insert([{
        student_id: userId,
        session_type: sessionData.session_type,
        scenario_id: sessionData.scenario_id,
        conversation_topic: sessionData.conversation_topic,
        ai_personality: sessionData.ai_personality || 'friendly_tutor',
        voice_enabled: sessionData.voice_enabled || false,
        session_data: {}
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating AI conversation session:', error);
      throw error;
    }

    return data;
  },

  async updateAIConversationSession(sessionId: string, updates: {
    session_duration?: number;
    messages_count?: number;
    session_data?: Record<string, any>;
    quality_rating?: number;
    feedback_notes?: string;
    ended_at?: string;
  }): Promise<void> {
    const { error } = await supabase
      .from('ai_conversation_sessions')
      .update(updates)
      .eq('id', sessionId);

    if (error) {
      console.error('Error updating AI conversation session:', error);
      throw error;
    }
  },

  async getAIConversationSessions(limit: number = 20): Promise<AIConversationSession[]> {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      return [];
    }

    const { data, error } = await supabase
      .from('ai_conversation_sessions')
      .select('*')
      .eq('student_id', userId)
      .order('started_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching AI conversation sessions:', error);
      throw error;
    }

    return data || [];
  },

  // Speaking Assessments
  async createSpeakingAssessment(assessmentData: {
    session_id: string;
    pronunciation_score?: number;
    fluency_score?: number;
    grammar_score?: number;
    vocabulary_score?: number;
    coherence_score?: number;
    overall_cefr_estimate?: string;
    improvement_areas?: string[];
    strengths?: string[];
    specific_feedback?: Record<string, any>;
    ai_generated_feedback?: string;
  }): Promise<SpeakingAssessment> {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      throw new Error('User must be authenticated');
    }

    const { data, error } = await supabase
      .from('speaking_assessments')
      .insert([{
        ...assessmentData,
        student_id: userId,
        improvement_areas: assessmentData.improvement_areas || [],
        strengths: assessmentData.strengths || [],
        specific_feedback: assessmentData.specific_feedback || {}
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating speaking assessment:', error);
      throw error;
    }

    return data;
  },

  async getSpeakingAssessments(limit: number = 10): Promise<SpeakingAssessment[]> {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      return [];
    }

    const { data, error } = await supabase
      .from('speaking_assessments')
      .select('*')
      .eq('student_id', userId)
      .order('assessment_date', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching speaking assessments:', error);
      throw error;
    }

    return data || [];
  },

  // Student Speaking Goals
  async createSpeakingGoals(goalsData: {
    target_cefr_level: string;
    daily_practice_minutes?: number;
    weekly_sessions_goal?: number;
    focus_areas?: string[];
    deadline?: string;
  }): Promise<StudentSpeakingGoals> {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      throw new Error('User must be authenticated');
    }

    // First, deactivate any existing active goals
    await supabase
      .from('student_speaking_goals')
      .update({ is_active: false })
      .eq('student_id', userId)
      .eq('is_active', true);

    const { data, error } = await supabase
      .from('student_speaking_goals')
      .insert([{
        student_id: userId,
        target_cefr_level: goalsData.target_cefr_level,
        daily_practice_minutes: goalsData.daily_practice_minutes || 15,
        weekly_sessions_goal: goalsData.weekly_sessions_goal || 5,
        focus_areas: goalsData.focus_areas || [],
        deadline: goalsData.deadline,
        is_active: true
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating speaking goals:', error);
      throw error;
    }

    return data;
  },

  async getActiveSpeakingGoals(): Promise<StudentSpeakingGoals | null> {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      return null;
    }

    const { data, error } = await supabase
      .from('student_speaking_goals')
      .select('*')
      .eq('student_id', userId)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching active speaking goals:', error);
      throw error;
    }

    return data;
  },

  async updateSpeakingGoals(goalId: string, updates: {
    target_cefr_level?: string;
    daily_practice_minutes?: number;
    weekly_sessions_goal?: number;
    focus_areas?: string[];
    deadline?: string;
    progress_percentage?: number;
  }): Promise<void> {
    const { error } = await supabase
      .from('student_speaking_goals')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', goalId);

    if (error) {
      console.error('Error updating speaking goals:', error);
      throw error;
    }
  }
};
