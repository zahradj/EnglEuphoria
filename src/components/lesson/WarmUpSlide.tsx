import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Music, Hand } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WarmUpSlideProps {
  songTitle?: string;
  onComplete?: () => void;
}

export const WarmUpSlide: React.FC<WarmUpSlideProps> = ({
  songTitle = 'Hello Chant',
  onComplete,
}) => {
  const [taps, setTaps] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const TARGET_TAPS = 8;

  const handleTap = useCallback(() => {
    setTaps((prev) => {
      const next = prev + 1;
      if (next >= TARGET_TAPS) {
        onComplete?.();
      }
      return next;
    });
  }, [onComplete]);

  useEffect(() => {
    const timer = setTimeout(() => setIsActive(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const progress = Math.min((taps / TARGET_TAPS) * 100, 100);

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 bg-gradient-to-b from-amber-50 to-white dark:from-amber-950/20 dark:to-background">
      {/* Phase Badge */}
      <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-sm font-semibold">
        🎵 Warm-Up — {songTitle}
      </div>

      {/* Animated music icon */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0],
        }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="mb-8"
      >
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-2xl">
          <Music className="h-16 w-16 text-white" />
        </div>
      </motion.div>

      <h2 className="text-2xl font-bold mb-2 text-foreground">Tap the Beat! 🥁</h2>
      <p className="text-muted-foreground mb-6">Tap along to unlock the lesson</p>

      {/* Tap area */}
      <motion.button
        onClick={handleTap}
        whileTap={{ scale: 0.9 }}
        className={cn(
          'w-40 h-40 rounded-full flex items-center justify-center transition-all shadow-lg',
          taps >= TARGET_TAPS
            ? 'bg-green-500'
            : 'bg-gradient-to-br from-amber-400 to-pink-500 hover:from-amber-500 hover:to-pink-600'
        )}
      >
        {taps >= TARGET_TAPS ? (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-4xl"
          >
            🎉
          </motion.span>
        ) : (
          <Hand className="h-12 w-12 text-white" />
        )}
      </motion.button>

      {/* Progress dots */}
      <div className="flex gap-2 mt-6">
        {Array.from({ length: TARGET_TAPS }).map((_, i) => (
          <motion.div
            key={i}
            className={cn(
              'w-4 h-4 rounded-full transition-all',
              i < taps ? 'bg-amber-500 scale-110' : 'bg-muted'
            )}
            animate={i < taps ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div className="w-64 h-2 bg-muted rounded-full mt-4 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-amber-400 to-green-500 rounded-full"
          animate={{ width: `${progress}%` }}
          transition={{ type: 'spring', stiffness: 30 }}
        />
      </div>
    </div>
  );
};
