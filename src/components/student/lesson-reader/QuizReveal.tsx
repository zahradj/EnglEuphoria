import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, CheckCircle, XCircle, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MasteryBadge } from '@/components/content-creator/MasteryBadge';
import { useStudentSkills } from '@/hooks/useStudentSkills';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface QuizRevealProps {
  lessonId: string;
  questions: QuizQuestion[];
  visible: boolean;
  track: 'kids' | 'teens' | 'adults';
}

export const QuizReveal: React.FC<QuizRevealProps> = ({
  lessonId,
  questions,
  visible,
  track,
}) => {
  const [started, setStarted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(questions.length).fill(null));
  const [showResult, setShowResult] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [shakingOption, setShakingOption] = useState<number | null>(null);
  const { refresh, incrementSkill } = useStudentSkills();

  const handleStart = () => {
    confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
    setStarted(true);
  };

  const handleAnswer = (optionIdx: number) => {
    if (showResult) return;

    const newAnswers = [...answers];
    newAnswers[currentQ] = optionIdx;
    setAnswers(newAnswers);
    setShowResult(true);

    if (optionIdx !== questions[currentQ].correctIndex) {
      setShakingOption(optionIdx);
      setTimeout(() => setShakingOption(null), 500);
    }
  };

  const handleNext = () => {
    setShowResult(false);
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    const correct = answers.filter((a, i) => a === questions[i].correctIndex).length;
    const score = Math.round((correct / questions.length) * 100);

    setCompleted(true);

    if (score >= 60) {
      confetti({ particleCount: 150, spread: 100, origin: { y: 0.5 } });
      // Update skill radar
      try {
        await incrementSkill('grammar_accuracy', 0.3);
        await incrementSkill('professional_vocabulary', 0.2);
        refresh();
      } catch (e) {
        console.error('Skill update error:', e);
      }
    }
  };

  const correctCount = answers.filter((a, i) => a === questions[i].correctIndex).length;
  const score = Math.round((correctCount / questions.length) * 100);

  if (!visible || questions.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 80 }}
      className="mt-12"
    >
      {!started ? (
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="text-center py-12"
        >
          <Sparkles className="w-10 h-10 mx-auto mb-4 text-primary animate-pulse" />
          <h2 className="text-2xl font-bold text-foreground mb-2">You've finished the lesson!</h2>
          <p className="text-muted-foreground mb-6">Challenge the quiz to earn XP</p>
          <Button size="lg" onClick={handleStart} className="rounded-xl gap-2 text-base px-8">
            <Trophy className="w-5 h-5" />
            Start Quiz (+10 XP)
          </Button>
        </motion.div>
      ) : completed ? (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center py-12"
        >
          <MasteryBadge size="lg" />
          <h2 className="text-2xl font-bold text-foreground mt-6 mb-2">
            {score >= 80 ? '🎉 Mastery Achieved!' : score >= 60 ? '✨ Well Done!' : '💪 Keep Practicing!'}
          </h2>
          <p className="text-lg text-muted-foreground mb-2">
            Score: {correctCount}/{questions.length} ({score}%)
          </p>
          <p className="text-sm text-primary animate-pulse">Your Skill Radar has been updated</p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground">
              Question {currentQ + 1} of {questions.length}
            </span>
            <div className="flex gap-1">
              {questions.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'w-2 h-2 rounded-full transition-colors',
                    i === currentQ ? 'bg-primary' :
                    answers[i] !== null
                      ? answers[i] === questions[i].correctIndex ? 'bg-emerald-500' : 'bg-red-400'
                      : 'bg-muted'
                  )}
                />
              ))}
            </div>
          </div>

          <h3 className="text-lg font-semibold text-foreground mb-4">
            {questions[currentQ].question}
          </h3>

          <div className="grid grid-cols-1 gap-3">
            <AnimatePresence mode="wait">
              {questions[currentQ].options.map((opt, idx) => {
                const isSelected = answers[currentQ] === idx;
                const isCorrect = idx === questions[currentQ].correctIndex;
                const showFeedback = showResult && (isSelected || isCorrect);

                return (
                  <motion.button
                    key={idx}
                    layout
                    animate={shakingOption === idx ? { x: [0, -8, 8, -8, 0] } : {}}
                    transition={{ duration: 0.4 }}
                    onClick={() => handleAnswer(idx)}
                    disabled={showResult}
                    className={cn(
                      'w-full text-left p-4 rounded-xl border-2 transition-all',
                      'backdrop-blur-sm bg-card/50',
                      showFeedback && isCorrect && 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.2)]',
                      showFeedback && isSelected && !isCorrect && 'border-red-400 bg-red-400/10',
                      !showResult && 'border-border/40 hover:border-primary/50 hover:bg-primary/5 cursor-pointer',
                      showResult && !showFeedback && 'border-border/20 opacity-50'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border',
                        showFeedback && isCorrect ? 'border-emerald-500 text-emerald-500' :
                        showFeedback && isSelected ? 'border-red-400 text-red-400' :
                        'border-muted-foreground/30 text-muted-foreground'
                      )}>
                        {showFeedback && isCorrect ? <CheckCircle className="w-4 h-4" /> :
                         showFeedback && isSelected ? <XCircle className="w-4 h-4" /> :
                         String.fromCharCode(65 + idx)}
                      </span>
                      <span className="text-sm text-foreground">{opt}</span>
                    </div>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>

          {showResult && questions[currentQ].explanation && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-muted-foreground bg-muted/50 rounded-xl p-3 mt-3"
            >
              💡 {questions[currentQ].explanation}
            </motion.p>
          )}

          {showResult && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-end mt-4">
              <Button onClick={handleNext} className="rounded-xl">
                {currentQ < questions.length - 1 ? 'Next Question' : 'See Results'}
              </Button>
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );
};
