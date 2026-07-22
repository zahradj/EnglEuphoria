import { useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type {
  QuizResultPayload,
  RemedialGenerationRequest,
  RemedialKind,
  Hub,
} from '@/lib/remediation/types';
import {
  MAX_REMEDIAL_ATTEMPTS_PER_UNIT,
  PASS_THRESHOLD,
} from '@/lib/remediation/constants';

interface UseUnitProgressionArgs {
  studentId: string | undefined;
  hub: Hub;
  sourceLessonId: string;
  cefrLevel?: string;
  /** Called when the student passed the quiz — proceed to next unit. */
  onAdvanceUnit: () => void;
  /** Called once a remedial lesson row exists and the student should be routed into it. */
  onRoutedToRemedial: (remedialId: string, generatedLessonId: string) => void;
  /** Called when remediation attempts are exhausted. */
  onExhausted?: () => void;
}

export interface UnitProgression {
  loading: boolean;
  error: string | null;
  handleQuizComplete: (result: QuizResultPayload) => Promise<void>;
}

/**
 * Macro remedial routing for end-of-unit Mastery Quiz (Lesson 6).
 *
 * If score < `PASS_THRESHOLD`:
 *   1. Count existing pending+completed remedial attempts for this source lesson.
 *   2. If under cap → call `generate-lesson-content` with `is_remedial: true`,
 *      insert a `remedial_lessons` row, and route the learner in.
 *   3. If at cap → surface the supportive "Talk to your teacher" state via
 *      `onExhausted`. No infinite loops.
 *
 * If score ≥ threshold → `onAdvanceUnit()` runs immediately.
 */
export function useUnitProgression(args: UseUnitProgressionArgs): UnitProgression {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleQuizComplete = useCallback(
    async (result: QuizResultPayload) => {
      setError(null);
      if (result.percent >= PASS_THRESHOLD) {
        args.onAdvanceUnit();
        return;
      }
      if (!args.studentId) {
        setError('Missing student id — cannot generate remedial lesson.');
        return;
      }

      setLoading(true);
      try {
        // Count previous attempts to enforce the loop cap.
        const { count } = await supabase
          .from('remedial_lessons')
          .select('id', { count: 'exact', head: true })
          .eq('student_id', args.studentId)
          .eq('source_lesson_id', args.sourceLessonId)
          .eq('kind', 'unit');

        const attemptNumber = (count ?? 0) + 1;
        if (attemptNumber > MAX_REMEDIAL_ATTEMPTS_PER_UNIT) {
          args.onExhausted?.();
          return;
        }

        const payload: RemedialGenerationRequest = {
          is_remedial: true,
          kind: 'unit',
          failed_tags: result.failed_tags,
          source_lesson_id: args.sourceLessonId,
          hub: args.hub,
          cefr_level: args.cefrLevel,
        };

        const { data: fnData, error: fnError } = await supabase.functions.invoke(
          'generate-lesson-content',
          { body: { ...payload, prompt_type: 'remedial', user_prompt: 'Generate remedial Extra Practice lesson.' } },
        );
        if (fnError) throw fnError;

        const generatedLessonId: string | undefined =
          (fnData as any)?.lesson_id || (fnData as any)?.id || (fnData as any)?.generated_lesson_id;

        const { data: row, error: insertError } = await supabase
          .from('remedial_lessons')
          .insert({
            student_id: args.studentId,
            source_lesson_id: args.sourceLessonId,
            generated_lesson_id: generatedLessonId ?? null,
            retest_lesson_id: args.sourceLessonId,
            kind: 'unit' as RemedialKind,
            failed_tags: result.failed_tags,
            attempt_number: attemptNumber,
            hub: args.hub,
            status: 'pending',
          })
          .select('id, generated_lesson_id')
          .single();
        if (insertError) throw insertError;

        // 🚀 Auto-push to the dashboard queue as a Bonus Quest.
        // scheduled_lessons.teacher_id is NOT NULL — borrow it from any existing
        // row for this student. If none, skip; ExtraPracticeCard still routes in.
        if (row?.id && row?.generated_lesson_id) {
          try {
            const { data: existing } = await supabase
              .from('scheduled_lessons')
              .select('teacher_id')
              .eq('student_id', args.studentId)
              .limit(1)
              .maybeSingle();

            if (existing?.teacher_id) {
              await supabase.from('scheduled_lessons').insert({
                student_id: args.studentId,
                teacher_id: existing.teacher_id,
                lesson_id: row.generated_lesson_id,
                status: 'auto_assigned',
                scheduled_for: new Date().toISOString(),
                auto_assigned: true,
                source_remedial_id: row.id,
                badge: 'bonus_quest',
              } as never);
            }
          } catch (e) {
            console.warn('[UnitProgression] queue push skipped:', (e as Error).message);
          }

          args.onRoutedToRemedial(row.id, row.generated_lesson_id);
        }
      } catch (e) {
        setError((e as Error).message || 'Failed to generate remedial lesson.');
      } finally {
        setLoading(false);
      }
    },
    [args],
  );

  return { loading, error, handleQuizComplete };
}

/**
 * Cycle 3 — Mark a remedial lesson as passed and surface the data needed to
 * render the hub-specific Grit reward modal.
 *
 * Call this from the retest screen the moment the student's re-attempt clears
 * the `PASS_THRESHOLD`. Returns the row so the caller can render
 * `<GritRewardModal hub={...} failedTag={...} variant="unit" />`.
 */
export async function markRemedialPassed(remedialId: string): Promise<{
  hub: Hub;
  failedTag?: string;
} | null> {
  const { data, error } = await supabase
    .from('remedial_lessons')
    .update({ status: 'completed', completed_at: new Date().toISOString() } as never)
    .eq('id', remedialId)
    .select('hub, failed_tags')
    .single();
  if (error || !data) {
    console.warn('[markRemedialPassed] failed:', error?.message);
    return null;
  }
  const hub = ((data as { hub: string | null }).hub ?? 'academy') as Hub;
  const tags = (data as { failed_tags: string[] | null }).failed_tags ?? [];
  return { hub, failedTag: tags[0] };
}

