import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface GenerationHistoryEntry {
  id: string;
  created_at: string;
  topic: string;
  system_type: string;
  cefr_level: string | null;
  age_group: string | null;
  duration_minutes: number;
  status: 'pending' | 'generating' | 'success' | 'failed' | 'cancelled';
  duration_seconds: number | null;
  validation_score: number | null;
  validation_issues: Record<string, unknown> | null;
  error_message: string | null;
  lesson_id: string | null;
  user_id: string | null;
  retry_count: number;
  metadata: Record<string, unknown>;
}

export interface CreateHistoryParams {
  topic: string;
  system_type: string;
  cefr_level?: string;
  age_group?: string;
  duration_minutes?: number;
}

export function useGenerationHistory() {
  const queryClient = useQueryClient();

  const { data: history = [], isLoading, refetch } = useQuery({
    queryKey: ['generation-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('generation_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as GenerationHistoryEntry[];
    },
  });

  const createEntry = useMutation({
    mutationFn: async (params: CreateHistoryParams): Promise<string> => {
      const { data: user } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('generation_history')
        .insert({
          topic: params.topic,
          system_type: params.system_type,
          cefr_level: params.cefr_level || null,
          age_group: params.age_group || null,
          duration_minutes: params.duration_minutes || 60,
          status: 'pending',
          user_id: user.user?.id || null,
        })
        .select('id')
        .single();

      if (error) throw error;
      return data.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generation-history'] });
    },
  });

  const updateEntry = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Omit<GenerationHistoryEntry, 'id' | 'created_at'>>;
    }) => {
      const { error } = await supabase
        .from('generation_history')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generation-history'] });
    },
  });

  const markGenerating = useCallback(
    (id: string) => {
      updateEntry.mutate({
        id,
        updates: { status: 'generating' },
      });
    },
    [updateEntry]
  );

  const markSuccess = useCallback(
    (
      id: string,
      lessonId: string,
      durationSeconds: number,
      validationScore?: number,
      validationIssues?: Record<string, unknown>
    ) => {
      updateEntry.mutate({
        id,
        updates: {
          status: 'success',
          lesson_id: lessonId,
          duration_seconds: durationSeconds,
          validation_score: validationScore,
          validation_issues: validationIssues,
        },
      });
    },
    [updateEntry]
  );

  const markFailed = useCallback(
    (id: string, errorMessage: string, durationSeconds: number) => {
      updateEntry.mutate({
        id,
        updates: {
          status: 'failed',
          error_message: errorMessage,
          duration_seconds: durationSeconds,
        },
      });
    },
    [updateEntry]
  );

  const markCancelled = useCallback(
    (id: string, durationSeconds: number) => {
      updateEntry.mutate({
        id,
        updates: {
          status: 'cancelled',
          duration_seconds: durationSeconds,
        },
      });
    },
    [updateEntry]
  );

  const incrementRetry = useCallback(
    (id: string) => {
      const entry = history.find((h) => h.id === id);
      if (entry) {
        updateEntry.mutate({
          id,
          updates: {
            retry_count: entry.retry_count + 1,
            status: 'generating',
          },
        });
      }
    },
    [history, updateEntry]
  );

  // Stats calculations
  const stats = {
    total: history.length,
    successful: history.filter((h) => h.status === 'success').length,
    failed: history.filter((h) => h.status === 'failed').length,
    cancelled: history.filter((h) => h.status === 'cancelled').length,
    avgDuration: history.filter((h) => h.duration_seconds)
      .reduce((sum, h) => sum + (h.duration_seconds || 0), 0) / 
      Math.max(1, history.filter((h) => h.duration_seconds).length),
    avgValidationScore: history.filter((h) => h.validation_score)
      .reduce((sum, h) => sum + (h.validation_score || 0), 0) / 
      Math.max(1, history.filter((h) => h.validation_score).length),
  };

  return {
    history,
    isLoading,
    refetch,
    createEntry: createEntry.mutateAsync,
    markGenerating,
    markSuccess,
    markFailed,
    markCancelled,
    incrementRetry,
    stats,
  };
}
