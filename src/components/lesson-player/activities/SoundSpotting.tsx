import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GeneratedSlide } from '@/components/admin/lesson-builder/ai-wizard/types';
import { Volume2, Check, X } from 'lucide-react';
import { ArcadeFrame, ArcadeButton, ArcadeChip, ARCADE } from '@/components/creator-studio/shared/ArcadeKit';
import { GameFX } from '@/components/creator-studio/shared/GameFX';

interface SoundSpottingProps {
  slide: GeneratedSlide;
  onCorrect?: () => void;
  onIncorrect?: () => void;
}

const SoundSpotting: React.FC<SoundSpottingProps> = ({ slide, onCorrect, onIncorrect }) => {
  const [tapCount, setTapCount] = useState(0);
  const [correctTaps, setCorrectTaps] = useState(0);
  const [incorrectTaps, setIncorrectTaps] = useState(0);
  const [showFeedback, setShowFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [phase, setPhase] = useState<'ready' | 'listening' | 'done'>('ready');
  const [timeLeft, setTimeLeft] = useState(15);
  const [winFx, setWinFx] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const phonemeTarget = slide.content?.phonemeTarget || '/a/';
  const targetWord = slide.content?.word || 'Apple';
  const imageUrl = slide.content?.imageUrl || slide.imageUrl;

  const startListening = useCallback(() => {
    setPhase('listening');
    setTapCount(0); setCorrectTaps(0); setIncorrectTaps(0); setTimeLeft(15);
    countdownRef.current = setInterval(() => {
      setTimeLeft(t => Math.max(0, t - 1));
    }, 1000);
    timerRef.current = setTimeout(() => {
      setPhase('done');
      if (countdownRef.current) clearInterval(countdownRef.current);
    }, 15000);
  }, []);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
  }, []);

  const handleTap = useCallback(() => {
    if (phase !== 'listening') return;
    setTapCount(prev => prev + 1);
    const isCorrectWindow = Math.random() > 0.3;
    if (isCorrectWindow) {
      setCorrectTaps(prev => prev + 1);
      setShowFeedback('correct');
      onCorrect?.();
    } else {
      setIncorrectTaps(prev => prev + 1);
      setShowFeedback('incorrect');
      onIncorrect?.();
    }
    setTimeout(() => setShowFeedback(null), 500);
  }, [phase, onCorrect, onIncorrect]);

  const accuracy = tapCount > 0 ? Math.round((correctTaps / tapCount) * 100) : 0;

  useEffect(() => {
    if (phase === 'done' && accuracy >= 70) setWinFx(v => v + 1);
  }, [phase, accuracy]);

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <ArcadeFrame
        title="Sound Spotting"
        emoji="🎧"
        score={correctTaps}
        total={Math.max(correctTaps + incorrectTaps, 1)}
        hud={
          <ArcadeChip tone={phase === 'listening' ? 'pink' : 'blue'}>
            {phase === 'listening' ? `⏱ ${timeLeft}s` : `Sound: ${phonemeTarget}`}
          </ArcadeChip>
        }
      >
        <div className="relative flex flex-col items-center gap-5">
          <GameFX trigger={winFx} variant="confetti" message="Sharp ears! 🎉" />

          <p className="text-sm font-bold text-center" style={{ color: ARCADE.navy, opacity: 0.75 }}>
            Tap the picture every time you hear <span className="font-mono font-black" style={{ color: ARCADE.pink }}>{phonemeTarget}</span>
          </p>

          <motion.button
            onClick={handleTap}
            disabled={phase !== 'listening'}
            whileTap={{ scale: 0.9 }}
            animate={
              phase === 'listening'
                ? { boxShadow: [`0 0 0 0 ${ARCADE.pink}88`, `0 0 0 20px ${ARCADE.pink}00`] }
                : {}
            }
            transition={{ repeat: Infinity, duration: 1.4 }}
            className="relative w-48 h-48 rounded-3xl overflow-hidden focus:outline-none"
            style={{
              border: `5px solid ${ARCADE.yellow}`,
              background: '#fff',
            }}
          >
            {imageUrl ? (
              <img src={imageUrl} alt={targetWord} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center" style={{ background: `${ARCADE.purple}11` }}>
                <span className="text-6xl">🦁</span>
              </div>
            )}
            <AnimatePresence>
              {showFeedback && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.4 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.4 }}
                  className="absolute inset-0 flex items-center justify-center"
                  style={{
                    background: showFeedback === 'correct' ? `${ARCADE.green}55` : `${ARCADE.pink}55`,
                  }}
                >
                  {showFeedback === 'correct'
                    ? <Check className="h-20 w-20 text-white drop-shadow-lg" />
                    : <X className="h-20 w-20 text-white drop-shadow-lg" />}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          <p className="text-lg font-black" style={{ color: ARCADE.navy, fontFamily: "'Fredoka','Quicksand',sans-serif" }}>
            {targetWord}
          </p>

          {phase === 'ready' && (
            <ArcadeButton tone="green" onClick={startListening}>
              <Volume2 className="h-5 w-5 mr-1" /> START!
            </ArcadeButton>
          )}

          {phase === 'listening' && (
            <div className="flex items-center gap-2">
              <motion.span
                className="block w-3 h-3 rounded-full"
                style={{ background: ARCADE.pink }}
                animate={{ scale: [1, 1.4, 1], opacity: [1, 0.4, 1] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
              />
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: ARCADE.pink }}>
                Listening… tap fast!
              </span>
            </div>
          )}

          {phase === 'done' && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="rounded-2xl px-5 py-3"
              style={{
                background: '#fff',
                border: `4px solid ${ARCADE.yellow}`,
                boxShadow: `0 6px 0 ${ARCADE.pink}`,
              }}
            >
              <div className="flex items-center justify-center gap-6">
                <Stat label="Correct" value={correctTaps} color={ARCADE.green} />
                <Stat label="Missed" value={incorrectTaps} color={ARCADE.pink} />
                <Stat label="Accuracy" value={`${accuracy}%`} color={ARCADE.purple} />
              </div>
            </motion.div>
          )}
        </div>
      </ArcadeFrame>
    </div>
  );
};

const Stat: React.FC<{ label: string; value: React.ReactNode; color: string }> = ({ label, value, color }) => (
  <div className="text-center">
    <p className="text-2xl font-black" style={{ color, fontFamily: "'Fredoka','Quicksand',sans-serif" }}>{value}</p>
    <p className="text-[10px] uppercase tracking-wider font-bold" style={{ color: ARCADE.navy, opacity: 0.7 }}>{label}</p>
  </div>
);

export default SoundSpotting;
