import { useEffect, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak, speak } from '../../unit1/audio';
import * as sfx from '../../unit1/sfx';
import { Confetti } from '../../unit1/fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { voiceOf } from './shared';
import { CLAY_BUTTON, THICK_WORDS } from '../../unit1/scene-components/shared';

/* ---------- Echo Cave (Marco Polo, modern design — docs/a1-activity-library.md §11) ----------
 * A dark cave with three tunnels. A friend hides in one of them and calls out ("Hello! My name is Mia!"); the voice
 * comes from the left, the middle or the right speaker. The child listens, taps the tunnel the voice came from, and a
 * lantern lights up the friend, who answers the child. After two misses the right tunnel glows softly. 🔊 plays the
 * call again. Mechanics: Marco Polo (find a friend by their voice), spatial-audio "where is the sound?" games,
 * Lingokids listening games. Better: the child must listen to a whole sentence (not a beep), the friend answers in
 * English. Stereo speakers or headphones make the side clear; on a mono speaker the hint glow after two misses keeps
 * the game winnable. */

type Cave = Extract<Scene, { kind: 'echo-cave' }>;
const PAN = [-1, 0, 1];

export function EchoCaveScene({ scene, onNext, onWin, onLose, sync }: { scene: Cave; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void; sync?: ActivitySync }) {
  const reduce = useReducedMotion();
  const total = scene.rounds.length;
  const [state, setState] = useSyncedState(sync, { round: 0, misses: 0, found: false, wrong: -1, done: false });
  const round = Math.max(0, Math.min(total - 1, Number(state.round) || 0));
  const r = scene.rounds[round];
  const at = r ? Math.max(0, Math.min(2, Number(r.at) || 0)) : 0;
  const misses = Number(state.misses) || 0;
  const done = !!state.done;
  const gemDone = useRef(false);

  const call = () => { if (r) speak(r.line, voiceOf(r.voice), { pan: PAN[at] }).catch(() => undefined); };
  useEffect(() => {
    if (done || !r || state.found) return undefined;
    const t = window.setTimeout(call, round === 0 ? 1600 : 900);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, done]);
  useEffect(() => {
    if (round === 0 && !done) {
      const t = window.setTimeout(() => cueSpeak('Shh! Listen! Who is calling? Where is the voice?', voiceOf(scene.who)), 200);
      return () => window.clearTimeout(t);
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (done && !gemDone.current) { gemDone.current = true; sfx.gem(); onWin(true); cueSpeak(scene.doneLine, voiceOf(scene.who)); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const pick = (i: number) => {
    if (!r || state.found || done) return;
    if (i !== at) {
      sfx.wrong(); onLose();
      cueSpeak('Not this tunnel! Listen again!', voiceOf(scene.who));
      setState((s) => ({ ...s, wrong: i, misses: (Number(s.misses) || 0) + 1 }));
      window.setTimeout(() => setState((s) => ({ ...s, wrong: -1 })), 700);
      window.setTimeout(call, 2200);
      return;
    }
    sfx.reveal(); window.setTimeout(() => sfx.match(), 300);
    setState((s) => ({ ...s, found: true, wrong: -1 }));
    window.setTimeout(() => cueSpeak(r.reply, voiceOf(r.voice)), 700);
  };
  const next = () => {
    sfx.click();
    setState((s) => {
      const n = (Number(s.round) || 0) + 1;
      return n >= total ? { ...s, done: true } : { ...s, round: n, misses: 0, found: false, wrong: -1 };
    });
  };

  return (
    <div className="absolute inset-0 select-none overflow-hidden bg-[#120d1f] bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="absolute inset-0 bg-[#0b0716]/70" />
      {done && <Confetti count={80} />}
      <div className="pointer-events-none absolute inset-x-0 top-[5%] z-30 flex justify-center px-14">
        <span className="text-center font-black text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.1rem, min(calc(2.6*var(--svw,1vw)), 4.4vh), 2.1rem)' }}>
          {done ? scene.doneLine : `🦇 ${scene.title}`}
        </span>
      </div>
      {!done && r && (
        <>
          <span className="absolute right-3 top-[13%] z-30 rounded-full bg-white/95 px-4 py-2 font-black text-indigo-700 shadow-lg" style={{ fontSize: 'min(3vh, 2vw)' }}>🔦 {round + 1}/{total}</span>
          <button type="button" onClick={() => { sfx.click(); call(); }} className="absolute left-3 top-[13%] z-30 rounded-full bg-yellow-300 px-4 py-2 font-black text-indigo-900 shadow-lg" style={{ fontSize: 'min(3vh, 2vw)' }}>🔊 Listen again</button>
          {/* sound rings travel out of the hidden tunnel while the friend calls */}
          {!state.found && !reduce && (
            <div className="pointer-events-none absolute inset-x-[8%] top-[24%] z-10 h-[52%]">
              {[0, 1, 2].map((k) => (
                <motion.div key={k} className="absolute top-1/2 h-[30vh] w-[30vh] -translate-x-1/2 -translate-y-1/2 rounded-full border-[0.4vh] border-white/15"
                  style={{ left: '50%' }} animate={{ scale: [0.3, 1.6], opacity: [0.5, 0] }} transition={{ duration: 2.4, repeat: Infinity, delay: k * 0.8 }} />
              ))}
            </div>
          )}
          {/* three tunnels */}
          <div className="absolute inset-x-[6%] top-[24%] z-20 flex h-[52%] items-end justify-between gap-[3vw]">
            {[0, 1, 2].map((i) => {
              const lit = state.found && i === at;
              const hint = !state.found && misses >= 2 && i === at;
              return (
                <motion.button key={`${round}-${i}`} type="button" onClick={() => pick(i)} disabled={state.found}
                  aria-label={['left tunnel', 'middle tunnel', 'right tunnel'][i]}
                  animate={state.wrong === i ? { x: [0, -10, 10, -6, 0] } : {}} whileHover={!state.found ? { scale: 1.03 } : {}}
                  className="relative h-full flex-1 overflow-hidden rounded-t-[50%] border-[0.8vh] border-stone-500 bg-gradient-to-b from-stone-700 to-stone-900 shadow-[inset_0_2vh_4vh_rgba(0,0,0,0.8)]">
                  <div className="absolute inset-[8%] rounded-t-[50%] bg-gradient-to-b from-black to-[#1a1126]" />
                  {hint && !reduce && (
                    <motion.div className="absolute inset-[8%] rounded-t-[50%] bg-yellow-200/50 shadow-[0_0_4vh_rgba(253,224,71,0.8)]" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.2, repeat: Infinity }} />
                  )}
                  <AnimatePresence>
                    {lit && (
                      <motion.div className="absolute inset-[8%] flex items-end justify-center rounded-t-[50%]"
                        style={{ background: 'radial-gradient(circle at 50% 60%, rgba(255,226,140,0.95), rgba(255,180,60,0.5) 45%, rgba(0,0,0,0) 75%)' }}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <motion.img src={r.img} alt="" draggable={false} className="mb-[4%] h-[78%] w-auto object-contain drop-shadow-xl"
                          initial={reduce ? false : { y: 40, scale: 0.6 }} animate={{ y: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 220, damping: 14 }} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {!lit && <span className="absolute inset-x-0 bottom-[6%] text-center text-[min(5vh,3.4vw)]">❓</span>}
                </motion.button>
              );
            })}
          </div>
          {/* the found friend's line */}
          <div className="absolute inset-x-0 bottom-[4%] z-30 flex flex-col items-center gap-[1vh]">
            {state.found ? (
              <>
                <span className="rounded-[2vh] bg-white/95 px-5 py-2 text-center font-black text-indigo-800 shadow-xl" style={{ fontSize: 'min(3.4vh, 2.3vw)' }}>“{r.line}” — {r.reply}</span>
                <button type="button" onClick={next} className={`${CLAY_BUTTON} px-8 py-2`} style={{ fontSize: 'min(3.2vh, 2.2vw)' }}>{round + 1 >= total ? 'Done! ⭐' : 'Next friend 🔦'}</button>
              </>
            ) : (
              <span className="rounded-full bg-black/60 px-5 py-2 font-black text-white" style={{ fontSize: 'min(3vh, 2vw)' }}>👂 Where is the voice? Tap the tunnel!</span>
            )}
          </div>
        </>
      )}
      {done && <button type="button" onClick={onNext} className={`${CLAY_BUTTON} absolute bottom-[8%] left-1/2 z-40 -translate-x-1/2 px-10 py-3 text-xl`}>Next ⭐</button>}
    </div>
  );
}
