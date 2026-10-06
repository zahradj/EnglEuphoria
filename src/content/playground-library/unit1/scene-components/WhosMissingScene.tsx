import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { Confetti } from '../fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { CLAY_BUTTON, CropPic, THICK_WORDS, sayWithin } from './shared';
import { Bursts, useBursts, useShake } from './gameFx';

/* ---------- Who's Missing? (Pre-A1 Unit 5 Lesson 3) ----------
 * Grandma's photo wall: a framed photo of each family member. The child looks
 * ("Look at the photos!"), then taps the lamp — lights off! When the lights
 * come back, one frame is empty: "Who is missing?" The child taps the right
 * face and it flies back into its frame ("Grandpa! Here is Grandpa!").
 * Researched: the classroom memory game "What's missing?" / Kim's game
 * (teach-this.com, games4esl), Khan Academy Kids' self-paced memory play and
 * Cambridge Pre A1 "listen and point". Better: the child sets the pace (the
 * lights go off only when they tap the lamp), the answer is a family word they
 * say back, and a wrong face is named back ("No, Grandma is here!"). The
 * empty frame glows after two tries. No clock. */

type Missing = Extract<Scene, { kind: 'whos-missing' }>;
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
export const MISSING_LOOK = 'Look at the photos!';
export const MISSING_DARK = 'Lights off!';
export const MISSING_ASK = 'Who is missing?';
export const missingWrongLine = (name: string) => `No, ${name} is here! Look again!`;
export const missingRightLine = (name: string) => `${cap(name)}! Here is ${name}!`;

export function WhosMissingScene({ scene, onWin, onNext, sync }: { scene: Missing; onWin: (gem: boolean) => void; onNext: () => void; sync?: ActivitySync }) {
  /** phase: look → dark → ask → found (then the next round). */
  const [state, setState] = useSyncedState(sync, { round: 0, phase: 'look', gemDone: false });
  const { round, phase, gemDone } = state;
  const total = scene.rounds.length;
  const r = round < total ? scene.rounds[round] : undefined;
  const done = round >= total;
  const shown = useMemo(() => (r ? r.wall : []), [r]);
  const busy = useRef(false);
  const [misses, setMisses] = useState(0);
  const [wrong, setWrong] = useState(-1);
  const [bursts, fire] = useBursts();
  const [shakeCtl, shake] = useShake();

  useEffect(() => {
    busy.current = false;
    setMisses(0);
    if (!r) return;
    const t = window.setTimeout(() => cueSpeak(MISSING_LOOK, scene.who), 700);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, scene.id]);

  const lightsOff = async () => {
    if (!r || phase !== 'look' || busy.current) return;
    busy.current = true;
    sfx.pop();
    setState((s) => ({ ...s, phase: 'dark' }));
    await sayWithin(MISSING_DARK, scene.who, 1600);
    await new Promise((res) => window.setTimeout(res, 600));
    setState((s) => ({ ...s, phase: 'ask' }));
    await sayWithin(MISSING_ASK, scene.who, 1800);
    busy.current = false;
  };

  const pick = async (i: number) => {
    const f = scene.faces[i];
    if (!r || !f || phase !== 'ask' || busy.current) return;
    busy.current = true;
    if (i !== r.missing) {
      sfx.wrong(); shake(); setWrong(i);
      setMisses((m) => m + 1);
      await sayWithin(missingWrongLine(f.name), scene.who, 2600);
      setWrong(-1);
      busy.current = false;
      return;
    }
    sfx.match(); fire(50, 35, 'stars');
    setState((s) => ({ ...s, phase: 'found' }));
    await sayWithin(missingRightLine(f.name), scene.who, 3200);
    await new Promise((res) => window.setTimeout(res, 700));
    const next = round + 1;
    if (next >= total && !gemDone) { fire(50, 40, 'confetti'); sfx.gem(); onWin(true); }
    setState((s) => ({ ...s, round: next, phase: 'look', gemDone: s.gemDone || next >= total }));
    if (next >= total) void sayWithin(scene.doneLine, scene.who, 4000);
  };

  const prompt = !r ? scene.doneLine : phase === 'look' ? MISSING_LOOK : phase === 'dark' ? MISSING_DARK : phase === 'ask' ? MISSING_ASK : missingRightLine(scene.faces[r.missing].name);
  const choices = r ? r.options : [];

  return (
    <motion.div className="absolute inset-0 select-none overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }} animate={shakeCtl}>
      {done && <Confetti count={60} />}
      <div className="pointer-events-none absolute inset-x-0 top-16 z-40 flex flex-col items-center gap-1 px-14">
        <span className="text-center font-black leading-tight text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.4rem, calc(3.6*var(--svw,1vw)), 3rem)' }}>{prompt}</span>
        <div className="flex gap-1">
          {scene.rounds.map((_, i) => <span key={i} className={`text-xl transition ${i < round ? '' : 'opacity-30 grayscale'}`}>🖼️</span>)}
        </div>
      </div>
      {r && <button onClick={() => cueSpeak(prompt, scene.who)} aria-label="Hear it again" className="absolute right-3 top-16 z-40 rounded-full bg-white/90 px-4 py-2 text-lg font-black text-orange-700 shadow-lg active:scale-95">🔊</button>}

      {/* The photo wall. */}
      {r && (
        <div key={round} className="absolute inset-x-[4%] top-[29%] z-10 flex justify-center gap-[2.5vw] [@media(max-height:500px)]:top-[28%]">
          {shown.map((fi, k) => {
            const f = scene.faces[fi];
            const gone = fi === r.missing && (phase === 'ask' || phase === 'dark');
            const empty = fi === r.missing && phase === 'ask';
            return (
              <motion.div key={fi} className="relative rounded-md bg-amber-800 p-[1.2vh] shadow-[0_10px_22px_rgba(0,0,0,0.35)]"
                style={{ rotate: (k % 2 ? 3 : -3) }} initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: k * 0.12 }}>
                <div className="relative h-[min(26vh,17vw)] w-[min(26vh,17vw)] overflow-hidden rounded-sm bg-amber-50 [@media(max-height:500px)]:h-[min(24vh,15vw)] [@media(max-height:500px)]:w-[min(24vh,15vw)]">
                  <AnimatePresence>
                    {!gone && (
                      <motion.div key="pic" className="absolute inset-0" initial={phase === 'found' ? { scale: 0.2, y: 200 } : { opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ opacity: 0 }} transition={{ type: 'spring', stiffness: 160, damping: 15 }}>
                        <CropPic img={f.img} at={f.at} w={f.w} aspect={f.aspect} alt={f.label} className="!rounded-none h-full w-full" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {empty && (
                    <span className={`absolute inset-0 grid place-items-center font-black text-amber-800/60 ${misses >= 2 ? 'animate-pulse bg-yellow-200' : ''}`} style={{ fontSize: 'clamp(2rem, 6vw, 4rem)' }}>?</span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Lights off. */}
      <AnimatePresence>
        {phase === 'dark' && <motion.div className="pointer-events-none absolute inset-0 z-30 bg-slate-950" initial={{ opacity: 0 }} animate={{ opacity: 0.93 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} />}
      </AnimatePresence>

      {/* The child's lamp: they turn the lights off when they are ready. */}
      {r && phase === 'look' && (
        <motion.div className="absolute inset-x-0 bottom-[11%] z-20 flex justify-center" initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1, type: 'spring' }}>
          <button onClick={() => { void lightsOff(); }} className={`${CLAY_BUTTON} px-8 py-3 text-2xl`}>💡 {MISSING_DARK}</button>
        </motion.div>
      )}

      {/* Who is missing? The faces to choose from. */}
      {r && phase === 'ask' && (
        <div className="absolute inset-x-0 bottom-[11%] z-20 flex items-end justify-center gap-[3vw] px-4 [@media(max-height:500px)]:bottom-[12%]">
          {choices.map((fi, k) => {
            const f = scene.faces[fi];
            return (
              <motion.button key={fi} onClick={() => { void pick(fi); }} aria-label={f.label} className="relative"
                initial={{ y: 80, opacity: 0 }}
                animate={wrong === fi ? { x: [0, -10, 10, -6, 6, 0], y: 0, opacity: 1 } : { y: [0, -5, 0], opacity: 1 }}
                transition={wrong === fi ? { duration: 0.4 } : { y: { duration: 2 + k * 0.3, repeat: Infinity, ease: 'easeInOut' }, opacity: { duration: 0.3 } }}
                whileTap={{ scale: 0.9 }}>
                <CropPic img={f.img} at={f.at} w={f.w} aspect={f.aspect} alt={f.label} className="relative h-[min(17vh,14vw)] w-[min(17vh,14vw)] border-[5px] border-white shadow-[0_8px_18px_rgba(0,0,0,0.3)]" />
              </motion.button>
            );
          })}
        </div>
      )}

      <Bursts items={bursts} />
      {done && (
        <motion.div className="absolute inset-x-0 bottom-[8%] z-40 flex justify-center" initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.2, type: 'spring' }}>
          <button onClick={onNext} className={`${CLAY_BUTTON} px-10 py-3 text-xl`}>Next ⭐</button>
        </motion.div>
      )}
    </motion.div>
  );
}

/** Every voiced line, for the clip baker (scripts/generate-voice-cache.mjs mirrors this). */
export function whosMissingLines(scene: Missing) {
  return [
    [scene.who, MISSING_LOOK], [scene.who, MISSING_DARK], [scene.who, MISSING_ASK],
    ...scene.faces.flatMap((f) => [[scene.who, missingWrongLine(f.name)], [scene.who, missingRightLine(f.name)]]),
    [scene.who, scene.doneLine],
  ] as [string, string][];
}
