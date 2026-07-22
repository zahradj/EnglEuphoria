import React, { useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GeneratedSlide } from '@/components/admin/lesson-builder/ai-wizard/types';
import { soundEffectsService } from '@/services/soundEffectsService';
import { ArcadeFrame, ArcadeButton, ArcadeChip, ARCADE } from '@/components/creator-studio/shared/ArcadeKit';
import { GameFX } from '@/components/creator-studio/shared/GameFX';

interface Props {
  slide: GeneratedSlide;
  onCorrect: () => void;
  onIncorrect?: () => void;
}

const TONES: Array<'pink' | 'yellow' | 'green' | 'blue' | 'purple'> = ['pink', 'blue', 'purple', 'yellow'];

export default function PictureLabel({ slide, onCorrect, onIncorrect }: Props) {
  const correctWord = slide.content?.title || 'Apple';
  const imageUrl = slide.content?.imageUrl || slide.imageUrl;
  const distractors: string[] = slide.content?.distractors || ['Banana', 'Orange', 'Grape'];

  const options = useMemo(
    () => [...distractors.slice(0, 3), correctWord].sort(() => Math.random() - 0.5),
    [correctWord, distractors]
  );

  const [selected, setSelected] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [completed, setCompleted] = useState(false);
  const [winFx, setWinFx] = useState(0);

  const handleSelect = useCallback((word: string) => {
    if (completed) return;
    setSelected(word);
    if (word === correctWord) {
      setIsCorrect(true);
      setCompleted(true);
      soundEffectsService.playCorrect();
      setWinFx(v => v + 1);
      setTimeout(() => onCorrect(), 1100);
    } else {
      setIsCorrect(false);
      soundEffectsService.playIncorrect();
      onIncorrect?.();
      setTimeout(() => { setSelected(null); setIsCorrect(null); }, 600);
    }
  }, [completed, correctWord, onCorrect, onIncorrect]);

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <ArcadeFrame
        title="Picture Label"
        emoji="🏷"
        hud={<ArcadeChip tone="pink">What is it?</ArcadeChip>}
      >
        <div className="relative flex flex-col items-center gap-6">
          <GameFX trigger={winFx} variant="confetti" message={`It's "${correctWord}"! 🎉`} />

          <motion.div
            initial={{ scale: 0.7, opacity: 0, rotate: -5 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 220 }}
            className="h-44 w-44 rounded-3xl bg-white flex items-center justify-center overflow-hidden"
            style={{
              border: `5px solid ${ARCADE.yellow}`,
              boxShadow: `0 10px 0 ${ARCADE.pink}, 0 0 0 3px ${ARCADE.navy} inset, 0 0 30px ${ARCADE.yellow}66`,
            }}
          >
            {imageUrl ? (
              <img src={imageUrl} alt="mystery" className="h-full w-full object-contain p-2" />
            ) : (
              <span className="text-7xl">🍎</span>
            )}
          </motion.div>

          <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
            {options.map((word, i) => {
              const isThis = selected === word;
              const matched = completed && isThis;
              const wrong = !completed && isThis && isCorrect === false;
              return (
                <motion.div
                  key={word}
                  initial={{ opacity: 0, y: 20, scale: 0.7 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: i * 0.08, type: 'spring', stiffness: 280 }}
                  whileHover={!completed ? { y: -4 } : undefined}
                >
                  <ArcadeButton
                    tone={TONES[i % TONES.length]}
                    matched={matched || undefined}
                    wrong={wrong || undefined}
                    onClick={() => handleSelect(word)}
                    disabled={completed}
                    className="w-full"
                  >
                    {word}
                  </ArcadeButton>
                </motion.div>
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
                LEVEL CLEAR! +10 XP ⭐
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </ArcadeFrame>
    </div>
  );
}
