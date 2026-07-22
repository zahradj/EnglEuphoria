import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GeneratedSlide } from '@/components/admin/lesson-builder/ai-wizard/types';
import { soundEffectsService } from '@/services/soundEffectsService';
import { GameFX } from '@/components/creator-studio/shared/GameFX';

interface Props {
  slide: GeneratedSlide;
  onCorrect: () => void;
  onIncorrect?: () => void;
}

interface Bubble {
  id: string;
  word: string;
  isTarget: boolean;
  x: number;
  y: number;
  speed: number;
  color: string;
}

const BUBBLE_COLORS = ['#FF9F1C', '#7c3aed', '#06b6d4', '#ec4899', '#10b981', '#f59e0b'];

export default function PlaygroundPopBubble({ slide, onCorrect, onIncorrect }: Props) {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [popped, setPopped] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);
  const [wrongPop, setWrongPop] = useState<string | null>(null);
  const [fxTrigger, setFxTrigger] = useState(0);
  const [winFx, setWinFx] = useState(0);
  const completedRef = useRef(false);

  const words = slide.content?.matchPairs?.map(p => p.word)
    || slide.content?.dragItems?.map(d => d.text)
    || slide.interaction?.data?.options
    || ['Hello', 'Goodbye', 'Friend', 'Name'];

  const targetWords = words.slice(0, Math.ceil(words.length / 2));
  const distractors = ['Cat', 'Moon', 'Star', 'Rain', 'Book', 'Tree'].filter(w => !words.includes(w));

  useEffect(() => {
    const allWords = [...targetWords, ...distractors.slice(0, 3)];
    const newBubbles: Bubble[] = allWords.map((word, i) => ({
      id: `${word}-${i}`,
      word,
      isTarget: targetWords.includes(word),
      x: 10 + Math.random() * 70,
      y: 80 + Math.random() * 15,
      speed: 3 + Math.random() * 4,
      color: BUBBLE_COLORS[i % BUBBLE_COLORS.length],
    }));
    setBubbles(newBubbles);
  }, []);

  const handlePop = useCallback((bubble: Bubble) => {
    if (popped.has(bubble.id) || completedRef.current) return;

    const newPopped = new Set([...popped, bubble.id]);
    setPopped(newPopped);

    if (bubble.isTarget) {
      const newScore = score + 10;
      setScore(newScore);
      soundEffectsService.playCorrect();
      setFxTrigger((n) => n + 1);

      // Check if all targets are now popped
      const remainingTargets = bubbles
        .filter(b => b.isTarget && !newPopped.has(b.id));

      if (remainingTargets.length === 0) {
        completedRef.current = true;
        setWinFx((n) => n + 1);
        // Small delay so the user sees the last pop animation
        setTimeout(() => onCorrect(), 900);
      }
    } else {
      // Wrong bubble — show local shake feedback, no parent callback
      setWrongPop(bubble.id);
      soundEffectsService.playIncorrect();
      setTimeout(() => setWrongPop(null), 600);
    }
  }, [popped, score, bubbles, onCorrect]);

  const activeBubbles = bubbles.filter(b => !popped.has(b.id));
  const allTargetsPopped = activeBubbles.filter(b => b.isTarget).length === 0 && targetWords.length > 0;

  return (
    <div className="w-full h-full relative overflow-hidden rounded-3xl p-6" style={{ background: 'linear-gradient(180deg, #FFF7ED 0%, #fef3c7 100%)' }}>
      <GameFX trigger={fxTrigger} variant="sparkle" />
      <GameFX trigger={winFx} variant="confetti" message="Great! 🎉" durationMs={1600} />
      <div className="text-center mb-4">
        <h2 className="text-3xl font-bold" style={{ fontFamily: "'Quicksand', sans-serif", color: '#1a1a2e' }}>
          🫧 Pop the Correct Words!
        </h2>
        <p className="text-lg mt-1" style={{ color: '#6b7280' }}>
          Tap the bubbles with the right words! ⭐ Score: {score}
        </p>
      </div>

      <div className="relative w-full" style={{ height: '70%' }}>
        <AnimatePresence>
          {activeBubbles.map(bubble => (
            <motion.button
              key={bubble.id}
              initial={{ y: '100%', opacity: 0, scale: 0.5 }}
              animate={{
                y: [0, -300, -500],
                opacity: [0, 1, 1, 0.5],
                scale: [0.5, 1, 1.05, 1],
                x: [0, Math.sin(bubble.speed) * 20, -Math.sin(bubble.speed) * 15, 0],
              }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: bubble.speed, ease: 'easeOut', repeat: Infinity, repeatDelay: 1 }}
              onClick={() => handlePop(bubble)}
              className="absolute cursor-pointer flex items-center justify-center rounded-full shadow-lg border-4 border-white/50 hover:scale-110 transition-transform"
              style={{
                left: `${bubble.x}%`,
                bottom: '5%',
                width: '110px',
                height: '110px',
                background: wrongPop === bubble.id
                  ? '#ef4444'
                  : `radial-gradient(circle at 35% 35%, white 0%, ${bubble.color} 50%, ${bubble.color}cc 100%)`,
                fontFamily: "'Quicksand', sans-serif",
                fontWeight: 700,
                fontSize: '1.1rem',
                color: '#1a1a2e',
              }}
            >
              {bubble.word}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {allTargetsPopped && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-3xl"
        >
          <div className="bg-white rounded-3xl p-8 text-center shadow-2xl">
            <p className="text-5xl mb-4">🎉</p>
            <p className="text-2xl font-bold" style={{ fontFamily: "'Quicksand', sans-serif", color: '#1a1a2e' }}>
              Great Job! +{score} XP!
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
