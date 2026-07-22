import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Flame, Sparkles, Clock } from 'lucide-react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import DailyMemoryPlay, { type MemoryPair } from './DailyMemoryPlay';
import SoundBubblePop from './SoundBubblePop';
import {
  DAILY_XP_BONUS,
  getDailyPlayState,
  getTodayGameKey,
  markDailyPlayCompleted,
  msUntilLocalMidnight,
  type DailyPlayState,
} from './dailyPlayStore';

const SAMPLE_PAIRS: MemoryPair[] = [
  { word: 'APPLE', image: '/playground/placeholder-dropzone.svg' },
  { word: 'SUN', image: '/playground/placeholder-dropzone.svg' },
  { word: 'CAT', image: '/playground/placeholder-dropzone.svg' },
  { word: 'BOOK', image: '/playground/placeholder-dropzone.svg' },
];

const SAMPLE_BUBBLE = {
  target: { sound: 'SH' },
  distractors: ['CH', 'TH', 'S', 'F', 'P'],
};

function useCountdown(ms: number) {
  const [remaining, setRemaining] = useState(ms);
  useEffect(() => {
    setRemaining(ms);
    const id = setInterval(() => setRemaining((r) => Math.max(0, r - 1000)), 1000);
    return () => clearInterval(id);
  }, [ms]);
  const h = Math.floor(remaining / 3_600_000);
  const m = Math.floor((remaining % 3_600_000) / 60_000);
  return `${h}h ${m}m`;
}

export default function DailyDiscoveryHub() {
  const [state, setState] = useState<DailyPlayState>(() => getDailyPlayState());
  const todayKey = useMemo(() => getTodayGameKey(), []);
  const todayISO = new Date().toISOString().slice(0, 10);
  const completed = state.lastCompletedISODate === todayISO;
  const countdown = useCountdown(msUntilLocalMidnight());

  const onComplete = () => {
    if (state.lastCompletedISODate === todayISO) return;
    const next = markDailyPlayCompleted();
    setState(next);
    confetti({ particleCount: 140, spread: 90, origin: { y: 0.5 }, colors: ['#22c55e', '#FE6A2F', '#FFB703'] });
    toast.success(`+${DAILY_XP_BONUS} XP Daily Streak Bonus!`, {
      description: `Streak: ${next.streak} day${next.streak === 1 ? '' : 's'} 🔥`,
    });
  };

  return (
    <section className="w-full max-w-3xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-orange-600 flex items-center gap-2">
            <Sparkles className="w-6 h-6" /> Daily Discovery
          </h1>
          <p className="text-sm text-slate-600">One quick play. Resets every 24 hours.</p>
        </div>
        <div className="flex items-center gap-2 bg-orange-100 text-orange-700 border-2 border-orange-300 rounded-full px-3 py-1.5 font-extrabold shadow-sm">
          <Flame className="w-4 h-4" />
          {state.streak}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-white border-4 border-orange-200 shadow-lg p-4 sm:p-6"
      >
        {completed ? (
          <div className="flex flex-col items-center text-center gap-3 py-6">
            <div className="w-20 h-20 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg">
              <Check className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-green-700">All done for today!</h2>
            <p className="text-sm text-slate-600 max-w-sm">
              You earned a <span className="font-extrabold text-orange-600">+{DAILY_XP_BONUS} XP Daily Streak Bonus</span>. Come back tomorrow for a new game.
            </p>
            <div className="mt-2 flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-100 rounded-full px-3 py-1.5">
              <Clock className="w-3.5 h-3.5" /> Next play in {countdown}
            </div>
          </div>
        ) : todayKey === 'memory' ? (
          <DailyMemoryPlay pairs={SAMPLE_PAIRS} onComplete={onComplete} />
        ) : (
          <SoundBubblePop target={SAMPLE_BUBBLE.target} distractors={SAMPLE_BUBBLE.distractors} onComplete={onComplete} />
        )}
      </motion.div>
    </section>
  );
}
