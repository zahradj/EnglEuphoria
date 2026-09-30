import { supabase } from '@/integrations/supabase/client';

export type Hub = 'playground' | 'academy' | 'success';

const HUB_TO_TARGET_SYSTEM: Record<Hub, string[]> = {
  playground: ['playground', 'kids'],
  academy: ['academy', 'teens'],
  success: ['success', 'professional', 'adults'],
};

/**
 * Resolve which lesson the student should be working on right now.
 * Order:
 *   1. student_curriculum_progress.current_lesson_id
 *   2. personalized_learning_paths.path_data[current_step].lesson_id
 *   3. First lesson in the hub by (slot_cefr_level, sequence_order, order_index)
 */
export async function resolveActiveCoreLesson(
  studentId: string,
  hub: Hub,
): Promise<string | null> {
  // 1) student_curriculum_progress
  const { data: scp } = await supabase
    .from('student_curriculum_progress')
    .select('current_lesson_id')
    .eq('student_id', studentId)
    .maybeSingle();
  if (scp?.current_lesson_id) return scp.current_lesson_id as string;

  // 2) personalized_learning_paths
  const { data: plp } = await supabase
    .from('personalized_learning_paths')
    .select('current_step, path_data')
    .eq('student_id', studentId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  const path = (plp?.path_data as any) ?? null;
  const step = plp?.current_step ?? 0;
  const stepLesson =
    Array.isArray(path?.steps) ? path.steps[step]?.lesson_id :
    Array.isArray(path) ? path[step]?.lesson_id :
    null;
  if (stepLesson) return stepLesson as string;

  // 3) Fallback: first published lesson in this hub. Two problems fixed
  // here together:
  //  - Postgres gives no ordering guarantee among rows that tie on every
  //    ORDER BY column, so without a final deterministic tiebreaker this
  //    "first" pick could silently return a DIFFERENT lesson on every
  //    call. Confirmed live: the exact same booking resolved to three
  //    different A1 lessons across three reloads seconds apart.
  //  - sequence_order/order_index aren't populated consistently across
  //    curriculum_lessons (many stub/placeholder rows share null), so
  //    sorting by them doesn't reliably put a genuine "Unit 1 Lesson 1"
  //    first — confirmed live: this fallback picked Pre-A1 Unit 3 Lesson 1
  //    ahead of Unit 1 Lesson 1. slot_unit_number/slot_lesson_number (the
  //    actual curriculum position, sourced from ai_metadata) are the real
  //    ordering signal; sorted client-side since PostgREST can't order by
  //    a JSON path on this column directly. `id` stays as the final
  //    tiebreaker for full determinism.
  const targets = HUB_TO_TARGET_SYSTEM[hub];
  const { data: candidates } = await supabase
    .from('curriculum_lessons')
    .select('id, slot_cefr_level, slot_unit_number, slot_lesson_number')
    .in('target_system', targets)
    .eq('is_published', true);
  if (!candidates?.length) return null;
  const sorted = [...candidates].sort((a, b) =>
    cefrRank(a.slot_cefr_level) - cefrRank(b.slot_cefr_level) ||
    num(a.slot_unit_number) - num(b.slot_unit_number) ||
    num(a.slot_lesson_number) - num(b.slot_lesson_number) ||
    (a.id < b.id ? -1 : a.id > b.id ? 1 : 0),
  );
  return sorted[0]?.id ?? null;
}

export interface LessonMeta {
  id: string;
  title: string;
  slot_cefr_level: string | null;
  slot_unit_number: number | null;
  slot_lesson_number: number | null;
  sequence_order: number | null;
  order_index: number | null;
  target_system: string | null;
}

const META_COLS =
  'id, title, slot_cefr_level, slot_unit_number, slot_lesson_number, sequence_order, order_index, target_system';

export async function fetchLessonMeta(lessonId: string): Promise<LessonMeta | null> {
  const { data } = await supabase
    .from('curriculum_lessons')
    .select(META_COLS)
    .eq('id', lessonId)
    .maybeSingle();
  return (data as LessonMeta) ?? null;
}

/**
 * Linear adjacency within the same hub, ordered by
 * (slot_cefr_level, slot_unit_number, slot_lesson_number) falling back to
 * (sequence_order, order_index).
 */
export async function getAdjacentLesson(
  lessonId: string,
  direction: 'prev' | 'next',
): Promise<LessonMeta | null> {
  const current = await fetchLessonMeta(lessonId);
  if (!current?.target_system) return null;

  const { data: all } = await supabase
    .from('curriculum_lessons')
    .select(META_COLS)
    .eq('target_system', current.target_system)
    .eq('is_published', true);
  if (!all?.length) return null;

  const sorted = [...(all as LessonMeta[])].sort(compareLessons);
  const idx = sorted.findIndex(l => l.id === lessonId);
  if (idx < 0) return null;
  const targetIdx = direction === 'next' ? idx + 1 : idx - 1;
  return sorted[targetIdx] ?? null;
}

function num(v: unknown, fallback = Number.MAX_SAFE_INTEGER): number {
  if (typeof v === 'number') return v;
  // slot_unit_number/slot_lesson_number/sequence_order/order_index are all
  // TEXT columns in the DB despite LessonMeta typing them as `number | null`
  // — the Supabase client returns whatever the column's real runtime type
  // is, so a numeric-string check is required or every row silently ties
  // at `fallback` and this sort key contributes nothing at all.
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}
function cefrRank(v: string | null): number {
  const order = ['pre-a1', 'a1', 'a2', 'b1', 'b2', 'c1', 'c2'];
  if (!v) return 99;
  const i = order.indexOf(v.toLowerCase());
  return i < 0 ? 99 : i;
}
function compareLessons(a: LessonMeta, b: LessonMeta): number {
  return (
    cefrRank(a.slot_cefr_level) - cefrRank(b.slot_cefr_level) ||
    num(a.slot_unit_number) - num(b.slot_unit_number) ||
    num(a.slot_lesson_number) - num(b.slot_lesson_number) ||
    num(a.sequence_order) - num(b.sequence_order) ||
    num(a.order_index) - num(b.order_index)
  );
}

/**
 * Advance student_curriculum_progress.current_lesson_id to the next lesson
 * after they've completed the current one.
 */
export async function advanceCurriculumProgress(
  studentId: string,
  completedLessonId: string,
): Promise<string | null> {
  const next = await getAdjacentLesson(completedLessonId, 'next');
  if (!next) return null;
  const { error: advanceErr } = await supabase
    .from('student_curriculum_progress')
    .upsert(
      { student_id: studentId, current_lesson_id: next.id, last_activity_at: new Date().toISOString() },
      { onConflict: 'student_id' },
    );
  if (advanceErr) console.error('[activeCoreLessonResolver] student_curriculum_progress advance failed:', advanceErr);
  return next.id;
}

/** All published lessons for one hub, in the same real teaching order
 *  compareLessons/getAdjacentLesson use — for an admin "set current lesson"
 *  picker (or any other UI that needs the full ordered sequence, not just
 *  one neighbor). */
export async function fetchHubLessonSequence(hub: Hub): Promise<LessonMeta[]> {
  const targets = HUB_TO_TARGET_SYSTEM[hub];
  const { data } = await supabase
    .from('curriculum_lessons')
    .select(META_COLS)
    .in('target_system', targets)
    .eq('is_published', true);
  return [...((data as LessonMeta[]) ?? [])].sort(compareLessons);
}

/**
 * Admin override: directly set which lesson a student is currently on
 * (their "starting point" for the next booking that resolves through
 * resolveActiveCoreLesson), independent of the normal complete-a-lesson
 * advance flow. Same write shape LessonSwitcher.tsx uses mid-class, minus
 * the booking pin (there is no live booking to pin here) — logs to
 * audit_logs the same way, so LessonSwitchAudit-style history stays
 * meaningful for admin-made changes too.
 */
export async function setCurrentLesson(
  studentId: string,
  lessonId: string,
  adminUserId: string | null,
  previousLessonId?: string | null,
): Promise<void> {
  await supabase
    .from('student_curriculum_progress')
    .upsert(
      { student_id: studentId, current_lesson_id: lessonId, last_activity_at: new Date().toISOString() },
      { onConflict: 'student_id' },
    );
  try {
    await supabase.from('audit_logs').insert({
      user_id: adminUserId,
      action: 'admin_set_current_lesson',
      resource_type: 'student_curriculum_progress',
      resource_id: studentId,
      old_values: { current_lesson_id: previousLessonId ?? null },
      new_values: { current_lesson_id: lessonId },
    });
  } catch (e) {
    console.warn('[setCurrentLesson] audit log failed', e);
  }
}
