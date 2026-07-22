import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, ChevronRight, X, Volume2, 
  CheckCircle, XCircle, Loader2 
} from 'lucide-react';
import { useStartLesson, useCompleteLesson, useUpdateTimeSpent } from '@/hooks/useProgress';
import { LessonCompletionModal } from './LessonCompletionModal';
import { toast } from 'sonner';

interface LessonSlide {
  id: string;
  slide_type: string;
  title?: string;
  content: any;
  slide_number: number;
}

interface LessonPlayerProps {
  lessonId: string;
  lessonTitle: string;
  slides: LessonSlide[];
  userId: string;
  xpReward?: number;
  onClose: () => void;
  onComplete?: () => void;
}

export const LessonPlayer: React.FC<LessonPlayerProps> = ({
  lessonId,
  lessonTitle,
  slides,
  userId,
  xpReward = 100,
  onClose,
  onComplete,
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState<Record<string, boolean>>({});
  const [startTime] = useState(Date.now());
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  const startLessonMutation = useStartLesson();
  const completeLessonMutation = useCompleteLesson();
  const updateTimeMutation = useUpdateTimeSpent();

  const currentSlide = slides[currentSlideIndex];
  const progress = ((currentSlideIndex + 1) / slides.length) * 100;

  // Start lesson on mount
  useEffect(() => {
    startLessonMutation.mutate({ userId, lessonId });
  }, [userId, lessonId]);

  // Update time spent periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      updateTimeMutation.mutate({ userId, lessonId, additionalSeconds: 30 });
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [userId, lessonId, startTime]);

  const calculateScore = useCallback(() => {
    let totalQuestions = 0;
    let correctAnswers = 0;

    slides.forEach((slide) => {
      if (slide.slide_type === 'quiz' && slide.content?.questions) {
        slide.content.questions.forEach((q: any, qIndex: number) => {
          totalQuestions++;
          const answerKey = `${slide.id}-${qIndex}`;
          if (quizAnswers[answerKey] === q.correctIndex) {
            correctAnswers++;
          }
        });
      }
    });

    return {
      totalQuestions,
      correctAnswers,
      score: totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 100,
    };
  }, [slides, quizAnswers]);

  const handleComplete = async () => {
    const { score, totalQuestions, correctAnswers } = calculateScore();
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);

    // Calculate XP (base + bonus for high scores)
    let earnedXp = xpReward;
    if (score >= 90) earnedXp += 50;
    else if (score >= 80) earnedXp += 25;

    // Complete lesson in database
    await completeLessonMutation.mutateAsync({ userId, lessonId, score });

    // Update final time
    await updateTimeMutation.mutateAsync({ userId, lessonId, additionalSeconds: timeSpent });

    setFinalScore(score);
    
    toast.success(`Brilliant! +${earnedXp} XP added to your profile.`, {
      duration: 4000,
      icon: '🌟',
    });
    
    setShowCompletionModal(true);
  };

  const handleNext = () => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  };

  const handleQuizAnswer = (questionIndex: number, optionIndex: number) => {
    const answerKey = `${currentSlide.id}-${questionIndex}`;
    if (showResults[answerKey]) return; // Already answered

    setQuizAnswers((prev) => ({ ...prev, [answerKey]: optionIndex }));
    setShowResults((prev) => ({ ...prev, [answerKey]: true }));
  };

  const renderSlideContent = () => {
    if (!currentSlide) return null;

    switch (currentSlide.slide_type) {
      case 'title':
        return (
          <div className="text-center py-12">
            <h1 className="text-4xl font-bold mb-4">{currentSlide.title}</h1>
            <p className="text-xl text-muted-foreground">
              {currentSlide.content?.subtitle || currentSlide.content?.text}
            </p>
          </div>
        );

      case 'vocabulary':
        const words = currentSlide.content?.words || [];
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-6">{currentSlide.title || 'Vocabulary'}</h2>
            <div className="grid gap-4">
              {words.map((word: any, index: number) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold">{word.word}</h3>
                        {word.ipa && (
                          <p className="text-sm text-muted-foreground">{word.ipa}</p>
                        )}
                      </div>
                      <Button variant="ghost" size="icon">
                        <Volume2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="mt-2">{word.definition}</p>
                    {word.example && (
                      <p className="mt-2 text-sm italic text-muted-foreground">
                        "{word.example}"
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'grammar':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">{currentSlide.title || 'Grammar'}</h2>
            {currentSlide.content?.rule && (
              <div className="p-4 bg-primary/10 rounded-lg">
                <p className="font-semibold">{currentSlide.content.rule}</p>
              </div>
            )}
            {currentSlide.content?.explanation && (
              <p>{currentSlide.content.explanation}</p>
            )}
            {currentSlide.content?.examples && (
              <div className="space-y-2">
                <h4 className="font-medium">Examples:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {currentSlide.content.examples.map((ex: string, i: number) => (
                    <li key={i}>{ex}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );

      case 'quiz':
        const questions = currentSlide.content?.questions || [];
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">{currentSlide.title || 'Quiz'}</h2>
            {questions.map((q: any, qIndex: number) => {
              const answerKey = `${currentSlide.id}-${qIndex}`;
              const selectedAnswer = quizAnswers[answerKey];
              const showResult = showResults[answerKey];
              const isCorrect = selectedAnswer === q.correctIndex;

              return (
                <Card key={qIndex}>
                  <CardContent className="p-4">
                    <p className="font-medium mb-4">{q.question}</p>
                    <div className="grid gap-2">
                      {(q.options || []).map((option: string, oIndex: number) => {
                        const isSelected = selectedAnswer === oIndex;
                        const isCorrectOption = q.correctIndex === oIndex;

                        return (
                          <Button
                            key={oIndex}
                            variant={
                              showResult
                                ? isCorrectOption
                                  ? 'default'
                                  : isSelected
                                  ? 'destructive'
                                  : 'outline'
                                : isSelected
                                ? 'secondary'
                                : 'outline'
                            }
                            className={`justify-start ${
                              showResult && isCorrectOption
                                ? 'bg-green-500 hover:bg-green-600'
                                : ''
                            }`}
                            onClick={() => handleQuizAnswer(qIndex, oIndex)}
                            disabled={showResult}
                          >
                            {showResult && isCorrectOption && (
                              <CheckCircle className="h-4 w-4 mr-2" />
                            )}
                            {showResult && isSelected && !isCorrectOption && (
                              <XCircle className="h-4 w-4 mr-2" />
                            )}
                            {option}
                          </Button>
                        );
                      })}
                    </div>
                    {showResult && (
                      <p className={`mt-3 text-sm ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                        {isCorrect ? '✓ Correct!' : `✗ The correct answer was: ${q.options[q.correctIndex]}`}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">{currentSlide.title}</h2>
            <p className="text-lg">{currentSlide.content?.text}</p>
          </div>
        );
    }
  };

  const { totalQuestions, correctAnswers } = calculateScore();
  const timeSpent = Math.floor((Date.now() - startTime) / 1000);

  return (
    <>
      <div className="fixed inset-0 z-50 bg-background flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-semibold">{lessonTitle}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Slide {currentSlideIndex + 1} of {slides.length}</span>
                <Badge variant="outline">{currentSlide?.slide_type}</Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Progress value={progress} className="w-32 h-2" />
            <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlideIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {renderSlideContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between p-4 border-t bg-muted/30">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentSlideIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex items-center gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlideIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentSlideIndex
                    ? 'bg-primary w-4'
                    : index < currentSlideIndex
                    ? 'bg-primary/50'
                    : 'bg-muted-foreground/30'
                }`}
              />
            ))}
          </div>

          <Button onClick={handleNext}>
            {currentSlideIndex === slides.length - 1 ? (
              <>
                Complete Lesson
                <CheckCircle className="h-4 w-4 ml-2" />
              </>
            ) : (
              <>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>

      <LessonCompletionModal
        isOpen={showCompletionModal}
        onClose={() => {
          setShowCompletionModal(false);
          onClose();
        }}
        onNextLesson={onComplete}
        lessonTitle={lessonTitle}
        score={finalScore}
        xpEarned={xpReward}
        timeSpent={timeSpent}
        totalQuestions={totalQuestions}
        correctAnswers={correctAnswers}
      />
    </>
  );
};
