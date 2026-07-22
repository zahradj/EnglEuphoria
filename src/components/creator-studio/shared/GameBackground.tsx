import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * Animated game-style backdrops for Playground slides.
 *
 * Bright-arcade palette (locked):
 *   coral  #FF4D6D · sunshine #FFD60A · mint #06D6A0 · cobalt #118AB2
 *
 * All scenes are pure SVG + CSS/framer-motion — no images, no 3D.
 * Respects prefers-reduced-motion (animations are reduced, not removed).
 */

export type GameBackgroundTheme =
  | 'none'
  | 'arcade'
  | 'jungle'
  | 'ocean'
  | 'candy'
  | 'space'
  | 'castle'
  | 'farm'
  | 'classroom';

export const GAME_BACKGROUND_THEMES: ReadonlyArray<{
  id: GameBackgroundTheme;
  label: string;
  emoji: string;
}> = [
  { id: 'none', label: 'None', emoji: '⬜' },
  { id: 'arcade', label: 'Arcade', emoji: '🕹️' },
  { id: 'jungle', label: 'Jungle', emoji: '🌴' },
  { id: 'ocean', label: 'Ocean', emoji: '🌊' },
  { id: 'candy', label: 'Candy', emoji: '🍭' },
  { id: 'space', label: 'Space', emoji: '🚀' },
  { id: 'castle', label: 'Castle', emoji: '🏰' },
  { id: 'farm', label: 'Farm', emoji: '🌻' },
  { id: 'classroom', label: 'Classroom', emoji: '🏫' },
];

interface Props {
  theme?: GameBackgroundTheme;
  /** Children render above the backdrop. */
  children?: React.ReactNode;
  className?: string;
}

export const GameBackground: React.FC<Props> = ({ theme = 'none', children, className }) => {
  const reduce = useReducedMotion();
  if (theme === 'none') return <>{children}</>;
  return (
    <div className={cn('absolute inset-0 overflow-hidden', className)}>
      <Scene theme={theme} reduce={!!reduce} />
      <div className="relative z-10 h-full w-full">{children}</div>
    </div>
  );
};

/* ─────────────────────────── Scenes ─────────────────────────── */

const Scene: React.FC<{ theme: GameBackgroundTheme; reduce: boolean }> = ({ theme, reduce }) => {
  switch (theme) {
    case 'arcade':    return <Arcade reduce={reduce} />;
    case 'jungle':    return <Jungle reduce={reduce} />;
    case 'ocean':     return <Ocean reduce={reduce} />;
    case 'candy':     return <Candy reduce={reduce} />;
    case 'space':     return <Space reduce={reduce} />;
    case 'castle':    return <Castle reduce={reduce} />;
    case 'farm':      return <Farm reduce={reduce} />;
    case 'classroom': return <Classroom reduce={reduce} />;
    default:          return null;
  }
};

/* helpers */
const float = (reduce: boolean, distance = 10, dur = 6) =>
  reduce
    ? { animate: { y: 0 }, transition: { duration: 0 } }
    : { animate: { y: [0, -distance, 0] }, transition: { duration: dur, repeat: Infinity, ease: 'easeInOut' as const } };

const drift = (reduce: boolean, x = 30, dur = 18) =>
  reduce
    ? { animate: { x: 0 }, transition: { duration: 0 } }
    : { animate: { x: [0, x, 0] }, transition: { duration: dur, repeat: Infinity, ease: 'linear' as const } };

const pulse = (reduce: boolean) =>
  reduce
    ? { animate: { scale: 1 }, transition: { duration: 0 } }
    : { animate: { scale: [1, 1.06, 1] }, transition: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' as const } };

const Layer: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={cn('absolute inset-0 pointer-events-none', className)}>{children}</div>
);

/* ─────────────── ARCADE ─────────────── */
const Arcade: React.FC<{ reduce: boolean }> = ({ reduce }) => (
  <Layer>
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,#118AB2,#0a3d52_70%)]" />
    {/* scan-grid */}
    <svg className="absolute inset-0 w-full h-full opacity-30" preserveAspectRatio="none" viewBox="0 0 100 60">
      <defs>
        <linearGradient id="grid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#06D6A0" stopOpacity="0" />
          <stop offset="100%" stopColor="#06D6A0" stopOpacity="0.6" />
        </linearGradient>
      </defs>
      {Array.from({ length: 11 }).map((_, i) => (
        <line key={`v${i}`} x1={i * 10} y1="30" x2={i * 10} y2="60" stroke="url(#grid)" strokeWidth="0.2" />
      ))}
      {Array.from({ length: 8 }).map((_, i) => (
        <line key={`h${i}`} x1="0" y1={30 + i * 4} x2="100" y2={30 + i * 4} stroke="url(#grid)" strokeWidth="0.2" />
      ))}
    </svg>
    {/* sunset disc */}
    <motion.div
      className="absolute left-1/2 top-[18%] -translate-x-1/2 w-44 h-44 rounded-full"
      style={{ background: 'radial-gradient(circle, #FFD60A 0%, #FF4D6D 70%)' }}
      {...pulse(reduce)}
    />
    {/* floating coins */}
    {[15, 50, 85].map((x, i) => (
      <motion.div
        key={i}
        className="absolute w-5 h-5 rounded-full bg-[#FFD60A] border-2 border-[#FF4D6D]"
        style={{ left: `${x}%`, top: '70%' }}
        {...float(reduce, 18, 4 + i)}
      />
    ))}
  </Layer>
);

/* ─────────────── JUNGLE ─────────────── */
const Jungle: React.FC<{ reduce: boolean }> = ({ reduce }) => (
  <Layer>
    <div className="absolute inset-0 bg-[linear-gradient(180deg,#9be7ff_0%,#fff5b0_55%,#06D6A0_100%)]" />
    {/* sun */}
    <div className="absolute right-10 top-8 w-16 h-16 rounded-full bg-[#FFD60A] shadow-[0_0_60px_#FFD60A]" />
    {/* hills */}
    <svg className="absolute inset-x-0 bottom-0 w-full" viewBox="0 0 100 30" preserveAspectRatio="none">
      <path d="M0 20 Q25 5 50 18 T100 16 V30 H0 Z" fill="#06D6A0" />
      <path d="M0 26 Q30 14 60 24 T100 22 V30 H0 Z" fill="#0a8d6b" />
    </svg>
    {/* leaves drifting */}
    {[10, 35, 70].map((x, i) => (
      <motion.div key={i} className="absolute text-3xl" style={{ left: `${x}%`, top: '20%' }} {...drift(reduce, 30, 14 + i * 3)}>
        🍃
      </motion.div>
    ))}
  </Layer>
);

/* ─────────────── OCEAN ─────────────── */
const Ocean: React.FC<{ reduce: boolean }> = ({ reduce }) => (
  <Layer>
    <div className="absolute inset-0 bg-[linear-gradient(180deg,#9be7ff_0%,#118AB2_60%,#073b66_100%)]" />
    {/* bubbles */}
    {Array.from({ length: 12 }).map((_, i) => {
      const x = (i * 8.3) % 100;
      const size = 10 + (i % 4) * 6;
      return (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white/30 border border-white/40"
          style={{ left: `${x}%`, bottom: '-10%', width: size, height: size }}
          animate={reduce ? { y: 0 } : { y: ['0%', '-700%'] }}
          transition={reduce ? { duration: 0 } : { duration: 9 + (i % 5), repeat: Infinity, delay: i * 0.4, ease: 'easeOut' }}
        />
      );
    })}
    {/* fish */}
    <motion.div className="absolute text-4xl" style={{ left: '0%', top: '55%' }} {...drift(reduce, 800, 22)}>
      🐠
    </motion.div>
  </Layer>
);

/* ─────────────── CANDY ─────────────── */
const Candy: React.FC<{ reduce: boolean }> = ({ reduce }) => (
  <Layer>
    <div className="absolute inset-0 bg-[linear-gradient(180deg,#ffd2e1_0%,#FF4D6D_100%)]" />
    <svg className="absolute inset-0 w-full h-full opacity-25" viewBox="0 0 100 60" preserveAspectRatio="none">
      <defs>
        <pattern id="dots" width="6" height="6" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="3" r="1.2" fill="#FFD60A" />
        </pattern>
      </defs>
      <rect width="100" height="60" fill="url(#dots)" />
    </svg>
    {/* lollipops */}
    {['🍭', '🍬', '🧁', '🍩'].map((emoji, i) => (
      <motion.div key={i} className="absolute text-4xl" style={{ left: `${10 + i * 22}%`, top: `${15 + (i % 2) * 50}%` }} {...float(reduce, 12, 5 + i)}>
        {emoji}
      </motion.div>
    ))}
  </Layer>
);

/* ─────────────── SPACE ─────────────── */
const Space: React.FC<{ reduce: boolean }> = ({ reduce }) => (
  <Layer>
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#3a1d6b_0%,#0a0a2e_70%)]" />
    {/* stars */}
    {Array.from({ length: 40 }).map((_, i) => {
      const x = (i * 137.5) % 100;
      const y = (i * 53.3) % 100;
      return (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-white"
          style={{ left: `${x}%`, top: `${y}%` }}
          animate={reduce ? { opacity: 1 } : { opacity: [0.3, 1, 0.3] }}
          transition={reduce ? { duration: 0 } : { duration: 2 + (i % 3), repeat: Infinity, delay: i * 0.1 }}
        />
      );
    })}
    {/* planet */}
    <motion.div
      className="absolute right-8 top-10 w-20 h-20 rounded-full"
      style={{ background: 'radial-gradient(circle at 30% 30%, #FFD60A, #FF4D6D)' }}
      {...pulse(reduce)}
    />
    {/* rocket */}
    <motion.div className="absolute text-4xl" style={{ left: '5%', top: '70%' }} {...float(reduce, 25, 4)}>🚀</motion.div>
  </Layer>
);

/* ─────────────── CASTLE ─────────────── */
const Castle: React.FC<{ reduce: boolean }> = ({ reduce }) => (
  <Layer>
    <div className="absolute inset-0 bg-[linear-gradient(180deg,#ffd6a5_0%,#FF4D6D_100%)]" />
    {/* castle silhouette */}
    <svg className="absolute inset-x-0 bottom-0 w-full" viewBox="0 0 100 40" preserveAspectRatio="none">
      <path d="M0 40 V20 H10 V12 H14 V20 H22 V8 H28 V20 H38 V14 H46 V20 H58 V8 H64 V20 H72 V14 H82 V20 H90 V12 H94 V20 H100 V40 Z" fill="#3a1d6b" />
      <rect x="44" y="24" width="8" height="16" fill="#FFD60A" />
    </svg>
    {/* flags */}
    {[20, 50, 80].map((x, i) => (
      <motion.div key={i} className="absolute text-2xl" style={{ left: `${x}%`, top: '10%' }} {...float(reduce, 8, 3 + i)}>🚩</motion.div>
    ))}
  </Layer>
);

/* ─────────────── FARM ─────────────── */
const Farm: React.FC<{ reduce: boolean }> = ({ reduce }) => (
  <Layer>
    <div className="absolute inset-0 bg-[linear-gradient(180deg,#cfeff9_0%,#fff5b0_55%,#a8d676_100%)]" />
    {/* clouds */}
    {[10, 60].map((x, i) => (
      <motion.div key={i} className="absolute text-5xl" style={{ left: `${x}%`, top: `${10 + i * 8}%` }} {...drift(reduce, 60, 22 + i * 4)}>☁️</motion.div>
    ))}
    {/* fields */}
    <svg className="absolute inset-x-0 bottom-0 w-full" viewBox="0 0 100 25" preserveAspectRatio="none">
      <path d="M0 25 V12 Q50 4 100 12 V25 Z" fill="#06D6A0" />
      <path d="M0 25 V18 Q50 14 100 18 V25 Z" fill="#0a8d6b" />
    </svg>
    {[30, 65].map((x, i) => (
      <div key={i} className="absolute text-3xl" style={{ left: `${x}%`, top: '60%' }}>{i === 0 ? '🐄' : '🐑'}</div>
    ))}
  </Layer>
);

/* ─────────────── CLASSROOM ─────────────── */
const Classroom: React.FC<{ reduce: boolean }> = ({ reduce }) => (
  <Layer>
    <div className="absolute inset-0 bg-[linear-gradient(180deg,#fff8e1_0%,#ffe0b2_100%)]" />
    {/* blackboard */}
    <div className="absolute left-[10%] right-[10%] top-[15%] h-[45%] rounded-xl bg-[#06D6A0] border-[6px] border-[#8b5a2b] shadow-inner" />
    {/* abc letters floating */}
    {['A', 'B', 'C', '1', '2', '3'].map((ch, i) => (
      <motion.div
        key={i}
        className="absolute font-black text-2xl text-[#FF4D6D]"
        style={{ left: `${10 + i * 13}%`, top: `${72 + (i % 2) * 6}%` }}
        {...float(reduce, 10, 3 + i * 0.4)}
      >
        {ch}
      </motion.div>
    ))}
  </Layer>
);
