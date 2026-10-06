import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { Confetti } from '../fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { CLAY_BUTTON, STICKER_FILTER, ShapeIcon, THICK_WORDS, sayWithin } from './shared';
import { Bursts, useBursts, useShake } from './gameFx';

/* ---------- Shape Sorter (Pre-A1 Unit 2 Lesson 3) ----------
 * The toddler's favourite toy, as a listening game: "Put in the blue
 * square!" The child picks the right block from the floor (tap it, or drag
 * it onto the box) and it drops through its hole — plonk! When every block
 * is in, the lid pops and a toy jumps out. Researched: the shape-sorter toy
 * (Fisher-Price / Montessori shape posting), Cambridge Pre A1 Starters
 * listening (colour + object), Lingokids shape games. Better than the toy
 * and the apps: two blocks share each shape, so the child must hear the
 * COLOUR too (recycling Lessons 1–2); a wrong block bonks off the lid and is
 * named back ("That's the green square!"). No clock. */

type Sorter = Extract<Scene, { kind: 'shape-sorter' }>;
const HOLES = ['circle', 'square', 'triangle'] as const;
export const sorterWrongLine = (colorWord: string, shape: string) => `That's the ${colorWord.toLowerCase()} ${shape}! Try again!`;

export function ShapeSorterScene({ scene, onWin, onNext, sync }: { scene: Sorter; onWin: (gem: boolean) => void; onNext: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, { round: 0, used: [] as number[], wrong: -1, gemDone: false });
  const { round, used, wrong, gemDone } = state;
  const usedSet = useMemo(() => new Set(used), [used]);
  const total = scene.rounds.length;
  const r = round < total ? scene.rounds[round] : undefined;
  const done = round >= total;
  const busy = useRef(false);
  const box = useRef<HTMLDivElement>(null);
  const [bursts, fire] = useBursts();
  const [shakeCtl, shake] = useShake();
  // Not synced: it only decides when the right block glows (after 2 misses).
  const [misses, setMisses] = useState(0);

  useEffect(() => {
    busy.current = false;
    setMisses(0);
    if (!r) return;
    const t = window.setTimeout(() => cueSpeak(r.line, scene.who), 600);
    const idle = window.setInterval(() => { if (!busy.current) cueSpeak(r.line, scene.who); }, 8000);
    return () => { window.clearTimeout(t); window.clearInterval(idle); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, scene.id]);

  const choose = async (i: number) => {
    const b = scene.blocks[i];
    if (!r || !b || busy.current || usedSet.has(i)) return;
    busy.current = true;
    if (i !== r.block) {
      sfx.wrong(); shake();
      setMisses((m) => m + 1);
      setState((s) => ({ ...s, wrong: i }));
      await sayWithin(sorterWrongLine(b.colorWord, b.shape), scene.who, 3200);
      setState((s) => ({ ...s, wrong: -1 }));
      busy.current = false;
      return;
    }
    sfx.pop();
    setState((s) => ({ ...s, used: [...s.used, i] }));
    window.setTimeout(() => { sfx.match(); fire(50, 30, 'stars'); }, 550);
    await sayWithin(r.reply, scene.who, 3500);
    const next = round + 1;
    if (next >= total && !gemDone) { fire(50, 30, 'confetti'); sfx.gem(); onWin(true); }
    setState((s) => ({ ...s, round: next, gemDone: s.gemDone || next >= total }));
    if (next >= total) void sayWithin(scene.doneLine, scene.who, 4000);
  };

  /** A block dragged and let go over the box counts as a pick. */
  const dropped = (i: number, x: number, y: number) => {
    const rect = box.current?.getBoundingClientRect();
    if (rect && x > rect.left - 30 && x < rect.right + 30 && y > rect.top - 40 && y < rect.bottom) void choose(i);
  };

  return (
    <motion.div className="absolute inset-0 select-none overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }} animate={shakeCtl}>
      {done && <Confetti count={60} />}
      <div className="pointer-events-none absolute inset-x-0 top-16 z-30 flex flex-col items-center gap-1 px-14">
        <span className="text-center font-black leading-tight text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.4rem, calc(3.6*var(--svw,1vw)), 3rem)' }}>
          {r ? r.line : scene.doneLine}
        </span>
        <div className="flex gap-1">
          {scene.rounds.map((_, i) => <span key={i} className={`text-xl transition ${i < round ? '' : 'opacity-30 grayscale'}`}>⭐</span>)}
        </div>
      </div>
      {r && <button onClick={() => cueSpeak(r.line, scene.who)} aria-label="Hear it again" className="absolute right-3 top-16 z-30 rounded-full bg-white/90 px-4 py-2 text-lg font-black text-orange-700 shadow-lg active:scale-95">🔊</button>}

      {/* The sorter box: lid with three holes. */}
      <div ref={box} className="absolute left-1/2 top-[30%] z-10 h-[30vh] w-[min(62vh,52vw)] -translate-x-1/2 [@media(max-height:500px)]:top-[40%] [@media(max-height:500px)]:h-[24vh]">
        {done && (
          <motion.img
            src={scene.surprise.img} alt={scene.surprise.label} draggable={false}
            className="absolute left-1/2 top-[-62%] z-0 h-[30vh] w-[30vh] -translate-x-1/2 object-contain"
            style={{ filter: STICKER_FILTER }}
            initial={{ y: 120, scale: 0.4 }} animate={{ y: [120, -20, 0], scale: 1 }} transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
          />
        )}
        <motion.div
          className="absolute inset-x-0 top-0 z-10 flex h-[34%] items-center justify-around rounded-[20px] border-[5px] border-[#9F1239] bg-gradient-to-b from-[#FB7185] to-[#E11D48] px-[6%] shadow-[inset_0_4px_0_rgba(255,255,255,0.45)]"
          animate={done ? { rotate: -24, y: -40, x: -30 } : { rotate: 0, y: 0, x: 0 }}
          transition={{ type: 'spring', stiffness: 140, damping: 12 }}
          style={{ transformOrigin: '0% 100%' }}
        >
          {HOLES.map((h) => (
            <span key={h} className="block h-[70%] aspect-square opacity-90">
              <ShapeIcon shape={h} fill="#3F0A1E" />
            </span>
          ))}
        </motion.div>
        <div className="absolute inset-x-[3%] bottom-0 top-[30%] rounded-b-[22px] border-[5px] border-t-0 border-[#1E3A8A] bg-gradient-to-b from-[#60A5FA] to-[#2563EB] shadow-[0_16px_26px_rgba(20,30,80,0.35)]">
          <span className="absolute inset-x-[10%] top-[35%] h-[10%] rounded-full bg-white/25" />
        </div>
      </div>

      {/* Blocks on the floor. */}
      {!done && (
        <div className="absolute inset-x-0 bottom-[10%] z-20 flex items-end justify-center gap-[2.4vw] px-3">
          {scene.blocks.map((b, i) => {
            const isUsed = usedSet.has(i);
            const glow = misses >= 2 && r && i === r.block;
            return (
              <motion.button
                key={i}
                aria-label={`${b.colorWord.toLowerCase()} ${b.shape}`}
                onClick={() => { void choose(i); }}
                drag={!isUsed}
                dragSnapToOrigin
                dragMomentum={false}
                onDragEnd={(_, info) => dropped(i, info.point.x - window.scrollX, info.point.y - window.scrollY)}
                className="relative grid h-[min(16vh,13vw)] w-[min(16vh,13vw)] cursor-grab touch-none place-items-center active:cursor-grabbing"
                animate={isUsed ? { y: '-48vh', scale: 0.3, opacity: 0 } : wrong === i ? { x: [0, -10, 10, -6, 6, 0] } : { y: [0, -6, 0] }}
                transition={isUsed ? { duration: 0.55, ease: 'easeIn' } : wrong === i ? { duration: 0.4 } : { duration: 2.2 + (i % 3) * 0.3, repeat: Infinity, ease: 'easeInOut' }}
                style={{ pointerEvents: isUsed ? 'none' : undefined }}
              >
                {glow && <span className="absolute inset-[-8%] animate-pulse rounded-full bg-yellow-300/80 blur-lg" />}
                <span className="relative block h-full w-full"><ShapeIcon shape={b.shape} fill={b.colorHex} /></span>
              </motion.button>
            );
          })}
        </div>
      )}

      <Bursts items={bursts} />
      {done && (
        <motion.div className="absolute inset-x-0 bottom-[8%] z-40 flex justify-center" initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.4, type: 'spring' }}>
          <button onClick={onNext} className={`${CLAY_BUTTON} px-10 py-3 text-xl`}>Next ⭐</button>
        </motion.div>
      )}
    </motion.div>
  );
}

/** Every voiced line, for the clip baker (scripts/generate-voice-cache.mjs mirrors this). */
export function shapeSorterLines(scene: Sorter) {
  return [
    ...scene.rounds.flatMap((r) => [[scene.who, r.line], [scene.who, r.reply]]),
    ...scene.blocks.map((b) => [scene.who, sorterWrongLine(b.colorWord, b.shape)]),
    [scene.who, scene.doneLine],
  ] as [string, string][];
}
