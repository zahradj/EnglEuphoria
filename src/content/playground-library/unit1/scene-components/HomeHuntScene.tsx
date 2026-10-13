import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { Confetti } from '../fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { CLAY_BUTTON, THICK_WORDS, sayWithin } from './shared';
import { Bursts, useBursts } from './gameFx';

/* ---------- Home Hunt (extra practice, owner 2026-10-12: "create extra practice for the student, be creative") ----------
 * A scavenger hunt in the child's own home during the live class: a mission card ("Find something red!", "Show me your
 * shoes!", "Go to your kitchen!"), a calm countdown ring that never fails (when it ends the card just says "Show me!"),
 * the child runs, comes back and SHOWS it to the camera and says the word; the teacher taps "Found it!" — stars, and the
 * next mission. Sources (mechanic only): Twinkl "Vocabulary games for online ESL students" (scavenger hunt: "pretty much
 * any vocabulary topic can be revised"), TPR (total physical response), Khan Academy Kids / Lingokids real-world
 * "find it" prompts. Better: the words leave the screen and attach to the child's own things, and the child moves
 * after sitting — and there is no way to lose. */

type Hunt = Extract<Scene, { kind: 'home-hunt' }>;

export function HomeHuntScene({ scene, onWin, onNext, sync }: { scene: Hunt; onWin: (gem: boolean) => void; onNext: () => void; sync?: ActivitySync }) {
  const reduce = useReducedMotion();
  const total = scene.rounds.length;
  const [state, setState] = useSyncedState(sync, { round: 0, started: false, gemDone: false });
  const round = Math.max(0, Math.min(total, Number(state.round) || 0));
  const r = round < total ? scene.rounds[round] : undefined;
  const done = round >= total;
  const seconds = scene.seconds ?? 25;
  const [left, setLeft] = useState(seconds);
  const [bursts, fire] = useBursts();

  useEffect(() => {
    setLeft(seconds);
    if (!r || !state.started) return undefined;
    void sayWithin(r.ask, scene.who, 3200);
    const id = window.setInterval(() => setLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, state.started, scene.id]);

  const start = () => { sfx.whoop(); setState((s) => ({ ...s, started: true })); };
  const found = async () => {
    if (!r) return;
    sfx.match(); fire(50, 45, 'stars');
    await sayWithin(r.found, scene.who, 2600);
    const next = round + 1;
    if (next >= total && !state.gemDone) { fire(50, 40, 'confetti'); sfx.gem(); onWin(true); }
    setState((s) => ({ ...s, round: next, gemDone: s.gemDone || next >= total }));
  };

  const pct = Math.max(0, left / seconds);
  return (
    <div className="absolute inset-0 select-none overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="absolute inset-0 bg-black/15" />
      {done && <Confetti count={60} />}
      <div className="pointer-events-none absolute inset-x-0 top-[8%] z-30 flex justify-center px-14">
        <span className="text-center font-black text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.1rem, min(calc(2.8*var(--svw,1vw)), 4.8vh), 2.3rem)' }}>
          {done ? scene.doneLine : `🏠 ${scene.title}`}
        </span>
      </div>

      <AnimatePresence mode="wait">
        {r && (
          <div key={`wrap-${round}`} className="pointer-events-none absolute inset-x-0 top-[18%] bottom-[8%] z-20 flex items-center justify-center">
          <motion.div key={`card-${round}`} className="pointer-events-auto flex w-[min(70vw,95vh)] items-center gap-[3vw] rounded-[4vh] border-[0.7vh] border-white bg-gradient-to-b from-amber-50 to-orange-100 p-[3vh] shadow-2xl"
            initial={reduce ? false : { scale: 0.6, rotate: -6, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} exit={reduce ? undefined : { x: '60vw', rotate: 12, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 180, damping: 16 }}>
            <div className="relative shrink-0" style={{ width: 'min(30vh, 22vw)', aspectRatio: '1' }}>
              {/* calm countdown ring (never fails) */}
              <svg className="absolute -inset-[6%] h-[112%] w-[112%] -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="46" fill="none" stroke="#FDE68A" strokeWidth="5" />
                {state.started && <circle cx="50" cy="50" r="46" fill="none" stroke="#F97316" strokeWidth="5" strokeLinecap="round" strokeDasharray={`${pct * 289} 289`} />}
              </svg>
              <motion.img src={r.img} alt={r.label} draggable={false} className="relative h-full w-full rounded-full bg-white object-contain p-[8%]"
                animate={reduce || !state.started ? {} : { rotate: [-4, 4, -4] }} transition={{ duration: 1.6, repeat: Infinity }} />
            </div>
            <div className="flex flex-1 flex-col items-start gap-[2vh]">
              <span className="font-black text-orange-700" style={{ fontSize: 'min(4.4vh, 2.9vw)' }}>{r.ask}</span>
              <div className="flex flex-wrap items-center gap-3">
                <button type="button" onClick={() => cueSpeak(r.ask, scene.who)} aria-label="Hear it" className="grid h-[7vh] w-[7vh] place-items-center rounded-full bg-white text-[3.4vh] shadow">🔊</button>
                {!state.started ? (
                  <button type="button" onClick={start} className={`${CLAY_BUTTON} px-7 py-2`} style={{ fontSize: 'min(3.4vh, 2.2vw)' }}>🏃 Go!</button>
                ) : (
                  <>
                    <span className="rounded-full bg-white/90 px-4 py-1 font-black text-emerald-700" style={{ fontSize: 'min(3vh, 2vw)' }}>{left > 0 ? `⏳ ${left}` : '📷 Show me!'}</span>
                    <button type="button" onClick={() => { void found(); }} className={`${CLAY_BUTTON} px-7 py-2`} style={{ fontSize: 'min(3.4vh, 2.2vw)' }}>✓ Found it!</button>
                  </>
                )}
              </div>
              <span className="font-bold text-orange-900/70" style={{ fontSize: 'min(2.4vh, 1.6vw)' }}>{round + 1} / {total}</span>
            </div>
          </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Bursts items={bursts} />
      {done && (
        <motion.div className="absolute inset-x-0 bottom-[10%] z-40 flex justify-center" initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8, type: 'spring' }}>
          <button onClick={onNext} className={`${CLAY_BUTTON} px-10 py-3 text-xl`}>Next ⭐</button>
        </motion.div>
      )}
    </div>
  );
}
