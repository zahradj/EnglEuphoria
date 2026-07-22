import React from 'react';
import { Slide, CanvasElementData } from './types';
import { cn } from '@/lib/utils';
import { Check, Circle, BookOpen, Ear, Brain, MessageSquare, Trophy, RotateCcw, Sparkles } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface BlueprintPhase {
  id: string;
  label: string;
  method: string;
  color: string;
  bgColor: string;
  icon: React.ElementType;
  slides: { slideIndex: number; goal: string; recommended: string[] }[];
}

const BLUEPRINT_PHASES: BlueprintPhase[] = [
  {
    id: 'warmup',
    label: 'Warm-up',
    method: 'Activate Prior Knowledge',
    color: 'text-orange-600',
    bgColor: 'bg-orange-500/10 border-orange-500/20',
    icon: Sparkles,
    slides: [
      { slideIndex: 0, goal: 'Title slide with lesson objective & engagement hook', recommended: ['text', 'image'] },
    ],
  },
  {
    id: 'presentation-1',
    label: 'Presentation',
    method: 'Input Hypothesis (Krashen)',
    color: 'text-blue-600',
    bgColor: 'bg-blue-500/10 border-blue-500/20',
    icon: BookOpen,
    slides: [
      { slideIndex: 1, goal: 'New vocabulary with visuals', recommended: ['image', 'text', 'audio'] },
      { slideIndex: 2, goal: 'Vocabulary in context with audio', recommended: ['image', 'audio', 'text'] },
    ],
  },
  {
    id: 'guided-practice',
    label: 'Guided Practice',
    method: 'Recognition → Recall',
    color: 'text-amber-600',
    bgColor: 'bg-amber-500/10 border-amber-500/20',
    icon: Brain,
    slides: [
      { slideIndex: 3, goal: 'Matching activity with new vocabulary', recommended: ['matching', 'drag-drop'] },
      { slideIndex: 4, goal: 'Drag-and-drop or sorting exercise', recommended: ['drag-drop', 'sorting'] },
    ],
  },
  {
    id: 'presentation-2',
    label: 'Presentation',
    method: 'Noticing Hypothesis',
    color: 'text-blue-600',
    bgColor: 'bg-blue-500/10 border-blue-500/20',
    icon: BookOpen,
    slides: [
      { slideIndex: 5, goal: 'Grammar / structure in context', recommended: ['text', 'image'] },
      { slideIndex: 6, goal: 'Grammar examples with visuals', recommended: ['text', 'image', 'video'] },
    ],
  },
  {
    id: 'controlled-practice',
    label: 'Controlled Practice',
    method: 'Accuracy Focus',
    color: 'text-amber-600',
    bgColor: 'bg-amber-500/10 border-amber-500/20',
    icon: Ear,
    slides: [
      { slideIndex: 7, goal: 'Fill-in-the-blank exercise', recommended: ['fill-blank', 'sentence-builder'] },
      { slideIndex: 8, goal: 'Sentence builder activity', recommended: ['sentence-builder', 'fill-blank'] },
    ],
  },
  {
    id: 'freer-practice',
    label: 'Freer Practice',
    method: 'Fluency Building',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-500/10 border-emerald-500/20',
    icon: MessageSquare,
    slides: [
      { slideIndex: 9, goal: 'Sorting or categorization activity', recommended: ['sorting', 'quiz'] },
      { slideIndex: 10, goal: 'Quiz to check comprehension', recommended: ['quiz', 'matching'] },
    ],
  },
  {
    id: 'production',
    label: 'Production',
    method: 'Communicative Competence',
    color: 'text-green-600',
    bgColor: 'bg-green-500/10 border-green-500/20',
    icon: MessageSquare,
    slides: [
      { slideIndex: 11, goal: 'Role-play prompt or dialogue practice', recommended: ['text', 'image', 'audio'] },
      { slideIndex: 12, goal: 'Open-ended task or creative output', recommended: ['text', 'image'] },
    ],
  },
  {
    id: 'review',
    label: 'Review',
    method: 'Spaced Retrieval',
    color: 'text-purple-600',
    bgColor: 'bg-purple-500/10 border-purple-500/20',
    icon: RotateCcw,
    slides: [
      { slideIndex: 13, goal: 'Quick quiz covering all objectives', recommended: ['quiz', 'matching'] },
    ],
  },
  {
    id: 'wrapup',
    label: 'Wrap-up',
    method: 'Metacognition',
    color: 'text-rose-600',
    bgColor: 'bg-rose-500/10 border-rose-500/20',
    icon: Trophy,
    slides: [
      { slideIndex: 14, goal: 'Summary + self-assessment + celebration', recommended: ['text', 'image'] },
    ],
  },
];

function checkSlideContent(slide: Slide | undefined, recommended: string[]): boolean {
  if (!slide) return false;
  const elements = slide.canvasElements || [];
  if (elements.length === 0 && !slide.imageUrl && !slide.videoUrl && !slide.title) return false;

  const hasTypes = new Set<string>(elements.map((e: CanvasElementData) => e.elementType as string));
  if (slide.imageUrl) hasTypes.add('image');
  if (slide.videoUrl) hasTypes.add('video');
  if (slide.title) hasTypes.add('text');

  return recommended.some((r) => hasTypes.has(r));
}

interface LessonBlueprintProps {
  slides: Slide[];
  onSelectSlide: (slideIndex: number) => void;
  selectedSlideIndex: number;
}

export const LessonBlueprint: React.FC<LessonBlueprintProps> = ({
  slides,
  onSelectSlide,
  selectedSlideIndex,
}) => {
  const totalSlides = slides.length;
  let completedCount = 0;
  let totalItems = 0;

  BLUEPRINT_PHASES.forEach((phase) => {
    phase.slides.forEach((ps) => {
      if (ps.slideIndex < totalSlides) {
        totalItems++;
        if (checkSlideContent(slides[ps.slideIndex], ps.recommended)) {
          completedCount++;
        }
      }
    });
  });

  const progressPct = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-3">
        {/* Progress */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-foreground">Lesson Progress</span>
            <span className="text-muted-foreground">{completedCount}/{totalItems} steps</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Phases */}
        {BLUEPRINT_PHASES.map((phase) => {
          const Icon = phase.icon;
          const phaseSlides = phase.slides.filter((ps) => ps.slideIndex < totalSlides || totalSlides <= 1);

          if (phaseSlides.length === 0) return null;

          return (
            <div key={phase.id} className={cn('rounded-lg border p-3 space-y-2', phase.bgColor)}>
              <div className="flex items-center gap-2">
                <Icon className={cn('h-4 w-4', phase.color)} />
                <span className={cn('text-xs font-semibold uppercase tracking-wide', phase.color)}>
                  {phase.label}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground italic">{phase.method}</p>

              {phase.slides.map((ps) => {
                const slide = slides[ps.slideIndex];
                const isDone = checkSlideContent(slide, ps.recommended);
                const isSelected = ps.slideIndex === selectedSlideIndex;
                const exists = ps.slideIndex < totalSlides;

                return (
                  <button
                    key={ps.slideIndex}
                    onClick={() => exists && onSelectSlide(ps.slideIndex)}
                    className={cn(
                      'w-full flex items-start gap-2 p-2 rounded-md text-left transition-all text-xs',
                      exists ? 'cursor-pointer hover:bg-background/60' : 'opacity-40 cursor-default',
                      isSelected && 'ring-1 ring-primary bg-background/80'
                    )}
                  >
                    {isDone ? (
                      <Check className="h-3.5 w-3.5 text-green-600 mt-0.5 shrink-0" />
                    ) : (
                      <Circle className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <span className="font-medium text-foreground">
                        Slide {ps.slideIndex + 1}
                      </span>
                      <p className="text-muted-foreground text-[10px] leading-tight mt-0.5">
                        {ps.goal}
                      </p>
                      {!isDone && exists && (
                        <p className="text-[10px] text-primary/70 mt-1">
                          Add: {ps.recommended.join(', ')}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};
