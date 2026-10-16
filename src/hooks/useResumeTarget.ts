import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ResumeTarget {
  kind: 'resume' | 'next' | 'idle';
  lessonId?: string;
  lessonTitle?: string;
  hub?: string;
}

/** The student's hub (student_profiles.hub_type) -> the curriculum's target_system. */
export const TARGET_SYSTEM_FOR_HUB: Record<string, string> = { playground: 'kids', academy: 'teen', professional: 'adult' };

interface CurriculumRow { id: string; title: string; target_system: string | null; sequence_order: number | null }

/**
 * The next lesson in curriculum order: the first published lesson (lowest sequence_order) the student has not completed.
 * Lessons without an order go last. This is the same rule the Playground map uses to decide which lesson is "current".
 */
export function pickNextLesson(lessons: CurriculumRow[], completedIds: Set<string>): CurriculumRow | null {
  const ordered = [...lessons].sort(
    (a, b) => (a.sequence_order ?? Number.MAX_SAFE_INTEGER) - (b.sequence_order ?? Number.MAX_SAFE_INTEGER),
  );
  return ordered.find((l) => !completedIds.has(l.id)) ?? null;
}

/**
 * Returns the single most relevant next action for the dashboard:
 *   - 'resume' if the student has an in_progress lesson (saved automatically while they play)
 *   - 'next'   the next lesson in the curriculum they have not completed
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

      // Next in the curriculum for this student's hub, skipping what they have completed.
      const { data: profile } = await supabase
        .from('student_profiles')
        .select('hub_type')
        .eq('user_id', user!.id)
        .maybeSingle();
      const system = TARGET_SYSTEM_FOR_HUB[(profile as any)?.hub_type ?? 'playground'] ?? 'kids';

      const { data: done } = await supabase
        .from('student_lesson_progress')
        .select('lesson_id')
        .eq('user_id', user!.id)
        .eq('status', 'completed');
      const completed = new Set((done ?? []).map((r: any) => r.lesson_id as string));

      const { data: rows } = await supabase
        .from('curriculum_lessons')
        .select('id, title, target_system, sequence_order')
        .eq('is_published', true)
        .eq('target_system', system)
        .order('sequence_order', { ascending: true, nullsFirst: false })
        .limit(500);

      const next = pickNextLesson((rows ?? []) as CurriculumRow[], completed);
      if (next) {
        return { kind: 'next', lessonId: next.id, lessonTitle: next.title, hub: next.target_system ?? undefined };
      }
      return { kind: 'idle' };
    },
  });
}
