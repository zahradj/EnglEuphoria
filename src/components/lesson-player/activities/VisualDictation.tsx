import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GeneratedSlide } from '@/components/admin/lesson-builder/ai-wizard/types';
import { soundEffectsService } from '@/services/soundEffectsService';
import { ArcadeFrame, ArcadeChip, ARCADE } from '@/components/creator-studio/shared/ArcadeKit';
import { GameFX } from '@/components/creator-studio/shared/GameFX';
import { Volume2 } from 'lucide-react';

interface VisualDictationProps {
  slide: GeneratedSlide;
  onCorrect: () => void;
  onIncorrect?: () => void;
}

const ANIMAL_EMOJIS = ['🦁', '🐘', '🦋', '🐢'];
const TONE_RING = [ARCADE.pink, ARCADE.yellow, ARCADE.green, ARCADE.blue];
const TONE_SHADOW = ['#B8002E', '#C49A00', '#048A66', '#0A5F7E'];

export default function VisualDictation({ slide, onCorrect, onIncorrect }: VisualDictationProps) {
  const options: string[] = slide.content?.options || slide.interaction?.data?.options || ['Lion', 'Elephant', 'Butterfly', 'Turtle'];
  const correctAnswer: string = slide.content?.correctAnswer || slide.interaction?.data?.correct_answer || options[0];

  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [winFx, setWinFx] = useState(0);

  const isWin = selected === correctAnswer;

  const handleTap = useCallback((opt: string) => {
    if (answered) return;
    setSelected(opt);
    setAnswered(true);
    if (opt === correctAnswer) {
      soundEffectsService.playCorrect();
      setWinFx(v => v + 1);
      onCorrect();
    } else {
      soundEffectsService.playIncorrect();
      onIncorrect?.();
    }
  }, [answered, correctAnswer, onCorrect, onIncorrect]);

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <ArcadeFrame
        title="Listen & Tap"
        emoji="🎧"
        hud={<ArcadeChip tone="yellow">Pick the word</ArcadeChip>}
      >
        <div className="relative flex flex-col items-center gap-5">
          <GameFX trigger={winFx} variant="confetti" message={`Yes — "${correctAnswer}"! 🎉`} />

          <motion.div
            animate={{ scale: [1, 1.05, 1], rotate: [0, -2, 2, 0] }}
            transition={{ repeat: Infinity, duration: 2.4 }}
            className="text-xl font-black py-3 px-6 rounded-2xl flex items-center gap-2"
            style={{
              background: `linear-gradient(135deg, ${ARCADE.yellow}, ${ARCADE.pink})`,
              color: '#fff',
              border: `4px solid ${ARCADE.navy}`,
              boxShadow: `0 6px 0 ${ARCADE.purple}`,
              fontFamily: "'Fredoka','Quicksand',sans-serif",
              textShadow: `2px 2px 0 rgba(0,0,0,0.25)`,
            }}
          >
            <Volume2 className="h-5 w-5" />
            Which one is "{correctAnswer}"?
          </motion.div>

          <div className="grid grid-cols-2 gap-4 w-full max-w-md">
            {options.map((opt, i) => {
              const isCorrect = opt === correctAnswer;
              const isThis = selected === opt;
              const emoji = ANIMAL_EMOJIS[i % ANIMAL_EMOJIS.length];
              const ring = answered
                ? (isThis ? (isCorrect ? ARCADE.green : ARCADE.pink) : isCorrect ? ARCADE.green : `${ARCADE.purple}55`)
                : TONE_RING[i % TONE_RING.length];
              const shadow = answered
                ? (isThis ? (isCorrect ? '#048A66' : '#B8002E') : isCorrect ? '#048A66' : '#432F5E55')
                : TONE_SHADOW[i % TONE_SHADOW.length];
              const bg = answered && isThis
                ? (isCorrect ? `${ARCADE.green}33` : `${ARCADE.pink}33`)
                : '#fff';
              return (
                <motion.button
                  key={opt}
                  onClick={() => handleTap(opt)}
                  disabled={answered}
                  initial={{ opacity: 0, y: 20, scale: 0.7 }}
                  animate={{
                    opacity: answered && !isThis && !isCorrect ? 0.45 : 1,
                    y: !answered ? [0, -5, 0] : 0,
                    rotate: !answered ? [0, i % 2 === 0 ? 2 : -2, 0] : 0,
                    scale: 1,
                  }}
                  transition={!answered ? { repeat: Infinity, duration: 2 + i * 0.3, delay: i * 0.1 } : { delay: i * 0.07 }}
                  whileHover={!answered ? { scale: 1.05 } : undefined}
                  whileTap={!answered ? { scale: 0.92 } : undefined}
                  className="flex flex-col items-center gap-2 py-5 rounded-3xl text-base font-black border-4"
                  style={{
                    background: bg,
                    borderColor: ring,
                    boxShadow: `0 6px 0 ${shadow}`,
                    color: ARCADE.navy,
                    fontFamily: "'Fredoka','Quicksand',sans-serif",
                  }}
                >
                  <span className="text-4xl">{emoji}</span>
                  <span>{opt}</span>
                </motion.button>
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
                  color: isWin ? ARCADE.green : ARCADE.pink,
                  fontFamily: "'Fredoka','Quicksand',sans-serif",
                }}
              >
                {isWin ? 'LEVEL CLEAR! 🎉' : `It's "${correctAnswer}" — try again!`}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </ArcadeFrame>
    </div>
  );
}
