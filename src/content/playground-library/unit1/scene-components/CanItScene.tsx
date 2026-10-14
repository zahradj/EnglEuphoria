import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, type TargetAndTransition, useReducedMotion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { Confetti } from '../fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { CLAY_BUTTON, THICK_WORDS, sayWithin } from './shared';
import { Bursts, useBursts } from './gameFx';

/* ---------- Can It? (U10L4 signature, owner 2026-10-12: vary every lesson; "Can you …? Yes, I can / No, I can't") ----------
 * The circus ring. An animal bounces in and the ringmaster asks "Can a fish walk?". The child taps 👍 "Yes, it can!"
 * or 👎 "No, it can't!". Right yes: the animal shows off (swims in a wave, flies up, jumps, runs). Right no: the
 * animal shakes its head and shows what it CAN do. A wrong yes is the funny part: the animal TRIES and flops over
 * with a "?" — then shows what it really can do, and the right answer glows. Nothing is lost. Sources (mechanic
 * only): Cambridge Pre A1 Starters "Can a … ?" yes/no listening, Lingokids / Khan Kids silly true-or-false, the
 * classroom "Can a fish fly?" ability game. Better: the answer is SHOWN as cause and effect (the animal really does
 * it or really fails), so "can" and "can't" mean something the child saw. */

type CanIt = Extract<Scene, { kind: 'can-it' }>;
type Act = CanIt['rounds'][number]['action'];
const EMOJI: Record<Act, string> = { swim: '🏊', run: '🏃', jump: '🦘', fly: '🕊️', walk: '🚶', sing: '🎤', dance: '💃' };
const MOVE: Record<Act, TargetAndTransition> = {
  swim: { x: [-60, 60, -60], y: [0, -10, 0, -10, 0], rotate: [-6, 6, -6], transition: { duration: 2.2 } },
  run: { x: [-120, 120, 0], y: [0, -12, 0, -12, 0, -12, 0], transition: { duration: 1.4 } },
  jump: { y: [0, -140, 0, -90, 0], scaleY: [1, 1.1, 0.8, 1.05, 0.9, 1], transition: { duration: 1.4 } },
  fly: { y: [0, -160, -120, -170, 0], rotate: [0, -8, 8, -8, 0], transition: { duration: 2.2 } },
  walk: { x: [-50, 50, 0], y: [0, -6, 0, -6, 0, -6, 0], transition: { duration: 2 } },
  sing: { scaleY: [1, 1.08, 1, 1.08, 1], rotate: [-4, 4, -4], transition: { duration: 1.6 } },
  dance: { rotate: [-12, 12, -12, 12, 0], x: [-30, 30, -30, 30, 0], transition: { duration: 1.6 } },
};
const FLOP: TargetAndTransition = { rotate: [0, -12, 12, 80], y: [0, -20, 0, 30], scaleY: [1, 1, 1, 0.85], transition: { duration: 1.1 } };

export function CanItScene({ scene, onWin, onNext, sync }: { scene: CanIt; onWin: (gem: boolean) => void; onNext: () => void; sync?: ActivitySync }) {
  const reduce = useReducedMotion();
  const [state, setState] = useSyncedState(sync, { round: 0, gemDone: false });
  const { round, gemDone } = state;
  const total = scene.rounds.length;
  const r = round < total ? scene.rounds[round] : undefined;
  const a = r ? scene.animals[r.animal] : undefined;
  const done = round >= total;
  const busy = useRef(false);
  const [show, setShow] = useState<{ kind: 'do' | 'flop' | 'shake'; act: Act; k: number } | null>(null);
  const [hint, setHint] = useState(false);
  const [bubble, setBubble] = useState<string | null>(null);
  const [bursts, fire] = useBursts();

  useEffect(() => {
    busy.current = false; setShow(null); setHint(false); setBubble(null);
    if (!r) return;
    const t = window.setTimeout(() => cueSpeak(r.ask, scene.who), 900);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, scene.id]);

  const wait = (ms: number) => new Promise((res) => window.setTimeout(res, reduce ? 0 : ms));
  const answer = async (yes: boolean) => {
    if (!r || busy.current) return;
    busy.current = true;
    const right = yes === r.can;
    if (right) {
      sfx.match();
      if (r.can) { setShow({ kind: 'do', act: r.action, k: Date.now() }); fire(50, 55, 'stars'); }
      else { setShow({ kind: 'shake', act: r.action, k: Date.now() }); await wait(700); setShow({ kind: 'do', act: r.real, k: Date.now() }); }
      await sayWithin(r.answer, scene.who, 2800);
      await wait(400);
      const next = round + 1;
      if (next >= total && !gemDone) { fire(50, 40, 'confetti'); sfx.gem(); onWin(true); }
      setState((s) => ({ ...s, round: next, gemDone: s.gemDone || next >= total }));
      return;
    }
    sfx.wrong();
    if (!r.can) { // said "yes" but it can't: it tries… and flops
      setShow({ kind: 'flop', act: r.action, k: Date.now() }); setBubble('?');
      await wait(1200); setBubble(null);
      setShow({ kind: 'do', act: r.real, k: Date.now() });
    } else { // said "no" but it can: it proudly does it
      setShow({ kind: 'do', act: r.action, k: Date.now() });
    }
    await sayWithin(r.answer, scene.who, 2800);
    setHint(true); busy.current = false;
  };

  const anim: TargetAndTransition = reduce || !show ? { y: [0, -8, 0], transition: { duration: 1.6, repeat: Infinity } }
    : show.kind === 'flop' ? FLOP : show.kind === 'shake' ? { rotate: [0, -10, 10, -10, 0], transition: { duration: 0.6 } } : MOVE[show.act];

  return (
    <div className="absolute inset-0 select-none overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      {done && <Confetti count={60} />}
      {/* sweeping circus spotlights */}
      {!reduce && [0, 1].map((k) => (
        <motion.span key={k} className="pointer-events-none absolute top-0 z-[1] h-[90%] w-[26%] origin-top rounded-b-full mix-blend-screen"
          style={{ left: k ? '58%' : '16%', background: 'linear-gradient(180deg, rgba(255,240,180,0.5), rgba(255,240,180,0))' }}
          animate={{ rotate: k ? [-14, 18, -14] : [14, -18, 14] }} transition={{ duration: 4.5 + k, repeat: Infinity, ease: 'easeInOut' }} />
      ))}

      <div className="pointer-events-none absolute inset-x-0 top-14 z-30 flex justify-center px-14">
        <span className="text-center font-black text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.15rem, min(calc(3*var(--svw,1vw)), 5vh), 2.4rem)' }}>
          {done ? scene.doneLine : r?.ask ?? ''}
        </span>
      </div>
      {r && !done && (
        <div className="pointer-events-none absolute left-1/2 top-[24%] z-30 -translate-x-1/2 rounded-full bg-gradient-to-b from-amber-300 to-orange-400 px-5 py-1 font-black text-white shadow-lg [text-shadow:0_0.3vh_0_rgba(0,0,0,0.3)]" style={{ fontSize: 'min(4vh, 2.6vw)' }}>
          {EMOJI[r.action]} {r.action}?
        </div>
      )}

      {/* the animal in the ring (cut-out sticker) */}
      <AnimatePresence mode="wait">
        {a && (
          <motion.div key={`an-${round}`} className="absolute left-1/2 top-[57%] z-20" style={{ width: 'min(32vh, 21vw)', aspectRatio: '1', translate: '-50% -50%' }}
            initial={reduce ? false : { x: '-120vw', rotate: -20 }} animate={{ x: 0, rotate: 0 }} exit={reduce ? undefined : { x: '120vw', rotate: 20, transition: { duration: 0.5 } }}
            transition={{ type: 'spring', stiffness: 90, damping: 14 }}>
            {/* water appears when it swims */}
            {show?.kind === 'do' && show.act === 'swim' && (
              <motion.span key={`w-${show.k}`} className="pointer-events-none absolute -inset-x-[30%] bottom-[2%] h-[30%] rounded-[50%] bg-gradient-to-b from-sky-300/80 to-blue-500/80"
                initial={{ scaleX: 0, opacity: 0 }} animate={{ scaleX: 1, opacity: 1 }} transition={{ duration: 0.3 }} />
            )}
            <motion.img key={show?.k ?? 'idle'} src={a.img} alt={a.word} draggable={false} className="relative h-full w-full object-contain drop-shadow-[0_1.5vh_1vh_rgba(0,0,0,0.3)]"
              style={{ transformOrigin: '50% 90%' }} animate={anim} />
            <AnimatePresence>
              {bubble && (
                <motion.span className="absolute -top-[6%] right-[6%] grid h-[24%] w-[24%] place-items-center rounded-full bg-gradient-to-b from-yellow-200 to-amber-300 text-[5vh] font-black text-amber-800 shadow-lg"
                  initial={{ scale: 0 }} animate={{ scale: 1, rotate: [0, -10, 10, 0] }} exit={{ scale: 0 }}>{bubble}</motion.span>
              )}
            </AnimatePresence>
            <span className="absolute -bottom-[4%] left-1/2 -translate-x-1/2 rounded-full bg-red-800/80 px-3 font-black text-amber-50" style={{ fontSize: 'min(2.8vh, 1.8vw)' }}>{a.word}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Yes / No */}
      {r && !done && (
        <div className="absolute inset-x-0 bottom-[6%] z-30 flex justify-center gap-[6vw]">
          {[true, false].map((yes) => {
            const glow = hint && yes === r.can;
            return (
              <motion.button key={String(yes)} type="button" aria-label={yes ? 'Yes, it can' : "No, it can't"} onClick={() => { void answer(yes); }}
                className={`relative flex items-center gap-2 rounded-full border-[0.6vh] px-[3vw] py-[1.2vh] font-black text-white shadow-[0_0.8vh_0_rgba(0,0,0,0.25)] ${yes ? 'border-green-200 bg-gradient-to-b from-green-400 to-green-600' : 'border-rose-200 bg-gradient-to-b from-rose-400 to-rose-600'}`}
                style={{ fontSize: 'min(4.2vh, 2.8vw)' }} whileTap={{ scale: 0.92 }}
                animate={glow && !reduce ? { scale: [1, 1.1, 1] } : {}} transition={{ duration: 0.8, repeat: glow ? Infinity : 0 }}>
                {glow && <span className="pointer-events-none absolute -inset-[10%] -z-10 animate-pulse rounded-full bg-yellow-300/80 blur-lg" />}
                <span style={{ fontSize: '1.4em' }}>{yes ? '👍' : '👎'}</span>{yes ? 'Yes, it can!' : "No, it can't!"}
              </motion.button>
            );
          })}
        </div>
      )}

      <Bursts items={bursts} />
      <AnimatePresence>
        {done && (
          <motion.div className="absolute inset-x-0 bottom-[14%] z-40 flex justify-center" initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8, type: 'spring' }}>
            <button onClick={onNext} className={`${CLAY_BUTTON} px-10 py-3 text-xl`}>Next ⭐</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
