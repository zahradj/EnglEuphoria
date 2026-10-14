import { useEffect, useMemo, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../../unit1/audio';
import * as sfx from '../../unit1/sfx';
import { Confetti } from '../../unit1/fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { voiceOf } from './shared';
import { type Dir, cellAfter, isBlocked } from './rocketMazeRules';
import { CLAY_BUTTON, THICK_WORDS } from '../../unit1/scene-components/shared';

/* ---------- Rocket Maze ★ (directions game — docs/a1-unit-3-space.md §5.2) ----------
 * A star map is a grid; a rocket sits on one square, a target (the moon, a planet) on another, a few rocks in between.
 * LISTEN missions: the friend gives the route one step at a time ("Go up!") and the child taps that direction — the
 * rocket flies one square. STEER missions: the child is mission control — they press the arrows and SAY each order
 * ("Go left!"), the rocket follows, rocks bump it back gently, the target is reached. Mechanics: coding-for-kids grids
 * (Bee-Bots, Science North programmer ↔ robot, Coding Ireland "Robot Statues"). Better: the command is heard, not read;
 * then the roles swap and the child gives the commands in English; no lives, a bump is just "Oops! A rock!". */

type Maze = Extract<Scene, { kind: 'rocket-maze' }>;
const ARROW: Record<Dir, string> = { up: '⬆️', down: '⬇️', left: '⬅️', right: '➡️' };
const SAY: Record<Dir, string> = { up: 'Go up!', down: 'Go down!', left: 'Go left!', right: 'Go right!' };

export function RocketMazeScene({ scene, onNext, onWin, onLose, sync }: { scene: Maze; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void; sync?: ActivitySync }) {
  const reduce = useReducedMotion();
  const total = scene.missions.length;
  const [state, setState] = useSyncedState(sync, { m: 0, pos: [-1, -1], step: 0, won: false, bump: 0, wrong: '', done: false });
  const mi = Math.max(0, Math.min(total - 1, Number(state.m) || 0));
  const mission = scene.missions[mi];
  const pos = useMemo<[number, number]>(() => {
    const p = Array.isArray(state.pos) ? state.pos : [-1, -1];
    return p[0] >= 0 && mission ? [Number(p[0]), Number(p[1])] : mission ? mission.start : [0, 0];
  }, [state.pos, mission]);
  const step = Number(state.step) || 0;
  const won = !!state.won;
  const done = !!state.done;
  const gemDone = useRef(false);
  const listen = mission?.mode === 'listen';
  const nextDir: Dir | undefined = listen ? mission.route?.[step] : undefined;
  const rocks = useMemo(() => new Set((mission?.rocks ?? []).map(([c, r]) => `${c},${r}`)), [mission]);

  useEffect(() => {
    if (done || !mission || won) return undefined;
    const t = window.setTimeout(() => {
      if (listen && nextDir) cueSpeak(step === 0 ? `${mission.intro} ${SAY[nextDir]}` : SAY[nextDir], voiceOf(scene.who));
      else if (!listen && step === 0) cueSpeak(mission.intro, voiceOf(scene.who));
    }, step === 0 ? 700 : 450);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mi, step, done, won]);
  useEffect(() => {
    if (done && !gemDone.current) { gemDone.current = true; sfx.gem(); onWin(true); cueSpeak(scene.doneLine, voiceOf(scene.who)); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const press = (d: Dir) => {
    if (!mission || won || done) return;
    if (listen && d !== nextDir) {
      sfx.wrong(); onLose();
      cueSpeak(`Listen! ${nextDir ? SAY[nextDir] : ''}`, voiceOf(scene.who));
      setState((s) => ({ ...s, wrong: d }));
      window.setTimeout(() => setState((s) => ({ ...s, wrong: '' })), 600);
      return;
    }
    if (!listen) cueSpeak(SAY[d], 'teacher'); // the model voice says the order the child just gave
    const to = cellAfter(pos, d, scene.cols, scene.rows);
    if (!to || isBlocked(to, rocks)) {
      sfx.wrong();
      if (!listen) window.setTimeout(() => cueSpeak('Oops! A rock! Try again!', voiceOf(scene.who)), 500);
      setState((s) => ({ ...s, bump: (Number(s.bump) || 0) + 1, step: listen ? s.step : (Number(s.step) || 0) + 1 }));
      return;
    }
    sfx.whoop();
    const arrived = to[0] === mission.target[0] && to[1] === mission.target[1];
    setState((s) => ({ ...s, pos: to, step: (Number(s.step) || 0) + 1, won: arrived, wrong: '' }));
    if (arrived) window.setTimeout(() => { sfx.gem(); cueSpeak(mission.win, 'teacher'); }, 650);
  };
  const next = () => {
    sfx.click();
    setState((s) => {
      const n = (Number(s.m) || 0) + 1;
      return n >= total ? { ...s, done: true } : { ...s, m: n, pos: [-1, -1], step: 0, won: false, wrong: '', bump: 0 };
    });
  };

  const cw = 100 / scene.cols; const ch = 100 / scene.rows;
  const facing: Record<Dir, number> = { up: 0, right: 90, down: 180, left: -90 };
  const lastDir = listen ? mission?.route?.[Math.max(0, step - 1)] : undefined;
  return (
    <div className="absolute inset-0 select-none overflow-hidden bg-[#0b1033] bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      {done && <Confetti count={90} />}
      <div className="pointer-events-none absolute inset-x-0 top-[5%] z-30 flex justify-center px-14">
        <span className="text-center font-black text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.1rem, min(calc(2.6*var(--svw,1vw)), 4.4vh), 2.1rem)' }}>
          {done ? scene.doneLine : `🚀 ${scene.title}`}
        </span>
      </div>
      {!done && mission && (
        <>
          <span className={`absolute left-3 top-[13%] z-30 rounded-full px-4 py-2 font-black text-white shadow-lg ${listen ? 'bg-sky-600' : 'bg-fuchsia-600'}`} style={{ fontSize: 'min(3vh, 2vw)' }}>
            {listen ? '👂 Listen and steer!' : '🎧 You are mission control! Say it!'}
          </span>
          <span className="absolute right-3 top-[13%] z-30 rounded-full bg-white/95 px-4 py-2 font-black text-indigo-700 shadow-lg" style={{ fontSize: 'min(3vh, 2vw)' }}>🚀 {mi + 1}/{total}</span>
          {/* the star map */}
          <div className="absolute left-[4%] top-[21%] z-20 aspect-[5/4] h-[74%] max-w-[62%] rounded-[2vh] border-[0.5vh] border-indigo-300/70 bg-indigo-950/45 shadow-2xl backdrop-blur-[2px]">
            <div className="absolute inset-[1.5%]">
              {Array.from({ length: scene.cols * scene.rows }, (_, i) => {
                const c = i % scene.cols; const r = Math.floor(i / scene.cols);
                return <span key={i} className="absolute rounded-[1vh] border border-indigo-300/25" style={{ left: `${c * cw}%`, top: `${r * ch}%`, width: `${cw}%`, height: `${ch}%` }} />;
              })}
              {[...rocks].map((k) => {
                const [c, r] = k.split(',').map(Number);
                return <span key={k} className="absolute grid place-items-center text-[min(6vh,4vw)]" style={{ left: `${c * cw}%`, top: `${r * ch}%`, width: `${cw}%`, height: `${ch}%` }}>🪨</span>;
              })}
              {/* the target */}
              <motion.div className="absolute grid place-items-center" style={{ left: `${mission.target[0] * cw}%`, top: `${mission.target[1] * ch}%`, width: `${cw}%`, height: `${ch}%` }}
                animate={reduce ? {} : { scale: [1, 1.08, 1] }} transition={{ duration: 1.6, repeat: Infinity }}>
                <img src={mission.targetImg} alt={mission.targetLabel} draggable={false} className="h-[85%] w-[85%] object-contain drop-shadow-[0_0_1.5vh_rgba(253,224,71,0.8)]" />
              </motion.div>
              {/* the rocket */}
              <motion.div key={`r-${mi}`} className="absolute grid place-items-center" style={{ width: `${cw}%`, height: `${ch}%` }}
                animate={{ left: `${pos[0] * cw}%`, top: `${pos[1] * ch}%`, x: Number(state.bump) > 0 && !reduce ? [0, -6, 6, 0] : 0 }}
                transition={{ left: { type: 'spring', stiffness: 140, damping: 16 }, top: { type: 'spring', stiffness: 140, damping: 16 }, x: { duration: 0.3 } }}>
                <motion.img src={scene.rocketImg} alt="rocket" draggable={false} className="h-[80%] w-[80%] object-contain drop-shadow-xl"
                  animate={{ rotate: lastDir ? facing[lastDir] : 0 }} transition={{ type: 'spring', stiffness: 160, damping: 14 }} />
              </motion.div>
            </div>
          </div>
          {/* the controls */}
          <div className="absolute bottom-[6%] right-[4%] top-[22%] z-30 flex w-[30%] flex-col items-center justify-center gap-[1.4vh]">
            <AnimatePresence mode="wait">
              {won ? (
                <motion.div key="won" className="flex flex-col items-center gap-[1.4vh]" initial={reduce ? false : { scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                  <span className="rounded-[2vh] bg-white/95 px-5 py-2 text-center font-black text-indigo-800 shadow-xl" style={{ fontSize: 'min(3.6vh, 2.4vw)' }}>🎉 {mission.win}</span>
                  <button type="button" onClick={next} className={`${CLAY_BUTTON} px-8 py-2`} style={{ fontSize: 'min(3.2vh, 2.2vw)' }}>{mi + 1 >= total ? 'Done! ⭐' : 'Next mission 🚀'}</button>
                </motion.div>
              ) : (
                <motion.div key="pad" className="grid grid-cols-3 grid-rows-3 gap-[1vh]" style={{ width: 'min(42vh,28vw)', height: 'min(42vh,28vw)' }}>
                  {(['', 'up', '', 'left', '', 'right', '', 'down', ''] as const).map((d, i) => d ? (
                    <motion.button key={d} type="button" onClick={() => press(d)} whileTap={{ scale: 0.9 }} aria-label={SAY[d]}
                      animate={state.wrong === d ? { x: [0, -8, 8, -5, 0] } : {}}
                      className="flex flex-col items-center justify-center rounded-[2vh] border-[0.5vh] border-white bg-gradient-to-b from-indigo-400 to-indigo-700 font-black text-white shadow-[0_0.7vh_0_rgba(0,0,0,0.3)]">
                      <span className="text-[min(5vh,3.4vw)] leading-none">{ARROW[d]}</span>
                      <span style={{ fontSize: 'min(2.2vh, 1.5vw)' }}>{d}</span>
                    </motion.button>
                  ) : <span key={i} className={i === 4 ? 'grid place-items-center text-[min(5vh,3.4vw)]' : ''}>{i === 4 ? '🎮' : ''}</span>)}
                </motion.div>
              )}
            </AnimatePresence>
            {!won && (
              <button type="button" onClick={() => { sfx.click(); cueSpeak(listen && nextDir ? SAY[nextDir] : mission.intro, voiceOf(scene.who)); }}
                className="rounded-full bg-white/95 px-4 py-1 text-center font-black text-indigo-700 shadow" style={{ fontSize: 'min(2.6vh, 1.8vw)' }}>
                🔊 {listen ? 'Again!' : mission.intro}
              </button>
            )}
          </div>
        </>
      )}
      {done && <button type="button" onClick={onNext} className={`${CLAY_BUTTON} absolute bottom-[8%] left-1/2 z-40 -translate-x-1/2 px-10 py-3 text-xl`}>Next ⭐</button>}
    </div>
  );
}

