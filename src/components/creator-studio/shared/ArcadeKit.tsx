import React from 'react';
import { motion } from 'framer-motion';

/**
 * ArcadeKit — Bright-arcade UI primitives for Playground activities.
 * Goal: every slide should *feel* like a mini-game (neon borders,
 * chunky buttons, score HUD, animated marquee headers).
 *
 * Palette (locked): #FF4D6D pink, #FFD60A yellow, #06D6A0 green,
 * #118AB2 blue, #6A4C93 purple. Background bands use deep navy
 * #1A1A40 so neon pops.
 */

export const ARCADE = {
  pink: '#FF4D6D',
  yellow: '#FFD60A',
  green: '#06D6A0',
  blue: '#118AB2',
  purple: '#6A4C93',
  navy: '#1A1A40',
  cream: '#FFF8E7',
};

interface FrameProps {
  title: string;
  emoji?: string;
  score?: number;
  total?: number;
  /** Right-side HUD content (timer, lives, etc) */
  hud?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/** Arcade cabinet frame around the activity. Transparent — sits over the
 *  slide's GameBackground. */
export const ArcadeFrame: React.FC<FrameProps> = ({
  title, emoji, score, total, hud, children, className,
}) => {
  return (
    <div
      className={`relative w-full max-w-5xl mx-auto rounded-[28px] p-1 ${className || ''}`}
      style={{
        background: `linear-gradient(135deg, ${ARCADE.pink}, ${ARCADE.yellow}, ${ARCADE.green}, ${ARCADE.blue})`,
        boxShadow: `0 18px 50px -12px ${ARCADE.pink}66, 0 0 0 4px rgba(255,255,255,0.35) inset`,
      }}
    >
      <div
        className="rounded-[24px] overflow-hidden relative"
        style={{
          // Arcade background lives INSIDE the card so the slide itself has visual texture.
          background: `
            radial-gradient(circle at 18% 22%, ${ARCADE.yellow}33 0, transparent 38%),
            radial-gradient(circle at 82% 78%, ${ARCADE.pink}33 0, transparent 42%),
            radial-gradient(circle at 50% 50%, ${ARCADE.blue}22 0, transparent 55%),
            linear-gradient(160deg, #1A1A40 0%, #2a1b54 55%, #1A1A40 100%)
          `,
          backgroundColor: ARCADE.navy,
        }}
      >
        {/* Marquee header */}
        <div
          className="flex items-center justify-between px-5 py-3 border-b-4"
          style={{
            background: `repeating-linear-gradient(45deg, ${ARCADE.navy} 0 14px, #2a2a5a 14px 28px)`,
            borderColor: ARCADE.yellow,
          }}
        >
          <motion.h2
            className="text-xl md:text-2xl font-black uppercase tracking-wide flex items-center gap-2"
            style={{
              fontFamily: "'Fredoka','Quicksand',sans-serif",
              color: ARCADE.yellow,
              textShadow: `2px 2px 0 ${ARCADE.pink}, 4px 4px 0 rgba(0,0,0,0.25)`,
              letterSpacing: '0.06em',
            }}
            animate={{ y: [0, -2, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          >
            {emoji && <span className="text-2xl drop-shadow">{emoji}</span>}
            {title}
          </motion.h2>

          <div className="flex items-center gap-2">
            {typeof score === 'number' && typeof total === 'number' && (
              <ScoreBadge score={score} total={total} />
            )}
            {hud}
          </div>
        </div>

        {/* Body */}
        <div className="relative p-5 md:p-6">{children}</div>
      </div>
    </div>
  );
};

export const ScoreBadge: React.FC<{ score: number; total: number }> = ({ score, total }) => (
  <div
    className="px-3 py-1.5 rounded-full font-black text-sm tabular-nums flex items-center gap-1.5"
    style={{
      background: ARCADE.yellow,
      color: ARCADE.navy,
      boxShadow: `0 3px 0 ${ARCADE.pink}, 0 0 0 2px ${ARCADE.navy} inset`,
      fontFamily: "'Fredoka','Quicksand',sans-serif",
    }}
  >
    ⭐ {score}/{total}
  </div>
);

interface ArcadeButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: 'pink' | 'yellow' | 'green' | 'blue' | 'purple';
  size?: 'sm' | 'md' | 'lg';
  active?: boolean;
  matched?: boolean;
  wrong?: boolean;
}

const TONE_MAP = {
  pink:   { bg: ARCADE.pink,   shadow: '#B8002E' },
  yellow: { bg: ARCADE.yellow, shadow: '#C49A00' },
  green:  { bg: ARCADE.green,  shadow: '#048A66' },
  blue:   { bg: ARCADE.blue,   shadow: '#0A5F7E' },
  purple: { bg: ARCADE.purple, shadow: '#432F5E' },
};

/** Chunky 3D-style arcade button. */
export const ArcadeButton = React.forwardRef<HTMLButtonElement, ArcadeButtonProps>(
  ({ tone = 'pink', size = 'md', active, matched, wrong, className, children, style, ...rest }, ref) => {
    const t = TONE_MAP[tone];
    const sizeCls = size === 'lg' ? 'px-7 py-4 text-xl' : size === 'sm' ? 'px-3 py-2 text-sm' : 'px-5 py-3 text-base';
    const effectBg = matched ? ARCADE.green : wrong ? ARCADE.pink : active ? ARCADE.yellow : t.bg;
    const effectShadow = matched ? '#048A66' : wrong ? '#B8002E' : active ? '#C49A00' : t.shadow;
    const fg = matched || tone === 'yellow' || active ? ARCADE.navy : '#fff';
    return (
      <button
        ref={ref}
        className={`relative inline-flex items-center justify-center font-black rounded-2xl uppercase tracking-wide transition-transform active:translate-y-[3px] active:shadow-none ${sizeCls} ${className || ''}`}
        style={{
          background: effectBg,
          color: fg,
          fontFamily: "'Fredoka','Quicksand',sans-serif",
          boxShadow: `0 5px 0 ${effectShadow}, 0 0 0 3px rgba(0,0,0,0.15) inset`,
          textShadow: matched || tone === 'yellow' || active ? 'none' : '1px 1px 0 rgba(0,0,0,0.25)',
          ...style,
        }}
        {...rest}
      >
        {children}
      </button>
    );
  }
);
ArcadeButton.displayName = 'ArcadeButton';

/** Pill-shaped chip — for category labels, droptarget headers. */
export const ArcadeChip: React.FC<{
  tone?: 'pink' | 'yellow' | 'green' | 'blue' | 'purple';
  children: React.ReactNode;
  className?: string;
}> = ({ tone = 'blue', children, className }) => {
  const t = TONE_MAP[tone];
  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${className || ''}`}
      style={{
        background: t.bg,
        color: tone === 'yellow' ? ARCADE.navy : '#fff',
        boxShadow: `0 2px 0 ${t.shadow}`,
        fontFamily: "'Fredoka','Quicksand',sans-serif",
      }}
    >
      {children}
    </span>
  );
};

/** Dashed droptarget zone with bouncy hover. */
export const ArcadeDropZone: React.FC<{
  active?: boolean;
  filled?: boolean;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}> = ({ active, filled, children, className, style }) => (
  <motion.div
    animate={filled ? { scale: [1, 1.04, 1] } : active ? { scale: 1.03 } : { scale: 1 }}
    transition={{ duration: 0.3 }}
    className={`rounded-3xl border-4 border-dashed flex flex-col items-center justify-center transition-colors ${className || ''}`}
    style={{
      borderColor: filled ? ARCADE.green : active ? ARCADE.yellow : ARCADE.pink,
      background: filled
        ? 'rgba(6,214,160,0.18)'
        : active
        ? 'rgba(255,214,10,0.22)'
        : 'rgba(255,255,255,0.7)',
      boxShadow: filled
        ? `0 0 0 4px ${ARCADE.green}33, inset 0 0 30px rgba(6,214,160,0.15)`
        : `inset 0 0 20px rgba(255,77,109,0.08)`,
      ...style,
    }}
  >
    {children}
  </motion.div>
);

/** Animated streak / combo flash. */
export const ComboFlash: React.FC<{ combo: number }> = ({ combo }) => {
  if (combo < 2) return null;
  return (
    <motion.div
      key={combo}
      initial={{ scale: 0, rotate: -15, opacity: 0 }}
      animate={{ scale: 1, rotate: -8, opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute -top-3 -right-3 z-20 px-3 py-1 rounded-full font-black text-sm pointer-events-none"
      style={{
        background: ARCADE.yellow,
        color: ARCADE.navy,
        boxShadow: `0 4px 0 ${ARCADE.pink}`,
        fontFamily: "'Fredoka','Quicksand',sans-serif",
      }}
    >
      x{combo} COMBO!
    </motion.div>
  );
};
