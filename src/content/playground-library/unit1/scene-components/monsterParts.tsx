import { useState } from 'react';
import { motion } from 'framer-motion';

/* ---------- A friendly monster, drawn in code (Pre-A1 Unit 4 Lesson 4) ----------
 * Shared by Monster Maker and How Many?. Every part is optional and countable,
 * so a game can build the monster part by part ("I have three eyes!") or let
 * the child tap each eye to count it. Round, soft and smiling on purpose:
 * cute, never scary (no teeth, no claws, no horns). */

export type MonsterLook = {
  /** Body colour (hex). */
  color: string;
  eyes?: number;
  ears?: 'big' | 'small';
  hands?: 'big' | 'small';
  feet?: 'big' | 'small';
  /** How many arms (each with a hand) — 2 by default when `hands` is set. */
  arms?: number;
  /** How many legs (each with a foot) — 2 by default when `feet` is set. */
  legs?: number;
};
export type MonsterPart = 'eyes' | 'ears' | 'arms' | 'legs';

let uid = 0;
const shade = (hex: string, amt: number) => {
  const n = parseInt(hex.replace('#', ''), 16);
  const ch = (v: number) => Math.max(0, Math.min(255, Math.round(amt > 0 ? v + (255 - v) * amt : v * (1 + amt))));
  return `#${((ch((n >> 16) & 255) << 16) | (ch((n >> 8) & 255) << 8) | ch(n & 255)).toString(16).padStart(6, '0')}`;
};
const INK = '#3B2416';

/** Positions of N things spread evenly between a and b. */
const spread = (n: number, a: number, b: number) => (n <= 1 ? [(a + b) / 2] : Array.from({ length: n }, (_, i) => a + ((b - a) * i) / (n - 1)));

/** The monster. `glow` lights up counted parts; `onPart` makes parts tappable. */
export function MonsterArt({ look, glow, onPart, pop }: {
  look: MonsterLook;
  glow?: { part: MonsterPart; index: number }[];
  onPart?: (part: MonsterPart, index: number) => void;
  /** The part that just arrived bounces in. */
  pop?: MonsterPart | 'hands' | 'feet' | null;
}) {
  const [id] = useState(() => `mon${++uid}`);
  const body = look.color, light = shade(body, 0.45), dark = shade(body, -0.35);
  const lit = (part: MonsterPart, i: number) => glow?.some((g) => g.part === part && g.index === i);
  const tap = (part: MonsterPart, i: number) => (onPart ? { onClick: () => onPart(part, i), style: { cursor: 'pointer' } } : {});
  const nArms = look.hands ? look.arms ?? 2 : 0;
  const nLegs = look.feet ? look.legs ?? 2 : 0;
  const handR = look.hands === 'big' ? 17 : 8;
  const footRx = look.feet === 'big' ? 30 : 13, footRy = look.feet === 'big' ? 15 : 8;
  const earS = look.ears === 'big' ? 1.6 : 0.85;
  const bounce = { initial: { scale: 0.2, opacity: 0 }, animate: { scale: [0.2, 1.2, 1], opacity: 1 }, transition: { duration: 0.5 } };
  const glowRing = (cx: number, cy: number, r: number) => <circle cx={cx} cy={cy} r={r} fill="#FDE047" opacity={0.85} />;

  // Arms come out of the sides, top to bottom; legs go along the bottom.
  const armYs = spread(nArms <= 2 ? 1 : Math.ceil(nArms / 2), 112, 150);
  const arms = Array.from({ length: nArms }, (_, i) => ({ side: i % 2 === 0 ? -1 : 1, y: armYs[Math.floor(i / 2)] ?? 130 }));
  const legXs = spread(nLegs, nLegs <= 2 ? 78 : 66, nLegs <= 2 ? 122 : 134);

  return (
    <svg viewBox="0 0 200 250" className="h-full w-full overflow-visible" aria-hidden={!onPart}>
      <defs>
        <radialGradient id={`${id}b`} cx="40%" cy="32%" r="75%">
          <stop offset="0" stopColor={light} />
          <stop offset="0.6" stopColor={body} />
          <stop offset="1" stopColor={dark} />
        </radialGradient>
      </defs>
      {/* Ears (behind the head). */}
      {look.ears && (
        <motion.g key={`ears-${look.ears}`} {...(pop === 'ears' ? bounce : {})} style={{ transformOrigin: '100px 60px' }}>
          {[-1, 1].map((s, i) => (
            <g key={i} {...tap('ears', i)}>
              {lit('ears', i) && glowRing(100 + s * 52, 46, 22 * earS)}
              <ellipse cx={100 + s * 50} cy={48} rx={13 * earS} ry={18 * earS} transform={`rotate(${s * 25} ${100 + s * 50} 48)`} fill={`url(#${id}b)`} stroke={INK} strokeWidth="3" />
              <ellipse cx={100 + s * 50} cy={50} rx={6 * earS} ry={10 * earS} transform={`rotate(${s * 25} ${100 + s * 50} 50)`} fill="#F9A8D4" />
            </g>
          ))}
        </motion.g>
      )}
      {/* Legs + feet. */}
      {nLegs > 0 && (
        <motion.g key={`feet-${look.feet}-${nLegs}`} {...(pop === 'feet' || pop === 'legs' ? bounce : {})} style={{ transformOrigin: '100px 220px' }}>
          {legXs.map((x, i) => (
            <g key={i} {...tap('legs', i)}>
              {lit('legs', i) && glowRing(x, 226, footRx + 8)}
              <rect x={x - 8} y={186} width={16} height={30} rx={8} fill={dark} stroke={INK} strokeWidth="3" />
              <ellipse cx={x} cy={224} rx={footRx} ry={footRy} fill="#FB923C" stroke={INK} strokeWidth="3" />
            </g>
          ))}
        </motion.g>
      )}
      {/* Arms + hands. */}
      {nArms > 0 && (
        <motion.g key={`hands-${look.hands}-${nArms}`} {...(pop === 'hands' || pop === 'arms' ? bounce : {})} style={{ transformOrigin: '100px 130px' }}>
          {arms.map((a, i) => {
            const hx = 100 + a.side * (82 + handR * 0.6), hy = a.y - 18;
            return (
              <g key={i} {...tap('arms', i)}>
                {lit('arms', i) && glowRing(hx, hy, handR + 9)}
                <path d={`M${100 + a.side * 52} ${a.y} Q ${100 + a.side * 74} ${a.y - 2} ${hx} ${hy}`} stroke={INK} strokeWidth="13" fill="none" strokeLinecap="round" />
                <path d={`M${100 + a.side * 52} ${a.y} Q ${100 + a.side * 74} ${a.y - 2} ${hx} ${hy}`} stroke={body} strokeWidth="8" fill="none" strokeLinecap="round" />
                <circle cx={hx} cy={hy} r={handR} fill={light} stroke={INK} strokeWidth="3" />
              </g>
            );
          })}
        </motion.g>
      )}
      {/* Body. */}
      <ellipse cx="100" cy="128" rx="62" ry="70" fill={`url(#${id}b)`} stroke={INK} strokeWidth="3.5" />
      <ellipse cx="100" cy="150" rx="34" ry="30" fill={light} opacity="0.55" />
      {/* Eyes. */}
      {(look.eyes ?? 0) > 0 && (
        <motion.g key={`eyes-${look.eyes}`} {...(pop === 'eyes' ? bounce : {})} style={{ transformOrigin: '100px 95px' }}>
          {spread(look.eyes ?? 0, look.eyes! >= 3 ? 64 : 76, look.eyes! >= 3 ? 136 : 124).map((x, i) => {
            const r = (look.eyes ?? 0) >= 4 ? 11 : 14;
            return (
              <g key={i} {...tap('eyes', i)}>
                {lit('eyes', i) && glowRing(x, 96, r + 7)}
                <circle cx={x} cy={96} r={r} fill="#fff" stroke={INK} strokeWidth="3" />
                <circle cx={x + 2} cy={98} r={r * 0.5} fill={INK} />
                <circle cx={x + 4} cy={94} r={r * 0.18} fill="#fff" />
              </g>
            );
          })}
        </motion.g>
      )}
      {/* Smile. */}
      <path d="M78 136 Q100 158 122 136" fill="#7F1D1D" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path d="M90 146 Q100 152 110 146" fill="#F87171" />
      <ellipse cx="66" cy="128" rx="9" ry="5" fill="#F9A8D4" opacity="0.7" />
      <ellipse cx="134" cy="128" rx="9" ry="5" fill="#F9A8D4" opacity="0.7" />
    </svg>
  );
}

/** One option in Monster Maker: just the part, on its own (e.g. three eyes, big feet). */
export function PartPreview({ part, value }: { part: 'eyes' | 'ears' | 'hands' | 'feet'; value: number | 'big' | 'small' }) {
  if (part === 'eyes') {
    const n = typeof value === 'number' ? value : 2;
    return (
      <svg viewBox="0 0 120 60" className="h-full w-full">
        {spread(n, n >= 3 ? 24 : 40, n >= 3 ? 96 : 80).map((x, i) => (
          <g key={i}><circle cx={x} cy={30} r={14} fill="#fff" stroke={INK} strokeWidth="3" /><circle cx={x + 2} cy={32} r={7} fill={INK} /><circle cx={x + 4} cy={28} r={2.5} fill="#fff" /></g>
        ))}
      </svg>
    );
  }
  const big = value === 'big';
  if (part === 'feet') {
    const rx = big ? 26 : 11, ry = big ? 14 : 7;
    return <svg viewBox="0 0 120 60" className="h-full w-full">{[34, 86].map((x) => <ellipse key={x} cx={x} cy={34} rx={rx} ry={ry} fill="#FB923C" stroke={INK} strokeWidth="3" />)}</svg>;
  }
  if (part === 'hands') {
    const r = big ? 20 : 8;
    return <svg viewBox="0 0 120 60" className="h-full w-full">{[32, 88].map((x) => <circle key={x} cx={x} cy={30} r={r} fill="#BAE6FD" stroke={INK} strokeWidth="3" />)}</svg>;
  }
  const s = big ? 1.6 : 0.85;
  return (
    <svg viewBox="0 0 120 60" className="h-full w-full">
      {[34, 86].map((x, i) => (
        <g key={x}>
          <ellipse cx={x} cy={30} rx={13 * s} ry={18 * s * 0.8} transform={`rotate(${i ? 25 : -25} ${x} 30)`} fill="#7DD3FC" stroke={INK} strokeWidth="3" />
          <ellipse cx={x} cy={31} rx={6 * s} ry={9 * s * 0.8} transform={`rotate(${i ? 25 : -25} ${x} 31)`} fill="#F9A8D4" />
        </g>
      ))}
    </svg>
  );
}
