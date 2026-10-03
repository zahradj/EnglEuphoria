// Helpers used by more than one scene. Anything used by a single scene lives next to it.
import { useEffect, useState } from 'react';
import type { CharKey } from '../scenes';
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
export function ShapeIcon({ shape, fill }: { shape: string; fill: string }) {
  return (
    <svg viewBox="0 0 40 40" className="h-full w-full" aria-hidden>
      {shape === 'circle' && <circle cx="20" cy="20" r="16" fill={fill} stroke="#2B1E17" strokeWidth="2.5" />}
      {shape === 'square' && <rect x="5" y="5" width="30" height="30" rx="2" fill={fill} stroke="#2B1E17" strokeWidth="2.5" />}
      {shape === 'triangle' && <polygon points="20,4 37,35 3,35" fill={fill} stroke="#2B1E17" strokeWidth="2.5" strokeLinejoin="round" />}
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
