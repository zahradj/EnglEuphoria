import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  BookOpen,
  Gamepad2,
  Target,
  MessageSquare,
  HelpCircle,
  Volume2,
  Image,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface LessonSlide {
  id: string;
  type: 'title' | 'vocabulary' | 'grammar' | 'practice' | 'dialogue' | 'speaking' | 'game' | 'quiz' | 'production' | 'summary';
  title: string;
  phase: 'presentation' | 'practice' | 'production';
  phaseLabel: string;
  content: {
    // Title slide
    welcomeMessage?: string;
    objectives?: string[];
    warmupQuestion?: string;
    // Vocabulary slide
    word?: string;
    ipa?: string;
    definition?: string;
    exampleSentence?: string;
    imageKeyword?: string;
    // Grammar slide
    rule?: string;
    pattern?: string;
    examples?: string[];
    commonMistakes?: string[];
    // Practice slides
    exercises?: Array<{ question: string; answer: string; options?: string[] }>;
    // Dialogue slide
    dialogue?: Array<{ speaker: string; text: string }>;
    comprehensionQuestions?: string[];
    // Speaking slide
    prompt?: string;
    sentenceStarters?: string[];
    partnerInstructions?: string;
    // Game slide
    gameType?: string;
    instructions?: string;
    items?: Array<{ word: string; match: string }>;
    // Quiz slide
    quizQuestion?: string;
    quizOptions?: Array<{ text: string; isCorrect: boolean }>;
    xpReward?: number;
    // Production slide
    scenario?: string;
    targetOutput?: string;
    peerReviewInstructions?: string;
    // Summary slide
    keyVocabulary?: string[];
    grammarReminder?: string;
    homework?: string;
  };
  imageUrl?: string;
  teacherNotes: string;
  durationSeconds: number;
}

interface SlidePreviewCarouselProps {
  slides: LessonSlide[];
  onClose?: () => void;
}

const phaseColors = {
  presentation: "bg-blue-500",
  practice: "bg-green-500",
  production: "bg-purple-500",
};

const phaseTextColors = {
  presentation: "text-blue-600",
  practice: "text-green-600",
  production: "text-purple-600",
};

const slideTypeIcons = {
  title: BookOpen,
  vocabulary: Volume2,
  grammar: GraduationCap,
  practice: Gamepad2,
  dialogue: MessageSquare,
  speaking: Volume2,
  game: Gamepad2,
  quiz: HelpCircle,
  production: Target,
  summary: BookOpen,
};

export const SlidePreviewCarousel = ({ slides, onClose }: SlidePreviewCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTeacherNotes, setShowTeacherNotes] = useState(true);

  const currentSlide = slides[currentIndex];

  const goToNext = useCallback(() => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }, [currentIndex, slides.length]);

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goToNext();
      if (e.key === "ArrowLeft") goToPrevious();
      if (e.key === "Home") setCurrentIndex(0);
      if (e.key === "End") setCurrentIndex(slides.length - 1);
      if (e.key === "Escape" && isFullscreen) setIsFullscreen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNext, goToPrevious, slides.length, isFullscreen]);

  const renderSlideContent = () => {
    if (!currentSlide) return null;
    const { type, content, title } = currentSlide;
    const Icon = slideTypeIcons[type] || BookOpen;

    return (
      <div className="h-full flex flex-col">
        {/* Slide Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Badge className={cn(phaseColors[currentSlide.phase], "text-white")}>
              {currentSlide.phaseLabel}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Icon className="h-3 w-3" />
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Badge>
          </div>
          <span className="text-sm text-muted-foreground">
            {Math.floor(currentSlide.durationSeconds / 60)}:{(currentSlide.durationSeconds % 60).toString().padStart(2, '0')} min
          </span>
        </div>

        {/* Slide Title */}
        <h2 className="text-2xl font-bold mb-6">{title}</h2>

        {/* Slide Content */}
        <div className="flex-1 overflow-auto">
          {type === "title" && (
            <div className="space-y-4">
              {content.welcomeMessage && (
                <p className="text-lg text-muted-foreground">{content.welcomeMessage}</p>
              )}
              {content.objectives && content.objectives.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Learning Objectives:</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {content.objectives.map((obj, i) => (
                      <li key={i} className="text-muted-foreground">{obj}</li>
                    ))}
                  </ul>
                </div>
              )}
              {content.warmupQuestion && (
                <div className="p-4 bg-primary/10 rounded-lg">
                  <h3 className="font-semibold mb-1">🔥 Warm-up Question:</h3>
                  <p>{content.warmupQuestion}</p>
                </div>
              )}
            </div>
          )}

          {type === "vocabulary" && (
            <div className="space-y-4">
              {/* Vocabulary Image */}
              {currentSlide.imageUrl ? (
                <div className="flex justify-center">
                  <img 
                    src={currentSlide.imageUrl} 
                    alt={content.word || 'Vocabulary image'}
                    className="max-h-48 rounded-lg object-contain border"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              ) : content.imageKeyword && (
                <div className="flex items-center justify-center gap-2 p-8 bg-muted/50 rounded-lg border-2 border-dashed">
                  <Image className="h-6 w-6 text-muted-foreground" />
                  <span className="text-muted-foreground">Image: {content.imageKeyword}</span>
                </div>
              )}
              
              <div className="text-center p-6 bg-muted rounded-lg">
                <h3 className="text-3xl font-bold mb-2">{content.word}</h3>
                {content.ipa && (
                  <p className="text-lg text-muted-foreground mb-2">{content.ipa}</p>
                )}
                <p className="text-lg">{content.definition}</p>
              </div>
              {content.exampleSentence && (
                <div className="p-4 bg-primary/10 rounded-lg">
                  <p className="italic">"{content.exampleSentence}"</p>
                </div>
              )}
            </div>
          )}

          {type === "grammar" && (
            <div className="space-y-4">
              {content.rule && (
                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border-l-4 border-blue-500">
                  <h3 className="font-semibold mb-2">📘 Grammar Rule:</h3>
                  <p>{content.rule}</p>
                </div>
              )}
              {content.pattern && (
                <div className="p-4 bg-muted rounded-lg font-mono text-center">
                  {content.pattern}
                </div>
              )}
              {content.examples && content.examples.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Examples:</h3>
                  <ul className="space-y-2">
                    {content.examples.map((ex, i) => (
                      <li key={i} className="p-2 bg-muted/50 rounded">{ex}</li>
                    ))}
                  </ul>
                </div>
              )}
              {content.commonMistakes && content.commonMistakes.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 text-red-600">⚠️ Common Mistakes:</h3>
                  <ul className="space-y-1 text-red-600">
                    {content.commonMistakes.map((m, i) => (
                      <li key={i}>• {m}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {type === "practice" && content.exercises && (
            <div className="space-y-4">
              {content.exercises.map((ex, i) => (
                <div key={i} className="p-4 bg-muted rounded-lg">
                  <p className="font-medium mb-2">{i + 1}. {ex.question}</p>
                  {ex.options ? (
                    <div className="grid grid-cols-2 gap-2">
                      {ex.options.map((opt, j) => (
                        <div key={j} className="p-2 bg-background rounded border">
                          {opt}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-green-600 text-sm">Answer: {ex.answer}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {type === "dialogue" && (
            <div className="space-y-4">
              {content.dialogue && (
                <div className="space-y-3">
                  {content.dialogue.map((line, i) => (
                    <div key={i} className={cn(
                      "p-3 rounded-lg max-w-[80%]",
                      line.speaker === "A" ? "bg-blue-100 dark:bg-blue-950" : "bg-green-100 dark:bg-green-950 ml-auto"
                    )}>
                      <span className="font-semibold">{line.speaker}: </span>
                      <span>{line.text}</span>
                    </div>
                  ))}
                </div>
              )}
              {content.comprehensionQuestions && content.comprehensionQuestions.length > 0 && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold mb-2">Comprehension Questions:</h3>
                  <ul className="list-decimal list-inside space-y-1">
                    {content.comprehensionQuestions.map((q, i) => (
                      <li key={i}>{q}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {type === "speaking" && (
            <div className="space-y-4">
              {content.prompt && (
                <div className="p-4 bg-primary/10 rounded-lg text-center">
                  <h3 className="font-semibold mb-2">🎤 Speaking Prompt:</h3>
                  <p className="text-lg">{content.prompt}</p>
                </div>
              )}
              {content.sentenceStarters && content.sentenceStarters.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Sentence Starters:</h3>
                  <div className="flex flex-wrap gap-2">
                    {content.sentenceStarters.map((s, i) => (
                      <Badge key={i} variant="secondary">{s}...</Badge>
                    ))}
                  </div>
                </div>
              )}
              {content.partnerInstructions && (
                <p className="text-sm text-muted-foreground">
                  👥 {content.partnerInstructions}
                </p>
              )}
            </div>
          )}

          {type === "game" && (
            <div className="space-y-4">
              {content.gameType && (
                <Badge variant="secondary" className="text-lg py-1 px-3">
                  🎮 {content.gameType}
                </Badge>
              )}
              {content.instructions && (
                <p className="text-muted-foreground">{content.instructions}</p>
              )}
              {content.items && content.items.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Words</h4>
                    {content.items.map((item, i) => (
                      <div key={i} className="p-2 bg-blue-100 dark:bg-blue-950 rounded">
                        {item.word}
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Match</h4>
                    {content.items.map((item, i) => (
                      <div key={i} className="p-2 bg-green-100 dark:bg-green-950 rounded">
                        {item.match}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {type === "quiz" && (
            <div className="space-y-4">
              {content.quizQuestion && (
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold text-lg mb-4">{content.quizQuestion}</h3>
                  {content.quizOptions && (
                    <div className="space-y-2">
                      {content.quizOptions.map((opt, i) => (
                        <div
                          key={i}
                          className={cn(
                            "p-3 rounded-lg border-2",
                            opt.isCorrect
                              ? "border-green-500 bg-green-50 dark:bg-green-950"
                              : "border-muted"
                          )}
                        >
                          {String.fromCharCode(65 + i)}. {opt.text}
                          {opt.isCorrect && <span className="ml-2">✓</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {content.xpReward && (
                <p className="text-center text-primary font-semibold">
                  🎯 +{content.xpReward} XP for correct answer!
                </p>
              )}
            </div>
          )}

          {type === "production" && (
            <div className="space-y-4">
              {content.scenario && (
                <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg border-l-4 border-purple-500">
                  <h3 className="font-semibold mb-2">📝 Scenario:</h3>
                  <p>{content.scenario}</p>
                </div>
              )}
              {content.targetOutput && (
                <div>
                  <h3 className="font-semibold mb-2">Target Output:</h3>
                  <p className="text-muted-foreground">{content.targetOutput}</p>
                </div>
              )}
              {content.peerReviewInstructions && (
                <div className="p-3 bg-muted rounded-lg text-sm">
                  <span className="font-semibold">👥 Peer Review: </span>
                  {content.peerReviewInstructions}
                </div>
              )}
            </div>
          )}

          {type === "summary" && (
            <div className="space-y-4">
              {content.keyVocabulary && content.keyVocabulary.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">📚 Key Vocabulary:</h3>
                  <div className="flex flex-wrap gap-2">
                    {content.keyVocabulary.map((word, i) => (
                      <Badge key={i} variant="secondary">{word}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {content.grammarReminder && (
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold mb-2">📘 Remember:</h3>
                  <p>{content.grammarReminder}</p>
                </div>
              )}
              {content.homework && (
                <div className="p-4 bg-primary/10 rounded-lg">
                  <h3 className="font-semibold mb-2">📝 Homework:</h3>
                  <p>{content.homework}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={cn(
      "flex flex-col",
      isFullscreen && "fixed inset-0 z-50 bg-background p-6"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">
            Slide {currentIndex + 1} of {slides.length}
          </span>
          {/* Progress bar */}
          <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / slides.length) * 100}%` }}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowTeacherNotes(!showTeacherNotes)}
          >
            {showTeacherNotes ? "Hide Notes" : "Show Notes"}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex gap-4">
        {/* Slide Display */}
        <Card className="flex-1 relative">
          <CardContent className="p-6 h-full">
            {renderSlideContent()}

            {/* Navigation Arrows */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2"
              onClick={goToPrevious}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              onClick={goToNext}
              disabled={currentIndex === slides.length - 1}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </CardContent>
        </Card>

        {/* Teacher Notes Panel */}
        {showTeacherNotes && currentSlide && (
          <Card className="w-72 flex-shrink-0">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Teacher Notes
              </h3>
              <p className="text-sm text-muted-foreground">
                {currentSlide.teacherNotes}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Thumbnail Strip */}
      <ScrollArea className="mt-4">
        <div className="flex gap-2 pb-2">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "flex-shrink-0 w-20 h-14 rounded border-2 p-1 transition-all",
                "flex flex-col items-center justify-center text-xs",
                index === currentIndex
                  ? "border-primary bg-primary/10"
                  : "border-muted hover:border-primary/50"
              )}
            >
              <div className={cn(
                "w-2 h-2 rounded-full mb-1",
                phaseColors[slide.phase]
              )} />
              <span className="truncate w-full text-center">{slide.type}</span>
            </button>
          ))}
        </div>
      </ScrollArea>

      {/* Keyboard Hints */}
      <div className="mt-2 text-center text-xs text-muted-foreground">
        Use ← → arrow keys to navigate • Home/End for first/last slide
      </div>
    </div>
  );
};
