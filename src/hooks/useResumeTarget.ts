import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ResumeTarget {
  kind: 'resume' | 'next' | 'idle';
  lessonId?: string;
  lessonTitle?: string;
  hub?: string;
}

/**
 * Returns the single most relevant next action for the dashboard:
 *   - 'resume' if the student has an in_progress lesson
 *   - 'next'   if there's a known curriculum next-up lesson
 *   - 'idle'   otherwise (no nag — handled at component level)
 */
export function useResumeTarget() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['resume-target', user?.id],
    enabled: !!user?.id,
    staleTime: 30_000,
    queryFn: async (): Promise<ResumeTarget> => {
      const { data } = await supabase
        .from('student_lesson_progress')
        .select('lesson_id, status, updated_at, curriculum_lessons(id, title, target_system)')
        .eq('user_id', user!.id)
        .eq('status', 'in_progress')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data?.lesson_id) {
        const lesson: any = (data as any).curriculum_lessons;
        return {
          kind: 'resume',
          lessonId: data.lesson_id,
          lessonTitle: lesson?.title,
          hub: lesson?.target_system,
        };
      }

      // Next-up: most recently updated lesson the student hasn't completed.
      const { data: next } = await supabase
        .from('curriculum_lessons')
        .select('id, title, target_system')
        .eq('published', true)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (next?.id) {
        return {
          kind: 'next',
          lessonId: next.id,
          lessonTitle: next.title,
          hub: next.target_system,
        };
      }
      return { kind: 'idle' };
    },
  });
}
