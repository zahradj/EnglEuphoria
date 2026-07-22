import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useOrganization } from './useOrganization';

interface PredictiveAnalytics {
  success_probability: number;
  engagement_level: 'high' | 'medium' | 'low';
  recent_performance: any[];
  recommendations: string[];
}

interface OrganizationAnalytics {
  total_users: number;
  active_users: number;
  engagement_rate: number;
  total_lessons: number;
  average_satisfaction: number;
  generated_at: string;
}

interface LearningInsight {
  type: 'risk' | 'opportunity' | 'achievement';
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
  recommendations?: string[];
}

export const useAdvancedAnalytics = () => {
  const [loading, setLoading] = useState(false);
  const { currentOrganization } = useOrganization();

  const getStudentPrediction = async (studentId: string): Promise<PredictiveAnalytics | null> => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_student_success_prediction', {
        student_uuid: studentId
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting student prediction:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getOrganizationAnalytics = async (): Promise<OrganizationAnalytics | null> => {
    if (!currentOrganization) return null;

    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_organization_analytics', {
        org_uuid: currentOrganization.id
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting organization analytics:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const generateLearningInsights = async (studentId: string): Promise<LearningInsight[]> => {
    try {
      // Get recent learning analytics
      const { data: analyticsData } = await supabase
        .from('learning_analytics')
        .select('*')
        .eq('student_id', studentId)
        .gte('recorded_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('recorded_at', { ascending: false });

      if (!analyticsData || analyticsData.length === 0) return [];

      const insights: LearningInsight[] = [];

      // Analyze engagement patterns
      const avgSessionDuration = analyticsData.reduce((sum, item) => sum + item.session_duration, 0) / analyticsData.length;
      const avgAccuracy = analyticsData
        .filter(item => item.accuracy_score !== null)
        .reduce((sum, item) => sum + item.accuracy_score, 0) / analyticsData.filter(item => item.accuracy_score !== null).length;

      // Low engagement insight
      if (avgSessionDuration < 300) { // Less than 5 minutes
        insights.push({
          type: 'risk',
          title: 'Low Engagement Detected',
          description: 'Student shows decreased session duration over the past 30 days',
          confidence: 0.85,
          actionable: true,
          recommendations: [
            'Schedule a motivational session',
            'Introduce gamification elements',
            'Adjust lesson difficulty'
          ]
        });
      }

      // High performance insight
      if (avgAccuracy > 85) {
        insights.push({
          type: 'achievement',
          title: 'Exceptional Performance',
          description: 'Student consistently achieves high accuracy scores',
          confidence: 0.92,
          actionable: true,
          recommendations: [
            'Consider advancing to next level',
            'Introduce more challenging content',
            'Recognize achievement publicly'
          ]
        });
      }

      // Skill gap analysis
      const skillAreas = [...new Set(analyticsData.map(item => item.skill_area))];
      const skillPerformance = skillAreas.map(skill => {
        const skillData = analyticsData.filter(item => item.skill_area === skill);
        const avgScore = skillData.reduce((sum, item) => sum + (item.accuracy_score || 0), 0) / skillData.length;
        return { skill, avgScore };
      });

      const weakestSkill = skillPerformance.reduce((min, current) => 
        current.avgScore < min.avgScore ? current : min
      );

      if (weakestSkill.avgScore < 70) {
        insights.push({
          type: 'opportunity',
          title: `Improvement Opportunity: ${weakestSkill.skill}`,
          description: `Student shows lower performance in ${weakestSkill.skill}`,
          confidence: 0.78,
          actionable: true,
          recommendations: [
            `Focus upcoming lessons on ${weakestSkill.skill}`,
            'Provide additional practice materials',
            'Consider one-on-one tutoring'
          ]
        });
      }

      return insights;
    } catch (error) {
      console.error('Error generating insights:', error);
      return [];
    }
  };

  const trackAnalyticsEvent = async (eventType: string, eventData: any) => {
    try {
      await supabase
        .from('analytics_events')
        .insert([{
          organization_id: currentOrganization?.id,
          event_type: eventType,
          event_data: eventData,
          session_id: sessionStorage.getItem('sessionId') || 'unknown',
          page_url: window.location.href,
          referrer: document.referrer,
          user_agent: navigator.userAgent
        }]);
    } catch (error) {
      console.error('Error tracking analytics event:', error);
    }
  };

  const getCohortAnalysis = async (cohortType: 'monthly' | 'weekly' = 'monthly') => {
    if (!currentOrganization) return null;

    try {
      const { data, error } = await supabase
        .from('organization_members')
        .select(`
          joined_at,
          user_id,
          users!inner (
            id,
            created_at
          )
        `)
        .eq('organization_id', currentOrganization.id)
        .eq('status', 'active');

      if (error) throw error;

      // Group by cohort periods
      const cohorts = data?.reduce((acc, member) => {
        const date = new Date(member.joined_at);
        const cohortKey = cohortType === 'monthly' 
          ? `${date.getFullYear()}-${date.getMonth() + 1}`
          : `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`;

        if (!acc[cohortKey]) {
          acc[cohortKey] = {
            period: cohortKey,
            total_users: 0,
            active_users: 0,
            retention_rate: 0
          };
        }

        acc[cohortKey].total_users++;
        
        // Check if user is still active (logged in last 30 days)
        const lastActive = new Date(member.joined_at);
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        if (lastActive > thirtyDaysAgo) {
          acc[cohortKey].active_users++;
        }

        return acc;
      }, {} as Record<string, any>);

      // Calculate retention rates
      Object.values(cohorts || {}).forEach((cohort: any) => {
        cohort.retention_rate = cohort.total_users > 0 
          ? (cohort.active_users / cohort.total_users) * 100 
          : 0;
      });

      return Object.values(cohorts || {});
    } catch (error) {
      console.error('Error getting cohort analysis:', error);
      return null;
    }
  };

  const getRevenueAnalytics = async () => {
    if (!currentOrganization) return null;

    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          amount,
          currency,
          created_at,
          status,
          lessons!inner (
            student_id,
            organization_members!inner (
              organization_id
            )
          )
        `)
        .eq('lessons.organization_members.organization_id', currentOrganization.id)
        .eq('status', 'completed');

      if (error) throw error;

      const monthlyRevenue = data?.reduce((acc, payment) => {
        const date = new Date(payment.created_at);
        const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
        
        if (!acc[monthKey]) {
          acc[monthKey] = {
            month: monthKey,
            revenue: 0,
            transactions: 0
          };
        }

        acc[monthKey].revenue += payment.amount;
        acc[monthKey].transactions++;

        return acc;
      }, {} as Record<string, any>);

      return Object.values(monthlyRevenue || {});
    } catch (error) {
      console.error('Error getting revenue analytics:', error);
      return null;
    }
  };

  return {
    loading,
    getStudentPrediction,
    getOrganizationAnalytics,
    generateLearningInsights,
    trackAnalyticsEvent,
    getCohortAnalysis,
    getRevenueAnalytics
  };
};