import { lazy, Suspense } from 'react';
import { getSceneLesson } from '@/content/playground-library/sceneLessonRegistry';

const PlayUnitLesson = lazy(() => import('@/pages/playground-scene/PlayUnitLesson'));

interface EmbeddedSceneLessonProps {
  unitNumber: number;
  lessonNumber: number;
  roomId: string;
}

/**
 * Bridges the classroom's live stage to the standalone Playground Library
 * scene player. Looks up the matching Scene[] for the resolved lesson and
 * renders it embedded within MainStage's stage container.
 */
export function EmbeddedSceneLesson({ unitNumber, lessonNumber, roomId }: EmbeddedSceneLessonProps) {
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
        scenes={scenes}
        sessionKey={`lep-scene-${unitNumber}-${lessonNumber}-${roomId}`}
        embedded
      />
    </Suspense>
  );
}
