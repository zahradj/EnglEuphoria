import React, { useEffect, useCallback, useState } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Minimize2,
  StickyNote,
  Monitor
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useLMSPreviewStyles, ExportFormat } from '@/hooks/useLMSPreviewStyles';
import { useLMSQuizState } from '@/hooks/useLMSQuizState';
import {
  TitleSlidePreview,
  VocabularySlidePreview,
  GrammarSlidePreview,
  PracticeSlidePreview,
  DialogueSlidePreview,
  SpeakingSlidePreview,
  GameSlidePreview,
  QuizSlidePreview,
  ProductionSlidePreview,
  SummarySlidePreview
} from './slides';

interface LessonSlide {
  id: string;
  type: string;
  title?: string;
  content?: any;
  phase?: 'presentation' | 'practice' | 'production';
  teacherNotes?: string;
}

interface LMSPreviewPlayerProps {
  lesson: {
    id: string;
    title: string;
    slides: LessonSlide[];
    targetSystem?: string;
  };
  format: ExportFormat;
  onClose: () => void;
  showTeacherNotes?: boolean;
}

export function LMSPreviewPlayer({ 
  lesson, 
  format, 
  onClose, 
  showTeacherNotes = false 
}: LMSPreviewPlayerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showNotes, setShowNotes] = useState(showTeacherNotes);
  
  const theme = useLMSPreviewStyles(format);
  const slides = lesson.slides || [];
  
  const {
    currentSlideIndex,
    setCurrentSlideIndex,
    submitAnswer,
    isAnswered,
    isRevealed,
    getAnswer,
    stats,
    progressMeasure,
    completionStatus,
    getSCORMData
  } = useLMSQuizState(slides.length);

  const currentSlide = slides[currentSlideIndex];

  const goToSlide = useCallback((index: number) => {
    if (index >= 0 && index < slides.length) {
      setCurrentSlideIndex(index);
    }
  }, [slides.length, setCurrentSlideIndex]);

  const goNext = useCallback(() => {
    goToSlide(currentSlideIndex + 1);
  }, [currentSlideIndex, goToSlide]);

  const goPrev = useCallback(() => {
    goToSlide(currentSlideIndex - 1);
  }, [currentSlideIndex, goToSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case ' ':
          e.preventDefault();
          goNext();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          goPrev();
          break;
        case 'Home':
          e.preventDefault();
          goToSlide(0);
          break;
        case 'End':
          e.preventDefault();
          goToSlide(slides.length - 1);
          break;
        case 'Escape':
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goNext, goPrev, goToSlide, slides.length, onClose]);

  const getPhaseColor = (phase?: string) => {
    switch (phase) {
      case 'presentation': return 'bg-blue-500';
      case 'practice': return 'bg-green-500';
      case 'production': return 'bg-purple-500';
      default: return 'bg-muted';
    }
  };

  const getPhaseLabel = (phase?: string) => {
    switch (phase) {
      case 'presentation': return 'Presentation';
      case 'practice': return 'Practice';
      case 'production': return 'Production';
      default: return '';
    }
  };

  const renderSlide = () => {
    if (!currentSlide) {
      return (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          No slide content available
        </div>
      );
    }

    const slideType = currentSlide.type?.toLowerCase() || '';

    switch (slideType) {
      case 'title':
      case 'warmup':
      case 'introduction':
        return <TitleSlidePreview slide={currentSlide} lessonTitle={lesson.title} />;
      
      case 'vocabulary':
        return <VocabularySlidePreview slide={currentSlide} />;
      
      case 'grammar':
      case 'grammar_focus':
        return <GrammarSlidePreview slide={currentSlide} />;
      
      case 'practice':
      case 'controlled_practice':
        return <PracticeSlidePreview slide={currentSlide} />;
      
      case 'dialogue':
        return <DialogueSlidePreview slide={currentSlide} />;
      
      case 'speaking':
      case 'speaking_practice':
        return <SpeakingSlidePreview slide={currentSlide} />;
      
      case 'game':
      case 'matching':
      case 'activity':
        return <GameSlidePreview slide={currentSlide} />;
      
      case 'quiz':
      case 'assessment':
      case 'question':
        return (
          <QuizSlidePreview 
            slide={currentSlide}
            onAnswer={submitAnswer}
            isAnswered={isAnswered}
            isRevealed={isRevealed}
            getAnswer={getAnswer}
          />
        );
      
      case 'production':
      case 'free_production':
        return <ProductionSlidePreview slide={currentSlide} />;
      
      case 'summary':
      case 'conclusion':
        return <SummarySlidePreview slide={currentSlide} stats={stats} />;
      
      default:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">
              {currentSlide.title || `Slide ${currentSlideIndex + 1}`}
            </h2>
            <p className="text-muted-foreground">
              Slide type: {currentSlide.type}
            </p>
            {currentSlide.content && (
              <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto max-h-64">
                {JSON.stringify(currentSlide.content, null, 2)}
              </pre>
            )}
          </div>
        );
    }
  };

  const content = (
    <div className={cn("flex flex-col h-full", theme.containerClass)}>
      {/* Header */}
      <div className={cn("flex items-center justify-between px-4 py-3", theme.headerClass)}>
        <div className="flex items-center gap-3">
          <span className="font-semibold truncate max-w-[300px]">{lesson.title}</span>
          <Badge className={theme.formatBadgeClass} variant="outline">
            {theme.formatLabel}
          </Badge>
          {currentSlide?.phase && (
            <Badge className={cn("text-white", getPhaseColor(currentSlide.phase))}>
              {getPhaseLabel(currentSlide.phase)}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {stats.totalAnswered > 0 && (
            <span className="text-sm opacity-80">
              Score: {stats.correctCount}/{stats.totalAnswered}
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowNotes(!showNotes)}
            className="text-inherit hover:bg-white/10"
          >
            <StickyNote className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="text-inherit hover:bg-white/10"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-inherit hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        <div className={cn("flex-1 overflow-auto", showNotes && "border-r")}>
          <ScrollArea className="h-full">
            <div className={theme.slideClass}>
              {renderSlide()}
            </div>
          </ScrollArea>
        </div>

        {/* Teacher notes sidebar */}
        {showNotes && currentSlide?.teacherNotes && (
          <div className="w-72 bg-amber-50/50 p-4 overflow-auto">
            <div className="flex items-center gap-2 mb-3">
              <StickyNote className="h-4 w-4 text-amber-600" />
              <span className="font-semibold text-amber-700 text-sm">Teacher Notes</span>
            </div>
            <p className="text-sm text-amber-800">{currentSlide.teacherNotes}</p>
          </div>
        )}
      </div>

      {/* Navigation footer */}
      <div className={cn("px-4 py-3", theme.navigationClass)}>
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={goPrev}
            disabled={currentSlideIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>

          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Slide {currentSlideIndex + 1} of {slides.length}
            </span>
            <Progress 
              value={progressMeasure * 100} 
              className="w-32 h-2"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={goNext}
            disabled={currentSlideIndex === slides.length - 1}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        {/* Slide dots */}
        <div className="flex justify-center gap-1 mt-3">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                idx === currentSlideIndex 
                  ? "bg-primary w-4" 
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
            />
          ))}
        </div>
      </div>

      {/* SCORM Data Debug (only in development) */}
      {format === 'scorm' && (
        <details className="px-4 py-2 bg-muted/30 border-t text-xs">
          <summary className="cursor-pointer text-muted-foreground flex items-center gap-2">
            <Monitor className="h-3 w-3" />
            SCORM Data Preview
          </summary>
          <pre className="mt-2 p-2 bg-muted rounded text-[10px] overflow-auto max-h-32">
            {JSON.stringify(getSCORMData(), null, 2)}
          </pre>
        </details>
      )}
    </div>
  );

  if (isFullscreen) {
    return (
      <Dialog open={true} onOpenChange={() => setIsFullscreen(false)}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0">
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] p-0 overflow-hidden">
        {content}
      </DialogContent>
    </Dialog>
  );
}
