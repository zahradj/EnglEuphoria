import React, { useState, useEffect } from 'react';
import { QuizSlideRenderer } from '@/components/classroom/shared/QuizSlideRenderer';
import { quizService } from '@/services/quizService';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle, XCircle, Loader2, Lock, Eye, Play } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';

interface QuizOptionData {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface StudentQuizViewProps {
  sessionId: string;
  slideId: string;
  question: string;
  options: QuizOptionData[];
  studentId: string;
  studentName: string;
  quizActive: boolean;
  quizLocked: boolean;
  quizRevealAnswer: boolean;
}

export const StudentQuizView: React.FC<StudentQuizViewProps> = ({
  sessionId,
  slideId,
  question,
  options,
  studentId,
  studentName,
  quizActive,
  quizLocked,
  quizRevealAnswer
}) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime] = useState<number>(Date.now());

  // Reset state when slide changes
  useEffect(() => {
    setSelectedOptionId(null);
    setHasSubmitted(false);
  }, [slideId]);

  // Trigger confetti on correct answer reveal
  useEffect(() => {
    if (quizRevealAnswer && selectedOptionId) {
      const selectedOption = options.find(o => o.id === selectedOptionId);
      if (selectedOption?.isCorrect) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }
  }, [quizRevealAnswer, selectedOptionId, options]);

  const handleSelectOption = async (optionId: string) => {
    if (hasSubmitted || !quizActive || quizLocked || isSubmitting) return;

    setSelectedOptionId(optionId);
    setIsSubmitting(true);

    const responseTimeMs = Date.now() - startTime;
    const selectedOption = options.find(o => o.id === optionId);
    const isCorrect = selectedOption?.isCorrect ?? false;

    await quizService.submitAnswer(
      sessionId,
      slideId,
      studentId,
      studentName,
      optionId,
      isCorrect,
      responseTimeMs
    );

    setHasSubmitted(true);
    setIsSubmitting(false);
  };

  const isDisabled = !quizActive || quizLocked || hasSubmitted || isSubmitting;

  // Waiting for quiz to start
  if (!quizActive && !quizRevealAnswer) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-background to-muted/30">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Quiz Coming Up!
          </h3>
          <p className="text-muted-foreground">
            Waiting for teacher to start the quiz...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* Live status strip — mirrors teacher's QuizControlPanel */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-card/95 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-lg border border-border">
        <Badge
          variant={quizActive && !quizLocked ? 'default' : 'secondary'}
          className={cn(
            'text-xs',
            quizActive && !quizLocked && 'bg-emerald-500 hover:bg-emerald-600'
          )}
        >
          {quizLocked ? (
            <><Lock className="h-3 w-3 mr-1" /> Locked</>
          ) : quizActive ? (
            <><span className="inline-block h-1.5 w-1.5 rounded-full bg-white mr-1 animate-pulse" /> Live Quiz</>
          ) : (
            <><Play className="h-3 w-3 mr-1" /> Standby</>
          )}
        </Badge>
        {hasSubmitted && !quizRevealAnswer && (
          <Badge variant="outline" className="text-xs flex items-center gap-1 border-emerald-300 text-emerald-700">
            <CheckCircle className="h-3 w-3" /> Submitted
          </Badge>
        )}
        {quizRevealAnswer && (
          <Badge variant="outline" className="text-xs flex items-center gap-1">
            <Eye className="h-3 w-3" /> Answer Revealed
          </Badge>
        )}
      </div>

      <QuizSlideRenderer
        question={question}
        options={options}
        selectedOptionId={selectedOptionId}
        showResult={quizRevealAnswer}
        disabled={isDisabled}
        onSelectOption={handleSelectOption}
      />

      {/* Submission Overlay */}
      <AnimatePresence>
        {isSubmitting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center"
          >
            <div className="flex items-center gap-3 text-primary">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="font-medium">Submitting...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result Feedback */}
      <AnimatePresence>
        {quizRevealAnswer && selectedOptionId && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            {options.find(o => o.id === selectedOptionId)?.isCorrect ? (
              <div className="flex items-center gap-2 bg-green-500/90 text-white px-6 py-3 rounded-full shadow-lg">
                <CheckCircle className="h-5 w-5" />
                <span className="font-semibold">Correct! Great job!</span>
              </div>
            ) : (
              <motion.div 
                animate={{ x: [0, -5, 5, -5, 5, 0] }}
                transition={{ duration: 0.5 }}
                className="flex items-center gap-2 bg-red-500/90 text-white px-6 py-3 rounded-full shadow-lg"
              >
                <XCircle className="h-5 w-5" />
                <span className="font-semibold">Not quite. Keep learning!</span>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
