import { supabase } from '@/integrations/supabase/client';

export type Hub = 'playground' | 'academy' | 'success';

const HUB_TO_TARGET_SYSTEM: Record<Hub, string[]> = {
  playground: ['playground', 'kids'],
  academy: ['academy', 'teens'],
  success: ['success', 'professional', 'adults'],
};

/**
 * Per-student "current lesson" pointer. Deliberately NOT
 * student_curriculum_progress: that legacy table requires a curriculum_id
 * the app never has, FKs current_lesson_id to lessons_content (not
 * curriculum_lessons), and has no unique key on student_id alone — so every
 * write to it failed and no student ever advanced. See migration
 * 20260930150000_student_lesson_pointers.sql. Not in the generated
 * Supabase types yet, hence the `any` casts.
 */
const POINTER_TABLE = 'student_lesson_pointers';

export async function readLessonPointer(studentId: string): Promise<string | null> {
  const { data, error } = await (supabase as any)
    .from(POINTER_TABLE)
    .select('current_lesson_id')
    .eq('student_id', studentId)
    .maybeSingle();
  if (error) {
    console.warn('[activeCoreLessonResolver] lesson pointer read failed:', error);
    return null;
  }
  return (data?.current_lesson_id as string | null) ?? null;
}

/** Batched read for list views (admin student table). */
export async function readLessonPointers(studentIds: string[]): Promise<Map<string, string>> {
  const result = new Map<string, string>();
  if (studentIds.length === 0) return result;
  const { data, error } = await (supabase as any)
    .from(POINTER_TABLE)
    .select('student_id, current_lesson_id')
    .in('student_id', studentIds);
  if (error) {
    console.warn('[activeCoreLessonResolver] lesson pointer batch read failed:', error);
    return result;
  }
  for (const row of (data ?? []) as { student_id: string; current_lesson_id: string | null }[]) {
    if (row.current_lesson_id) result.set(row.student_id, row.current_lesson_id);
  }
  return result;
}

export async function writeLessonPointer(
  studentId: string,
  lessonId: string,
): Promise<{ error: unknown | null }> {
  const { error } = await (supabase as any)
    .from(POINTER_TABLE)
    .upsert(
      { student_id: studentId, current_lesson_id: lessonId, updated_at: new Date().toISOString() },
      { onConflict: 'student_id' },
    );
  return { error: error ?? null };
}

/**
 * Resolve which lesson the student should be working on right now.
 * Order:
 *   1. student_lesson_pointers.current_lesson_id
 *   2. personalized_learning_paths.path_data[current_step].lesson_id
 *   3. First lesson in the hub by (slot_cefr_level, sequence_order, order_index)
 */
export async function resolveActiveCoreLesson(
  studentId: string,
  hub: Hub,
): Promise<string | null> {
  // 1) Current-lesson pointer (advanced after each completed lesson, or set
  //    by a teacher mid-class / an admin).
  const pointed = await readLessonPointer(studentId);
  if (pointed) return pointed;

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

  // 3) Fallback: first published lesson in this hub. Postgres gives no
  // ordering guarantee among rows that tie on every ORDER BY column (very
  // common here — many stub/placeholder rows share the same null
  // sequence_order/order_index), so without a final deterministic
  // tiebreaker this "first" pick can silently return a DIFFERENT lesson
  // on every call. Confirmed live: the exact same booking resolved to
  // three different A1 lessons (Unit 1 Lesson 1, Unit 2 Lesson 3, Unit 9
  // Lesson 1) across three reloads seconds apart — the classroom kept
  // jumping between lessons instead of settling on one. `id` as the final
  // tiebreaker makes repeated calls for the same data return the same row.
  const targets = HUB_TO_TARGET_SYSTEM[hub];
  const { data: first } = await supabase
    .from('curriculum_lessons')
    .select('id')
    .in('target_system', targets)
    .eq('is_published', true)
    .order('slot_cefr_level', { ascending: true, nullsFirst: false })
    .order('sequence_order', { ascending: true, nullsFirst: false })
    .order('order_index', { ascending: true, nullsFirst: false })
    .order('id', { ascending: true })
    .limit(1)
    .maybeSingle();
  return first?.id ?? null;
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
  return typeof v === 'number' ? v : fallback;
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
 * Advance the student's current-lesson pointer to the next lesson after
 * they've completed the current one. Returns the next lesson id, or null if
 * there is no next lesson or the write failed (so callers don't report an
 * advance that never happened).
 */
export async function advanceCurriculumProgress(
  studentId: string,
  completedLessonId: string,
): Promise<string | null> {
  const next = await getAdjacentLesson(completedLessonId, 'next');
  if (!next) return null;
  const { error: advanceErr } = await writeLessonPointer(studentId, next.id);
  if (advanceErr) {
    console.error('[activeCoreLessonResolver] lesson pointer advance failed:', advanceErr);
    return null;
  }
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
  // Throw on failure so the admin UI's catch shows "Could not update" and
  // rolls back its optimistic row, instead of toasting a success that
  // never persisted (which is what the old silent upsert did).
  const { error } = await writeLessonPointer(studentId, lessonId);
  if (error) throw error;
  try {
    await supabase.from('audit_logs').insert({
      user_id: adminUserId,
      action: 'admin_set_current_lesson',
      resource_type: 'student_lesson_pointers',
      resource_id: studentId,
      old_values: { current_lesson_id: previousLessonId ?? null },
      new_values: { current_lesson_id: lessonId },
    });
  } catch (e) {
    console.warn('[setCurrentLesson] audit log failed', e);
  }
}
