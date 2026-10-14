import { useEffect, useMemo, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../../unit1/audio';
import * as sfx from '../../unit1/sfx';
import { Confetti } from '../../unit1/fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { voiceOf } from './shared';
import { cellsOf, layoutCrossword } from './crosswordRules';
import { CLAY_BUTTON, THICK_WORDS } from '../../unit1/scene-components/shared';

/* ---------- Picture Crossword (Wordwall "Crossword", for young readers — docs/a1-activity-library.md §11) ----------
 * A small crossword whose clues are pictures. The child taps a picture (or a square), its row of squares lights up,
 * and a letter tray offers that word's letters plus two extra ones. Tapping letters fills the squares in order; shared
 * squares are filled already when the crossing word is done. A finished word glows and is said ("Cap! Leo's red
 * cap."). Mechanics: Wordwall Crossword, Duolingo ABC spelling, picture-clue crosswords in Cambridge Starters
 * practice books. Better: picture clues (no reading needed to know the word), a short letter tray instead of a
 * keyboard, crossing letters help the next word, every word is heard when it is done. */

type Cross = Extract<Scene, { kind: 'crossword' }>;
const EXTRA = 'aeioustrnm';

export function CrosswordScene({ scene, onNext, onWin, onLose, sync }: { scene: Cross; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void; sync?: ActivitySync }) {
  const reduce = useReducedMotion();
  const layout = useMemo(() => layoutCrossword(scene.words.map((w) => w.word)), [scene.words]);
  const [state, setState] = useSyncedState(sync, { sel: 0, filled: [''] as string[], wrong: '', done: false });
  const filled = useMemo(() => new Set(Array.isArray(state.filled) ? state.filled.filter(Boolean) : []), [state.filled]);
  const placed = layout.placed;
  const sel = placed.find((p) => p.index === Number(state.sel)) ?? placed[0];
  const selCells = sel ? cellsOf(sel) : [];
  const nextCell = selCells.find((k) => !filled.has(k));
  const wordDone = (i: number) => { const p = placed.find((q) => q.index === i); return !!p && cellsOf(p).every((k) => filled.has(k)); };
  const done = !!state.done;
  const gemDone = useRef(false);

  // the tray: the selected word's letters + two extras, in a fixed order
  const tray = useMemo(() => {
    if (!sel) return [];
    const extras = [...EXTRA].filter((c) => !sel.word.toLowerCase().includes(c)).slice((sel.index * 3) % 6, (sel.index * 3) % 6 + 2);
    return [...new Set([...sel.word.toLowerCase(), ...extras])].sort();
  }, [sel]);

  useEffect(() => {
    if (done) return undefined;
    const w = scene.words[sel?.index ?? 0];
    const t = window.setTimeout(() => cueSpeak(sel && wordDone(sel.index) ? 'Pick a picture!' : 'What is it? Spell it!', voiceOf(scene.who)), 500);
    const t2 = w && sel && !wordDone(sel.index) ? window.setTimeout(() => cueSpeak(w.word, voiceOf(scene.who)), 1900) : undefined;
    return () => { window.clearTimeout(t); if (t2) window.clearTimeout(t2); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.sel, done]);
  useEffect(() => {
    if (done && !gemDone.current) { gemDone.current = true; sfx.gem(); onWin(true); cueSpeak(scene.doneLine, voiceOf(scene.who)); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const choose = (i: number) => { if (done) return; sfx.click(); setState((s) => ({ ...s, sel: i })); };
  const tapCell = (k: string) => {
    const across = placed.find((p) => p.across && cellsOf(p).includes(k) && !wordDone(p.index));
    const down = placed.find((p) => !p.across && cellsOf(p).includes(k) && !wordDone(p.index));
    const p = across ?? down;
    if (p) choose(p.index);
  };
  const type = (c: string) => {
    if (!sel || !nextCell || done) return;
    if (layout.cells.get(nextCell)?.toLowerCase() !== c) {
      sfx.wrong(); onLose();
      setState((s) => ({ ...s, wrong: c }));
      window.setTimeout(() => setState((s) => ({ ...s, wrong: '' })), 600);
      return;
    }
    sfx.pop();
    const after = new Set(filled); after.add(nextCell);
    const finished = selCells.every((k) => after.has(k));
    const allDone = [...layout.cells.keys()].every((k) => after.has(k));
    let nextSel = sel.index;
    if (finished) {
      sfx.match();
      cueSpeak(scene.words[sel.index]?.say ?? sel.word, 'teacher');
      const todo = placed.find((p) => !cellsOf(p).every((k) => after.has(k)));
      if (todo) nextSel = todo.index;
    }
    setState((s) => ({ ...s, filled: [...after], wrong: '' }));
    if (allDone) window.setTimeout(() => setState((s) => ({ ...s, done: true })), 1800);
    else if (finished) window.setTimeout(() => setState((s) => ({ ...s, sel: nextSel })), 1800);
  };

  const numberAt = new Map(placed.map((p, n) => [`${p.row},${p.col}`, n + 1]));
  return (
    <div className="absolute inset-0 select-none overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="absolute inset-0 bg-black/25" />
      {done && <Confetti count={90} />}
      <div className="pointer-events-none absolute inset-x-0 top-[5%] z-30 flex justify-center px-14">
        <span className="text-center font-black text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.1rem, min(calc(2.6*var(--svw,1vw)), 4.4vh), 2.1rem)' }}>
          {done ? scene.doneLine : `✏️ ${scene.title}`}
        </span>
      </div>
      {/* the grid */}
      <div className="absolute bottom-[4%] left-[3%] top-[15%] z-20 flex w-[50%] items-center justify-center">
        <div className="grid max-h-full max-w-full gap-[0.5vh] rounded-[2vh] bg-white/15 p-[1vh] backdrop-blur-sm"
          style={{ gridTemplateColumns: `repeat(${layout.cols}, 1fr)`, aspectRatio: `${layout.cols} / ${layout.rows}`, height: '100%' }}>
          {Array.from({ length: layout.rows * layout.cols }, (_, i) => {
            const r = Math.floor(i / layout.cols); const c = i % layout.cols; const k = `${r},${c}`;
            const letter = layout.cells.get(k);
            if (!letter) return <span key={k} />;
            const on = selCells.includes(k) && !done;
            const isNext = k === nextCell && !done;
            const has = filled.has(k);
            return (
              <motion.button key={k} type="button" onClick={() => tapCell(k)}
                className={`relative grid aspect-square place-items-center rounded-[1vh] border-[0.35vh] font-black shadow ${on ? 'border-amber-400 bg-amber-50' : 'border-slate-300 bg-white'} ${isNext ? 'ring-[0.5vh] ring-amber-400' : ''}`}
                animate={has && !reduce ? { scale: [1, 1.12, 1] } : {}} transition={{ duration: 0.3 }}>
                {numberAt.has(k) && <span className="absolute left-[8%] top-[2%] font-black text-slate-400" style={{ fontSize: 'min(1.6vh, 1.1vw)' }}>{numberAt.get(k)}</span>}
                {has && <span className="uppercase text-slate-800" style={{ fontSize: 'min(4.4vh, 2.9vw)' }}>{letter}</span>}
              </motion.button>
            );
          })}
        </div>
      </div>
      {/* the picture clues */}
      <div className="absolute right-[3%] top-[14%] z-30 flex w-[43%] flex-wrap justify-center gap-[1vh]">
        {placed.map((p, n) => {
          const w = scene.words[p.index];
          const isSel = sel?.index === p.index;
          const fin = wordDone(p.index);
          return (
            <motion.button key={p.index} type="button" onClick={() => choose(p.index)} whileTap={{ scale: 0.94 }}
              className={`relative flex h-[min(15vh,10vw)] w-[min(15vh,10vw)] flex-col items-center justify-center rounded-[2vh] border-[0.5vh] bg-white shadow-lg ${isSel && !done ? 'border-amber-400 ring-[0.5vh] ring-amber-300' : fin ? 'border-emerald-400' : 'border-white'}`}>
              <span className="absolute left-[6%] top-[3%] font-black text-slate-500" style={{ fontSize: 'min(2.2vh, 1.5vw)' }}>{n + 1}{p.across ? '→' : '↓'}</span>
              <img src={w?.img} alt="" draggable={false} className={`h-[72%] w-[80%] object-contain ${fin ? 'opacity-60' : ''}`} />
              {fin && <span className="absolute bottom-[3%] right-[6%] text-[min(3vh,2vw)]">✅</span>}
            </motion.button>
          );
        })}
      </div>
      {/* the letter tray */}
      {!done && sel && !wordDone(sel.index) && (
        <div className="absolute bottom-[5%] right-[3%] z-30 w-[43%] rounded-[2.4vh] border-[0.5vh] border-amber-200 bg-amber-50/95 p-[1.4vh] shadow-2xl">
          <div className="mb-[0.8vh] flex items-center justify-center gap-2 font-black text-amber-800" style={{ fontSize: 'min(2.6vh, 1.8vw)' }}>
            <button type="button" onClick={() => { sfx.click(); cueSpeak(scene.words[sel.index]?.word ?? '', voiceOf(scene.who)); }}>🔊 Spell it!</button>
          </div>
          <div className="flex flex-wrap justify-center gap-[0.8vw]">
            {tray.map((c) => (
              <motion.button key={c} type="button" onClick={() => type(c)} whileTap={{ scale: 0.9 }} animate={state.wrong === c ? { x: [0, -8, 8, -5, 0] } : {}}
                className="grid h-[min(8vh,5.4vw)] w-[min(8vh,5.4vw)] place-items-center rounded-[1.4vh] border-[0.4vh] border-white bg-gradient-to-b from-amber-400 to-orange-500 font-black text-white shadow-[0_0.6vh_0_rgba(0,0,0,0.2)]"
                style={{ fontSize: 'min(4.4vh, 2.9vw)' }}>{c}</motion.button>
            ))}
          </div>
        </div>
      )}
      {done && <button type="button" onClick={onNext} className={`${CLAY_BUTTON} absolute bottom-[8%] left-1/2 z-40 -translate-x-1/2 px-10 py-3 text-xl`}>Next ⭐</button>}
    </div>
  );
}
