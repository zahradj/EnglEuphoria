/**
 * Dev-only route for the unified pilot lesson engine (Phase 1). Not linked
 * from any nav — reachable only via direct URL at /unified-pilot/:hub/:lessonId.
 */
import { useParams } from 'react-router-dom';
import { UnifiedLessonPlayer } from '@/components/unified-player/UnifiedLessonPlayer';
import type { Hub } from '@/unified-lessons/types';

const VALID_HUBS: Hub[] = ['playground', 'academy', 'success'];

export default function UnifiedPilotPage() {
  const { hub, lessonId } = useParams<{ hub: string; lessonId: string }>();

  if (!hub || !VALID_HUBS.includes(hub as Hub) || !lessonId) {
    return (
      <div className="p-10 text-center text-rose-600">
        Invalid pilot URL. Use /unified-pilot/&lt;playground|academy|success&gt;/&lt;lessonId&gt;.
      </div>
    );
  }

  return <UnifiedLessonPlayer hub={hub as Hub} lessonId={lessonId} />;
}
