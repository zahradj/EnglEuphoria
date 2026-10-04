// Helpers used by more than one scene. Anything used by a single scene lives next to it.
import { useEffect, useState } from 'react';
import type { CharKey, Thing } from '../scenes';
import { CAST, getEmotionSprite } from '../scenes';
import { safeSpeak } from '../audio';
import * as sfx from '../sfx';
import { SpriteMascot, MASCOT_EYE_BANDS } from '../SpriteMascot';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';

/** Characters already illustrated holding a bunch of party balloons — used instead of a plain portrait + emoji row. */
export const BALLOONS_SPRITE: Partial<Record<CharKey, string>> = {
  bella: '/lep1/characters/bella-balloons.png',
  mia: '/lep1/characters/mia-balloons.png',
  leo: '/lep1/characters/leo-balloons.png',
  willow: '/lep1/characters/willow-balloons.png',
};

/** Rainbow spectrum used across every "count 1-10" activity (numbers tiles, balloon pop) — one fixed hue per digit, red through purple. */
export const RAINBOW_10 = ['#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981', '#06b6d4', '#3b82f6', '#a855f7'];

export const NUMBER_WORDS = ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN'];

/** Natural-cased number word for TTS — a bare digit string like "5" sent to the
 *  voice pipeline is read inconsistently; the actual word reads clearly every time. */
export function numberSpeech(n: number): string {
  const w = NUMBER_WORDS[n - 1];
  return w ? w.charAt(0) + w.slice(1).toLowerCase() : String(n);
}

/* ---------- Shared chrome ---------- */

export const MAX_HEARTS = 3;

export function Hearts({ count }: { count: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${count} hearts remaining`}>
      {Array.from({ length: MAX_HEARTS }).map((_, i) => (
        <span key={i} className={`text-xl transition ${i < count ? '' : 'grayscale opacity-30'}`}>❤️</span>
      ))}
    </span>
  );
}

export function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-white/40 bg-white/95 p-5 text-neutral-900 shadow-2xl backdrop-blur-2xl ring-1 ring-white/30 ${className}`}
      style={{ boxShadow: '0 20px 60px -20px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.6)' }}
    >
      {children}
    </div>
  );
}

export function PrimaryButton({ onClick, disabled, children }: { onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="mt-5 w-full rounded-full py-4 text-xl font-black text-white shadow-xl transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
      style={{ background: 'linear-gradient(90deg, #FE6A2F, #FF8A4C, #FEBE4C)' }}
    >
      {children}
    </button>
  );
}

/* ---------- Scatter layout ---------- */

/** Lays out N draggable items into two clean, evenly-spaced rows instead of
 *  the old hand-picked percentage list — which drifted into overlapping,
 *  off-center clutter as soon as an item count didn't match what the list
 *  was tuned for. Rotation is kept small so items read as tidy, not messy. */
export function scatterPositions(n: number, rowTops: [number, number] = [16, 84], margin = 14): { left: string; top: string; rot: number }[] {
  const topCount = Math.ceil(n / 2);
  const bottomCount = n - topCount;
  const usable = 100 - margin * 2;
  const row = (count: number, topPct: number, offset: number) =>
    Array.from({ length: count }, (_, i) => ({
      left: `${count === 1 ? 50 : margin + (usable * i) / (count - 1)}%`,
      top: `${topPct}%`,
      rot: (i % 2 === 0 ? -1 : 1) * (2 + ((i + offset) % 3)),
    }));
  return [...row(topCount, rowTops[0], 0), ...row(bottomCount, rowTops[1], topCount)];
}

/** Shared board/image size for every puzzle-family scene (`puzzle`,
 *  `jigsaw-puzzle`) — kept as one constant per direct user request ("keep
 *  this universal, in each puzzle game") after the jigsaw board was found
 *  too small. Large on both axes (vw AND vh) so it stays prominent on wide
 *  and tall viewports alike. */
export const PUZZLE_BOARD_SIZE = 'w-[min(54vw,80vh)]';

/* ---------- Shape swatch helper (shared by shape-model / shape-sort) ---------- */

/** The color-* scenes' swatch is always `rounded-full` since color doesn't
 *  imply a form — but a shape scene's whole point is the outline itself, so
 *  the swatch has to actually BE the shape, not a color-filled circle with
 *  a shape NAME printed on it. */
export function ShapeSwatchStyle(shapeWord: string, color: string): React.CSSProperties {
  const key = shapeWord.toUpperCase();
  if (key === 'SQUARE') return { background: color, borderRadius: '16%' };
  if (key === 'TRIANGLE') return { background: color, clipPath: 'polygon(50% 4%, 4% 96%, 96% 96%)', borderRadius: 0 };
  return { background: color, borderRadius: '9999px' };
}

/* =========================================================================
 * Feelings vocabulary pack — ported (interaction design only, not code) from
 * the reference "Little Explorers Phonics" Lesson 3 feelings progression.
 * Field shapes and every implementation below are our own, matching this
 * file's existing conventions (GlassCard/PrimaryButton chrome, CAST sprites,
 * safeSpeak/sfx audio, lep1-* CSS keyframes, Confetti on big completions).
 * ========================================================================= */

export const FEELING_EMOJI: Record<'happy' | 'sad' | 'angry', string> = { happy: '\u{1F60A}', sad: '\u{1F622}', angry: '\u{1F620}' };

/* ---------- Modeled "X is feeling" rounds (shared by x-is-feeling & he-she-model) ---------- */

export function ModeledFeelingRounds<R extends { who: CharKey; emotion: 'happy' | 'sad' | 'angry'; sentence: string }>({
  teacher, rounds, badge, onNext, onWin, sync,
}: {
  teacher: string;
  rounds: R[];
  badge?: (r: R) => string;
  onNext: () => void;
  onWin: (gem: boolean) => void;
  sync?: ActivitySync;
}) {
  // Only round/gemDone are shared state -- the model/repeat phase transition
  // is a fixed, deterministic timed sequence (no randomness, no branching),
  // so each side safely runs its own identical copy the same way
  // CinematicScene already does, and it re-triggers correctly on both sides
  // whenever the synced `round` changes.
  const [state, setState] = useSyncedState(sync, { round: 0, gemDone: false });
  const { round, gemDone } = state;
  const isRemoteMirror = !!sync?.isSynced && !sync.isAuthority;
  const [phase, setPhase] = useState<'model' | 'repeat'>('model');
  const total = rounds.length;
  const finished = round >= total;
  const r = !finished ? rounds[round] : null;

  useEffect(() => {
    if (!r) return;
    let cancelled = false;
    setPhase('model');
    (async () => {
      await new Promise((res) => setTimeout(res, 300));
      if (cancelled) return;
      await safeSpeak(r.sentence, r.who);
      if (cancelled) return;
      setPhase('repeat');
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round]);

  const replay = () => { if (r) void safeSpeak(r.sentence, r.who); };
  const confirm = () => {
    if (isRemoteMirror || !r || phase !== 'repeat') return;
    sfx.match();
    const next = round + 1;
    const awardGem = next >= total && !gemDone;
    if (awardGem) { sfx.gem(); onWin(true); }
    setState((s) => ({ ...s, round: next, gemDone: s.gemDone || awardGem }));
  };

  if (finished) {
    return (
      <div className="absolute inset-x-0 bottom-8 z-30 flex justify-center">
        <button onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 text-xl font-black text-white shadow-2xl active:scale-95 animate-[lep1-slide-up_0.4s_ease-out]">Great job! Next →</button>
      </div>
    );
  }

  const c = CAST[r!.who];
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6">
      <div className="pointer-events-none absolute inset-x-0 top-4 flex justify-center px-4">
        <div className="max-w-lg rounded-full bg-white/90 px-5 py-2 text-center text-sm font-black text-orange-700 shadow-lg backdrop-blur sm:text-base">{teacher} <span className="ml-1 opacity-60">({round + 1}/{total})</span></div>
      </div>
      <div className="relative flex flex-col items-center">
        <div className="h-56 w-56 drop-shadow-2xl sm:h-64 sm:w-64">
          <SpriteMascot
            profile={{ src: getEmotionSprite(r!.who, r!.emotion), eyeBand: MASCOT_EYE_BANDS[r!.who] }}
            emotion={r!.emotion}
            isTalking={phase === 'model'}
            alt={c.name}
          />
        </div>
        {badge && <span className="absolute -right-2 top-4 rounded-full bg-orange-500 px-3 py-1 text-sm font-black uppercase text-white shadow-lg">{badge(r!)}</span>}
      </div>
      <div className="mt-4 rounded-3xl bg-white/95 px-6 py-3 text-center shadow-2xl">
        <p className="text-2xl font-black sm:text-3xl" style={{ color: c.color }}>“{r!.sentence}”</p>
      </div>
      {phase === 'repeat' && (
        <div className="mt-5 flex gap-3">
          <button onClick={replay} className="rounded-full bg-white/95 px-5 py-3 text-sm font-black text-orange-700 shadow ring-2 ring-orange-200 active:scale-95">🔊 Hear again</button>
          <button onClick={confirm} className="rounded-full bg-gradient-to-r from-orange-500 to-orange-600 px-7 py-3 text-base font-black text-white shadow-xl active:scale-95">✅ I said it!</button>
        </div>
      )}
    </div>
  );
}

/* ---------- Shared keyframes ---------- */

export function Lep1Keyframes() {
  return (
    <style>{`
      @keyframes lep1-fade-slide { from { opacity: 0; transform: translateY(20px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
      @keyframes lep1-pop { 0% { opacity: 0; transform: scale(0.6) translateY(-10px); } 20% { opacity: 1; transform: scale(1.15) translateY(0); } 60% { transform: scale(1); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
      @keyframes lep1-pop-fade { 0% { opacity: 0; transform: scale(0.6) translateY(-10px); } 20% { opacity: 1; transform: scale(1.15) translateY(0); } 60% { opacity: 1; transform: scale(1); } 100% { opacity: 0; transform: scale(1) translateY(-10px); } }
      @keyframes lep1-float { 0%,100% { transform: translateY(0) rotate(-1deg); } 50% { transform: translateY(-12px) rotate(1deg); } }
      @keyframes lep1-shake { 0%,100% { transform: translateX(0); } 20% { transform: translateX(-10px); } 40% { transform: translateX(10px); } 60% { transform: translateX(-8px); } 80% { transform: translateX(8px); } }
      @keyframes lep1-hop { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-14px); } }
      @keyframes lep1-swim-r { from { transform: translateX(-30vw); } to { transform: translateX(110vw); } }
      @keyframes lep1-swim-l { from { transform: translateX(110vw) scaleX(-1); } to { transform: translateX(-30vw) scaleX(-1); } }
      @keyframes lep1-bob { 0%,100% { margin-top: 0; } 50% { margin-top: 10px; } }
      @keyframes lep1-kb-zoom-in { from { transform: scale(1); } to { transform: scale(1.18); } }
      @keyframes lep1-kb-zoom-out { from { transform: scale(1.2); } to { transform: scale(1); } }
      @keyframes lep1-kb-pan-left { from { transform: scale(1.15) translateX(4%); } to { transform: scale(1.15) translateX(-4%); } }
      @keyframes lep1-kb-pan-right { from { transform: scale(1.15) translateX(-4%); } to { transform: scale(1.15) translateX(4%); } }
      @keyframes lep1-fade-in { from { opacity: 0; } to { opacity: 1; } }
      @keyframes lep1-bubble-up { from { transform: translateY(0); opacity: 0.9; } to { transform: translateY(-110vh); opacity: 0; } }
      @keyframes lep1-bubble-rise { 0% { transform: translateY(0); opacity: 0; } 15% { opacity: 0.9; } 100% { transform: translateY(-40vh); opacity: 0; } }
      @keyframes lep1-bag-wiggle { 0%, 100% { transform: rotate(0deg); } 20% { transform: rotate(-4deg); } 40% { transform: rotate(4deg); } 60% { transform: rotate(-2deg); } 80% { transform: rotate(2deg); } }
      @keyframes lep1-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      @keyframes lep1-smoke { 0% { transform: translate(0,0) scale(0.5); opacity: 0.9; } 100% { transform: translate(-14px,-34px) scale(1.6); opacity: 0; } }
      @keyframes lep1-chug { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-2px); } }
      @keyframes lep1-track { from { background-position-x: 0; } to { background-position-x: -48px; } }
      @keyframes lep1-tail { 0%,100% { transform: rotate(-9deg); } 50% { transform: rotate(9deg); } }
      @keyframes lep1-card-in { 0% { transform: translateY(18px) scale(0.85); opacity: 0; } 100% { transform: translateY(0) scale(1); opacity: 1; } }
      @keyframes lep1-ring { from { stroke-dashoffset: 0; } to { stroke-dashoffset: 283; } }
      @keyframes lep1-wobble { 0%, 100% { transform: rotate(-3deg) scale(1); } 50% { transform: rotate(3deg) scale(1.05); } }
      @keyframes lep1-fly-book { 0% { transform: translate(0,0) scale(1) rotate(0); } 100% { transform: translate(var(--fx), var(--fy)) scale(0.25) rotate(20deg); opacity: 0.2; } }
      @keyframes lep1-stamp { 0% { transform: scale(2.4) rotate(-20deg); opacity: 0; } 60% { transform: scale(0.9) rotate(-12deg); opacity: 1; } 100% { transform: scale(1) rotate(-12deg); opacity: 1; } }
      @keyframes lep1-tear { 0% { transform: translateY(0); opacity: 0; } 20% { opacity: 1; } 100% { transform: translateY(60px); opacity: 0; } }
      @keyframes lep1-walk { 0% { transform: translateX(-60%) rotate(-4deg); } 25% { transform: translateX(-20%) rotate(3deg) translateY(-6px); } 50% { transform: translateX(20%) rotate(-3deg); } 75% { transform: translateX(60%) rotate(3deg) translateY(-6px); } 100% { transform: translateX(-60%) rotate(-4deg); } }
      @keyframes lep1-wiggle { 0%,100% { transform: rotate(-3deg) translateY(0); } 25% { transform: rotate(3deg) translateY(-4px); } 50% { transform: rotate(-2deg) translateY(0); } 75% { transform: rotate(4deg) translateY(-4px); } }
      @keyframes lep1-ping { 75%, 100% { transform: scale(2); opacity: 0; } }
      @keyframes lep1-slide-up { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      @keyframes lep1-dashScroll { from { background-position: 0 0; } to { background-position: -80px 0; } }
      @keyframes lep1-heroBounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-14px); } }
      @keyframes lep1-itemBob { 0%,100% { transform: translateY(-50%) rotate(-4deg); } 50% { transform: translateY(-58%) rotate(4deg); } }
      @keyframes lep1-shuffleShake { 0%,100% { transform: translateX(0) rotate(0deg); } 25% { transform: translateX(-8px) rotate(-1deg); } 75% { transform: translateX(8px) rotate(1deg); } }
      @keyframes lep1-blockShake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-6px) rotate(-3deg); } 75% { transform: translateX(6px) rotate(3deg); } }
      @keyframes lep1-blockWin { 0% { transform: scale(1); } 40% { transform: scale(1.25) rotate(-6deg); } 70% { transform: scale(1.15) rotate(6deg); } 100% { transform: scale(1); } }
      @keyframes lep1-blockDrop { 0% { transform: translateY(-40px) scale(1.1); opacity: 0; } 60% { transform: translateY(4px) scale(0.98); opacity: 1; } 100% { transform: translateY(0) scale(1); opacity: 1; } }
      @keyframes lep1-lyricPop { 0% { transform: scale(0.85); opacity: 0; } 60% { transform: scale(1.06); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
      @keyframes lep1-noteFloat { 0% { transform: translateY(0) rotate(-8deg); opacity: 0; } 20% { opacity: 0.9; } 100% { transform: translateY(-160px) rotate(12deg); opacity: 0; } }
      @keyframes lep1-balloonFloat { 0%, 100% { translate: 0px; } 50% { translate: 0px -10px; } }
      @keyframes lep1-cakeBounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-14px); } }
      @keyframes lep1-cakeIdle { 0%, 100% { transform: translateY(0) scale(1, 1); } 50% { transform: translateY(-8px) scale(1.015, 0.985); } }
      @keyframes lep1-tapRipple { 0% { transform: translate(-50%, -50%) scale(0.4); opacity: 0.9; } 100% { transform: translate(-50%, -50%) scale(2.2); opacity: 0; } }
      @keyframes lep1-candleDrop { 0% { transform: translateX(-50%) translateY(-140px) rotate(-25deg) scale(0.7); opacity: 0; } 60% { transform: translateX(-50%) translateY(8px) rotate(6deg) scale(1.1); opacity: 1; } 100% { transform: translateX(-50%) translateY(0) rotate(0deg) scale(1); opacity: 1; } }
      @keyframes lep1-candleWiggle { 0%, 100% { transform: rotate(-2deg); } 50% { transform: rotate(2deg); } }
      @keyframes lep1-twinkle { 0%, 100% { opacity: 0.15; transform: scale(0.6); } 50% { opacity: 1; transform: scale(1.2); } }
      @keyframes lep1-bookGlow { 0%, 100% { box-shadow: 0 0 40px rgba(245,214,125,0.35), 0 25px 55px rgba(0,0,0,0.45); } 50% { box-shadow: 0 0 70px rgba(245,214,125,0.65), 0 25px 55px rgba(0,0,0,0.45); } }
    `}</style>
  );
}

/** A shape icon for the answer buttons (fills its own square box). */
/** Lighten (amt > 0) or darken (amt < 0) a #RRGGBB colour. */
export function shade(hex: string, amt: number) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  const ch = (v: number) => Math.max(0, Math.min(255, Math.round(amt > 0 ? v + (255 - v) * amt : v * (1 + amt))));
  const r = ch((n >> 16) & 255), g = ch((n >> 8) & 255), b = ch(n & 255);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

let shapeUid = 0;
/** A coloured shape drawn as a glossy toy piece: lighter top, shine
 *  highlight, a darker edge in its own colour and a soft shadow. */
export function ShapeIcon({ shape, fill }: { shape: string; fill: string }) {
  const [id] = useState(() => `shp${++shapeUid}`);
  const top = shade(fill, 0.35), bottom = shade(fill, -0.12), edge = shade(fill, -0.45);
  const body = { fill: `url(#${id})`, stroke: edge, strokeWidth: 2.4, strokeLinejoin: 'round' as const };
  return (
    <svg viewBox="0 0 40 40" className="h-full w-full overflow-visible" aria-hidden style={{ filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.25))' }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="0.55" stopColor={fill} />
          <stop offset="1" stopColor={bottom} />
        </linearGradient>
      </defs>
      {shape === 'circle' && (
        <>
          <circle cx="20" cy="20" r="16" {...body} />
          <ellipse cx="14.5" cy="12.5" rx="6" ry="3.6" fill="#fff" opacity="0.55" transform="rotate(-25 14.5 12.5)" />
          <circle cx="25.5" cy="27" r="1.6" fill="#fff" opacity="0.35" />
        </>
      )}
      {shape === 'square' && (
        <>
          <rect x="5" y="5" width="30" height="30" rx="6" {...body} />
          <rect x="9" y="8.5" width="14" height="4.5" rx="2.25" fill="#fff" opacity="0.5" />
          <rect x="28" y="28" width="3" height="3" rx="1.5" fill="#fff" opacity="0.3" />
        </>
      )}
      {shape === 'triangle' && (
        <>
          <path d="M20 4.5 Q21.6 4.5 22.6 6.3 L36.2 31.6 Q37 33.6 34.8 34.6 L5.2 34.6 Q3 33.6 3.8 31.6 L17.4 6.3 Q18.4 4.5 20 4.5 Z" {...body} />
          <path d="M19.2 10.5 L12.5 23" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" opacity="0.5" />
        </>
      )}
    </svg>
  );
}

/** Speak, but never let a slow or missing clip stall a game's next step. */
export function sayWithin(text: string, who: Parameters<typeof safeSpeak>[1], maxMs = 3500) {
  return Promise.race([safeSpeak(text, who), new Promise<void>((res) => setTimeout(res, maxMs))]);
}

/** A circle / square / triangle drawn in a board's own SVG coordinates. */
export function BoardShape({ shape, x, y, w, h, fill, stroke = '#2B1E17', dashed, flip }: { shape: string; x: number; y: number; w: number; h: number; fill: string; stroke?: string; dashed?: boolean; flip?: boolean }) {
  const common = { fill, stroke, strokeWidth: 0.8, strokeDasharray: dashed ? '2 1.4' : undefined };
  if (shape === 'circle') return <ellipse cx={x + w / 2} cy={y + h / 2} rx={w / 2} ry={h / 2} {...common} />;
  if (shape === 'square') return <rect x={x} y={y} width={w} height={h} rx={1.2} {...common} />;
  const pts = flip ? `${x},${y} ${x + w},${y} ${x + w / 2},${y + h}` : `${x + w / 2},${y} ${x + w},${y + h} ${x},${y + h}`;
  return <polygon points={pts} strokeLinejoin="round" {...common} />;
}

/** "Clay" card look (puffy, rounded, toy-like — the kids'-app claymorphism style):
 *  soft top highlight, darker bottom lip and a deep soft shadow. */
export const CLAY_CARD = 'rounded-[28px] bg-gradient-to-b from-white to-orange-50 shadow-[inset_0_4px_0_rgba(255,255,255,0.95),inset_0_-7px_0_rgba(234,88,12,0.14),0_14px_28px_rgba(60,30,10,0.28)]';
export const CLAY_BUTTON = 'rounded-full bg-gradient-to-b from-orange-400 to-pink-500 font-black text-white shadow-[inset_0_3px_0_rgba(255,255,255,0.45),inset_0_-5px_0_rgba(0,0,0,0.15),0_10px_20px_rgba(236,72,153,0.35)] active:translate-y-0.5 active:scale-95';

/** A countdown ring (SVG) that empties over `seconds`; `runKey` restarts it. */
export function CountdownRing({ seconds, runKey, color = '#F97316' }: { seconds: number; runKey: string | number; color?: string }) {
  return (
    <svg key={runKey} viewBox="0 0 100 100" className="pointer-events-none absolute inset-0 h-full w-full -rotate-90" aria-hidden>
      <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="7" />
      <circle cx="50" cy="50" r="45" fill="none" stroke={color} strokeWidth="7" strokeLinecap="round" strokeDasharray="283" style={{ animation: `lep1-ring ${seconds}s linear forwards` }} />
    </svg>
  );
}

/* ---------- Toy train kit (pattern train, train recall) ----------
 * A drawn toy train instead of an emoji + boxes: engine with puffing smoke,
 * lamp and window, spoked wheels that turn while it moves, a little chug,
 * coupled wagons, and a track whose sleepers scroll when the train runs. */

function Wheel({ cx, cy, r, moving, dur = 0.6 }: { cx: number; cy: number; r: number; moving?: boolean; dur?: number }) {
  return (
    <g style={{ transformBox: 'fill-box', transformOrigin: 'center', animation: moving ? `lep1-spin ${dur}s linear infinite` : undefined }}>
      <circle cx={cx} cy={cy} r={r} fill="#3F3F46" stroke="#18181B" strokeWidth="2.5" />
      <circle cx={cx} cy={cy} r={r * 0.62} fill="#A1A1AA" />
      {[0, 60, 120].map((a) => (
        <line key={a} x1={cx - r * 0.6 * Math.cos((a * Math.PI) / 180)} y1={cy - r * 0.6 * Math.sin((a * Math.PI) / 180)} x2={cx + r * 0.6 * Math.cos((a * Math.PI) / 180)} y2={cy + r * 0.6 * Math.sin((a * Math.PI) / 180)} stroke="#52525B" strokeWidth="2" />
      ))}
      <circle cx={cx} cy={cy} r={r * 0.2} fill="#FACC15" stroke="#18181B" strokeWidth="1.2" />
    </g>
  );
}

export function TrainEngine({ moving, color = '#EF4444', className = '' }: { moving?: boolean; color?: string; className?: string }) {
  const [id] = useState(() => `eng${++shapeUid}`);
  const edge = shade(color, -0.45);
  return (
    <svg viewBox="0 0 160 130" className={`overflow-visible ${className}`} aria-hidden style={{ animation: moving ? 'lep1-chug 0.35s ease-in-out infinite' : undefined }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={shade(color, 0.3)} /><stop offset="1" stopColor={shade(color, -0.15)} /></linearGradient>
      </defs>
      {/* smoke */}
      {[0, 0.45, 0.9].map((d) => (
        <circle key={d} cx="58" cy="18" r="8" fill="#fff" stroke="#E4E4E7" strokeWidth="1.5" style={{ transformBox: 'fill-box', transformOrigin: 'center', animation: `lep1-smoke ${moving ? 0.9 : 1.8}s ease-out ${d * (moving ? 1 : 2)}s infinite` }} />
      ))}
      {/* chimney */}
      <path d="M50 22 h16 l-3 22 h-10 z" fill="#3F3F46" stroke="#18181B" strokeWidth="2.5" strokeLinejoin="round" />
      {/* boiler */}
      <rect x="22" y="44" width="78" height="44" rx="20" fill={`url(#${id})`} stroke={edge} strokeWidth="3" />
      <rect x="32" y="50" width="40" height="7" rx="3.5" fill="#fff" opacity="0.45" />
      <rect x="44" y="44" width="5" height="44" fill={edge} opacity="0.35" />
      {/* lamp + cow-catcher */}
      <circle cx="20" cy="62" r="7" fill="#FDE047" stroke="#18181B" strokeWidth="2.5" />
      <path d="M8 98 L24 86 L24 104 Z" fill="#FACC15" stroke="#18181B" strokeWidth="2.5" strokeLinejoin="round" />
      {/* cab */}
      <rect x="96" y="26" width="52" height="62" rx="6" fill={`url(#${id})`} stroke={edge} strokeWidth="3" />
      <path d="M90 26 h64 l-4 -10 h-56 z" fill="#3F3F46" stroke="#18181B" strokeWidth="2.5" strokeLinejoin="round" />
      <rect x="106" y="36" width="32" height="24" rx="5" fill="#BAE6FD" stroke="#18181B" strokeWidth="2.5" />
      <rect x="109" y="39" width="10" height="5" rx="2.5" fill="#fff" opacity="0.8" />
      {/* chassis + wheels */}
      <rect x="18" y="86" width="134" height="12" rx="4" fill="#27272A" />
      <Wheel cx={48} cy={104} r={16} moving={moving} />
      <Wheel cx={88} cy={104} r={16} moving={moving} />
      <Wheel cx={130} cy={108} r={12} moving={moving} dur={0.45} />
      <rect x="44" y="100" width="48" height="5" rx="2.5" fill="#D4D4D8" stroke="#52525B" strokeWidth="1.2" />
    </svg>
  );
}

/** One wagon; the toy/shape sits inside its window (children). */
export function TrainWagon({ color, moving, children, className = '', glow }: { color: string; moving?: boolean; children?: React.ReactNode; className?: string; glow?: boolean }) {
  const [id] = useState(() => `wag${++shapeUid}`);
  const edge = shade(color, -0.45);
  return (
    <div className={`relative ${className}`} style={{ animation: moving ? 'lep1-chug 0.35s ease-in-out infinite' : undefined }}>
      <svg viewBox="0 0 120 130" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={shade(color, 0.3)} /><stop offset="1" stopColor={shade(color, -0.15)} /></linearGradient>
        </defs>
        <rect x="6" y="12" width="108" height="78" rx="12" fill={`url(#${id})`} stroke={edge} strokeWidth="3" />
        <rect x="16" y="18" width="40" height="6" rx="3" fill="#fff" opacity="0.4" />
        <rect x="16" y="26" width="88" height="56" rx="9" fill="#FFFBEB" stroke={edge} strokeWidth="2" />
        <rect x="0" y="88" width="120" height="10" rx="4" fill="#27272A" />
        <rect x="-10" y="90" width="14" height="5" rx="2" fill="#52525B" />
        <Wheel cx={30} cy={104} r={13} moving={moving} dur={0.5} />
        <Wheel cx={90} cy={104} r={13} moving={moving} dur={0.5} />
      </svg>
      <div className={`absolute left-[16%] right-[16%] top-[22%] bottom-[38%] grid place-items-center rounded-xl ${glow ? 'ring-4 ring-yellow-300 animate-pulse' : ''}`}>{children}</div>
    </div>
  );
}

/** Rails + sleepers; the sleepers scroll while the train runs. */
export function TrainTrack({ moving, className = '' }: { moving?: boolean; className?: string }) {
  return (
    <div className={`relative h-5 ${className}`} aria-hidden>
      <div className="absolute inset-x-0 top-1 h-3" style={{ backgroundImage: 'repeating-linear-gradient(90deg,#92400E 0 14px,transparent 14px 48px)', animation: moving ? 'lep1-track 0.3s linear infinite' : undefined }} />
      <div className="absolute inset-x-0 top-0 h-1.5 rounded bg-zinc-500 shadow" />
      <div className="absolute inset-x-0 bottom-0 h-1.5 rounded bg-zinc-600" />
    </div>
  );
}

/* ---------- Sticker look (no white card) ----------
 * Pictures shown as real die-cut stickers: a white edge that follows the
 * picture's own outline (stacked drop-shadows on the transparent PNG/SVG)
 * plus a soft shadow, a slight tilt, a lift on hover. */
export const STICKER_FILTER = 'drop-shadow(2.5px 0 0 #fff) drop-shadow(-2.5px 0 0 #fff) drop-shadow(0 2.5px 0 #fff) drop-shadow(0 -2.5px 0 #fff) drop-shadow(0 8px 8px rgba(40,20,0,0.35))';
export const STICKER_TILTS = [-6, 4, -3, 6, -5, 3, 5, -4];

/** A tappable sticker: state 'right' glows green, 'wrong' shakes red. */
export function StickerButton({ onClick, label, tilt = 0, state, size = 'h-[min(26vh,20vw)] w-[min(26vh,20vw)]', children, disabled, delay = 0 }: {
  onClick: () => void; label: string; tilt?: number; state?: 'right' | 'wrong' | 'dim'; size?: string; children: React.ReactNode; disabled?: boolean; delay?: number;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`group relative grid place-items-center transition duration-200 active:scale-90 ${size} ${state === 'dim' ? 'opacity-40' : ''} ${state === 'wrong' ? 'animate-[lep1-shake_0.4s_ease-in-out]' : ''}`}
      style={{ animation: state ? undefined : `lep1-card-in 0.45s ease-out ${delay}s both` }}
    >
      {state === 'right' && <span className="absolute inset-[6%] rounded-full bg-emerald-300/70 blur-xl" />}
      {state === 'wrong' && <span className="absolute inset-[10%] rounded-full bg-red-400/60 blur-xl" />}
      <span className={`relative block h-full w-full transition-transform duration-200 group-hover:-translate-y-1.5 group-hover:scale-105 ${state === 'right' ? 'scale-110' : ''}`} style={{ transform: `rotate(${state === 'right' ? 0 : tilt}deg)`, filter: STICKER_FILTER }}>
        {children}
      </span>
      {state === 'right' && <span className="absolute -right-1 -top-1 grid h-9 w-9 place-items-center rounded-full bg-emerald-500 text-lg text-white shadow-lg" style={{ animation: 'lep1-pop 0.4s ease-out' }}>✓</span>}
    </button>
  );
}

/** A Thing (picture or coloured shape) drawn as a sticker. `shadow` paints it as a dark silhouette. */
export function ThingArt({ thing, shadow = false }: { thing: Thing; shadow?: boolean }) {
  const style = shadow ? { filter: 'brightness(0)', opacity: 0.5 } : { filter: STICKER_FILTER };
  return (
    <span className="block h-full w-full" style={style}>
      {thing.img
        ? <img src={thing.img} alt={shadow ? '' : thing.label} draggable={false} className="h-full w-full object-contain" />
        : <ShapeIcon shape={thing.shape ?? 'circle'} fill={thing.colorHex ?? '#F97316'} />}
    </span>
  );
}
