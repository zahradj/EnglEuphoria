import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { Scene } from '../scenes';
import { getEmotionSprite } from '../scenes';
import { cueSpeak, playLetterPhonic } from '../audio';
import * as sfx from '../sfx';
import { Confetti } from '../fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { CLAY_BUTTON, THICK_WORDS, sayWithin } from './shared';
import { Bursts, useBursts, useShake } from './gameFx';

/* ---------- Wind Catch (Pre-A1 Unit 1 Lesson 5 signature game) ----------
 * After "Leo's Lost Star": the wind that blew the star away now carries the story things across the sky — the hat, the
 * bat, the mat, the ant, the nut and the star — bobbing at different heights. Leo says "Catch the bat!"; the child taps
 * it, it drops into Leo's basket and stays there, and we hear its first sound from the recorded phonics clip, then the
 * word ("A bat!"). A wrong thing is named back ("That's the hat!") and floats on. The last round is the star: Leo's sad
 * face turns happy.
 * Researched (mechanics only): the catch-the-falling-object arcade play of kids' apps (Lingokids, Khan Academy Kids),
 * Cambridge Pre A1 "listen and point", and the story's own wind beat. Better: nothing is timed and nothing is lost —
 * the things keep floating until the child is ready; every catch is named back with its first sound (the unit's
 * phonics); the basket keeps what was caught; and the game IS the story (the wind took the star — we catch it back). */

type Catch = Extract<Scene, { kind: 'wind-catch' }>;
export const windWrongLine = (label: string) => `That's the ${label}! Listen again!`;

/** Each thing's own lane in the sky (top %, seconds to cross, start offset) — fixed by index so both screens agree. */
const lane = (i: number) => ({ top: 18 + (i % 3) * 14 + (i % 2) * 4, secs: 13 + (i % 4) * 1.8, delay: -((i * 4.7) % 13) });

export function WindCatchScene({ scene, onWin, onNext, sync }: { scene: Catch; onWin: (gem: boolean) => void; onNext: () => void; sync?: ActivitySync }) {
  const reduce = useReducedMotion();
  const [state, setState] = useSyncedState(sync, { round: 0, caught: [] as number[], gemDone: false });
  const { round, caught, gemDone } = state;
  const total = scene.rounds.length;
  const r = round < total ? scene.rounds[round] : undefined;
  const done = round >= total;
  const busy = useRef(false);
  const [wrong, setWrong] = useState(-1);
  const [bursts, fire] = useBursts();
  const [shakeCtl, shake] = useShake();
  const caughtSet = new Set(Array.isArray(caught) ? caught : []);

  useEffect(() => {
    busy.current = false;
    if (!r) return undefined;
    const t = window.setTimeout(() => cueSpeak(r.line, scene.who), 700);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, scene.id]);

  const tap = async (i: number) => {
    const th = scene.things[i];
    if (!r || !th || busy.current || caughtSet.has(i)) return;
    busy.current = true;
    if (i !== r.thing) {
      sfx.wrong(); shake(); setWrong(i);
      await sayWithin(windWrongLine(th.label), scene.who, 2600);
      setWrong(-1);
      busy.current = false;
      return;
    }
    sfx.pop(); window.setTimeout(() => sfx.match(), 200);
    fire(80, 78, 'stars');
    setState((s) => ({ ...s, caught: [...(Array.isArray(s.caught) ? s.caught : []), i] }));
    await Promise.race([playLetterPhonic(th.sound), new Promise((res) => window.setTimeout(res, 1500))]);
    await sayWithin(r.reply, scene.who, 3200);
    const next = round + 1;
    if (next >= total && !gemDone) { fire(50, 40, 'confetti'); sfx.gem(); onWin(true); }
    setState((s) => ({ ...s, round: next, gemDone: s.gemDone || next >= total }));
    if (next >= total) void sayWithin(scene.doneLine, scene.who, 4000);
  };

  const starCaught = scene.things.some((t, i) => t.label === 'star' && caughtSet.has(i));
  return (
    <motion.div className="absolute inset-0 select-none overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }} animate={shakeCtl}>
      {done && <Confetti count={60} />}
      <div className="pointer-events-none absolute inset-x-0 top-[3%] z-30 flex flex-col items-center gap-1 px-14">
        <span className="text-center font-black leading-tight text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.2rem, min(calc(3.4*var(--svw,1vw)), 5.6vh), 2.8rem)' }}>
          {r ? `\u{1F32C}\u{FE0F} ${r.line}` : scene.doneLine}
        </span>
        {r && (
          <button type="button" onClick={() => { sfx.click(); cueSpeak(r.line, scene.who); }} className="pointer-events-auto rounded-full bg-white/90 px-4 py-1 font-black text-sky-800 shadow" style={{ fontSize: 'min(2.4vh, 1.6vw)' }}>
            🔊 {round + 1}/{total}
          </button>
        )}
      </div>
      {/* the things on the wind */}
      {!done && scene.things.map((th, i) => {
        if (caughtSet.has(i)) return null;
        const l = lane(i);
        return (
          // wrapper flies across the sky; the button inside bobs and shakes (framer x/y on one element would fight)
          <motion.div key={`${th.label}-${i}`} className="absolute z-20" style={{ top: `${l.top}%`, left: reduce ? `${4 + i * (78 / Math.max(1, scene.things.length - 1))}%` : '-14%' }}
            animate={reduce ? undefined : { left: ['-14%', '104%'] }}
            transition={reduce ? undefined : { duration: l.secs, delay: l.delay, repeat: Infinity, ease: 'linear' }}>
            <motion.button type="button" onClick={() => void tap(i)} aria-label={th.label}
              className="block rounded-full bg-white/35 p-[0.6vh] shadow-lg backdrop-blur-[1px]"
              animate={wrong === i ? { x: [0, -10, 10, -6, 0] } : reduce ? {} : { y: [0, -14, 0, 10, 0], rotate: [-6, 6, -6] }}
              transition={wrong === i ? { duration: 0.4 } : { duration: 2.4 + (i % 3) * 0.5, repeat: Infinity, ease: 'easeInOut' }}>
              <img src={th.img} alt="" draggable={false} className="h-[min(15vh,10vw)] w-[min(15vh,10vw)] object-contain drop-shadow-xl" />
            </motion.button>
          </motion.div>
        );
      })}
      {/* Leo and his basket: what was caught stays */}
      <div className="absolute bottom-[3%] right-[3%] z-30 flex items-end gap-[1vw]">
        <div className="flex h-[min(18vh,12vw)] min-w-[min(30vh,20vw)] items-end justify-center gap-[0.4vw] rounded-b-[3vh] rounded-t-[1vh] border-[0.6vh] border-amber-800 bg-gradient-to-b from-amber-300 to-amber-600 px-[0.8vw] pb-[1vh] shadow-2xl">
          <AnimatePresence>
            {(Array.isArray(caught) ? caught : []).map((i) => scene.things[i] && (
              <motion.img key={i} src={scene.things[i].img} alt={scene.things[i].label} draggable={false} className="h-[min(9vh,6vw)] w-auto object-contain drop-shadow"
                initial={reduce ? false : { y: -260, scale: 0.4, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 220, damping: 15 }} />
            ))}
          </AnimatePresence>
        </div>
        <motion.img src={getEmotionSprite('leo', starCaught ? 'happy' : 'sad')} alt="Leo" draggable={false} className="h-[min(30vh,20vw)] w-auto object-contain drop-shadow-2xl"
          animate={starCaught && !reduce ? { y: [0, -24, 0, -12, 0] } : {}} transition={{ duration: 1.2 }} />
      </div>
      <Bursts items={bursts} />
      {done && <button type="button" onClick={onNext} className={`${CLAY_BUTTON} absolute left-1/2 top-[42%] z-40 -translate-x-1/2 px-10 py-3 text-xl`}>Next ⭐</button>}
    </motion.div>
  );
}
