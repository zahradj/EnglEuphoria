import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GeneratedSlide } from '@/components/admin/lesson-builder/ai-wizard/types';
import { soundEffectsService } from '@/services/soundEffectsService';
import { ArcadeFrame, ArcadeButton, ArcadeChip, ArcadeDropZone, ComboFlash, ARCADE } from '@/components/creator-studio/shared/ArcadeKit';
import { GameFX } from '@/components/creator-studio/shared/GameFX';

interface Props {
  slide: GeneratedSlide;
  onCorrect: () => void;
  onIncorrect?: () => void;
}

interface WordItem {
  word: string;
  bucket: string;
  sorted: boolean;
}

const WORD_TONES: Array<'pink' | 'yellow' | 'green' | 'blue' | 'purple'> = ['pink', 'yellow', 'blue', 'green', 'purple', 'pink'];

export default function SoundSort({ slide, onCorrect, onIncorrect }: Props) {
  const phoneme1 = slide.content?.phonemeTarget || '/æ/';
  const phoneme2 = '/ɪ/';

  const [words, setWords] = useState<WordItem[]>([
    { word: 'Apple', bucket: phoneme1, sorted: false },
    { word: 'Ant', bucket: phoneme1, sorted: false },
    { word: 'Axe', bucket: phoneme1, sorted: false },
    { word: 'Igloo', bucket: phoneme2, sorted: false },
    { word: 'Ink', bucket: phoneme2, sorted: false },
    { word: 'Insect', bucket: phoneme2, sorted: false },
  ]);
  const [activeWord, setActiveWord] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ word: string; correct: boolean } | null>(null);
  const [completed, setCompleted] = useState(false);
  const [combo, setCombo] = useState(0);
  const [winFx, setWinFx] = useState(0);

  const total = words.length;
  const sortedCount = words.filter(w => w.sorted).length;
  const unsorted = words.filter(w => !w.sorted);

  const handleBucketDrop = useCallback((bucket: string) => {
    if (!activeWord || completed) return;
    const wordItem = words.find(w => w.word === activeWord);
    if (!wordItem) return;

    const correct = wordItem.bucket === bucket;
    setFeedback({ word: activeWord, correct });

    if (correct) {
      soundEffectsService.playCorrect();
      setCombo(c => c + 1);
      const updated = words.map(w => w.word === activeWord ? { ...w, sorted: true } : w);
      setWords(updated);
      if (updated.every(w => w.sorted)) {
        setCompleted(true);
        setWinFx(v => v + 1);
        setTimeout(() => onCorrect(), 1000);
      }
    } else {
      soundEffectsService.playIncorrect();
      setCombo(0);
      onIncorrect?.();
    }
    setActiveWord(null);
    setTimeout(() => setFeedback(null), 700);
  }, [activeWord, words, completed, onCorrect, onIncorrect]);

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <ArcadeFrame
        title="Sound Sort"
        emoji="🗂"
        score={sortedCount}
        total={total}
        hud={<ArcadeChip tone="purple">Tap word → bucket</ArcadeChip>}
      >
        <div className="relative">
          <ComboFlash combo={combo} />
          <GameFX trigger={winFx} variant="confetti" message="All sorted! 🎉" />

          <p className="text-center text-sm font-bold mb-4" style={{ color: ARCADE.navy, opacity: 0.75 }}>
            1) Tap a word  •  2) Tap the sound it belongs to
          </p>

          <div className="flex flex-wrap gap-2 justify-center mb-6 min-h-[60px]">
            <AnimatePresence>
              {unsorted.map((w, i) => (
                <motion.div
                  key={w.word}
                  layout
                  initial={{ opacity: 0, y: 20, scale: 0.7 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5, y: -20 }}
                  transition={{ delay: i * 0.05, type: 'spring', stiffness: 280 }}
                  whileHover={{ y: -3, rotate: -2 }}
                >
                  <ArcadeButton
                    tone={WORD_TONES[i % WORD_TONES.length]}
                    size="md"
                    active={activeWord === w.word || undefined}
                    onClick={() => setActiveWord(activeWord === w.word ? null : w.word)}
                  >
                    {w.word}
                  </ArcadeButton>
                </motion.div>
              ))}
            </AnimatePresence>
            {unsorted.length === 0 && (
              <p className="text-sm italic" style={{ color: ARCADE.green }}>All words sorted ✨</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[phoneme1, phoneme2].map((bucket) => {
              const bucketWords = words.filter(w => w.sorted && w.bucket === bucket);
              return (
                <button
                  key={bucket}
                  onClick={() => handleBucketDrop(bucket)}
                  className="text-left"
                  disabled={completed}
                >
                  <ArcadeDropZone
                    active={!!activeWord}
                    filled={bucketWords.length > 0}
                    className="min-h-[150px] p-4"
                  >
                    <span
                      className="font-mono text-3xl font-black mb-2"
                      style={{
                        color: ARCADE.navy,
                        textShadow: `2px 2px 0 ${ARCADE.yellow}`,
                      }}
                    >
                      {bucket}
                    </span>
                    <div className="flex flex-wrap gap-1.5 justify-center">
                      {bucketWords.map(w => (
                        <span
                          key={w.word}
                          className="text-xs px-2.5 py-1 rounded-full font-black"
                          style={{
                            background: ARCADE.green,
                            color: '#fff',
                            boxShadow: `0 2px 0 #048A66`,
                            fontFamily: "'Fredoka','Quicksand',sans-serif",
                          }}
                        >
                          {w.word}
                        </span>
                      ))}
                    </div>
                  </ArcadeDropZone>
                </button>
              );
            })}
          </div>

          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, scale: 0.6, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 text-center text-lg font-black"
                style={{
                  color: feedback.correct ? ARCADE.green : ARCADE.pink,
                  fontFamily: "'Fredoka','Quicksand',sans-serif",
                }}
              >
                {feedback.correct ? '✅ Nice!' : '❌ Try again!'}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ArcadeFrame>
    </div>
  );
}
