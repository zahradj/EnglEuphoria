import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GeneratedSlide } from '@/components/admin/lesson-builder/ai-wizard/types';
import { soundEffectsService } from '@/services/soundEffectsService';
import { RotateCcw } from 'lucide-react';
import { ArcadeFrame, ArcadeButton, ARCADE } from '@/components/creator-studio/shared/ArcadeKit';
import { GameFX } from '@/components/creator-studio/shared/GameFX';

interface Props {
  slide: GeneratedSlide;
  onCorrect: () => void;
  onIncorrect?: () => void;
}

export default function WordBuilder({ slide, onCorrect, onIncorrect }: Props) {
  const targetWord = (slide.content?.title || 'Apple').toUpperCase();
  const imageUrl = slide.content?.imageUrl || slide.imageUrl;

  const initialShuffled = useMemo(
    () => [...targetWord.split('')].sort(() => Math.random() - 0.5),
    [targetWord],
  );
  const [availableLetters, setAvailableLetters] = useState(initialShuffled);
  const [builtLetters, setBuiltLetters] = useState<string[]>([]);
  const [wrongShake, setWrongShake] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [popFx, setPopFx] = useState(0);
  const [winFx, setWinFx] = useState(0);

  const handleLetterTap = useCallback((letter: string, index: number) => {
    if (completed) return;
    const nextCorrectLetter = targetWord[builtLetters.length];
    if (letter === nextCorrectLetter) {
      const newBuilt = [...builtLetters, letter];
      setBuiltLetters(newBuilt);
      setAvailableLetters(prev => prev.filter((_, i) => i !== index));
      soundEffectsService.playCorrect();
      setPopFx(v => v + 1);
      if (newBuilt.length === targetWord.length) {
        setCompleted(true);
        setWinFx(v => v + 1);
        setTimeout(() => onCorrect(), 1400);
      }
    } else {
      setWrongShake(true);
      soundEffectsService.playIncorrect();
      onIncorrect?.();
      setTimeout(() => setWrongShake(false), 500);
    }
  }, [builtLetters, targetWord, completed, onCorrect, onIncorrect]);

  const handleReset = useCallback(() => {
    setBuiltLetters([]);
    setAvailableLetters([...targetWord.split('')].sort(() => Math.random() - 0.5));
  }, [targetWord]);

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <ArcadeFrame
        title="Word Builder"
        emoji="🧱"
        score={builtLetters.length}
        total={targetWord.length}
      >
        <div className="relative flex flex-col items-center">
          <GameFX trigger={popFx} variant="pop" durationMs={500} />
          <GameFX trigger={winFx} variant="confetti" message={`You spelled "${targetWord}"! 🎉`} />

          <p className="text-sm font-bold mb-4" style={{ color: ARCADE.navy }}>
            Tap the letters in order!
          </p>

          {imageUrl && (
            <motion.img
              initial={{ scale: 0.8, opacity: 0, rotate: -6 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              src={imageUrl}
              alt={targetWord}
              className="h-28 w-28 object-contain mb-4 rounded-2xl border-4"
              style={{ borderColor: ARCADE.yellow, boxShadow: `0 8px 0 ${ARCADE.pink}` }}
            />
          )}

          {/* Built word slots */}
          <motion.div
            animate={wrongShake ? { x: [-6, 6, -6, 6, 0] } : {}}
            transition={{ duration: 0.35 }}
            className="flex gap-2 mb-8"
          >
            {targetWord.split('').map((_, i) => {
              const filled = !!builtLetters[i];
              return (
                <motion.div
                  key={i}
                  animate={filled ? { scale: [1, 1.15, 1] } : {}}
                  transition={{ duration: 0.3 }}
                  className="h-14 w-12 rounded-xl border-4 flex items-center justify-center text-2xl font-black"
                  style={{
                    borderStyle: filled ? 'solid' : 'dashed',
                    borderColor: filled ? ARCADE.green : ARCADE.purple,
                    background: filled ? 'rgba(6,214,160,0.18)' : 'rgba(255,255,255,0.6)',
                    color: filled ? ARCADE.navy : 'transparent',
                    boxShadow: filled ? `0 4px 0 ${ARCADE.green}` : 'none',
                    fontFamily: "'Fredoka','Quicksand',sans-serif",
                  }}
                >
                  {builtLetters[i] || '?'}
                </motion.div>
              );
            })}
          </motion.div>

          {/* Available letters */}
          <div className="flex flex-wrap gap-3 justify-center mb-4 max-w-md">
            {availableLetters.map((letter, i) => {
              const tones: Array<'pink' | 'yellow' | 'green' | 'blue' | 'purple'> =
                ['pink', 'yellow', 'green', 'blue', 'purple'];
              const tone = tones[i % tones.length];
              return (
                <motion.div
                  key={`${letter}-${i}`}
                  initial={{ opacity: 0, scale: 0.5, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: i * 0.05, type: 'spring', stiffness: 320 }}
                >
                  <ArcadeButton
                    tone={tone}
                    size="lg"
                    onClick={() => handleLetterTap(letter, i)}
                    style={{ minWidth: 56, minHeight: 56 }}
                  >
                    {letter}
                  </ArcadeButton>
                </motion.div>
              );
            })}
          </div>

          {builtLetters.length > 0 && !completed && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1 text-sm font-bold"
              style={{ color: ARCADE.navy, opacity: 0.7 }}
            >
              <RotateCcw className="h-3 w-3" /> Reset
            </button>
          )}

          <AnimatePresence>
            {completed && (
              <motion.p
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-3 text-2xl font-black"
                style={{ color: ARCADE.green, fontFamily: "'Fredoka','Quicksand',sans-serif" }}
              >
                LEVEL CLEAR! +10 XP
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </ArcadeFrame>
    </div>
  );
}
