import { useEffect, useMemo, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../../unit1/audio';
import * as sfx from '../../unit1/sfx';
import { Confetti } from '../../unit1/fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { voiceOf } from './shared';
import { CLAY_BUTTON, THICK_WORDS } from '../../unit1/scene-components/shared';

/* ---------- Sticker Bingo (classic Bingo, modern design — docs/a1-activity-library.md §11) ----------
 * A 3×3 bingo card of pictures. The voice calls a whole SENTENCE ("She is sad."); the child finds the picture and
 * stamps it — a round sticker pops onto the card with a bounce. Every line of three that fills glows and the caller
 * shouts "Bingo!"; the card is won when every call is stamped. A wrong picture only wobbles and the call is repeated.
 * Mechanics: classroom Bingo (esl-kids.com, eslactive.com), Baamboozle's Bingo mode, Wordwall "Find the match".
 * Better: the call is a sentence, not a single word, so the child listens for the meaning (who + feeling / animal +
 * action); stickers stay on the card; no race against other players and no "loser". */

type Bingo = Extract<Scene, { kind: 'sticker-bingo' }>;
const LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
const STICKER = ['⭐', '🌟', '💖', '🎈', '🍀', '🌈', '🦋', '🍭', '🎉'];

export function StickerBingoScene({ scene, onNext, onWin, onLose, sync }: { scene: Bingo; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void; sync?: ActivitySync }) {
  const reduce = useReducedMotion();
  const cells = scene.cells.slice(0, 9);
  const calls = scene.calls.filter((c) => Number.isInteger(c) && c >= 0 && c < cells.length);
  const total = calls.length;
  const [state, setState] = useSyncedState(sync, { round: 0, stamped: [-1] as number[], wrong: -1, done: false });
  const roundIdx = Math.max(0, Math.min(total - 1, Number(state.round) || 0));
  const target = calls[roundIdx];
  const stamped = useMemo(() => (Array.isArray(state.stamped) ? state.stamped.filter((n) => typeof n === 'number' && n >= 0) : []), [state.stamped]);
  const stampedSet = useMemo(() => new Set(stamped), [stamped]);
  const lines = LINES.filter((l) => l.every((i) => i < cells.length && stampedSet.has(i)));
  const lineCells = new Set(lines.flat());
  const done = !!state.done;
  const busy = useRef(false);
  const gemDone = useRef(false);
  const lineCount = useRef(0);

  const call = () => { const c = cells[target]; if (c) cueSpeak(c.say, voiceOf(scene.who)); };
  useEffect(() => {
    if (done || target === undefined) return undefined;
    busy.current = false;
    const t = window.setTimeout(call, 650);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundIdx, done]);
  useEffect(() => {
    if (lines.length > lineCount.current) { lineCount.current = lines.length; if (!done) { sfx.whoop(); cueSpeak('Bingo!', voiceOf(scene.who)); } }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lines.length]);
  useEffect(() => {
    if (done && !gemDone.current) { gemDone.current = true; sfx.gem(); onWin(true); cueSpeak(scene.doneLine, voiceOf(scene.who)); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const tap = (i: number) => {
    if (done || busy.current || stampedSet.has(i) || target === undefined) return;
    if (i !== target) {
      sfx.wrong(); onLose();
      setState((s) => ({ ...s, wrong: i }));
      window.setTimeout(() => setState((s) => ({ ...s, wrong: -1 })), 600);
      window.setTimeout(call, 700);
      return;
    }
    busy.current = true;
    sfx.pop(); sfx.match();
    setState((s) => ({ ...s, stamped: [...(Array.isArray(s.stamped) ? s.stamped.filter((n) => n >= 0) : []), i] }));
    window.setTimeout(() => setState((s) => {
      const next = (Number(s.round) || 0) + 1;
      return next >= total ? { ...s, done: true } : { ...s, round: next };
    }), 1400);
  };

  return (
    <div className="absolute inset-0 select-none overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="absolute inset-0 bg-black/10" />
      {done && <Confetti count={70} />}
      <div className="pointer-events-none absolute inset-x-0 top-[7%] z-30 flex justify-center px-14">
        <span className="text-center font-black text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.1rem, min(calc(2.6*var(--svw,1vw)), 4.4vh), 2.1rem)' }}>
          {done ? scene.doneLine : `🎱 ${scene.title}`}
        </span>
      </div>
      {!done && target !== undefined && (
        <button type="button" onClick={call} aria-label="Hear it again"
          className="absolute right-3 top-[14%] z-30 flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 font-black text-orange-700 shadow-lg active:scale-95" style={{ fontSize: 'min(3vh, 2vw)' }}>
          🔊 Listen! <span className="text-neutral-400">{roundIdx + 1}/{total}</span>
        </button>
      )}
      {/* the bingo card */}
      <div className="absolute left-1/2 top-[57%] z-20 -translate-x-1/2 -translate-y-1/2 rounded-[3vh] border-[0.8vh] border-white bg-gradient-to-b from-fuchsia-500 to-violet-600 p-[1.4vh] shadow-2xl"
        style={{ width: 'min(64vh, 58vw)' }}>
        <div className="mb-[1vh] grid grid-cols-5 text-center font-black tracking-widest text-white" style={{ fontSize: 'min(4.4vh, 3vw)', textShadow: '0 3px 0 rgba(0,0,0,0.25)' }}>
          {'BINGO'.split('').map((l) => <span key={l}>{l}</span>)}
        </div>
        <div className="grid grid-cols-3 gap-[1.2vh]">
          {cells.map((c, i) => {
            const hit = stampedSet.has(i);
            const inLine = lineCells.has(i);
            return (
              <motion.button key={i} type="button" onClick={() => tap(i)} aria-label={c.label}
                className={`relative aspect-square overflow-hidden rounded-[2vh] border-[0.5vh] bg-[#fffaf0] shadow-[0_0.6vh_0_rgba(0,0,0,0.2)] ${inLine ? 'border-yellow-300' : 'border-white'}`}
                animate={state.wrong === i ? { x: [0, -10, 10, -6, 0] } : inLine && !reduce ? { boxShadow: ['0 0 0 0 rgba(253,224,71,0.0)', '0 0 2.4vh 0.6vh rgba(253,224,71,0.9)', '0 0 0 0 rgba(253,224,71,0.0)'] } : {}}
                transition={state.wrong === i ? { duration: 0.5 } : { duration: 1.6, repeat: inLine ? Infinity : 0 }}
                whileTap={{ scale: 0.94 }}>
                <img src={c.img} alt="" draggable={false} className={`h-full w-full object-contain p-[0.8vh] transition-opacity ${hit ? 'opacity-45' : ''}`} />
                {hit && (
                  <motion.span className="absolute inset-0 grid place-items-center" initial={reduce ? false : { scale: 2.4, rotate: -30, opacity: 0 }} animate={{ scale: 1, rotate: -8, opacity: 1 }} transition={{ type: 'spring', stiffness: 380, damping: 14 }}>
                    <span className="grid aspect-square w-[62%] place-items-center rounded-full border-[0.5vh] border-white bg-gradient-to-b from-amber-300 to-orange-500 shadow-xl" style={{ fontSize: 'min(6vh, 4vw)' }}>
                      {STICKER[i % STICKER.length]}
                    </span>
                  </motion.span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
      {lines.length > 0 && !done && (
        <motion.div key={lines.length} className="pointer-events-none absolute left-[4%] top-1/2 z-30 rounded-full bg-yellow-300 px-5 py-2 font-black text-violet-800 shadow-xl" style={{ fontSize: 'min(4vh, 2.8vw)' }}
          initial={reduce ? false : { scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: -8 }}>
          BINGO! ×{lines.length}
        </motion.div>
      )}
      {done && <button type="button" onClick={onNext} className={`${CLAY_BUTTON} absolute bottom-[5%] left-1/2 z-40 -translate-x-1/2 px-10 py-3 text-xl`}>Next ⭐</button>}
    </div>
  );
}
