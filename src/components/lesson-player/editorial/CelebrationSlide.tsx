import React, { useEffect, useState } from 'react';
import { getEditorialTheme } from './editorialHubTheme';
import { Trophy, PartyPopper, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CelebrationSlideProps {
  lessonTitle: string;
  topic?: string;
  hub?: string;
  onFinish?: () => void;
}

// Simple CSS-based confetti
function ConfettiPiece({ delay, left, color }: { delay: number; left: number; color: string }) {
  return (
    <div
      className="absolute w-2 h-3 rounded-sm animate-confetti-fall"
      style={{
        left: `${left}%`,
        animationDelay: `${delay}s`,
        backgroundColor: color,
        top: '-10px',
      }}
    />
  );
}

const CONFETTI_COLORS = ['#F59E0B', '#3B82F6', '#10B981', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316'];

export default function CelebrationSlide({ lessonTitle, topic, hub, onFinish }: CelebrationSlideProps) {
  const theme = getEditorialTheme(hub);
  const [showConfetti, setShowConfetti] = useState(true);
  const [secondsLeft, setSecondsLeft] = useState(6);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  // Auto-redirect: count down then trigger onFinish (which routes back to dashboard)
  useEffect(() => {
    if (!onFinish) return;
    if (secondsLeft <= 0) {
      onFinish();
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft, onFinish]);

  const confettiPieces = Array.from({ length: 40 }, (_, i) => ({
    delay: Math.random() * 2,
    left: Math.random() * 100,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  }));


  return (
    <div className="relative w-full h-full min-h-[520px] flex flex-col items-center justify-center overflow-hidden">
      {/* Confetti */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
          {confettiPieces.map((p, i) => (
            <ConfettiPiece key={i} {...p} />
          ))}
        </div>
      )}

      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${theme.primary}15 0%, white 40%, ${theme.primaryLight} 100%)`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-8 text-center max-w-2xl">
        {/* Trophy icon */}
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center shadow-lg"
          style={{ backgroundColor: theme.primaryLight }}
        >
          <Trophy className="w-12 h-12" style={{ color: theme.primary }} />
        </div>

        {/* Congrats heading */}
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2">
            <PartyPopper className="w-6 h-6 text-amber-500" />
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-slate-800">
              Congratulations!
            </h1>
            <PartyPopper className="w-6 h-6 text-amber-500 scale-x-[-1]" />
          </div>
          <p className="text-xl text-slate-600">
            You mastered <strong className="text-slate-800">{topic || lessonTitle}</strong>
          </p>
        </div>

        {/* Stats placeholder */}
        <div className="flex gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold" style={{ color: theme.primary }}>✓</div>
            <p className="text-xs text-slate-500 mt-1">Lesson Complete</p>
          </div>
        </div>

        {/* Finish button */}
        {onFinish && (
          <div className="flex flex-col items-center gap-2">
            <Button
              onClick={onFinish}
              className={`px-8 py-3 text-base font-semibold rounded-full shadow-lg ${theme.buttonClass}`}
            >
              Finish Lesson <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <p className="text-xs text-slate-500">
              Returning to your dashboard in {secondsLeft}s…
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
