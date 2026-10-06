import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { Confetti } from '../fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { CLAY_BUTTON, ShapeIcon, THICK_WORDS, sayWithin } from './shared';
import { Bursts, useBursts } from './gameFx';

/* ---------- Bubble Pop (Pre-A1 Unit 2 Lesson 3) ----------
 * Big soap bubbles float in place over Shape Town, each holding a shape.
 * "Pop the circles!" — the child pops every circle bubble, then the squares,
 * then the triangles. Researched: Lingokids / Khan Academy Kids bubble-pop
 * rewards, Wordwall "balloon pop", and the calm-game rules in
 * docs/research/young-learner-games.md. Better than the arcade versions:
 * the bubbles drift gently on the spot and WAIT (no clock, nothing escapes),
 * the shape — not the colour — decides (colours are mixed on purpose), a
 * wrong bubble just wobbles and is named ("That's a square!"), and after two
 * misses the right bubbles shimmer. */

type Bubbles = Extract<Scene, { kind: 'shape-bubbles' }>;
type ShapeName = 'circle' | 'square' | 'triangle';
const SHAPES: ShapeName[] = ['circle', 'square', 'triangle'];
const COLORS = ['#EF4444', '#3B82F6', '#FACC15', '#22C55E', '#A855F7', '#F97316'];
/** Fixed bubble spots (% of the stage), clear of the title and the bottom edge. */
const SPOTS = [
  { x: 14, y: 40 }, { x: 33, y: 33 }, { x: 52, y: 42 }, { x: 71, y: 34 }, { x: 88, y: 43 },
  { x: 22, y: 66 }, { x: 42, y: 68 }, { x: 62, y: 66 }, { x: 81, y: 69 },
];
export const bubbleWrongLine = (shape: string) => `That's a ${shape}!`;

/** The bubbles of one round: `count` of the target shape mixed with the other two (deterministic). */
function layout(round: number, shape: ShapeName, count: number) {
  const others = SHAPES.filter((s) => s !== shape);
  const n = SPOTS.length;
  const kinds: ShapeName[] = Array.from({ length: n }, (_, i) => (i < count ? shape : others[i % 2]));
  // Rotate so targets land in different spots each round.
  const shift = (round * 4 + 1) % n;
  const placed = kinds.map((_, i) => kinds[(i + shift) % n]);
  return placed.map((s, i) => ({ shape: s, color: COLORS[(i * 5 + round * 2) % COLORS.length], ...SPOTS[i] }));
}

export function ShapeBubblesScene({ scene, onWin, onNext, sync }: { scene: Bubbles; onWin: (gem: boolean) => void; onNext: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, { round: 0, popped: [] as number[], wrong: -1, gemDone: false });
  const { round, popped, wrong, gemDone } = state;
  const poppedSet = useMemo(() => new Set(popped), [popped]);
  const total = scene.rounds.length;
  const r = round < total ? scene.rounds[round] : undefined;
  const done = round >= total;
  const bubbles = useMemo(() => (r ? layout(round, r.shape, Math.max(1, Math.min(4, r.count))) : []), [r, round]);
  const left = bubbles.filter((b, i) => r && b.shape === r.shape && !poppedSet.has(i)).length;
  const busy = useRef(false);
  const [misses, setMisses] = useState(0);
  const [bursts, fire] = useBursts();

  useEffect(() => {
    busy.current = false;
    setMisses(0);
    if (!r) return;
    const t = window.setTimeout(() => cueSpeak(r.line, scene.who), 600);
    const idle = window.setInterval(() => { if (!busy.current) cueSpeak(r.line, scene.who); }, 8000);
    return () => { window.clearTimeout(t); window.clearInterval(idle); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, scene.id]);

  const tap = async (i: number) => {
    const b = bubbles[i];
    if (!r || !b || busy.current || poppedSet.has(i)) return;
    if (b.shape !== r.shape) {
      busy.current = true;
      sfx.wrong();
      setMisses((m) => m + 1);
      setState((s) => ({ ...s, wrong: i }));
      await sayWithin(bubbleWrongLine(b.shape), scene.who, 2500);
      setState((s) => ({ ...s, wrong: -1 }));
      busy.current = false;
      return;
    }
    sfx.pop();
    fire(b.x, b.y, 'stars');
    setState((s) => ({ ...s, popped: [...s.popped, i] }));
    if (left > 1) return;
    busy.current = true;
    await sayWithin(r.reply, scene.who, 3500);
    const next = round + 1;
    if (next >= total && !gemDone) { fire(50, 50, 'confetti'); sfx.gem(); onWin(true); }
    setState((s) => ({ ...s, round: next, popped: [], gemDone: s.gemDone || next >= total }));
  };

  return (
    <div className="absolute inset-0 select-none overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="absolute inset-0 bg-sky-900/10" />
      {done && <Confetti count={60} />}
      <div className="pointer-events-none absolute inset-x-0 top-16 z-30 flex flex-col items-center gap-1 px-14">
        <span className="text-center font-black leading-tight text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.4rem, calc(3.6*var(--svw,1vw)), 3rem)' }}>
          {r ? r.line : scene.doneLine}
        </span>
        <div className="flex gap-1">
          {scene.rounds.map((_, i) => <span key={i} className={`text-xl transition ${i < round ? '' : 'opacity-30 grayscale'}`}>🫧</span>)}
        </div>
      </div>
      {r && <button onClick={() => cueSpeak(r.line, scene.who)} aria-label="Hear it again" className="absolute right-3 top-16 z-30 rounded-full bg-white/90 px-4 py-2 text-lg font-black text-orange-700 shadow-lg active:scale-95">🔊</button>}

      {r && bubbles.map((b, i) => {
        const gone = poppedSet.has(i);
        const hint = misses >= 2 && b.shape === r.shape && !gone;
        return (
          <motion.button
            key={`${round}-${i}`}
            aria-label={`${b.shape} bubble`}
            onClick={() => { void tap(i); }}
            className="absolute z-20 h-[min(19vh,14vw)] w-[min(19vh,14vw)] -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${b.x}%`, top: `${b.y}%`, pointerEvents: gone ? 'none' : undefined }}
            initial={{ scale: 0, opacity: 0 }}
            animate={gone ? { scale: 1.5, opacity: 0 } : wrong === i ? { scale: 1, opacity: 1, x: [0, -9, 9, -5, 5, 0] } : { scale: 1, opacity: 1, y: [0, -8, 0, 6, 0] }}
            transition={gone ? { duration: 0.25 } : wrong === i ? { duration: 0.4 } : { scale: { delay: i * 0.05, type: 'spring' }, opacity: { delay: i * 0.05 }, y: { duration: 3 + (i % 4) * 0.4, repeat: Infinity, ease: 'easeInOut' } }}
          >
            {/* The soap bubble. */}
            <span className={`absolute inset-0 rounded-full border-[3px] border-white/80 ${hint ? 'animate-pulse ring-4 ring-yellow-300' : ''}`} style={{ background: 'radial-gradient(circle at 32% 28%, rgba(255,255,255,0.9) 0 9%, rgba(255,255,255,0.15) 10% 45%, rgba(186,230,253,0.35) 70%, rgba(244,114,182,0.35) 100%)', boxShadow: 'inset -6px -8px 18px rgba(147,197,253,0.6), 0 8px 18px rgba(0,0,0,0.15)' }} />
            <span className="absolute inset-[24%]"><ShapeIcon shape={b.shape} fill={b.color} /></span>
          </motion.button>
        );
      })}

      <Bursts items={bursts} />
      {done && (
        <motion.div className="absolute inset-x-0 bottom-[8%] z-40 flex justify-center" initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1, type: 'spring' }}>
          <button onClick={onNext} className={`${CLAY_BUTTON} px-10 py-3 text-xl`}>Next ⭐</button>
        </motion.div>
      )}
    </div>
  );
}

/** Every voiced line, for the clip baker (scripts/generate-voice-cache.mjs mirrors this). */
export function shapeBubblesLines(scene: Bubbles) {
  return [
    ...scene.rounds.flatMap((r) => [[scene.who, r.line], [scene.who, r.reply]]),
    ...SHAPES.map((s) => [scene.who, bubbleWrongLine(s)]),
    [scene.who, scene.doneLine],
  ] as [string, string][];
}
