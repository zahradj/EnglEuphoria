import { forwardRef, lazy, Suspense } from 'react';
import { getSceneLesson } from '@/content/playground-library/sceneLessonRegistry';
import type { PlayUnitLessonHandle } from '@/pages/playground-scene/PlayUnitLesson';

const PlayUnitLesson = lazy(() => import('@/pages/playground-scene/PlayUnitLesson'));

interface EmbeddedSceneLessonProps {
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
 * Bridges the classroom's live stage to the standalone Playground Library
 * scene player. Looks up the matching Scene[] for the resolved lesson and
 * renders it embedded within MainStage's stage container.
 */
export const EmbeddedSceneLesson = forwardRef<PlayUnitLessonHandle, EmbeddedSceneLessonProps>(
  function EmbeddedSceneLesson(
    { unitNumber, lessonNumber, roomId, role, hideInternalNav, onNavState, persistedSceneIdx, onSceneIdxPersist },
    ref,
  ) {
    const scenes = getSceneLesson(unitNumber, lessonNumber);

    if (!scenes || scenes.length === 0) {
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
        <PlayUnitLesson
          ref={ref}
          scenes={scenes}
          sessionKey={`lep-scene-${unitNumber}-${lessonNumber}-${roomId}`}
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
