import { forwardRef, lazy, Suspense } from 'react';
import { getWelcomeTownLesson } from '@/content/playground-library/welcomeTownLessonRegistry';
import type { PlayWelcomeTownLessonHandle } from '@/pages/playground-scene/PlayWelcomeTownLesson';

const PlayWelcomeTownLesson = lazy(() => import('@/pages/playground-scene/PlayWelcomeTownLesson'));

interface EmbeddedWelcomeTownLessonProps {
  contentFormat: string;
  unitNumber: number;
  lessonNumber: number;
  roomId: string;
  role: 'teacher' | 'student';
  /** When true, suppress the internal Back/Next/counter bar — the caller
   *  renders its own nav bar outside this component's frame instead. */
  hideInternalNav?: boolean;
  onNavState?: (state: { sceneIdx: number; total: number; canNavigate: boolean; interactionUnlocked: boolean }) => void;
  persistedSceneIdx?: number | null;
  onSceneIdxPersist?: (idx: number) => void;
}

/**
 * Bridges the classroom's live stage to the Welcome Town (A1 `wt-rich` / A2
 * `wt-a2-rich`) scene player — the counterpart to EmbeddedSceneLesson for
 * Pre-A1's `lep1-rich` lessons, which live in a different scenes/renderer
 * module and so need their own lookup + embed path.
 */
export const EmbeddedWelcomeTownLesson = forwardRef<PlayWelcomeTownLessonHandle, EmbeddedWelcomeTownLessonProps>(
  function EmbeddedWelcomeTownLesson(
    { contentFormat, unitNumber, lessonNumber, roomId, role, hideInternalNav, onNavState, persistedSceneIdx, onSceneIdxPersist },
    ref,
  ) {
    const lesson = getWelcomeTownLesson(contentFormat, unitNumber, lessonNumber);

    if (!lesson) {
      return (
        <div className="flex h-full w-full items-center justify-center bg-orange-50 p-8 text-center">
          <p className="text-lg font-bold text-orange-700">
            This lesson's content isn't available yet.
          </p>
        </div>
      );
    }

    return (
      <Suspense fallback={<div className="flex h-full w-full items-center justify-center bg-white" />}>
        <PlayWelcomeTownLesson
          ref={ref}
          scenes={lesson.scenes}
          sessionKey={`wt-scene-${contentFormat}-${unitNumber}-${lessonNumber}-${roomId}`}
          embedded
          unitNumber={unitNumber}
          lessonNumber={lessonNumber}
          role={role}
          roomId={roomId}
          hideInternalNav={hideInternalNav}
          onNavState={onNavState}
          persistedSceneIdx={persistedSceneIdx}
          onSceneIdxPersist={onSceneIdxPersist}
        />
      </Suspense>
    );
  },
);
