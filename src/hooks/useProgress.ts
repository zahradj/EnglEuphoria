import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getLessonProgress, 
  getAllProgressForUser, 
  startLesson, 
  completeLesson, 
  updateTimeSpent,
  getProgressStats,
  getRecentLessons 
} from '@/services/progressService';

// Hook to get progress for a specific lesson
export function useLessonProgress(userId: string | undefined, lessonId: string | undefined) {
  return useQuery({
    queryKey: ['lessonProgress', userId, lessonId],
    queryFn: () => getLessonProgress(userId!, lessonId!),
    enabled: !!userId && !!lessonId,
  });
}

// Hook to get all progress for a user
export function useUserProgress(userId: string | undefined) {
  return useQuery({
    queryKey: ['userProgress', userId],
    queryFn: () => getAllProgressForUser(userId!),
    enabled: !!userId,
  });
}

// Hook to get progress stats for a user
export function useProgressStats(userId: string | undefined) {
  return useQuery({
    queryKey: ['progressStats', userId],
    queryFn: () => getProgressStats(userId!),
    enabled: !!userId,
  });
}

// Hook to get recent lessons
export function useRecentLessons(userId: string | undefined, limit = 5) {
  return useQuery({
    queryKey: ['recentLessons', userId, limit],
    queryFn: () => getRecentLessons(userId!, limit),
    enabled: !!userId,
  });
}

// Hook to start a lesson
export function useStartLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, lessonId }: { userId: string; lessonId: string }) =>
      startLesson(userId, lessonId),
    onSuccess: (_, { userId, lessonId }) => {
      queryClient.invalidateQueries({ queryKey: ['lessonProgress', userId, lessonId] });
      queryClient.invalidateQueries({ queryKey: ['userProgress', userId] });
      queryClient.invalidateQueries({ queryKey: ['progressStats', userId] });
    },
  });
}

// Hook to complete a lesson
export function useCompleteLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, lessonId, score }: { userId: string; lessonId: string; score?: number }) =>
      completeLesson(userId, lessonId, score),
    onSuccess: (_, { userId, lessonId }) => {
      queryClient.invalidateQueries({ queryKey: ['lessonProgress', userId, lessonId] });
      queryClient.invalidateQueries({ queryKey: ['userProgress', userId] });
      queryClient.invalidateQueries({ queryKey: ['progressStats', userId] });
      queryClient.invalidateQueries({ queryKey: ['recentLessons', userId] });
    },
  });
}

// Hook to update time spent on a lesson
export function useUpdateTimeSpent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      userId, 
      lessonId, 
      additionalSeconds 
    }: { 
      userId: string; 
      lessonId: string; 
      additionalSeconds: number 
    }) => updateTimeSpent(userId, lessonId, additionalSeconds),
    onSuccess: (_, { userId, lessonId }) => {
      queryClient.invalidateQueries({ queryKey: ['lessonProgress', userId, lessonId] });
    },
  });
}
