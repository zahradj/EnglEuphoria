import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface PresentationControlsProps {
  currentSlide: number;
  totalSlides: number;
  canGoNext: boolean;
  canGoPrevious: boolean;
  progress: number;
  onNext: () => void;
  onPrevious: () => void;
  onExit: () => void;
}

export const PresentationControls = ({
  currentSlide,
  totalSlides,
  canGoNext,
  canGoPrevious,
  progress,
  onNext,
  onPrevious,
  onExit,
}: PresentationControlsProps) => {
  return (
    <>
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Progress value={progress} className="h-1 rounded-none" />
      </div>

      {/* Bottom Controls */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
        <div className="max-w-4xl mx-auto bg-background/95 backdrop-blur-md border rounded-lg shadow-2xl p-4">
          <div className="flex items-center justify-between gap-4">
            {/* Previous Button */}
            <Button
              variant="outline"
              size="lg"
              onClick={onPrevious}
              disabled={!canGoPrevious}
              className="flex-shrink-0"
            >
              <ChevronLeft className="mr-2 h-5 w-5" />
              Previous
            </Button>

            {/* Slide Counter */}
            <div className="flex items-center gap-2 text-sm font-medium">
              <span className="text-muted-foreground">Slide</span>
              <span className="text-2xl font-bold">{currentSlide + 1}</span>
              <span className="text-muted-foreground">of {totalSlides}</span>
            </div>

            {/* Next Button */}
            <Button
              variant="default"
              size="lg"
              onClick={onNext}
              disabled={!canGoNext}
              className="flex-shrink-0"
            >
              Next
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>

            {/* Exit Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onExit}
              className="flex-shrink-0"
              title="Exit presentation (Esc)"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Keyboard Shortcuts Hint */}
          <div className="mt-2 text-center text-xs text-muted-foreground">
            Use arrow keys to navigate • Press Esc to exit
          </div>
        </div>
      </div>
    </>
  );
};
