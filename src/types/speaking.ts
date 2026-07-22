
export interface SpeakingSession {
  id: string;
  student_id: string;
  session_type: 'role_play' | 'picture_talk' | 'random_questions';
  scenario_name: string;
  cefr_level: string;
  duration_seconds: number;
  xp_earned: number;
  pronunciation_score?: number;
  grammar_score?: number;
  fluency_score?: number;
  overall_rating?: number;
  feedback_notes?: string;
  completed_at: string;
  created_at: string;
}

export interface SpeakingProgress {
  id: string;
  student_id: string;
  total_speaking_time: number;
  total_sessions: number;
  current_streak: number;
  longest_streak: number;
  last_practice_date?: string;
  current_cefr_level: string;
  speaking_xp: number;
  badges_earned: string[];
  updated_at: string;
  created_at: string;
}

export interface SpeakingScenario {
  id: string;
  name: string;
  type: 'role_play' | 'picture_talk' | 'random_questions';
  cefr_level: string;
  description: string;
  prompt: string;
  context_instructions?: string;
  expected_duration: number;
  difficulty_rating: number;
  tags: string[];
  is_active: boolean;
  created_at: string;
}

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  audioUrl?: string;
  feedback?: MessageFeedback;
}

export interface MessageFeedback {
  pronunciation_score?: number;
  grammar_suggestions?: string[];
  alternative_phrases?: string[];
  rating: number; // 1-5 stars
  encouragement: string;
}

export interface VoiceRecordingState {
  isRecording: boolean;
  isProcessing: boolean;
  audioBlob?: Blob;
  transcript?: string;
}

export interface SpeakingBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: string;
  earnedAt?: string;
}

// New interfaces for enhanced AI speaking practice
export interface AIConversationSession {
  id: string;
  student_id: string;
  session_type: 'live_chat' | 'voice_practice' | 'assessment';
  scenario_id?: string;
  conversation_topic?: string;
  ai_personality: string;
  voice_enabled: boolean;
  session_duration: number;
  messages_count: number;
  session_data: Record<string, any>;
  quality_rating?: number;
  feedback_notes?: string;
  started_at: string;
  ended_at?: string;
  created_at: string;
}

export interface SpeakingAssessment {
  id: string;
  session_id: string;
  student_id: string;
  pronunciation_score?: number;
  fluency_score?: number;
  grammar_score?: number;
  vocabulary_score?: number;
  coherence_score?: number;
  overall_cefr_estimate?: string;
  improvement_areas: string[];
  strengths: string[];
  specific_feedback: Record<string, any>;
  ai_generated_feedback?: string;
  assessment_date: string;
  created_at: string;
}

export interface StudentSpeakingGoals {
  id: string;
  student_id: string;
  target_cefr_level: string;
  daily_practice_minutes: number;
  weekly_sessions_goal: number;
  focus_areas: string[];
  deadline?: string;
  current_streak: number;
  longest_streak: number;
  is_active: boolean;
  progress_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface LiveAIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  audioUrl?: string;
  isProcessing?: boolean;
  feedback?: MessageFeedback;
}

export interface AIPersonality {
  id: string;
  name: string;
  description: string;
  voice_model?: string;
  personality_traits: string[];
  cefr_levels: string[];
  avatar_url?: string;
}
