import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GeneratedSlide } from '@/components/admin/lesson-builder/ai-wizard/types';
import { soundEffectsService } from '@/services/soundEffectsService';
import { Mic, Play, CheckCircle2 } from 'lucide-react';
import { ArcadeFrame, ArcadeButton, ArcadeChip, ARCADE } from '@/components/creator-studio/shared/ArcadeKit';
import { GameFX } from '@/components/creator-studio/shared/GameFX';

interface Props {
  slide: GeneratedSlide;
  onCorrect: () => void;
  onIncorrect?: () => void;
}

const MOUTH_SHAPES: Record<string, { hint: string }> = {
  '/æ/': { hint: 'Open mouth wide, tongue low and front' },
  '/iː/': { hint: 'Smile position, tongue high' },
  '/ʃ/': { hint: 'Round lips like "shh"' },
  '/θ/': { hint: 'Tongue tip between teeth' },
  '/r/': { hint: 'Curl tongue tip back' },
};

export default function MouthMirror({ slide, onCorrect, onIncorrect }: Props) {
  const [step, setStep] = useState<'watch' | 'record' | 'result'>('watch');
  const [isRecording, setIsRecording] = useState(false);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [animPhase, setAnimPhase] = useState(0);
  const [winFx, setWinFx] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const phoneme: string = slide.content?.phonemeTarget || '/æ/';
  const shape = MOUTH_SHAPES[phoneme] || MOUTH_SHAPES['/æ/'];

  const playAnimation = useCallback(() => {
    setAnimPhase(0);
    let phase = 0;
    intervalRef.current = setInterval(() => {
      phase++;
      setAnimPhase(phase);
      if (phase >= 4) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setStep('record');
      }
    }, 600);
  }, []);

  const handleRecord = useCallback(() => {
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      const acc = Math.round(Math.min(98, 55 + newAttempts * 15 + Math.random() * 10));
      setAccuracy(acc);
      setStep('result');
      if (acc >= 75) {
        soundEffectsService.playCorrect();
        setWinFx(v => v + 1);
        setTimeout(() => onCorrect(), 1200);
      } else {
        soundEffectsService.playIncorrect();
        onIncorrect?.();
      }
    }, 2000);
  }, [attempts, onCorrect, onIncorrect]);

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <ArcadeFrame
        title="Mouth Mirror"
        emoji="👄"
        hud={<ArcadeChip tone="pink">Watch → Mimic</ArcadeChip>}
      >
        <div className="relative flex flex-col items-center gap-4">
          <GameFX trigger={winFx} variant="confetti" message="Great articulation! 🎉" />

          <p className="text-sm font-bold text-center" style={{ color: ARCADE.navy, opacity: 0.75 }}>
            Watch the mouth shape, then say the sound out loud
          </p>

          {/* Mouth Visualization (arcade) */}
          <div className="relative">
            <motion.div
              animate={{
                borderRadius: animPhase >= 2 ? '50% 50% 50% 50%' : '40% 40% 60% 60%',
                scaleY: animPhase >= 1 ? 1.3 : 1,
                scaleX: animPhase >= 3 ? 1.25 : 1,
              }}
              transition={{ duration: 0.4 }}
              className="h-40 w-40 flex items-center justify-center"
              style={{
                background: `radial-gradient(circle at 30% 30%, ${ARCADE.yellow}, ${ARCADE.pink})`,
                border: `5px solid ${ARCADE.navy}`,
                boxShadow: `0 8px 0 ${ARCADE.purple}, 0 0 0 4px #fff inset`,
              }}
            >
              <motion.div
                animate={{ y: animPhase >= 2 ? -8 : 0, scaleX: animPhase >= 3 ? 1.3 : 1 }}
                className="h-6 w-20 rounded-full"
                style={{ background: ARCADE.navy, boxShadow: `0 3px 0 rgba(0,0,0,0.3)` }}
              />
            </motion.div>
            <div
              className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-xs text-center w-52 font-bold px-3 py-1 rounded-full"
              style={{
                background: '#fff',
                color: ARCADE.navy,
                border: `2px solid ${ARCADE.yellow}`,
                boxShadow: `0 2px 0 ${ARCADE.pink}`,
                fontFamily: "'Fredoka','Quicksand',sans-serif",
              }}
            >
              {shape.hint}
            </div>
          </div>

          <div className="h-2" />

          {/* Phoneme bubble */}
          <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{ repeat: Infinity, duration: 1.8 }}
            className="h-16 w-16 rounded-full flex items-center justify-center"
            style={{
              background: '#fff',
              border: `4px solid ${ARCADE.purple}`,
              boxShadow: `0 5px 0 ${ARCADE.pink}`,
            }}
          >
            <span
              className="font-mono text-2xl font-black"
              style={{ color: ARCADE.purple, fontFamily: "'Fredoka','Quicksand',sans-serif" }}
            >
              {phoneme}
            </span>
          </motion.div>

          {step === 'watch' && (
            <ArcadeButton tone="blue" onClick={playAnimation}>
              <Play className="h-5 w-5 mr-1" /> Watch Mouth
            </ArcadeButton>
          )}

          {step === 'record' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <ArcadeButton
                tone={isRecording ? 'pink' : 'green'}
                onClick={handleRecord}
                disabled={isRecording}
              >
                <Mic className="h-5 w-5 mr-1" />
                {isRecording ? 'Recording…' : 'Your Turn — Record'}
              </ArcadeButton>
            </motion.div>
          )}

          <AnimatePresence>
            {step === 'result' && accuracy !== null && (
              <motion.div
                initial={{ opacity: 0, y: 14, scale: 0.85 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="rounded-2xl px-5 py-3 text-center"
                style={{
                  background: '#fff',
                  border: `4px solid ${accuracy >= 75 ? ARCADE.green : ARCADE.yellow}`,
                  boxShadow: `0 5px 0 ${accuracy >= 75 ? '#048A66' : '#C49A00'}`,
                }}
              >
                <p
                  className="text-2xl font-black"
                  style={{
                    color: accuracy >= 75 ? ARCADE.green : ARCADE.purple,
                    fontFamily: "'Fredoka','Quicksand',sans-serif",
                  }}
                >
                  {accuracy}%
                </p>
                {accuracy >= 75 ? (
                  <p className="text-xs font-bold flex items-center gap-1 justify-center" style={{ color: ARCADE.green }}>
                    <CheckCircle2 className="h-3.5 w-3.5" /> LEVEL CLEAR!
                  </p>
                ) : (
                  <button
                    onClick={() => setStep('watch')}
                    className="text-xs underline font-bold mt-1"
                    style={{ color: ARCADE.purple }}
                  >
                    Watch again & retry
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ArcadeFrame>
    </div>
  );
}
