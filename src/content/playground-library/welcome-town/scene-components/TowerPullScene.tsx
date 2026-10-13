import { useEffect, useMemo, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../../unit1/audio';
import * as sfx from '../../unit1/sfx';
import { Confetti } from '../../unit1/fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { QuestionCard, voiceOf } from './shared';
import { CLAY_BUTTON, THICK_WORDS } from '../../unit1/scene-components/shared';

/* ---------- Wobbly Tower (Jenga, made kind — docs/a1-activity-library.md §11) ----------
 * A wooden tower of blocks, three per layer. The child taps a block; its question appears. A right answer and the
 * block slides out cleanly and is stacked on top — the tower grows. A wrong answer and the tower wobbles ("Careful!"),
 * but the block stays and the child tries again. The tower never falls, and no layer is ever left empty.
 * Mechanics: Jenga (pull a block, put it on top), Wordwall-style question tiles. Better: tension without losing —
 * the wobble is the only "risk"; every answer is a full sentence; the tower is a visible record of right answers. */

type Tower = Extract<Scene, { kind: 'tower-pull' }>;
const LAYERS = 5;
const WOOD = ['from-amber-300 to-amber-500', 'from-orange-300 to-amber-600', 'from-yellow-200 to-amber-400'];

export function TowerPullScene({ scene, onNext, onWin, onLose, sync }: { scene: Tower; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void; sync?: ActivitySync }) {
  const reduce = useReducedMotion();
  const total = Math.min(scene.rounds.length, LAYERS * 2); // at most two blocks per layer can go
  const [state, setState] = useSyncedState(sync, { pulled: [-1], picked: -1, wobble: 0, wrong: -1, done: false });
  const pulled = useMemo(() => (Array.isArray(state.pulled) ? state.pulled.filter((n) => n >= 0) : []), [state.pulled]);
  const picked = Number(state.picked);
  const answered = pulled.length;
  const r = answered < total ? scene.rounds[answered] : undefined;
  const done = !!state.done;
  const gemDone = useRef(false);

  useEffect(() => {
    if (done) return undefined;
    if (answered === 0 && picked < 0) {
      const t = window.setTimeout(() => cueSpeak('Pick a block! Answer and pull it out!', voiceOf(scene.who)), 800);
      return () => window.clearTimeout(t);
    }
    if (picked >= 0 && r) {
      const t = window.setTimeout(() => cueSpeak(r.ask, voiceOf(scene.who)), 400);
      return () => window.clearTimeout(t);
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [picked, done]);
  useEffect(() => {
    if (done && !gemDone.current) { gemDone.current = true; sfx.gem(); onWin(true); cueSpeak(scene.doneLine, voiceOf(scene.who)); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  /** a block can go if it isn't out yet and its layer keeps at least one block */
  const canPull = (b: number) => !pulled.includes(b) && pulled.filter((p) => Math.floor(p / 3) === Math.floor(b / 3)).length < 2;
  const pick = (b: number) => {
    if (done || picked >= 0 || !canPull(b) || !r) return;
    sfx.click();
    setState((s) => ({ ...s, picked: b }));
  };
  const answer = (c: number) => {
    if (!r || picked < 0) return;
    if (c !== r.answer) {
      sfx.wrong(); onLose();
      cueSpeak('Careful! Try again!', voiceOf(scene.who));
      setState((s) => ({ ...s, wrong: c, wobble: (Number(s.wobble) || 0) + 1 }));
      window.setTimeout(() => setState((s) => ({ ...s, wrong: -1 })), 600);
      return;
    }
    sfx.match(); window.setTimeout(() => sfx.pop(), 450);
    cueSpeak(r.choices[c], 'teacher');
    setState((s) => {
      const list = [...(Array.isArray(s.pulled) ? s.pulled.filter((n) => n >= 0) : []), picked];
      return { ...s, pulled: list, picked: -1, wrong: -1, done: list.length >= total };
    });
  };

  // geometry (all in % of the tower box): base layers bottom-up, then the stacked blocks on top
  const LH = 100 / (LAYERS + Math.ceil(total / 3) + 1); // layer height
  return (
    <div className="absolute inset-0 select-none overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="absolute inset-0 bg-black/20" />
      {done && <Confetti count={90} />}
      <div className="pointer-events-none absolute inset-x-0 top-[5%] z-30 flex justify-center px-14">
        <span className="text-center font-black text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.1rem, min(calc(2.6*var(--svw,1vw)), 4.4vh), 2.1rem)' }}>
          {done ? scene.doneLine : `🧱 ${scene.title}`}
        </span>
      </div>
      {!done && <span className="absolute right-3 top-[13%] z-30 rounded-full bg-white/95 px-4 py-2 font-black text-amber-700 shadow-lg" style={{ fontSize: 'min(3vh, 2vw)' }}>🧱 {answered}/{total}</span>}
      {/* the tower */}
      <div className="absolute bottom-[5%] left-[6%] top-[14%] z-20 w-[34%]">
        {/* table */}
        <div className="absolute -inset-x-[10%] bottom-0 h-[3%] rounded-full bg-gradient-to-b from-amber-800 to-amber-950 shadow-xl" />
        <motion.div key={Number(state.wobble) || 0} className="absolute inset-x-[12%] bottom-[3%] top-0 origin-bottom"
          animate={reduce || !(Number(state.wobble) > 0) ? {} : { rotate: [0, -3, 2.5, -1.5, 1, 0] }} transition={{ duration: 0.9 }}>
          {Array.from({ length: LAYERS * 3 }, (_, b) => {
            const layer = Math.floor(b / 3); const col = b % 3;
            const out = pulled.includes(b);
            const sel = picked === b;
            const ok = canPull(b) && picked < 0 && !done;
            return (
              <AnimatePresence key={b}>
                {!out && (
                  <motion.button type="button" onClick={() => pick(b)} disabled={!ok} aria-label={`block ${b + 1}`}
                    className={`absolute rounded-[0.8vh] border-[0.35vh] border-amber-900/70 bg-gradient-to-b ${WOOD[(layer + col) % 3]} shadow-[inset_0_-0.6vh_0_rgba(120,53,15,0.25)] ${sel ? 'ring-[0.6vh] ring-yellow-300' : ''}`}
                    style={{ left: `${col * 33.6}%`, width: '32.6%', bottom: `${layer * LH}%`, height: `${LH * 0.94}%` }}
                    animate={sel && !reduce ? { x: [0, 14, 10, 14] } : { x: 0 }} transition={{ duration: 0.6, repeat: sel ? Infinity : 0, repeatType: 'reverse' }}
                    exit={{ x: col === 0 ? -260 : 260, opacity: 0, transition: { duration: 0.45 } }}
                    whileHover={ok ? { y: -3 } : {}}>
                    {/* wood grain */}
                    <span className="absolute inset-x-[10%] top-[35%] h-[0.3vh] rounded-full bg-amber-900/15" />
                    <span className="absolute inset-x-[20%] top-[60%] h-[0.3vh] rounded-full bg-amber-900/10" />
                    {ok && <span className="relative font-black text-amber-900/60" style={{ fontSize: 'min(2.2vh, 1.4vw)' }}>?</span>}
                  </motion.button>
                )}
              </AnimatePresence>
            );
          })}
          {/* the pulled blocks, stacked on top */}
          {pulled.map((_, k) => {
            const layer = LAYERS + Math.floor(k / 3); const col = k % 3;
            return (
              <motion.div key={`top-${k}`} className={`absolute rounded-[0.8vh] border-[0.35vh] border-amber-900/70 bg-gradient-to-b ${WOOD[(layer + col) % 3]} shadow-lg`}
                style={{ left: `${col * 33.6}%`, width: '32.6%', bottom: `${layer * LH}%`, height: `${LH * 0.94}%` }}
                initial={reduce || k < pulled.length - 1 ? false : { y: -220, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 220, damping: 16, delay: 0.3 }}>
                <span className="absolute inset-0 grid place-items-center text-[min(2.4vh,1.6vw)]">⭐</span>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
      {/* the question */}
      {!done && r && picked >= 0 && (
        <QuestionCard className="absolute right-[4%] top-[24%] z-30 w-[50%]" ask={r.ask} choices={r.choices} img={r.img} wrong={Number(state.wrong)} onPick={answer} onHear={() => cueSpeak(r.ask, voiceOf(scene.who))} tone="amber" />
      )}
      {!done && picked < 0 && (
        <div className="pointer-events-none absolute right-[4%] top-[34%] z-30 w-[50%] text-center">
          <span className="rounded-full bg-yellow-300 px-5 py-2 font-black text-amber-900 shadow-xl" style={{ fontSize: 'min(3.4vh, 2.3vw)' }}>👆 Pick a block!</span>
        </div>
      )}
      {done && <button type="button" onClick={onNext} className={`${CLAY_BUTTON} absolute bottom-[8%] left-1/2 z-40 -translate-x-1/2 px-10 py-3 text-xl`}>Next ⭐</button>}
    </div>
  );
}
