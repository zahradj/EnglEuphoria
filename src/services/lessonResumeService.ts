import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase as typedClient } from '@/integrations/supabase/client';

// the resume table is newer than the generated types: talk to it through the untyped client
const supabase = typedClient as unknown as SupabaseClient;

/**
 * Automatic "where did I stop?" for a lesson. The curriculum order and the unlocking of the next lesson already
 * live in the map (usePlaygroundLessons: first lesson that is not completed = current, the rest locked); this saves the
 * position INSIDE the current lesson so the same lesson continues there on any device, and is cleared when it is completed.
 *
 * Everything here fails soft: if the table is missing or the network drops, the lesson simply starts from the beginning
 * as it always did, and nothing else is affected.
 */

export interface SavedResume {
  sceneId: string | null;
  sceneIndex: number;
  totalScenes: number;
  updatedAt: string | null;
}

interface SceneRef { id?: string }

/** Where to restart. Prefers the scene id (survives edits to the lesson), then the index; never the finale itself. */
export function resolveResumeIndex(saved: Pick<SavedResume, 'sceneId' | 'sceneIndex'> | null, scenes: SceneRef[]): number {
  if (!saved || scenes.length < 2) return 0;
  let idx = saved.sceneId ? scenes.findIndex((s) => s.id === saved.sceneId) : -1;
  if (idx < 0) idx = saved.sceneIndex;
  idx = Math.max(0, Math.min(scenes.length - 1, Math.floor(idx)));
  // The finale fires completion; if the student was already on it, step back to the last real scene.
  return idx >= scenes.length - 1 ? scenes.length - 2 : idx;
}

/** Offer "Continue" only when there is something to continue (past the first scene). */
export const hasSomethingToResume = (index: number) => index >= 1;

/** How far through, 0–100 (the finale counts as the end). */
export function resumePercent(index: number, total: number): number {
  if (total <= 1) return 0;
  return Math.max(0, Math.min(100, Math.round((index / (total - 1)) * 100)));
}

export async function loadResume(userId: string, lessonId: string): Promise<SavedResume | null> {
  try {
    const { data, error } = await supabase
      .from('student_lesson_resume')
      .select('scene_id, scene_index, total_scenes, updated_at')
      .eq('user_id', userId)
      .eq('lesson_id', lessonId)
      .maybeSingle();
    if (error || !data) return null;
    return { sceneId: data.scene_id ?? null, sceneIndex: data.scene_index, totalScenes: data.total_scenes, updatedAt: data.updated_at ?? null };
  } catch {
    return null;
  }
}

export async function saveResume(args: { userId: string; lessonId: string; sceneId: string | null; sceneIndex: number; totalScenes: number }): Promise<boolean> {
  try {
    const { error } = await supabase.from('student_lesson_resume').upsert(
      {
        user_id: args.userId,
        lesson_id: args.lessonId,
        scene_id: args.sceneId,
        scene_index: args.sceneIndex,
        total_scenes: args.totalScenes,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,lesson_id' },
    );
    return !error;
  } catch {
    return false;
  }
}

export async function clearResume(userId: string, lessonId: string): Promise<void> {
  try {
    await supabase.from('student_lesson_resume').delete().eq('user_id', userId).eq('lesson_id', lessonId);
  } catch { /* nothing to clear */ }
}

/**
 * Mark the lesson "in progress" so the dashboard's "Jump back in" finds it. Inserts only if the student has no row yet —
 * it never touches an existing row, so a completed lesson that is replayed stays completed.
 */
export async function markLessonInProgress(userId: string, lessonId: string): Promise<void> {
  try {
    await supabase.from('student_lesson_progress').upsert(
      { user_id: userId, lesson_id: lessonId, status: 'in_progress', started_at: new Date().toISOString(), attempts: 1 },
      { onConflict: 'user_id,lesson_id', ignoreDuplicates: true },
    );
  } catch { /* best effort */ }
}

export interface ResumeSaver {
  /** The player moved to scene `index`. Saved shortly after (a burst of quick moves is one write). */
  note(index: number): void;
  /** Write whatever is pending right now (closing the lesson, leaving the tab). */
  flush(): Promise<void>;
  cancel(): void;
}

/**
 * Debounced, last-write-wins saver. Index 0 is never saved (the lesson has not really started); the first real
 * move also marks the lesson in progress, once.
 */
export function createResumeSaver(opts: {
  userId: string;
  lessonId: string;
  scenes: SceneRef[];
  delayMs?: number;
  write?: typeof saveResume;
  markStarted?: typeof markLessonInProgress;
}): ResumeSaver {
  const { userId, lessonId, scenes, delayMs = 700, write = saveResume, markStarted = markLessonInProgress } = opts;
  let pending: number | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let started = false;

  const doWrite = async () => {
    if (timer) { clearTimeout(timer); timer = null; }
    if (pending == null) return;
    const index = pending;
    pending = null;
    if (!started) { started = true; void markStarted(userId, lessonId); }
    await write({ userId, lessonId, sceneId: scenes[index]?.id ?? null, sceneIndex: index, totalScenes: scenes.length });
  };

  return {
    note(index) {
      if (!Number.isFinite(index) || index < 1) return;
      pending = index;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => { void doWrite(); }, delayMs);
    },
    flush: doWrite,
    cancel() {
      if (timer) { clearTimeout(timer); timer = null; }
      pending = null;
    },
  };
}
