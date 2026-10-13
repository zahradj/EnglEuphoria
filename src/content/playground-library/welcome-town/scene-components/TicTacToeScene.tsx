import { useEffect, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { Scene } from '../scenes';
import { CAST } from '../scenes';
import { cueSpeak } from '../../unit1/audio';
import * as sfx from '../../unit1/sfx';
import { Confetti } from '../../unit1/fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { voiceOf } from './shared';
import { CLAY_BUTTON, THICK_WORDS } from '../../unit1/scene-components/shared';
import { EMPTY, LINES, friendMove, wins } from './ticTacToeRules';

/* ---------- Tic-Tac-Toe Duel (classic noughts & crosses, modern design — docs/a1-activity-library.md §11) ----------
 * The child plays a friend on a 3×3 board. To put a star on a square the child taps it and answers its question; then
 * the friend drops their token on a free square. Three stars in a row wins. The friend plays fair (blocks a line of
 * two) but never completes a line of their own, so the child always CAN win; a full board just deals a new board.
 * Mechanics: tic-tac-toe review (Baamboozle "Tic Tac Toe" / "Four in a Row" modes, classroom ESL board games).
 * Better: every move costs a sentence (the language IS the move), the friend reacts in English, no losing screen. */

type TTT = Extract<Scene, { kind: 'tic-tac-toe' }>;
export function TicTacToeScene({ scene, onNext, onWin, onLose, sync }: { scene: TTT; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void; sync?: ActivitySync }) {
  const reduce = useReducedMotion();
  const squares = scene.squares.slice(0, 9);
  const friend = CAST[scene.who]?.name ?? 'Pip';
  const [state, setState] = useSyncedState(sync, { board: EMPTY, open: -1, wrong: -1, last: -1, games: 0, done: false });
  const board = Array.isArray(state.board) && state.board.length === 9 ? state.board.map((n) => (n === 1 || n === 2 ? n : 0)) : EMPTY;
  const open = Number.isInteger(state.open) && state.open >= 0 && state.open < squares.length ? state.open : -1;
  const q = open >= 0 ? squares[open] : undefined;
  const done = !!state.done;
  const busy = useRef(false);
  const gemDone = useRef(false);
  const winLine = LINES.find((l) => l.every((i) => board[i] === 1));

  useEffect(() => {
    const t = window.setTimeout(() => cueSpeak(`Let's play! Tap a square and answer.`, voiceOf(scene.who)), 500);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => { if (q) cueSpeak(q.ask, voiceOf(scene.who)); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [open]);
  useEffect(() => {
    if (done && !gemDone.current) { gemDone.current = true; sfx.gem(); onWin(true); cueSpeak(scene.doneLine, voiceOf(scene.who)); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const tapSquare = (i: number) => {
    if (done || busy.current || open >= 0 || board[i] !== 0 || !squares[i]) return;
    sfx.click();
    setState((s) => ({ ...s, open: i, wrong: -1 }));
  };

  const answer = (c: number) => {
    if (!q || busy.current) return;
    if (c !== q.answer) {
      sfx.wrong(); onLose();
      setState((s) => ({ ...s, wrong: c }));
      window.setTimeout(() => setState((s) => ({ ...s, wrong: -1 })), 600);
      return;
    }
    busy.current = true;
    sfx.pop(); sfx.match();
    cueSpeak(q.choices[c], 'teacher');
    const at = open;
    setState((s) => {
      const b = Array.isArray(s.board) && s.board.length === 9 ? [...s.board] : [...EMPTY];
      b[at] = 1;
      return { ...s, board: b, open: -1, last: at, done: wins(b, 1) };
    });
    // the friend's turn (or a new board when it is full)
    window.setTimeout(() => {
      setState((s) => {
        if (s.done) return s;
        const b = Array.isArray(s.board) && s.board.length === 9 ? [...s.board] : [...EMPTY];
        const m = friendMove(b);
        if (m < 0) return { ...s, board: [...EMPTY], games: (Number(s.games) || 0) + 1, last: -1 };
        b[m] = 2;
        if (!b.includes(0)) return { ...s, board: [...EMPTY], games: (Number(s.games) || 0) + 1, last: -1 };
        return { ...s, board: b, last: m };
      });
      sfx.click();
      busy.current = false;
    }, 1500);
  };

  const sq = 'min(21vh, 13vw)';
  return (
    <div className="absolute inset-0 select-none overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="absolute inset-0 bg-black/20" />
      {done && <Confetti count={80} />}
      <div className="pointer-events-none absolute inset-x-0 top-[7%] z-30 flex justify-center px-14">
        <span className="text-center font-black text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.1rem, min(calc(2.6*var(--svw,1vw)), 4.4vh), 2.1rem)' }}>
          {done ? scene.doneLine : `❌⭕ ${scene.title}`}
        </span>
      </div>
      {/* players */}
      <div className="absolute left-[4%] top-1/2 z-20 flex -translate-y-1/2 flex-col items-center gap-2">
        <motion.img src={scene.opponentImg} alt={friend} draggable={false} className="w-[min(22vh,15vw)] drop-shadow-xl" animate={reduce ? {} : { y: [0, -6, 0] }} transition={{ duration: 2.2, repeat: Infinity }} />
        <span className="rounded-full bg-white/95 px-4 py-1 font-black text-neutral-700 shadow" style={{ fontSize: 'min(2.8vh, 1.9vw)' }}>{friend}</span>
      </div>
      <div className="absolute right-[5%] top-1/2 z-20 flex -translate-y-1/2 flex-col items-center gap-2">
        <span className="grid aspect-square w-[min(16vh,11vw)] place-items-center rounded-full border-[0.6vh] border-white bg-gradient-to-b from-amber-300 to-orange-500 shadow-xl" style={{ fontSize: 'min(9vh, 6vw)' }}>⭐</span>
        <span className="rounded-full bg-white/95 px-4 py-1 font-black text-orange-700 shadow" style={{ fontSize: 'min(2.8vh, 1.9vw)' }}>You</span>
      </div>
      {/* board */}
      <div className="absolute inset-x-0 bottom-[3%] top-[16%] z-20 flex items-center justify-center">
      <motion.div key={Number(state.games) || 0} className="grid grid-cols-3 gap-[1.2vh] rounded-[3vh] border-[0.8vh] border-white bg-sky-500/90 p-[1.4vh] shadow-2xl"
        initial={reduce ? false : { scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        {squares.map((s, i) => {
          const v = board[i];
          const lit = winLine?.includes(i);
          return (
            <motion.button key={i} type="button" onClick={() => tapSquare(i)} aria-label={v ? (v === 1 ? 'your star' : friend) : `square ${i + 1}`}
              className={`relative grid place-items-center overflow-hidden rounded-[2vh] border-[0.5vh] ${lit ? 'border-yellow-300 bg-yellow-100' : 'border-white bg-[#fffaf0]'} shadow-[0_0.6vh_0_rgba(0,0,0,0.2)]`}
              style={{ width: sq, height: sq }}
              animate={lit && !reduce ? { scale: [1, 1.08, 1] } : {}} transition={{ duration: 0.8, repeat: lit ? Infinity : 0 }}
              whileTap={v ? {} : { scale: 0.93 }}>
              {!v && (s.img
                ? <img src={s.img} alt="" draggable={false} className="h-[75%] w-[75%] object-contain opacity-80" />
                : <span className="font-black text-sky-300" style={{ fontSize: 'min(7vh, 5vw)' }}>?</span>)}
              {v === 1 && (
                <motion.span initial={reduce ? false : { scale: 2.2, rotate: -40 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 360, damping: 13 }} style={{ fontSize: 'min(10vh, 7vw)' }}>⭐</motion.span>
              )}
              {v === 2 && (
                <motion.img src={scene.opponentImg} alt="" draggable={false} className="h-[82%] w-[82%] object-contain"
                  initial={reduce ? false : { y: '-120%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 15 }} />
              )}
            </motion.button>
          );
        })}
      </motion.div>
      </div>
      {/* the question for the chosen square */}
      <AnimatePresence>
        {q && !done && (
          <motion.div key={open} className="absolute inset-x-[10%] bottom-[3%] z-40 rounded-[3vh] border-[0.6vh] border-white bg-white/95 p-[2vh] text-center shadow-2xl"
            initial={reduce ? false : { y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}>
            <button type="button" onClick={() => cueSpeak(q.ask, voiceOf(scene.who))} className="mb-[1.4vh] font-black text-[#3b2410]" style={{ fontSize: 'min(4.4vh, 3vw)' }}>
              {q.ask} <span className="text-[0.7em]">🔊</span>
            </button>
            <div className="flex flex-wrap justify-center gap-[1.4vw]">
              {q.choices.map((c, ci) => (
                <motion.button key={ci} type="button" onClick={() => answer(ci)} whileTap={{ scale: 0.93 }}
                  animate={state.wrong === ci ? { x: [0, -10, 10, -6, 0] } : {}}
                  className="rounded-[2vh] border-[0.4vh] border-white bg-gradient-to-b from-sky-400 to-sky-600 px-[2.2vw] py-[1.2vh] font-black text-white shadow-[0_0.7vh_0_rgba(0,0,0,0.25)]"
                  style={{ fontSize: 'min(3.6vh, 2.4vw)' }}>{c}</motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {done && <button type="button" onClick={onNext} className={`${CLAY_BUTTON} absolute bottom-[5%] left-1/2 z-40 -translate-x-1/2 px-10 py-3 text-xl`}>Next ⭐</button>}
    </div>
  );
}
