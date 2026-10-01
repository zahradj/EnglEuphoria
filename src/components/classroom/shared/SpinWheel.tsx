import React from 'react';

/**
 * The one spinning wheel used everywhere — the classroom Spin Wheel tool
 * (over any slide or scene) and the `spin-wheel` lesson activity — so a
 * lesson that says "spin the wheel" always looks and behaves the same.
 *
 * Numbered segments 1..N, clockwise, with N at the top (segment k is
 * centred k × 360/N degrees clockwise from the top pointer). Numbers read
 * outward from the centre like a physical spinner. Purely presentational:
 * the owner decides the rotation (see spinTargetRotation) and broadcasts it,
 * so every screen animates to the identical result.
 */

/** Colour by segment number (1-based), repeating — EnglEuphoria's own
 *  Playground palette (orange, sunflower, violet, mint, sky, pink). Was a
 *  copy of a reference spinner's periwinkle/slate/coral palette; replaced on
 *  request so the wheel is our own design, not identical to the reference. */
export const SPIN_WHEEL_COLORS = ['#FE6A2F', '#FEBE4C', '#7C3AED', '#22C59A', '#3FA2E8', '#E7569E'];

export const SPIN_WHEEL_MIN = 2;
export const SPIN_WHEEL_MAX = 8;
/** Spin animation length; owners flip `spinning` off after this. */
export const SPIN_DURATION_MS = 3200;

/** Degrees (clockwise from the top pointer) at the centre of segment `n`. */
function segmentCenter(n: number, count: number): number {
  return (n % count) * (360 / count);
}

/**
 * Rotation that spins at least 5 full turns past `prevRotation` and lands
 * segment `winner` (1-based) under the top pointer, a little off-centre
 * (`jitter` in -1..1) so it looks natural. Compute ONCE on the spinning side
 * and broadcast the result — never recompute per screen.
 */
export function spinTargetRotation(prevRotation: number, winner: number, count: number, jitter = 0): number {
  const slice = 360 / count;
  const land = (((-segmentCenter(winner, count) + jitter * slice * 0.3) % 360) + 360) % 360;
  const base = prevRotation + 360 * 5;
  const baseMod = ((base % 360) + 360) % 360;
  return base + ((land - baseMod + 360) % 360);
}

/** Pick a random segment, avoiding `avoid` when there is any other choice. */
export function pickSpinWinner(count: number, avoid: number[] = []): number {
  const pool = Array.from({ length: count }, (_, i) => i + 1).filter((n) => !avoid.includes(n));
  const from = pool.length > 0 ? pool : Array.from({ length: count }, (_, i) => i + 1);
  return from[Math.floor(Math.random() * from.length)];
}

interface SpinWheelProps {
  count: number;
  /** Absolute rotation in degrees (clockwise). */
  rotation: number;
  spinning: boolean;
  /** Segment number to emphasise after landing. */
  highlight?: number | null;
  /** Omit to show the hub as non-interactive (e.g. a watching student). */
  onSpin?: () => void;
  /** Omit to hide the +/− segment-count control. */
  onCountChange?: (count: number) => void;
  size?: number | string;
  /** Optional per-segment labels instead of numbers (short words only). */
  labels?: string[];
}

export const SpinWheel: React.FC<SpinWheelProps> = ({
  count: rawCount,
  rotation,
  spinning,
  highlight = null,
  onSpin,
  onCountChange,
  size = 280,
  labels,
}) => {
  const count = Math.max(SPIN_WHEEL_MIN, Math.min(SPIN_WHEEL_MAX, Math.round(rawCount)));
  const slice = 360 / count;
  const R = 92;
  const point = (deg: number, r: number) => {
    const rad = (deg * Math.PI) / 180;
    return `${100 + r * Math.sin(rad)} ${100 - r * Math.cos(rad)}`;
  };
  const fontSize = count <= 6 ? 30 : 25;
  const canSpin = !!onSpin && !spinning;

  const BULBS = 16;
  return (
    <div className="relative inline-flex items-center gap-3">
      <style>{`
        @keyframes ee-bulb { 0%,100% { opacity: 1; } 50% { opacity: .25; } }
        @keyframes ee-tick { 0%,100% { transform: translateX(-50%) rotate(0deg); } 50% { transform: translateX(-50%) rotate(-14deg); } }
        @keyframes ee-hub { 0%,100% { transform: translate(-50%,-50%) scale(1); } 50% { transform: translate(-50%,-50%) scale(1.07); } }
      `}</style>
      <div className="relative" style={{ width: size, height: size }}>
        {/* Gold marquee rim with light bulbs (static); bulbs chase while spinning */}
        <div className="absolute inset-0 rounded-full" style={{ background: 'radial-gradient(circle at 30% 25%, #FFF3B0, #FFD34E 35%, #E59A00 75%, #B86E00)', boxShadow: '0 12px 30px rgba(120,60,0,0.35), inset 0 -4px 8px rgba(0,0,0,0.25)' }} />
        {Array.from({ length: BULBS }, (_, i) => {
          const a = (i * 360) / BULBS;
          return (
            <span key={i} className="absolute h-[4.2%] w-[4.2%] rounded-full" style={{
              left: `${50 + 47.5 * Math.sin((a * Math.PI) / 180)}%`, top: `${50 - 47.5 * Math.cos((a * Math.PI) / 180)}%`, transform: 'translate(-50%,-50%)',
              background: i % 2 ? '#FFFBEA' : '#FFE27A', boxShadow: '0 0 6px 2px rgba(255,236,150,0.9)',
              animation: spinning ? `ee-bulb 0.5s ease-in-out ${(i % 2) * 0.25}s infinite` : undefined,
            }} />
          );
        })}
        {/* Rotating face */}
        <div
          className="absolute inset-[7%] overflow-hidden rounded-full"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: spinning ? `transform ${SPIN_DURATION_MS}ms cubic-bezier(0.12, 0.8, 0.18, 1)` : 'none',
            boxShadow: 'inset 0 0 0 3px rgba(255,255,255,0.9)',
          }}
        >
          <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden="true">
            {Array.from({ length: count }, (_, i) => {
              const n = i + 1;
              const c = segmentCenter(n, count);
              const a0 = c - slice / 2;
              const a1 = c + slice / 2;
              const large = slice > 180 ? 1 : 0;
              const isHit = !spinning && highlight === n;
              const color = SPIN_WHEEL_COLORS[i % SPIN_WHEEL_COLORS.length];
              const text = labels?.[i] ?? String(n);
              const dim = !(isHit || highlight == null || spinning);
              return (
                <g key={n} opacity={dim ? 0.55 : 1}>
                  <path d={`M 100 100 L ${point(a0, R + 8)} A ${R + 8} ${R + 8} 0 ${large} 1 ${point(a1, R + 8)} Z`} fill={color} stroke="#fff" strokeWidth={2.5} />
                  {/* glossy band near the rim */}
                  <path d={`M ${point(a0 + 2, R + 2)} A ${R + 2} ${R + 2} 0 ${large} 1 ${point(a1 - 2, R + 2)} L ${point(a1 - 2, R - 14)} A ${R - 14} ${R - 14} 0 ${large} 0 ${point(a0 + 2, R - 14)} Z`} fill="rgba(255,255,255,0.18)" />
                  <g transform={`rotate(${c} 100 100)`}>
                    {labels ? (
                      <text x={100} y={100 - R * 0.62} textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize={Math.min(fontSize, 18)} fontWeight={900}
                        style={{ fontFamily: "'Fredoka', 'Nunito', system-ui, sans-serif", paintOrder: 'stroke', stroke: 'rgba(0,0,0,0.25)', strokeWidth: 3 }}>{text}</text>
                    ) : (
                      <>
                        <circle cx={100} cy={100 - R * 0.62} r={isHit ? 17 : 14} fill="#fff" stroke={isHit ? '#FFD34E' : 'none'} strokeWidth={4} />
                        <text x={100} y={100 - R * 0.62 + 1} textAnchor="middle" dominantBaseline="middle" fill={color} fontSize={isHit ? 22 : 18} fontWeight={900}
                          style={{ fontFamily: "'Fredoka', 'Nunito', system-ui, sans-serif" }}>{text}</text>
                        <text x={100} y={100 - R * 0.3} textAnchor="middle" dominantBaseline="middle" fontSize={11} fill="rgba(255,255,255,0.85)">★</text>
                      </>
                    )}
                  </g>
                </g>
              );
            })}
          </svg>
        </div>
        {/* Pointer (static) — gold star pin above the rim, ticks while spinning */}
        <div className="pointer-events-none absolute left-1/2 z-10" style={{ top: '-7%', width: '17%', transform: 'translateX(-50%)', transformOrigin: '50% 20%', animation: spinning ? 'ee-tick 0.18s ease-in-out infinite' : undefined }}>
          <svg viewBox="0 0 40 52" className="w-full drop-shadow-[0_4px_4px_rgba(0,0,0,0.35)]" aria-hidden="true">
            <path d="M20 50 L9 26 H31 Z" fill="#E59A00" stroke="#7A4A00" strokeWidth="2" strokeLinejoin="round" />
            <path d="M20 2 L24.7 12.3 L36 13.5 L27.5 21 L30 32 L20 26.3 L10 32 L12.5 21 L4 13.5 L15.3 12.3 Z" fill="#FFD34E" stroke="#7A4A00" strokeWidth="2" strokeLinejoin="round" />
          </svg>
        </div>
        {/* Hub — the SPIN! button */}
        <button
          type="button"
          onClick={canSpin ? onSpin : undefined}
          disabled={!canSpin}
          aria-label={canSpin ? 'Spin the wheel' : 'Spinner'}
          className={`absolute left-1/2 top-1/2 z-20 flex h-[26%] w-[26%] flex-col items-center justify-center rounded-full font-black uppercase leading-none text-white ring-4 ring-white transition ${canSpin ? 'cursor-pointer active:scale-95' : 'cursor-default'}`}
          style={{
            transform: 'translate(-50%,-50%)',
            background: 'radial-gradient(circle at 35% 30%, #FFB27A, #FE6A2F 45%, #E7569E)',
            boxShadow: '0 6px 0 #B8410F, 0 10px 18px rgba(0,0,0,0.3)',
            fontFamily: "'Fredoka', 'Nunito', system-ui, sans-serif",
            fontSize: 'clamp(11px, 6.5%, 22px)',
            animation: canSpin ? 'ee-hub 1.4s ease-in-out infinite' : undefined,
          }}
        >
          <span style={{ fontSize: '1.25em' }}>★</span>
          <span>Spin!</span>
        </button>
      </div>
      {onCountChange && (
        <div className="flex flex-col overflow-hidden rounded-md border border-slate-300 bg-white text-slate-700 shadow-sm">
          <button
            type="button"
            onClick={() => onCountChange(Math.min(SPIN_WHEEL_MAX, count + 1))}
            disabled={spinning || count >= SPIN_WHEEL_MAX}
            className="h-7 w-7 text-base leading-none hover:bg-slate-100 disabled:opacity-40"
            aria-label="More segments"
          >
            +
          </button>
          <div className="h-px bg-slate-200" />
          <button
            type="button"
            onClick={() => onCountChange(Math.max(SPIN_WHEEL_MIN, count - 1))}
            disabled={spinning || count <= SPIN_WHEEL_MIN}
            className="h-7 w-7 text-base leading-none hover:bg-slate-100 disabled:opacity-40"
            aria-label="Fewer segments"
          >
            −
          </button>
        </div>
      )}
    </div>
  );
};
