import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type XpAction =
  | 'phonics_listen'
  | 'vocab_quiz_pass'
  | 'speaking_submit'
  | 'speaking_bravery'
  | 'pronunciation_attempt'
  | 'pronunciation_improvement'
  | 'library_read'
  | 'class_attended'
  | 'mission_complete'
  | 'mastery_milestone'
  | 'review_streak'
  | 'lesson_complete';

export function useStudentXP() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const xpQuery = useQuery({
    queryKey: ['student-xp', user?.id],
    enabled: !!user?.id,
    staleTime: 30_000,
    queryFn: async () => {
      const { data } = await supabase
        .from('student_xp')
        .select('total_xp, current_level, xp_in_current_level, last_activity_date')
        .eq('student_id', user!.id)
        .maybeSingle();
      return data ?? { total_xp: 0, current_level: 1, xp_in_current_level: 0, last_activity_date: null };
    },
  });

  const todayQuery = useQuery({
    queryKey: ['xp-today', user?.id],
    enabled: !!user?.id,
    staleTime: 30_000,
    queryFn: async () => {
      const today = new Date().toISOString().slice(0, 10);
      const { data } = await supabase
        .from('xp_events')
        .select('xp')
        .eq('student_id', user!.id)
        .gte('created_at', `${today}T00:00:00Z`);
      return (data ?? []).reduce((s, r) => s + (r.xp ?? 0), 0);
    },
  });

  const award = useMutation({
    mutationFn: async ({ action, ref_id, is_remedial }: { action: XpAction; ref_id?: string; is_remedial?: boolean }) => {
      const { data, error } = await supabase.functions.invoke('award-xp', {
        body: { action, ref_id, is_remedial },
      });
      if (error) throw error;
      return data;
    },

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['student-xp', user?.id] });
      qc.invalidateQueries({ queryKey: ['xp-today', user?.id] });
      qc.invalidateQueries({ queryKey: ['student-streak', user?.id] });
    },
  });

  return {
    totalXp: xpQuery.data?.total_xp ?? 0,
    level: xpQuery.data?.current_level ?? 1,
    xpInLevel: xpQuery.data?.xp_in_current_level ?? 0,
    todayXp: todayQuery.data ?? 0,
    isLoading: xpQuery.isLoading,
    awardXP: award.mutate,
    isAwarding: award.isPending,
  };
}
