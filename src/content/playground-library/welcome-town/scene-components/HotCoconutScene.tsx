import { useEffect, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../../unit1/audio';
import * as sfx from '../../unit1/sfx';
import { Confetti } from '../../unit1/fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { voiceOf } from './shared';
import { CLAY_BUTTON, THICK_WORDS } from '../../unit1/scene-components/shared';
import { CalmBg, Bursts, useBursts, useShake } from '../../unit1/scene-components/gameFx';

/* ---------- Hot Coconut (classic hot potato, modern design — docs/a1-activity-library.md §11) ----------
 * The friends sit in a circle with a star seat for the child. Tap "Pass!": a coconut hops from seat to seat to a drum
 * beat that slows down… and stops. Whoever holds it gets the question — on the child's seat "Your turn!", on a
 * friend's seat "Help Mia!" — and the child answers in a full sentence. No forfeits, nobody is out; a right answer
 * makes the coconut glow and the next round starts. Mechanics: Hot Potato / Pass It (eslactive.com, classroom ESL),
 * musical pass games. Better: the suspense is in the slowing beat, every stop is a real question, the child helps
 * the friends (and still answers every time).
 *
 * Look (owner 2026-10-16: "improve the illustration, the animation, the aesthetic — polished, well animated, not flat and
 * boring"): Canva-painted pieces in the Playground brand shades — a woven play mat, a puffy cushion under every friend
 * (the child's has an orange star) and a hand drum (`/lep1/stickers/pass-*.png`). The passed object flies in a real
 * arc from seat to seat with a shadow on the mat and a spin, the catcher squashes as they catch it, the drum bounces
 * and sends a beat ring on every pass (slowing down for suspense), a spotlight finds the holder, the question arrives
 * on a storybook card with the holder's face, and a right answer bursts into stars while everybody cheers. */

type Coco = Extract<Scene, { kind: 'hot-coconut' }>;

export function HotCoconutScene({ scene, onNext, onWin, onLose, sync }: { scene: Coco; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void; sync?: ActivitySync }) {
  const reduce = useReducedMotion();
  const seats = scene.seats.length ? scene.seats : [{ name: 'You', img: '' }];
  const n = seats.length;
  const total = scene.rounds.length;
  const [state, setState] = useSyncedState(sync, { round: 0, phase: 'ready', pos: 0, wrong: -1, done: false });
  const round = Math.max(0, Math.min(total - 1, Number(state.round) || 0));
  const r = scene.rounds[round];
  const pos = ((Number(state.pos) || 0) % n + n) % n;
  const done = !!state.done;
  const timers = useRef<number[]>([]);
  const gemDone = useRef(false);
  const [bursts, fire] = useBursts();
  const [shakeCtl, shake] = useShake();
  const prevPos = useRef(pos);
  const hops = useRef(0);
  if (prevPos.current !== pos) hops.current += 1;
  const from = prevPos.current;
  useEffect(() => { prevPos.current = pos; }, [pos]);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);
  useEffect(() => {
    if (state.phase === 'ask' && r) {
      const who = pos === 0 ? 'Your turn!' : `Help ${seats[pos].name}!`;
      cueSpeak(`${who} ${r.ask}`, voiceOf(scene.who));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase, round]);
  useEffect(() => {
    if (done && !gemDone.current) { gemDone.current = true; sfx.gem(); onWin(true); cueSpeak(scene.doneLine, voiceOf(scene.who)); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const pass = () => {
    if (done || state.phase !== 'ready' || !r) return;
    const stop = ((Number(r.stop) || 0) % n + n) % n;
    const hops = n * 2 + ((stop - pos + n) % n); // two laps, then to the stop seat
    setState((s) => ({ ...s, phase: 'passing' }));
    let at = pos;
    let delay = 0;
    for (let h = 1; h <= hops; h++) {
      delay += 160 + Math.round((h / hops) ** 2 * 380); // the beat slows down
      timers.current.push(window.setTimeout(() => {
        at = (at + 1) % n;
        sfx.click();
        setState((s) => ({ ...s, pos: at, phase: h === hops ? 'ask' : 'passing' }));
      }, delay));
    }
  };

  const seatAt = (i: number) => seatPos(i, n);
  const answer = (c: number) => {
    if (!r || state.phase !== 'ask') return;
    if (c !== r.answer) {
      sfx.wrong(); onLose(); shake();
      setState((s) => ({ ...s, wrong: c }));
      window.setTimeout(() => setState((s) => ({ ...s, wrong: -1 })), 600);
      return;
    }
    sfx.match(); sfx.whoop();
    { const h = seatAt(pos); fire(h.x, h.y - 12, 'stars'); }
    cueSpeak(r.choices[c], 'teacher');
    setState((s) => ({ ...s, phase: 'right' }));
    window.setTimeout(() => setState((s) => {
      const next = (Number(s.round) || 0) + 1;
      return next >= total ? { ...s, done: true, phase: 'ready' } : { ...s, round: next, phase: 'ready', wrong: -1 };
    }), 1500);
  };

  const passing = state.phase === 'passing';
  const asking = state.phase === 'ask' || state.phase === 'right';
  const c = seatAt(pos);
  const f = seatAt(from);
  const hopping = passing && from !== pos;
  return (
    <motion.div className="absolute inset-0 select-none overflow-hidden" animate={shakeCtl}>
      {/* The seats and the passed object float over the picture: calm it so they stay the clearest things on screen. */}
      <CalmBg img={scene.bg} />
      <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/20" />
      {done && <Confetti count={70} />}
      <div className="pointer-events-none absolute inset-x-0 top-[5%] z-30 flex justify-center px-14">
        <motion.span className="text-center font-black text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.1rem, min(calc(2.6*var(--svw,1vw)), 4.4vh), 2.1rem)' }}
          initial={reduce ? false : { y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          {done ? scene.doneLine : `${scene.coconutImg ? '' : '🥥 '}${scene.title}`}
        </motion.span>
      </div>
      {!done && (
        <span className="absolute right-3 top-[13%] z-30 flex items-center gap-1 rounded-full border-[0.3vh] border-[#FEAF15] bg-[#FEFBDD] px-3 py-1 font-black text-amber-800 shadow-lg" style={{ fontSize: 'min(3vh, 2vw)' }}>
          {scene.rounds.map((_, i) => <span key={i} className={`transition ${i < round || (i === round && state.phase === 'right') ? '' : 'opacity-30 grayscale'}`}>⭐</span>)}
        </span>
      )}

      {/* the painted play mat (Canva) */}
      <img src={PASS('mat')} alt="" draggable={false} className="pointer-events-none absolute left-1/2 top-[57%] z-10 w-[min(74%,118vh)] -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_1.4vh_1.2vh_rgba(0,0,0,0.25)]" />

      {/* the spotlight finds whoever holds it */}
      <AnimatePresence>
        {asking && !done && (
          <motion.div key="spot" className="pointer-events-none absolute inset-0 z-[15]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ background: `radial-gradient(circle at ${c.x}% ${c.y - 4}%, rgba(254,251,221,0.0) 0, rgba(254,251,221,0.0) 9%, rgba(30,20,10,0.45) 20%)` }} />
        )}
      </AnimatePresence>

      {seats.map((s, i) => {
        const p = seatAt(i);
        const holding = i === pos && state.phase !== 'ready';
        const caught = i === pos && hopping;
        const cheering = done || (state.phase === 'right');
        return (
          <div key={i} className="absolute z-20 flex -translate-x-1/2 -translate-y-[78%] flex-col items-center" style={{ left: `${p.x}%`, top: `${p.y}%` }}>
            {/* the friend: breathes, squashes when the object lands, cheers on a right answer */}
            <motion.div className="relative z-10 origin-bottom" key={caught ? `c-${hops.current}` : 'idle'}
              animate={reduce ? undefined : cheering ? { y: [0, -16, 0], rotate: [0, -4, 4, 0] } : caught ? { scaleY: [1, 0.86, 1.08, 1], scaleX: [1, 1.1, 0.96, 1] } : { y: [0, -3, 0] }}
              transition={cheering ? { duration: 0.5, repeat: Infinity, delay: i * 0.08 } : caught ? { duration: 0.35 } : { duration: 2.4 + (i % 3) * 0.3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.2 }}>
              {i === 0 && !s.img
                ? <span className="grid aspect-square w-[min(14vh,9vw)] place-items-center rounded-full border-[0.5vh] border-white bg-[radial-gradient(circle_at_35%_30%,#FEF3C7,#FEAF15_55%,#FE6A2F)] shadow-[0_0.8vh_1.2vh_rgba(0,0,0,0.3)]" style={{ fontSize: 'min(6vh, 4vw)' }}>⭐</span>
                : <img src={s.img} alt={s.name} draggable={false} className="h-[min(21vh,13.5vw)] object-contain drop-shadow-[0_0.8vh_0.6vh_rgba(0,0,0,0.3)]" />}
            </motion.div>
            {/* the painted cushion (the child's has the star) */}
            <img src={i === 0 ? PASS('cushion-star') : PASS(`cushion-${CUSHIONS[(i - 1) % CUSHIONS.length]}`)} alt="" draggable={false}
              className="-mt-[3.6vh] w-[min(15vh,10vw)] drop-shadow-[0_0.6vh_0.5vh_rgba(0,0,0,0.25)]" />
            <motion.span className={`-mt-[1.2vh] rounded-full border-[0.25vh] px-3 py-[0.2vh] font-black shadow ${holding ? 'border-[#FE6A2F] bg-[#FEAF15] text-amber-950' : 'border-white bg-white/95 text-neutral-700'}`} style={{ fontSize: 'min(2.3vh, 1.5vw)' }}
              animate={holding && asking ? { scale: [1, 1.12, 1] } : { scale: 1 }} transition={{ duration: 0.8, repeat: holding && asking ? Infinity : 0 }}>
              {i === 0 ? 'You' : s.name}
            </motion.span>
          </div>
        );
      })}

      {/* the drum in the middle: tap it to pass; it bounces and rings on every beat */}
      <div className="absolute left-1/2 top-[47%] z-30 -translate-x-1/2 -translate-y-1/2">
        <AnimatePresence>
          {passing && (
            <motion.span key={`ring-${hops.current}`} className="pointer-events-none absolute left-1/2 top-[35%] block h-[12vh] w-[12vh] -translate-x-1/2 -translate-y-1/2 rounded-full border-[0.6vh] border-[#FEAF15]"
              initial={{ scale: 0.4, opacity: 0.9 }} animate={{ scale: 2.4, opacity: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }} />
          )}
        </AnimatePresence>
        <motion.button type="button" onClick={pass} disabled={done || state.phase !== 'ready'} aria-label="Pass!"
          className="relative flex flex-col items-center disabled:cursor-default"
          animate={passing && !reduce ? { scaleY: [1, 0.88, 1], y: [0, 3, 0] } : state.phase === 'ready' && !done && !reduce ? { y: [0, -6, 0] } : { y: 0 }}
          transition={passing ? { duration: 0.18 } : { duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          key={passing ? `beat-${hops.current}` : 'drum'} whileTap={{ scale: 0.9 }}>
          <img src={PASS('drum')} alt="" draggable={false} className="w-[min(12vh,8vw)] drop-shadow-[0_1vh_0.8vh_rgba(0,0,0,0.3)]" />
          {!done && state.phase === 'ready' && (
            <motion.span className={`${CLAY_BUTTON} -mt-[1vh] px-6 py-2`} style={{ fontSize: 'min(3.4vh, 2.3vw)' }} initial={reduce ? false : { scale: 0 }} animate={{ scale: 1 }}>🥁 Pass!</motion.span>
          )}
          {passing && !reduce && (
            <motion.span key={`note-${hops.current}`} className="pointer-events-none absolute -top-[3vh] left-1/2 text-[min(4vh,2.6vw)]" initial={{ y: 0, opacity: 1, x: (hops.current % 2 ? 1 : -1) * 6 }} animate={{ y: -40, opacity: 0, x: (hops.current % 2 ? 1 : -1) * 26 }} transition={{ duration: 0.7 }}>
              {hops.current % 2 ? '♪' : '♫'}
            </motion.span>
          )}
        </motion.button>
      </div>

      {/* the passed object: a real arc from seat to seat, spinning, with its shadow sliding on the mat */}
      <motion.div className="pointer-events-none absolute z-[25] h-[2.2vh] w-[min(7vh,4.6vw)] -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-black/25 blur-[2px]"
        animate={hopping && !reduce ? { left: [`${f.x}%`, `${(f.x + c.x) / 2}%`, `${c.x}%`], top: [`${f.y - 2}%`, `${(f.y + c.y) / 2 - 2}%`, `${c.y - 2}%`], scale: [1, 0.55, 1] } : { left: `${c.x}%`, top: `${c.y - 2}%`, scale: 1 }}
        transition={{ duration: 0.26, ease: 'easeInOut' }} />
      <motion.div className="pointer-events-none absolute z-30" style={{ fontSize: 'min(8vh, 5.2vw)' }}
        animate={hopping && !reduce
          ? { left: [`${f.x}%`, `${(f.x + c.x) / 2}%`, `${c.x}%`], top: [`${f.y - 15}%`, `${Math.min(f.y, c.y) - 30}%`, `${c.y - 15}%`], rotate: [0, 200, 360] }
          : { left: `${c.x}%`, top: `${c.y - 15}%`, rotate: 0, scale: state.phase === 'right' ? [1, 1.5, 1.2] : 1 }}
        transition={hopping ? { duration: 0.26, ease: 'easeOut' } : { type: 'spring', stiffness: 300, damping: 14 }}>
        <motion.span className="block -translate-x-1/2 -translate-y-1/2"
          animate={state.phase === 'ready' && !reduce ? { y: [0, -6, 0] } : { y: 0 }} transition={{ duration: 1, repeat: state.phase === 'ready' ? Infinity : 0 }}
          style={{ filter: state.phase === 'right' ? 'drop-shadow(0 0 2vh #fde047)' : 'drop-shadow(0 0.6vh 0.4vh rgba(0,0,0,0.3))' }}>
          {scene.coconutImg ? <img src={scene.coconutImg} alt="" className="h-[1.2em]" /> : '🥥'}
        </motion.span>
      </motion.div>

      {/* the question, on a storybook card with the holder's face */}
      <AnimatePresence>
        {r && asking && !done && (
          <motion.div key={round} className={`absolute inset-x-[14%] z-40 rounded-[3vh] ${c.y > 60 ? 'top-[16%]' : 'bottom-[7%]'} border-[0.6vh] border-[#FEAF15] bg-[#FEFBDD] px-[2vh] pb-[2vh] pt-[3.4vh] text-center shadow-[0_1.6vh_3vh_rgba(120,53,15,0.35)]`}
            initial={reduce ? false : { y: 60, scale: 0.7, opacity: 0, rotate: -3 }} animate={{ y: 0, scale: 1, opacity: 1, rotate: 0 }} exit={{ y: -30, opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}>
            <div className="absolute -top-[3.4vh] left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border-[0.4vh] border-white bg-gradient-to-b from-[#FE6A2F] to-[#EA580C] py-[0.6vh] pe-5 ps-2 font-black text-white shadow-lg" style={{ fontSize: 'min(3vh, 2vw)' }}>
              {pos === 0 || !seats[pos].img
                ? <span className="grid h-[5vh] w-[5vh] place-items-center rounded-full bg-[#FEAF15]">⭐</span>
                : <img src={seats[pos].img} alt="" className="h-[5vh] w-[5vh] rounded-full bg-[#FEFBDD] object-contain" />}
              {pos === 0 ? 'Your turn!' : `Help ${seats[pos].name}!`}
            </div>
            <button type="button" onClick={() => cueSpeak(r.ask, voiceOf(scene.who))} className="my-[1.2vh] font-black text-[#3b2410]" style={{ fontSize: 'min(4.4vh, 3vw)' }}>{r.ask} <span className="text-[0.7em]">🔊</span></button>
            <div className="flex flex-wrap justify-center gap-[1.2vw]">
              {r.choices.map((ch, ci) => (
                <motion.button key={ci} type="button" onClick={() => answer(ci)} disabled={state.phase === 'right'} whileHover={{ y: -3 }} whileTap={{ scale: 0.93 }}
                  initial={reduce ? false : { y: 20, opacity: 0 }}
                  animate={state.wrong === ci ? { x: [0, -10, 10, -6, 0], y: 0, opacity: 1 } : { y: 0, opacity: 1 }}
                  transition={{ delay: state.wrong === ci ? 0 : 0.15 + ci * 0.08 }}
                  className={`rounded-[2vh] border-[0.4vh] border-white px-[2vw] py-[1.1vh] font-black text-white shadow-[inset_0_0.4vh_0_rgba(255,255,255,0.4),0_0.7vh_0_rgba(0,0,0,0.2)] ${state.phase === 'right' && ci === r.answer ? 'bg-gradient-to-b from-[#4ADE80] to-[#16A34A]' : ci % 2 ? 'bg-gradient-to-b from-[#7DD3FC] to-[#0284C7]' : 'bg-gradient-to-b from-[#FDBA74] to-[#EA580C]'}`}
                  style={{ fontSize: 'min(3.4vh, 2.3vw)' }}>{state.phase === 'right' && ci === r.answer ? '✓ ' : ''}{ch}</motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <Bursts items={bursts} />
      {done && <button type="button" onClick={onNext} className={`${CLAY_BUTTON} absolute bottom-[8%] left-1/2 z-40 -translate-x-1/2 px-10 py-3 text-xl`}>Next ⭐</button>}
    </motion.div>
  );
}

const PASS = (n: string) => `/lep1/stickers/pass-${n}.png`;
const CUSHIONS = ['orange', 'blue', 'green', 'yellow'];

// seats on an ellipse around the mat; seat 0 (the child) at the bottom
function seatPos(i: number, n: number) {
  const t = Math.PI / 2 + (i / n) * Math.PI * 2;
  return { x: 50 + Math.cos(t) * 33, y: 58 + Math.sin(t) * 22 };
}
