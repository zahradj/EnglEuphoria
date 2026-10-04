import { useQueries } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ChildSnapshot {
  total_lessons: number;
  upcoming_lessons: number;
  total_xp: number;
  current_level: number;
  achievements_count: number;
  cefr_level: string | null;
  last_lesson_date: string | null;
}

export interface ChildSnapshotState {
  data: ChildSnapshot | null;
  isLoading: boolean;
  failed: boolean;
}

/**
 * One progress snapshot per child, from the same RPC and cache key the Progress tab uses, so opening
 * that tab afterwards is instant. The RPC answers { error } for a child the parent can't see; that is
 * surfaced as `failed` rather than thrown, so one bad child never blanks the whole dashboard.
 */
export function useChildSnapshots(studentIds: string[], parentId: string | undefined) {
  const results = useQueries({
    queries: studentIds.map((studentId) => ({
      queryKey: ['student-progress', studentId],
      enabled: !!parentId,
      staleTime: 60_000,
      queryFn: async () => {
        const { data, error } = await supabase.rpc('get_student_progress_for_parent', {
          p_parent_id: parentId!,
          p_student_id: studentId,
        });
        if (error) throw error;
        return data as unknown as ChildSnapshot | { error: string };
      },
    })),
  });

  const byId: Record<string, ChildSnapshotState> = {};
  studentIds.forEach((id, i) => {
    const r = results[i];
    const payload = r?.data as any;
    const failed = !!r?.isError || !!payload?.error;
    byId[id] = {
      data: failed || !payload ? null : (payload as ChildSnapshot),
      isLoading: !!r?.isLoading,
      failed,
    };
  });
  return byId;
}
