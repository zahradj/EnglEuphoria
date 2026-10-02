import { supabase } from '@/integrations/supabase/client';

export type Hub = 'playground' | 'academy' | 'success';

const HUB_TO_TARGET_SYSTEM: Record<Hub, string[]> = {
  playground: ['playground', 'kids'],
  academy: ['academy', 'teen', 'teens'],
  success: ['success', 'professional', 'adult', 'adults'],
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

export interface LessonPointerState {
  currentLessonId: string | null;
  /** Last lesson finished. Equal to currentLessonId when the student has
   *  finished everything published at their level so far ("waiting"). */
  lastCompletedLessonId: string | null;
}

export async function readLessonPointerState(studentId: string): Promise<LessonPointerState> {
  const { data, error } = await (supabase as any)
    .from(POINTER_TABLE)
    .select('current_lesson_id, last_completed_lesson_id')
    .eq('student_id', studentId)
    .maybeSingle();
  if (error) {
    console.warn('[activeCoreLessonResolver] lesson pointer read failed:', error);
    return { currentLessonId: null, lastCompletedLessonId: null };
  }
  return {
    currentLessonId: (data?.current_lesson_id as string | null) ?? null,
    lastCompletedLessonId: (data?.last_completed_lesson_id as string | null) ?? null,
  };
}

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
  //    by a teacher mid-class / an admin). If the student had finished
  //    everything published at their level, pick up a lesson added since.
  const pointer = await readLessonPointerState(studentId);
  if (pointer.currentLessonId) {
    if (pointer.lastCompletedLessonId === pointer.currentLessonId) {
      const next = await getNextLessonInLevel(pointer.currentLessonId);
      if (next) {
        // Best-effort (teachers/admins can write; students only read).
        void writeLessonPointer(studentId, next.id);
        return next.id;
      }
    }
    return pointer.currentLessonId;
  }

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
 * The next published lesson after this one at the SAME CEFR level (same
 * hub), in teaching order (unit, then lesson). Null when nothing later is
 * published at that level yet. Moving up a level is the teacher's call
 * (LessonSwitcher's next arrow crosses levels), so finishing the last
 * lesson built so far never drops a student into the next level.
 */
export async function getNextLessonInLevel(lessonId: string): Promise<LessonMeta | null> {
  const current = await fetchLessonMeta(lessonId);
  if (!current?.target_system) return null;
  const { data: all } = await supabase
    .from('curriculum_lessons')
    .select(META_COLS)
    .eq('target_system', current.target_system)
    .eq('is_published', true);
  const level = cefrRank(current.slot_cefr_level);
  const sorted = ([...((all as unknown as LessonMeta[]) ?? [])])
    .filter(l => cefrRank(l.slot_cefr_level) === level)
    .sort(compareLessons);
  const idx = sorted.findIndex(l => l.id === lessonId);
  if (idx >= 0) return sorted[idx + 1] ?? null;
  // Lesson unpublished since: first one that sorts after it.
  return sorted.find(l => compareLessons(current, l) < 0) ?? null;
}

/**
 * Advance the student's current-lesson pointer after they've completed the
 * current one — to the next lesson at their level. If none is published
 * yet, the pointer stays put and is marked finished, and the next lesson
 * added at that level is picked up automatically (resolveActiveCoreLesson,
 * Learning Path). Returns the next lesson id, or null if there is none yet
 * or the write failed.
 */
export async function advanceCurriculumProgress(
  studentId: string,
  completedLessonId: string,
): Promise<string | null> {
  const next = await getNextLessonInLevel(completedLessonId);
  const { error: advanceErr } = await (supabase as any)
    .from(POINTER_TABLE)
    .upsert(
      {
        student_id: studentId,
        current_lesson_id: next?.id ?? completedLessonId,
        last_completed_lesson_id: completedLessonId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'student_id' },
    );
  if (advanceErr) {
    console.error('[activeCoreLessonResolver] lesson pointer advance failed:', advanceErr);
    return null;
  }
  return next?.id ?? null;
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

/** Normalise any CEFR spelling ("pre-a1", "PreA1", "a1") to the slot form
 *  curriculum_lessons uses ("Pre-A1", "A1", …). */
export function normalizeCefr(v?: string | null): string | null {
  const s = String(v ?? '').toUpperCase().replace(/[\s_-]/g, '');
  if (!s) return null;
  if (s === 'PREA1') return 'Pre-A1';
  return ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(s) ? s : null;
}

/** Unit 1 Lesson 1 (or the earliest lesson) of one level in a hub — the
 *  lesson a trial class opens, and where a new student's path starts. */
export async function findFirstLessonForLevel(hub: Hub, cefr?: string | null): Promise<string | null> {
  const level = normalizeCefr(cefr) ?? 'Pre-A1';
  const seq = await fetchHubLessonSequence(hub);
  const atLevel = seq.filter(l => cefrRank(l.slot_cefr_level) === cefrRank(level));
  return atLevel[0]?.id ?? null;
}
