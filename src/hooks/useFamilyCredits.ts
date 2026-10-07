import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/** Unused lesson credits for each of a parent's children (parents may read their approved children's balance). */
export function useFamilyCredits(studentIds: string[], parentId?: string | null) {
  return useQuery<Record<string, number>>({
    queryKey: ['family-credits', parentId, studentIds.join(',')],
    enabled: !!parentId && studentIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('student_credits')
        .select('student_id, total_credits, used_credits, expired_credits')
        .in('student_id', studentIds);
      if (error) throw error;
      const map: Record<string, number> = Object.fromEntries(studentIds.map((id) => [id, 0]));
      (data ?? []).forEach((r: any) => {
        map[r.student_id] = Math.max(0, (r.total_credits ?? 0) - (r.used_credits ?? 0) - (r.expired_credits ?? 0));
      });
      return map;
    },
  });
}
