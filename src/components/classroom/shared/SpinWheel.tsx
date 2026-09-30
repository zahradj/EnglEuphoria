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

/** Colour by segment number (1-based), repeating: periwinkle, slate, cyan,
 *  coral, graphite, light blue — the reference spinner's palette. */
export const SPIN_WHEEL_COLORS = ['#97A8E5', '#475569', '#5ED0F5', '#EE6F73', '#565E6B', '#9FE0F8'];

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

  return (
    <div className="relative inline-flex items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        {/* White rim + soft shadow (static) */}
        <div className="absolute inset-0 rounded-full bg-white shadow-[0_10px_30px_rgba(15,23,42,0.28)]" />
        {/* Rotating face */}
        <div
          className="absolute inset-[3.5%]"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: spinning ? `transform ${SPIN_DURATION_MS}ms cubic-bezier(0.12, 0.8, 0.18, 1)` : 'none',
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
              const text = labels?.[i] ?? String(n);
              return (
                <g key={n}>
                  <path
                    d={`M 100 100 L ${point(a0, R + 8)} A ${R + 8} ${R + 8} 0 ${large} 1 ${point(a1, R + 8)} Z`}
                    fill={SPIN_WHEEL_COLORS[i % SPIN_WHEEL_COLORS.length]}
                    opacity={isHit || highlight == null || spinning ? 0.95 : 0.7}
                  />
                  <text
                    x={100}
                    y={100 - R * 0.66}
                    transform={`rotate(${c} 100 100)`}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#fff"
                    fontSize={labels ? Math.min(fontSize, 18) : isHit ? fontSize * 1.25 : fontSize}
                    fontWeight={900}
                    style={{ fontFamily: "'Fredoka', 'Nunito', system-ui, sans-serif" }}
                  >
                    {text}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
        {/* Pointer (static) — small white triangle on top of the hub */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2"
          style={{ marginTop: `calc(-11% - 10px)` }}
        >
          <div className="h-0 w-0 border-x-[7px] border-b-[11px] border-x-transparent border-b-white drop-shadow" />
        </div>
        {/* Hub — the SPIN button */}
        <button
          type="button"
          onClick={canSpin ? onSpin : undefined}
          disabled={!canSpin}
          aria-label={canSpin ? 'Spin the wheel' : 'Spinner'}
          className={`absolute left-1/2 top-1/2 z-20 flex h-[22%] w-[22%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[11px] font-bold uppercase tracking-wide text-slate-400 shadow-md ring-1 ring-slate-200 transition ${
            canSpin ? 'cursor-pointer hover:scale-105 hover:text-slate-600 active:scale-95' : 'cursor-default'
          }`}
        >
          Spin
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
