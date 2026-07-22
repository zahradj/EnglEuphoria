import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Star } from 'lucide-react';

interface PlaygroundCorrectBurstProps {
  /** Increments every time the student answers correctly. Drives the burst. */
  triggerKey: number;
  /** XP granted for the correct answer (default 100). */
  xp?: number;
  onComplete?: () => void;
}

/**
 * Full-screen Playground celebration: a canvas-confetti burst + a popping
 * "⭐ +XP" badge in the center of the screen. Mounted globally inside the
 * lesson player so any activity (drag-and-drop, speaking, MCQ…) automatically
 * gets the same kid-friendly reward when `onCorrect` fires.
 */
export function PlaygroundCorrectBurst({
  triggerKey,
  xp = 100,
  onComplete,
}: PlaygroundCorrectBurstProps) {
  useEffect(() => {
    if (triggerKey === 0) return;

    // Multi-origin confetti for a richer celebration.
    const fire = (
      particleRatio: number,
      opts: confetti.Options,
    ) => {
      confetti({
        ...opts,
        origin: { y: 0.65 },
        particleCount: Math.floor(160 * particleRatio),
        colors: ['#FE6A2F', '#FBBF24', '#38BDF8', '#FEFBDD', '#FFFFFF'],
        scalar: 1.1,
      });
    };

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.9 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });

    const t = setTimeout(() => onComplete?.(), 1600);
    return () => clearTimeout(t);
  }, [triggerKey, onComplete]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] flex items-center justify-center">
      <AnimatePresence>
        {triggerKey > 0 && (
          <motion.div
            key={triggerKey}
            initial={{ scale: 0.3, opacity: 0, y: 40, rotate: -8 }}
            animate={{
              scale: [0.3, 1.25, 1],
              opacity: 1,
              y: 0,
              rotate: [-8, 4, 0],
            }}
            exit={{ scale: 0.6, opacity: 0, y: -60 }}
            transition={{ duration: 0.7, ease: 'backOut' }}
            className="flex items-center gap-3 rounded-full border-4 border-white/90 bg-gradient-to-br from-[#FE6A2F] via-[#FBBF24] to-[#38BDF8] px-8 py-5 shadow-[0_18px_50px_-10px_rgba(254,106,47,0.55)]"
          >
            <motion.div
              animate={{ rotate: [0, -15, 15, -10, 10, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 0.9, ease: 'easeInOut' }}
            >
              <Star className="h-12 w-12 fill-white text-white drop-shadow" strokeWidth={2.5} />
            </motion.div>
            <span
              className="text-4xl font-extrabold tracking-tight text-white drop-shadow-[0_2px_0_rgba(0,0,0,0.18)]"
              style={{ fontFamily: "'Nunito', 'Quicksand', sans-serif" }}
            >
              +{xp} XP
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
