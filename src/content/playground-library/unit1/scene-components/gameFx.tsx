// "Game feel" kit for the Pre-A1 games (owner, 2026-10-03: "I need like an
// animation video game — the design of the games is very flat"). Spring-
// physics motion (framer-motion), a living looped background, particle
// bursts, a character that breathes, hops in an arc with squash & stretch,
// and a soft screen shake. Shared by the newer games; each stays readable
// without it (no video → the still picture; reduced motion → no shake).
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion';
import { STICKER_FILTER } from './shared';

/** The scene picture, brought to life by a seamless looping clip when there is one. */
export function LivingBg({ img, video }: { img: string; video?: string }) {
  const [ok, setOk] = useState(true);
  return (
    <div className="absolute inset-0 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${img})` }}>
      {video && ok && (
        <video
          key={video}
          src={video}
          poster={img}
          autoPlay
          muted
          loop
          playsInline
          onError={() => setOk(false)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
    </div>
  );
}

type BurstKind = 'stars' | 'splash' | 'sparkle' | 'confetti';
type Burst = { id: number; x: number; y: number; kind: BurstKind };
const BURST_GLYPHS: Record<BurstKind, string[]> = {
  stars: ['⭐', '✨', '🌟'],
  sparkle: ['✨', '💫'],
  splash: ['💧', '💦', '🫧'],
  confetti: ['🎉', '⭐', '💖', '🌈', '✨'],
};

/** Particle bursts at % positions: `fire(x, y, 'stars')`. Render `<Bursts items={bursts} />`. */
export function useBursts() {
  const [bursts, setBursts] = useState<Burst[]>([]);
  const uid = useRef(0);
  const fire = useCallback((x: number, y: number, kind: BurstKind = 'stars') => {
    const id = ++uid.current;
    setBursts((b) => [...b, { id, x, y, kind }]);
    window.setTimeout(() => setBursts((b) => b.filter((q) => q.id !== id)), 1200);
  }, []);
  return [bursts, fire] as const;
}

export function Bursts({ items }: { items: Burst[] }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-40 overflow-hidden">
      {items.map((b) => {
        const glyphs = BURST_GLYPHS[b.kind];
        const n = b.kind === 'splash' ? 9 : 12;
        return (
          <div key={b.id} className="absolute" style={{ left: `${b.x}%`, top: `${b.y}%` }}>
            {b.kind !== 'splash' && (
              <motion.span
                className="absolute -left-10 -top-10 block h-20 w-20 rounded-full border-4 border-yellow-200"
                initial={{ scale: 0.2, opacity: 0.9 }}
                animate={{ scale: 2.6, opacity: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            )}
            {Array.from({ length: n }, (_, i) => {
              const a = (i / n) * Math.PI * 2 + (b.id % 7) * 0.3;
              const r = b.kind === 'splash' ? 50 + (i % 3) * 18 : 70 + (i % 4) * 22;
              const up = b.kind === 'splash' ? -60 : 0;
              return (
                <motion.span
                  key={i}
                  className="absolute -translate-x-1/2 -translate-y-1/2 select-none"
                  style={{ fontSize: b.kind === 'splash' ? 22 : 26 }}
                  initial={{ x: 0, y: 0, scale: 0.3, opacity: 1, rotate: 0 }}
                  animate={{
                    x: Math.cos(a) * r,
                    y: [0, Math.sin(a) * r + up, Math.sin(a) * r + up + 70],
                    scale: [0.3, 1.2, 0.8],
                    opacity: [1, 1, 0],
                    rotate: (i % 2 ? 1 : -1) * 120,
                  }}
                  transition={{ duration: 1.05, ease: 'easeOut', times: [0, 0.45, 1] }}
                >
                  {glyphs[i % glyphs.length]}
                </motion.span>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

/** Floating "+1 ⭐" style text that rises and fades. */
export function FloatText({ show, x, y, children }: { show: boolean; x: number; y: number; children: ReactNode }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="pointer-events-none absolute z-40 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/95 px-4 py-1 text-xl font-black text-orange-600 shadow-xl"
          style={{ left: `${x}%`, top: `${y}%` }}
          initial={{ y: 10, opacity: 0, scale: 0.6 }}
          animate={{ y: -50, opacity: 1, scale: 1 }}
          exit={{ y: -90, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 16 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * A character that lives: breathes when idle, hops in an arc with squash &
 * stretch when its spot changes, and faces the way it moves.
 * x/y = feet position in % of the stage; width in %.
 */
export function Hopper({ img, alt, x, y, width, hopHeight = 14, walking = false }: { img: string; alt: string; x: number; y: number; width: number; hopHeight?: number; walking?: boolean }) {
  const prev = useRef({ x, y });
  const body = useAnimationControls();
  const [face, setFace] = useState(1);
  const [hop, setHop] = useState<{ fx: number; fy: number; tx: number; ty: number; k: number } | null>(null);

  useEffect(() => {
    const from = prev.current;
    prev.current = { x, y };
    if (Math.abs(x - from.x) > 0.5) setFace(x < from.x ? -1 : 1);
    if (walking || Math.abs(from.x - x) + Math.abs(from.y - y) < 0.5) return;
    setHop({ fx: from.x, fy: from.y, tx: x, ty: y, k: Date.now() });
    void body.start({ scaleY: [1, 0.78, 1.18, 0.86, 1], scaleX: [1, 1.18, 0.88, 1.12, 1], transition: { duration: 0.75, times: [0, 0.15, 0.5, 0.85, 1] } });
    const t = window.setTimeout(() => setHop(null), 780);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [x, y]);

  const peak = hop ? Math.min(hop.fy, hop.ty) - hopHeight : 0;
  return (
    <motion.div
      className="pointer-events-none absolute z-20"
      style={{ width: `${width}%`, translateX: '-50%', translateY: '-92%' }}
      initial={false}
      animate={hop ? { left: [`${hop.fx}%`, `${(hop.fx + hop.tx) / 2}%`, `${hop.tx}%`], top: [`${hop.fy}%`, `${peak}%`, `${hop.ty}%`] } : { left: `${x}%`, top: `${y}%` }}
      transition={hop ? { duration: 0.75, times: [0, 0.5, 1], ease: ['easeOut', 'easeIn'] } : { duration: 0 }}
    >
      {/* ground shadow */}
      <motion.span
        className="absolute bottom-[-4%] left-1/2 block h-[9%] w-[70%] -translate-x-1/2 rounded-[50%] bg-black/25 blur-[2px]"
        animate={{ scaleX: [1, 0.9, 1] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div animate={body} style={{ transformOrigin: '50% 100%' }}>
        <motion.div style={{ scaleX: face, transformOrigin: '50% 100%' }}>
          <motion.img
            src={img}
            alt={alt}
            draggable={false}
            className="relative w-full"
            style={{ filter: STICKER_FILTER, transformOrigin: '50% 100%' }}
            animate={walking ? { y: [0, -8, 0], rotate: [-3, 3, -3] } : { scaleY: [1, 1.035, 1] }}
            transition={walking ? { duration: 0.32, repeat: Infinity } : { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/** Soft screen shake for a wrong answer: wrap the play area, call `shake()`. */
export function useShake() {
  const controls = useAnimationControls();
  const shake = useCallback(() => {
    const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (!reduce) void controls.start({ x: [0, -10, 10, -7, 7, -3, 0], transition: { duration: 0.45 } });
  }, [controls]);
  return [controls, shake] as const;
}

/** Idle float for collectables / answer cards (staggered by index). */
export const idleFloat = (i: number) => ({
  animate: { y: [0, -7, 0], rotate: [-2, 2, -2] },
  transition: { duration: 2.2 + (i % 3) * 0.35, repeat: Infinity, ease: 'easeInOut' as const, delay: (i % 4) * 0.25 },
});
