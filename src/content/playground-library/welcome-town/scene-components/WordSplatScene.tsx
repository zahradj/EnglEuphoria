import { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../../unit1/audio';
import * as sfx from '../../unit1/sfx';
import { Confetti } from '../../unit1/fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { voiceOf } from './shared';
import { CLAY_BUTTON, THICK_WORDS } from '../../unit1/scene-components/shared';

/* ---------- Word Splat (A1 U1L6 "Sight-word Splat", plan §5.6) ----------
 * The unit's sight words float on the wall as paint blobs. The voice says one; the child splats it — it bursts into a
 * paint star and STAYS painted — and reads it aloud. A wrong blob just wobbles; the word is said again. No clock.
 * Mechanics: "Splat!" / fly-swatter sight-word game (classroom ESL classic, games4esl / Teach Starter), Reading Eggs
 * sight-word pops, Jolly Phonics tricky words. Better: the splats stay, so the wall becomes the child's picture of the
 * words they can read, and every blob can be tapped to hear it before the call (no guessing). */

type Splat = Extract<Scene, { kind: 'word-splat' }>;
const PAINT = ['#FE6A2F', '#4FA9E0', '#B85CD1', '#34D399', '#F59E0B', '#E76FA5', '#22B8CF', '#84CC16'];
// fixed, well-spread blob spots (% of the wall)
const SPOTS = [[14, 24], [38, 18], [62, 26], [86, 20], [22, 56], [48, 50], [74, 58], [12, 82], [36, 84], [60, 80], [86, 84]];

export function WordSplatScene({ scene, onNext, onWin, onLose, sync }: { scene: Splat; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void; sync?: ActivitySync }) {
  const reduce = useReducedMotion();
  const words = scene.words.slice(0, SPOTS.length);
  const calls = scene.rounds.filter((w) => words.includes(w));
  const total = calls.length;
  const [state, setState] = useSyncedState(sync, { round: 0, splatted: [''] as string[], wrong: '', done: false });
  const roundIdx = Math.max(0, Math.min(total - 1, Number(state.round) || 0));
  const target = calls[roundIdx];
  const splatted = Array.isArray(state.splatted) ? state.splatted.filter((w) => typeof w === 'string' && w) : [];
  const done = !!state.done;
  const gemDone = useRef(false);
  const busy = useRef(false);

  useEffect(() => {
    if (done || !target) return undefined;
    busy.current = false;
    const t = window.setTimeout(() => cueSpeak(target, voiceOf(scene.who)), 600);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundIdx, done]);
  useEffect(() => {
    if (done && !gemDone.current) { gemDone.current = true; sfx.gem(); onWin(true); cueSpeak(scene.doneLine, voiceOf(scene.who)); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const tap = (w: string) => {
    if (done || !target || busy.current || splatted.includes(w)) return;
    if (w !== target) {
      sfx.wrong(); onLose();
      setState((s) => ({ ...s, wrong: w }));
      window.setTimeout(() => setState((s) => ({ ...s, wrong: '' })), 600);
      window.setTimeout(() => cueSpeak(target, voiceOf(scene.who)), 650);
      return;
    }
    busy.current = true;
    sfx.pop(); sfx.match();
    setState((s) => ({ ...s, splatted: [...(Array.isArray(s.splatted) ? s.splatted.filter(Boolean) : []), w] }));
    window.setTimeout(() => setState((s) => {
      const next = (Number(s.round) || 0) + 1;
      return next >= total ? { ...s, done: true } : { ...s, round: next };
    }), 1300);
  };

  return (
    <div className="absolute inset-0 select-none overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="absolute inset-0 bg-white/30" />
      {done && <Confetti count={60} />}
      <div className="pointer-events-none absolute inset-x-0 top-[7%] z-30 flex justify-center px-14">
        <span className="text-center font-black text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.1rem, min(calc(2.6*var(--svw,1vw)), 4.4vh), 2.1rem)' }}>
          {done ? scene.doneLine : scene.title}
        </span>
      </div>
      {!done && target && (
        <button type="button" onClick={() => cueSpeak(target, voiceOf(scene.who))} aria-label="Hear the word again"
          className="absolute right-3 top-[14%] z-30 flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 font-black text-orange-700 shadow-lg active:scale-95" style={{ fontSize: 'min(3vh, 2vw)' }}>
          🔊 Listen! <span className="text-neutral-400">{roundIdx + 1}/{total}</span>
        </button>
      )}
      <div className="absolute inset-x-[4%] bottom-[4%] top-[18%] z-20 rounded-[3vh] border-[0.6vh] border-white/80 bg-amber-50/70 shadow-inner">
        {words.map((w, i) => {
          const [x, y] = SPOTS[i];
          const hit = splatted.includes(w);
          const color = PAINT[i % PAINT.length];
          return (
            <motion.button key={w} type="button" onClick={() => tap(w)} aria-label={w}
              className="absolute grid place-items-center font-black"
              style={{ left: `${x}%`, top: `${y}%`, translate: '-50% -50%', width: 'min(19vh, 13vw)', height: 'min(13vh, 9vw)' }}
              animate={state.wrong === w ? { x: [0, -10, 10, -6, 0] } : hit ? { scale: [1, 1.35, 1.1] } : reduce ? {} : { y: [0, -6, 0] }}
              transition={hit || state.wrong === w ? { duration: 0.5 } : { duration: 2 + (i % 3) * 0.4, repeat: Infinity, ease: 'easeInOut' }}
              whileTap={{ scale: 0.92 }}>
              <svg viewBox="0 0 100 70" className="absolute inset-0 h-full w-full" aria-hidden>
                {hit
                  ? <path d="M50 2 L58 22 L80 8 L70 30 L98 34 L72 44 L86 66 L58 52 L50 70 L42 52 L14 66 L28 44 L2 34 L30 30 L20 8 L42 22 Z" fill={color} />
                  : <ellipse cx="50" cy="35" rx="47" ry="31" fill="#fff" stroke={color} strokeWidth="5" />}
              </svg>
              <span className="relative" style={{ color: hit ? '#fff' : '#3b2410', fontSize: 'min(4.6vh, 3vw)', textShadow: hit ? '0 2px 0 rgba(0,0,0,0.3)' : undefined }}>{w}</span>
            </motion.button>
          );
        })}
      </div>
      {done && <button type="button" onClick={onNext} className={`${CLAY_BUTTON} absolute bottom-[8%] left-1/2 z-40 -translate-x-1/2 px-10 py-3 text-xl`}>Next ⭐</button>}
    </div>
  );
}
