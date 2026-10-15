import { useCallback, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { quizService } from '@/services/quizService';
import { pgSkillTag, wrongTag } from '@/content/playground-library/lessonChecklist';

/**
 * Playground lesson checklist (lessonChecklist.ts): in a LIVE class, the student's player saves one row per activity
 * into `quiz_responses` so the teacher's end-of-class report can show what the student did.
 *
 * - A win saves at once (is_correct = true, with the wrong tries so far).
 * - Leaving an activity the student worked on but did not win saves it as tried (is_correct = false).
 * - Only the student's own screen saves (quiz_responses' insert policy is auth.uid() = student_id), only in a live
 *   class (a session id), and each page at most once (quizService.submitAnswer skips a page already saved).
 * Never throws; a failed save only means the teacher ticks that line by hand.
 */
export function useLessonActivityLog(opts: {
  scenes: readonly { id: string; kind: string; scene?: { kind: string } }[];
  sceneIdx: number;
  role?: 'teacher' | 'student';
  sessionId?: string;
}) {
  const { user } = useAuth();
  const { scenes, sceneIdx, role, sessionId } = opts;
  const active = role === 'student' && !!sessionId && !!user?.id;
  const saved = useRef(new Set<string>());
  const wrong = useRef(0);
  const touched = useRef(false);

  const scene = scenes[sceneIdx];
  const kindOf = (s: { kind: string; scene?: { kind: string } }) => (s.kind === 'prea1' && s.scene ? s.scene.kind : s.kind);

  const save = useCallback((s: { id: string; kind: string; scene?: { kind: string } }, won: boolean, wrongTries: number) => {
    if (!active || saved.current.has(s.id)) return;
    saved.current.add(s.id);
    void quizService
      .submitAnswer(sessionId!, s.id, user!.id, user!.id, wrongTag(wrongTries), won, 0, pgSkillTag(kindOf(s)), null)
      .catch(() => { /* the teacher can still tick it */ });
  }, [active, sessionId, user]);

  // Leaving a page: if the student worked on it but did not win, it was tried.
  const prev = useRef<{ s: typeof scene; idx: number } | null>(null);
  useEffect(() => {
    const p = prev.current;
    if (p?.s && p.idx !== sceneIdx && touched.current) save(p.s, false, wrong.current);
    prev.current = { s: scene, idx: sceneIdx };
    wrong.current = 0;
    touched.current = false;
  }, [sceneIdx, scene, save]);

  const logWin = useCallback((didGem: boolean) => {
    touched.current = true;
    if (didGem && scene) save(scene, true, wrong.current);
  }, [scene, save]);
  const logWrong = useCallback(() => { touched.current = true; wrong.current += 1; }, []);

  return { logWin, logWrong };
}
