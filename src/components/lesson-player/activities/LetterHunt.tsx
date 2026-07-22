import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GeneratedSlide } from '@/components/admin/lesson-builder/ai-wizard/types';
import { Search, Check } from 'lucide-react';
import { ArcadeFrame, ArcadeButton, ArcadeChip, ARCADE } from '@/components/creator-studio/shared/ArcadeKit';
import { GameFX } from '@/components/creator-studio/shared/GameFX';
import { soundEffectsService } from '@/services/soundEffectsService';

interface LetterHuntProps {
  slide: GeneratedSlide;
  onCorrect?: () => void;
  onIncorrect?: () => void;
}

const LETTER_RING = [ARCADE.pink, ARCADE.yellow, ARCADE.green, ARCADE.blue, ARCADE.purple, ARCADE.pink];
const LETTER_SHADOW = ['#B8002E', '#C49A00', '#048A66', '#0A5F7E', '#432F5E', '#B8002E'];

const LetterHunt: React.FC<LetterHuntProps> = ({ slide, onCorrect, onIncorrect }) => {
  const [inputLetter, setInputLetter] = useState('');
  const [result, setResult] = useState<'correct' | 'incorrect' | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [winFx, setWinFx] = useState(0);

  const targetWord: string = slide.content?.word || 'Lion';
  const missingIndex: number = slide.content?.targetLetterIndex ?? 0;
  const correctLetter = targetWord[missingIndex]?.toLowerCase() || 'l';
  const imageUrl: string | undefined = slide.content?.imageUrl || slide.imageUrl;
  const displayWord = targetWord.split('').map((char, i) => ({ char, isMissing: i === missingIndex }));

  const handleSubmit = useCallback(() => {
    if (!inputLetter) return;
    setAttempts(prev => prev + 1);
    if (inputLetter.toLowerCase() === correctLetter) {
      setResult('correct');
      setIsUnlocked(true);
      setWinFx(v => v + 1);
      soundEffectsService.playCorrect();
      onCorrect?.();
    } else {
      setResult('incorrect');
      soundEffectsService.playIncorrect();
      onIncorrect?.();
      setTimeout(() => { setResult(null); setInputLetter(''); }, 900);
    }
  }, [inputLetter, correctLetter, onCorrect, onIncorrect]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  }, [handleSubmit]);

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <ArcadeFrame
        title="Letter Hunt"
        emoji="🔍"
        hud={
          <ArcadeChip tone="blue">
            <Search className="h-3 w-3 mr-1" /> Hunt the letter
          </ArcadeChip>
        }
      >
        <div className="relative flex flex-col items-center gap-5">
          <GameFX trigger={winFx} variant="confetti" message="Image unlocked! 🎉" />

          <p className="text-sm font-bold text-center" style={{ color: ARCADE.navy, opacity: 0.75 }}>
            Type the missing letter to unlock the picture
          </p>

          <motion.div
            initial={{ scale: 0.9 }}
            animate={isUnlocked ? { scale: [1, 1.1, 1], rotate: [0, -4, 4, 0] } : { scale: 1 }}
            transition={{ duration: 0.6 }}
            className="h-40 w-40 rounded-3xl overflow-hidden bg-white flex items-center justify-center"
            style={{
              border: `5px solid ${isUnlocked ? ARCADE.green : ARCADE.yellow}`,
              boxShadow: isUnlocked
                ? `0 10px 0 ${ARCADE.green}, 0 0 30px ${ARCADE.green}66`
                : `0 10px 0 ${ARCADE.pink}, 0 0 20px ${ARCADE.yellow}55`,
            }}
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={isUnlocked ? targetWord : 'Mystery'}
                className="w-full h-full object-cover transition-all"
                style={{ filter: isUnlocked ? 'none' : 'grayscale(1) blur(4px)', opacity: isUnlocked ? 1 : 0.45 }}
              />
            ) : (
              <span className="text-6xl">{isUnlocked ? '🦁' : '❓'}</span>
            )}
          </motion.div>

          <div className="flex items-center gap-2">
            {displayWord.map((item, idx) => {
              const ring = item.isMissing
                ? (result === 'correct' ? ARCADE.green : result === 'incorrect' ? ARCADE.pink : ARCADE.purple)
                : LETTER_RING[idx % LETTER_RING.length];
              const shadow = item.isMissing
                ? (result === 'correct' ? '#048A66' : result === 'incorrect' ? '#B8002E' : '#432F5E')
                : LETTER_SHADOW[idx % LETTER_SHADOW.length];
              return (
                <motion.div
                  key={idx}
                  initial={{ y: 20, opacity: 0, scale: 0.7 }}
                  animate={{
                    y: 0,
                    opacity: 1,
                    scale: 1,
                    x: item.isMissing && result === 'incorrect' ? [0, -4, 4, -4, 4, 0] : 0,
                  }}
                  transition={{ delay: idx * 0.05, type: 'spring', stiffness: 280, x: { duration: 0.4 } }}
                  className="h-14 w-12 flex items-center justify-center rounded-2xl border-4 text-2xl font-black"
                  style={{
                    background: item.isMissing ? (isUnlocked ? ARCADE.green : `${ARCADE.yellow}55`) : '#fff',
                    color: item.isMissing && isUnlocked ? '#fff' : ARCADE.navy,
                    borderColor: ring,
                    boxShadow: `0 5px 0 ${shadow}`,
                    fontFamily: "'Fredoka','Quicksand',sans-serif",
                    borderStyle: item.isMissing && !isUnlocked ? 'dashed' : 'solid',
                  }}
                >
                  {item.isMissing ? (
                    isUnlocked ? (
                      item.char.toUpperCase()
                    ) : (
                      <input
                        type="text"
                        maxLength={1}
                        value={inputLetter}
                        onChange={e => setInputLetter(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="w-full h-full text-center bg-transparent outline-none text-2xl font-black uppercase"
                        autoFocus
                        disabled={isUnlocked}
                        style={{ color: ARCADE.purple, fontFamily: "'Fredoka','Quicksand',sans-serif" }}
                      />
                    )
                  ) : (
                    item.char.toUpperCase()
                  )}
                </motion.div>
              );
            })}
          </div>

          {!isUnlocked && (
            <ArcadeButton tone="green" onClick={handleSubmit} disabled={!inputLetter}>
              <Check className="h-4 w-4 mr-1" /> Check
            </ArcadeButton>
          )}

          <AnimatePresence>
            {isUnlocked && (
              <motion.p
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="text-xl font-black text-center"
                style={{ color: ARCADE.green, fontFamily: "'Fredoka','Quicksand',sans-serif" }}
              >
                LEVEL CLEAR! The word is "{targetWord}" 🎉
              </motion.p>
            )}
          </AnimatePresence>

          {attempts > 0 && !isUnlocked && (
            <p className="text-xs font-bold" style={{ color: ARCADE.purple }}>
              Attempts: {attempts} — keep going! 💪
            </p>
          )}
        </div>
      </ArcadeFrame>
    </div>
  );
};

export default LetterHunt;
