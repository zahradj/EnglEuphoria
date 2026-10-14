import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { Confetti } from '../fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { CLAY_BUTTON, THICK_WORDS, sayWithin } from './shared';
import { Bursts, useBursts } from './gameFx';

/* ---------- Word Board (extra practice, owner 2026-10-12: "use the games list and create extra practice … be creative,
 * search the internet for inspiration") ----------
 * A one-to-one review board game: 15 squares on a winding jungle path (START → 13 picture squares → FINISH), two
 * ladders and one slide. Roll the big die (1–3), the walker hops square by square, and on the picture you land on you
 * SAY the word or sentence (🔊 plays the model); then the walker climbs a ladder or whooshes down the slide if it is
 * there. A slide is never a punishment: it is the fun part ("Wheee!") and it means more words to say.
 * Sources (mechanic only): snakes and ladders as a one-to-one ESL review board (Abridge Academy "Top five interactive
 * games for online teaching"), Wordwall "Spin the wheel / flip tiles" speaking reviews, Twinkl online vocabulary
 * games. Better: every move costs a spoken word from THIS lesson, the dice are small (1–3) so a 4-year-old sees every
 * square, both screens roll the same number, and nobody loses. */

type Board = Extract<Scene, { kind: 'word-board' }>;
const N = 15; // squares 0..14: 0 = start, 14 = finish
const COLS = 5;
const DEFAULT_LADDERS: [number, number][] = [[1, 8], [6, 13]];
const DEFAULT_SLIDES: [number, number][] = [[11, 8]];
/** square → % position in the board box (row 0 at the bottom, rows snake left-right-left) */
function at(i: number) {
  const row = Math.floor(i / COLS); const c = i % COLS; const col = row % 2 === 0 ? c : COLS - 1 - c;
  return { x: 12 + col * 19, y: 80 - row * 30 };
}
const DIE = ['', '⚀', '⚁', '⚂'];

export function WordBoardScene({ scene, onWin, onNext, sync }: { scene: Board; onWin: (gem: boolean) => void; onNext: () => void; sync?: ActivitySync }) {
  const reduce = useReducedMotion();
  const ladders = scene.ladders ?? DEFAULT_LADDERS;
  const slides = scene.slides ?? DEFAULT_SLIDES;
  const [state, setState] = useSyncedState(sync, { pos: 0, phase: 'roll', roll: 0, turn: 0, gemDone: false });
  const pos = Math.max(0, Math.min(N - 1, Number(state.pos) || 0));
  const phase = state.phase === 'say' || state.phase === 'done' ? state.phase : 'roll';
  const word = (i: number) => (i > 0 && i < N - 1 ? scene.words[(i - 1) % scene.words.length] : undefined);
  const here = word(pos);
  const busy = useRef(false);
  const [spin, setSpin] = useState(0);
  const [bursts, fire] = useBursts();

  useEffect(() => { busy.current = false; }, [state.turn, phase]);
  useEffect(() => {
    if (phase === 'say' && here) {
      const t = window.setTimeout(() => cueSpeak(scene.ask ?? 'What is it? Say it!', scene.who), 650);
      return () => window.clearTimeout(t);
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.turn, phase]);

  const roll = async () => {
    if (phase !== 'roll' || busy.current) return;
    busy.current = true;
    const n = 1 + Math.floor(Math.random() * 3);
    sfx.click(); setSpin((s) => s + 1);
    await new Promise((r) => window.setTimeout(r, reduce ? 0 : 650));
    const target = Math.min(N - 1, pos + n);
    sfx.pop();
    if (target >= N - 1) {
      fire(at(N - 1).x, at(N - 1).y, 'confetti'); sfx.gem();
      if (!state.gemDone) onWin(true);
      setState((s) => ({ ...s, pos: N - 1, roll: n, phase: 'done', turn: (Number(s.turn) || 0) + 1, gemDone: true }));
      void sayWithin(scene.doneLine, scene.who, 3000);
      return;
    }
    setState((s) => ({ ...s, pos: target, roll: n, phase: 'say', turn: (Number(s.turn) || 0) + 1 }));
  };

  const said = async () => {
    if (phase !== 'say' || busy.current) return;
    busy.current = true;
    sfx.match(); const p = at(pos); fire(p.x, p.y, 'stars');
    const up = ladders.find(([a]) => a === pos);
    const down = slides.find(([a]) => a === pos);
    let next = pos;
    if (up) { next = up[1]; sfx.whoop(); void sayWithin('Up the ladder!', scene.who, 1800); }
    else if (down) { next = down[1]; sfx.whoop(); void sayWithin('Wheee! Down the slide!', scene.who, 1800); }
    setState((s) => ({ ...s, pos: next, phase: 'roll', turn: (Number(s.turn) || 0) + 1 }));
  };

  const tok = at(pos);
  return (
    <div className="absolute inset-0 select-none overflow-hidden bg-emerald-800">
      <div className="absolute inset-0 bg-cover bg-center opacity-70" style={{ backgroundImage: `url(${scene.bg})` }} />
      {phase === 'done' && <Confetti count={70} />}
      <div className="pointer-events-none absolute inset-x-0 top-[8%] z-30 flex justify-center px-14">
        <span className="text-center font-black text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.1rem, min(calc(2.8*var(--svw,1vw)), 4.6vh), 2.2rem)' }}>
          {phase === 'done' ? scene.doneLine : scene.title}
        </span>
      </div>

      {/* the board */}
      <div className="absolute left-1/2 top-[51%] aspect-[16/9] w-[min(80vw,calc(60vh*16/9))] -translate-x-1/2 -translate-y-1/2 rounded-[3vh] border-[0.6vh] border-amber-200/90 bg-lime-100/75 shadow-2xl">
        <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* the path */}
          <polyline fill="none" stroke="#C08A3E" strokeWidth="5" strokeLinejoin="round" strokeLinecap="round" opacity="0.55"
            points={Array.from({ length: N }, (_, i) => `${at(i).x},${at(i).y}`).join(' ')} />
          {ladders.map(([a, b], k) => {
            const p = at(a), q = at(b);
            return (
              <g key={`l${k}`} stroke="#8B5A2B" strokeWidth="0.9" strokeLinecap="round">
                <line x1={p.x - 2.5} y1={p.y} x2={q.x - 2.5} y2={q.y} /><line x1={p.x + 2.5} y1={p.y} x2={q.x + 2.5} y2={q.y} />
                {[0.2, 0.4, 0.6, 0.8].map((t) => <line key={t} x1={p.x - 2.5} y1={p.y + (q.y - p.y) * t} x2={p.x + 2.5} y2={p.y + (q.y - p.y) * t} />)}
              </g>
            );
          })}
          {slides.map(([a, b], k) => {
            const p = at(a), q = at(b);
            return <path key={`s${k}`} d={`M ${p.x} ${p.y} C ${p.x + 9} ${(p.y + q.y) / 2}, ${q.x - 9} ${(p.y + q.y) / 2}, ${q.x} ${q.y}`} fill="none" stroke="#A855F7" strokeWidth="3" strokeLinecap="round" opacity="0.85" />;
          })}
        </svg>
        {Array.from({ length: N }, (_, i) => {
          const p = at(i); const w = word(i);
          const passed = i < pos;
          return (
            <div key={i} className={`absolute grid place-items-center rounded-[1.6vh] border-[0.4vh] shadow-md ${i === pos ? 'border-yellow-300 bg-white' : passed ? 'border-white/70 bg-emerald-50/90' : 'border-white bg-white/90'}`}
              style={{ left: `${p.x}%`, top: `${p.y}%`, width: '12.5%', aspectRatio: '1', translate: '-50% -50%' }}>
              {i === 0 ? <span className="font-black text-emerald-700" style={{ fontSize: 'min(2.6vh, 1.6vw)' }}>START</span>
                : i === N - 1 ? <span style={{ fontSize: 'min(6vh, 4vw)' }}>🏆</span>
                : w ? <img src={w.img} alt="" draggable={false} className="h-[86%] w-[86%] object-contain" /> : null}
              <span className="absolute -left-[8%] -top-[10%] grid h-[30%] w-[30%] place-items-center rounded-full bg-amber-400 font-black text-white" style={{ fontSize: 'min(1.8vh, 1.1vw)' }}>{i + 1}</span>
            </div>
          );
        })}
        {/* the walker */}
        <motion.img src={scene.walker} alt="" draggable={false} className="pointer-events-none absolute z-20 object-contain drop-shadow-[0_1vh_0.8vh_rgba(0,0,0,0.35)]"
          style={{ width: '10%', aspectRatio: '1', translate: '-50% -95%' }}
          animate={{ left: `${tok.x}%`, top: `${tok.y}%`, y: reduce ? 0 : [0, -18, 0] }}
          transition={{ type: 'spring', stiffness: 120, damping: 14, y: { duration: 0.5 } }} />
        <Bursts items={bursts} />
      </div>

      {/* die + say panel */}
      <div className="absolute inset-x-0 bottom-[2%] z-30 flex items-center justify-center gap-4">
        {phase === 'roll' && (
          <motion.button type="button" onClick={() => { void roll(); }} aria-label="Roll the dice" whileTap={{ scale: 0.9 }}
            className="flex items-center gap-3 rounded-[2.5vh] border-[0.5vh] border-white bg-gradient-to-b from-amber-300 to-orange-500 px-6 py-2 font-black text-white shadow-[0_0.8vh_0_rgba(0,0,0,0.25)]"
            style={{ fontSize: 'min(3.6vh, 2.3vw)' }}>
            <motion.span key={spin} animate={reduce ? {} : { rotate: [0, 360, 720] }} transition={{ duration: 0.6 }} style={{ fontSize: '1.6em' }}>
              {DIE[Number(state.roll) || 3] || '🎲'}
            </motion.span>
            Roll!
          </motion.button>
        )}
        <AnimatePresence>
          {phase === 'say' && here && (
            <motion.div key={`say-${state.turn}`} className="flex items-center gap-3 rounded-[2.5vh] bg-white/95 px-4 py-2 shadow-xl"
              initial={reduce ? false : { y: 40, opacity: 0, scale: 0.9 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <img src={here.img} alt="" className="object-contain" style={{ height: 'min(11vh, 7vw)', width: 'min(11vh, 7vw)' }} />
              <button type="button" onClick={() => cueSpeak(here.say, scene.who)} aria-label="Hear it" className="grid h-[7vh] w-[7vh] place-items-center rounded-full bg-sky-100 text-[3.4vh]">🔊</button>
              {here.text
                ? <span className="max-w-[46vw] font-black leading-tight text-[#3b2410]" style={{ fontSize: 'min(4.2vh, 2.7vw)' }}>📖 {here.text}</span>
                : <span className="font-black text-emerald-800" style={{ fontSize: 'min(3.2vh, 2vw)' }}>🗣️ Say it!</span>}
              <button type="button" onClick={() => { void said(); }} className={`${CLAY_BUTTON} px-6 py-2`} style={{ fontSize: 'min(3.2vh, 2vw)' }}>I said it! ✓</button>
            </motion.div>
          )}
        </AnimatePresence>
        {phase === 'done' && (
          <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.8, type: 'spring' }} onClick={onNext} className={`${CLAY_BUTTON} px-10 py-3 text-xl`}>Next ⭐</motion.button>
        )}
      </div>
    </div>
  );
}
