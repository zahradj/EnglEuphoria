import { useEffect, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../../unit1/audio';
import * as sfx from '../../unit1/sfx';
import { Confetti } from '../../unit1/fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { QuestionCard, voiceOf } from './shared';
import { CLAY_BUTTON, THICK_WORDS } from '../../unit1/scene-components/shared';

/* ---------- Treasure Chests (Blooket Gold Quest without stealing — docs/a1-activity-library.md §12) ----------
 * Every right answer earns a chest pick: three chests wobble, the child opens one — coins burst out and drop into the
 * class jar, a "×2" doubles the jar, a ⭐ is a sticker. The jar fills toward its goal. Nothing can be taken away and
 * there are no rivals. Mechanics: Blooket Gold Quest (chest after each right answer), loot boxes in kids' games, a
 * class reward jar. Better: rewards only for English answers, a shared jar instead of stealing, the surprise is kind. */

type Chest = Extract<Scene, { kind: 'chest-quest' }>;
const coinsOf = (p: string) => (/^\d+$/.test(p) ? Number(p) : 0);

export function ChestQuestScene({ scene, onNext, onWin, onLose, sync }: { scene: Chest; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void; sync?: ActivitySync }) {
  const reduce = useReducedMotion();
  const total = scene.rounds.length;
  const [state, setState] = useSyncedState(sync, { round: 0, phase: 'ask', picked: -1, coins: 0, stars: 0, wrong: -1, done: false });
  const round = Math.max(0, Math.min(total - 1, Number(state.round) || 0));
  const r = scene.rounds[round];
  const coins = Number(state.coins) || 0;
  const fill = Math.min(1, coins / Math.max(1, scene.goal));
  const done = !!state.done;
  const gemDone = useRef(false);

  useEffect(() => {
    if (done || !r || state.phase !== 'ask') return undefined;
    const t = window.setTimeout(() => cueSpeak(r.ask, voiceOf(scene.who)), 600);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, done, state.phase]);
  useEffect(() => {
    if (done && !gemDone.current) { gemDone.current = true; sfx.gem(); onWin(true); cueSpeak(scene.doneLine, voiceOf(scene.who)); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const answer = (c: number) => {
    if (!r || state.phase !== 'ask') return;
    if (c !== r.answer) {
      sfx.wrong(); onLose();
      setState((s) => ({ ...s, wrong: c }));
      window.setTimeout(() => setState((s) => ({ ...s, wrong: -1 })), 600);
      return;
    }
    sfx.match();
    cueSpeak(`${r.choices[c]} Pick a chest!`, 'teacher');
    setState((s) => ({ ...s, phase: 'pick', wrong: -1 }));
  };
  const open = (i: number) => {
    if (!r || state.phase !== 'pick') return;
    const prize = r.prizes[i];
    sfx.reveal(); window.setTimeout(() => sfx.gem(), 250);
    cueSpeak(prize === '×2' ? 'Double! Your coins are doubled!' : prize === '⭐' ? 'A sticker!' : `${coinsOf(prize)} coins!`, voiceOf(scene.who));
    setState((s) => ({
      ...s, phase: 'open', picked: i,
      coins: prize === '×2' ? (Number(s.coins) || 0) * 2 : (Number(s.coins) || 0) + coinsOf(prize),
      stars: (Number(s.stars) || 0) + (prize === '⭐' ? 1 : 0),
    }));
    window.setTimeout(() => setState((s) => {
      const n = (Number(s.round) || 0) + 1;
      return n >= total ? { ...s, done: true } : { ...s, round: n, phase: 'ask', picked: -1 };
    }), 2200);
  };

  return (
    <div className="absolute inset-0 select-none overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="absolute inset-0 bg-black/20" />
      {done && <Confetti count={90} />}
      <div className="pointer-events-none absolute inset-x-0 top-[5%] z-30 flex justify-center px-14">
        <span className="text-center font-black text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.1rem, min(calc(2.6*var(--svw,1vw)), 4.4vh), 2.1rem)' }}>
          {done ? scene.doneLine : `💰 ${scene.title}`}
        </span>
      </div>
      {/* the class jar */}
      <div className="absolute right-[4%] top-[16%] z-20 flex flex-col items-center gap-[0.8vh]">
        <div className="relative h-[min(30vh,20vw)] w-[min(19vh,12.5vw)] overflow-hidden rounded-b-[4vh] rounded-t-[2vh] border-[0.7vh] border-white/90 bg-white/25 shadow-xl backdrop-blur-sm">
          <motion.div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-amber-500 to-yellow-300" animate={{ height: `${fill * 100}%` }} transition={{ type: 'spring', stiffness: 80, damping: 14 }}>
            <div className="absolute inset-x-0 top-0 h-[1vh] bg-yellow-100/70" />
          </motion.div>
          <span className="absolute inset-0 grid place-items-center font-black text-amber-900" style={{ fontSize: 'min(4vh, 2.8vw)' }}>🪙 {coins}</span>
        </div>
        <span className="rounded-full bg-white/95 px-3 py-1 font-black text-amber-700 shadow" style={{ fontSize: 'min(2.4vh, 1.6vw)' }}>Goal {scene.goal} · ⭐ {Number(state.stars) || 0}</span>
      </div>
      {/* chests */}
      {!done && r && (
        <div className="absolute inset-x-[8%] top-[22%] z-20 flex justify-center gap-[4vw] pe-[14vw]">
          {[0, 1, 2].map((i) => {
            const opened = state.phase === 'open' && state.picked === i;
            const can = state.phase === 'pick';
            return (
              <motion.button key={`${round}-${i}`} type="button" onClick={() => open(i)} disabled={!can} aria-label={`chest ${i + 1}`}
                className="relative" style={{ width: 'min(22vh,15vw)', height: 'min(20vh,13.5vw)' }}
                animate={can && !reduce ? { rotate: [0, -4, 4, 0], y: [0, -4, 0] } : { rotate: 0 }} transition={{ duration: 0.8, repeat: can ? Infinity : 0, delay: i * 0.15 }}
                whileHover={can ? { scale: 1.06 } : {}}>
                {/* body */}
                <div className="absolute inset-x-0 bottom-0 h-[62%] rounded-b-[1.6vh] border-[0.5vh] border-amber-950 bg-gradient-to-b from-amber-600 to-amber-800 shadow-xl">
                  <div className="absolute inset-y-0 left-[44%] w-[12%] bg-yellow-400" />
                  <div className="absolute left-1/2 top-[8%] h-[30%] w-[16%] -translate-x-1/2 rounded bg-yellow-300 shadow" />
                </div>
                {/* lid */}
                <motion.div className="absolute inset-x-0 top-[6%] h-[38%] origin-bottom rounded-t-[3vh] border-[0.5vh] border-amber-950 bg-gradient-to-b from-amber-500 to-amber-700"
                  style={{ transformPerspective: 500 }} animate={{ rotateX: opened ? 110 : 0 }} transition={{ type: 'spring', stiffness: 160, damping: 14 }}>
                  <div className="absolute inset-y-0 left-[44%] w-[12%] bg-yellow-400" />
                </motion.div>
                <AnimatePresence>
                  {opened && (
                    <motion.span className="absolute left-1/2 top-0 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-3 py-1 font-black text-amber-700 shadow-xl" style={{ fontSize: 'min(4vh, 2.8vw)' }}
                      initial={{ y: 30, opacity: 0, scale: 0.4 }} animate={{ y: -50, opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 220, damping: 12 }}>
                      {r.prizes[i] === '×2' ? '×2 🪙' : r.prizes[i] === '⭐' ? '⭐ sticker' : `+${r.prizes[i]} 🪙`}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>
      )}
      {!done && r && state.phase === 'pick' && (
        <div className="pointer-events-none absolute inset-x-0 top-[50%] z-30 flex justify-center pe-[14vw]">
          <span className="rounded-full bg-yellow-300 px-5 py-2 font-black text-amber-900 shadow-xl" style={{ fontSize: 'min(3.4vh, 2.3vw)' }}>Pick a chest! 👆</span>
        </div>
      )}
      {!done && r && state.phase === 'ask' && (
        <QuestionCard className="absolute inset-x-[8%] bottom-[4%] z-30 me-[14vw]" ask={r.ask} choices={r.choices} img={r.img} wrong={Number(state.wrong)} onPick={answer} onHear={() => cueSpeak(r.ask, voiceOf(scene.who))} tone="amber" />
      )}
      {done && <button type="button" onClick={onNext} className={`${CLAY_BUTTON} absolute bottom-[8%] left-1/2 z-40 -translate-x-1/2 px-10 py-3 text-xl`}>Next ⭐</button>}
    </div>
  );
}
