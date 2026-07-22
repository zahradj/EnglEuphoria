/**
 * Teacher analytics — streams per-scene timing, correctness, and errors
 * from the Phaser runtime to Supabase (`lesson_slide_events` table).
 *
 * Best-effort and fully non-blocking. Buffers events and flushes in
 * batches (every ~3s or 10 events, whichever comes first), plus a final
 * flush on detach so teacher dashboards see end-of-lesson rows.
 *
 * Sits at tier 6 (observational). Never blocks gameplay, never throws
 * into the engine loop.
 */
import { supabase } from '@/integrations/supabase/client';
import type { EngineEvents } from '../../engine/events';

export interface TeacherAnalyticsContext {
  studentId: string;
  lessonId?: string;
  teacherId?: string;
  hub?: 'playground' | 'academy' | 'success';
}

type EventRow = {
  student_id: string;
  lesson_id: string | null;
  slide_index: number;
  event_type: string;
  dwell_ms: number;
  payload: Record<string, unknown>;
};

const FLUSH_INTERVAL_MS = 3000;
const FLUSH_THRESHOLD = 10;

export function attachTeacherAnalytics(
  events: EngineEvents,
  ctx: TeacherAnalyticsContext,
): () => void {
  const queue: EventRow[] = [];
  let flushTimer: ReturnType<typeof setInterval> | null = null;
  let disposed = false;

  // sceneStart timestamps keyed by flat scene index.
  const sceneStartAt = new Map<number, number>();
  // momentStart timestamps for moment-level dwell.
  const momentStartAt = new Map<number, number>();
  const lessonStartedAt = performance.now();

  const enqueue = (row: EventRow) => {
    if (disposed) return;
    queue.push(row);
    if (queue.length >= FLUSH_THRESHOLD) void flush();
  };

  const flush = async () => {
    if (queue.length === 0) return;
    const batch = queue.splice(0, queue.length);
    try {
      await supabase.from('lesson_slide_events').insert(batch);
    } catch {
      // Swallow — analytics must never break the lesson.
    }
  };

  flushTimer = setInterval(() => { void flush(); }, FLUSH_INTERVAL_MS);

  const base = (): Pick<EventRow, 'student_id' | 'lesson_id'> => ({
    student_id: ctx.studentId,
    lesson_id: ctx.lessonId ?? null,
  });

  const offSceneStart = events.on('sceneStart', ({ index }) => {
    sceneStartAt.set(index, performance.now());
    enqueue({
      ...base(),
      slide_index: index,
      event_type: 'scene_start',
      dwell_ms: 0,
      payload: { teacher_id: ctx.teacherId ?? null, hub: ctx.hub ?? null },
    });
  });

  const offSceneComplete = events.on('sceneComplete', (result) => {
    const startedAt = sceneStartAt.get(result.index ?? -1);
    const dwell = startedAt ? Math.max(0, Math.round(performance.now() - startedAt)) : 0;
    enqueue({
      ...base(),
      slide_index: result.index ?? -1,
      event_type: 'scene_complete',
      dwell_ms: dwell,
      payload: {
        teacher_id: ctx.teacherId ?? null,
        hub: ctx.hub ?? null,
        moment_kind: result.momentKind ?? null,
        moment_id: result.momentId ?? null,
        correct: result.correct ?? null,
        score: typeof result.score === 'number' ? result.score : null,
      },
    });
    if (result.correct === false) {
      enqueue({
        ...base(),
        slide_index: result.index ?? -1,
        event_type: 'scene_error',
        dwell_ms: dwell,
        payload: {
          teacher_id: ctx.teacherId ?? null,
          moment_kind: result.momentKind ?? null,
          moment_id: result.momentId ?? null,
        },
      });
    }
  });

  const offMomentStart = events.on('momentStart', ({ index, kind, id }) => {
    momentStartAt.set(index, performance.now());
    enqueue({
      ...base(),
      slide_index: index,
      event_type: 'moment_start',
      dwell_ms: 0,
      payload: { teacher_id: ctx.teacherId ?? null, hub: ctx.hub ?? null, kind, moment_id: id },
    });
  });

  const offMomentComplete = events.on('momentComplete', ({ index, kind, id }) => {
    const startedAt = momentStartAt.get(index);
    const dwell = startedAt ? Math.max(0, Math.round(performance.now() - startedAt)) : 0;
    enqueue({
      ...base(),
      slide_index: index,
      event_type: 'moment_complete',
      dwell_ms: dwell,
      payload: { teacher_id: ctx.teacherId ?? null, kind, moment_id: id },
    });
  });

  const offLessonComplete = events.on('lessonComplete', ({ results }) => {
    const correct = results.filter((r) => r.correct === true).length;
    const wrong = results.filter((r) => r.correct === false).length;
    enqueue({
      ...base(),
      slide_index: -1,
      event_type: 'lesson_complete',
      dwell_ms: Math.max(0, Math.round(performance.now() - lessonStartedAt)),
      payload: {
        teacher_id: ctx.teacherId ?? null,
        hub: ctx.hub ?? null,
        total: results.length,
        correct,
        wrong,
      },
    });
    void flush();
  });

  const offError = events.on('error', ({ message }) => {
    enqueue({
      ...base(),
      slide_index: -1,
      event_type: 'runtime_error',
      dwell_ms: 0,
      payload: { teacher_id: ctx.teacherId ?? null, message },
    });
    void flush();
  });

  return () => {
    disposed = true;
    offSceneStart();
    offSceneComplete();
    offMomentStart();
    offMomentComplete();
    offLessonComplete();
    offError();
    if (flushTimer) clearInterval(flushTimer);
    void flush();
  };
}
