import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../../unit1/audio';
import * as sfx from '../../unit1/sfx';
import { Confetti } from '../../unit1/fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { voiceOf } from './shared';
import { CLAY_BUTTON, THICK_WORDS } from '../../unit1/scene-components/shared';

/* ---------- Jungle Glider (Wordwall "Airplane", redesigned — docs/a1-activity-library.md §12) ----------
 * The friend glides through the sky. A sentence is spoken and shown ("I am tired."); three clouds float in, each
 * carrying a picture or an answer. The child taps a cloud and the glider swoops into it: the right cloud bursts into
 * stars (+1 ⭐) and the friend says the sentence; a wrong cloud just puffs away softly and the glider comes back.
 * Mechanics: Wordwall Airplane (fly into the right answer), endless-flyer games. Better: tap-to-steer (no fast
 * reflexes, no crashes, no timer), the sentence is heard AND read, every catch is said aloud. */

type Glider = Extract<Scene, { kind: 'glider' }>;
const LANES = [24, 46, 68]; // cloud centres (% of height)

export function GliderScene({ scene, onNext, onWin, onLose, sync }: { scene: Glider; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void; sync?: ActivitySync }) {
  const reduce = useReducedMotion();
  const total = scene.rounds.length;
  const [state, setState] = useSyncedState(sync, { round: 0, popped: [-1], stars: 0, flyTo: -1, hit: false, done: false });
  const round = Math.max(0, Math.min(total - 1, Number(state.round) || 0));
  const r = scene.rounds[round];
  const popped = Array.isArray(state.popped) ? state.popped.filter((n) => n >= 0) : [];
  const flyTo = Number(state.flyTo);
  const hit = !!state.hit;
  const done = !!state.done;
  const gemDone = useRef(false);
  const [arrived, setArrived] = useState(false); // clouds finished floating in (local look only)

  useEffect(() => {
    if (done || !r) return undefined;
    setArrived(false);
    const a = window.setTimeout(() => cueSpeak(r.ask, voiceOf(scene.who)), 500);
    const b = window.setTimeout(() => setArrived(true), reduce ? 0 : 1800);
    return () => { window.clearTimeout(a); window.clearTimeout(b); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, done]);
  useEffect(() => {
    if (done && !gemDone.current) { gemDone.current = true; sfx.gem(); onWin(true); cueSpeak(scene.doneLine, voiceOf(scene.who)); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const pick = (i: number) => {
    if (!r || hit || flyTo >= 0 || popped.includes(i) || done) return;
    sfx.whoop();
    setState((s) => ({ ...s, flyTo: i }));
    window.setTimeout(() => {
      if (i === r.answer) {
        sfx.match(); window.setTimeout(() => sfx.gem(), 200);
        cueSpeak(r.say ?? r.ask, 'teacher');
        setState((s) => ({ ...s, hit: true, stars: (Number(s.stars) || 0) + 1 }));
        window.setTimeout(() => setState((s) => {
          const n = (Number(s.round) || 0) + 1;
          return n >= total ? { ...s, done: true, flyTo: -1 } : { ...s, round: n, popped: [-1], flyTo: -1, hit: false };
        }), 2200);
      } else {
        sfx.pop(); onLose();
        cueSpeak('Puff! Try again!', voiceOf(scene.who));
        setState((s) => ({ ...s, popped: [...(Array.isArray(s.popped) ? s.popped : []), i], flyTo: -1 }));
      }
    }, 700);
  };

  // the glider: home on the left; swoops to the picked cloud
  const gx = flyTo >= 0 ? 66 : 12;
  const gy = flyTo >= 0 ? LANES[flyTo] : 46;
  return (
    <div className="absolute inset-0 select-none overflow-hidden bg-gradient-to-b from-sky-400 via-sky-300 to-sky-100">
      <img src={scene.bg} alt="" draggable={false} className="pointer-events-none absolute inset-x-0 bottom-0 h-[34%] w-full object-cover object-bottom opacity-90" />
      {/* drifting background clouds (UI motion; the picture itself never moves) */}
      {!reduce && [0, 1, 2, 3].map((k) => (
        <motion.div key={k} className="pointer-events-none absolute h-[7vh] w-[18vh] rounded-full bg-white/60 blur-[2px]" style={{ top: `${12 + k * 15}%` }}
          animate={{ left: ['105%', '-25%'] }} transition={{ duration: 14 + k * 3, repeat: Infinity, ease: 'linear', delay: -k * 4 }} />
      ))}
      {done && <Confetti count={90} />}
      <div className="pointer-events-none absolute inset-x-0 top-[5%] z-30 flex justify-center px-14">
        <span className="text-center font-black text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.1rem, min(calc(2.6*var(--svw,1vw)), 4.4vh), 2.1rem)' }}>
          {done ? scene.doneLine : `🪂 ${scene.title}`}
        </span>
      </div>
      <span className="absolute right-3 top-[13%] z-30 rounded-full bg-white/95 px-4 py-2 font-black text-amber-600 shadow-lg" style={{ fontSize: 'min(3vh, 2vw)' }}>⭐ {Number(state.stars) || 0}/{total}</span>
      {!done && r && (
        <>
          {/* the sentence */}
          <button type="button" onClick={() => { sfx.click(); cueSpeak(r.ask, voiceOf(scene.who)); }}
            className="absolute left-3 top-[13%] z-30 max-w-[60%] rounded-[2vh] border-[0.5vh] border-white bg-white/95 px-5 py-2 text-start font-black text-sky-800 shadow-xl" style={{ fontSize: 'min(3.6vh, 2.4vw)' }}>
            🔊 {r.ask}
          </button>
          {/* the clouds */}
          {r.choices.slice(0, 3).map((c, i) => {
            const gone = popped.includes(i);
            const burst = hit && i === r.answer;
            return (
              <AnimatePresence key={`${round}-${i}`}>
                {!gone && !burst && (
                  <motion.button type="button" onClick={() => pick(i)} aria-label={c.label}
                    className="absolute z-20 flex items-center justify-center"
                    style={{ top: `${LANES[i]}%`, marginTop: 'calc(min(17vh,12vw) / -2)', width: 'min(34vh,24vw)', height: 'min(17vh,12vw)' }}
                    initial={reduce ? { left: '62%' } : { left: '105%' }} animate={{ left: '62%', y: arrived && !reduce ? [0, -6, 0] : 0 }}
                    exit={{ scale: 1.4, opacity: 0, transition: { duration: 0.4 } }}
                    transition={{ left: { duration: 1.6, ease: 'easeOut', delay: i * 0.15 }, y: { duration: 2.4, repeat: Infinity, delay: i * 0.3 } }}
                    whileHover={{ scale: 1.05 }}>
                    <svg viewBox="0 0 200 100" className="absolute inset-0 h-full w-full drop-shadow-[0_0.8vh_0.6vh_rgba(30,64,175,0.25)]" aria-hidden>
                      <path d="M40 85 Q8 85 12 62 Q14 42 38 44 Q42 16 74 18 Q96 2 120 20 Q150 10 162 38 Q192 40 188 64 Q186 86 158 85 Z" fill="#fff" stroke="#bfdbfe" strokeWidth="3" />
                    </svg>
                    <span className="relative flex items-center gap-2 px-[8%] pt-[4%]">
                      {c.img && <img src={c.img} alt="" draggable={false} className="h-[min(10vh,7vw)] w-auto object-contain" />}
                      {(!c.img || c.label.length < 14) && <span className="font-black text-sky-900" style={{ fontSize: c.img ? 'min(2.6vh, 1.8vw)' : 'min(3vh, 2vw)' }}>{c.label}</span>}
                    </span>
                  </motion.button>
                )}
              </AnimatePresence>
            );
          })}
          {/* star burst on the right cloud */}
          <AnimatePresence>
            {hit && !reduce && (
              <motion.div key={`burst-${round}`} className="pointer-events-none absolute z-20" style={{ left: '72%', top: `${LANES[r.answer]}%` }} exit={{ opacity: 0 }}>
                {Array.from({ length: 10 }, (_, k) => (
                  <motion.span key={k} className="absolute text-[min(4vh,2.6vw)]" initial={{ x: 0, y: 0, opacity: 1 }}
                    animate={{ x: Math.cos((k / 10) * Math.PI * 2) * 120, y: Math.sin((k / 10) * Math.PI * 2) * 90, opacity: 0, rotate: 180 }} transition={{ duration: 1.1 }}>⭐</motion.span>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
      {/* the glider */}
      <div className="pointer-events-none absolute inset-0 z-30">
        <motion.div className="absolute" animate={{ left: `${gx}%`, top: `${gy}%` }} transition={{ type: 'spring', stiffness: 70, damping: 14 }}>
          <div className="-translate-x-1/2 -translate-y-1/2">
          <motion.div animate={reduce ? { rotate: flyTo >= 0 ? (gy < 46 ? -10 : gy > 46 ? 10 : 0) : 0 } : { y: [0, -8, 0], rotate: flyTo >= 0 ? (gy < 46 ? -10 : gy > 46 ? 10 : 0) : 0 }}
            transition={{ y: { duration: 2, repeat: Infinity }, rotate: { type: 'spring', stiffness: 120, damping: 12 } }} className="relative">
            <svg viewBox="0 0 200 90" className="absolute -top-[62%] left-1/2 w-[230%] -translate-x-1/2" aria-hidden>
              <defs>
                <linearGradient id="glider-wing" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0" stopColor="#f97316" /><stop offset="0.25" stopColor="#f97316" /><stop offset="0.25" stopColor="#fde047" /><stop offset="0.5" stopColor="#fde047" />
                  <stop offset="0.5" stopColor="#f97316" /><stop offset="0.75" stopColor="#f97316" /><stop offset="0.75" stopColor="#fde047" /><stop offset="1" stopColor="#fde047" />
                </linearGradient>
              </defs>
              <path d="M100 6 L196 52 Q100 36 4 52 Z" fill="url(#glider-wing)" stroke="#9a3412" strokeWidth="3" strokeLinejoin="round" />
              <path d="M100 6 L100 42" stroke="#9a3412" strokeWidth="2.5" />
              <path d="M62 46 L84 84 M138 46 L116 84 M100 42 L100 84" stroke="#475569" strokeWidth="1.6" />
              <path d="M78 84 L122 84" stroke="#334155" strokeWidth="4" strokeLinecap="round" />
            </svg>
            <img src={scene.pilot} alt="" draggable={false} className="relative h-[min(16vh,11vw)] w-auto object-contain drop-shadow-xl" />
          </motion.div>
          </div>
        </motion.div>
      </div>
      {done && <button type="button" onClick={onNext} className={`${CLAY_BUTTON} absolute bottom-[8%] left-1/2 z-40 -translate-x-1/2 px-10 py-3 text-xl`}>Next ⭐</button>}
    </div>
  );
}
