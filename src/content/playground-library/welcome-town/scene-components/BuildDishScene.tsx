import { useEffect, useMemo, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../../unit1/audio';
import * as sfx from '../../unit1/sfx';
import { Confetti } from '../../unit1/fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { voiceOf } from './shared';
import { CLAY_BUTTON, THICK_WORDS } from '../../unit1/scene-components/shared';

/* ---------- Build a Pizza (`build-dish`, docs/a1-unit-4-food.md §5.4) ----------
 * A recipe card shows one step at a time as a sentence to READ ("Put some cheese on the pizza."; 🔊 only as help). The
 * child taps the topping the step names; it flies onto the pizza and stays there, so the dish grows step by step. When
 * the recipe is finished, the eater (Pico) tastes it and says if he likes it. Mechanics: kids' cooking apps (build a
 * pizza / salad, Lingokids food & cooking). Better: every step is read, not dragged blindly; the toppings stay; the dish
 * goes to a character who answers in a full sentence. */

type Dish = Extract<Scene, { kind: 'build-dish' }>;

// where each added topping sits on the pizza (% of the pizza box)
const SPOTS = [[32, 32], [68, 32], [32, 68], [68, 68], [50, 50], [50, 20], [50, 80]];

export function BuildDishScene({ scene, onNext, onWin, onLose, sync }: { scene: Dish; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void; sync?: ActivitySync }) {
  const reduce = useReducedMotion();
  const [state, setState] = useSyncedState(sync, { s: 0, added: [-1], wrong: -1, tasted: false, done: false });
  const s = Math.max(0, Math.min(scene.steps.length - 1, Number(state.s) || 0));
  const step = scene.steps[s];
  const added = useMemo(() => (Array.isArray(state.added) ? state.added.filter((n) => n >= 0) : []), [state.added]);
  const tasted = !!state.tasted;
  const done = !!state.done;
  const gemDone = useRef(false);

  useEffect(() => {
    const t = window.setTimeout(() => cueSpeak('Read the recipe. Then add it!', voiceOf(scene.who)), 700);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (done && !gemDone.current) { gemDone.current = true; sfx.gem(); onWin(true); cueSpeak(scene.doneLine, voiceOf(scene.who)); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const tap = (i: number) => {
    if (tasted || done || !step) return;
    if (i !== step.topping) {
      sfx.wrong(); onLose();
      cueSpeak('Read it again!', voiceOf(scene.who));
      setState((x) => ({ ...x, wrong: i }));
      window.setTimeout(() => setState((x) => ({ ...x, wrong: -1 })), 600);
      return;
    }
    sfx.pop(); window.setTimeout(() => sfx.match(), 200);
    cueSpeak(step.text, 'teacher');
    const list = [...added, i];
    const last = s + 1 >= scene.steps.length;
    setState((x) => ({ ...x, added: list, s: last ? x.s : (Number(x.s) || 0) + 1, tasted: last }));
    if (last) {
      window.setTimeout(() => { sfx.whoop(); cueSpeak(scene.eater.line, voiceOf(scene.eater.who)); }, 1500);
      window.setTimeout(() => setState((x) => ({ ...x, done: true })), 4200);
    }
  };

  return (
    <div className="absolute inset-0 select-none overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="absolute inset-0 bg-amber-950/15" />
      {done && <Confetti count={90} />}
      <div className="pointer-events-none absolute inset-x-0 top-[4%] z-30 flex justify-center px-14">
        <span className="text-center font-black text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.1rem, min(calc(2.6*var(--svw,1vw)), 4.4vh), 2.1rem)' }}>
          {done ? scene.doneLine : `🍕 ${scene.title}`}
        </span>
      </div>
      {/* the recipe card */}
      {!done && (
        <div className="absolute left-[4%] top-[18%] z-30 w-[30%] rounded-[2vh] border-[0.6vh] border-amber-700 bg-amber-50 p-[1.6vh] shadow-2xl">
          <p className="mb-[1vh] font-black text-amber-700" style={{ fontSize: 'min(2.2vh, 1.5vw)' }}>📜 Recipe · step {Math.min(added.length + 1, scene.steps.length)}/{scene.steps.length}</p>
          <ol className="space-y-[0.8vh]">
            {scene.steps.map((st, i) => (
              <li key={i} className={`rounded-[1.2vh] px-[0.8vw] py-[0.6vh] font-black ${i < added.length ? 'text-emerald-600 line-through decoration-2' : i === added.length ? 'bg-yellow-200 text-amber-900' : 'text-amber-900/40'}`}
                style={{ fontSize: 'min(2.8vh, 1.9vw)' }}>
                {i < added.length ? '✓ ' : ''}{st.text}
              </li>
            ))}
          </ol>
          {!tasted && step && <button type="button" onClick={() => { sfx.click(); cueSpeak(step.text, 'teacher'); }} className="mt-[1vh] rounded-full bg-white px-4 py-1 font-black text-amber-800 shadow" style={{ fontSize: 'min(2.2vh, 1.5vw)' }}>🔊 Help me read</button>}
        </div>
      )}
      {/* the pizza */}
      <div className="absolute left-[38%] top-[20%] z-20 aspect-square h-[48vh]">
        <div className="absolute inset-0 rounded-full border-[1.4vh] border-amber-600 bg-amber-300 shadow-2xl" />
        <div className="absolute inset-[9%] rounded-full bg-red-500/90" />
        <AnimatePresence>
          {added.map((t, k) => {
            const [x, y] = SPOTS[k % SPOTS.length];
            return (
              // wrapper holds the centring translate; framer animates only the inner picture (its y would override it)
              <div key={`${t}-${k}`} className="absolute h-[28%] w-[28%] -translate-x-1/2 -translate-y-1/2" style={{ left: `${x}%`, top: `${y}%` }}>
                <motion.img src={scene.toppings[t]?.img} alt="" draggable={false} className="h-full w-full object-contain drop-shadow-lg"
                  initial={reduce ? false : { y: -200, scale: 0.3, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 220, damping: 14 }} />
              </div>
            );
          })}
        </AnimatePresence>
      </div>
      {/* the eater */}
      <motion.div className="absolute bottom-[6%] right-[4%] z-20 flex flex-col items-center" animate={tasted && !reduce ? { y: [0, -20, 0, -12, 0] } : {}} transition={{ duration: 1.2 }}>
        {tasted && <span className="mb-[1vh] rounded-[2vh] bg-white/95 px-[1vw] py-[0.8vh] font-black text-amber-900 shadow-xl" style={{ fontSize: 'min(2.8vh, 1.9vw)' }}>{scene.eater.line}</span>}
        <img src={scene.eater.img} alt="" draggable={false} className="h-[min(26vh,17vw)] w-auto object-contain drop-shadow-2xl" />
      </motion.div>
      {/* the toppings */}
      {!done && !tasted && (
        <div className="absolute bottom-[4%] left-[4%] z-30 flex w-[62%] justify-start gap-[1vw]">
          {scene.toppings.map((tp, i) => (
            <motion.button key={tp.label} type="button" onClick={() => tap(i)} whileTap={{ scale: 0.9 }} aria-label={tp.label}
              animate={state.wrong === i ? { x: [0, -8, 8, -5, 0] } : {}}
              className="flex w-[18%] flex-col items-center rounded-[1.8vh] border-[0.5vh] border-white bg-white/95 p-[0.6vh] shadow-xl">
              <img src={tp.img} alt="" draggable={false} className="h-[min(11vh,7.5vw)] w-full object-contain" />
              <span className="font-black text-amber-900" style={{ fontSize: 'min(2.2vh, 1.5vw)' }}>{tp.label}</span>
            </motion.button>
          ))}
        </div>
      )}
      {done && <button type="button" onClick={onNext} className={`${CLAY_BUTTON} absolute bottom-[8%] left-1/2 z-40 -translate-x-1/2 px-10 py-3 text-xl`}>Next ⭐</button>}
    </div>
  );
}
