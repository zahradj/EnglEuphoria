import { motion } from 'framer-motion';

/* ---------- Robo, drawn in code (Pre-A1 Unit 4 Lesson 6) ----------
 * A friendly silver robot whose body parts can each light up and be tapped:
 * head, eyes, ears, nose, mouth, shoulders, arms, hands, knees, feet. Big,
 * round and smiling (matches the Robo sticker, item-robot.png). Every part
 * has a generous hit area so small fingers land it on a phone. */

export const ROBO_PARTS = ['head', 'eyes', 'ears', 'nose', 'mouth', 'shoulders', 'arms', 'hands', 'knees', 'feet'] as const;
export type RoboPart = (typeof ROBO_PARTS)[number];

const INK = '#334155';
const METAL = '#E2E8F0';
const METAL_DARK = '#94A3B8';
const BLUE = '#3B82F6';
const GLOW = '#FDE047';

export function RoboArt({ lit, hint, onPart }: {
  /** Parts shining right now. */
  lit?: RoboPart[];
  /** A soft pulsing ring on this part (help after two misses). */
  hint?: RoboPart | null;
  onPart?: (part: RoboPart) => void;
}) {
  const on = (p: RoboPart) => lit?.includes(p);
  const tap = (p: RoboPart) => (onPart ? { onClick: () => onPart(p), style: { cursor: 'pointer' }, role: 'button', 'aria-label': p } : {});
  const fill = (p: RoboPart, base: string) => (on(p) ? GLOW : base);
  const ring = (p: RoboPart, cx: number, cy: number, rx: number, ry = rx) =>
    hint === p ? (
      <motion.ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={GLOW} strokeWidth="5"
        animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.1, repeat: Infinity }} />
    ) : null;
  /** A shining halo behind a lit part. */
  const halo = (p: RoboPart, cx: number, cy: number, rx: number, ry = rx) =>
    on(p) ? <motion.ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={GLOW} opacity={0.55} initial={{ scale: 0.6 }} animate={{ scale: [0.6, 1.15, 1] }} transition={{ duration: 0.35 }} style={{ transformOrigin: `${cx}px ${cy}px` }} /> : null;

  return (
    <svg viewBox="0 0 200 300" className="h-full w-full overflow-visible" aria-hidden={!onPart}>
      {/* Antenna. */}
      <line x1="100" y1="22" x2="100" y2="8" stroke={INK} strokeWidth="3" />
      <circle cx="100" cy="7" r="5" fill="#F87171" stroke={INK} strokeWidth="2.5" />

      {/* Legs + knees + feet. */}
      <g {...tap('knees')}>
        {halo('knees', 78, 236, 15)}{halo('knees', 122, 236, 15)}
        <rect x="71" y="200" width="14" height="60" rx="6" fill={METAL_DARK} stroke={INK} strokeWidth="2.5" />
        <rect x="115" y="200" width="14" height="60" rx="6" fill={METAL_DARK} stroke={INK} strokeWidth="2.5" />
        <circle cx="78" cy="236" r="10" fill={fill('knees', BLUE)} stroke={INK} strokeWidth="2.5" />
        <circle cx="122" cy="236" r="10" fill={fill('knees', BLUE)} stroke={INK} strokeWidth="2.5" />
        {ring('knees', 78, 236, 15)}{ring('knees', 122, 236, 15)}
        {/* Bigger invisible hit area. */}
        <rect x="58" y="222" width="84" height="28" fill="transparent" />
      </g>
      <g {...tap('feet')}>
        {halo('feet', 74, 274, 26, 14)}{halo('feet', 126, 274, 26, 14)}
        <path d="M54 282 Q54 262 76 262 Q94 262 94 282 Z" fill={fill('feet', METAL)} stroke={INK} strokeWidth="2.5" />
        <path d="M106 282 Q106 262 124 262 Q146 262 146 282 Z" fill={fill('feet', METAL)} stroke={INK} strokeWidth="2.5" />
        {ring('feet', 74, 274, 26, 14)}{ring('feet', 126, 274, 26, 14)}
      </g>

      {/* Arms + hands (behind the body). */}
      <g {...tap('arms')}>
        {halo('arms', 40, 165, 12, 30)}{halo('arms', 160, 165, 12, 30)}
        <rect x="32" y="138" width="16" height="56" rx="8" fill={fill('arms', METAL_DARK)} stroke={INK} strokeWidth="2.5" />
        <rect x="152" y="138" width="16" height="56" rx="8" fill={fill('arms', METAL_DARK)} stroke={INK} strokeWidth="2.5" />
        {ring('arms', 40, 165, 13, 31)}{ring('arms', 160, 165, 13, 31)}
      </g>
      <g {...tap('hands')}>
        {halo('hands', 40, 206, 17)}{halo('hands', 160, 206, 17)}
        <circle cx="40" cy="206" r="13" fill={fill('hands', METAL)} stroke={INK} strokeWidth="2.5" />
        <circle cx="160" cy="206" r="13" fill={fill('hands', METAL)} stroke={INK} strokeWidth="2.5" />
        <path d="M30 198 Q40 192 50 198" stroke={INK} strokeWidth="2" fill="none" />
        <path d="M150 198 Q160 192 170 198" stroke={INK} strokeWidth="2" fill="none" />
        {ring('hands', 40, 206, 18)}{ring('hands', 160, 206, 18)}
      </g>

      {/* Body. */}
      <rect x="52" y="122" width="96" height="86" rx="22" fill={METAL} stroke={INK} strokeWidth="3" />
      <circle cx="84" cy="168" r="7" fill={BLUE} stroke={INK} strokeWidth="2" />
      <circle cx="116" cy="168" r="7" fill={BLUE} stroke={INK} strokeWidth="2" />
      <rect x="86" y="186" width="28" height="8" rx="4" fill={METAL_DARK} />

      {/* Shoulders: round joints at the top corners of the body. */}
      <g {...tap('shoulders')}>
        {halo('shoulders', 50, 134, 16)}{halo('shoulders', 150, 134, 16)}
        <circle cx="50" cy="134" r="12" fill={fill('shoulders', BLUE)} stroke={INK} strokeWidth="2.5" />
        <circle cx="150" cy="134" r="12" fill={fill('shoulders', BLUE)} stroke={INK} strokeWidth="2.5" />
        {ring('shoulders', 50, 134, 17)}{ring('shoulders', 150, 134, 17)}
      </g>

      {/* Neck. */}
      <rect x="88" y="108" width="24" height="16" rx="4" fill={METAL_DARK} stroke={INK} strokeWidth="2.5" />

      {/* Head (the face plate itself is the "head" target; face parts sit on top). */}
      <g {...tap('head')}>
        {halo('head', 100, 66, 64, 50)}
        <rect x="44" y="22" width="112" height="90" rx="34" fill={fill('head', METAL)} stroke={INK} strokeWidth="3" />
        {ring('head', 100, 66, 66, 52)}
      </g>
      <g {...tap('ears')}>
        {halo('ears', 38, 66, 13, 18)}{halo('ears', 162, 66, 13, 18)}
        <rect x="30" y="50" width="16" height="32" rx="7" fill={fill('ears', BLUE)} stroke={INK} strokeWidth="2.5" />
        <rect x="154" y="50" width="16" height="32" rx="7" fill={fill('ears', BLUE)} stroke={INK} strokeWidth="2.5" />
        {ring('ears', 38, 66, 14, 20)}{ring('ears', 162, 66, 14, 20)}
      </g>
      <g {...tap('eyes')}>
        {halo('eyes', 77, 58, 18)}{halo('eyes', 123, 58, 18)}
        <circle cx="77" cy="58" r="14" fill={on('eyes') ? GLOW : '#fff'} stroke={INK} strokeWidth="3" />
        <circle cx="123" cy="58" r="14" fill={on('eyes') ? GLOW : '#fff'} stroke={INK} strokeWidth="3" />
        <circle cx="79" cy="60" r="7" fill={BLUE} /><circle cx="125" cy="60" r="7" fill={BLUE} />
        <circle cx="81" cy="56" r="2.5" fill="#fff" /><circle cx="127" cy="56" r="2.5" fill="#fff" />
        {ring('eyes', 77, 58, 19)}{ring('eyes', 123, 58, 19)}
      </g>
      <g {...tap('nose')}>
        {halo('nose', 100, 78, 11)}
        <circle cx="100" cy="78" r="7" fill={fill('nose', '#F87171')} stroke={INK} strokeWidth="2.5" />
        {ring('nose', 100, 78, 12)}
        <circle cx="100" cy="78" r="12" fill="transparent" />
      </g>
      <g {...tap('mouth')}>
        {halo('mouth', 100, 96, 22, 10)}
        <path d="M82 92 Q100 106 118 92 Z" fill={fill('mouth', '#7F1D1D')} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
        {ring('mouth', 100, 96, 24, 11)}
        <rect x="78" y="88" width="44" height="18" fill="transparent" />
      </g>
    </svg>
  );
}
