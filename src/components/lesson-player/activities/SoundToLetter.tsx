import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GeneratedSlide } from '@/components/admin/lesson-builder/ai-wizard/types';
import { soundEffectsService } from '@/services/soundEffectsService';
import { ArcadeFrame, ArcadeChip, ARCADE } from '@/components/creator-studio/shared/ArcadeKit';
import { GameFX } from '@/components/creator-studio/shared/GameFX';

interface Props {
  slide: GeneratedSlide;
  onCorrect: () => void;
  onIncorrect?: () => void;
}

const LETTER_RING = [ARCADE.pink, ARCADE.yellow, ARCADE.green, ARCADE.blue, ARCADE.purple];
const LETTER_SHADOW = ['#B8002E', '#C49A00', '#048A66', '#0A5F7E', '#432F5E'];

export default function SoundToLetter({ slide, onCorrect, onIncorrect }: Props) {
  const word: string = slide.content?.title || 'Apple';
  const targetIndex: number = slide.content?.targetLetterIndex ?? 0;
  const phoneme: string = slide.content?.phonemeTarget || '/æ/';
  const imageUrl: string | undefined = slide.content?.imageUrl || slide.imageUrl;

  const letters = word.split('');
  const [tapped, setTapped] = useState<number | null>(null);
  const [correct, setCorrect] = useState<boolean | null>(null);
  const [completed, setCompleted] = useState(false);
  const [winFx, setWinFx] = useState(0);

  const handleLetterTap = useCallback((index: number) => {
    if (completed) return;
    setTapped(index);
    if (index === targetIndex) {
      setCorrect(true);
      setCompleted(true);
      soundEffectsService.playCorrect();
      setWinFx(v => v + 1);
      setTimeout(() => onCorrect(), 1200);
    } else {
      setCorrect(false);
      soundEffectsService.playIncorrect();
      onIncorrect?.();
      setTimeout(() => { setTapped(null); setCorrect(null); }, 700);
    }
  }, [completed, targetIndex, onCorrect, onIncorrect]);

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <ArcadeFrame
        title="Sound to Letter"
        emoji="🔤"
        hud={
          <ArcadeChip tone="yellow">
            Sound: <span className="font-mono ml-1">{phoneme}</span>
          </ArcadeChip>
        }
      >
        <div className="relative flex flex-col items-center gap-5">
          <GameFX trigger={winFx} variant="confetti" message={`"${letters[targetIndex]}" → ${phoneme} 🎉`} />

          <p className="text-sm font-bold text-center" style={{ color: ARCADE.navy, opacity: 0.75 }}>
            Tap the letter that makes the <span className="font-mono font-black" style={{ color: ARCADE.pink }}>{phoneme}</span> sound
          </p>

          {imageUrl && (
            <motion.div
              initial={{ scale: 0.7, opacity: 0, rotate: -5 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 220 }}
              className="h-32 w-32 rounded-3xl bg-white flex items-center justify-center overflow-hidden"
              style={{
                border: `4px solid ${ARCADE.yellow}`,
                boxShadow: `0 8px 0 ${ARCADE.pink}, 0 0 24px ${ARCADE.yellow}66`,
              }}
            >
              <img src={imageUrl} alt={word} className="h-full w-full object-contain p-1" />
            </motion.div>
          )}

          <div className="flex gap-2">
            {letters.map((letter, i) => {
              const isThis = tapped === i;
              const matched = isThis && correct === true;
              const wrong = isThis && correct === false;
              const ring = matched ? ARCADE.green : wrong ? ARCADE.pink : LETTER_RING[i % LETTER_RING.length];
              const shadow = matched ? '#048A66' : wrong ? '#B8002E' : LETTER_SHADOW[i % LETTER_SHADOW.length];
              return (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, y: 20, scale: 0.7 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: wrong ? [1, 1.08, 0.95, 1] : matched ? [1, 1.15, 1] : 1,
                  }}
                  transition={{ delay: i * 0.05, type: 'spring', stiffness: 300 }}
                  whileHover={!completed ? { y: -4, rotate: -3 } : undefined}
                  whileTap={!completed ? { scale: 0.9 } : undefined}
                  onClick={() => handleLetterTap(i)}
                  disabled={completed}
                  className="h-16 w-14 rounded-2xl border-4 text-3xl font-black"
                  style={{
                    background: matched ? ARCADE.green : wrong ? ARCADE.pink : '#fff',
                    color: matched || wrong ? '#fff' : ARCADE.navy,
                    borderColor: ring,
                    boxShadow: `0 6px 0 ${shadow}`,
                    fontFamily: "'Fredoka','Quicksand',sans-serif",
                  }}
                >
                  {letter.toUpperCase()}
                </motion.button>
              );
            })}
          </div>

          <AnimatePresence>
            {completed && (
              <motion.p
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="text-xl font-black"
                style={{ color: ARCADE.green, fontFamily: "'Fredoka','Quicksand',sans-serif" }}
              >
                LEVEL CLEAR! "{letters[targetIndex]}" makes {phoneme} 🎉
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </ArcadeFrame>
    </div>
  );
}
