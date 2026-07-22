import React, { useMemo, useState } from 'react';
import { Smartphone, Tablet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LessonPlayerContainer from '@/components/lesson-player/LessonPlayerContainer';
import type { HubType, GeneratedSlide } from '@/components/admin/lesson-builder/ai-wizard/types';
import { cn } from '@/lib/utils';

interface StudentSandboxFrameProps {
  slides: GeneratedSlide[];
  hub: HubType;
  lessonTitle: string;
}

/**
 * Mounts the real LessonPlayerContainer inside a mock device frame
 * so a teacher can interact with the lesson exactly as a student would.
 * No lesson_id / student_id is passed — telemetry is intentionally inert
 * in preview mode (no mastery / mistake writes).
 */
export const StudentSandboxFrame: React.FC<StudentSandboxFrameProps> = ({ slides, hub, lessonTitle }) => {
  const [device, setDevice] = useState<'mobile' | 'tablet'>('mobile');

  const dims = useMemo(
    () => (device === 'mobile' ? { w: 390, h: 720 } : { w: 820, h: 720 }),
    [device],
  );

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 p-1">
        <Button
          variant={device === 'mobile' ? 'default' : 'ghost'}
          size="sm"
          className="rounded-full"
          onClick={() => setDevice('mobile')}
        >
          <Smartphone className="mr-1 h-4 w-4" /> Mobile
        </Button>
        <Button
          variant={device === 'tablet' ? 'default' : 'ghost'}
          size="sm"
          className="rounded-full"
          onClick={() => setDevice('tablet')}
        >
          <Tablet className="mr-1 h-4 w-4" /> Tablet
        </Button>
      </div>

      <div
        className={cn(
          'overflow-hidden rounded-[2rem] border-[10px] border-foreground/80 bg-background shadow-2xl',
        )}
        style={{ width: dims.w, height: dims.h }}
      >
        <div className="h-full w-full overflow-hidden">
          <LessonPlayerContainer
            slides={slides}
            hub={hub}
            lessonTitle={lessonTitle}
            onExit={() => {/* preview mode — no-op */}}
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Preview mode — no progress, mastery, or mistake data is recorded.
      </p>
    </div>
  );
};

export default StudentSandboxFrame;
