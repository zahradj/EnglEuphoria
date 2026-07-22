import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GeneratedSlide } from '@/components/admin/lesson-builder/ai-wizard/types';
import { soundEffectsService } from '@/services/soundEffectsService';
import { Volume2 } from 'lucide-react';
import { ArcadeFrame, ArcadeChip, ARCADE } from '@/components/creator-studio/shared/ArcadeKit';
import { GameFX } from '@/components/creator-studio/shared/GameFX';

interface Props {
  slide: GeneratedSlide;
  onCorrect: () => void;
  onIncorrect?: () => void;
}

const PHONEME_SETS = [
  { target: '/æ/', options: ['/æ/', '/ɛ/', '/ɪ/', '/ʌ/', '/ɑː/', '/iː/'], label: 'short a' },
  { target: '/iː/', options: ['/ɪ/', '/iː/', '/eɪ/', '/ɛ/', '/æ/', '/ʌ/'], label: 'long e' },
  { target: '/ʃ/', options: ['/s/', '/ʃ/', '/tʃ/', '/θ/', '/z/', '/ʒ/'], label: 'sh' },
];

const TONE_RING = [ARCADE.pink, ARCADE.blue, ARCADE.purple, ARCADE.green, ARCADE.yellow, ARCADE.blue];
const TONE_SHADOW = ['#B8002E', '#0A5F7E', '#432F5E', '#048A66', '#C49A00', '#0A5F7E'];

export default function PhonemeTap({ slide, onCorrect, onIncorrect }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [completed, setCompleted] = useState(false);
  const [winFx, setWinFx] = useState(0);

  const phonemeTarget = slide.content?.phonemeTarget || '/æ/';
  const set = PHONEME_SETS.find(s => s.target === phonemeTarget) || PHONEME_SETS[0];
  const options = set.options;

  const handleTap = useCallback((phoneme: string) => {
    if (completed) return;
    setSelected(phoneme);

    if (phoneme === set.target) {
      setIsCorrect(true);
      setCompleted(true);
      soundEffectsService.playCorrect();
      setWinFx(v => v + 1);
      setTimeout(() => onCorrect(), 1200);
    } else {
      setIsCorrect(false);
      soundEffectsService.playIncorrect();
      onIncorrect?.();
      setTimeout(() => { setSelected(null); setIsCorrect(null); }, 700);
    }
  }, [completed, set.target, onCorrect, onIncorrect]);

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <ArcadeFrame
        title="Phoneme Tap"
        emoji="👂"
        hud={<ArcadeChip tone="purple">Listen → Tap</ArcadeChip>}
      >
        <div className="relative flex flex-col items-center">
          <GameFX trigger={winFx} variant="confetti" message={`That's "${set.label}"! 🎉`} />

          <p className="text-sm font-bold mb-4" style={{ color: ARCADE.navy, opacity: 0.75 }}>
            Press play, then tap the sound you hear
          </p>

          <motion.button
            whileHover={{ scale: 1.08, rotate: -3 }}
            whileTap={{ scale: 0.92 }}
            animate={{ y: [0, -4, 0] }}
            transition={{ y: { duration: 1.6, repeat: Infinity, ease: 'easeInOut' } }}
            className="h-20 w-20 rounded-full flex items-center justify-center mb-8"
            style={{
              background: `radial-gradient(circle at 30% 30%, ${ARCADE.yellow}, ${ARCADE.pink})`,
              boxShadow: `0 8px 0 ${ARCADE.purple}, 0 0 0 4px #fff inset, 0 0 24px ${ARCADE.pink}88`,
              color: '#fff',
            }}
            aria-label="Play sound"
          >
            <Volume2 className="h-9 w-9" />
          </motion.button>

          <ArcadeChip tone="blue" className="mb-4">Which sound?</ArcadeChip>

          <div className="grid grid-cols-3 gap-3 max-w-md">
            {options.map((phoneme, i) => {
              const isThis = selected === phoneme;
              const ring = isThis
                ? (isCorrect ? ARCADE.green : ARCADE.pink)
                : TONE_RING[i % TONE_RING.length];
              const shadow = isThis
                ? (isCorrect ? '#048A66' : '#B8002E')
                : TONE_SHADOW[i % TONE_SHADOW.length];
              return (
                <motion.button
                  key={phoneme + i}
                  initial={{ opacity: 0, scale: 0.7, y: 20 }}
                  animate={{
                    opacity: 1,
                    scale: isThis && !isCorrect ? [1, 1.08, 0.95, 1] : 1,
                    y: 0,
                  }}
                  transition={{ delay: i * 0.06, type: 'spring', stiffness: 280 }}
                  whileHover={!completed ? { scale: 1.07, y: -3 } : undefined}
                  whileTap={!completed ? { scale: 0.94 } : undefined}
                  onClick={() => handleTap(phoneme)}
                  disabled={completed}
                  className="h-20 w-24 rounded-2xl border-4 font-mono text-2xl font-black"
                  style={{
                    background: isThis && isCorrect
                      ? ARCADE.green
                      : isThis
                      ? ARCADE.pink
                      : '#fff',
                    color: isThis ? '#fff' : ARCADE.navy,
                    borderColor: ring,
                    boxShadow: `0 6px 0 ${shadow}`,
                  }}
                >
                  {phoneme}
                </motion.button>
              );
            })}
          </div>

          <AnimatePresence>
            {completed && (
              <motion.p
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="mt-6 text-xl font-black"
                style={{ color: ARCADE.green, fontFamily: "'Fredoka','Quicksand',sans-serif" }}
              >
                LEVEL CLEAR! That's the "{set.label}" sound 🎉
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </ArcadeFrame>
    </div>
  );
}
