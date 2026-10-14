// Bridge from the live classroom's stage to the Academy lesson player (the Academy twin of EmbeddedSceneLesson).
// Same props as EmbeddedSceneLesson, with `lessonId` (an Academy session id such as "A1-S01-E1") instead of unit/lesson numbers,
// so the stage can mount it in the same place with the same nav wiring.
import { forwardRef, lazy, Suspense, useEffect, useState } from 'react';
import type { AcademyLessonHandle, AcademyLessonPlayerProps } from './AcademyLessonPlayer';
import { loadAcademyLesson } from './lessonRegistry';
import type { SceneScript } from './scriptTypes';

const AcademyLessonPlayer = lazy(() => import('./AcademyLessonPlayer'));

export interface EmbeddedAcademyLessonProps extends Omit<AcademyLessonPlayerProps, 'script' | 'sessionKey'> {
  lessonId: string;
  roomId: string;
  role: 'teacher' | 'student';
}

export const EmbeddedAcademyLesson = forwardRef<AcademyLessonHandle, EmbeddedAcademyLessonProps>(function EmbeddedAcademyLesson({ lessonId, roomId, ...rest }, ref) {
  const [script, setScript] = useState<SceneScript | null | 'missing'>(null);
  useEffect(() => {
    const p = loadAcademyLesson(lessonId);
    if (!p) return setScript('missing');
    let live = true;
    p.then((s) => live && setScript(s)).catch(() => live && setScript('missing'));
    return () => {
      live = false;
    };
  }, [lessonId]);

  if (script === 'missing') {
    return (
      <div className="flex h-full w-full items-center justify-center bg-violet-50 p-8 text-center">
        <p className="text-lg font-bold text-violet-700">This lesson's content isn't available yet.</p>
      </div>
    );
  }
  if (!script) return <div className="flex h-full w-full items-center justify-center bg-white" />;
  return (
    <Suspense fallback={<div className="flex h-full w-full items-center justify-center bg-white" />}>
      {/* keyed by lesson + room so a different lesson mid-class mounts a fresh player */}
      <AcademyLessonPlayer ref={ref} key={`academy-${lessonId}-${roomId}`} script={script} sessionKey={`academy-${lessonId}-${roomId}`} embedded roomId={roomId} {...rest} />
    </Suspense>
  );
});
