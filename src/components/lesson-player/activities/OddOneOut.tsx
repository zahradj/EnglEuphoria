import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GeneratedSlide } from '@/components/admin/lesson-builder/ai-wizard/types';
import { soundEffectsService } from '@/services/soundEffectsService';
import { ArcadeFrame, ARCADE } from '@/components/creator-studio/shared/ArcadeKit';
import { GameFX } from '@/components/creator-studio/shared/GameFX';

interface Props {
  slide: GeneratedSlide;
  onCorrect: () => void;
  onIncorrect?: () => void;
}

interface WordCard {
  word: string;
  emoji: string;
  isOdd: boolean;
}

export default function OddOneOut({ slide, onCorrect, onIncorrect }: Props) {
  const phoneme = slide.content?.phonemeTarget || '/æ/';

  const cards: WordCard[] = slide.content?.oddOneOutCards || [
    { word: 'Apple', emoji: '🍎', isOdd: false },
    { word: 'Ant', emoji: '🐜', isOdd: false },
    { word: 'Axe', emoji: '🪓', isOdd: false },
    { word: 'Igloo', emoji: '🏠', isOdd: true },
  ];

  const [selected, setSelected] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [completed, setCompleted] = useState(false);
  const [winFx, setWinFx] = useState(0);

  const handleSelect = useCallback((word: string) => {
    if (completed) return;
    setSelected(word);
    const card = cards.find(c => c.word === word);
    if (card?.isOdd) {
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
  }, [completed, cards, onCorrect, onIncorrect]);

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <ArcadeFrame title="Odd One Out" emoji="🔍">
        <div className="relative flex flex-col items-center">
          <GameFX trigger={winFx} variant="confetti" message="Correct! 🎉" />
          <p className="text-base font-bold mb-1" style={{ color: ARCADE.navy }}>
            Which word does NOT have the{' '}
            <span
              className="font-black px-2 py-0.5 rounded-md"
              style={{ background: ARCADE.yellow, color: ARCADE.navy }}
            >
              {phoneme}
            </span>{' '}
            sound?
          </p>
          <p className="text-xs mb-6" style={{ color: ARCADE.navy, opacity: 0.7 }}>
            Tap the word that doesn't belong!
          </p>

          <div className="grid grid-cols-2 gap-4 max-w-sm">
            {cards.map((card, i) => {
              const isThis = selected === card.word;
              const borderColor = isThis
                ? (isCorrect ? ARCADE.green : ARCADE.pink)
                : ARCADE.blue;
              const shadow = isThis
                ? (isCorrect ? '#048A66' : '#B8002E')
                : '#0A5F7E';
              return (
                <motion.button
                  key={card.word}
                  initial={{ opacity: 0, scale: 0.7, y: 20 }}
                  animate={{
                    opacity: 1,
                    scale: isThis && !isCorrect ? [1, 1.05, 0.95, 1] : 1,
                    y: 0,
                  }}
                  transition={{ delay: i * 0.08, type: 'spring', stiffness: 280 }}
                  whileHover={!completed ? { scale: 1.06, y: -3 } : undefined}
                  whileTap={!completed ? { scale: 0.95 } : undefined}
                  onClick={() => handleSelect(card.word)}
                  disabled={completed}
                  className="flex flex-col items-center gap-2 p-5 rounded-2xl border-4"
                  style={{
                    background: '#fff',
                    borderColor,
                    boxShadow: `0 6px 0 ${shadow}`,
                    fontFamily: "'Fredoka','Quicksand',sans-serif",
                  }}
                >
                  <span className="text-5xl">{card.emoji}</span>
                  <span
                    className="text-lg font-black uppercase tracking-wide"
                    style={{ color: ARCADE.navy }}
                  >
                    {card.word}
                  </span>
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
                LEVEL CLEAR! "{cards.find(c => c.isOdd)?.word}" doesn't have {phoneme}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </ArcadeFrame>
    </div>
  );
}
