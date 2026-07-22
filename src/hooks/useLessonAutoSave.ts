import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Bookmarks the student's current slide_index + stars_remaining to:
 *   1. localStorage  (instant, offline-safe)
 *   2. student_sessions table (debounced ~1.2s, durable across devices)
 *
 * The (user_id, lesson_id) pair is unique — upsert keeps a single row per lesson.
 */
export function useLessonAutoSave(params: {
  lessonId?: string;
  studentId?: string;
  slideIndex: number;
  starsRemaining: number;
  totalSlides: number;
  completed: boolean;
}) {
  const { lessonId, studentId, slideIndex, starsRemaining, totalSlides, completed } = params;
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    if (!lessonId) return;

    // 1) localStorage — synchronous, never lost
    try {
      localStorage.setItem(
        `lesson-progress:${lessonId}`,
        JSON.stringify({
          lesson_id: lessonId,
          slide_index: slideIndex,
          stars_remaining: starsRemaining,
          updated_at: Date.now(),
        }),
      );
    } catch (e) {
      // quota / privacy mode — non-fatal
      console.warn('[autosave] localStorage write failed', e);
    }

    // 2) Debounced server upsert (only if we have a uuid lesson + student)
    if (!studentId) return;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(lessonId);
    if (!isUuid) return;

    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(async () => {
      const { error } = await supabase
        .from('student_sessions')
        .upsert(
          {
            user_id: studentId,
            lesson_id: lessonId,
            slide_index: slideIndex,
            stars_remaining: starsRemaining,
            completed: completed || slideIndex >= totalSlides - 1,
            updated_at: new Date().toISOString(),
          } as any,
          { onConflict: 'user_id,lesson_id' } as any,
        );
      if (error) console.warn('[autosave] student_sessions upsert failed', error.message);
    }, 1200);

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [lessonId, studentId, slideIndex, starsRemaining, totalSlides, completed]);
}

/** Reads a bookmark from localStorage. */
export function readLessonBookmark(lessonId?: string): {
  slide_index: number;
  stars_remaining: number;
} | null {
  if (!lessonId) return null;
  try {
    const raw = localStorage.getItem(`lesson-progress:${lessonId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed.slide_index !== 'number') return null;
    return {
      slide_index: parsed.slide_index,
      stars_remaining: typeof parsed.stars_remaining === 'number' ? parsed.stars_remaining : 3,
    };
  } catch {
    return null;
  }
}

/** Clears the bookmark — call when the lesson is fully completed. */
export function clearLessonBookmark(lessonId?: string) {
  if (!lessonId) return;
  try {
    localStorage.removeItem(`lesson-progress:${lessonId}`);
  } catch {
    /* noop */
  }
}
