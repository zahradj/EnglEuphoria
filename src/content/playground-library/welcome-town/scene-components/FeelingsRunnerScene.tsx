import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../../unit1/audio';
import * as sfx from '../../unit1/sfx';
import { Confetti } from '../../unit1/fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { voiceOf } from './shared';
import { CLAY_BUTTON, THICK_WORDS } from '../../unit1/scene-components/shared';

/* ---------- Feelings Runner (`feelings-runner`, A1 U1 L2 — owner 2026-10-14: "remove all of the brain breaks … replace
 * it with a video game that can actually serve the purpose and the objective of the lesson") ----------
 * An endless-runner: Pip runs along the road (the road stripes and dust move; the picture behind holds still). Friends
 * run towards him in three lanes. A sentence is heard and shown — "She is hungry!" — and the child taps the friend it
 * describes: that friend high-fives Pip and joins the running team behind him. A wrong friend says their OWN sentence
 * ("He is happy!") and runs on — so even a miss teaches. The team grows to the whole class.
 * Mechanics: endless runners (Subway Surfers lanes), Lingokids catch games. Better: no crashes, no timer, no lives —
 * friends keep looping until the child is ready; the language (he/she + the feeling) decides every tap. */

type Runner = Extract<Scene, { kind: 'feelings-runner' }>;
const LANES = [30, 50, 70];

export function FeelingsRunnerScene({ scene, onNext, onWin, onLose, sync }: { scene: Runner; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void; sync?: ActivitySync }) {
  const reduce = useReducedMotion();
  const total = scene.rounds.length;
  const [state, setState] = useSyncedState(sync, { round: 0, team: [-1], hit: false, done: false });
  const round = Math.max(0, Math.min(total - 1, Number(state.round) || 0));
  const r = scene.rounds[round];
  const team = Array.isArray(state.team) ? state.team.filter((n) => n >= 0) : [];
  const hit = !!state.hit;
  const done = !!state.done;
  const gemDone = useRef(false);
  const busy = useRef(false);
  const [wrong, setWrong] = useState(-1);

  useEffect(() => {
    busy.current = false;
    if (done || !r) return undefined;
    const t = window.setTimeout(() => cueSpeak(r.ask, voiceOf(scene.who)), 700);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, done]);
  useEffect(() => {
    if (done && !gemDone.current) { gemDone.current = true; sfx.gem(); onWin(true); cueSpeak(scene.doneLine, voiceOf(scene.who)); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const tap = (i: number) => {
    const c = r?.choices[i];
    if (!r || !c || hit || done || busy.current) return;
    busy.current = true;
    if (i !== r.answer) {
      sfx.wrong(); onLose(); setWrong(i);
      cueSpeak(c.sentence, voiceOf(scene.who));
      window.setTimeout(() => { setWrong(-1); busy.current = false; }, 1800);
      return;
    }
    sfx.match(); window.setTimeout(() => sfx.whoop(), 200);
    cueSpeak(c.sentence, voiceOf(scene.who));
    setState((s) => ({ ...s, hit: true, team: [...team, scene.team.indexOf(c.img) >= 0 ? scene.team.indexOf(c.img) : 0] }));
    window.setTimeout(() => setState((s) => {
      const n = (Number(s.round) || 0) + 1;
      return n >= total ? { ...s, hit: false, done: true } : { ...s, round: n, hit: false };
    }), 2300);
  };

  return (
    <div className="absolute inset-0 select-none overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      {done && <Confetti count={100} />}
      {/* the road: stripes run, the picture holds still */}
      <div className="absolute inset-x-0 bottom-0 h-[24%] bg-gradient-to-b from-amber-700/70 to-amber-900/80" />
      <motion.div className="absolute inset-x-0 bottom-[11%] h-[1.2vh]" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #fde68a 0 6vw, transparent 6vw 12vw)', backgroundSize: '12vw 100%' }}
        animate={reduce || done ? {} : { backgroundPositionX: ['0vw', '-12vw'] }} transition={{ duration: 0.6, repeat: Infinity, ease: 'linear' }} />
      <div className="pointer-events-none absolute inset-x-0 top-[3%] z-30 flex flex-col items-center gap-1 px-14">
        <span className="text-center font-black text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.1rem, min(calc(2.6*var(--svw,1vw)), 4.4vh), 2.1rem)' }}>
          {done ? scene.doneLine : `\u{1F3C3} ${scene.title}`}
        </span>
        {!done && r && (
          <button type="button" onClick={() => { sfx.click(); cueSpeak(r.ask, voiceOf(scene.who)); }}
            className="pointer-events-auto rounded-[2vh] bg-white px-[1.6vw] py-[0.6vh] font-black text-indigo-900 shadow-xl" style={{ fontSize: 'min(4vh, 2.8vw)' }}>
            🔊 {r.ask} <span className="ms-2 text-indigo-300" style={{ fontSize: 'min(2.4vh, 1.6vw)' }}>{round + 1}/{total}</span>
          </button>
        )}
      </div>
      {/* Pip and his growing team */}
      <div className="absolute bottom-[8%] left-[2%] z-20 flex items-end">
        {team.map((k, j) => (
          <motion.img key={`${k}-${j}`} src={scene.team[k]} alt="" draggable={false} className="-me-[1.4vw] h-[min(15vh,10vw)] w-auto object-contain drop-shadow-xl"
            initial={reduce ? false : { x: 200, opacity: 0 }} animate={reduce ? {} : { x: 0, opacity: 1, y: [0, -8, 0] }} transition={{ y: { duration: 0.45, repeat: Infinity, delay: j * 0.1 }, x: { type: 'spring' } }} />
        ))}
        <motion.img src={scene.runner} alt="Pip" draggable={false} className="h-[min(24vh,16vw)] w-auto object-contain drop-shadow-2xl"
          animate={reduce || done ? {} : { y: [0, -14, 0] }} transition={{ duration: 0.45, repeat: Infinity }} />
      </div>
      {/* friends running towards Pip */}
      {!done && r && r.choices.map((c, i) => {
        const caught = hit && i === r.answer;
        return (
          <motion.div key={`${round}-${i}`} className="absolute z-20" style={{ top: `${LANES[i % LANES.length] - 12}%`, left: reduce ? `${46 + i * 16}%` : '104%' }}
            animate={caught ? { left: '14%', top: '62%', scale: 0.6, opacity: 0 } : reduce ? undefined : { left: ['104%', '24%'] }}
            transition={caught ? { duration: 0.9 } : { duration: 7 + i * 1.3, delay: i * 0.9, repeat: Infinity, ease: 'linear' }}>
            <motion.button type="button" onClick={() => tap(i)} aria-label={c.sentence}
              className="block rounded-full bg-white/40 p-[0.6vh] shadow-lg backdrop-blur-[1px]"
              animate={wrong === i ? { x: [0, -12, 12, -7, 0] } : reduce ? {} : { y: [0, -12, 0] }}
              transition={wrong === i ? { duration: 0.45 } : { duration: 0.5, repeat: Infinity }}>
              <img src={c.img} alt="" draggable={false} className="h-[min(18vh,12vw)] w-auto object-contain drop-shadow-xl" />
            </motion.button>
            {wrong === i && <span className="absolute -top-[4vh] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-3 font-black text-rose-600 shadow" style={{ fontSize: 'min(2.6vh, 1.8vw)' }}>{c.sentence}</span>}
          </motion.div>
        );
      })}
      {done && <button type="button" onClick={onNext} className={`${CLAY_BUTTON} absolute left-1/2 top-[45%] z-40 -translate-x-1/2 px-10 py-3 text-xl`}>Next ⭐</button>}
    </div>
  );
}
