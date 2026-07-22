// /classroom/:id/teacher-panel — teacher-only asymmetric control surface.
import { useParams } from 'react-router-dom';
import { TeacherControlPanel } from '@/components/teacher-panel';
import type { MirroredActivity } from '@/components/teacher-panel';
import type { ActiveBlock } from '@/components/teacher-panel/TeacherPrompter';

const DEMO_ACTIVITY: MirroredActivity = {
  id: 'demo-1',
  type: 'drag_and_drop',
  title: 'Sort the animals',
  payload: {
    sceneWidth: 720,
    sceneHeight: 420,
    zones: [
      { id: 'farm', x: 200, y: 320, width: 220, height: 140, color: 'rgba(34,197,94,0.10)' },
      { id: 'zoo', x: 520, y: 320, width: 220, height: 140, color: 'rgba(59,130,246,0.10)' },
    ],
    items: [
      { id: 'cow', image: '/placeholder.svg', initial_x: 120, initial_y: 80, targetZoneId: 'farm' },
      { id: 'lion', image: '/placeholder.svg', initial_x: 360, initial_y: 80, targetZoneId: 'zoo' },
      { id: 'pig', image: '/placeholder.svg', initial_x: 600, initial_y: 80, targetZoneId: 'farm' },
    ],
  },
};

const DEMO_BLOCK: ActiveBlock = {
  id: 'demo-1',
  type: 'drag_and_drop',
  title: 'Sort the animals',
  target_chunk: 'It lives on the farm.',
  teacher_notes:
    'Watch for hesitation on "lives". If the student is silent, model the chunk once, then invite them to repeat. Trigger Reward after two correct placements to keep momentum high.',
};

export default function TeacherControlPanelPage() {
  const { id } = useParams<{ id: string }>();
  if (!id) {
    return (
      <div className="h-screen w-full flex items-center justify-center text-sm text-muted-foreground">
        Missing classroom session id.
      </div>
    );
  }
  return <TeacherControlPanel sessionId={id} initialActivity={DEMO_ACTIVITY} initialBlock={DEMO_BLOCK} />;
}
