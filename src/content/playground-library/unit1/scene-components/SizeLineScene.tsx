import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { Confetti } from '../fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { CLAY_BUTTON, STICKER_FILTER, THICK_WORDS, sayWithin } from './shared';
import { Bursts, useBursts, useShake } from './gameFx';

/* ---------- Line Up! (Pre-A1 Unit 5 Lesson 2) ----------
 * The family lines up for the photo, biggest to smallest. "Who is the
 * biggest?" — the child taps that family member, who walks to the first spot
 * and says who they are ("My dad! Dad is the biggest!"), then "Who is next?"
 * … down to "The baby! The baby is the smallest!". Researched: Montessori
 * size-seriation ("pink tower"), Khan Academy Kids order-by-size puzzles and
 * the Cambridge Pre A1 big/small words. Better: every step is a family word
 * the child hears and repeats, the order recycles big / small from Unit 4,
 * and the line it builds is the family photo of the lesson. A wrong pick is
 * gently named back ("Not yet! Who is bigger?"). No clock. */

type Line = Extract<Scene, { kind: 'size-line' }>;
export const LINE_FIRST = 'Who is the biggest?';
export const LINE_NEXT = 'Who is next?';
export const LINE_WRONG = 'Not yet! Who is bigger?';

export function SizeLineScene({ scene, onWin, onNext, sync }: { scene: Line; onWin: (gem: boolean) => void; onNext: () => void; sync?: ActivitySync }) {
  // members are listed biggest → smallest; the floor shows them shuffled.
  const [state, setState] = useSyncedState(sync, { placed: [] as number[], gemDone: false });
  const { placed, gemDone } = state;
  const placedSet = useMemo(() => new Set(placed), [placed]);
  const total = scene.members.length;
  const want = placed.length;
  const done = want >= total;
  const floorOrder = useMemo(() => scene.floorOrder ?? scene.members.map((_, i) => i), [scene.floorOrder, scene.members]);
  const busy = useRef(false);
  const [misses, setMisses] = useState(0);
  const [wrong, setWrong] = useState(-1);
  const [bursts, fire] = useBursts();
  const [shakeCtl, shake] = useShake();
  const prompt = done ? scene.doneLine : want === 0 ? LINE_FIRST : want === total - 1 ? scene.lastLine : LINE_NEXT;

  useEffect(() => {
    busy.current = false;
    setMisses(0);
    if (done) return;
    const t = window.setTimeout(() => cueSpeak(prompt, scene.who), want === 0 ? 700 : 300);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [want, scene.id]);

  const pick = async (i: number) => {
    if (busy.current || done || placedSet.has(i)) return;
    busy.current = true;
    if (i !== want) {
      sfx.wrong(); shake(); setWrong(i);
      setMisses((m) => m + 1);
      await sayWithin(LINE_WRONG, scene.who, 2200);
      setWrong(-1);
      busy.current = false;
      return;
    }
    sfx.pop();
    window.setTimeout(() => { sfx.match(); fire(20 + (want / Math.max(1, total - 1)) * 60, 40, 'stars'); }, 300);
    setState((s) => ({ ...s, placed: [...s.placed, i] }));
    await sayWithin(scene.members[i].reply, scene.who, 3600);
    if (want + 1 >= total && !gemDone) { fire(50, 40, 'confetti'); sfx.gem(); onWin(true); setState((s) => ({ ...s, gemDone: true })); void sayWithin(scene.doneLine, scene.who, 4000); }
    busy.current = false;
  };

  const tallest = Math.max(...scene.members.map((m) => m.height));
  return (
    <motion.div className="absolute inset-0 select-none overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }} animate={shakeCtl}>
      {done && <Confetti count={60} />}
      <div className="pointer-events-none absolute inset-x-0 top-16 z-30 flex flex-col items-center gap-1 px-14">
        <span className="text-center font-black leading-tight text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.4rem, calc(3.6*var(--svw,1vw)), 3rem)' }}>{prompt}</span>
      </div>
      {!done && <button onClick={() => cueSpeak(prompt, scene.who)} aria-label="Hear it again" className="absolute right-3 top-16 z-30 rounded-full bg-white/90 px-4 py-2 text-lg font-black text-orange-700 shadow-lg active:scale-95">🔊</button>}

      {/* The line-up: one spot per family member, biggest on the left. */}
      <div className="absolute inset-x-[6%] top-[30%] z-10 flex h-[34vh] items-end justify-around border-b-[6px] border-dashed border-white/80">
        {scene.members.map((m, k) => {
          const who = placed[k];
          const mm = who !== undefined ? scene.members[who] : undefined;
          return (
            <div key={k} className="relative flex h-full flex-1 items-end justify-center">
              {mm ? (
                <motion.img src={mm.img} alt={mm.label} draggable={false} className="object-contain"
                  style={{ height: `${(mm.height / tallest) * 100}%`, filter: STICKER_FILTER }}
                  initial={{ y: 160, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 160, damping: 14 }} />
              ) : (
                <span className={`mb-2 grid h-10 w-10 place-items-center rounded-full font-black text-white ${k === want ? 'animate-pulse bg-orange-400' : 'bg-white/40'}`}>{k + 1}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* The family waiting on the grass. */}
      {!done && (
        <div className="absolute inset-x-0 bottom-[10%] z-20 flex h-[24vh] items-end justify-center gap-[2.5vw] px-3 [@media(max-height:500px)]:h-[22vh]">
          {floorOrder.map((i) => {
            const m = scene.members[i];
            if (placedSet.has(i)) return <span key={i} className="w-[8vw]" />;
            const glow = misses >= 2 && i === want;
            return (
              <motion.button key={i} aria-label={m.label} onClick={() => { void pick(i); }}
                className="relative flex h-full min-w-[48px] items-end justify-center"
                animate={wrong === i ? { x: [0, -10, 10, -6, 6, 0] } : { y: [0, -5, 0] }}
                transition={wrong === i ? { duration: 0.4 } : { duration: 2 + (i % 3) * 0.3, repeat: Infinity, ease: 'easeInOut' }}
                whileTap={{ scale: 0.92 }}>
                {glow && <span className="absolute inset-x-0 bottom-0 top-[20%] animate-pulse rounded-full bg-yellow-300/80 blur-lg" />}
                <img src={m.img} alt="" draggable={false} className="relative object-contain" style={{ height: `${(m.height / tallest) * 100}%`, filter: STICKER_FILTER }} />
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
export function sizeLineLines(scene: Line) {
  return [
    [scene.who, LINE_FIRST], [scene.who, LINE_NEXT], [scene.who, LINE_WRONG], [scene.who, scene.lastLine],
    ...scene.members.map((m) => [scene.who, m.reply]),
    [scene.who, scene.doneLine],
  ] as [string, string][];
}
