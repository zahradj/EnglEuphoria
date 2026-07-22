import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GeneratedSlide } from '@/components/admin/lesson-builder/ai-wizard/types';
import { supabase } from '@/integrations/supabase/client';
import { Volume2, Check, Ear } from 'lucide-react';
import { ArcadeFrame, ArcadeButton, ArcadeChip, ARCADE } from '@/components/creator-studio/shared/ArcadeKit';
import { GameFX } from '@/components/creator-studio/shared/GameFX';
import { soundEffectsService } from '@/services/soundEffectsService';

interface SoundTriggerProps {
  slide: GeneratedSlide;
  onCorrect?: () => void;
  onIncorrect?: () => void;
  sessionId?: string;
}

const EMOJIS = ['🦁', '🍎', '🐱', '🐕'];
const TONES: Array<'pink' | 'yellow' | 'green' | 'blue'> = ['pink', 'yellow', 'green', 'blue'];
const RING_SHADOW: Record<string, string> = {
  pink: '#B8002E', yellow: '#C49A00', green: '#048A66', blue: '#0A5F7E',
};

const SoundTrigger: React.FC<SoundTriggerProps> = ({ slide, onCorrect, onIncorrect, sessionId }) => {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [result, setResult] = useState<'correct' | 'incorrect' | null>(null);
  const [isWaiting, setIsWaiting] = useState(true);
  const [winFx, setWinFx] = useState(0);

  const phonemeTarget = slide.content?.phonemeTarget || '/l/';
  const options: string[] = slide.content?.options || ['Lion', 'Apple', 'Cat', 'Dog'];
  const correctIndex = 0;

  useEffect(() => {
    if (!sessionId) { setIsWaiting(false); return; }
    const channel = supabase
      .channel(`sound-trigger-${sessionId}`)
      .on('broadcast', { event: 'sound_trigger' }, () => setIsWaiting(false))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [sessionId]);

  const handleSelect = useCallback((index: number) => {
    if (result === 'correct') return;
    setSelectedId(index);
    if (index === correctIndex) {
      setResult('correct');
      setWinFx(v => v + 1);
      soundEffectsService.playCorrect();
      onCorrect?.();
    } else {
      setResult('incorrect');
      soundEffectsService.playIncorrect();
      onIncorrect?.();
      setTimeout(() => { setResult(null); setSelectedId(null); }, 1000);
    }
  }, [result, onCorrect, onIncorrect]);

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <ArcadeFrame
        title="Sound Trigger"
        emoji="👂"
        hud={
          <ArcadeChip tone="purple">
            <Ear className="h-3 w-3 mr-1" /> {isWaiting ? 'Waiting...' : phonemeTarget}
          </ArcadeChip>
        }
      >
        <div className="relative flex flex-col items-center gap-5">
          <GameFX trigger={winFx} variant="confetti" message="Perfect ear! 🎉" />

          <p className="text-sm font-bold text-center" style={{ color: ARCADE.navy, opacity: 0.75 }}>
            {isWaiting
              ? 'Wait for the teacher to play the sound…'
              : <>Which picture matches <span className="font-mono font-black" style={{ color: ARCADE.pink }}>{phonemeTarget}</span>?</>}
          </p>

          {isWaiting && (
            <div className="flex flex-col items-center gap-4">
              <motion.div
                className="w-24 h-24 rounded-full flex items-center justify-center"
                style={{
                  background: `radial-gradient(circle at 30% 30%, ${ARCADE.yellow}, ${ARCADE.pink})`,
                  boxShadow: `0 8px 0 ${ARCADE.purple}, 0 0 24px ${ARCADE.pink}66`,
                }}
                animate={{ scale: [1, 1.1, 1], rotate: [0, -4, 4, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <Volume2 className="h-10 w-10 text-white" />
              </motion.div>
              {!sessionId && (
                <ArcadeButton tone="blue" size="sm" onClick={() => setIsWaiting(false)}>
                  Play sound (practice)
                </ArcadeButton>
              )}
            </div>
          )}

          {!isWaiting && (
            <div className="grid grid-cols-2 gap-4 max-w-md w-full">
              {options.map((word, idx) => {
                const tone = TONES[idx % TONES.length];
                const isThis = selectedId === idx;
                const matched = isThis && result === 'correct';
                const wrong = isThis && result === 'incorrect';
                const ring = matched ? ARCADE.green : wrong ? ARCADE.pink : ({
                  pink: ARCADE.pink, yellow: ARCADE.yellow, green: ARCADE.green, blue: ARCADE.blue,
                } as Record<string, string>)[tone];
                const shadow = matched ? '#048A66' : wrong ? '#B8002E' : RING_SHADOW[tone];
                return (
                  <motion.button
                    key={idx}
                    onClick={() => handleSelect(idx)}
                    disabled={result === 'correct'}
                    initial={{ opacity: 0, y: 20, scale: 0.7 }}
                    animate={{
                      opacity: 1, y: 0,
                      scale: wrong ? [1, 1.08, 0.95, 1] : matched ? [1, 1.12, 1] : 1,
                      x: wrong ? [0, -3, 3, -3, 3, 0] : 0,
                    }}
                    transition={{ delay: idx * 0.07, type: 'spring', stiffness: 280 }}
                    whileHover={!result ? { y: -4, rotate: -2 } : undefined}
                    whileTap={!result ? { scale: 0.95 } : undefined}
                    className="relative p-4 rounded-3xl border-4 text-center"
                    style={{
                      background: matched ? `${ARCADE.green}22` : wrong ? `${ARCADE.pink}22` : '#fff',
                      borderColor: ring,
                      boxShadow: `0 6px 0 ${shadow}`,
                    }}
                  >
                    <div
                      className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-2"
                      style={{ background: `${ARCADE.yellow}33`, border: `3px solid ${ARCADE.yellow}` }}
                    >
                      <span className="text-3xl">{EMOJIS[idx % EMOJIS.length]}</span>
                    </div>
                    <p className="text-sm font-black" style={{ color: ARCADE.navy, fontFamily: "'Fredoka','Quicksand',sans-serif" }}>
                      {word}
                    </p>
                    {matched && (
                      <motion.div
                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                        className="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center"
                        style={{ background: ARCADE.green, boxShadow: `0 3px 0 #048A66` }}
                      >
                        <Check className="h-4 w-4 text-white" />
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          )}

          <AnimatePresence>
            {result === 'correct' && (
              <motion.p
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="text-lg font-black"
                style={{ color: ARCADE.green, fontFamily: "'Fredoka','Quicksand',sans-serif" }}
              >
                LEVEL CLEAR! That's {phonemeTarget} ✨
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </ArcadeFrame>
    </div>
  );
};

export default SoundTrigger;
