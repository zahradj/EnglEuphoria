import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../../unit1/audio';
import * as sfx from '../../unit1/sfx';
import { Confetti } from '../../unit1/fx';
import { CalmBg, Bursts, FloatText, useBursts } from '../../unit1/scene-components/gameFx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { voiceOf } from './shared';
import { CLAY_BUTTON, THICK_WORDS } from '../../unit1/scene-components/shared';
import { moodSentence, moodReason, moodAsk, MOOD_PULL, MOOD_WRONG } from './moodRules';

/* ---------- Monster Mood Machine ★ (docs/a1-unit-5-monster-town.md §5.1) ----------
 * A bubbling potion machine in Professor Glob's lab. 1 PULL the lever: the potion bubbles, a flash — and the whole screen
 * becomes the REASON, a full painted scene plate (the dark hall, the long lesson, the party…), with Bibi standing in it
 * ("Because it's dark!"; owner 2026-10-14: "generate a full scene plate for that… make it more relevant"). 2 PICK: three feeling cards — the child picks the one that fits; the monster's
 * face changes to it. 3 SAY: the whole sentence appears ("Bibi is scared because it's dark.") — the child says it and
 * taps 🎤; a potion bottle fills. Mechanics: mime + "Why? — Because…" game cards (onestopenglish), emotion Pictionary
 * (ESL Kids Stuff), build-a-face feelings games (Khan Academy Kids, Lingokids). Better: the reason is a picture, so a
 * beginner can always answer "why"; the feeling is chosen FROM the reason (meaning first), the face changes as the
 * child decides, and the child says the full because-sentence before the next pull. */

type Mood = Extract<Scene, { kind: 'mood-machine' }>;
type Phase = 'pull' | 'pick' | 'say';

const CARD_TINTS = ['#F3E8FF', '#CCFBF1', '#FEF3C7'];
const CARD_RIMS = ['#A855F7', '#14B8A6', '#F59E0B'];

export function MoodMachineScene({ scene, onNext, onWin, onLose, sync }: { scene: Mood; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void; sync?: ActivitySync }) {
  const reduce = useReducedMotion();
  const [state, setState] = useSyncedState(sync, { r: 0, phase: 'pull', wrong: -1, done: false });
  const total = scene.rounds.length;
  const r = Math.max(0, Math.min(total - 1, Number(state.r) || 0));
  const round = scene.rounds[r];
  const phase = (['pull', 'pick', 'say'].includes(String(state.phase)) ? String(state.phase) : 'pull') as Phase;
  const done = !!state.done;
  const wrong = Number(state.wrong);
  const [bursts, fire] = useBursts();
  const [star, setStar] = useState(false);
  const gemDone = useRef(false);

  const feelingOf = (i: number) => scene.feelings[i];
  const answer = round ? feelingOf(round.feeling) : undefined;
  const sentence = round && answer ? moodSentence(scene.monster.name, answer.feeling, round.reason) : '';
  const face = phase === 'say' && answer ? answer.img : scene.monster.img;

  useEffect(() => {
    if (done) return;
    const t = window.setTimeout(() => cueSpeak(MOOD_PULL, voiceOf(scene.who)), 700);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [r]);
  useEffect(() => {
    if (done && !gemDone.current) { gemDone.current = true; sfx.gem(); onWin(true); cueSpeak(scene.doneLine, voiceOf(scene.who)); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  if (!round) return null;

  const pull = () => {
    if (phase !== 'pull' || done) return;
    sfx.whoop();
    setState((s) => ({ ...s, phase: 'pick', wrong: -1 }));
    window.setTimeout(() => { sfx.pop(); cueSpeak(`${moodReason(round.reason)} ${moodAsk(scene.monster.name)}`, voiceOf(scene.who)); }, 900);
  };
  const pick = (f: number) => {
    if (phase !== 'pick' || done) return;
    if (f !== round.feeling) {
      sfx.wrong(); onLose();
      setState((s) => ({ ...s, wrong: f }));
      window.setTimeout(() => setState((s) => ({ ...s, wrong: -1 })), 650);
      cueSpeak(MOOD_WRONG, voiceOf(scene.who));
      return;
    }
    sfx.match();
    fire(18, 45, 'sparkle');
    setState((s) => ({ ...s, phase: 'say', wrong: -1 }));
    window.setTimeout(() => cueSpeak(sentence, 'teacher'), 450);
  };
  const said = () => {
    if (phase !== 'say' || done) return;
    sfx.gem();
    fire(50, 80, 'stars');
    setStar(true);
    window.setTimeout(() => setStar(false), 900);
    window.setTimeout(() => setState((s) => {
      const n = (Number(s.r) || 0) + 1;
      return n >= total ? { ...s, done: true } : { ...s, r: n, phase: 'pull', wrong: -1 };
    }), 900);
  };

  const big = 'clamp(1rem, min(calc(2.4*var(--svw,1vw)), 3.8vh), 2rem)';
  return (
    <div className="absolute inset-0 select-none overflow-hidden" style={{ background: '#2E1065' }}>
      <CalmBg img={scene.bg} />
      {/* the machine brews the REASON: the whole screen becomes that place (cross-fade only — never zoom or pan) */}
      <AnimatePresence>
        {phase !== 'pull' && !done && (
          <motion.div key={`plate-${r}`} className="absolute inset-0 z-[5] bg-cover bg-center" style={{ backgroundImage: `url(${round.img})` }}
            initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: 0.8, delay: reduce ? 0 : 0.9 } }} exit={{ opacity: 0, transition: { duration: 0.4 } }}>
            <div className="absolute inset-y-0 end-0 w-[32%] bg-gradient-to-l from-violet-950/50 to-transparent rtl:bg-gradient-to-r" />
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {phase === 'pick' && !reduce && (
          <motion.div key={`flash-${r}`} className="pointer-events-none absolute inset-0 z-[6] bg-white"
            initial={{ opacity: 0 }} animate={{ opacity: [0, 0.75, 0] }} exit={{ opacity: 0 }} transition={{ duration: 0.9, delay: 0.55, times: [0, 0.4, 1] }} />
        )}
      </AnimatePresence>
      {done && <Confetti count={100} />}
      <Bursts items={bursts} />
      <FloatText show={star} x={50} y={70}>+⭐</FloatText>

      {/* title + potion bottles (progress) */}
      <div className="pointer-events-none absolute inset-x-0 top-[3%] z-30 flex justify-center px-16">
        <span className="rounded-full bg-violet-900/70 px-6 py-1.5 text-center font-black text-white shadow-xl backdrop-blur-sm" style={{ ...THICK_WORDS, fontSize: big }}>
          {done ? scene.doneLine : `🧪 ${scene.title}`}
        </span>
      </div>
      <div className="absolute end-3 top-[12%] z-30 flex gap-[0.5vw] rounded-full bg-white/90 px-3 py-1.5 shadow-lg" aria-label={`${done ? total : r} of ${total}`}>
        {scene.rounds.map((_, i) => {
          const full = done || i < r;
          return (
            <motion.span key={i} animate={full && !reduce ? { scale: [1, 1.35, 1] } : {}} transition={{ duration: 0.4 }}
              className="block rounded-b-full rounded-t-[0.6vh] border-[0.35vh] border-violet-700"
              style={{ width: 'min(2.6vh,1.8vw)', height: 'min(3.6vh,2.5vw)', background: full ? 'linear-gradient(#C084FC,#7C3AED)' : 'rgba(237,233,254,0.9)' }} />
          );
        })}
      </div>

      {/* the monster: her face changes with the feeling the child picks */}
      <div className="absolute bottom-[4%] start-[2%] z-20 flex w-[26%] flex-col items-center">
        <AnimatePresence mode="wait">
          <motion.img key={face} src={face} alt={scene.monster.name} draggable={false}
            initial={reduce ? false : { scale: 0.6, opacity: 0, rotate: -6 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 15 }}
            className="h-[min(50vh,30vw)] w-auto object-contain drop-shadow-[0_14px_18px_rgba(30,10,60,0.45)]" />
        </AnimatePresence>
        <span className="-mt-[1vh] rounded-full bg-violet-600 px-4 py-1 font-black text-white shadow-lg" style={{ fontSize: 'min(3vh,2vw)' }}>{scene.monster.name}</span>
      </div>

      {/* the machine: bubbles in the bowl while it works */}
      <AnimatePresence>
        {phase !== 'pull' && !done && !reduce && (
          <motion.div key={`bub-${r}`} className="pointer-events-none absolute left-[36%] top-[10%] z-[4] h-[34%] w-[26%]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {Array.from({ length: 9 }, (_, i) => (
              <motion.span key={i} className="absolute rounded-full border-2 border-white/80 bg-fuchsia-300/60"
                style={{ left: `${8 + i * 10}%`, bottom: 0, width: `${1.4 + (i % 3) * 0.7}vh`, height: `${1.4 + (i % 3) * 0.7}vh` }}
                animate={{ y: ['0vh', '-24vh'], opacity: [0, 1, 0] }} transition={{ duration: 1.4 + (i % 4) * 0.3, repeat: Infinity, delay: i * 0.17, ease: 'easeOut' }} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* the lever */}
      {!done && phase === 'pull' && (
        <motion.button type="button" onClick={pull} aria-label="Pull the lever"
          className={`${CLAY_BUTTON} absolute left-[64%] top-[30%] z-30 flex flex-col items-center px-7 py-4`}
          animate={reduce ? {} : { y: [0, -6, 0], rotate: [-3, 3, -3] }} transition={{ duration: 1.6, repeat: Infinity }}
          style={{ fontSize: 'min(3.6vh,2.4vw)' }}>
          <span style={{ fontSize: 'min(6vh,4vw)' }}>🕹️</span>Pull!
        </motion.button>
      )}

      {/* the reason, said in words under the title */}
      <AnimatePresence>
        {phase !== 'pull' && !done && (
          <div key={`because-${r}`} className="pointer-events-none absolute inset-x-0 top-[13%] z-30 flex justify-center">
            <motion.span initial={reduce ? false : { y: -20, opacity: 0, scale: 0.8 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 16, delay: reduce ? 0 : 1.3 }}
              className="rounded-full border-[0.4vh] border-white bg-amber-50 px-5 py-1.5 font-black text-violet-800 shadow-xl" style={{ fontSize: 'min(3.4vh,2.3vw)' }}>
              because {round.reason}
            </motion.span>
          </div>
        )}
      </AnimatePresence>

      {/* feeling cards */}
      {!done && phase !== 'pull' && (
        <div className="absolute end-[2.5%] top-[22%] z-30 flex w-[20%] flex-col gap-[1.6vh]">
          {round.choices.map((f, i) => {
            const fl = feelingOf(f);
            if (!fl) return null;
            const right = phase === 'say' && f === round.feeling;
            return (
              <motion.button key={`${r}-${f}`} type="button" onClick={() => pick(f)} disabled={phase !== 'pick'}
                initial={reduce ? false : { x: 80, opacity: 0 }}
                animate={wrong === f ? { x: [0, -10, 10, -6, 0], opacity: 1 } : { x: 0, opacity: phase === 'say' && !right ? 0.45 : 1, scale: right ? 1.06 : 1 }}
                transition={wrong === f ? { duration: 0.4 } : { type: 'spring', stiffness: 260, damping: 18, delay: reduce ? 0 : 1 + i * 0.12 }}
                whileTap={{ scale: 0.94 }}
                className="flex items-center gap-[0.8vw] rounded-[2vh] border-[0.5vh] px-[0.8vw] py-[0.6vh] text-start font-black shadow-xl"
                style={{ background: CARD_TINTS[i % 3], borderColor: right ? '#22C55E' : CARD_RIMS[i % 3], color: '#3B0764', fontSize: 'min(3.4vh,2.3vw)' }}>
                <img src={fl.img} alt="" draggable={false} className="h-[min(10vh,6.5vw)] w-auto object-contain" />
                {fl.feeling}
                {right && <span className="ms-auto">✅</span>}
              </motion.button>
            );
          })}
        </div>
      )}

      {/* say the whole sentence */}
      <AnimatePresence>
        {phase === 'say' && !done && (
          <div key={`say-${r}`} className="absolute inset-x-0 bottom-[3%] z-30 flex justify-center">
          <motion.div className="flex w-[min(52vw,90vh)] flex-col items-center gap-[1vh] rounded-[2.4vh] bg-white/95 px-[1.6vw] py-[1.4vh] shadow-2xl"
            initial={reduce ? false : { y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}>
            <span className="text-center font-black text-violet-900" style={{ fontSize: big }}>{sentence}</span>
            <div className="flex gap-[1vw]">
              <button type="button" onClick={() => cueSpeak(sentence, 'teacher')} className="rounded-full bg-violet-100 px-5 py-2 font-black text-violet-800 shadow" style={{ fontSize: 'min(2.8vh,1.9vw)' }}>🔊 Listen</button>
              <button type="button" onClick={said} className={`${CLAY_BUTTON} px-7 py-2`} style={{ fontSize: 'min(2.8vh,1.9vw)' }}>🎤 I said it!</button>
            </div>
          </motion.div>
          </div>
        )}
      </AnimatePresence>

      {done && <button type="button" onClick={onNext} className={`${CLAY_BUTTON} absolute bottom-[8%] left-1/2 z-40 -translate-x-1/2 px-10 py-3 text-xl`}>Next ⭐</button>}
    </div>
  );
}
