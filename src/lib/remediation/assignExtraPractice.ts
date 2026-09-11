import { supabase } from '@/integrations/supabase/client';
import type { Hub } from './types';
import { MAX_REMEDIAL_ATTEMPTS_PER_COMPETENCY_DOMAIN } from './constants';

export interface AssignExtraPracticeArgs {
  studentId: string;
  domain: string;
  failedTags: string[];
  hub: Hub;
  /** curriculum_lessons.id this remediation was triggered from, for traceability. */
  sourceLessonId?: string | null;
}

export type AssignExtraPracticeResult =
  | { assigned: true; scheduledLessonId: string; remedialLessonId: string; lessonId: string }
  | { assigned: false; reason: 'no_matching_lesson' | 'attempt_cap_reached' | 'no_teacher_on_file' };

/**
 * Finds an existing, pre-authored "extra practice" lesson tagged for the
 * given domain and auto-assigns it — the same `scheduled_lessons(auto_assigned:
 * true)` shape `AutoAssignedQueue.tsx` already renders on the student
 * dashboard, so no changes are needed there.
 *
 * Deliberately does NOT dynamically generate a lesson (e.g. via
 * generate-academy) — that generator's output isn't wired to the live
 * classroom stage yet (see the remediation plan doc). This only ever
 * assigns real, already-curated content.
 */
export async function assignExtraPractice({
  studentId,
  domain,
  failedTags,
  hub,
  sourceLessonId = null,
}: AssignExtraPracticeArgs): Promise<AssignExtraPracticeResult> {
  // Cap repeats per domain so a student can't be re-assigned the same
  // Extra Practice lesson every single lesson in a row. Postgres array
  // `@>` needs an exact element match (and failed_tags holds full
  // `domain:competency` strings, not the bare domain), so filter
  // client-side against each row's own tags rather than querying by
  // domain directly.
  const { data: priorForDomain } = await supabase
    .from('remedial_lessons')
    .select('failed_tags')
    .eq('student_id', studentId)
    .eq('kind', 'competency')
    .eq('hub', hub);
  const priorAttemptsForDomain = (priorForDomain ?? []).filter((row) =>
    (row.failed_tags ?? []).some((t: string) => t.startsWith(`${domain}:`)),
  ).length;

  if (priorAttemptsForDomain >= MAX_REMEDIAL_ATTEMPTS_PER_COMPETENCY_DOMAIN) {
    return { assigned: false, reason: 'attempt_cap_reached' };
  }

  const targetSystems = hub === 'academy' ? ['academy', 'teen', 'teens'] : hub === 'playground' ? ['playground', 'kids'] : ['professional', 'success'];
  const { data: practiceLesson } = await supabase
    .from('curriculum_lessons')
    .select('id')
    .eq('is_review', true)
    .eq('is_published', true)
    .in('target_system', targetSystems)
    .contains('skills_focus', [domain])
    .limit(1)
    .maybeSingle();

  if (!practiceLesson?.id) {
    return { assigned: false, reason: 'no_matching_lesson' };
  }

  const { data: remedialRow, error: remedialError } = await supabase
    .from('remedial_lessons')
    .insert({
      student_id: studentId,
      source_lesson_id: sourceLessonId,
      generated_lesson_id: practiceLesson.id,
      retest_lesson_id: sourceLessonId,
      kind: 'competency',
      failed_tags: failedTags,
      hub,
      status: 'pending',
    })
    .select('id')
    .single();
  if (remedialError || !remedialRow) {
    console.warn('[assignExtraPractice] failed to insert remedial_lessons row:', remedialError?.message);
    return { assigned: false, reason: 'no_matching_lesson' };
  }

  // scheduled_lessons.teacher_id is NOT NULL — borrow it from any existing
  // row for this student, same pattern useUnitProgression.ts already uses.
  const { data: existingSchedule } = await supabase
    .from('scheduled_lessons')
    .select('teacher_id')
    .eq('student_id', studentId)
    .limit(1)
    .maybeSingle();
  if (!existingSchedule?.teacher_id) {
    return { assigned: false, reason: 'no_teacher_on_file' };
  }

  const { data: scheduledRow, error: scheduleError } = await supabase
    .from('scheduled_lessons')
    .insert({
      student_id: studentId,
      teacher_id: existingSchedule.teacher_id,
      lesson_id: practiceLesson.id,
      status: 'auto_assigned',
      scheduled_for: new Date().toISOString(),
      auto_assigned: true,
      source_remedial_id: remedialRow.id,
      badge: 'extra_practice',
    })
    .select('id')
    .single();
  if (scheduleError || !scheduledRow) {
    console.warn('[assignExtraPractice] failed to insert scheduled_lessons row:', scheduleError?.message);
    return { assigned: false, reason: 'no_matching_lesson' };
  }

  return {
    assigned: true,
    scheduledLessonId: scheduledRow.id,
    remedialLessonId: remedialRow.id,
    lessonId: practiceLesson.id,
  };
}
