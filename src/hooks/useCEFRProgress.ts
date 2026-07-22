import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
const ORDER: CefrLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export function nextCefr(l: CefrLevel): CefrLevel {
  const i = ORDER.indexOf(l);
  return ORDER[Math.min(i + 1, ORDER.length - 1)];
}

export function useCEFRProgress() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['cefr-progress', user?.id],
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data } = await supabase
        .from('student_cefr_progress')
        .select('level, percent_to_next, last_updated')
        .eq('student_id', user!.id)
        .maybeSingle();
      const level = (data?.level as CefrLevel) ?? 'A1';
      return {
        level,
        nextLevel: nextCefr(level),
        percentToNext: data?.percent_to_next ?? 0,
        lastUpdated: data?.last_updated ?? null,
      };
    },
  });
}
