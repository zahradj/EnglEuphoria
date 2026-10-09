import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { Confetti } from '../fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { CLAY_BUTTON, STICKER_FILTER, THICK_WORDS, sayWithin, useArtBox } from './shared';
import { Bursts, useBursts } from './gameFx';

/* ---------- Farm Wash (Pre-A1 Unit 7 Lesson 2 signature game) ----------
 * It rained on the farm and every animal is muddy. Pip says "Wash the pig!";
 * the child scrubs THAT animal — three taps, bubbles fly, the mud spots pop
 * off one by one — and the clean animal shines while Pip says "It's a pig!
 * Oink!". A wrong animal is named back ("Oops! That's the cow.") and stays
 * muddy. Researched: Toca Boca / Lingokids pet-care "wash and groom" play,
 * Khan Academy Kids calm listen-and-do tasks, Cambridge Pre A1 Starters
 * "listen and point".
 * Better: the action itself is the answer (the child must hear the WORD to
 * know which animal to wash); the farm visibly changes from muddy to clean, so
 * progress is a picture, not a score; no clock, wrong taps cost nothing and
 * every one names an animal. */

type Wash = Extract<Scene, { kind: 'farm-wash' }>;
export const WASH_INTRO = "Oh no! The animals are muddy! Let's wash them!";
export const washOops = (label: string) => `Oops! That's the ${label}.`;
const SCRUBS = 3;
/** Mud spots on a sticker, % of its box (left, top, size). */
const MUD = [[18, 30, 34], [52, 52, 30], [30, 66, 26]] as const;

export function FarmWashScene({ scene, onWin, onLose, onNext, sync }: { scene: Wash; onWin: (gem: boolean) => void; onLose: () => void; onNext: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, { round: 0, dirt: scene.animals.map(() => SCRUBS), misses: 0, gemDone: false });
  const { round, misses, gemDone } = state;
  const dirt = scene.animals.map((_, i) => state.dirt[i] ?? SCRUBS);
  const total = scene.rounds.length;
  const done = round >= total;
  const r = scene.rounds[round];
  const rootRef = useRef<HTMLDivElement>(null);
  const box = useArtBox(rootRef, scene.aspect ?? 16 / 9);
  const busy = useRef(false);
  const [bursts, fire] = useBursts();

  useEffect(() => {
    const t = window.setTimeout(() => cueSpeak(WASH_INTRO, scene.who), 300);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene.id]);

  useEffect(() => {
    if (!r) return;
    const t = window.setTimeout(() => cueSpeak(r.line, scene.who), round === 0 ? 3200 : 600);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, scene.id]);

  const scrub = async (i: number) => {
    const a = scene.animals[i];
    if (!r || !a || busy.current) return;
    if (i !== r.target) {
      if (dirt[i] === 0) { cueSpeak(a.say, scene.who); return; }
      busy.current = true;
      sfx.wrong(); onLose();
      setState((s) => ({ ...s, misses: s.misses + 1 }));
      await sayWithin(washOops(a.label), scene.who, 2500);
      busy.current = false;
      return;
    }
    const left = dirt[i] - 1;
    fire(a.x, a.y - a.size * 0.6, 'splash');
    sfx.pop();
    setState((s) => ({ ...s, dirt: scene.animals.map((_, k) => (k === i ? left : s.dirt[k] ?? SCRUBS)) }));
    if (left > 0) return;
    busy.current = true;
    fire(a.x, a.y - a.size * 0.6, 'sparkle');
    sfx.match();
    await sayWithin(a.say, scene.who, 3500);
    const next = round + 1;
    if (next >= total && !gemDone) { sfx.gem(); onWin(true); }
    setState((s) => ({ ...s, round: next, misses: 0, gemDone: s.gemDone || next >= total }));
    if (next >= total) await sayWithin(scene.doneLine, scene.who, 4000);
    busy.current = false;
  };

  return (
    <div ref={rootRef} className="absolute inset-0 select-none overflow-hidden bg-gradient-to-b from-sky-300 to-lime-200">
      <img src={scene.bg} alt="" draggable={false} className="pointer-events-none absolute" style={box} />
      {done && <Confetti count={70} />}

      <div className="absolute z-20" style={box}>
        {scene.animals.map((a, i) => {
          const d = dirt[i];
          const glow = !done && r && i === r.target && misses >= 2 && d > 0;
          return (
            <button key={a.label} aria-label={a.label} onClick={() => { void scrub(i); }}
              className="absolute -translate-x-1/2 -translate-y-full"
              style={{ left: `${a.x}%`, top: `${a.y}%`, width: `${a.size}%` }}>
              <motion.div className="relative w-full"
                animate={d === 0 ? { y: [0, -14, 0] } : { rotate: [0, -1.5, 1.5, 0] }}
                transition={d === 0 ? { duration: 0.6, repeat: 2 } : { duration: 2.6 + i * 0.4, repeat: Infinity }}
                whileTap={{ scale: 0.94 }}>
              <img src={a.img} alt={a.label} draggable={false} className={`w-full ${glow ? 'animate-pulse' : ''}`}
                style={{ filter: `${STICKER_FILTER} sepia(${d * 0.28}) saturate(${1 - d * 0.18}) brightness(${1 - d * 0.1})${glow ? ' drop-shadow(0 0 14px #fde047)' : ''}` }} />
              {MUD.slice(0, d).map(([l, t, s], k) => (
                <span key={k} className="pointer-events-none absolute rounded-[45%_55%_50%_40%] bg-[#6b4423]/85"
                  style={{ left: `${l}%`, top: `${t}%`, width: `${s}%`, aspectRatio: '1.3', boxShadow: 'inset -3px -3px 0 rgba(0,0,0,0.25)' }} />
              ))}
              {d === 0 && <span className="pointer-events-none absolute -top-2 right-0 text-[min(5vh,3.5vw)]">{'✨'}</span>}
              </motion.div>
            </button>
          );
        })}
        <Bursts items={bursts} />
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-16 z-30 flex flex-col items-center px-14">
        <span className="text-center font-black leading-tight text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.05rem, min(calc(3.2*var(--svw,1vw)), 5vh), 2.6rem)' }}>
          {done ? scene.doneLine : `\u{1F9FD} ${r?.line ?? ''}`}
        </span>
        {!done && r && dirt[r.target] < SCRUBS && dirt[r.target] > 0 && (
          <span className="mt-1 rounded-full bg-white/90 px-3 py-0.5 text-sm font-black text-sky-700 shadow">Scrub, scrub! {'\u{1FAE7}'.repeat(dirt[r.target])}</span>
        )}
      </div>
      {r && <button onClick={() => cueSpeak(r.line, scene.who)} aria-label="Hear it again" className="absolute left-3 top-16 z-30 rounded-full bg-white/90 px-4 py-2 text-lg font-black text-orange-700 shadow-lg active:scale-95">{'\u{1F50A}'}</button>}

      {done && (
        <motion.div className="absolute inset-x-0 top-[30%] z-50 flex justify-center" initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.2, type: 'spring' }}>
          <button onClick={onNext} className={`${CLAY_BUTTON} px-8 py-3 text-xl`}>Next {'⭐'}</button>
        </motion.div>
      )}
    </div>
  );
}

/** Every voiced line, for the clip baker (scripts/generate-voice-cache.mjs mirrors this). */
export function farmWashLines(scene: Wash) {
  return [
    [scene.who, WASH_INTRO],
    ...scene.rounds.map((r) => [scene.who, r.line]),
    ...scene.animals.flatMap((a) => [[scene.who, a.say], [scene.who, washOops(a.label)]]),
    [scene.who, scene.doneLine],
  ] as [string, string][];
}
