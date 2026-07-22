
import { supabase } from "@/lib/supabase";

export interface StudentXP {
  id: string;
  student_id: string;
  total_xp: number;
  current_level: number;
  xp_in_current_level: number;
  last_activity_date: string;
  created_at: string;
  updated_at: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  xp_reward: number;
  requirements: Record<string, any>;
  is_active: boolean;
  created_at: string;
}

export interface StudentAchievement {
  id: string;
  student_id: string;
  achievement_id: string;
  earned_at: string;
  progress: Record<string, any>;
  achievement?: Achievement;
}

export interface LearningAnalytics {
  id: string;
  student_id: string;
  activity_type: string;
  skill_area: string;
  session_duration: number;
  accuracy_score?: number;
  completion_rate?: number;
  xp_earned: number;
  metadata: Record<string, any>;
  recorded_at: string;
}

export interface PerformanceMetrics {
  id: string;
  student_id: string;
  metric_type: string;
  metric_value: number;
  time_period: 'daily' | 'weekly' | 'monthly';
  date_recorded: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface ProgressSummary {
  totalXP: number;
  currentLevel: number;
  xpProgress: number;
  achievementsEarned: number;
  totalAchievements: number;
  weeklyActivity: number;
  skillBreakdown: Record<string, number>;
  recentAchievements: StudentAchievement[];
}

export class ProgressAnalyticsError extends Error {
  constructor(message: string, public code?: string, public originalError?: any) {
    super(message);
    this.name = 'ProgressAnalyticsError';
  }
}

class ProgressAnalyticsService {
  private handleError(operation: string, error: any): never {
    console.error(`ProgressAnalyticsService ${operation} error:`, error);
    
    if (error?.code === 'PGRST116') {
      throw new ProgressAnalyticsError('No data found', 'NOT_FOUND', error);
    }
    
    if (error?.code === 'PGRST301') {
      throw new ProgressAnalyticsError('Authentication required', 'UNAUTHORIZED', error);
    }
    
    if (error?.message?.includes('network')) {
      throw new ProgressAnalyticsError('Network connection error. Please check your internet and try again.', 'NETWORK_ERROR', error);
    }
    
    throw new ProgressAnalyticsError(
      error?.message || `Failed to ${operation}. Please try again.`,
      error?.code || 'UNKNOWN_ERROR',
      error
    );
  }

  // XP Management
  async getStudentXP(studentId: string): Promise<StudentXP | null> {
    try {
      if (!studentId) {
        throw new ProgressAnalyticsError('Student ID is required', 'INVALID_INPUT');
      }

      const { data, error } = await supabase
        .from('student_xp')
        .select('*')
        .eq('student_id', studentId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No XP record found - this is expected for new users
        }
        this.handleError('getStudentXP', error);
      }
      
      return data;
    } catch (error) {
      if (error instanceof ProgressAnalyticsError) {
        throw error;
      }
      this.handleError('getStudentXP', error);
    }
  }

  async updateStudentXP(studentId: string, xpToAdd: number): Promise<any> {
    try {
      if (!studentId) {
        throw new ProgressAnalyticsError('Student ID is required', 'INVALID_INPUT');
      }
      
      if (!Number.isInteger(xpToAdd) || xpToAdd < 0) {
        throw new ProgressAnalyticsError('XP amount must be a positive integer', 'INVALID_INPUT');
      }

      const { data, error } = await supabase.rpc('update_student_xp', {
        student_uuid: studentId,
        xp_to_add: xpToAdd
      });

      if (error) {
        this.handleError('updateStudentXP', error);
      }
      
      return data;
    } catch (error) {
      if (error instanceof ProgressAnalyticsError) {
        throw error;
      }
      this.handleError('updateStudentXP', error);
    }
  }

  // Achievement Management
  async getAllAchievements(): Promise<Achievement[]> {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true });

      if (error) {
        this.handleError('getAllAchievements', error);
      }
      
      return data || [];
    } catch (error) {
      if (error instanceof ProgressAnalyticsError) {
        throw error;
      }
      this.handleError('getAllAchievements', error);
    }
  }

  async getStudentAchievements(studentId: string): Promise<StudentAchievement[]> {
    try {
      if (!studentId) {
        throw new ProgressAnalyticsError('Student ID is required', 'INVALID_INPUT');
      }

      const { data, error } = await supabase
        .from('student_achievements')
        .select(`
          *,
          achievement:achievements(*)
        `)
        .eq('student_id', studentId)
        .order('earned_at', { ascending: false });

      if (error) {
        this.handleError('getStudentAchievements', error);
      }
      
      return data || [];
    } catch (error) {
      if (error instanceof ProgressAnalyticsError) {
        throw error;
      }
      this.handleError('getStudentAchievements', error);
    }
  }

  async checkAndAwardAchievements(studentId: string, activityData: Record<string, any>): Promise<any[]> {
    try {
      if (!studentId) {
        throw new ProgressAnalyticsError('Student ID is required', 'INVALID_INPUT');
      }
      
      if (!activityData || typeof activityData !== 'object') {
        throw new ProgressAnalyticsError('Activity data must be a valid object', 'INVALID_INPUT');
      }

      const { data, error } = await supabase.rpc('check_achievements', {
        student_uuid: studentId,
        activity_data: activityData
      });

      if (error) {
        this.handleError('checkAndAwardAchievements', error);
      }
      
      return data || [];
    } catch (error) {
      if (error instanceof ProgressAnalyticsError) {
        throw error;
      }
      this.handleError('checkAndAwardAchievements', error);
    }
  }

  // Analytics Recording
  async recordLearningActivity(data: Omit<LearningAnalytics, 'id' | 'recorded_at'>): Promise<void> {
    try {
      if (!data.student_id || !data.activity_type || !data.skill_area) {
        throw new ProgressAnalyticsError('Required fields missing: student_id, activity_type, skill_area', 'INVALID_INPUT');
      }

      const { error } = await supabase
        .from('learning_analytics')
        .insert([data]);

      if (error) {
        this.handleError('recordLearningActivity', error);
      }
    } catch (error) {
      if (error instanceof ProgressAnalyticsError) {
        throw error;
      }
      this.handleError('recordLearningActivity', error);
    }
  }

  async recordPerformanceMetric(data: Omit<PerformanceMetrics, 'id' | 'created_at'>): Promise<void> {
    try {
      if (!data.student_id || !data.metric_type || data.metric_value === undefined) {
        throw new ProgressAnalyticsError('Required fields missing: student_id, metric_type, metric_value', 'INVALID_INPUT');
      }

      const { error } = await supabase
        .from('performance_metrics')
        .insert([data]);

      if (error) {
        this.handleError('recordPerformanceMetric', error);
      }
    } catch (error) {
      if (error instanceof ProgressAnalyticsError) {
        throw error;
      }
      this.handleError('recordPerformanceMetric', error);
    }
  }

  // Analytics Queries
  async getLearningAnalytics(studentId: string, days: number = 30): Promise<LearningAnalytics[]> {
    try {
      if (!studentId) {
        throw new ProgressAnalyticsError('Student ID is required', 'INVALID_INPUT');
      }
      
      if (!Number.isInteger(days) || days < 1 || days > 365) {
        throw new ProgressAnalyticsError('Days must be between 1 and 365', 'INVALID_INPUT');
      }

      const { data, error } = await supabase
        .from('learning_analytics')
        .select('*')
        .eq('student_id', studentId)
        .gte('recorded_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
        .order('recorded_at', { ascending: false });

      if (error) {
        this.handleError('getLearningAnalytics', error);
      }
      
      return data || [];
    } catch (error) {
      if (error instanceof ProgressAnalyticsError) {
        throw error;
      }
      this.handleError('getLearningAnalytics', error);
    }
  }

  async getPerformanceMetrics(studentId: string, timePeriod: string = 'weekly'): Promise<PerformanceMetrics[]> {
    try {
      if (!studentId) {
        throw new ProgressAnalyticsError('Student ID is required', 'INVALID_INPUT');
      }
      
      const validPeriods = ['daily', 'weekly', 'monthly'];
      if (!validPeriods.includes(timePeriod)) {
        throw new ProgressAnalyticsError('Time period must be daily, weekly, or monthly', 'INVALID_INPUT');
      }

      const { data, error } = await supabase
        .from('performance_metrics')
        .select('*')
        .eq('student_id', studentId)
        .eq('time_period', timePeriod)
        .order('date_recorded', { ascending: false })
        .limit(10);

      if (error) {
        this.handleError('getPerformanceMetrics', error);
      }
      
      return data || [];
    } catch (error) {
      if (error instanceof ProgressAnalyticsError) {
        throw error;
      }
      this.handleError('getPerformanceMetrics', error);
    }
  }

  // Comprehensive Progress Summary
  async getProgressSummary(studentId: string): Promise<ProgressSummary | null> {
    try {
      if (!studentId) {
        throw new ProgressAnalyticsError('Student ID is required', 'INVALID_INPUT');
      }

      const [xpData, achievementsData, allAchievements, analyticsData] = await Promise.allSettled([
        this.getStudentXP(studentId),
        this.getStudentAchievements(studentId),
        this.getAllAchievements(),
        this.getLearningAnalytics(studentId, 7)
      ]);

      // Handle any failures in the parallel requests
      const xpResult = xpData.status === 'fulfilled' ? xpData.value : null;
      const achievementsResult = achievementsData.status === 'fulfilled' ? achievementsData.value : [];
      const allAchievementsResult = allAchievements.status === 'fulfilled' ? allAchievements.value : [];
      const analyticsResult = analyticsData.status === 'fulfilled' ? analyticsData.value : [];

      if (!xpResult) {
        // Return default summary for new users
        return {
          totalXP: 0,
          currentLevel: 1,
          xpProgress: 0,
          achievementsEarned: 0,
          totalAchievements: allAchievementsResult.length,
          weeklyActivity: 0,
          skillBreakdown: {},
          recentAchievements: []
        };
      }

      // Calculate skill breakdown
      const skillBreakdown: Record<string, number> = {};
      analyticsResult.forEach(activity => {
        skillBreakdown[activity.skill_area] = (skillBreakdown[activity.skill_area] || 0) + activity.xp_earned;
      });

      // Calculate weekly activity
      const weeklyActivity = analyticsResult.reduce((sum, activity) => sum + activity.session_duration, 0);

      return {
        totalXP: xpResult.total_xp,
        currentLevel: xpResult.current_level,
        xpProgress: (xpResult.xp_in_current_level / 500) * 100, // Assuming 500 XP per level
        achievementsEarned: achievementsResult.length,
        totalAchievements: allAchievementsResult.length,
        weeklyActivity: Math.round(weeklyActivity / 60), // Convert to minutes
        skillBreakdown,
        recentAchievements: achievementsResult.slice(0, 3)
      };
    } catch (error) {
      if (error instanceof ProgressAnalyticsError) {
        throw error;
      }
      this.handleError('getProgressSummary', error);
    }
  }

  // Activity Tracking Helpers
  async trackLessonCompletion(studentId: string, lessonData: {
    duration: number;
    accuracy: number;
    skillArea: string;
    xpEarned: number;
  }): Promise<void> {
    try {
      if (!studentId) {
        throw new ProgressAnalyticsError('Student ID is required', 'INVALID_INPUT');
      }
      
      if (!lessonData || typeof lessonData !== 'object') {
        throw new ProgressAnalyticsError('Lesson data is required', 'INVALID_INPUT');
      }

      // Validate lesson data
      const { duration, accuracy, skillArea, xpEarned } = lessonData;
      if (duration < 0 || accuracy < 0 || accuracy > 100 || xpEarned < 0 || !skillArea) {
        throw new ProgressAnalyticsError('Invalid lesson data provided', 'INVALID_INPUT');
      }

      // Record analytics
      await this.recordLearningActivity({
        student_id: studentId,
        activity_type: 'lesson_completion',
        skill_area: skillArea,
        session_duration: duration,
        accuracy_score: accuracy,
        completion_rate: 100,
        xp_earned: xpEarned,
        metadata: {}
      });

      // Update XP
      await this.updateStudentXP(studentId, xpEarned);

      // Check for achievements
      await this.checkAndAwardAchievements(studentId, {
        lessons_completed: 1,
        words_learned: Math.floor(duration / 30), // Estimate words learned
        perfect_scores: accuracy === 100 ? 1 : 0,
        fast_completion: duration < 600 ? 1 : 0 // Under 10 minutes
      });
    } catch (error) {
      if (error instanceof ProgressAnalyticsError) {
        throw error;
      }
      this.handleError('trackLessonCompletion', error);
    }
  }

  async trackSpeakingPractice(studentId: string, speakingData: {
    duration: number;
    overallRating: number;
    xpEarned: number;
  }): Promise<void> {
    try {
      if (!studentId) {
        throw new ProgressAnalyticsError('Student ID is required', 'INVALID_INPUT');
      }
      
      if (!speakingData || typeof speakingData !== 'object') {
        throw new ProgressAnalyticsError('Speaking data is required', 'INVALID_INPUT');
      }

      const { duration, overallRating, xpEarned } = speakingData;
      if (duration < 0 || overallRating < 1 || overallRating > 5 || xpEarned < 0) {
        throw new ProgressAnalyticsError('Invalid speaking data provided', 'INVALID_INPUT');
      }

      await this.recordLearningActivity({
        student_id: studentId,
        activity_type: 'speaking_practice',
        skill_area: 'speaking',
        session_duration: duration,
        accuracy_score: overallRating * 20, // Convert to 0-100 scale
        completion_rate: 100,
        xp_earned: xpEarned,
        metadata: {}
      });

      await this.updateStudentXP(studentId, xpEarned);

      await this.checkAndAwardAchievements(studentId, {
        speaking_exercises: 1
      });
    } catch (error) {
      if (error instanceof ProgressAnalyticsError) {
        throw error;
      }
      this.handleError('trackSpeakingPractice', error);
    }
  }
}

export const progressAnalyticsService = new ProgressAnalyticsService();
