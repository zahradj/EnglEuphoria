import { useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { Confetti } from '../fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { CLAY_BUTTON, STICKER_FILTER, THICK_WORDS, sayWithin, useArtBox } from './shared';
import { Bursts, useBursts } from './gameFx';

/* ---------- Animal Parade (Pre-A1 Unit 7 Lesson 3 signature game) ----------
 * The farm animals want to march over the little bridge. Pip calls the
 * parade order — "First the horse, then the duck!" — and the child taps the
 * animals in that order; each one hops onto the bridge. When the line is
 * right, the parade marches across and every animal says its sound. Wrong
 * order? "Listen again!", the bridge empties and Pip says the order again.
 * Researched: Cambridge Pre A1 Starters listening (follow a short spoken
 * instruction), classic "follow the order" memory games (Simon / listen-and-
 * sequence, games4esl), Khan Academy Kids sequencing activities.
 * Better: the child holds two or three NEW words in order (listening span,
 * not just one word), the parade they built moves and makes the sounds, and
 * mistakes cost nothing — the bridge simply empties for another try; no clock. */

type Parade = Extract<Scene, { kind: 'animal-parade' }>;
export const PARADE_INTRO = "Let's make an animal parade!";
export const PARADE_AGAIN = 'Listen again!';

export function AnimalParadeScene({ scene, onWin, onLose, onNext, sync }: { scene: Parade; onWin: (gem: boolean) => void; onLose: () => void; onNext: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, { round: 0, picked: [-1], marching: false, wrong: -1, gemDone: false });
  const { round, marching, wrong, gemDone } = state;
  const picked = useMemo(() => state.picked.filter((p) => p >= 0), [state.picked]);
  const total = scene.rounds.length;
  const done = round >= total;
  const r = scene.rounds[round];
  const rootRef = useRef<HTMLDivElement>(null);
  const box = useArtBox(rootRef, scene.aspect ?? 16 / 9);
  const busy = useRef(false);
  const [bursts, fire] = useBursts();
  const { lane } = scene;

  useEffect(() => {
    const t = window.setTimeout(() => cueSpeak(PARADE_INTRO, scene.who), 300);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene.id]);

  useEffect(() => {
    if (!r) return;
    const t = window.setTimeout(() => cueSpeak(r.line, scene.who), round === 0 ? 2600 : 700);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, scene.id]);

  /** x (% of the picture) of the k-th animal standing on the bridge. */
  const slotX = (k: number, n: number) => lane.x0 + ((k + 1) / (n + 1)) * (lane.x1 - lane.x0);

  const tap = async (i: number) => {
    if (!r || busy.current || marching || picked.includes(i)) return;
    const want = r.order[picked.length];
    if (i !== want) {
      busy.current = true;
      sfx.wrong(); onLose();
      setState((s) => ({ ...s, wrong: i }));
      await sayWithin(PARADE_AGAIN, scene.who, 1800);
      setState((s) => ({ ...s, wrong: -1, picked: [-1] }));
      await sayWithin(r.line, scene.who, 4000);
      busy.current = false;
      return;
    }
    sfx.pop();
    const next = [...picked, i];
    setState((s) => ({ ...s, picked: next }));
    fire(slotX(next.length - 1, r.order.length), lane.y - 8, 'sparkle');
    if (next.length < r.order.length) return;
    busy.current = true;
    sfx.match();
    setState((s) => ({ ...s, marching: true }));
    for (const k of r.order) {
      const a = scene.animals[k];
      if (a) await sayWithin(a.say, scene.who, 2400);
    }
    const n = round + 1;
    if (n >= total && !gemDone) { sfx.gem(); onWin(true); }
    setState((s) => ({ ...s, round: n, picked: [-1], marching: false, gemDone: s.gemDone || n >= total }));
    if (n >= total) await sayWithin(scene.doneLine, scene.who, 4000);
    busy.current = false;
  };

  const order = r?.order ?? [];
  return (
    <div ref={rootRef} className="absolute inset-0 select-none overflow-hidden bg-gradient-to-b from-sky-300 to-lime-200">
      <img src={scene.bg} alt="" draggable={false} className="pointer-events-none absolute" style={box} />
      {done && <Confetti count={70} />}

      {/* The bridge: the animals in the parade so far. */}
      <div className="pointer-events-none absolute z-20" style={box}>
        {(done ? scene.animals.map((_, k) => k) : picked).map((i, k, arr) => {
          const a = scene.animals[i];
          if (!a) return null;
          const n = done ? arr.length : order.length;
          const x = slotX(k, n);
          return (
            <motion.div key={`${round}-${i}`} className="absolute -translate-x-1/2 -translate-y-full" style={{ top: `${lane.y}%`, width: `${lane.size * (a.scale ?? 1)}%` }}
              initial={{ left: `${x}%`, opacity: 0 }}
              animate={marching || done ? { left: [`${x}%`, `${x + 4}%`, `${x + 8}%`], opacity: 1 } : { left: `${x}%`, opacity: 1 }}
              transition={{ ...(marching || done ? { duration: 2.4, ease: 'easeInOut', repeat: done ? Infinity : 0, repeatType: 'reverse' as const } : { type: 'spring' as const, stiffness: 220, damping: 16 }), opacity: { duration: 0.3 } }}>
              <motion.img src={a.img} alt={a.label} draggable={false} className="w-full" style={{ filter: STICKER_FILTER }}
                initial={{ scale: 0.6 }} animate={marching || done ? { y: [0, -10, 0], scale: 1 } : { y: 0, scale: 1 }} transition={{ duration: 0.45, repeat: marching || done ? Infinity : 0 }} />
            </motion.div>
          );
        })}
        <Bursts items={bursts} />
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-16 z-30 flex flex-col items-center px-14">
        <span className="text-center font-black leading-tight text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.05rem, min(calc(3.2*var(--svw,1vw)), 5vh), 2.6rem)' }}>
          {done ? scene.doneLine : `\u{1F389} ${r?.line ?? ''}`}
        </span>
        {!done && r && (
          <div className="mt-1 flex gap-1.5 rounded-full bg-white/90 px-3 py-1 shadow">
            {order.map((_, k) => <span key={k} className={`h-3 w-3 rounded-full ${k < picked.length ? 'bg-emerald-500' : 'bg-slate-300'}`} />)}
          </div>
        )}
      </div>
      {r && <button onClick={() => cueSpeak(r.line, scene.who)} aria-label="Hear it again" className="absolute left-3 top-16 z-30 rounded-full bg-white/90 px-4 py-2 text-lg font-black text-orange-700 shadow-lg active:scale-95">{'\u{1F50A}'}</button>}

      {/* The animal pen: tap them in the order you hear. */}
      {!done && (
        <div className="absolute right-2 top-1/2 z-40 flex -translate-y-1/2 flex-col items-center gap-1.5 rounded-3xl border-4 border-amber-700/70 bg-amber-100/90 px-1.5 py-2 shadow-xl portrait:bottom-[3%] portrait:left-1/2 portrait:right-auto portrait:top-auto portrait:-translate-x-1/2 portrait:translate-y-0 portrait:flex-row portrait:items-end portrait:gap-[min(2vw,14px)] portrait:px-3">
          {scene.animals.map((a, i) => {
            const used = picked.includes(i);
            return (
              <motion.button key={a.label} aria-label={a.label} onClick={() => { void tap(i); }} disabled={used || marching}
                className={`flex w-[min(13vh,10vw)] flex-col items-center rounded-2xl bg-white/80 p-1 shadow portrait:w-[min(16vh,15vw)] ${used ? 'opacity-30' : ''}`}
                animate={wrong === i ? { x: [0, -8, 8, -6, 6, 0] } : { x: 0 }} transition={{ duration: 0.4 }} whileTap={{ scale: 0.92 }}>
                <img src={a.img} alt="" draggable={false} className="aspect-square w-full object-contain" />
                <span className="text-[min(2.4vh,1.8vw)] font-black leading-tight text-amber-800 portrait:text-[min(2.4vh,2.6vw)]">{a.label}</span>
              </motion.button>
            );
          })}
        </div>
      )}

      {done && (
        <motion.div className="absolute inset-x-0 bottom-[8%] z-50 flex justify-center" initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.2, type: 'spring' }}>
          <button onClick={onNext} className={`${CLAY_BUTTON} px-8 py-3 text-xl`}>Next {'⭐'}</button>
        </motion.div>
      )}
    </div>
  );
}

/** Every voiced line, for the clip baker (scripts/generate-voice-cache.mjs mirrors this). */
export function animalParadeLines(scene: Parade) {
  return [
    [scene.who, PARADE_INTRO],
    [scene.who, PARADE_AGAIN],
    ...scene.rounds.map((r) => [scene.who, r.line]),
    ...scene.animals.map((a) => [scene.who, a.say]),
    [scene.who, scene.doneLine],
  ] as [string, string][];
}
