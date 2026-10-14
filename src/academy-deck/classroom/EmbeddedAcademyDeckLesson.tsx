// Bridge from the live classroom stage to an Academy library lesson (the Academy twin of EmbeddedSceneLesson).
// TEACHER: owns the slide index (Back / Next / the slide strip), saves it with `onSceneIdxPersist`, and may open any slide.
// STUDENT: follows the saved index (`persistedSceneIdx`), plays the game on the current slide, and cannot move the lesson.
// Game answers are not shared between the two screens (each side plays its own copy of the slide).
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Deck } from '../Deck';
import { loadDeckScript } from '../lessonScripts';
import type { DeckScript } from '../types';

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
}

export const EmbeddedAcademyDeckLesson = forwardRef<EmbeddedAcademyDeckHandle, Props>(function EmbeddedAcademyDeckLesson(
  { lessonId, role, persistedSceneIdx, onSceneIdxPersist, artBase = '/academy-art' },
  ref,
) {
  const { t } = useTranslation();
  const [script, setScript] = useState<DeckScript | null | 'missing'>(null);
  const [idx, setIdx] = useState(() => Math.max(0, persistedSceneIdx ?? 0));
  const total = script && script !== 'missing' ? script.slides.length : 0;
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
  useImperativeHandle(ref, () => ({
    goNext: () => move(idx + 1),
    goBack: () => move(idx - 1),
    goToIndex: (n: number) => move(n),
    setInteractionUnlocked: () => undefined,
  }));

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
    <div className="relative h-full w-full" data-testid="academy-deck-embed" data-role={role}>
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
      />
      {student && <p className="ad-follow-note" role="status">{t('al.follow', 'Your teacher moves the lesson.')}</p>}
    </div>
  );
});
