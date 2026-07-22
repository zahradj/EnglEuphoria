import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Mission } from '@/gamification/types';

export function useActiveMissions() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['active-missions', user?.id],
    enabled: !!user?.id,
    staleTime: 30_000,
    queryFn: async (): Promise<Mission[]> => {
      const { data } = await (supabase as any)
        .from('student_missions')
        .select('*')
        .eq('student_id', user!.id)
        .eq('status', 'active')
        .order('started_at', { ascending: false });
      return (data ?? []).map((d: any) => ({
        id: d.id,
        studentId: d.student_id,
        lessonId: d.lesson_id ?? undefined,
        narrative: d.narrative,
        status: d.status,
        startedAt: d.started_at,
        completedAt: d.completed_at ?? undefined,
      }));
    },
  });
}
