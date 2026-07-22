import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Slide } from './types';
import { GeneratedSlide, HubType } from './ai-wizard/types';
import { resolveHub } from './ai-wizard/hubConfig';
import LessonPlayerContainer from '@/components/lesson-player/LessonPlayerContainer';
import { buildPreviewHomeworkPack } from '@/components/lesson-player/buildPreviewHomeworkPack';
import { CanvasElement } from './canvas/CanvasElement';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X, Play, Presentation } from 'lucide-react';

interface LessonPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slides: Slide[];
  lessonTitle: string;
  generatedSlides?: GeneratedSlide[];
  hub?: HubType;
  homeworkPack?: import('@/coherence/types').HomeworkPack | null;
}

const CANVAS_W = 1920;
const CANVAS_H = 1080;

export const LessonPreviewDialog: React.FC<LessonPreviewDialogProps> = ({
  open,
  onOpenChange,
  slides,
  lessonTitle,
  generatedSlides,
  hub,
  homeworkPack,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mode, setMode] = useState<'interactive' | 'canvas'>('interactive');

  useEffect(() => {
    if (open) {
      setCurrentIndex(0);
      // Default to interactive if we have generated slides
      setMode(generatedSlides && generatedSlides.length > 0 ? 'interactive' : 'canvas');
    }
  }, [open, generatedSlides]);

  const goNext = useCallback(() => {
    setCurrentIndex((i) => Math.min(i + 1, slides.length - 1));
  }, [slides.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => Math.max(i - 1, 0));
  }, []);

  useEffect(() => {
    if (!open || mode === 'interactive') return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') goNext();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'Escape') onOpenChange(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, mode, goNext, goPrev, onOpenChange]);

  const currentSlide = slides[currentIndex];
  const resolvedHub = hub || 'playground';

  const viewportScale = Math.min(
    (typeof window !== 'undefined' ? window.innerWidth * 0.85 : 960) / CANVAS_W,
    (typeof window !== 'undefined' ? window.innerHeight * 0.7 : 540) / CANVAS_H
  );

  const hasInteractiveSlides = generatedSlides && generatedSlides.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 gap-0 bg-black border-none">

        {/* Interactive App-Shell Mode */}
        {mode === 'interactive' && hasInteractiveSlides ? (
          <div className="w-full h-full relative">
            {/* Mode switcher */}
            <div className="absolute top-2 right-14 z-50 flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-white/70 hover:text-white hover:bg-white/20"
                onClick={() => setMode('canvas')}
              >
                <Presentation className="h-3.5 w-3.5 mr-1" /> Canvas View
              </Button>
            </div>
            <LessonPlayerContainer
              slides={generatedSlides!}
              hub={resolvedHub}
              lessonTitle={lessonTitle}
              homeworkPack={
                homeworkPack ??
                buildPreviewHomeworkPack(resolvedHub, lessonTitle, generatedSlides as any)
              }
              startOnSummary
              onExit={() => onOpenChange(false)}
            />
          </div>
        ) : (
          /* Canvas Preview Mode (original) */
          <>
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-2 bg-black/60 text-white">
              <span className="text-sm font-medium">{lessonTitle}</span>
              <div className="flex items-center gap-3">
                {hasInteractiveSlides && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-white/70 hover:text-white hover:bg-white/20"
                    onClick={() => setMode('interactive')}
                  >
                    <Play className="h-3.5 w-3.5 mr-1" /> Interactive
                  </Button>
                )}
                <span className="text-xs text-white/70">
                  {currentIndex + 1} / {slides.length}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-white hover:bg-white/20"
                  onClick={() => onOpenChange(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Slide viewport */}
            <div className="flex-1 flex items-center justify-center bg-black relative">
              {currentSlide && (
                <div
                  className="relative bg-white rounded shadow-2xl overflow-hidden"
                  style={{
                    width: CANVAS_W,
                    height: CANVAS_H,
                    transform: `scale(${viewportScale})`,
                    transformOrigin: 'center center',
                  }}
                >
                  {currentSlide.imageUrl && (
                    <img
                      src={currentSlide.imageUrl}
                      alt={currentSlide.title || `Slide ${currentIndex + 1}`}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  )}
                  {(currentSlide.canvasElements || []).map((el) => (
                    <CanvasElement
                      key={el.id}
                      element={el}
                      isSelected={false}
                      scale={1}
                      onSelect={() => {}}
                      onUpdate={() => {}}
                      onDelete={() => {}}
                      readOnly
                    />
                  ))}
                  {!currentSlide.imageUrl && (!currentSlide.canvasElements || currentSlide.canvasElements.length === 0) && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-muted to-muted/50 p-8">
                      <h2 className="text-4xl font-bold text-foreground mb-2">
                        {currentSlide.title || `Slide ${currentIndex + 1}`}
                      </h2>
                    </div>
                  )}
                </div>
              )}

              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 text-white bg-black/40 hover:bg-black/60 disabled:opacity-30"
                onClick={goPrev}
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 text-white bg-black/40 hover:bg-black/60 disabled:opacity-30"
                onClick={goNext}
                disabled={currentIndex === slides.length - 1}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>

            {/* Slide strip */}
            <div className="flex items-center gap-2 px-4 py-3 bg-black/80 overflow-x-auto">
              {slides.map((slide, idx) => (
                <button
                  key={slide.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`shrink-0 w-16 h-10 rounded border-2 overflow-hidden transition-all ${
                    idx === currentIndex
                      ? 'border-primary ring-1 ring-primary'
                      : 'border-white/20 hover:border-white/50'
                  }`}
                >
                  {slide.imageUrl ? (
                    <img src={slide.imageUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-muted/20 flex items-center justify-center text-[8px] text-white/60">
                      {idx + 1}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
