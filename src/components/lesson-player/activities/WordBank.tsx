import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GeneratedSlide } from '@/components/admin/lesson-builder/ai-wizard/types';
import { soundEffectsService } from '@/services/soundEffectsService';
import { ArcadeFrame, ArcadeButton, ArcadeChip, ARCADE } from '@/components/creator-studio/shared/ArcadeKit';
import { GameFX } from '@/components/creator-studio/shared/GameFX';

interface WordBankProps {
  slide: GeneratedSlide;
  onCorrect: () => void;
  onIncorrect?: () => void;
}

const TONES: Array<'pink' | 'yellow' | 'green' | 'blue' | 'purple'> = ['pink', 'yellow', 'green', 'blue', 'purple'];

export default function WordBank({ slide, onCorrect, onIncorrect }: WordBankProps) {
  const sentence = slide.content?.sentence || slide.interaction?.data?.question || 'The ___ is red.';
  const options: string[] = slide.content?.options || slide.interaction?.data?.options || [];
  const correctAnswer: string = slide.content?.correctAnswer || slide.interaction?.data?.correct_answer || '';

  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [winFx, setWinFx] = useState(0);

  const parts = sentence.split(/___+|____+|\*\*\*+/);
  const hasBlanks = parts.length > 1;
  const isCorrect = selected && selected.toLowerCase().trim() === correctAnswer.toLowerCase().trim();

  const handleSelect = useCallback((word: string) => {
    if (answered) return;
    if (selected === word) { setSelected(null); return; }
    setSelected(word);
    setTimeout(() => {
      setAnswered(true);
      if (word.toLowerCase().trim() === correctAnswer.toLowerCase().trim()) {
        soundEffectsService.playCorrect();
        setWinFx(v => v + 1);
        onCorrect();
      } else {
        soundEffectsService.playIncorrect();
        onIncorrect?.();
      }
    }, 400);
  }, [selected, answered, correctAnswer, onCorrect, onIncorrect]);

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <ArcadeFrame
        title="Fill the Blank"
        emoji="🧩"
        hud={<ArcadeChip tone="blue">Pick a word</ArcadeChip>}
      >
        <div className="relative flex flex-col items-center gap-7">
          <GameFX trigger={winFx} variant="confetti" message="Nice fit! 🎯" />

          <div
            className="text-2xl md:text-3xl font-black text-center leading-relaxed px-4"
            style={{ color: ARCADE.navy, fontFamily: "'Fredoka','Quicksand',sans-serif" }}
          >
            {hasBlanks ? (
              <>
                {parts[0]}
                <motion.span
                  animate={!selected ? { scale: [1, 1.04, 1] } : {}}
                  transition={{ duration: 1.4, repeat: Infinity }}
                  className="inline-block min-w-[120px] mx-1 rounded-xl px-3 py-1 align-middle"
                  style={{
                    background: answered
                      ? isCorrect ? `${ARCADE.green}33` : `${ARCADE.pink}33`
                      : `${ARCADE.yellow}55`,
                    border: `3px dashed ${answered ? (isCorrect ? ARCADE.green : ARCADE.pink) : ARCADE.purple}`,
                    color: answered ? (isCorrect ? ARCADE.green : ARCADE.pink) : ARCADE.purple,
                  }}
                >
                  <AnimatePresence mode="wait">
                    {selected ? (
                      <motion.span
                        key={selected}
                        initial={{ y: 14, opacity: 0, scale: 0.7 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: -10, opacity: 0 }}
                        className="font-black"
                      >
                        {selected}
                      </motion.span>
                    ) : (
                      <motion.span key="ph" className="opacity-50">???</motion.span>
                    )}
                  </AnimatePresence>
                </motion.span>
                {parts.slice(1).join('')}
              </>
            ) : (
              <span>{sentence}</span>
            )}
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            {options.map((word, i) => {
              const isThis = selected === word;
              const matched = answered && isThis && isCorrect;
              const wrong = answered && isThis && !isCorrect;
              return (
                <motion.div
                  key={word}
                  initial={{ opacity: 0, y: 20, scale: 0.7 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: i * 0.06, type: 'spring', stiffness: 300 }}
                  whileHover={!answered ? { y: -4, rotate: -2 } : undefined}
                >
                  <ArcadeButton
                    tone={TONES[i % TONES.length]}
                    size="md"
                    active={isThis && !answered}
                    matched={matched || undefined}
                    wrong={wrong || undefined}
                    onClick={() => handleSelect(word)}
                    disabled={answered}
                    style={{ opacity: answered && !isThis ? 0.45 : 1 }}
                  >
                    {word}
                  </ArcadeButton>
                </motion.div>
              );
            })}
          </div>

          <AnimatePresence>
            {answered && (
              <motion.p
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="text-xl font-black"
                style={{
                  color: isCorrect ? ARCADE.green : ARCADE.pink,
                  fontFamily: "'Fredoka','Quicksand',sans-serif",
                }}
              >
                {isCorrect ? 'LEVEL CLEAR! 🎉' : `Oops! It's "${correctAnswer}"`}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </ArcadeFrame>
    </div>
  );
}
