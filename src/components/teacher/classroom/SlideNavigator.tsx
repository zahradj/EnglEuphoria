import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, CheckCircle2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { getClassroomHubTheme, type ClassroomHubKey } from './hubClassroomTheme';

interface Slide {
  id: string;
  title: string;
  thumbnailUrl?: string;
  type?: string;
  slide_type?: string;
}

interface SlideNavigatorProps {
  slides: Slide[];
  currentSlideIndex: number;
  onSlideSelect: (index: number) => void;
  lessonTitle: string;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  hubType?: ClassroomHubKey;
}

export const SlideNavigator: React.FC<SlideNavigatorProps> = ({
  slides,
  currentSlideIndex,
  onSlideSelect,
  lessonTitle,
  isCollapsed,
  onToggleCollapse,
  hubType = 'academy',
}) => {
  const theme = getClassroomHubTheme(hubType);
  const progress = slides.length ? ((currentSlideIndex + 1) / slides.length) * 100 : 0;

  if (isCollapsed) {
    return (
      <div className={`w-12 ${theme.panelBg} border-l ${theme.panelBorder} flex flex-col items-center py-4 shrink-0`}>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 mb-4"
          onClick={onToggleCollapse}
          aria-label="Expand slide timeline"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 flex items-center justify-center">
          <span className="text-xs font-semibold text-muted-foreground transform -rotate-90 whitespace-nowrap tracking-wide">
            {currentSlideIndex + 1} / {slides.length}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-64 ${theme.panelBg} border-l ${theme.panelBorder} flex flex-col shrink-0`}>
      {/* Header */}
      <div className="p-4 border-b border-border space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-0.5">
              Lesson Timeline
            </p>
            <h3 className="text-sm font-semibold text-foreground leading-snug line-clamp-2">
              {lessonTitle}
            </h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            onClick={onToggleCollapse}
            aria-label="Collapse slide timeline"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground">
            <span>Slide {currentSlideIndex + 1} of {slides.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <motion.div
              className={`h-full ${theme.progressBar} rounded-full`}
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>

      {/* Slide Thumbnails */}
      <ScrollArea className="flex-1">
        <ol className="p-3 space-y-2.5">
          {slides.map((slide, index) => {
            const isActive = index === currentSlideIndex;
            const isDone = index < currentSlideIndex;
            const isHomework =
              slide.type === 'homework_task' || slide.slide_type === 'homework_task';
            const prev = index > 0 ? slides[index - 1] : null;
            const prevIsHomework = prev
              ? prev.type === 'homework_task' || prev.slide_type === 'homework_task'
              : false;
            const showHomeworkDivider = isHomework && !prevIsHomework;
            return (
              <React.Fragment key={slide.id}>
                {showHomeworkDivider && (
                  <li className="pt-2">
                    <div className="flex items-center gap-2 px-1 pb-1">
                      <div className="h-px flex-1 bg-amber-300/60" />
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                        <Sparkles className="h-3 w-3" />
                        Bonus · Homework
                      </span>
                      <div className="h-px flex-1 bg-amber-300/60" />
                    </div>
                  </li>
                )}
                <li>
                  <motion.button
                    layout
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.985 }}
                    onClick={() => onSlideSelect(index)}
                    className={`group w-full text-left rounded-xl overflow-hidden relative transition-all border ${
                      isActive
                        ? `${theme.panelBorder} shadow-md ring-2 ${theme.accentRing}`
                        : isHomework
                        ? 'border-amber-300/70 hover:border-amber-400'
                        : 'border-border/60 hover:border-border'
                    }`}
                    aria-current={isActive ? 'step' : undefined}
                  >
                    <div className={`aspect-[16/9] relative ${isHomework ? 'bg-amber-50' : 'bg-muted'}`}>
                      {slide.thumbnailUrl ? (
                        <img
                          src={slide.thumbnailUrl}
                          alt={slide.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center ${
                          isHomework
                            ? 'bg-gradient-to-br from-amber-100 to-orange-100'
                            : 'bg-gradient-to-br from-muted to-muted/60'
                        }`}>
                          {isHomework ? (
                            <Sparkles className="h-7 w-7 text-amber-600" />
                          ) : (
                            <span className="text-2xl font-bold text-muted-foreground/70">
                              {index + 1}
                            </span>
                          )}
                        </div>
                      )}
                      {/* Step badge */}
                      <div
                        className={`absolute top-1.5 left-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-sm ${
                          isActive
                            ? `${theme.chipBg} ${theme.chipText}`
                            : isDone
                            ? 'bg-emerald-500 text-white'
                            : isHomework
                            ? 'bg-amber-500 text-white'
                            : 'bg-background/90 text-foreground'
                        }`}
                      >
                        {isDone ? <CheckCircle2 className="h-3 w-3" /> : isHomework ? 'HW' : index + 1}
                      </div>
                    </div>
                    <div className={`px-2.5 py-2 ${isHomework ? 'bg-amber-50/70' : 'bg-card'}`}>
                      <p className={`text-xs leading-snug line-clamp-2 ${
                        isActive ? 'font-semibold text-foreground' : 'text-muted-foreground'
                      }`}>
                        {slide.title || `Slide ${index + 1}`}
                      </p>
                    </div>
                  </motion.button>
                </li>
              </React.Fragment>
            );
          })}
        </ol>
      </ScrollArea>
    </div>
  );
};
