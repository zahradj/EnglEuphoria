import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useProgressTracking } from '@/hooks/useProgressTracking';
import { progressAnalyticsService } from '@/services/progressAnalyticsService';

// Mock dependencies
vi.mock('@/services/progressAnalyticsService', () => ({
  progressAnalyticsService: {
    trackLessonCompletion: vi.fn(),
    trackSpeakingPractice: vi.fn(),
    updateStudentXP: vi.fn(),
  },
  ProgressAnalyticsError: class ProgressAnalyticsError extends Error {
    code: string;
    constructor(message: string, code: string) {
      super(message);
      this.code = code;
    }
  },
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user-123' },
  }),
}));

vi.mock('@/hooks/useErrorBoundary', () => ({
  useErrorBoundary: () => ({
    handleAsyncError: vi.fn(),
  }),
}));

describe('useProgressTracking Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('trackLessonCompletion', () => {
    it('should track lesson completion with correct data', async () => {
      const mockTrackLessonCompletion = vi.fn().mockResolvedValue(undefined);
      (progressAnalyticsService.trackLessonCompletion as any) = mockTrackLessonCompletion;

      const { result } = renderHook(() => useProgressTracking());

      const lessonData = {
        duration: 1800,
        accuracy: 85,
        skillArea: 'vocabulary',
        xpEarned: 150,
      };

      await act(async () => {
        await result.current.trackLessonCompletion(lessonData);
      });

      expect(mockTrackLessonCompletion).toHaveBeenCalledWith(
        'test-user-123',
        lessonData
      );
    });

    it('should handle errors gracefully', async () => {
      const mockError = new Error('Network error');
      (progressAnalyticsService.trackLessonCompletion as any) = vi.fn().mockRejectedValue(mockError);

      const { result } = renderHook(() => useProgressTracking());

      await act(async () => {
        await result.current.trackLessonCompletion({
          duration: 1800,
          accuracy: 85,
          skillArea: 'vocabulary',
          xpEarned: 150,
        });
      });

      expect(result.current.error).toBeTruthy();
    });
  });

  describe('awardXP', () => {
    it('should award XP and show toast notification', async () => {
      const mockUpdateXP = vi.fn().mockResolvedValue({
        level_up: false,
        current_level: 5,
      });
      (progressAnalyticsService.updateStudentXP as any) = mockUpdateXP;

      const { result } = renderHook(() => useProgressTracking());

      await act(async () => {
        await result.current.awardXP(50, 'Completed quiz');
      });

      expect(mockUpdateXP).toHaveBeenCalledWith('test-user-123', 50);
    });

    it('should detect level up and show celebration toast', async () => {
      const mockUpdateXP = vi.fn().mockResolvedValue({
        level_up: true,
        current_level: 6,
      });
      (progressAnalyticsService.updateStudentXP as any) = mockUpdateXP;

      const { result } = renderHook(() => useProgressTracking());

      await act(async () => {
        await result.current.awardXP(100, 'Lesson completion');
      });

      expect(mockUpdateXP).toHaveBeenCalledWith('test-user-123', 100);
    });
  });
});
