import { useEffect, useMemo, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../../unit1/audio';
import * as sfx from '../../unit1/sfx';
import { Confetti } from '../../unit1/fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { QuestionCard, voiceOf } from './shared';
import { CLAY_BUTTON, THICK_WORDS } from '../../unit1/scene-components/shared';
import { CalmBg } from '../../unit1/scene-components/gameFx';
import { SKIN, jewel } from '../../gameSkin';

/* ---------- Quiz Board (Jeopardy / Baamboozle board, modern design — docs/a1-activity-library.md §12) ----------
 * A glowing game-show board: one column per category, tiles worth 100 / 200 / 300. The child picks any tile, it
 * flips to its question; a right answer adds the points to the score (a wrong one only says "Try again!" — no points
 * are ever taken away). One tile is a surprise "BOOM!" tile that doubles its points. The board is done when every
 * tile is answered. Mechanics: Jeopardy, Baamboozle (one shared screen, teacher-led), Kahoot points. Better: the
 * child chooses what to answer (agency), harder questions are worth more, no negative scores, no rivals. */

type Board = Extract<Scene, { kind: 'quiz-board' }>;

export function QuizBoardScene({ scene, onNext, onWin, onLose, sync }: { scene: Board; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void; sync?: ActivitySync }) {
  const reduce = useReducedMotion();
  const cats = scene.categories.slice(0, 4);
  const rows = Math.max(...cats.map((c) => c.tiles.length), 0);
  const all = cats.flatMap((c, ci) => c.tiles.map((_, ri) => `${ci}-${ri}`));
  const [state, setState] = useSyncedState(sync, { answered: [''] as string[], open: '', wrong: -1, score: 0, boom: false, done: false });
  const answered = useMemo(() => new Set(Array.isArray(state.answered) ? state.answered.filter(Boolean) : []), [state.answered]);
  const [oc, or] = (state.open || '').split('-').map(Number);
  const tile = state.open ? cats[oc]?.tiles[or] : undefined;
  const isBoom = (ci: number, ri: number) => !!scene.boom && scene.boom[0] === ci && scene.boom[1] === ri;
  const done = !!state.done;
  const gemDone = useRef(false);

  useEffect(() => {
    const t = window.setTimeout(() => cueSpeak('Pick a tile! Big points, big questions!', voiceOf(scene.who)), 600);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => { if (tile) cueSpeak(tile.ask, voiceOf(scene.who)); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [state.open]);
  useEffect(() => {
    if (done && !gemDone.current) { gemDone.current = true; sfx.gem(); onWin(true); cueSpeak(scene.doneLine, voiceOf(scene.who)); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const pickTile = (key: string) => {
    if (done || state.open || answered.has(key)) return;
    const [ci, ri] = key.split('-').map(Number);
    sfx.reveal();
    if (isBoom(ci, ri)) { sfx.whoop(); cueSpeak('Boom! Double points!', voiceOf(scene.who)); }
    setState((s) => ({ ...s, open: key, wrong: -1, boom: isBoom(ci, ri) }));
  };
  const answer = (c: number) => {
    if (!tile) return;
    if (c !== tile.answer) {
      sfx.wrong(); onLose();
      cueSpeak('Try again!', voiceOf(scene.who));
      setState((s) => ({ ...s, wrong: c }));
      window.setTimeout(() => setState((s) => ({ ...s, wrong: -1 })), 600);
      return;
    }
    sfx.match(); sfx.gem();
    cueSpeak(tile.choices[c], 'teacher');
    const pts = (or + 1) * 100 * (isBoom(oc, or) ? 2 : 1);
    const key = state.open;
    setState((s) => {
      const list = [...(Array.isArray(s.answered) ? s.answered.filter(Boolean) : []), key];
      return { ...s, answered: list, open: '', boom: false, score: (Number(s.score) || 0) + pts, done: list.length >= all.length };
    });
  };

  return (
    <div className="absolute inset-0 select-none overflow-hidden">
      <CalmBg img={scene.bg} />
      {done && <Confetti count={90} />}
      <div className="pointer-events-none absolute inset-x-0 top-[5%] z-30 flex justify-center px-14">
        <span className="text-center font-black text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.1rem, min(calc(2.6*var(--svw,1vw)), 4.4vh), 2.1rem)' }}>
          {done ? scene.doneLine : `🏆 ${scene.title}`}
        </span>
      </div>
      <motion.span key={Number(state.score) || 0} className="absolute end-3 top-[13%] z-30 rounded-full border-[0.3vh] border-white bg-gradient-to-b from-[#FDE68A] to-[#F59E0B] px-5 py-2 font-black text-[#2A1A05] shadow-[0_0.6vh_0_#B45309,0_1.2vh_2vh_rgba(60,30,10,0.35)]" style={{ fontSize: 'min(3.4vh, 2.3vw)' }}
        initial={reduce ? false : { scale: 1.4 }} animate={{ scale: 1 }}>⭐ {Number(state.score) || 0}</motion.span>
      {/* the board */}
      <div className={`absolute inset-x-[6%] bottom-[5%] top-[20%] z-20 grid gap-[1.2vh] p-[1.8vh] ${SKIN.frame}`}
        style={{ gridTemplateColumns: `repeat(${cats.length}, minmax(0, 1fr))`, gridTemplateRows: `auto repeat(${rows}, minmax(0, 1fr))` }}>
        {cats.map((c, ci) => (
          <div key={`h${ci}`} className={`flex items-center justify-center gap-2 rounded-[1.6vh] px-2 py-[1vh] text-center font-black ${jewel(ci)}`} style={{ fontSize: 'min(2.8vh, 1.9vw)' }}>
            <span>{c.emoji}</span><span>{c.name}</span>
          </div>
        ))}
        {Array.from({ length: rows }, (_, ri) => cats.map((c, ci) => {
          const key = `${ci}-${ri}`;
          const exists = !!c.tiles[ri];
          const got = answered.has(key);
          return exists ? (
            <motion.button key={key} type="button" onClick={() => pickTile(key)} disabled={got}
              className={`grid place-items-center font-black ${got ? 'rounded-[1.6vh] border-[0.3vh] border-[#FEAF15]/30 bg-white/10 text-[#FEAF15]/70' : `${SKIN.card} ${SKIN.ink}`}`}
              style={{ fontSize: 'min(5vh, 3.4vw)', gridColumn: ci + 1, gridRow: ri + 2 }}
              whileHover={got || reduce ? {} : { scale: 1.04 }} whileTap={got ? {} : { scale: 0.95 }}>
              {got ? '✓' : (ri + 1) * 100}
            </motion.button>
          ) : <div key={key} style={{ gridColumn: ci + 1, gridRow: ri + 2 }} />;
        }))}
      </div>
      {/* the open tile */}
      <AnimatePresence>
        {tile && !done && (
          <motion.div key={state.open} className="absolute inset-0 z-40 grid place-items-center bg-[#0C2A3F]/65 px-[8%] backdrop-blur-[2px]"
            initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="w-full" initial={reduce ? false : { rotateY: 90, scale: 0.7 }} animate={{ rotateY: 0, scale: 1 }} transition={{ duration: 0.45 }}>
              <div className="mb-[1.4vh] text-center font-black text-yellow-300" style={{ ...THICK_WORDS, fontSize: 'min(4.4vh, 3vw)' }}>
                {state.boom ? '💥 BOOM! ×2 · ' : ''}{cats[oc]?.emoji} {cats[oc]?.name} · {(or + 1) * 100 * (state.boom ? 2 : 1)}
              </div>
              <QuestionCard ask={tile.ask} choices={tile.choices} img={tile.img} wrong={Number(state.wrong)} onPick={answer} onHear={() => cueSpeak(tile.ask, voiceOf(scene.who))} tone="amber" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {done && <button type="button" onClick={onNext} className={`${CLAY_BUTTON} absolute bottom-[8%] left-1/2 z-40 -translate-x-1/2 px-10 py-3 text-xl`}>Next ⭐</button>}
    </div>
  );
}
