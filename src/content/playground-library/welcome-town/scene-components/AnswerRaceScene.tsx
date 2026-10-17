import { useEffect, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../../unit1/audio';
import * as sfx from '../../unit1/sfx';
import { Confetti } from '../../unit1/fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { voiceOf } from './shared';
import { CLAY_BUTTON, THICK_WORDS } from '../../unit1/scene-components/shared';
import { CalmBg } from '../../unit1/scene-components/gameFx';
import { SKIN, jewel } from '../../gameSkin';

/* ---------- Answer Race (A1 U1: L6 "Catch the answer", L7 Boss warm-up) ----------
 * A question (heard, or read when `read`), three answer cards. Every right answer moves the racer one step along the
 * track; at the finish the flag waves. A wrong card wobbles and the question plays again — the racer never goes back.
 * Mechanics: Blooket "Racing" (each right answer moves your car), Kahoot-style answer tiles, the Duolingo "tap the
 * reply" chat check. Better: the cards are full ANSWERS to a real question ("How are you?" → "I am fine, thank you."),
 * so the race is won by understanding the conversation, not by speed — there is no clock.
 * `look: 'gates'` = Pip runs through the answer gate; `'race'` = a car race with two friendly rival cars; `'raft'` = a
 * river race (A1 U2L7): the racer floats on the water against a duck and a frog. */

type Race = Extract<Scene, { kind: 'answer-race' }>;

export function AnswerRaceScene({ scene, onNext, onWin, onLose, sync }: { scene: Race; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void; sync?: ActivitySync }) {
  const reduce = useReducedMotion();
  const total = scene.rounds.length;
  const [state, setState] = useSyncedState(sync, { round: 0, step: 0, wrong: -1, right: -1, done: false });
  const roundIdx = Math.max(0, Math.min(total - 1, Number(state.round) || 0));
  const r = scene.rounds[roundIdx];
  const step = Math.max(0, Math.min(total, Number(state.step) || 0));
  const done = !!state.done;
  const gemDone = useRef(false);
  const raft = scene.look === 'raft';
  const race = scene.look === 'race' || raft;
  const flip = scene.look === 'race'; // the car pictures face left

  useEffect(() => {
    if (done || !r || r.read) return undefined;
    const t = window.setTimeout(() => cueSpeak(r.ask, voiceOf(scene.who)), 500);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundIdx, done]);
  useEffect(() => {
    if (done && !gemDone.current) { gemDone.current = true; sfx.gem(); onWin(true); cueSpeak(scene.doneLine, voiceOf(scene.who)); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const pick = (i: number) => {
    if (done || !r || state.right >= 0) return;
    if (i !== r.answer) {
      sfx.wrong(); onLose();
      setState((s) => ({ ...s, wrong: i }));
      window.setTimeout(() => setState((s) => ({ ...s, wrong: -1 })), 650);
      if (!r.read) window.setTimeout(() => cueSpeak(r.ask, voiceOf(scene.who)), 700);
      return;
    }
    sfx.whoop();
    cueSpeak(r.choices[i], 'teacher');
    setState((s) => ({ ...s, right: i, step: Math.min(total, (Number(s.step) || 0) + 1) }));
    window.setTimeout(() => setState((s) => {
      const next = (Number(s.round) || 0) + 1;
      return next >= total ? { ...s, right: -1, done: true } : { ...s, round: next, right: -1 };
    }), 1500);
  };

  const at = (k: number) => 8 + (k / Math.max(1, total)) * 80; // % along the track
  const rivals = raft ? [{ img: '/lep1/items/item-duck-yellow.png', lane: 0 }, { img: '/lep1/items/item-frog.png', lane: 2 }]
    : race ? [{ img: '/lep1/items/item-car-green.png', lane: 0 }, { img: '/lep1/items/item-car.png', lane: 2 }] : [];
  const laneY = (lane: number) => 18 + lane * 32; // % inside the track strip

  return (
    <div className="absolute inset-0 select-none overflow-hidden">
      <CalmBg img={scene.bg} />
      {done && <Confetti count={70} />}
      <div className="pointer-events-none absolute inset-x-0 top-[8%] z-30 flex justify-center px-14">
        <span className="text-center font-black text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.1rem, min(calc(2.6*var(--svw,1vw)), 4.4vh), 2.1rem)' }}>
          {done ? scene.doneLine : scene.title}
        </span>
      </div>

      {/* the track */}
      <div className={`absolute inset-x-[4%] top-[16%] z-20 h-[24%] overflow-hidden rounded-[3vh] border-[0.5vh] border-[#FEAF15] shadow-[inset_0_0.6vh_1.2vh_rgba(0,0,0,0.25),0_1.6vh_3vh_rgba(40,20,5,0.45)] ${raft ? 'bg-gradient-to-b from-[#5EEAD4] to-[#0D9488]' : race ? 'bg-gradient-to-b from-[#3B5B78] to-[#1E3A52]' : 'bg-gradient-to-b from-[#BBF7D0] to-[#6EE7B7]'}`}>
        {race
          ? [1, 2].map((k) => <div key={k} className="absolute inset-x-0 border-t-[0.5vh] border-dashed border-white/70" style={{ top: `${k * 33.3}%` }} />)
          : <div className="absolute inset-x-0 top-1/2 h-[30%] -translate-y-1/2 rounded-full bg-[#FEF6DA]/90 shadow-[inset_0_0.3vh_0.4vh_rgba(120,80,30,0.25)]" />}
        <div className="absolute inset-y-0 right-[4%] w-[3%]" style={{ background: 'repeating-conic-gradient(#111 0 25%, #fff 0 50%) 0 0 / 1.6vh 1.6vh' }} />
        <motion.span className="absolute right-[1%] top-[2%]" style={{ fontSize: 'min(5vh, 3vw)' }} animate={done && !reduce ? { rotate: [0, -15, 15, 0] } : {}} transition={{ repeat: done ? Infinity : 0, duration: 0.8 }}>🏁</motion.span>
        {rivals.map((rv, k) => (
          <motion.div key={k} className="absolute" style={{ height: '28%', aspectRatio: '1.3', top: `${laneY(rv.lane)}%`, translate: '-50% -50%' }}
            animate={{ left: `${at(Math.min(step * (0.62 + k * 0.12), total - 0.4))}%` }} transition={{ type: 'spring', stiffness: 60, damping: 16 }}>
            <img src={rv.img} alt="" draggable={false} className="h-full w-full object-contain opacity-90" style={flip ? { transform: 'scaleX(-1)' } : undefined} />
          </motion.div>
        ))}
        <motion.div className="absolute z-10" style={{ height: race ? '30%' : '62%', aspectRatio: race ? '1.3' : '1', top: `${race ? laneY(1) : 46}%`, translate: '-50% -50%' }}
          animate={{ left: `${at(step)}%`, y: !reduce && state.right >= 0 ? [0, -12, 0] : 0 }}
          transition={{ type: 'spring', stiffness: 90, damping: 14 }}>
          {/* the car pictures face left: flip them to drive to the finish */}
          <img src={scene.racer} alt="" draggable={false} className="h-full w-full object-contain drop-shadow-[0_0.6vh_0.5vh_rgba(0,0,0,0.35)]" style={flip ? { transform: 'scaleX(-1)' } : undefined} />
        </motion.div>
      </div>

      {/* question + answers */}
      {!done && r && (
        <AnimatePresence mode="wait">
          <motion.div key={roundIdx} className="absolute inset-x-0 top-[43%] z-30 flex flex-col items-center gap-[2.5vh] px-[4%]"
            initial={reduce ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className={`flex items-center gap-3 px-6 py-2 ${SKIN.panel}`}>
              <span className={`font-black ${SKIN.ink}`} style={{ fontSize: 'min(5vh, 3.2vw)' }}>{r.read ? '📖 ' : ''}{r.ask}</span>
              <button type="button" onClick={() => cueSpeak(r.ask, voiceOf(scene.who))} aria-label="Hear it" className="grid h-[6vh] w-[6vh] place-items-center rounded-full bg-[#E0F2FE] text-[2.8vh] active:scale-95">🔊</button>
              <span className="text-neutral-400" style={{ fontSize: 'min(2.2vh, 1.4vw)' }}>{roundIdx + 1}/{total}</span>
            </div>
            <div className="flex w-full flex-wrap justify-center gap-[2vw]">
              {r.choices.map((c, i) => (
                <motion.button key={c} type="button" onClick={() => pick(i)}
                  className={`relative min-w-[24%] max-w-[32%] px-4 font-black ${jewel(i)} ${race ? 'rounded-[2vh] py-4' : 'rounded-t-[12vh] rounded-b-[1.5vh] pb-4 pt-8'} ${state.right === i ? 'ring-[0.7vh] ring-[#FDE68A]' : ''}`}
                  style={{ fontSize: 'min(3.8vh, 2.4vw)' }}
                  animate={state.wrong === i ? { x: [0, -10, 10, -6, 0] } : state.right === i && !reduce ? { scale: [1, 1.12, 1] } : {}}
                  transition={{ duration: 0.5 }} whileTap={{ scale: 0.95 }}>
                  {c}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      )}
      {done && <button type="button" onClick={onNext} className={`${CLAY_BUTTON} absolute bottom-[14%] left-1/2 z-40 -translate-x-1/2 px-10 py-3 text-xl`}>Next ⭐</button>}
    </div>
  );
}
