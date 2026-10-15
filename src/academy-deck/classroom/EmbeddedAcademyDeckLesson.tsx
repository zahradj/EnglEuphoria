// Bridge from the live classroom stage to an Academy library lesson (the Academy twin of EmbeddedSceneLesson).
// TEACHER: owns the slide index (Back / Next / the slide strip), saves it with `onSceneIdxPersist`, and may open any slide.
// STUDENT: follows the saved index (`persistedSceneIdx`), plays the game on the current slide, and cannot move the lesson.
// Live sharing both ways: each side's clicks and typed text are repeated on the other screen (DOM-path replay on the same slide,
// as in the Playground classroom) so the teacher sees the student play in real time. The deck is seeded, so both copies match.
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Deck } from '../Deck';
import { whiteboardService, type SceneTapPayload } from '@/services/whiteboardService';
import { getDomPath, getElementAtPath } from '@/content/playground-library/unit1/scenePathSync';
import { loadDeckScript } from '../lessonScripts';
import type { DeckScript } from '../types';
import { useAcademyActivityLog } from './useAcademyActivityLog';

export interface EmbeddedAcademyDeckHandle {
  goNext: () => void;
  goBack: () => void;
  goToIndex: (idx: number) => void;
  setInteractionUnlocked: (unlocked: boolean) => void;
}

interface Props {
  lessonId: string;
  roomId: string;
  role: 'teacher' | 'student';
  /** saved slide index of this lesson in the classroom session */
  persistedSceneIdx?: number | null;
  /** teacher only: save the slide index so the student's screen follows */
  onSceneIdxPersist?: (idx: number) => void;
  artBase?: string;
  /** the live class's session: the student's screen saves what they did for the teacher's checklist */
  sessionId?: string;
  /** the signed-in student (rows are saved under their id) */
  userId?: string;
  /** reports the slide the class is on (the classroom's page strip, the checklist pop-up and the report read it) */
  onNavState?: (state: { sceneIdx: number; total: number; canNavigate: boolean; interactionUnlocked: boolean; lockToggleApplicable: boolean }) => void;
}

export const EmbeddedAcademyDeckLesson = forwardRef<EmbeddedAcademyDeckHandle, Props>(function EmbeddedAcademyDeckLesson(
  { lessonId, roomId, role, persistedSceneIdx, onSceneIdxPersist, artBase = '/academy-art', sessionId, userId, onNavState },
  ref,
) {
  const { t } = useTranslation();
  const [script, setScript] = useState<DeckScript | null | 'missing'>(null);
  const [idx, setIdx] = useState(() => Math.max(0, persistedSceneIdx ?? 0));
  const total = script && script !== 'missing' ? script.slides.length : 0;
  const log = useAcademyActivityLog({ role, sessionId, userId });
  const totalRef = useRef(0);
  totalRef.current = total;

  useEffect(() => {
    const p = loadDeckScript(lessonId);
    if (!p) return setScript('missing');
    let live = true;
    p.then((s) => live && setScript(s)).catch(() => live && setScript('missing'));
    return () => {
      live = false;
    };
  }, [lessonId]);

  // student: follow the teacher's saved index; teacher: adopt it once when the lesson (re)loads
  useEffect(() => {
    if (persistedSceneIdx == null) return;
    if (role === 'student') setIdx(persistedSceneIdx);
  }, [persistedSceneIdx, role]);

  const move = (n: number) => {
    const next = Math.max(0, Math.min(Math.max(totalRef.current - 1, 0), n));
    setIdx(next);
    onSceneIdxPersist?.(next);
  };
  // a page left after wrong tries without a win is saved as tried; the class's slide number goes to the classroom
  useEffect(() => () => log.onLeave(), [idx]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (total > 0) onNavState?.({ sceneIdx: idx, total, canNavigate: true, interactionUnlocked: false, lockToggleApplicable: false });
  }, [idx, total, onNavState]);
  useImperativeHandle(ref, () => ({
    goNext: () => move(idx + 1),
    goBack: () => move(idx - 1),
    goToIndex: (n: number) => move(n),
    setInteractionUnlocked: () => undefined,
  }));

  const wrapRef = useRef<HTMLDivElement>(null);
  const replaying = useRef(false);
  const idxRef = useRef(idx);
  idxRef.current = idx;
  const host = () => wrapRef.current?.querySelector('.ad-slidehost') ?? null;
  // BOTH SIDES: send what this side clicks and types on the slide; the other side repeats it (never the page moves: the teacher owns those)
  const pending = useRef<SceneTapPayload[]>([]);
  const apply = (p: SceneTapPayload) => {
    const root = host();
    const el = root ? getElementAtPath(root, p.path) : null;
    if (!el) return;
    replaying.current = true;
    try {
      if (p.kind === 'input' && (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement)) {
        const proto = el instanceof HTMLInputElement ? HTMLInputElement.prototype : HTMLTextAreaElement.prototype;
        Object.getOwnPropertyDescriptor(proto, 'value')?.set?.call(el, p.value ?? '');
        el.dispatchEvent(new Event('input', { bubbles: true }));
      } else if (p.kind === 'click') el.click();
    } finally {
      replaying.current = false;
    }
  };
  useEffect(() => {
    if (!roomId || !script || script === 'missing') return;
    const wrap = wrapRef.current;
    if (!wrap) return;
    const send = (e: Event, kind: 'click' | 'input') => {
      if (replaying.current) return;
      const root = host();
      const el = e.target as Element | null;
      if (!root || !el) return;
      const path = getDomPath(root, el);
      if (!path) return;
      const value = kind === 'input' ? (el as HTMLInputElement).value : undefined;
      void whiteboardService.sendSceneTap(roomId, { path, kind, slide: idxRef.current, value, senderRole: role, senderId: role });
    };
    const onClick = (e: Event) => send(e, 'click');
    const onInput = (e: Event) => send(e, 'input');
    wrap.addEventListener('click', onClick, true);
    wrap.addEventListener('input', onInput, true);
    const off = whiteboardService.subscribeToSceneTap(roomId, (p) => {
      if (p.senderRole === role || p.slide == null) return;
      if (p.slide === idxRef.current) apply(p);
      else if (p.slide > idxRef.current) pending.current.push(p); // the page change is still on its way
    });
    return () => {
      wrap.removeEventListener('click', onClick, true);
      wrap.removeEventListener('input', onInput, true);
      off();
    };
  }, [role, roomId, script]); // eslint-disable-line react-hooks/exhaustive-deps
  // events that arrived before this side reached their page are played once it gets there
  useEffect(() => {
    const due = pending.current.filter((p) => p.slide === idx);
    pending.current = pending.current.filter((p) => (p.slide ?? 0) > idx);
    if (!due.length) return;
    const t = setTimeout(() => due.forEach(apply), 80);
    return () => clearTimeout(t);
  }, [idx]); // eslint-disable-line react-hooks/exhaustive-deps

  if (script === 'missing') {
    return (
      <div className="flex h-full w-full items-center justify-center bg-violet-50 p-8 text-center">
        <p className="text-lg font-bold text-violet-700">{t('al.missing', 'This lesson isn’t available.')}</p>
      </div>
    );
  }
  if (!script) return <div className="flex h-full w-full items-center justify-center bg-violet-50" />;
  const student = role === 'student';
  return (
    <div ref={wrapRef} className="relative h-full w-full" data-testid="academy-deck-embed" data-role={role}>
      <Deck
        key={`${lessonId}-${role}`}
        script={script}
        artBase={artBase}
        embedded
        teacher={!student}
        freeNext={!student}
        follow={student}
        slide={idx}
        onSlide={student ? undefined : move}
        // what the teacher did on the student's screen is not the student's work
        onSlideDone={student ? (...a: Parameters<typeof log.onSlideDone>) => { if (!replaying.current) log.onSlideDone(...a); } : undefined}
        onSlideWrong={student ? (...a: Parameters<typeof log.onSlideWrong>) => { if (!replaying.current) log.onSlideWrong(...a); } : undefined}
      />
      {student && <p className="ad-follow-note" role="status">{t('al.follow', 'Your teacher moves the lesson.')}</p>}
    </div>
  );
});
