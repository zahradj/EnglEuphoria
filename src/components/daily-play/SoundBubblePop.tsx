import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  target: { sound: string; audio?: string }; // text label + optional audio src
  distractors: string[];
  correctCount?: number;
  onComplete?: () => void;
}

interface Bubble {
  id: number;
  label: string;
  isCorrect: boolean;
  left: number; // %
  duration: number; // seconds
  color: string;
  delay: number; // s
  born: number; // timestamp ms
}

const COLORS = ['#FE6A2F', '#FFB703', '#22c55e', '#06b6d4', '#a855f7', '#ec4899'];

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function makeBubble(id: number, target: string, distractors: string[]): Bubble {
  const correct = Math.random() < 0.55;
  const label = correct
    ? target
    : distractors[Math.floor(Math.random() * Math.max(distractors.length, 1))] ?? '?';
  return {
    id,
    label,
    isCorrect: correct,
    left: rand(6, 88),
    duration: rand(5.5, 8.5),
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    delay: rand(0, 0.4),
    born: Date.now(),
  };
}

export default function SoundBubblePop({ target, distractors, correctCount = 4, onComplete }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const idRef = useRef(0);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [done, setDone] = useState(false);
  const [shakeId, setShakeId] = useState<number | null>(null);

  const playSound = () => {
    if (audioRef.current && target.audio) {
      try {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => undefined);
      } catch {
        /* ignore */
      }
    }
  };

  // Play on mount.
  useEffect(() => {
    const t = setTimeout(playSound, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Spawner: maintain ~6 bubbles on screen.
  useEffect(() => {
    if (done) return;
    const interval = setInterval(() => {
      setBubbles((prev) => {
        const alive = prev.filter((b) => Date.now() - b.born < (b.duration + 1) * 1000);
        if (alive.length >= 6) return alive;
        const next = [...alive];
        while (next.length < 6) {
          idRef.current += 1;
          next.push(makeBubble(idRef.current, target.sound, distractors));
        }
        return next;
      });
    }, 700);
    return () => clearInterval(interval);
  }, [done, target.sound, distractors]);

  const onPop = (b: Bubble) => {
    if (done) return;
    if (b.isCorrect) {
      const nh = hits + 1;
      setHits(nh);
      confetti({ particleCount: 18, spread: 50, origin: { y: 0.7 }, colors: ['#22c55e', '#FE6A2F'] });
      setBubbles((prev) => prev.filter((x) => x.id !== b.id));
      if (nh >= correctCount) {
        setDone(true);
        confetti({ particleCount: 90, spread: 80, origin: { y: 0.5 }, colors: ['#22c55e', '#FE6A2F', '#FFB703'] });
        onComplete?.();
      }
    } else {
      setMisses((m) => m + 1);
      setShakeId(b.id);
      setTimeout(() => setShakeId((s) => (s === b.id ? null : s)), 350);
    }
  };

  const progressPct = useMemo(() => Math.round((hits / correctCount) * 100), [hits, correctCount]);

  return (
    <div className="w-full">
      {target.audio && <audio ref={audioRef} src={target.audio} preload="auto" />}

      <div className="flex items-center justify-between mb-3 px-1 gap-3">
        <button
          onClick={playSound}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 active:scale-95 transition text-white font-extrabold rounded-full px-4 py-2 shadow"
        >
          <Volume2 className="w-4 h-4" />
          Listen again
        </button>
        <div className="flex-1 h-3 bg-orange-100 rounded-full overflow-hidden border-2 border-orange-200">
          <motion.div
            className="h-full bg-gradient-to-r from-green-400 to-green-600"
            animate={{ width: `${progressPct}%` }}
            transition={{ type: 'spring', stiffness: 200, damping: 24 }}
          />
        </div>
        <span className="text-xs font-extrabold text-green-700 bg-green-100 border-2 border-green-300 rounded-full px-3 py-1 whitespace-nowrap">
          {hits}/{correctCount}
        </span>
      </div>

      <p className="text-xs text-slate-500 text-center mb-2">
        Pop the bubbles that say <span className="text-orange-600 font-bold">"{target.sound}"</span>
        {misses > 0 && <span className="ml-2 text-rose-500">Oops: {misses}</span>}
      </p>

      <div className="relative w-full rounded-3xl bg-gradient-to-b from-sky-50 to-orange-50 border-4 border-orange-200 overflow-hidden h-[420px] sm:h-[480px]">
        <AnimatePresence>
          {bubbles.map((b) => (
            <motion.button
              key={b.id}
              onClick={() => onPop(b)}
              initial={{ y: '110%', opacity: 0, scale: 0.6 }}
              animate={
                shakeId === b.id
                  ? { x: [-8, 8, -6, 6, 0], y: '-20%', opacity: 1, scale: 1, transition: { duration: 0.35 } }
                  : { y: '-20%', opacity: 1, scale: 1, transition: { duration: b.duration, delay: b.delay, ease: 'linear', opacity: { duration: 0.4 }, scale: { duration: 0.4 } } }
              }
              exit={{ scale: 1.4, opacity: 0, transition: { duration: 0.25 } }}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.9 }}
              style={{ left: `${b.left}%`, backgroundColor: b.color }}
              className="absolute bottom-0 -translate-x-1/2 rounded-full w-16 h-16 sm:w-20 sm:h-20 text-white text-base sm:text-lg font-extrabold shadow-lg border-4 border-white/60 flex items-center justify-center select-none"
              aria-label={`Bubble ${b.label}`}
            >
              {b.label}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
