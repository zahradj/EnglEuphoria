import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Scene } from '../scenes';
import { CAST } from '../scenes';
import { cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { Confetti } from '../fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { CLAY_BUTTON, STICKER_FILTER, THICK_WORDS, sayWithin } from './shared';
import { Bursts, useBursts } from './gameFx';

/* ---------- My House Board Game (Pre-A1 Unit 6 Lesson 6 signature game) ----------
 * Games night: a board game path from START to HOME through the whole unit —
 * rooms, furniture, coloured furniture, the doors of the story. The child rolls
 * the big dice, Pip hops square by square, and on the square he lands on he
 * asks about its picture ("Where do you sleep?", "What colour is the sofa?");
 * the child answers aloud, then taps the microphone and Pip says the answer
 * too. Researched: classic ESL board games (roll, move, speak on the square —
 * games4esl / teach-this board games), Cambridge Pre A1 Starters Speaking
 * (answer short questions about a picture), Duolingo ABC / Khan Academy Kids
 * path-style progress maps.
 * Better: every square is a picture the child learned in this unit and the
 * question asks for a whole answer, not a word; no snakes, no losing, no
 * clock — the dice only decides WHICH word comes next; the dice numbers are
 * set per lesson so every class lands on a good mix of squares and the game
 * always reaches HOME in a few rolls. */

type Board = Extract<Scene, { kind: 'house-board' }>;
export const BOARD_ROLL = 'Roll the dice!';

const DICE = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

/** Slot k of the snake path (0 = START, last = HOME) in % of the board panel. */
function slotPos(k: number, total: number, cols: number) {
  const rows = Math.ceil(total / cols);
  const row = Math.floor(k / cols);
  const inRow = k % cols;
  const col = row % 2 === 0 ? inRow : cols - 1 - inRow;
  return { x: ((col + 0.5) / cols) * 100, y: ((rows - 1 - row + 0.5) / rows) * 100 };
}

export function HouseBoardScene({ scene, onWin, onNext, sync }: { scene: Board; onWin: (gem: boolean) => void; onNext: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, { pos: 0, turn: 0, die: 0, moving: false, landed: false, said: false, gemDone: false });
  const { pos, turn, die, moving, landed, said, gemDone } = state;
  const total = scene.squares.length + 2;
  const home = total - 1;
  const cols = 5;
  const done = pos >= home;
  const sq = pos > 0 && pos < home ? scene.squares[pos - 1] : undefined;
  const busy = useRef(false);
  const [bursts, fire] = useBursts();

  useEffect(() => {
    const t = window.setTimeout(() => cueSpeak(BOARD_ROLL, scene.who), 700);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene.id]);

  const roll = async () => {
    if (done || moving || (landed && !said) || busy.current) return;
    busy.current = true;
    const value = scene.rolls[turn % scene.rolls.length] ?? 1;
    sfx.pop();
    setState((s) => ({ ...s, die: value, moving: true, landed: false, said: false }));
    await new Promise((r) => window.setTimeout(r, 900));
    let p = pos;
    for (let i = 0; i < value && p < home; i++) {
      p += 1;
      const next = p;
      setState((s) => ({ ...s, pos: next }));
      sfx.pop();
      await new Promise((r) => window.setTimeout(r, 420));
    }
    if (p >= home) {
      setState((s) => ({ ...s, moving: false, turn: s.turn + 1, gemDone: true }));
      const at = slotPos(home, total, cols);
      fire(at.x, at.y, 'confetti');
      sfx.gem();
      if (!gemDone) onWin(true);
      await sayWithin(scene.doneLine, scene.who, 4500);
      busy.current = false;
      return;
    }
    setState((s) => ({ ...s, moving: false, landed: true, turn: s.turn + 1 }));
    const square = scene.squares[p - 1];
    if (square) await sayWithin(square.ask, scene.who, 3500);
    busy.current = false;
  };

  /** The child answered aloud — Pip says it too, then the next roll. */
  const answered = async () => {
    if (!sq || !landed || said || busy.current) return;
    busy.current = true;
    sfx.match();
    const at = slotPos(pos, total, cols);
    fire(at.x, at.y, 'stars');
    setState((s) => ({ ...s, said: true }));
    await sayWithin(sq.say, scene.who, 3500);
    busy.current = false;
    cueSpeak(BOARD_ROLL, scene.who);
  };

  const token = slotPos(Math.min(pos, home), total, cols);
  const canRoll = !done && !moving && (!landed || said);

  return (
    <div className="absolute inset-0 select-none overflow-hidden">
      <img src={scene.bg} alt="" draggable={false} className="pointer-events-none absolute inset-0 h-full w-full object-cover" />
      <div className="pointer-events-none absolute inset-0 bg-indigo-950/35" />
      {done && <Confetti count={80} />}

      <div className="pointer-events-none absolute inset-x-0 top-16 z-30 flex flex-col items-center px-14">
        <span className="text-center font-black leading-tight text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.05rem, min(calc(3.2*var(--svw,1vw)), 5vh), 2.6rem)' }}>
          {done ? scene.doneLine : sq && landed ? sq.ask : `\u{1F3B2} ${BOARD_ROLL}`}
        </span>
      </div>
      {sq && landed && <button onClick={() => cueSpeak(said ? sq.say : sq.ask, scene.who)} aria-label="Hear it again" className="absolute right-3 top-16 z-30 rounded-full bg-white/90 px-4 py-2 text-lg font-black text-orange-700 shadow-lg active:scale-95">{'\u{1F50A}'}</button>}

      {/* The board: a snake path START → squares → HOME. */}
      <div className="absolute left-1/2 top-[calc(50%+36px)] z-10 -translate-x-1/2 -translate-y-1/2 rounded-[28px] border-[6px] border-amber-700 bg-gradient-to-br from-amber-100 to-orange-200 p-2 shadow-[0_18px_40px_rgba(30,10,60,0.45)]"
        style={{ width: 'min(94vw, 100vh, calc((100vh - 190px) * 1.9))', aspectRatio: `${cols} / ${Math.ceil(total / cols) * 0.86}` }}>
        <div className="relative h-full w-full">
          {Array.from({ length: total }, (_, k) => {
            const at = slotPos(k, total, cols);
            const square = k > 0 && k < home ? scene.squares[k - 1] : undefined;
            const isHere = k === pos;
            return (
              <div key={k} className={`absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl border-4 shadow ${k === 0 ? 'border-lime-500 bg-lime-200' : k === home ? 'border-rose-500 bg-rose-200' : isHere && landed ? 'border-yellow-400 bg-yellow-100' : 'border-white bg-white/90'}`}
                style={{ left: `${at.x}%`, top: `${at.y}%`, width: `${88 / cols}%`, height: `${80 / Math.ceil(total / cols)}%` }}>
                {k === 0 && <span className="text-[min(2.6vh,1.8vw)] font-black text-lime-800">START</span>}
                {k === home && <span className="text-[min(6vh,4vw)]">{'\u{1F3E0}'}</span>}
                {square && <img src={square.img} alt={square.label} draggable={false} className="h-[78%] w-[78%] object-contain" style={{ filter: STICKER_FILTER }} />}
              </div>
            );
          })}
          {/* Pip, the board token. */}
          <motion.img src={CAST.pip.img} alt="Pip" draggable={false} className="pointer-events-none absolute z-20 w-[11%] -translate-x-1/2 -translate-y-[85%]"
            style={{ filter: 'drop-shadow(0 6px 6px rgba(0,0,0,0.35))' }}
            animate={{ left: `${token.x}%`, top: `${token.y}%`, y: moving ? [0, -18, 0] : 0 }}
            transition={{ left: { type: 'spring', stiffness: 160, damping: 18 }, top: { type: 'spring', stiffness: 160, damping: 18 }, y: { duration: 0.42, repeat: moving ? Infinity : 0 } }} />
        </div>
      </div>

      {/* The dice. */}
      {!done && (
        <motion.button onClick={() => { void roll(); }} aria-label={BOARD_ROLL} disabled={!canRoll}
          className={`absolute bottom-[4%] left-4 z-40 flex h-[min(15vh,12vw)] w-[min(15vh,12vw)] items-center justify-center rounded-3xl border-b-[6px] border-slate-300 bg-white text-[min(12vh,9vw)] leading-none text-slate-800 shadow-xl ${canRoll ? 'animate-[lep1-hop_1.6s_ease-in-out_infinite]' : 'opacity-70'}`}
          animate={moving && die ? { rotate: [0, 200, 360] } : { rotate: 0 }} transition={{ duration: 0.8 }} whileTap={{ scale: 0.9 }}>
          {die ? DICE[die] : '\u{1F3B2}'}
        </motion.button>
      )}

      {/* Landed: the square's picture, big, and the answer button. */}
      <AnimatePresence>
        {sq && landed && (
          <motion.div key={`sq-${turn}`} className="absolute bottom-[4%] right-3 z-40 flex items-end justify-end gap-2" style={{ maxWidth: 'calc(100vw - min(15vh, 12vw) - 40px)' }} initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} transition={{ type: 'spring', delay: 0.3 }}>
            <img src={sq.img} alt={sq.label} draggable={false} className="h-[min(18vh,14vw)] w-auto shrink-0 rounded-2xl border-4 border-yellow-300 bg-white object-contain p-1 shadow-xl" />
            {!said ? (
              <button onClick={() => { void answered(); }} className={`${CLAY_BUTTON} px-5 py-3 text-lg sm:text-xl`}>{'\u{1F3A4}'} I said it!</button>
            ) : (
              <span className="min-w-0 rounded-2xl bg-white/95 px-3 py-2 text-base font-black leading-tight text-sky-700 shadow sm:px-4 sm:text-xl">{sq.say}</span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <Bursts items={bursts} />
      {done && (
        <motion.div className="absolute inset-x-0 bottom-[6%] z-40 flex justify-center" initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.4, type: 'spring' }}>
          <button onClick={onNext} className={`${CLAY_BUTTON} px-10 py-3 text-xl`}>Next {'⭐'}</button>
        </motion.div>
      )}
    </div>
  );
}

/** Every voiced line, for the clip baker (scripts/generate-voice-cache.mjs mirrors this). */
export function houseBoardLines(scene: Board) {
  return [
    [scene.who, BOARD_ROLL],
    ...scene.squares.flatMap((s) => [[scene.who, s.ask], [scene.who, s.say]]),
    [scene.who, scene.doneLine],
  ] as [string, string][];
}
