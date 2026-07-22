import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GeneratedSlide } from '@/components/admin/lesson-builder/ai-wizard/types';
import { soundEffectsService } from '@/services/soundEffectsService';
import { Mic, Square, CheckCircle2 } from 'lucide-react';
import { ArcadeFrame, ArcadeChip, ARCADE } from '@/components/creator-studio/shared/ArcadeKit';
import { GameFX } from '@/components/creator-studio/shared/GameFX';

interface Props {
  slide: GeneratedSlide;
  onCorrect: () => void;
  onIncorrect?: () => void;
}

export default function PhonicsSlider({ slide, onCorrect, onIncorrect }: Props) {
  const [isRecording, setIsRecording] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [waveValues, setWaveValues] = useState<number[]>(Array(20).fill(0.1));
  const [winFx, setWinFx] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const phoneme: string = slide.content?.phonemeTarget || slide.content?.title || '/a/';
  const masterWave = Array(20).fill(0).map((_, i) => 0.3 + Math.sin(i * 0.8) * 0.5);

  const startRecording = useCallback(() => {
    setIsRecording(true);
    intervalRef.current = setInterval(() => {
      setWaveValues(prev => prev.map(() => 0.1 + Math.random() * 0.85));
    }, 90);
  }, []);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    const simulatedAccuracy = Math.min(95, 60 + newAttempts * 12 + Math.random() * 10);
    const acc = Math.round(simulatedAccuracy);
    setAccuracy(acc);
    setShowResult(true);
    if (acc >= 80) {
      soundEffectsService.playCorrect();
      setWinFx(v => v + 1);
      setTimeout(() => onCorrect(), 1200);
    } else {
      soundEffectsService.playIncorrect();
      onIncorrect?.();
    }
  }, [attempts, onCorrect, onIncorrect]);

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <ArcadeFrame
        title="Phonics Slider"
        emoji="🎤"
        hud={<ArcadeChip tone="pink">Hold → Record</ArcadeChip>}
      >
        <div className="relative flex flex-col items-center gap-4">
          <GameFX trigger={winFx} variant="confetti" message="Perfect sound! 🎉" />

          <p className="text-sm font-bold text-center" style={{ color: ARCADE.navy, opacity: 0.75 }}>
            Hold the button and say the sound, then release
          </p>

          {/* Target Phoneme bubble */}
          <motion.div
            animate={{ scale: isRecording ? [1, 1.08, 1] : 1, rotate: isRecording ? [0, -3, 3, 0] : 0 }}
            transition={{ repeat: isRecording ? Infinity : 0, duration: 0.7 }}
            className="h-28 w-28 rounded-full flex items-center justify-center"
            style={{
              background: `radial-gradient(circle at 30% 30%, ${ARCADE.yellow}, ${ARCADE.pink})`,
              boxShadow: `0 10px 0 ${ARCADE.purple}, 0 0 0 4px #fff inset, 0 0 24px ${ARCADE.pink}66`,
            }}
          >
            <span className="font-mono text-4xl font-black text-white drop-shadow">
              {phoneme}
            </span>
          </motion.div>

          {/* Master waveform */}
          <div className="w-full max-w-md">
            <ArcadeChip tone="green" className="mb-1.5">Master Sound</ArcadeChip>
            <div
              className="flex items-end justify-center gap-1 h-12 rounded-xl p-2"
              style={{ background: `${ARCADE.green}22`, border: `3px solid ${ARCADE.green}` }}
            >
              {masterWave.map((v, i) => (
                <div
                  key={i}
                  className="w-2 rounded-full"
                  style={{ height: `${v * 100}%`, background: ARCADE.green }}
                />
              ))}
            </div>
          </div>

          {/* Student waveform */}
          <div className="w-full max-w-md">
            <ArcadeChip tone="purple" className="mb-1.5">Your Sound</ArcadeChip>
            <div
              className="flex items-end justify-center gap-1 h-12 rounded-xl p-2"
              style={{
                background: isRecording ? `${ARCADE.pink}22` : `${ARCADE.navy}11`,
                border: `3px solid ${isRecording ? ARCADE.pink : ARCADE.purple}`,
              }}
            >
              {waveValues.map((v, i) => (
                <motion.div
                  key={i}
                  className="w-2 rounded-full"
                  animate={{ height: `${v * 100}%` }}
                  transition={{ duration: 0.08 }}
                  style={{ background: isRecording ? ARCADE.pink : ARCADE.purple }}
                />
              ))}
            </div>
          </div>

          {/* Record button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            animate={isRecording ? { scale: [1, 1.08, 1] } : { scale: 1 }}
            transition={{ repeat: isRecording ? Infinity : 0, duration: 0.6 }}
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onMouseLeave={isRecording ? stopRecording : undefined}
            onTouchStart={startRecording}
            onTouchEnd={stopRecording}
            className="h-20 w-20 rounded-full flex items-center justify-center text-white"
            style={{
              background: isRecording ? ARCADE.pink : ARCADE.green,
              boxShadow: `0 8px 0 ${isRecording ? '#B8002E' : '#048A66'}, 0 0 0 4px #fff inset`,
            }}
          >
            {isRecording ? <Square className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
          </motion.button>

          <AnimatePresence>
            {showResult && accuracy !== null && (
              <motion.div
                initial={{ opacity: 0, y: 14, scale: 0.85 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-2xl px-5 py-3 text-center"
                style={{
                  background: '#fff',
                  border: `4px solid ${accuracy >= 80 ? ARCADE.green : ARCADE.yellow}`,
                  boxShadow: `0 5px 0 ${accuracy >= 80 ? '#048A66' : '#C49A00'}`,
                }}
              >
                <p
                  className="text-2xl font-black"
                  style={{ color: accuracy >= 80 ? ARCADE.green : ARCADE.purple, fontFamily: "'Fredoka','Quicksand',sans-serif" }}
                >
                  {accuracy}%
                </p>
                {accuracy >= 80 ? (
                  <p className="text-xs font-bold flex items-center gap-1 justify-center" style={{ color: ARCADE.green }}>
                    <CheckCircle2 className="h-3.5 w-3.5" /> LEVEL CLEAR!
                  </p>
                ) : (
                  <p className="text-xs font-bold" style={{ color: ARCADE.navy }}>
                    Try again — hold longer 💪
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ArcadeFrame>
    </div>
  );
}
