import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Measure {
  n: number;
  pct: number | null;
}

export interface Scorecard {
  window_days: number;
  on_time: Measure;
  delivered: Measure;
  full_length: Measure;
  reports: Measure;
  cancellations: { by_you: number; short_notice: number };
  feedback: { n: number; energy: number | null; relevance: number | null; confident_pct: number | null };
  talk: {
    n: number;
    student_pct: number | null;
    recent: { date: string; student_seconds: number; teacher_seconds: number }[];
  };
  excluded: { platform_faults: number; student_side: number };
}

/**
 * The teacher's scorecard (see get_teacher_scorecard in the database). A teacher reads their own; an admin may
 * pass a teacherId. The RPC isn't in the generated types yet, hence the cast.
 */
export async function fetchTeacherScorecard(teacherId?: string | null): Promise<Scorecard> {
  const { data, error } = await (supabase as any).rpc('get_teacher_scorecard', {
    p_teacher_id: teacherId ?? null,
    p_days: 90,
  });
  if (error) throw error;
  return data as Scorecard;
}

export function useTeacherScorecard(teacherId?: string | null) {
  return useQuery<Scorecard>({
    queryKey: ['teacher-scorecard', teacherId ?? 'me'],
    staleTime: 60_000,
    queryFn: () => fetchTeacherScorecard(teacherId),
  });
}
