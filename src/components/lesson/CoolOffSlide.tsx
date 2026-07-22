import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Wind, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CoolOffSlideProps {
  mode?: 'breathing' | 'bubbles';
  onComplete?: () => void;
}

export const CoolOffSlide: React.FC<CoolOffSlideProps> = ({
  mode = 'breathing',
  onComplete,
}) => {
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [cycles, setCycles] = useState(0);
  const [bubbles, setBubbles] = useState<Array<{ id: number; x: number; y: number; size: number; popped: boolean }>>([]);
  const TARGET_CYCLES = 3;
  const TARGET_BUBBLES = 10;

  // Breathing mode
  useEffect(() => {
    if (mode !== 'breathing') return;

    const phases: Array<{ phase: typeof breathPhase; duration: number }> = [
      { phase: 'inhale', duration: 3000 },
      { phase: 'hold', duration: 2000 },
      { phase: 'exhale', duration: 4000 },
    ];

    let phaseIndex = 0;
    const runPhase = () => {
      const current = phases[phaseIndex % phases.length];
      setBreathPhase(current.phase);

      if (current.phase === 'exhale') {
        setCycles((prev) => {
          const next = prev + 1;
          if (next >= TARGET_CYCLES) onComplete?.();
          return next;
        });
      }

      phaseIndex++;
    };

    runPhase();
    let timeout: NodeJS.Timeout;
    const schedule = () => {
      const current = phases[(phaseIndex - 1) % phases.length];
      timeout = setTimeout(() => {
        runPhase();
        schedule();
      }, current.duration);
    };
    schedule();

    return () => clearTimeout(timeout);
  }, [mode, onComplete]);

  // Bubble mode
  useEffect(() => {
    if (mode !== 'bubbles') return;
    const newBubbles = Array.from({ length: TARGET_BUBBLES }, (_, i) => ({
      id: i,
      x: Math.random() * 80 + 10,
      y: Math.random() * 60 + 20,
      size: Math.random() * 30 + 30,
      popped: false,
    }));
    setBubbles(newBubbles);
  }, [mode]);

  const popBubble = (id: number) => {
    setBubbles((prev) => {
      const updated = prev.map(b => b.id === id ? { ...b, popped: true } : b);
      if (updated.every(b => b.popped)) onComplete?.();
      return updated;
    });
  };

  if (mode === 'bubbles') {
    return (
      <div className="relative flex flex-col items-center justify-center h-full p-8 bg-gradient-to-b from-teal-50 to-white dark:from-teal-950/20 dark:to-background overflow-hidden">
        <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 text-sm font-semibold">
          🧊 Cool-Off — Pop the Bubbles!
        </div>

        {bubbles.map((bubble) => !bubble.popped && (
          <motion.button
            key={bubble.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1, y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: bubble.id * 0.2 }}
            onClick={() => popBubble(bubble.id)}
            className="absolute rounded-full bg-gradient-to-br from-teal-300 to-cyan-400 opacity-80 hover:opacity-100 cursor-pointer shadow-lg"
            style={{
              left: `${bubble.x}%`,
              top: `${bubble.y}%`,
              width: bubble.size,
              height: bubble.size,
            }}
          />
        ))}

        <p className="absolute bottom-8 text-muted-foreground text-sm">
          {bubbles.filter(b => b.popped).length}/{TARGET_BUBBLES} popped
        </p>
      </div>
    );
  }

  // Breathing balloon mode
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 bg-gradient-to-b from-teal-50 to-white dark:from-teal-950/20 dark:to-background">
      <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 text-sm font-semibold">
        🧊 Cool-Off — Breathing Balloon
      </div>

      <h2 className="text-xl font-semibold mb-8 text-foreground">
        {breathPhase === 'inhale' ? 'Breathe In... 🫁' :
         breathPhase === 'hold' ? 'Hold... ✋' :
         'Breathe Out... 💨'}
      </h2>

      <motion.div
        animate={{
          scale: breathPhase === 'inhale' ? 1.5 : breathPhase === 'hold' ? 1.5 : 1,
          backgroundColor: breathPhase === 'inhale' ? '#5eead4' : breathPhase === 'hold' ? '#67e8f9' : '#a78bfa',
        }}
        transition={{ duration: breathPhase === 'inhale' ? 3 : breathPhase === 'exhale' ? 4 : 0.5, ease: 'easeInOut' }}
        className="w-40 h-40 rounded-full flex items-center justify-center shadow-2xl"
      >
        <Wind className="h-12 w-12 text-white" />
      </motion.div>

      {/* Cycle counter */}
      <div className="flex gap-3 mt-8">
        {Array.from({ length: TARGET_CYCLES }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'w-6 h-6 rounded-full border-2 transition-all',
              i < cycles ? 'bg-teal-500 border-teal-500' : 'border-muted'
            )}
          />
        ))}
      </div>
      <p className="text-sm text-muted-foreground mt-3">
        Cycle {Math.min(cycles + 1, TARGET_CYCLES)} of {TARGET_CYCLES}
      </p>
    </div>
  );
};
