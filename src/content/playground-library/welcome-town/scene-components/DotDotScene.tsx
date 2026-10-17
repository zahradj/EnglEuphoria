import { useEffect, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../../unit1/audio';
import * as sfx from '../../unit1/sfx';
import { Confetti } from '../../unit1/fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { numWord, voiceOf } from './shared';
import { CLAY_BUTTON, THICK_WORDS } from '../../unit1/scene-components/shared';
import { Bursts, CalmBg, useBursts, useShake } from '../../unit1/scene-components/gameFx';
import { SKIN } from '../../gameSkin';

/* ---------- Dot-to-Dot Surprise (A1 U1 L3, counting 1-20 in order — docs/a1-unit-1-welcome-town.md §5.3) ----------
 * A pale mystery shape waits on the party table, ringed by numbered dots. The child joins the dots in order, saying each
 * number: a glowing line runs from dot to dot (the friend counts along), and the last line closes the shape — the
 * picture fills with colour and turns out to be a party thing ("A birthday cake!"). Picture 1: the digits 1-20.
 * Picture 2 (A1 reading): the dots carry number WORDS, eleven to twenty, so the child reads "fourteen" before tapping.
 * A tap on the wrong dot wiggles it and the friend says the number to find. Researched mechanics
 * (docs/research/playground-a1u1l3-research.md): printable dot-to-dot 1-20 (Twinkl), dot-to-dot apps with a settable
 * range (Star Gurus, Connect the Dots with Animals). Better: every dot is said aloud, the second picture moves from
 * digits to reading the words, and the reveal belongs to the lesson's birthday party.
 * Look: the dots are sunshine-yellow party balloons with a white number; the line is an orange ribbon that glows; the
 * party picture behind is calmed (CalmBg) so the dots are the brightest things on screen. */

type Dots = Extract<Scene, { kind: 'dot-dot' }>;

export function DotDotScene({ scene, onNext, onWin, onLose, sync }: { scene: Dots; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void; sync?: ActivitySync }) {
  const reduce = useReducedMotion();
  const total = scene.pictures.length;
  const [state, setState] = useSyncedState(sync, { pic: 0, joined: 0, wrong: -1, revealed: false, done: false });
  const pic = Math.max(0, Math.min(total - 1, Number(state.pic) || 0));
  const p = scene.pictures[pic];
  const n = p?.dots.length ?? 0;
  const joined = Math.max(0, Math.min(n, Number(state.joined) || 0));
  const revealed = !!state.revealed;
  const done = !!state.done;
  const [bursts, fire] = useBursts();
  const [shakeCtl, shake] = useShake();
  const gemDone = useRef(false);
  const timers = useRef<number[]>([]);
  useEffect(() => () => { timers.current.forEach((t) => window.clearTimeout(t)); }, []);
  const numberAt = (i: number) => (p ? p.from + i : 0);
  const labelAt = (i: number) => (p?.labels === 'words' ? numWord(numberAt(i)) : String(numberAt(i)));

  useEffect(() => {
    if (done || !p) return undefined;
    const t = window.setTimeout(() => cueSpeak(p.intro, voiceOf(scene.who)), pic === 0 ? 900 : 700);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pic, done]);
  useEffect(() => {
    if (done && !gemDone.current) { gemDone.current = true; sfx.gem(); onWin(true); cueSpeak(scene.doneLine, voiceOf(scene.who)); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const tap = (i: number) => {
    if (!p || done || revealed) return;
    if (i !== joined) {
      if (i < joined) return; // already joined
      sfx.wrong(); onLose(); shake();
      setState((s) => ({ ...s, wrong: i }));
      cueSpeak(`Find ${numWord(numberAt(joined))}!`, voiceOf(scene.who));
      timers.current.push(window.setTimeout(() => setState((s) => ({ ...s, wrong: -1 })), 600));
      return;
    }
    sfx.pop();
    cueSpeak(numWord(numberAt(i)), voiceOf(scene.who));
    const [x, y] = p.dots[i];
    fire(x, y, 'sparkle');
    const next = i + 1;
    if (next < n) { setState((s) => ({ ...s, joined: next, wrong: -1 })); return; }
    // the last dot: close the shape, reveal the picture
    setState((s) => ({ ...s, joined: next, wrong: -1, revealed: true }));
    timers.current.push(window.setTimeout(() => { sfx.gem(); fire(50, 50, 'confetti'); cueSpeak(p.reveal, voiceOf(scene.who)); }, 700));
    timers.current.push(window.setTimeout(() => setState((s) => {
      const np = (Number(s.pic) || 0) + 1;
      return np >= total ? { ...s, done: true } : { ...s, pic: np, joined: 0, revealed: false };
    }), 4200));
  };

  const pts = p?.dots ?? [];
  const path = pts.slice(0, Math.max(0, joined)).map(([x, y]) => `${x},${y}`).join(' ');
  return (
    <div className="absolute inset-0 select-none overflow-hidden bg-[#FDE7C2]">
      <CalmBg img={scene.bg} strength="strong" />
      {done && <Confetti count={90} />}
      <div className="pointer-events-none absolute inset-x-0 top-[4%] z-30 flex justify-center px-14">
        <span className="text-center font-black text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.1rem, min(calc(2.6*var(--svw,1vw)), 4.4vh), 2.1rem)' }}>
          {done ? scene.doneLine : `✏️ ${scene.title}`}
        </span>
      </div>

      {p && (
        <div className="pointer-events-none absolute inset-x-0 bottom-[10%] top-[13%] z-10 flex items-center justify-center">
        <motion.div key={pic} className={`${SKIN.panel} pointer-events-auto relative p-[3vh]`}
          initial={reduce ? false : { scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 18 }}>
          <motion.div className="relative" animate={shakeCtl} style={{ height: 'min(56vh, 40vw)', aspectRatio: String(p.aspect) }}>
            {/* the mystery shape: pale until the last line closes it, then it fills with colour */}
            <motion.img src={p.img} alt="" draggable={false} className="pointer-events-none absolute inset-0 h-full w-full object-contain"
              animate={revealed ? { opacity: 1, filter: 'grayscale(0) brightness(1)', scale: reduce ? 1 : [1, 1.06, 1] } : { opacity: 0.16, filter: 'grayscale(1) brightness(1.4)', scale: 1 }}
              transition={{ duration: 0.7 }} />
            {/* the ribbon line */}
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
              {joined > 1 && (
                <polyline points={path} fill="none" stroke="#FE6A2F" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"
                  style={{ strokeWidth: '0.9vh', filter: 'drop-shadow(0 0 0.6vh rgba(254,175,21,0.9))' }} />
              )}
              {revealed && pts.length > 1 && (
                <motion.line x1={pts[pts.length - 1][0]} y1={pts[pts.length - 1][1]} x2={pts[0][0]} y2={pts[0][1]} stroke="#FE6A2F" vectorEffect="non-scaling-stroke"
                  style={{ strokeWidth: '0.9vh' }} strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5 }} />
              )}
            </svg>
            {/* the balloon dots */}
            {!revealed && pts.map(([x, y], i) => {
              const isNext = i === joined;
              const isDone = i < joined;
              const word = p.labels === 'words';
              return (
                <motion.button key={i} type="button" onClick={() => tap(i)} whileTap={{ scale: 0.85 }}
                  className={`absolute z-10 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[0.3vh] border-white font-black text-white shadow-[0_0.5vh_0.8vh_rgba(120,53,15,0.35)] ${word ? 'px-[0.8vw] py-[0.3vh]' : 'aspect-square w-[min(5.4vh,3.6vw)]'}`}
                  style={{ left: `${x}%`, top: `${y}%`, fontSize: word ? 'min(2.3vh,1.45vw)' : 'min(2.6vh,1.7vw)',
                    background: Number(state.wrong) === i ? 'radial-gradient(circle at 35% 30%, #FDA4AF, #E11D48)'
                      : isDone ? 'radial-gradient(circle at 35% 30%, #86EFAC, #16A34A)' : 'radial-gradient(circle at 35% 30%, #FFE08A, #FEAF15)',
                    color: isDone ? '#fff' : '#3B2410' }}
                  animate={Number(state.wrong) === i ? { x: ['-50%', '-62%', '-38%', '-50%'] } : isNext && !reduce ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                  transition={isNext ? { duration: 1, repeat: Infinity } : { duration: 0.35 }}>
                  {labelAt(i)}
                </motion.button>
              );
            })}
            <Bursts items={bursts} />
          </motion.div>
          <AnimatePresence>
            {revealed && (
              <motion.div className={`${SKIN.pill} absolute -bottom-[2.4vh] left-0 right-0 mx-auto w-max whitespace-nowrap px-[1.6vw] py-[0.6vh]`} style={{ fontSize: 'min(3.4vh,2.2vw)' }}
                initial={{ y: 20, opacity: 0, scale: 0.6 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 14 }}>
                🎉 {p.reveal}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        </div>
      )}

      {/* what to find next */}
      {p && !revealed && !done && (
        <button type="button" onClick={() => { sfx.click(); cueSpeak(`Find ${numWord(numberAt(joined))}!`, voiceOf(scene.who)); }}
          className={`${SKIN.pill} absolute bottom-[4%] start-[3%] z-20 px-[1.4vw] py-[0.8vh]`} style={{ fontSize: 'min(3vh,1.9vw)' }}>
          🔊 Next: {p.labels === 'words' ? '?' : labelAt(joined)}
        </button>
      )}
      {done && <button type="button" onClick={onNext} className={`${CLAY_BUTTON} absolute bottom-[8%] left-1/2 z-40 -translate-x-1/2 px-10 py-3 text-xl`}>Next ⭐</button>}
    </div>
  );
}
