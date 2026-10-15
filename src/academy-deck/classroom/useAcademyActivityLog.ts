import { useCallback, useRef } from 'react';
import { quizService } from '@/services/quizService';
import type { Slide } from '../types';
import { acTag, acWrongTag, isLoggedSlide } from './checklistLog';

/**
 * Academy lesson checklist: in a LIVE class the STUDENT's deck saves one row per activity into `quiz_responses`
 * (a win at once, with the wrong tries so far; leaving a page that was tried but not won saves it as tried).
 * Only the student's own screen saves, only in a live class (a session id), each page at most once. Never throws.
 */
export function useAcademyActivityLog(opts: { role?: 'teacher' | 'student'; sessionId?: string; userId?: string }) {
  const active = opts.role === 'student' && !!opts.sessionId && !!opts.userId;
  const saved = useRef(new Set<string>());
  const tried = useRef<{ slide: Slide; wrong: number } | null>(null);

  const save = useCallback((s: Slide, won: boolean, wrong: number) => {
    if (!active || !isLoggedSlide(s) || saved.current.has(s.id)) return;
    saved.current.add(s.id);
    void quizService.submitAnswer(opts.sessionId!, s.id, opts.userId!, opts.userId!, acWrongTag(wrong), won, 0, acTag(s), null).catch(() => { /* the teacher can still mark it */ });
  }, [active, opts.sessionId, opts.userId]);

  const onSlideDone = useCallback((s: Slide, r: { wrong: number }) => { save(s, true, r.wrong); if (tried.current?.slide.id === s.id) tried.current = null; }, [save]);
  const onSlideWrong = useCallback((s: Slide, wrong: number) => { tried.current = { slide: s, wrong }; }, []);
  /** Call when the page changes: a page tried but not won is saved as tried. */
  const onLeave = useCallback(() => {
    const t = tried.current;
    if (t) { save(t.slide, false, t.wrong); tried.current = null; }
  }, [save]);
  return { onSlideDone, onSlideWrong, onLeave };
}
