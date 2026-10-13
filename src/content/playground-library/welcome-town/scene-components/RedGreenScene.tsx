import { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../../unit1/audio';
import * as sfx from '../../unit1/sfx';
import { Confetti } from '../../unit1/fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { voiceOf } from './shared';
import { CLAY_BUTTON, THICK_WORDS } from '../../unit1/scene-components/shared';

/* ---------- Red Light, Green Light (a listening race — docs/a1-activity-library.md §11) ----------
 * A runner waits at the start of a track; a big traffic light hangs above it. On GREEN the friend calls an order
 * ("Green light! Jump!" / "Three steps!") and the child taps the matching card — the runner moves on. On RED ("Red
 * light! Stop!") the child must freeze: a tap only makes the runner wobble ("Oops! Red light!"); after a moment the
 * light turns green again. The race ends at the flag. Mechanics: Red Light Green Light, Simon Says, TPR listening
 * games. Better: every move is chosen by understanding a word, freezing is part of listening, nobody goes back. */

type RedGreen = Extract<Scene, { kind: 'red-green' }>;

export function RedGreenScene({ scene, onNext, onWin, onLose, sync }: { scene: RedGreen; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void; sync?: ActivitySync }) {
  const reduce = useReducedMotion();
  const total = scene.rounds.length;
  const [state, setState] = useSyncedState(sync, { round: 0, steps: 0, oops: 0, wrong: -1, done: false });
  const round = Math.max(0, Math.min(total - 1, Number(state.round) || 0));
  const r = scene.rounds[round];
  const isRed = r?.light === 'red';
  const goal = Math.max(1, scene.rounds.reduce((a, x) => a + (x.light === 'green' ? Math.max(1, x.steps ?? 1) : 0), 0));
  const steps = Math.max(0, Math.min(goal, Number(state.steps) || 0));
  const done = !!state.done;
  const gemDone = useRef(false);
  const busy = useRef(false);

  const advance = () => setState((s) => {
    const n = (Number(s.round) || 0) + 1;
    return n >= total ? { ...s, done: true } : { ...s, round: n, wrong: -1 };
  });
  useEffect(() => {
    busy.current = false;
    if (done || !r) return undefined;
    const t = window.setTimeout(() => cueSpeak(r.say, voiceOf(scene.who)), round === 0 ? 900 : 500);
    // red light: hold still, then the next order comes by itself
    const go = isRed ? window.setTimeout(advance, 3200) : undefined;
    return () => { window.clearTimeout(t); if (go) window.clearTimeout(go); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, done]);
  useEffect(() => {
    if (done && !gemDone.current) { gemDone.current = true; sfx.gem(); onWin(true); cueSpeak(scene.doneLine, voiceOf(scene.who)); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const tap = (i: number) => {
    if (!r || done || busy.current) return;
    if (isRed) {
      sfx.wrong(); onLose();
      cueSpeak('Oops! Red light! Freeze!', voiceOf(scene.who));
      setState((s) => ({ ...s, oops: (Number(s.oops) || 0) + 1 }));
      return;
    }
    if (i !== r.answer) {
      sfx.wrong(); onLose();
      setState((s) => ({ ...s, wrong: i }));
      window.setTimeout(() => setState((s) => ({ ...s, wrong: -1 })), 600);
      return;
    }
    busy.current = true;
    sfx.match();
    const add = Math.max(1, r.steps ?? 1);
    for (let k = 0; k < add; k++) window.setTimeout(() => sfx.pop(), k * 220);
    setState((s) => ({ ...s, steps: (Number(s.steps) || 0) + add, wrong: -1 }));
    window.setTimeout(advance, 400 + add * 250);
  };

  const pos = 8 + (steps / goal) * 78; // % along the track
  return (
    <div className="absolute inset-0 select-none overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <motion.div className="absolute inset-0" animate={{ backgroundColor: done ? 'rgba(0,0,0,0.1)' : isRed ? 'rgba(127,29,29,0.28)' : 'rgba(20,83,45,0.12)' }} transition={{ duration: 0.4 }} />
      {done && <Confetti count={90} />}
      <div className="pointer-events-none absolute inset-x-0 top-[5%] z-30 flex justify-center px-14">
        <span className="text-center font-black text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.1rem, min(calc(2.6*var(--svw,1vw)), 4.4vh), 2.1rem)' }}>
          {done ? scene.doneLine : `🚦 ${scene.title}`}
        </span>
      </div>
      {/* the traffic light */}
      <div className="absolute left-[4%] top-[13%] z-20 flex flex-col items-center gap-[1vh] rounded-[2.4vh] border-[0.6vh] border-slate-700 bg-slate-800 p-[1.2vh] shadow-2xl">
        {(['red', 'green'] as const).map((c) => {
          const on = !done && (c === 'red' ? isRed : !isRed);
          return (
            <motion.span key={c} className="block h-[min(9vh,6vw)] w-[min(9vh,6vw)] rounded-full border-[0.4vh] border-slate-900"
              style={{ background: on ? (c === 'red' ? '#ef4444' : '#22c55e') : '#334155', boxShadow: on ? `0 0 4vh ${c === 'red' ? '#ef4444' : '#22c55e'}` : 'none' }}
              animate={on && !reduce ? { scale: [1, 1.08, 1] } : { scale: 1 }} transition={{ duration: 0.8, repeat: on ? Infinity : 0 }} />
          );
        })}
      </div>
      {/* the order */}
      {!done && r && (
        <button type="button" onClick={() => { sfx.click(); cueSpeak(r.say, voiceOf(scene.who)); }}
          className={`absolute left-1/2 top-[16%] z-30 -translate-x-1/2 rounded-[2.4vh] border-[0.6vh] border-white px-6 py-2 font-black text-white shadow-2xl ${isRed ? 'bg-red-500' : 'bg-green-500'}`}
          style={{ fontSize: 'min(4.6vh, 3vw)' }}>
          🔊 {r.say}
        </button>
      )}
      {/* the track */}
      <div className="absolute inset-x-[4%] top-[44%] z-10 h-[16%] rounded-full border-[0.6vh] border-white/80 bg-gradient-to-b from-orange-300 to-orange-500 shadow-xl">
        {Array.from({ length: goal + 1 }, (_, i) => (
          <span key={i} className="absolute top-1/2 h-[30%] w-[0.5vh] -translate-y-1/2 rounded bg-white/70" style={{ left: `${8 + (i / goal) * 78}%` }} />
        ))}
        <span className="absolute right-[4%] top-1/2 -translate-y-1/2 text-[min(8vh,5.4vw)]">🏁</span>
      </div>
      <motion.div className="absolute top-[30%] z-20" style={{ width: 'min(17vh,11vw)', marginLeft: 'calc(min(17vh,11vw) / -2)', left: '4%' }}
        animate={{ left: `${4 + pos * 0.92}%` }} transition={{ type: 'spring', stiffness: 90, damping: 14 }}>
        <motion.img key={Number(state.oops) || 0} src={scene.runner} alt="" draggable={false} className="w-full object-contain drop-shadow-xl"
          animate={Number(state.oops) > 0 && isRed && !reduce ? { rotate: [0, -12, 12, -8, 0] } : !isRed && !done && !reduce ? { y: [0, -6, 0] } : {}}
          transition={{ duration: isRed ? 0.5 : 1.2, repeat: !isRed && !done ? Infinity : 0 }} />
      </motion.div>
      {/* the cards */}
      {!done && (
        <div className="absolute inset-x-[6%] bottom-[5%] z-30 flex justify-center gap-[1.4vw]">
          {scene.cards.map((c, i) => (
            <motion.button key={i} type="button" onClick={() => tap(i)} whileTap={{ scale: 0.92 }}
              animate={state.wrong === i ? { x: [0, -10, 10, -6, 0] } : {}}
              className={`flex h-[min(22vh,15vw)] w-[min(20vh,13.5vw)] flex-col items-center justify-center rounded-[2.4vh] border-[0.6vh] bg-white shadow-[0_0.8vh_0_rgba(0,0,0,0.2)] ${isRed ? 'border-red-300 opacity-80' : 'border-green-300'}`}>
              {c.img ? <img src={c.img} alt="" draggable={false} className="h-[66%] w-[80%] object-contain" /> : null}
              <span className="font-black text-[#3b2410]" style={{ fontSize: c.img ? 'min(3vh, 2vw)' : 'min(6vh, 4vw)' }}>{c.label}</span>
            </motion.button>
          ))}
        </div>
      )}
      {done && <button type="button" onClick={onNext} className={`${CLAY_BUTTON} absolute bottom-[8%] left-1/2 z-40 -translate-x-1/2 px-10 py-3 text-xl`}>Next ⭐</button>}
    </div>
  );
}
