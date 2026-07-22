import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { SkillTree, Hub } from '@/gamification/types';

export function useSkillTree(hub: Hub) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['skill-tree', user?.id, hub],
    enabled: !!user?.id,
    staleTime: 60_000,
    queryFn: async (): Promise<SkillTree | null> => {
      const { data } = await (supabase as any)
        .from('student_skill_tree')
        .select('*')
        .eq('student_id', user!.id)
        .eq('hub', hub)
        .maybeSingle();
      if (!data) return null;
      return {
        hub: data.hub,
        studentId: data.student_id,
        roots: data.tree?.roots ?? [],
        updatedAt: data.updated_at,
      };
    },
  });
}
