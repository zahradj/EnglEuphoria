
import { useState, useCallback } from 'react';
import { progressAnalyticsService, Achievement, ProgressAnalyticsError } from '@/services/progressAnalyticsService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useErrorBoundary } from '@/hooks/useErrorBoundary';

interface UseProgressTrackingReturn {
  trackLessonCompletion: (lessonData: {
    duration: number;
    accuracy: number;
    skillArea: string;
    xpEarned: number;
  }) => Promise<void>;
  trackSpeakingPractice: (speakingData: {
    duration: number;
    overallRating: number;
    xpEarned: number;
  }) => Promise<void>;
  awardXP: (xpAmount: number, reason?: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  showAchievementNotification: (achievement: Achievement & { xp_reward: number }) => void;
  clearError: () => void;
}

export function useProgressTracking(): UseProgressTrackingReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const { handleAsyncError } = useErrorBoundary();

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleError = useCallback((error: any, context: string) => {
    console.error(`Progress tracking error in ${context}:`, error);
    
    let errorMessage = 'An unexpected error occurred';
    
    if (error instanceof ProgressAnalyticsError) {
      switch (error.code) {
        case 'NETWORK_ERROR':
          errorMessage = 'Network connection error. Please check your internet and try again.';
          break;
        case 'UNAUTHORIZED':
          errorMessage = 'You need to be logged in to track progress.';
          break;
        case 'INVALID_INPUT':
          errorMessage = 'Invalid data provided. Please try again.';
          break;
        default:
          errorMessage = error.message;
      }
    } else if (error?.message) {
      errorMessage = error.message;
    }
    
    setError(errorMessage);
    handleAsyncError(error, context);
  }, [handleAsyncError]);

  const trackLessonCompletion = useCallback(async (lessonData: {
    duration: number;
    accuracy: number;
    skillArea: string;
    xpEarned: number;
  }) => {
    if (!user?.id) {
      setError('You must be logged in to track progress');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await progressAnalyticsService.trackLessonCompletion(user.id, lessonData);
      
      toast({
        title: "Progress Updated!",
        description: `You earned ${lessonData.xpEarned} XP for completing this lesson.`,
      });
    } catch (error) {
      handleError(error, 'lesson completion tracking');
      
      toast({
        title: "Progress Update Failed",
        description: error instanceof ProgressAnalyticsError ? error.message : "Failed to update progress",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id, toast, handleError]);

  const trackSpeakingPractice = useCallback(async (speakingData: {
    duration: number;
    overallRating: number;
    xpEarned: number;
  }) => {
    if (!user?.id) {
      setError('You must be logged in to track progress');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await progressAnalyticsService.trackSpeakingPractice(user.id, speakingData);
      
      toast({
        title: "Speaking Progress Updated!",
        description: `Great speaking session! You earned ${speakingData.xpEarned} XP.`,
      });
    } catch (error) {
      handleError(error, 'speaking practice tracking');
      
      toast({
        title: "Progress Update Failed",
        description: error instanceof ProgressAnalyticsError ? error.message : "Failed to update speaking progress",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id, toast, handleError]);

  const awardXP = useCallback(async (xpAmount: number, reason: string = 'Activity completion') => {
    if (!user?.id) {
      setError('You must be logged in to earn XP');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await progressAnalyticsService.updateStudentXP(user.id, xpAmount);
      
      if (result?.level_up) {
        toast({
          title: "Level Up! 🎉",
          description: `Congratulations! You've reached level ${result.current_level}!`,
        });
      } else {
        toast({
          title: "XP Earned!",
          description: `+${xpAmount} XP for ${reason}`,
        });
      }
    } catch (error) {
      handleError(error, 'XP awarding');
      
      toast({
        title: "XP Award Failed",
        description: error instanceof ProgressAnalyticsError ? error.message : "Failed to award XP",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id, toast, handleError]);

  const showAchievementNotification = useCallback((achievement: Achievement & { xp_reward: number }) => {
    toast({
      title: `🏆 Achievement Unlocked: ${achievement.name}`,
      description: `${achievement.description} (+${achievement.xp_reward} XP)`,
    });
  }, [toast]);

  return {
    trackLessonCompletion,
    trackSpeakingPractice,
    awardXP,
    loading,
    error,
    showAchievementNotification,
    clearError
  };
}
