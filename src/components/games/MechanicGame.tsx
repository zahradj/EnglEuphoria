import React, { useState } from 'react';
import { MechanicGame as MechanicGameType, TargetGroup, GameResult } from '@/types/ironLMS';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, ArrowRight, RotateCcw, Star, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface MechanicGameProps {
  game: MechanicGameType;
  targetGroup: TargetGroup;
  onComplete?: (result: GameResult) => void;
  onProgress?: (current: number, total: number) => void;
}

export function MechanicGame({ game, targetGroup, onComplete, onProgress }: MechanicGameProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [answers, setAnswers] = useState<boolean[]>([]);

  const currentQuestion = game.questions[currentIndex];
  const isCorrect = selectedOption === currentQuestion?.correctIndex;
  const totalQuestions = game.questions.length;

  // Style variants based on target group
  const styles = getStyles(targetGroup);

  const handleOptionClick = (optionIndex: number) => {
    if (showFeedback) return;
    
    setSelectedOption(optionIndex);
    setShowFeedback(true);
    
    const correct = optionIndex === currentQuestion.correctIndex;
    if (correct) {
      setScore(prev => prev + 1);
    }
    setAnswers(prev => [...prev, correct]);
  };

  const handleNext = () => {
    const nextIndex = currentIndex + 1;
    
    if (nextIndex >= totalQuestions) {
      setIsComplete(true);
      onComplete?.({
        score,
        maxScore: totalQuestions,
        correctAnswers: score,
        totalQuestions
      });
    } else {
      setCurrentIndex(nextIndex);
      setSelectedOption(null);
      setShowFeedback(false);
      onProgress?.(nextIndex + 1, totalQuestions);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setShowFeedback(false);
    setScore(0);
    setIsComplete(false);
    setAnswers([]);
    onProgress?.(1, totalQuestions);
  };

  if (isComplete) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn("text-center py-8 px-6 rounded-2xl", styles.completeBg)}
      >
        <div className="mb-4">
          {targetGroup === 'playground' ? (
            <span className="text-6xl">🎉</span>
          ) : (
            <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
          )}
        </div>
        <h3 className={cn("text-2xl font-bold mb-2", styles.completeTitle)}>
          {targetGroup === 'playground' ? '🌟 Amazing Job! 🌟' : 
           targetGroup === 'academy' ? 'Great Work!' : 'Exercise Complete'}
        </h3>
        <p className="text-lg text-muted-foreground mb-4">
          You scored <span className="font-bold text-primary">{score}</span> out of{' '}
          <span className="font-bold">{totalQuestions}</span>
        </p>
        <div className="flex justify-center gap-4 mb-6">
          {[...Array(totalQuestions)].map((_, idx) => (
            <div 
              key={idx}
              className={cn(
                "w-3 h-3 rounded-full",
                answers[idx] ? "bg-green-500" : "bg-red-400"
              )}
            />
          ))}
        </div>
        <Button onClick={handleRestart} className={styles.button}>
          <RotateCcw className="h-4 w-4 mr-2" />
          {targetGroup === 'playground' ? 'Play Again! 🚀' : 'Try Again'}
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with progress */}
      <div className="flex items-center justify-between">
        <h3 className={cn("text-xl font-bold", styles.title)}>
          {targetGroup === 'playground' && '🎮 '}{game.title}
        </h3>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1}/{totalQuestions}
          </span>
          <div className="flex items-center gap-1">
            {targetGroup === 'playground' ? (
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            ) : (
              <Zap className="h-5 w-5 text-primary" />
            )}
            <span className="font-bold">{score}</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div 
          className={cn("h-full", styles.progressBar)}
          initial={{ width: 0 }}
          animate={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-6"
        >
          <div className={cn("p-6 rounded-xl", styles.questionBg)}>
            <p className={cn("text-lg font-medium", styles.questionText)}>
              {currentQuestion.query}
            </p>
          </div>

          {/* Options */}
          <div className="grid gap-3">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrectOption = idx === currentQuestion.correctIndex;
              
              let optionStyle = styles.optionDefault;
              if (showFeedback) {
                if (isCorrectOption) {
                  optionStyle = styles.optionCorrect;
                } else if (isSelected && !isCorrectOption) {
                  optionStyle = styles.optionIncorrect;
                }
              } else if (isSelected) {
                optionStyle = styles.optionSelected;
              }

              return (
                <motion.button
                  key={idx}
                  whileHover={!showFeedback ? { scale: 1.02 } : {}}
                  whileTap={!showFeedback ? { scale: 0.98 } : {}}
                  onClick={() => handleOptionClick(idx)}
                  disabled={showFeedback}
                  className={cn(
                    "w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3",
                    optionStyle
                  )}
                >
                  <span className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                    showFeedback && isCorrectOption ? "bg-green-500 text-white" :
                    showFeedback && isSelected && !isCorrectOption ? "bg-red-400 text-white" :
                    "bg-muted"
                  )}>
                    {showFeedback && isCorrectOption ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : showFeedback && isSelected && !isCorrectOption ? (
                      <XCircle className="h-5 w-5" />
                    ) : (
                      String.fromCharCode(65 + idx)
                    )}
                  </span>
                  <span className="flex-1">{option}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Feedback */}
          <AnimatePresence>
            {showFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={cn(
                  "p-4 rounded-xl",
                  isCorrect ? styles.feedbackCorrect : styles.feedbackIncorrect
                )}
              >
                <div className="flex items-start gap-3">
                  {isCorrect ? (
                    targetGroup === 'playground' ? (
                      <span className="text-2xl">🎉</span>
                    ) : (
                      <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                    )
                  ) : (
                    targetGroup === 'playground' ? (
                      <span className="text-2xl">💪</span>
                    ) : (
                      <XCircle className="h-6 w-6 text-red-500 flex-shrink-0" />
                    )
                  )}
                  <p className="text-sm">{currentQuestion.feedback}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Next button */}
          {showFeedback && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center"
            >
              <Button onClick={handleNext} className={styles.button}>
                {currentIndex + 1 >= totalQuestions ? (
                  targetGroup === 'playground' ? '🏆 See Results!' : 'See Results'
                ) : (
                  <>
                    {targetGroup === 'playground' ? 'Next! 🚀' : 'Next Question'}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function getStyles(group: TargetGroup) {
  switch (group) {
    case 'playground':
      return {
        title: 'text-orange-600',
        progressBar: 'bg-gradient-to-r from-orange-400 to-pink-500',
        questionBg: 'bg-gradient-to-br from-orange-50 to-pink-50 border border-orange-200',
        questionText: 'text-foreground',
        optionDefault: 'bg-card border-border hover:border-orange-300 hover:bg-orange-50',
        optionSelected: 'bg-orange-100 border-orange-400',
        optionCorrect: 'bg-green-100 border-green-500 text-green-800',
        optionIncorrect: 'bg-red-100 border-red-400 text-red-800',
        feedbackCorrect: 'bg-green-100 text-green-800 border border-green-300',
        feedbackIncorrect: 'bg-orange-100 text-orange-800 border border-orange-300',
        button: 'bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white',
        completeBg: 'bg-gradient-to-br from-orange-100 to-pink-100',
        completeTitle: 'text-orange-600'
      };
    case 'academy':
      return {
        title: 'text-purple-600',
        progressBar: 'bg-gradient-to-r from-purple-500 to-blue-500',
        questionBg: 'bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200',
        questionText: 'text-foreground',
        optionDefault: 'bg-card border-border hover:border-purple-300 hover:bg-purple-50',
        optionSelected: 'bg-purple-100 border-purple-400',
        optionCorrect: 'bg-green-100 border-green-500 text-green-800',
        optionIncorrect: 'bg-red-100 border-red-400 text-red-800',
        feedbackCorrect: 'bg-green-100 text-green-800 border border-green-300',
        feedbackIncorrect: 'bg-amber-100 text-amber-800 border border-amber-300',
        button: 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white',
        completeBg: 'bg-gradient-to-br from-purple-100 to-blue-100',
        completeTitle: 'text-purple-600'
      };
    default: // hub
      return {
        title: 'text-foreground',
        progressBar: 'bg-primary',
        questionBg: 'bg-muted/50 border border-border',
        questionText: 'text-foreground',
        optionDefault: 'bg-card border-border hover:border-primary/50',
        optionSelected: 'bg-primary/10 border-primary',
        optionCorrect: 'bg-green-100 border-green-500 text-green-800',
        optionIncorrect: 'bg-red-100 border-red-400 text-red-800',
        feedbackCorrect: 'bg-green-50 text-green-800 border border-green-200',
        feedbackIncorrect: 'bg-red-50 text-red-800 border border-red-200',
        button: 'bg-primary hover:bg-primary/90 text-primary-foreground',
        completeBg: 'bg-muted',
        completeTitle: 'text-foreground'
      };
  }
}
