import { useEffect, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../../unit1/audio';
import * as sfx from '../../unit1/sfx';
import { Confetti } from '../../unit1/fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { voiceOf } from './shared';
import { CLAY_BUTTON, THICK_WORDS } from '../../unit1/scene-components/shared';

/* ---------- Hot Coconut (classic hot potato, modern design — docs/a1-activity-library.md §11) ----------
 * The friends sit in a circle with a star seat for the child. Tap "Pass!": a coconut hops from seat to seat to a drum
 * beat that slows down… and stops. Whoever holds it gets the question — on the child's seat "Your turn!", on a
 * friend's seat "Help Mia!" — and the child answers in a full sentence. No forfeits, nobody is out; a right answer
 * makes the coconut glow and the next round starts. Mechanics: Hot Potato / Pass It (eslactive.com, classroom ESL),
 * musical pass games. Better: the suspense is in the slowing beat, every stop is a real question, the child helps
 * the friends (and still answers every time). */

type Coco = Extract<Scene, { kind: 'hot-coconut' }>;

export function HotCoconutScene({ scene, onNext, onWin, onLose, sync }: { scene: Coco; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void; sync?: ActivitySync }) {
  const reduce = useReducedMotion();
  const seats = scene.seats.length ? scene.seats : [{ name: 'You', img: '' }];
  const n = seats.length;
  const total = scene.rounds.length;
  const [state, setState] = useSyncedState(sync, { round: 0, phase: 'ready', pos: 0, wrong: -1, done: false });
  const round = Math.max(0, Math.min(total - 1, Number(state.round) || 0));
  const r = scene.rounds[round];
  const pos = ((Number(state.pos) || 0) % n + n) % n;
  const done = !!state.done;
  const timers = useRef<number[]>([]);
  const gemDone = useRef(false);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);
  useEffect(() => {
    if (state.phase === 'ask' && r) {
      const who = pos === 0 ? 'Your turn!' : `Help ${seats[pos].name}!`;
      cueSpeak(`${who} ${r.ask}`, voiceOf(scene.who));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase, round]);
  useEffect(() => {
    if (done && !gemDone.current) { gemDone.current = true; sfx.gem(); onWin(true); cueSpeak(scene.doneLine, voiceOf(scene.who)); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const pass = () => {
    if (done || state.phase !== 'ready' || !r) return;
    const stop = ((Number(r.stop) || 0) % n + n) % n;
    const hops = n * 2 + ((stop - pos + n) % n); // two laps, then to the stop seat
    setState((s) => ({ ...s, phase: 'passing' }));
    let at = pos;
    let delay = 0;
    for (let h = 1; h <= hops; h++) {
      delay += 160 + Math.round((h / hops) ** 2 * 380); // the beat slows down
      timers.current.push(window.setTimeout(() => {
        at = (at + 1) % n;
        sfx.click();
        setState((s) => ({ ...s, pos: at, phase: h === hops ? 'ask' : 'passing' }));
      }, delay));
    }
  };

  const answer = (c: number) => {
    if (!r || state.phase !== 'ask') return;
    if (c !== r.answer) {
      sfx.wrong(); onLose();
      setState((s) => ({ ...s, wrong: c }));
      window.setTimeout(() => setState((s) => ({ ...s, wrong: -1 })), 600);
      return;
    }
    sfx.match(); sfx.whoop();
    cueSpeak(r.choices[c], 'teacher');
    setState((s) => ({ ...s, phase: 'right' }));
    window.setTimeout(() => setState((s) => {
      const next = (Number(s.round) || 0) + 1;
      return next >= total ? { ...s, done: true, phase: 'ready' } : { ...s, round: next, phase: 'ready', wrong: -1 };
    }), 1500);
  };

  // seats on an ellipse; seat 0 (the child) at the bottom
  const seatAt = (i: number) => {
    const t = Math.PI / 2 + (i / n) * Math.PI * 2;
    return { x: 50 + Math.cos(t) * 30, y: 52 + Math.sin(t) * 24 };
  };
  const c = seatAt(pos);
  return (
    <div className="absolute inset-0 select-none overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="absolute inset-0 bg-black/15" />
      {done && <Confetti count={70} />}
      <div className="pointer-events-none absolute inset-x-0 top-[5%] z-30 flex justify-center px-14">
        <span className="text-center font-black text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.1rem, min(calc(2.6*var(--svw,1vw)), 4.4vh), 2.1rem)' }}>
          {done ? scene.doneLine : `🥥 ${scene.title}`}
        </span>
      </div>
      {!done && <span className="absolute right-3 top-[13%] z-30 rounded-full bg-white/95 px-4 py-2 font-black text-amber-700 shadow-lg" style={{ fontSize: 'min(3vh, 2vw)' }}>{round + 1}/{total}</span>}
      {/* the circle rug */}
      <div className="absolute left-1/2 top-[52%] h-[58%] w-[66%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border-[0.8vh] border-amber-200/80 bg-gradient-to-b from-amber-300/70 to-orange-400/70 shadow-inner" />
      {seats.map((s, i) => {
        const p = seatAt(i);
        const holding = i === pos && state.phase !== 'ready';
        return (
          <div key={i} className="absolute z-20 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center" style={{ left: `${p.x}%`, top: `${p.y}%` }}>
            {i === 0 && !s.img
              ? <span className="grid aspect-square w-[min(13vh,9vw)] place-items-center rounded-full border-[0.6vh] border-white bg-gradient-to-b from-amber-300 to-orange-500 shadow-xl" style={{ fontSize: 'min(7vh, 4.6vw)' }}>⭐</span>
              : <img src={s.img} alt={s.name} draggable={false} className="h-[min(16vh,10.5vw)] object-contain drop-shadow-lg" />}
            <span className={`mt-[0.4vh] rounded-full px-3 py-[0.3vh] font-black shadow ${holding ? 'bg-yellow-300 text-amber-900' : 'bg-white/95 text-neutral-700'}`} style={{ fontSize: 'min(2.4vh, 1.6vw)' }}>{i === 0 ? 'You' : s.name}</span>
          </div>
        );
      })}
      {/* the coconut */}
      <motion.div className="pointer-events-none absolute z-30" style={{ fontSize: 'min(8vh, 5.2vw)' }}
        animate={{ left: `${c.x}%`, top: `${c.y - 9}%`, rotate: state.phase === 'passing' && !reduce ? [0, 180, 360] : 0, scale: state.phase === 'right' ? [1, 1.5, 1] : 1 }}
        transition={{ type: 'spring', stiffness: 420, damping: 22, rotate: { duration: 0.3 } }}>
        <span className="block -translate-x-1/2 -translate-y-1/2" style={{ filter: state.phase === 'right' ? 'drop-shadow(0 0 2vh #fde047)' : undefined }}>
          {scene.coconutImg ? <img src={scene.coconutImg} alt="coconut" className="h-[1.2em]" /> : '🥥'}
        </span>
      </motion.div>
      {/* pass button */}
      {!done && state.phase === 'ready' && (
        <motion.button type="button" onClick={pass} className={`${CLAY_BUTTON} absolute left-1/2 top-[50%] z-40 -translate-x-1/2 -translate-y-1/2 px-10 py-3`} style={{ fontSize: 'min(4.4vh, 3vw)' }}
          initial={reduce ? false : { scale: 0 }} animate={{ scale: 1 }}>🥁 Pass!</motion.button>
      )}
      {/* the question */}
      <AnimatePresence>
        {r && (state.phase === 'ask' || state.phase === 'right') && !done && (
          <motion.div key={round} className="absolute inset-x-[16%] top-[30%] z-40 rounded-[3vh] border-[0.6vh] border-white bg-white/95 p-[2vh] text-center shadow-2xl"
            initial={reduce ? false : { scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="font-black text-orange-600" style={{ fontSize: 'min(3vh, 2vw)' }}>{pos === 0 ? '⭐ Your turn!' : `🤝 Help ${seats[pos].name}!`}</div>
            <button type="button" onClick={() => cueSpeak(r.ask, voiceOf(scene.who))} className="my-[1.2vh] font-black text-[#3b2410]" style={{ fontSize: 'min(4.4vh, 3vw)' }}>{r.ask} <span className="text-[0.7em]">🔊</span></button>
            <div className="flex flex-wrap justify-center gap-[1.2vw]">
              {r.choices.map((ch, ci) => (
                <motion.button key={ci} type="button" onClick={() => answer(ci)} disabled={state.phase === 'right'} whileTap={{ scale: 0.93 }}
                  animate={state.wrong === ci ? { x: [0, -10, 10, -6, 0] } : {}}
                  className={`rounded-[2vh] border-[0.4vh] border-white px-[2vw] py-[1.1vh] font-black text-white shadow-[0_0.7vh_0_rgba(0,0,0,0.25)] ${state.phase === 'right' && ci === r.answer ? 'bg-gradient-to-b from-emerald-400 to-emerald-600' : 'bg-gradient-to-b from-amber-400 to-orange-600'}`}
                  style={{ fontSize: 'min(3.4vh, 2.3vw)' }}>{ch}</motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {done && <button type="button" onClick={onNext} className={`${CLAY_BUTTON} absolute bottom-[8%] left-1/2 z-40 -translate-x-1/2 px-10 py-3 text-xl`}>Next ⭐</button>}
    </div>
  );
}
