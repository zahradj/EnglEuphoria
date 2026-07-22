import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ActiveTheme {
  theme: string;
  source: 'feedback' | 'curriculum' | 'default';
  tags: string[];
  recapId: string | null;
  homework: string | null;
  feedbackContent: string | null;
}

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

export function useActiveTheme() {
  const { user } = useAuth();
  return useQuery<ActiveTheme>({
    queryKey: ['active-theme', user?.id],
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      // 1. Latest teacher feedback within 7 days
      const since = new Date(Date.now() - SEVEN_DAYS).toISOString();
      const { data: fb } = await supabase
        .from('lesson_feedback_submissions')
        .select('id, theme, tags, feedback_content, homework_assigned, submitted_at')
        .eq('student_id', user!.id)
        .gte('submitted_at', since)
        .order('submitted_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fb?.theme) {
        return {
          theme: fb.theme,
          source: 'feedback',
          tags: (fb.tags as string[] | null) ?? [],
          recapId: fb.id,
          homework: fb.homework_assigned ?? null,
          feedbackContent: fb.feedback_content ?? null,
        };
      }

      // 2. Fall back to current curriculum unit topic
      const { data: prog } = await supabase
        .from('student_curriculum_progress')
        .select('current_unit_id')
        .eq('student_id', user!.id)
        .maybeSingle();

      if (prog?.current_unit_id) {
        const { data: unit } = await supabase
          .from('curriculum_units' as any)
          .select('title, topic')
          .eq('id', prog.current_unit_id)
          .maybeSingle();
        const t = (unit as any)?.topic || (unit as any)?.title;
        if (t) {
          return {
            theme: t,
            source: 'curriculum',
            tags: [],
            recapId: null,
            homework: fb?.homework_assigned ?? null,
            feedbackContent: fb?.feedback_content ?? null,
          };
        }
      }

      return {
        theme: 'Everyday English',
        source: 'default',
        tags: [],
        recapId: null,
        homework: null,
        feedbackContent: null,
      };
    },
  });
}
