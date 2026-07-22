/**
 * PlayAsGameDialog — student-facing trail preview.
 * Uses the same PlaygroundLessonPlayer as immersive preview so new activity
 * layouts (memory, tap order, hotspot, sort, word builder, sound blend) are
 * never skipped by the older Phaser bridge.
 */
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Gamepad2 } from 'lucide-react';
import type { Slide } from '@/pages/PlaygroundDemo';
import { PlaygroundLessonPlayer } from '@/components/playground-player/PlaygroundLessonPlayer';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  slides: Slide[];
  title: string;
  lessonId?: string | null;
  cefr?: string;
}

export function PlayAsGameDialog({ open, onOpenChange, slides, title, cefr }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-none w-screen h-screen p-0 m-0 border-0 rounded-none translate-x-0 translate-y-0 left-0 top-0 overflow-hidden flex flex-col">
        <DialogHeader className="px-5 py-3 border-b border-border flex-row items-center justify-between space-y-0">
          <DialogTitle className="flex items-center gap-2">
            <Gamepad2 className="w-4 h-4" /> Play as Game — Playground Trail
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 min-h-0 overflow-auto bg-[#FEFBDD]">
          <PlaygroundLessonPlayer
            slides={slides}
            title={title || 'Playground Lesson'}
            cefr={cefr}
            skipIntro
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
