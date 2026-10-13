import { useEffect, useMemo, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { Confetti } from '../fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { CLAY_BUTTON, THICK_WORDS, sayWithin } from './shared';
import { Bursts, useBursts } from './gameFx';
import { MAZE_COLS, MAZE_LAYOUTS, MAZE_ROWS, mazeCells, mazeNeighbours } from '../mazeLayouts';

const HEDGE = '/lep1/maze/hedge.png';
const PATH = '/lep1/maze/path.png';

/* ---------- Picture Maze (extra practice, owner 2026-10-12: "Add also maze game. It should be well illustrated.") ----------
 * A painted hedge maze seen from above (Canva hedge + path tiles). Three of the lesson's pictures wait at the ends of the
 * maze. The voice says "Find the cow!" and the child walks their friend through the hedges one step at a time (tap a
 * glowing footprint next to the walker, or the arrow keys) to that picture. The right picture = stars, the friend says
 * the sentence, next round; a wrong picture = gentle "That's the pig! Find the cow." and the child walks on. No timer.
 * Sources (mechanic only): printable picture mazes for young learners (Twinkl "Hello & Goodbye Maze", eslvault picture
 * mazes, Tools for Educators maze maker: pictures placed along the path). Better: the target is only HEARD (listening,
 * not reading), the maze has three picture ends so the word decides the way, every step is a tap a 4-year-old can do,
 * and both screens walk together. */

type Maze = Extract<Scene, { kind: 'picture-maze' }>;

export function PictureMazeScene({ scene, onWin, onNext, sync }: { scene: Maze; onWin: (gem: boolean) => void; onNext: () => void; sync?: ActivitySync }) {
  const reduce = useReducedMotion();
  const layout = MAZE_LAYOUTS[(scene.layout ?? 0) % MAZE_LAYOUTS.length];
  const { start, goals, open } = useMemo(() => mazeCells(layout), [layout]);
  const total = scene.rounds.length;
  const [state, setState] = useSyncedState(sync, { round: 0, pos: start, wrong: -1, gemDone: false });
  const round = Math.max(0, Math.min(total, Number(state.round) || 0));
  const done = round >= total;
  const target = done ? undefined : scene.rounds[round];
  const goalItem = (i: number) => { const g = goals.indexOf(i); return g >= 0 ? scene.items[g] : undefined; };
  const pos = Number.isInteger(state.pos) && open(Number(state.pos)) ? Number(state.pos) : start;
  const steps = done ? [] : mazeNeighbours(pos).filter(open);
  const busy = useRef(false);
  const [bursts, fire] = useBursts();
  const xy = (i: number) => ({ x: ((i % MAZE_COLS) + 0.5) * (100 / MAZE_COLS), y: (Math.floor(i / MAZE_COLS) + 0.5) * (100 / MAZE_ROWS) });

  const ask = () => { if (target !== undefined && scene.items[target]) cueSpeak(`Find the ${scene.items[target].label}!`, scene.who); };
  useEffect(() => {
    busy.current = false;
    if (done) return undefined;
    const t = window.setTimeout(ask, 700);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, done]);

  const step = async (to: number) => {
    if (done || busy.current || !steps.includes(to)) return;
    sfx.click();
    const item = goalItem(to);
    const g = goals.indexOf(to);
    if (!item) { setState((s) => ({ ...s, pos: to, wrong: -1 })); return; }
    busy.current = true;
    if (g === target) {
      sfx.match(); const p = xy(to); fire(p.x, p.y, 'stars');
      setState((s) => ({ ...s, pos: to, wrong: -1 }));
      await sayWithin(item.say, scene.who, 2600);
      const next = round + 1;
      if (next >= total && !state.gemDone) { fire(50, 45, 'confetti'); sfx.gem(); onWin(true); void sayWithin(scene.doneLine, scene.who, 2600); }
      setState((s) => ({ ...s, round: next, pos: start, wrong: -1, gemDone: s.gemDone || next >= total }));
    } else {
      sfx.wrong();
      setState((s) => ({ ...s, pos: to, wrong: to }));
      const want = target !== undefined ? scene.items[target] : undefined;
      await sayWithin(`That's the ${item.label}! Find the ${want?.label ?? ''}.`, scene.who, 3000);
      busy.current = false;
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const d: Record<string, number> = { ArrowUp: -MAZE_COLS, ArrowDown: MAZE_COLS, ArrowLeft: -1, ArrowRight: 1 };
      if (!(e.key in d)) return;
      const to = pos + d[e.key];
      if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && Math.floor(to / MAZE_COLS) !== Math.floor(pos / MAZE_COLS)) return;
      e.preventDefault(); void step(to);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const w = xy(pos);
  return (
    <div className="absolute inset-0 select-none overflow-hidden bg-emerald-900">
      <div className="absolute inset-0 bg-cover bg-center opacity-80" style={{ backgroundImage: `url(${scene.bg})` }} />
      {done && <Confetti count={70} />}
      <div className="absolute inset-x-0 top-[6%] z-30 flex items-center justify-center gap-3 px-14">
        <span className="text-center font-black text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.1rem, min(calc(2.8*var(--svw,1vw)), 4.6vh), 2.2rem)' }}>
          {done ? scene.doneLine : scene.title}
        </span>
        {!done && <button type="button" onClick={ask} aria-label="Hear it again" className="grid h-[7vh] w-[7vh] place-items-center rounded-full bg-white/95 text-[3.4vh] shadow-lg">🔊</button>}
        {!done && <span className="rounded-full bg-white/90 px-3 py-1 font-black text-emerald-700" style={{ fontSize: 'min(2.6vh, 1.7vw)' }}>{'⭐'.repeat(round)}{'☆'.repeat(Math.max(0, total - round))}</span>}
      </div>

      {/* the maze */}
      <div className="absolute left-1/2 top-[56%] w-[min(86vw,calc(72vh*9/5))] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[2.5vh] border-[0.7vh] border-lime-900/60 shadow-2xl"
        style={{ aspectRatio: `${MAZE_COLS} / ${MAZE_ROWS}`, backgroundImage: `url(${PATH})`, backgroundSize: `${100 / MAZE_COLS}% ${100 / MAZE_ROWS}%`, backgroundColor: '#E9C98B' }}>
        {layout.flatMap((row, r) => [...row].map((ch, c) => {
          const i = r * MAZE_COLS + c;
          const style = { left: `${c * (100 / MAZE_COLS)}%`, top: `${r * (100 / MAZE_ROWS)}%`, width: `${100 / MAZE_COLS}%`, height: `${100 / MAZE_ROWS}%` };
          if (ch === '#') return <img key={i} src={HEDGE} alt="" draggable={false} className="pointer-events-none absolute scale-[1.18] object-cover" style={style} />;
          const item = goalItem(i);
          const canStep = steps.includes(i);
          return (
            <button key={i} type="button" onClick={() => { void step(i); }} disabled={!canStep} aria-label={canStep ? (item ? item.label : 'Step here') : undefined}
              className="absolute grid place-items-center" style={style}>
              {ch === 'S' && <span className="text-[min(5vh,3vw)] opacity-80">🚪</span>}
              {item && (
                <motion.img src={item.img} alt={item.label} draggable={false}
                  className={`h-[92%] w-[92%] rounded-[1.4vh] bg-white/85 object-contain p-[6%] shadow-lg ring-[0.5vh] ${state.wrong === i ? 'ring-rose-300' : 'ring-amber-300'}`}
                  animate={reduce ? {} : state.wrong === i ? { x: [0, -6, 6, -4, 0] } : { y: [0, -4, 0] }}
                  transition={state.wrong === i ? { duration: 0.4 } : { duration: 1.8, repeat: Infinity }} />
              )}
              {canStep && !item && (
                <motion.span className="h-[46%] w-[46%] rounded-full border-[0.45vh] border-white bg-yellow-300/80 shadow"
                  animate={reduce ? {} : { scale: [0.85, 1.1, 0.85], opacity: [0.7, 1, 0.7] }} transition={{ duration: 1.1, repeat: Infinity }} />
              )}
              {canStep && item && <span className="pointer-events-none absolute inset-[4%] rounded-[1.4vh] border-[0.5vh] border-dashed border-yellow-200" />}
            </button>
          );
        }))}
        {/* the walker */}
        <motion.img src={scene.walker} alt="" draggable={false} className="pointer-events-none absolute z-20 object-contain drop-shadow-[0_0.8vh_0.6vh_rgba(0,0,0,0.4)]"
          style={{ width: `${100 / MAZE_COLS * 1.05}%`, aspectRatio: '1', translate: '-50% -62%' }}
          animate={{ left: `${w.x}%`, top: `${w.y}%`, rotate: reduce ? 0 : [0, -8, 8, 0] }}
          transition={{ type: 'spring', stiffness: 220, damping: 20, rotate: { duration: 0.35 } }} />
        <Bursts items={bursts} />
      </div>

      {done && (
        <motion.div className="absolute inset-x-0 bottom-[4%] z-40 flex justify-center" initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8, type: 'spring' }}>
          <button onClick={onNext} className={`${CLAY_BUTTON} px-10 py-3 text-xl`}>Next ⭐</button>
        </motion.div>
      )}
    </div>
  );
}
