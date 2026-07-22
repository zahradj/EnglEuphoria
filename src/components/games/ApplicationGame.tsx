import React, { useState } from 'react';
import { ApplicationGame as ApplicationGameType, TargetGroup, GameResult } from '@/types/ironLMS';
import { Button } from '@/components/ui/button';
import { MessageCircle, CheckCircle, RotateCcw, Star, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface ApplicationGameProps {
  game: ApplicationGameType;
  targetGroup: TargetGroup;
  onComplete?: (result: GameResult) => void;
}

export function ApplicationGame({ game, targetGroup, onComplete }: ApplicationGameProps) {
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const styles = getStyles(targetGroup);
  const maxScore = Math.max(...game.choices.map(c => c.score));
  const selectedData = selectedChoice !== null ? game.choices[selectedChoice] : null;

  const handleChoiceClick = (idx: number) => {
    if (showFeedback) return;
    
    setSelectedChoice(idx);
    setShowFeedback(true);
    setIsComplete(true);
    
    const choice = game.choices[idx];
    onComplete?.({
      score: choice.score,
      maxScore
    });
  };

  const handleRestart = () => {
    setSelectedChoice(null);
    setShowFeedback(false);
    setIsComplete(false);
  };

  const getScoreStars = (score: number, max: number) => {
    return Array.from({ length: max }, (_, i) => i < score);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <MessageCircle className={cn("h-6 w-6", styles.icon)} />
        <h3 className={cn("text-xl font-bold", styles.title)}>
          {targetGroup === 'playground' && '🎭 '}{game.title}
        </h3>
      </div>

      {/* Scenario */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn("p-6 rounded-xl", styles.scenarioBg)}
      >
        <div className="flex items-start gap-3">
          {targetGroup === 'playground' && <span className="text-3xl">🎬</span>}
          <div>
            <p className="text-sm text-muted-foreground mb-2 uppercase tracking-wide font-medium">
              {targetGroup === 'playground' ? '📍 The Scene:' : 'Scenario:'}
            </p>
            <p className={cn("text-lg", styles.scenarioText)}>
              {game.scenario}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Choices */}
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium">
          {targetGroup === 'playground' ? '💬 What do you say?' : 'Choose your response:'}
        </p>
        
        {game.choices.map((choice, idx) => {
          const isSelected = selectedChoice === idx;
          const isBestChoice = choice.isCorrect;
          
          let choiceStyle = styles.choiceDefault;
          if (showFeedback) {
            if (isBestChoice) {
              choiceStyle = styles.choiceBest;
            } else if (isSelected && !isBestChoice) {
              choiceStyle = styles.choiceSelected;
            } else {
              choiceStyle = styles.choiceFaded;
            }
          }

          return (
            <motion.button
              key={idx}
              whileHover={!showFeedback ? { scale: 1.01 } : {}}
              whileTap={!showFeedback ? { scale: 0.99 } : {}}
              onClick={() => handleChoiceClick(idx)}
              disabled={showFeedback}
              className={cn(
                "w-full p-4 rounded-xl border-2 text-left transition-all",
                choiceStyle
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="flex-1">"{choice.text}"</p>
                {showFeedback && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {getScoreStars(choice.score, maxScore).map((filled, i) => (
                      <Star 
                        key={i}
                        className={cn(
                          "h-4 w-4",
                          filled 
                            ? "text-yellow-500 fill-yellow-500" 
                            : "text-muted-foreground/30"
                        )}
                      />
                    ))}
                  </div>
                )}
              </div>
              
              {showFeedback && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3 pt-3 border-t border-current/10"
                >
                  <div className="flex items-start gap-2">
                    {isBestChoice ? (
                      targetGroup === 'playground' ? (
                        <span>🌟</span>
                      ) : (
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      )
                    ) : (
                      targetGroup === 'playground' ? (
                        <span>💡</span>
                      ) : (
                        <Award className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      )
                    )}
                    <p className="text-sm">{choice.response}</p>
                  </div>
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Result summary */}
      <AnimatePresence>
        {isComplete && selectedData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={cn(
              "p-5 rounded-xl text-center",
              selectedData.isCorrect ? styles.resultBest : styles.resultOther
            )}
          >
            <div className="mb-3">
              {selectedData.isCorrect ? (
                targetGroup === 'playground' ? (
                  <span className="text-4xl">🏆</span>
                ) : (
                  <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
                )
              ) : (
                targetGroup === 'playground' ? (
                  <span className="text-4xl">💪</span>
                ) : (
                  <Award className="h-12 w-12 mx-auto text-muted-foreground" />
                )
              )}
            </div>
            <h4 className="text-lg font-bold mb-2">
              {selectedData.isCorrect 
                ? (targetGroup === 'playground' ? 'Perfect Response! 🎉' : 'Excellent Choice!')
                : (targetGroup === 'playground' ? 'Good Try! 💫' : 'Not quite, but good effort!')
              }
            </h4>
            <p className="text-muted-foreground mb-4">
              You scored <span className="font-bold">{selectedData.score}</span> out of{' '}
              <span className="font-bold">{maxScore}</span> points
            </p>
            <Button onClick={handleRestart} className={styles.button}>
              <RotateCcw className="h-4 w-4 mr-2" />
              {targetGroup === 'playground' ? 'Try Again! 🚀' : 'Try Another Response'}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function getStyles(group: TargetGroup) {
  switch (group) {
    case 'playground':
      return {
        icon: 'text-pink-500',
        title: 'text-pink-600',
        scenarioBg: 'bg-gradient-to-br from-pink-50 to-purple-50 border-2 border-pink-200',
        scenarioText: 'text-foreground',
        choiceDefault: 'bg-card border-border hover:border-pink-300 hover:bg-pink-50',
        choiceBest: 'bg-green-100 border-green-500 text-green-800',
        choiceSelected: 'bg-orange-100 border-orange-400 text-orange-800',
        choiceFaded: 'bg-muted/50 border-muted text-muted-foreground',
        resultBest: 'bg-gradient-to-br from-green-100 to-emerald-100 border border-green-300',
        resultOther: 'bg-gradient-to-br from-orange-100 to-yellow-100 border border-orange-300',
        button: 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white'
      };
    case 'academy':
      return {
        icon: 'text-blue-500',
        title: 'text-blue-600',
        scenarioBg: 'bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200',
        scenarioText: 'text-foreground',
        choiceDefault: 'bg-card border-border hover:border-blue-300 hover:bg-blue-50',
        choiceBest: 'bg-green-100 border-green-500 text-green-800',
        choiceSelected: 'bg-amber-100 border-amber-400 text-amber-800',
        choiceFaded: 'bg-muted/50 border-muted text-muted-foreground',
        resultBest: 'bg-gradient-to-br from-green-100 to-emerald-100 border border-green-300',
        resultOther: 'bg-gradient-to-br from-amber-100 to-yellow-100 border border-amber-300',
        button: 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white'
      };
    default: // hub
      return {
        icon: 'text-primary',
        title: 'text-foreground',
        scenarioBg: 'bg-muted/50 border border-border',
        scenarioText: 'text-foreground',
        choiceDefault: 'bg-card border-border hover:border-primary/50',
        choiceBest: 'bg-green-100 border-green-500 text-green-800',
        choiceSelected: 'bg-amber-100 border-amber-400 text-amber-800',
        choiceFaded: 'bg-muted/50 border-muted text-muted-foreground',
        resultBest: 'bg-green-50 border border-green-200',
        resultOther: 'bg-amber-50 border border-amber-200',
        button: 'bg-primary hover:bg-primary/90 text-primary-foreground'
      };
  }
}
