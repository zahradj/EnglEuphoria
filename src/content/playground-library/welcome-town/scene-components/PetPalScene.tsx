import { useEffect, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../../unit1/audio';
import * as sfx from '../../unit1/sfx';
import { Confetti } from '../../unit1/fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { voiceOf } from './shared';
import { CLAY_BUTTON, THICK_WORDS } from '../../unit1/scene-components/shared';

/* ---------- Pet Pal (collectible pet that grows across the units — docs/a1-activity-library.md §9 / §12) ----------
 * A short routine at the end of every lesson. Biscuit the puppy says what he wants, in this lesson's English ("I am
 * hungry! I want an apple!"). The child listens and taps the right thing; it flies onto Biscuit's shelf, Biscuit
 * jumps for joy and grows a little. The shelf keeps everything from the earlier lessons (`earlier`, written in the
 * lesson data, so it is the same on every device and in every class), so the pet visibly grows across the units.
 * Mechanics: Lingokids / Khan Academy Kids collectible companions, Tamagotchi-style care. Better: the pet only
 * "eats" English — every gift is a listening task with this lesson's words — and nothing is ever lost. */

type PetPal = Extract<Scene, { kind: 'pet-pal' }>;

export function PetPalScene({ scene, onNext, onWin, onLose, sync }: { scene: PetPal; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void; sync?: ActivitySync }) {
  const reduce = useReducedMotion();
  const total = scene.rounds.length;
  const [state, setState] = useSyncedState(sync, { round: 0, got: [-1], wrong: -1, done: false });
  const got = Array.isArray(state.got) ? state.got.filter((n) => n >= 0) : [];
  const round = Math.max(0, Math.min(total - 1, got.length));
  const r = got.length < total ? scene.rounds[round] : undefined;
  const done = !!state.done;
  const gemDone = useRef(false);
  const shelf = [...scene.earlier, ...got.map((g, i) => scene.rounds[i]?.choices[g]).filter(Boolean) as { label: string; img: string }[]];
  const size = Math.min(1.35, 0.8 + shelf.length * 0.04); // Biscuit grows a little with every gift

  useEffect(() => {
    if (done || !r) return undefined;
    const t = window.setTimeout(() => cueSpeak(r.line, voiceOf(scene.who)), round === 0 ? 900 : 1600);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, done]);
  useEffect(() => {
    if (done && !gemDone.current) { gemDone.current = true; sfx.gem(); onWin(true); cueSpeak(scene.doneLine, voiceOf(scene.who)); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const give = (i: number) => {
    if (!r || done) return;
    if (i !== r.answer) {
      sfx.wrong(); onLose();
      cueSpeak('No, thank you! Listen again!', voiceOf(scene.who));
      setState((s) => ({ ...s, wrong: i }));
      window.setTimeout(() => setState((s) => ({ ...s, wrong: -1 })), 600);
      return;
    }
    sfx.match(); sfx.whoop(); window.setTimeout(() => sfx.gem(), 300);
    cueSpeak(r.say, 'teacher');
    setState((s) => {
      const list = [...(Array.isArray(s.got) ? s.got.filter((n) => n >= 0) : []), i];
      return { ...s, got: list, wrong: -1 };
    });
  };

  const allGot = got.length >= total;
  return (
    <div className="absolute inset-0 select-none overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="absolute inset-0 bg-gradient-to-b from-amber-100/10 to-amber-900/25" />
      {done && <Confetti count={70} />}
      <div className="pointer-events-none absolute inset-x-0 top-[5%] z-30 flex justify-center px-14">
        <span className="text-center font-black text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.1rem, min(calc(2.6*var(--svw,1vw)), 4.4vh), 2.1rem)' }}>
          {done ? scene.doneLine : `🐾 ${scene.title}`}
        </span>
      </div>
      <span className="absolute right-3 top-[13%] z-30 rounded-full bg-white/95 px-4 py-2 font-black text-amber-700 shadow-lg" style={{ fontSize: 'min(3vh, 2vw)' }}>🎁 {shelf.length}</span>
      {/* the pet on its cushion */}
      <div className="absolute bottom-[30%] left-[8%] z-20 flex w-[34%] flex-col items-center">
        {r && !done && (
          <motion.button key={`b-${round}`} type="button" onClick={() => { sfx.click(); cueSpeak(r.line, voiceOf(scene.who)); }}
            className="relative mb-[1vh] max-w-full rounded-[2.4vh] border-[0.5vh] border-amber-300 bg-white px-4 py-2 text-center font-black text-amber-900 shadow-xl"
            style={{ fontSize: 'min(3.2vh, 2.2vw)' }} initial={reduce ? false : { scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            🔊 {r.line}
            <span className="absolute -bottom-[1.4vh] left-1/2 h-[2.4vh] w-[2.4vh] -translate-x-1/2 rotate-45 border-b-[0.5vh] border-r-[0.5vh] border-amber-300 bg-white" />
          </motion.button>
        )}
        <motion.img src={scene.pet.img} alt={scene.pet.name} draggable={false} className="h-[min(30vh,20vw)] w-auto object-contain drop-shadow-2xl"
          animate={{ scale: size, y: !reduce && (allGot || got.length) ? [0, -24, 0] : 0 }}
          transition={{ scale: { type: 'spring', stiffness: 120, damping: 12 }, y: { duration: 0.5, repeat: allGot ? 2 : 1 } }} key={`pet-${got.length}`} />
        <div className="-mt-[2vh] h-[5vh] w-[70%] rounded-[50%] bg-gradient-to-b from-rose-300 to-rose-500 shadow-lg" />
        <span className="mt-[0.6vh] rounded-full bg-white/95 px-4 py-1 font-black text-rose-600 shadow" style={{ fontSize: 'min(2.8vh, 1.9vw)' }}>{scene.pet.name}</span>
      </div>
      {/* the choices */}
      {r && !done && (
        <div className="absolute right-[4%] top-[24%] z-30 flex w-[50%] justify-center gap-[1.4vw]">
          {r.choices.map((c, i) => (
            <motion.button key={`${round}-${i}`} type="button" onClick={() => give(i)} whileTap={{ scale: 0.92 }} aria-label={c.label}
              animate={state.wrong === i ? { x: [0, -10, 10, -6, 0] } : reduce ? {} : { y: [0, -6, 0] }}
              transition={state.wrong === i ? { duration: 0.4 } : { duration: 2, repeat: Infinity, delay: i * 0.3 }}
              className="flex h-[min(24vh,16vw)] w-[min(20vh,13.5vw)] flex-col items-center justify-center rounded-[2.4vh] border-[0.6vh] border-white bg-white/95 shadow-[0_0.8vh_0_rgba(0,0,0,0.2)]">
              <img src={c.img} alt="" draggable={false} className="h-[70%] w-[80%] object-contain" />
              <span className="font-black text-[#3b2410]" style={{ fontSize: 'min(2.8vh, 1.9vw)' }}>{c.label}</span>
            </motion.button>
          ))}
        </div>
      )}
      {/* the shelf: everything Biscuit has got so far */}
      <div className="absolute bottom-[4%] left-[4%] right-[4%] z-20 flex h-[18%] items-end justify-center gap-[0.8vw] rounded-[2vh] border-b-[1vh] border-amber-900 bg-gradient-to-b from-amber-200/80 to-amber-400/90 px-[1vw] pb-[0.6vh] shadow-xl">
        <AnimatePresence>
          {shelf.map((it, i) => (
            <motion.img key={`${i}-${it.label}`} src={it.img} alt={it.label} title={it.label} draggable={false} className="h-[80%] w-auto max-w-[9%] object-contain drop-shadow"
              initial={reduce || i < shelf.length - 1 || i < scene.earlier.length ? false : { y: -300, scale: 1.6, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 160, damping: 13 }} />
          ))}
        </AnimatePresence>
      </div>
      {allGot && !done && (
        <div className="absolute right-[4%] top-[30%] z-30 flex w-[50%] flex-col items-center gap-[1.2vh]">
          <span className="rounded-[2vh] bg-white/95 px-5 py-2 text-center font-black text-amber-800 shadow-xl" style={{ fontSize: 'min(3.6vh, 2.4vw)' }}>🎉 {scene.rounds[total - 1]?.say}</span>
          <button type="button" onClick={() => { sfx.click(); setState((s) => ({ ...s, done: true })); }} className={`${CLAY_BUTTON} px-8 py-2`} style={{ fontSize: 'min(3.2vh, 2.2vw)' }}>Bye, {scene.pet.name}! 👋</button>
        </div>
      )}
      {done && <button type="button" onClick={onNext} className={`${CLAY_BUTTON} absolute bottom-[26%] left-1/2 z-40 -translate-x-1/2 px-10 py-3 text-xl`}>Next ⭐</button>}
    </div>
  );
}
