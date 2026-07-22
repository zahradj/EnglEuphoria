import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

/**
 * Juicy celebration FX for Playground slides.
 *
 * Renders briefly when `trigger` increments (use a counter, not a boolean).
 * Bright-arcade palette only.
 */
const COLORS = ['#FF4D6D', '#FFD60A', '#06D6A0', '#118AB2', '#FF8FA3', '#FFE066'];

type Variant = 'confetti' | 'sparkle' | 'pop';

interface Props {
  trigger: number;
  variant?: Variant;
  durationMs?: number;
  /** Center text bubble e.g. "Great!" */
  message?: string;
}

export const GameFX: React.FC<Props> = ({ trigger, variant = 'confetti', durationMs = 1400, message }) => {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (trigger <= 0) return;
    setActive(true);
    const t = setTimeout(() => setActive(false), durationMs);
    return () => clearTimeout(t);
  }, [trigger, durationMs]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-50 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          aria-hidden
        >
          {variant === 'confetti' && <Confetti reduce={!!reduce} />}
          {variant === 'sparkle' && <Sparkle reduce={!!reduce} />}
          {variant === 'pop' && <Pop reduce={!!reduce} />}
          {message && (
            <motion.div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white/95 border-4 border-[#FFD60A] px-6 py-3 text-2xl font-black text-[#FF4D6D] shadow-lg"
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.5, y: 20 }}
              animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.8, y: -10 }}
              transition={{ type: 'spring', stiffness: 320, damping: 18 }}
            >
              {message}
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const Confetti: React.FC<{ reduce: boolean }> = ({ reduce }) => {
  if (reduce) return null;
  const pieces = Array.from({ length: 28 });
  return (
    <>
      {pieces.map((_, i) => {
        const color = COLORS[i % COLORS.length];
        const angle = -90 + (i / pieces.length) * 360;
        const dist = 200 + (i % 5) * 40;
        const rad = (angle * Math.PI) / 180;
        const dx = Math.cos(rad) * dist;
        const dy = Math.sin(rad) * dist;
        return (
          <motion.span
            key={i}
            className="absolute left-1/2 top-1/2"
            style={{ width: 10, height: 14, background: color, borderRadius: 2 }}
            initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
            animate={{ x: dx, y: dy + 200, opacity: 0, rotate: 720 }}
            transition={{ duration: 1.3, ease: 'easeOut' }}
          />
        );
      })}
    </>
  );
};

const Sparkle: React.FC<{ reduce: boolean }> = ({ reduce }) => {
  if (reduce) return null;
  return (
    <>
      {Array.from({ length: 14 }).map((_, i) => {
        const x = 20 + Math.random() * 60;
        const y = 20 + Math.random() * 60;
        return (
          <motion.span
            key={i}
            className="absolute text-2xl"
            style={{ left: `${x}%`, top: `${y}%` }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 1, 0], scale: [0, 1.2, 0], rotate: 180 }}
            transition={{ duration: 1, delay: i * 0.04 }}
          >
            ✨
          </motion.span>
        );
      })}
    </>
  );
};

const Pop: React.FC<{ reduce: boolean }> = ({ reduce }) => {
  if (reduce) return null;
  return (
    <motion.div
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
      style={{ width: 60, height: 60, background: 'radial-gradient(circle, #FFD60A 0%, #FF4D6D 70%, transparent 80%)' }}
      initial={{ scale: 0, opacity: 1 }}
      animate={{ scale: 8, opacity: 0 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
    />
  );
};
