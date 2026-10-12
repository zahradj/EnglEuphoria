import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, type TargetAndTransition, useReducedMotion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { Confetti } from '../fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { CLAY_BUTTON, THICK_WORDS, sayWithin } from './shared';
import { Bursts, useBursts } from './gameFx';

/* ---------- Beach Talent Show (U10L2, owner 2026-10-12: vary every lesson; "I can …") ----------
 * A little stage on the beach. Behind a glowing paper screen a friend is getting ready: the child sees only their
 * moving SHADOW (the action GIF as a silhouette). The host asks "What can he do?" — the child taps the act
 * (picture tickets, each says its word). Anticipation: a drum-roll pause, the screen rolls up, spotlights, the
 * friend performs in colour and says "I can swim!", the beach audience claps. Then it is the child's turn to say
 * it. A wrong ticket: the shadow shakes its head and the host says the word back — nothing is lost; after two
 * misses the right ticket glows. Sources (mechanic only): Lingokids / Khan Kids "guess the action" silhouettes,
 * shadow-puppet theatre, Cambridge Pre A1 "Can you …?" talk. Better: the shadow MOVES (the real action), so the
 * child guesses from the movement itself, and the reveal ends in the target sentence "I can …". */

type Show = Extract<Scene, { kind: 'talent-show' }>;
const SHADOW_MOVE: Record<'swim' | 'dance' | 'sing', TargetAndTransition> = {
  swim: { y: [0, -10, 0, 6, 0], rotate: [0, -6, 0, 6, 0], x: [0, 12, 0, -12, 0] },
  dance: { rotate: [-10, 10, -10], x: [-16, 16, -16], y: [0, -14, 0] },
  sing: { y: [0, -8, 0], scaleY: [1, 1.04, 1], rotate: [-3, 3, -3] },
};

export function TalentShowScene({ scene, onWin, onNext, sync }: { scene: Show; onWin: (gem: boolean) => void; onNext: () => void; sync?: ActivitySync }) {
  const reduce = useReducedMotion();
  const [state, setState] = useSyncedState(sync, { round: 0, open: false, gemDone: false });
  const { round, open, gemDone } = state;
  const total = scene.rounds.length;
  const r = round < total ? scene.rounds[round] : undefined;
  const act = r ? scene.acts[r.act] : undefined;
  const done = round >= total;
  const busy = useRef(false);
  const [nope, setNope] = useState(-1);
  const [misses, setMisses] = useState(0);
  const [drum, setDrum] = useState(false);
  const [bursts, fire] = useBursts();

  useEffect(() => {
    busy.current = false; setMisses(0); setNope(-1); setDrum(false);
    if (!r) return;
    const t = window.setTimeout(() => cueSpeak(r.ask, scene.who), 600);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, scene.id]);

  const pick = async (i: number) => {
    if (!r || !act || busy.current || open) return;
    const a = scene.acts[i];
    if (i !== r.act) {
      sfx.wrong(); setNope(i); setMisses((m) => m + 1);
      await sayWithin(`${a.word.charAt(0).toUpperCase()}${a.word.slice(1)}? No! Look again!`, scene.who, 1800);
      setNope(-1); return;
    }
    busy.current = true;
    sfx.click(); setDrum(true);
    await new Promise((res) => window.setTimeout(res, reduce ? 0 : 900)); // drum-roll: the screen trembles
    setDrum(false); sfx.whoop();
    setState((s) => ({ ...s, open: true }));
    await new Promise((res) => window.setTimeout(res, reduce ? 0 : 450));
    sfx.match(); fire(50, 40, 'confetti'); fire(30, 80, 'stars'); fire(70, 80, 'stars');
    await sayWithin(act.line, act.who, 2400);
    await sayWithin(r.reply, scene.who, 2200);
    await new Promise((res) => window.setTimeout(res, 600));
    const next = round + 1;
    if (next >= total && !gemDone) { sfx.gem(); onWin(true); }
    setState((s) => ({ ...s, round: next, open: false, gemDone: s.gemDone || next >= total }));
  };

  const W = 'min(40vh, 28vw)';
  return (
    <div className="absolute inset-0 select-none overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      {done && <Confetti count={70} />}
      <div className="pointer-events-none absolute inset-x-0 top-14 z-30 flex justify-center px-14">
        <span className="text-center font-black text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.15rem, min(calc(3*var(--svw,1vw)), 5vh), 2.4rem)' }}>
          {done ? 'What a show! Everybody can do something!' : open && act ? act.line : 'Look at the shadow! What can they do?'}
        </span>
      </div>

      {/* sweeping spotlights (live UI light over the still stage picture) */}
      {!reduce && [0, 1].map((k) => (
        <motion.span key={k} className="pointer-events-none absolute top-[8%] z-10 h-[70%] w-[22%] origin-top rounded-b-full mix-blend-screen"
          style={{ left: k ? '62%' : '16%', background: 'linear-gradient(180deg, rgba(255,247,200,0.55), rgba(255,247,200,0))' }}
          animate={open ? { rotate: k ? 18 : -18, opacity: 1 } : { rotate: k ? [-12, 22, -12] : [12, -22, 12], opacity: 0.7 }}
          transition={open ? { duration: 0.4 } : { duration: 4 + k, repeat: Infinity, ease: 'easeInOut' }} />
      ))}

      {/* the act: a moving shadow behind the glowing screen, then in full colour */}
      {act && (
        <div className="absolute left-1/2 top-[44%] z-20" style={{ width: W, aspectRatio: '1', translate: '-50% -50%' }}>
          {open ? (
            <motion.img key={`act-${round}`} src={act.gif} alt="" draggable={false} className="absolute inset-0 h-full w-full rounded-[2vh] object-contain"
              initial={false} animate={reduce ? {} : { scale: [0.9, 1.08, 1], y: [10, -12, 0] }} transition={{ duration: 0.5 }} />
          ) : (
            // the shadow moves the way the act moves (swim: bob and stroke, dance: sway, sing: bounce)
            <motion.img key={`shadow-${round}`} src={act.shadow} alt="" draggable={false} className="absolute inset-[6%] h-[88%] w-[88%] object-contain opacity-80"
              style={{ transformOrigin: '50% 90%' }}
              animate={reduce ? {} : nope >= 0 ? { rotate: [0, -8, 8, 0] } : SHADOW_MOVE[act.move]}
              transition={nope >= 0 ? { duration: 0.45 } : { duration: act.move === 'dance' ? 0.9 : 1.2, repeat: Infinity, ease: 'easeInOut' }} />
          )}
          {/* the backlit paper screen (rolls up on the reveal) */}
          <motion.div className="pointer-events-none absolute -inset-[6%] origin-top rounded-[2.5vh] border-[1.2vh] border-amber-800 shadow-[0_2vh_3vh_rgba(0,0,0,0.35)]"
            style={{ background: 'radial-gradient(circle at 50% 45%, rgba(255,249,219,0.35), rgba(253,224,138,0.55) 60%, rgba(217,160,70,0.7))' }}
            animate={open ? { scaleY: 0, opacity: 0.6 } : drum && !reduce ? { x: [0, -5, 5, -4, 4, 0], scaleY: 1, opacity: 1 } : { scaleY: 1, opacity: 1 }}
            transition={open ? { duration: 0.45, ease: 'easeIn' } : drum ? { duration: 0.3, repeat: 2 } : { duration: 0.3 }} />
        </div>
      )}

      {/* the curtains frame the stage and sway */}
      {[0, 1].map((k) => (
        <motion.img key={k} src={scene.curtain} alt="" draggable={false} className="pointer-events-none absolute top-[2%] z-20 h-[86%] object-contain"
          style={{ [k ? 'right' : 'left']: '-2%', transform: k ? 'scaleX(-1)' : undefined, transformOrigin: k ? '100% 0' : '0 0' } as React.CSSProperties}
          animate={reduce ? {} : done ? { x: k ? '-60%' : '60%' } : { rotate: [0, k ? -1.2 : 1.2, 0] }}
          transition={done ? { duration: 0.9, ease: 'easeInOut' } : { duration: 3.2 + k * 0.5, repeat: Infinity, ease: 'easeInOut' }} />
      ))}

      {/* audience applause */}
      <AnimatePresence>
        {open && !reduce && [12, 28, 44, 60, 76, 90].map((x, k) => (
          <motion.span key={`clap-${round}-${k}`} className="pointer-events-none absolute bottom-[4%] z-30 text-[5vh]" style={{ left: `${x}%` }}
            initial={{ y: 30, opacity: 0, scale: 0.6 }} animate={{ y: [30, -20, -10, -30], opacity: [0, 1, 1, 0], scale: [0.6, 1.1, 1, 1.1] }} exit={{ opacity: 0 }}
            transition={{ duration: 1.6, delay: k * 0.08 }}>👏</motion.span>
        ))}
      </AnimatePresence>

      {/* the tickets: one per act */}
      {!done && (
        <div className="absolute inset-x-0 bottom-[3%] z-30 flex justify-center gap-[3vw]">
          {scene.acts.map((a, i) => {
            const glow = misses >= 2 && r && i === r.act && !open;
            return (
              <motion.button key={a.word} type="button" aria-label={a.word} onClick={() => { void pick(i); }} disabled={open}
                className="relative flex flex-col items-center rounded-[2.5vh] border-[0.6vh] border-amber-300 bg-gradient-to-b from-sky-300 to-sky-500 p-[0.8vh] shadow-[0_0.8vh_0_#b45309,0_1.5vh_2vh_rgba(0,0,0,0.3)] disabled:opacity-60"
                animate={nope === i && !reduce ? { x: [0, -10, 10, -6, 0] } : reduce ? {} : { y: [0, -5, 0] }}
                transition={nope === i ? { duration: 0.45 } : { duration: 1.8 + i * 0.25, repeat: Infinity, ease: 'easeInOut' }}
                whileTap={{ scale: 0.92 }}>
                {glow && <span className="pointer-events-none absolute -inset-[12%] -z-10 animate-pulse rounded-[3vh] bg-yellow-300/80 blur-lg" />}
                <img src={a.gif} alt="" draggable={false} className="object-contain drop-shadow-[0_0.5vh_0.4vh_rgba(0,0,0,0.3)]" style={{ width: 'min(15vh, 10vw)', height: 'min(15vh, 10vw)' }} />
                <span className="mt-[0.4vh] font-black text-white [text-shadow:0_0.3vh_0_rgba(0,0,0,0.35)]" style={{ fontSize: 'min(3.4vh, 2.2vw)' }}>{a.word}</span>
              </motion.button>
            );
          })}
        </div>
      )}

      <Bursts items={bursts} />
      <AnimatePresence>
        {done && (
          <motion.div className="absolute inset-x-0 bottom-[14%] z-40 flex justify-center" initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.9, type: 'spring' }}>
            <button onClick={() => { cueSpeak(scene.doneLine, scene.who); onNext(); }} className={`${CLAY_BUTTON} px-10 py-3 text-xl`}>Next ⭐</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
