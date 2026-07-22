/**
 * ImmersivePreviewDialog
 * ----------------------
 * Full-screen "Preview as Game" modal for the Playground Creator. The
 * generated deck is rendered through `PlaygroundLessonPlayer`, which
 * wraps the existing SlideRenderer in the same trail-style chrome
 * (yellow mesh bg, glassy header with mascot + progress + stars,
 * celebration card) used by the hand-built `PlaygroundTrailLesson`. The
 * admin sees the lesson exactly the way a student will on the live
 * surface.
 */
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Play, X } from 'lucide-react';
import { type Slide } from '@/pages/PlaygroundDemo';
import { PlaygroundLessonPlayer } from '@/components/playground-player/PlaygroundLessonPlayer';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  slides: Slide[];
  title?: string;
  cefr?: string;
}

export function ImmersivePreviewDialog({ open, onOpenChange, slides, title, cefr }: Props) {
  const hasSlides = slides.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-none w-screen h-screen p-0 m-0 border-0 rounded-none translate-x-0 translate-y-0 left-0 top-0 bg-[#FEFBDD] overflow-auto">
        <div className="absolute top-3 left-3 z-[60]">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="bg-white/90 hover:bg-white text-foreground gap-1.5 shadow-lg"
          >
            <X className="w-4 h-4" /> Close Preview
          </Button>
        </div>

        {hasSlides ? (
          <PlaygroundLessonPlayer
            slides={slides}
            title={title || 'Playground Lesson'}
            cefr={cefr}
            onExit={() => onOpenChange(false)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#FE6A2F] text-center p-8">
            <div>
              <Play className="w-12 h-12 mx-auto mb-3 opacity-60" />
              <p className="text-lg font-bold">No slides to preview yet.</p>
              <p className="text-sm opacity-70">Add a slide in the CMS, then come back.</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default ImmersivePreviewDialog;
