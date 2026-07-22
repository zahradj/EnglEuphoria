import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { 
  AIInsight, 
  LearningIntervention, 
  SmartRecommendation, 
  LearningAnalyticsEvent,
  PredictiveInsight,
  LearningPatternAnalysis 
} from '@/types/analytics';

export const useAdvancedAnalytics = () => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [interventions, setInterventions] = useState<LearningIntervention[]>([]);
  const [recommendations, setRecommendations] = useState<SmartRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Fetch AI insights for current user
  const fetchInsights = async (studentId?: string) => {
    try {
      const { data, error } = await supabase
        .from('ai_insights')
        .select('*')
        .eq(studentId ? 'student_id' : 'student_id', studentId || (await supabase.auth.getUser()).data.user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInsights(data || []);
    } catch (error) {
      console.error('Error fetching insights:', error);
      toast({
        title: "Error",
        description: "Failed to load AI insights",
        variant: "destructive"
      });
    }
  };

  // Fetch learning interventions
  const fetchInterventions = async (studentId?: string) => {
    try {
      const { data, error } = await supabase
        .from('learning_interventions')
        .select('*')
        .eq('student_id', studentId || (await supabase.auth.getUser()).data.user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInterventions(data || []);
    } catch (error) {
      console.error('Error fetching interventions:', error);
      toast({
        title: "Error",
        description: "Failed to load learning interventions",
        variant: "destructive"
      });
    }
  };

  // Fetch smart recommendations
  const fetchRecommendations = async (studentId?: string) => {
    try {
      const { data, error } = await supabase
        .from('smart_recommendations')
        .select('*')
        .eq('student_id', studentId || (await supabase.auth.getUser()).data.user?.id)
        .order('priority_score', { ascending: false });

      if (error) throw error;
      setRecommendations(data || []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      toast({
        title: "Error",
        description: "Failed to load recommendations",
        variant: "destructive"
      });
    }
  };

  // Record learning analytics event
  const recordLearningEvent = async (
    eventType: string,
    eventData: Record<string, any>,
    options?: {
      sessionId?: string;
      contentId?: string;
      learningContext?: Record<string, any>;
      performanceMetrics?: Record<string, any>;
    }
  ) => {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('User not authenticated');

      const { data, error } = await supabase.rpc('record_learning_event', {
        p_student_id: user.data.user.id,
        p_event_type: eventType,
        p_event_data: eventData,
        p_session_id: options?.sessionId || null,
        p_content_id: options?.contentId || null,
        p_learning_context: options?.learningContext || null,
        p_performance_metrics: options?.performanceMetrics || null
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error recording learning event:', error);
    }
  };

  // Create AI insight
  const createInsight = async (
    insightType: string,
    content: string,
    options?: {
      teacherId?: string;
      insightData?: Record<string, any>;
      priorityLevel?: number;
      isActionable?: boolean;
      expiresAt?: string;
    }
  ) => {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('User not authenticated');

      const { data, error } = await supabase.rpc('create_ai_insight', {
        p_student_id: user.data.user.id,
        p_teacher_id: options?.teacherId || null,
        p_insight_type: insightType,
        p_insight_content: content,
        p_insight_data: options?.insightData || null,
        p_priority_level: options?.priorityLevel || 1,
        p_is_actionable: options?.isActionable || false,
        p_expires_at: options?.expiresAt || null
      });

      if (error) throw error;
      
      // Refresh insights
      await fetchInsights();
      return data;
    } catch (error) {
      console.error('Error creating insight:', error);
      toast({
        title: "Error",
        description: "Failed to create insight",
        variant: "destructive"
      });
    }
  };

  // Trigger learning intervention
  const triggerIntervention = async (
    triggerType: string,
    interventionType: string,
    interventionData: Record<string, any>,
    options?: {
      teacherId?: string;
      scheduledFor?: string;
    }
  ) => {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('User not authenticated');

      const { data, error } = await supabase.rpc('trigger_intervention', {
        p_student_id: user.data.user.id,
        p_teacher_id: options?.teacherId || null,
        p_trigger_type: triggerType,
        p_intervention_type: interventionType,
        p_intervention_data: interventionData,
        p_scheduled_for: options?.scheduledFor || null
      });

      if (error) throw error;
      
      // Refresh interventions
      await fetchInterventions();
      return data;
    } catch (error) {
      console.error('Error triggering intervention:', error);
      toast({
        title: "Error",
        description: "Failed to trigger intervention",
        variant: "destructive"
      });
    }
  };

  // Create smart recommendation
  const createRecommendation = async (
    recommendationType: string,
    recommendationData: Record<string, any>,
    options?: {
      reasoning?: Record<string, any>;
      priorityScore?: number;
      expiresAt?: string;
    }
  ) => {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('User not authenticated');

      const { data, error } = await supabase.rpc('create_smart_recommendation', {
        p_student_id: user.data.user.id,
        p_recommendation_type: recommendationType,
        p_recommendation_data: recommendationData,
        p_reasoning: options?.reasoning || null,
        p_priority_score: options?.priorityScore || 0.5,
        p_expires_at: options?.expiresAt || null
      });

      if (error) throw error;
      
      // Refresh recommendations
      await fetchRecommendations();
      return data;
    } catch (error) {
      console.error('Error creating recommendation:', error);
      toast({
        title: "Error",
        description: "Failed to create recommendation",
        variant: "destructive"
      });
    }
  };

  // Analyze learning patterns
  const analyzeLearningPatterns = async (studentId?: string): Promise<LearningPatternAnalysis[]> => {
    try {
      const targetStudentId = studentId || (await supabase.auth.getUser()).data.user?.id;
      if (!targetStudentId) throw new Error('Student ID required');

      const { data, error } = await supabase.rpc('analyze_learning_patterns', {
        p_student_id: targetStudentId
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error analyzing learning patterns:', error);
      return [];
    }
  };

  // Generate predictive insights using mock AI (would be replaced with real ML model)
  const generatePredictiveInsights = async (studentId?: string): Promise<PredictiveInsight | null> => {
    try {
      const targetStudentId = studentId || (await supabase.auth.getUser()).data.user?.id;
      if (!targetStudentId) throw new Error('Student ID required');

      // Get recent learning analytics
      const { data: events, error } = await supabase
        .from('learning_analytics_events')
        .select('*')
        .eq('student_id', targetStudentId)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Mock predictive analysis (would be replaced with real ML model)
      const totalEvents = events?.length || 0;
      const recentActivity = events?.filter(e => 
        new Date(e.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length || 0;

      const activityScore = totalEvents > 0 ? recentActivity / Math.min(totalEvents, 50) : 0;
      const successProbability = Math.min(0.95, Math.max(0.1, activityScore * 0.8 + 0.2));

      const riskFactors: string[] = [];
      const recommendedActions: string[] = [];

      if (activityScore < 0.3) {
        riskFactors.push('Low recent activity');
        recommendedActions.push('Increase study frequency');
      }

      if (successProbability < 0.5) {
        riskFactors.push('Below average performance');
        recommendedActions.push('Schedule additional support sessions');
      }

      return {
        student_id: targetStudentId,
        success_probability: successProbability,
        risk_factors: riskFactors,
        recommended_actions: recommendedActions,
        confidence: 0.7
      };
    } catch (error) {
      console.error('Error generating predictive insights:', error);
      return null;
    }
  };

  // Update recommendation feedback
  const updateRecommendationFeedback = async (
    recommendationId: string, 
    accepted: boolean, 
    feedbackScore?: number
  ) => {
    try {
      const updates: any = { 
        accepted,
        viewed_at: new Date().toISOString()
      };

      if (accepted) {
        updates.acted_upon_at = new Date().toISOString();
      }

      if (feedbackScore) {
        updates.feedback_score = feedbackScore;
      }

      const { error } = await supabase
        .from('smart_recommendations')
        .update(updates)
        .eq('id', recommendationId);

      if (error) throw error;
      
      // Refresh recommendations
      await fetchRecommendations();
    } catch (error) {
      console.error('Error updating recommendation feedback:', error);
      toast({
        title: "Error",
        description: "Failed to update recommendation",
        variant: "destructive"
      });
    }
  };

  // Mark intervention as acknowledged
  const acknowledgeIntervention = async (interventionId: string) => {
    try {
      const { error } = await supabase
        .from('learning_interventions')
        .update({ 
          status: 'acknowledged',
          delivered_at: new Date().toISOString()
        })
        .eq('id', interventionId);

      if (error) throw error;
      
      // Refresh interventions
      await fetchInterventions();
    } catch (error) {
      console.error('Error acknowledging intervention:', error);
      toast({
        title: "Error",
        description: "Failed to acknowledge intervention",
        variant: "destructive"
      });
    }
  };

  return {
    insights,
    interventions,
    recommendations,
    isLoading,
    fetchInsights,
    fetchInterventions,
    fetchRecommendations,
    recordLearningEvent,
    createInsight,
    triggerIntervention,
    createRecommendation,
    analyzeLearningPatterns,
    generatePredictiveInsights,
    updateRecommendationFeedback,
    acknowledgeIntervention
  };
};