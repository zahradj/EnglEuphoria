import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { GeneratedSlide } from '@/components/admin/lesson-builder/ai-wizard/types';
import { soundEffectsService } from '@/services/soundEffectsService';
import { ArcadeFrame, ArcadeButton, ArcadeChip, ComboFlash, ARCADE } from '@/components/creator-studio/shared/ArcadeKit';
import { GameFX } from '@/components/creator-studio/shared/GameFX';

interface TimeAttackProps {
  slide: GeneratedSlide;
  onCorrect: () => void;
  onIncorrect?: () => void;
}

export default function TimeAttack({ slide, onCorrect, onIncorrect }: TimeAttackProps) {
  const pairs = slide.content?.matchPairs || [
    { word: 'Hello', image: 'Bonjour' },
    { word: 'Goodbye', image: 'Au revoir' },
    { word: 'Please', image: "S'il vous plaît" },
    { word: 'Thank you', image: 'Merci' },
  ];

  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [popFx, setPopFx] = useState(0);
  const [winFx, setWinFx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [pickedCorrect, setPickedCorrect] = useState<boolean | null>(null);

  const buildOptions = useCallback((idx: number) => {
    const correct = pairs[idx % pairs.length].image;
    const wrong = pairs
      .filter((_, i) => i !== idx % pairs.length)
      .map((p) => p.image)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    return [correct, ...wrong].sort(() => Math.random() - 0.5);
  }, [pairs]);

  useEffect(() => { setOptions(buildOptions(0)); }, []);

  useEffect(() => {
    if (gameOver) return;
    if (timeLeft <= 0) {
      setGameOver(true);
      if (score > 0) { setWinFx((n) => n + 1); onCorrect(); }
      return;
    }
    const t = setTimeout(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, gameOver]);

  useEffect(() => {
    if (timeLeft <= 5 && timeLeft > 0 && !gameOver) {
      soundEffectsService.playTimerWarning();
    }
  }, [timeLeft, gameOver]);

  const handleAnswer = (ans: string) => {
    if (gameOver || picked) return;
    const correct = pairs[currentIdx % pairs.length].image;
    setPicked(ans);
    if (ans === correct) {
      setPickedCorrect(true);
      setScore((s) => s + 1);
      setCombo((c) => c + 1);
      setPopFx((n) => n + 1);
      soundEffectsService.playCorrect();
    } else {
      setPickedCorrect(false);
      setCombo(0);
      soundEffectsService.playIncorrect();
      onIncorrect?.();
    }
    setTimeout(() => {
      const next = currentIdx + 1;
      setCurrentIdx(next);
      setOptions(buildOptions(next));
      setPicked(null);
      setPickedCorrect(null);
    }, 450);
  };

  const timerPct = (timeLeft / 30) * 100;
  const currentWord = pairs[currentIdx % pairs.length]?.word || '';

  if (gameOver) {
    return (
      <div className="w-full p-4">
        <ArcadeFrame title="Time's Up!" emoji="⏱️">
          <div className="relative flex flex-col items-center gap-3 py-6">
            <GameFX trigger={winFx} variant="confetti" message={`${score} pts! 🏆`} durationMs={2000} />
            <span className="text-6xl">🏆</span>
            <p className="text-2xl font-black" style={{ color: ARCADE.navy, fontFamily: "'Fredoka','Quicksand',sans-serif" }}>
              You matched <span style={{ color: ARCADE.pink }}>{score}</span> words!
            </p>
          </div>
        </ArcadeFrame>
      </div>
    );
  }

  return (
    <div className="w-full p-4">
      <ArcadeFrame
        title="Time Attack"
        emoji="⚡"
        score={score}
        total={pairs.length * 2}
        hud={<ArcadeChip tone={timeLeft <= 5 ? 'pink' : 'green'}>⏱ {timeLeft}s</ArcadeChip>}
      >
        <div className="relative">
          <GameFX trigger={popFx} variant="pop" />
          <ComboFlash combo={combo} />

          {/* Timer bar */}
          <div
            className="w-full h-4 rounded-full overflow-hidden mb-6"
            style={{ background: 'rgba(26,26,64,0.15)', boxShadow: 'inset 0 2px 0 rgba(0,0,0,0.1)' }}
          >
            <motion.div
              className="h-full"
              style={{
                background: timeLeft <= 5
                  ? `linear-gradient(90deg, ${ARCADE.pink}, #FF8FA3)`
                  : `linear-gradient(90deg, ${ARCADE.green}, ${ARCADE.yellow})`,
                boxShadow: timeLeft <= 5 ? `0 0 12px ${ARCADE.pink}` : `0 0 12px ${ARCADE.green}`,
              }}
              animate={{ width: `${timerPct}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <motion.div
            key={currentIdx}
            initial={{ scale: 0.6, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
            className="text-center text-4xl md:text-5xl font-black py-6"
            style={{
              fontFamily: "'Fredoka','Quicksand',sans-serif",
              color: ARCADE.navy,
              textShadow: `2px 2px 0 ${ARCADE.yellow}`,
            }}
          >
            {currentWord}
          </motion.div>

          <div className="grid grid-cols-2 gap-3">
            {options.map((opt, i) => {
              const isThis = picked === opt;
              const tone: 'pink' | 'yellow' | 'green' | 'blue' | 'purple' =
                (['blue', 'purple', 'pink', 'green'][i % 4] as any);
              return (
                <ArcadeButton
                  key={`${currentIdx}-${opt}`}
                  tone={tone}
                  size="lg"
                  matched={isThis && pickedCorrect === true}
                  wrong={isThis && pickedCorrect === false}
                  onClick={() => handleAnswer(opt)}
                  disabled={!!picked}
                >
                  {opt}
                </ArcadeButton>
              );
            })}
          </div>
        </div>
      </ArcadeFrame>
    </div>
  );
}
