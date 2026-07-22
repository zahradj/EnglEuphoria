import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, Star, Zap, ChevronRight, 
  CheckCircle, Target, Clock 
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface LessonCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNextLesson?: () => void;
  lessonTitle: string;
  score: number;
  xpEarned: number;
  timeSpent: number;
  totalQuestions: number;
  correctAnswers: number;
  achievements?: Array<{
    id: string;
    name: string;
    icon: string;
    xp_reward: number;
  }>;
}

export const LessonCompletionModal: React.FC<LessonCompletionModalProps> = ({
  isOpen,
  onClose,
  onNextLesson,
  lessonTitle,
  score,
  xpEarned,
  timeSpent,
  totalQuestions,
  correctAnswers,
  achievements = [],
}) => {
  React.useEffect(() => {
    if (isOpen && score >= 70) {
      // Trigger confetti for good scores
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FFA500', '#FF6B6B', '#4ECDC4', '#45B7D1'],
      });
    }
  }, [isOpen, score]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreMessage = () => {
    if (score >= 90) return { text: 'Outstanding! 🌟', color: 'text-yellow-500' };
    if (score >= 80) return { text: 'Excellent! 🎉', color: 'text-green-500' };
    if (score >= 70) return { text: 'Great job! 👍', color: 'text-blue-500' };
    if (score >= 50) return { text: 'Good effort! 💪', color: 'text-orange-500' };
    return { text: 'Keep practicing! 📚', color: 'text-muted-foreground' };
  };

  const scoreInfo = getScoreMessage();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative"
            >
              {/* Header with gradient */}
              <div className="bg-gradient-to-br from-primary to-primary/80 p-6 text-primary-foreground text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                >
                  <Trophy className="h-16 w-16 mx-auto mb-4" />
                </motion.div>
                <h2 className="text-2xl font-bold mb-2">Lesson Complete!</h2>
                <p className="opacity-90">{lessonTitle}</p>
              </div>

              {/* Score Section */}
              <div className="p-6 space-y-6">
                {/* Main Score */}
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: 'spring' }}
                    className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 mb-4"
                  >
                    <span className="text-4xl font-bold text-primary">{score}%</span>
                  </motion.div>
                  <p className={`text-xl font-semibold ${scoreInfo.color}`}>
                    {scoreInfo.text}
                  </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-center gap-1 text-yellow-500 mb-1">
                      <Zap className="h-4 w-4" />
                      <span className="font-bold">{xpEarned}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">XP Earned</p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-center gap-1 text-green-500 mb-1">
                      <CheckCircle className="h-4 w-4" />
                      <span className="font-bold">{correctAnswers}/{totalQuestions}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Correct</p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-center gap-1 text-blue-500 mb-1">
                      <Clock className="h-4 w-4" />
                      <span className="font-bold">{formatTime(timeSpent)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Time</p>
                  </div>
                </div>

                {/* Achievements Unlocked */}
                {achievements.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      Achievements Unlocked!
                    </h3>
                    <div className="space-y-2">
                      {achievements.map((achievement, index) => (
                        <motion.div
                          key={achievement.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 + index * 0.1 }}
                          className="flex items-center gap-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg"
                        >
                          <span className="text-2xl">{achievement.icon}</span>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{achievement.name}</p>
                            <p className="text-xs text-muted-foreground">
                              +{achievement.xp_reward} XP
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button variant="outline" onClick={onClose} className="flex-1">
                    Review Lesson
                  </Button>
                  {onNextLesson && (
                    <Button onClick={onNextLesson} className="flex-1">
                      Next Lesson
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};
