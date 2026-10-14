import { useEffect, useMemo, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../../unit1/audio';
import * as sfx from '../../unit1/sfx';
import { Confetti } from '../../unit1/fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { QuestionCard, voiceOf } from './shared';
import { CLAY_BUTTON, THICK_WORDS } from '../../unit1/scene-components/shared';

/* ---------- Treasure Islands (Battleship, made kind — docs/a1-activity-library.md §11) ----------
 * A sea map with a 4×4 grid: columns A-D, rows 1-4. Treasure is hidden under some squares. Every right answer earns
 * one dive: the child SAYS a square ("B three!") and taps it — a splash, or a treasure chest pops up. Questions keep
 * coming until every treasure is found; after three empty dives in a row a sparkle shows a treasure's row.
 * Mechanics: Battleship / grid coordinates (letters + numbers), Blooket-style "answer to earn a turn".
 * Better: no opponent and nothing sinks; the child practises letter and number names on every dive as well as the
 * questions; the hint keeps it short. */

type Hunt = Extract<Scene, { kind: 'grid-hunt' }>;
const COLS = ['A', 'B', 'C', 'D'];
const NUM = ['one', 'two', 'three', 'four'];
// letter NAMES for the voice: a lone "A" is read as the article ("uh")
const SAY_COL: Record<string, string> = { A: 'Ay', B: 'Bee', C: 'See', D: 'Dee' };
const cellName = (c: string) => `${c[0]} ${c[1]}`;
const cellSay = (c: string) => `${SAY_COL[c[0]] ?? c[0]} ${NUM[Number(c[1]) - 1] ?? c[1]}`;

export function GridHuntScene({ scene, onNext, onWin, onLose, sync }: { scene: Hunt; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void; sync?: ActivitySync }) {
  const reduce = useReducedMotion();
  const treasures = useMemo(() => scene.treasures.map((t) => t.toUpperCase()).filter((t) => /^[A-D][1-4]$/.test(t)), [scene.treasures]);
  const [state, setState] = useSyncedState(sync, { q: 0, phase: 'ask', dived: [''] as string[], dry: 0, wrong: -1, done: false });
  const nq = Math.max(1, scene.rounds.length);
  const q = (Number(state.q) || 0) % nq;
  const r = scene.rounds[q];
  const dived = useMemo(() => new Set(Array.isArray(state.dived) ? state.dived.filter(Boolean) : []), [state.dived]);
  const found = treasures.filter((t) => dived.has(t)).length;
  const hintRow = Number(state.dry) >= 3 ? treasures.find((t) => !dived.has(t))?.[1] : undefined;
  const done = !!state.done;
  const gemDone = useRef(false);

  useEffect(() => {
    if (done || !r || state.phase !== 'ask') return undefined;
    const t = window.setTimeout(() => cueSpeak(r.ask, voiceOf(scene.who)), 600);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.q, done, state.phase]);
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
    cueSpeak(`${r.choices[c]} Dive! Say a square!`, 'teacher');
    setState((s) => ({ ...s, phase: 'dive', wrong: -1 }));
  };
  const dive = (cell: string) => {
    if (state.phase !== 'dive' || dived.has(cell)) return;
    const hit = treasures.includes(cell);
    cueSpeak(`${cellSay(cell)}! ${hit ? 'Treasure!' : 'Splash!'}`, voiceOf(scene.who));
    if (hit) { sfx.reveal(); window.setTimeout(() => sfx.gem(), 250); } else sfx.pop();
    const allFound = hit && found + 1 >= treasures.length;
    setState((s) => ({
      ...s, phase: 'show',
      dived: [...(Array.isArray(s.dived) ? s.dived.filter(Boolean) : []), cell],
      dry: hit ? 0 : (Number(s.dry) || 0) + 1,
    }));
    window.setTimeout(() => setState((s) => (allFound ? { ...s, done: true } : { ...s, phase: 'ask', q: (Number(s.q) || 0) + 1 })), 1800);
  };

  return (
    <div className="absolute inset-0 select-none overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="absolute inset-0 bg-sky-900/25" />
      {done && <Confetti count={90} />}
      <div className="pointer-events-none absolute inset-x-0 top-[5%] z-30 flex justify-center px-14">
        <span className="text-center font-black text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.1rem, min(calc(2.6*var(--svw,1vw)), 4.4vh), 2.1rem)' }}>
          {done ? scene.doneLine : `🏝️ ${scene.title}`}
        </span>
      </div>
      <span className="absolute right-3 top-[13%] z-30 rounded-full bg-white/95 px-4 py-2 font-black text-amber-700 shadow-lg" style={{ fontSize: 'min(3vh, 2vw)' }}>💎 {found}/{treasures.length}</span>
      {/* the sea map */}
      <div className="absolute left-[4%] top-[14%] z-20 grid aspect-square h-[min(64vh,42vw)] grid-cols-[0.5fr_repeat(4,1fr)] grid-rows-[0.5fr_repeat(4,1fr)] gap-[0.6vh] rounded-[2.4vh] border-[0.7vh] border-amber-200 bg-gradient-to-br from-sky-400 to-blue-700 p-[1vh] shadow-2xl">
        <span />
        {COLS.map((c) => <span key={c} className="grid place-items-center font-black text-white" style={{ fontSize: 'min(3.4vh, 2.3vw)' }}>{c}</span>)}
        {[1, 2, 3, 4].map((row) => (
          <FragmentRow key={row} row={row} hint={hintRow === String(row)}>
            {COLS.map((c) => {
              const cell = `${c}${row}`;
              const open = dived.has(cell);
              const hit = open && treasures.includes(cell);
              const can = state.phase === 'dive' && !open;
              return (
                <motion.button key={cell} type="button" onClick={() => dive(cell)} disabled={!can} aria-label={cellName(cell)}
                  whileHover={can ? { scale: 1.07 } : {}} whileTap={can ? { scale: 0.92 } : {}}
                  animate={can && !reduce ? { y: [0, -2, 0] } : { y: 0 }} transition={{ duration: 1.6, repeat: can ? Infinity : 0, delay: (row + COLS.indexOf(c)) * 0.1 }}
                  className={`relative grid place-items-center overflow-hidden rounded-[1.4vh] border-[0.35vh] ${can ? 'border-yellow-200 bg-sky-300/70' : 'border-white/40 bg-sky-500/50'}`}>
                  <AnimatePresence>
                    {open && (
                      <motion.span initial={reduce ? false : { scale: 0, y: 20 }} animate={{ scale: 1, y: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 13 }}
                        className="text-[min(5vh,3.4vw)]">{hit ? '💎' : '💦'}</motion.span>
                    )}
                  </AnimatePresence>
                  {!open && <span className="font-black text-white/70" style={{ fontSize: 'min(2vh, 1.3vw)' }}>{cell}</span>}
                </motion.button>
              );
            })}
          </FragmentRow>
        ))}
      </div>
      {!done && state.phase === 'dive' && (
        <div className="pointer-events-none absolute right-[4%] top-[30%] z-30 w-[44%] text-center">
          <span className="rounded-full bg-yellow-300 px-5 py-2 font-black text-amber-900 shadow-xl" style={{ fontSize: 'min(3.4vh, 2.3vw)' }}>🤿 Say a square — “B three!” — and tap it!</span>
        </div>
      )}
      {!done && r && state.phase === 'ask' && (
        <QuestionCard className="absolute bottom-[6%] right-[3%] z-30 w-[46%]" ask={r.ask} choices={r.choices} img={r.img} wrong={Number(state.wrong)} onPick={answer} onHear={() => cueSpeak(r.ask, voiceOf(scene.who))} tone="sky" />
      )}
      {done && <button type="button" onClick={onNext} className={`${CLAY_BUTTON} absolute bottom-[8%] left-1/2 z-40 -translate-x-1/2 px-10 py-3 text-xl`}>Next ⭐</button>}
    </div>
  );
}

function FragmentRow({ row, hint, children }: { row: number; hint: boolean; children: React.ReactNode }) {
  return (
    <>
      <span className={`grid place-items-center rounded-[1vh] font-black ${hint ? 'bg-yellow-300 text-amber-900' : 'text-white'}`} style={{ fontSize: 'min(3.4vh, 2.3vw)' }}>
        {row}{hint ? '✨' : ''}
      </span>
      {children}
    </>
  );
}
