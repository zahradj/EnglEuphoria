import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { MotivationProfile } from '@/gamification/types';

export function useMotivationProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['motivation-profile', user?.id],
    enabled: !!user?.id,
    staleTime: 5 * 60_000,
    queryFn: async (): Promise<MotivationProfile | null> => {
      const { data } = await (supabase as any)
        .from('student_motivation_profile')
        .select('*')
        .eq('student_id', user!.id)
        .maybeSingle();
      if (!data) return null;
      return {
        studentId: data.student_id,
        profileType: data.profile_type,
        encouragementStyle: data.encouragement_style,
        rewardDensity: data.reward_density,
        signals: data.signals ?? {},
        lastRecomputedAt: data.last_recomputed_at,
      };
    },
  });
}
