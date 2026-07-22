import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Check, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface ProducePhaseSlideProps {
  imageUrl?: string;
  targetWord: string;
  options?: string[];
  mode?: 'type' | 'select';
  onComplete?: (correct: boolean) => void;
}

export const ProducePhaseSlide: React.FC<ProducePhaseSlideProps> = ({
  imageUrl,
  targetWord,
  options = [],
  mode = 'type',
  onComplete,
}) => {
  const [userAnswer, setUserAnswer] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [blurLevel, setBlurLevel] = useState(20);

  const checkAnswer = (answer: string) => {
    const correct = answer.trim().toLowerCase() === targetWord.toLowerCase();
    setIsCorrect(correct);
    if (correct) {
      setBlurLevel(0);
      setRevealed(true);
    }
    onComplete?.(correct);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    checkAnswer(userAnswer);
  };

  const reset = () => {
    setUserAnswer('');
    setIsCorrect(null);
    setRevealed(false);
    setBlurLevel(20);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 bg-gradient-to-b from-purple-50 to-white dark:from-purple-950/20 dark:to-background">
      {/* Phase Badge */}
      <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-semibold">
        🧠 Produce Phase — Active Recall
      </div>

      {/* Mystery Image (blurred/silhouette) */}
      <motion.div
        className={cn(
          'w-72 h-72 rounded-3xl border-4 overflow-hidden mb-6 transition-all duration-700',
          isCorrect === true ? 'border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.4)]' :
          isCorrect === false ? 'border-red-400' : 'border-muted'
        )}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt=""
            className="w-full h-full object-contain bg-white transition-all duration-700"
            style={{ filter: `blur(${blurLevel}px) grayscale(${revealed ? 0 : 0.8})` }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            {revealed ? <Eye className="h-16 w-16 text-green-500" /> : <EyeOff className="h-16 w-16 text-muted-foreground/30" />}
          </div>
        )}
      </motion.div>

      <p className="text-lg text-muted-foreground mb-4">
        {revealed ? '✨ Great job!' : 'What is this? Think carefully...'}
      </p>

      <AnimatePresence mode="wait">
        {!revealed ? (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full max-w-xs"
          >
            {mode === 'type' ? (
              <form onSubmit={handleSubmit} className="space-y-3">
                <Input
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Type the word..."
                  className={cn(
                    'text-center text-xl h-14',
                    isCorrect === false && 'border-red-400 ring-1 ring-red-200'
                  )}
                  autoFocus
                />
                <Button type="submit" className="w-full gap-2" disabled={!userAnswer.trim()}>
                  <Check className="h-4 w-4" /> Check Answer
                </Button>
                {isCorrect === false && (
                  <p className="text-sm text-red-500 text-center">Not quite — try again!</p>
                )}
              </form>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {options.map((opt) => (
                  <Button
                    key={opt}
                    variant="outline"
                    className="h-14 text-lg"
                    onClick={() => checkAnswer(opt)}
                  >
                    {opt}
                  </Button>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-3"
          >
            <div className="text-4xl font-bold text-green-600">{targetWord}</div>
            <Button variant="outline" onClick={reset} className="gap-2">
              <RotateCcw className="h-4 w-4" /> Practice Again
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
