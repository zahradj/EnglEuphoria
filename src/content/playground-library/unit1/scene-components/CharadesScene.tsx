import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { Confetti } from '../fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { CLAY_BUTTON, THICK_WORDS, sayWithin } from './shared';
import { Bursts, useBursts } from './gameFx';

/* ---------- Action Charades (U10L6 signature, owner 2026-10-12: review the whole unit, "Action Charades") ----------
 * Games night. Two turns take it in turns:
 *  GUESS — a friend pulls a card from the magic hat and acts it out behind a little curtain. The curtain opens bit
 *  by bit (a peek, half, all); the child can guess at any moment from three spoken word buttons. Guess early, more
 *  stars. Right: the curtain flies open, the friend shows off and the narrator says it with the right word: "He can
 *  swim!". Wrong: the button shakes, the word is said back ("Not dance! Look again!") and the curtain opens a bit more.
 *  YOUR TURN — the hat gives the CHILD a card (picture + word, said aloud: "Your turn! Can you jump? Show me!"). The
 *  child acts it out; after a calm count the 👏 button appears and the audience cheers "Yes! You can jump!".
 * Sources (mechanic only): classroom charades / "guess the action" (games4esl, teach-this), Lingokids and Khan
 * Academy Kids "guess what I'm doing" reveals, Cambridge Pre A1 Starters (actions + "Can you …?"), Kahoot-style
 * "faster = more points" without a fail state. Better: the reveal is gradual so guessing early is a choice, every
 * answer is said back as a full sentence with he / she (Lesson 5), and the child also PRODUCES the action. */

type Charades = Extract<Scene, { kind: 'charades' }>;
const EMOJI: Record<string, string> = { run: '🏃', jump: '🦘', walk: '🚶', swim: '🏊', dance: '💃', sing: '🎤', clap: '👏', play: '⚽', sleep: '😴' };
const OPEN = [0.16, 0.42, 1]; // how far the curtain is open at each step (1 = all)

export function CharadesScene({ scene, onWin, onNext, sync }: { scene: Charades; onWin: (gem: boolean) => void; onNext: () => void; sync?: ActivitySync }) {
  const reduce = useReducedMotion();
  const [state, setState] = useSyncedState(sync, { round: 0, stars: 0, gemDone: false });
  const { round, stars, gemDone } = state;
  const total = scene.rounds.length;
  const r = round < total ? scene.rounds[round] : undefined;
  const act = r ? scene.acts[r.act] : undefined;
  const done = round >= total;
  const busy = useRef(false);
  const [step, setStep] = useState(0);
  const [solved, setSolved] = useState(false);
  const [nope, setNope] = useState(-1);
  const [flipped, setFlipped] = useState(false);
  const [canClap, setCanClap] = useState(false);
  const [cheer, setCheer] = useState(0);
  const [bursts, fire] = useBursts();

  useEffect(() => {
    busy.current = false; setStep(0); setSolved(false); setNope(-1); setFlipped(false); setCanClap(false);
    if (!r || !act) { const t = window.setTimeout(() => cueSpeak(scene.doneLine, scene.who), 700); return () => window.clearTimeout(t); }
    const timers: number[] = [];
    if (r.mode === 'guess') {
      timers.push(window.setTimeout(() => cueSpeak(`${act.name}'s turn! What can ${act.pronoun.toLowerCase()} do? Guess!`, scene.who), 600));
      // the curtain opens a little more every few seconds (never closes again)
      timers.push(window.setTimeout(() => setStep((s) => Math.max(s, 1)), reduce ? 0 : 5200));
      timers.push(window.setTimeout(() => setStep((s) => Math.max(s, 2)), reduce ? 0 : 10500));
    } else {
      timers.push(window.setTimeout(() => { sfx.reveal(); setFlipped(true); cueSpeak(`Your turn! Can you ${act.word}? Show me!`, scene.who); }, reduce ? 0 : 1200));
      timers.push(window.setTimeout(() => setCanClap(true), reduce ? 0 : 5200));
    }
    return () => timers.forEach((t) => window.clearTimeout(t));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, scene.id]);

  const wait = (ms: number) => new Promise((res) => window.setTimeout(res, reduce ? 0 : ms));
  const next = (won: number) => {
    const n = round + 1;
    if (n >= total && !gemDone) { fire(50, 35, 'confetti'); sfx.gem(); onWin(true); }
    setState((s) => ({ ...s, round: n, stars: s.stars + won, gemDone: s.gemDone || n >= total }));
  };

  const guess = async (i: number) => {
    if (!r || r.mode !== 'guess' || !act || busy.current || solved) return;
    if (i !== r.act) {
      sfx.wrong(); setNope(i);
      await sayWithin(`Not ${scene.acts[i].word}! Look again!`, scene.who, 1800);
      setNope(-1); setStep((s) => Math.min(2, s + 1)); return;
    }
    busy.current = true;
    const won = 3 - step;
    sfx.match(); setSolved(true); setStep(2); fire(50, 45, 'stars');
    await sayWithin(`Yes! ${act.pronoun} can ${act.word}!`, scene.who, 2600);
    await wait(700);
    next(won);
  };

  const clap = async () => {
    if (!r || r.mode !== 'act' || !act || busy.current || !canClap) return;
    busy.current = true;
    sfx.whoop(); setCheer(Date.now()); fire(30, 75, 'stars'); fire(70, 75, 'stars');
    await sayWithin(`Yes! You can ${act.word}! Well done!`, scene.who, 2600);
    await wait(600);
    next(3);
  };

  const open = solved ? 1 : OPEN[step];
  const W = 'min(44vh, 30vw)';

  return (
    <div className="absolute inset-0 select-none overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-indigo-950/35 via-transparent to-indigo-950/35" />
      {done && <Confetti count={70} />}

      <div className="pointer-events-none absolute inset-x-0 top-14 z-30 flex justify-center px-14">
        <span className="text-center font-black text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.15rem, min(calc(3*var(--svw,1vw)), 5vh), 2.4rem)' }}>
          {done ? scene.doneLine : !r || !act ? '' : r.mode === 'act' ? 'Your turn! Act it out!' : solved ? `${act.pronoun} can ${act.word}!` : `${act.name}'s turn! What can ${act.pronoun.toLowerCase()} do?`}
        </span>
      </div>

      {/* stars won so far */}
      <div className="pointer-events-none absolute right-[3%] top-[12%] z-30 flex items-center gap-1 rounded-full bg-indigo-900/60 px-3 py-1 font-black text-yellow-200 shadow-lg" style={{ fontSize: 'min(3.4vh, 2.3vw)' }}>
        ⭐ {stars}
      </div>

      {/* GUESS: the friend acts behind a little velvet curtain that opens bit by bit */}
      {r?.mode === 'guess' && act && (
        <div className="absolute left-1/2 top-[50%] z-20" style={{ width: W, aspectRatio: '1', translate: '-50% -50%' }}>
          <div className="absolute -inset-[7%] rounded-[3vh] border-[1vh] border-amber-500 bg-gradient-to-b from-amber-100 to-amber-200 shadow-[0_2vh_3vh_rgba(0,0,0,0.4)]" />
          {/* footlights */}
          {!reduce && <motion.span className="pointer-events-none absolute inset-x-[5%] -bottom-[4%] h-[14%] rounded-[50%] bg-yellow-200/70 blur-md" animate={{ opacity: [0.5, 0.9, 0.5] }} transition={{ duration: 1.4, repeat: Infinity }} />}
          <motion.img key={`act-${round}`} src={act.img} alt="" draggable={false} className="absolute inset-[4%] h-[92%] w-[92%] object-contain drop-shadow-[0_1vh_1vh_rgba(0,0,0,0.3)]"
            animate={solved && !reduce ? { scale: [1, 1.12, 1], y: [0, -16, 0] } : {}} transition={{ duration: 0.6 }} />
          {/* the two curtain halves */}
          {[0, 1].map((k) => (
            <motion.div key={k} className="pointer-events-none absolute -top-[7%] h-[114%] w-[57%]"
              style={{ [k ? 'right' : 'left']: '-7%', background: 'repeating-linear-gradient(90deg, #9f1239 0 9%, #be123c 9% 18%)', boxShadow: 'inset 0 -2vh 2vh rgba(0,0,0,0.35)', borderRadius: k ? '0 2.5vh 2.5vh 0' : '2.5vh 0 0 2.5vh', transformOrigin: k ? '100% 50%' : '0 50%' }}
              animate={{ scaleX: 1 - open, opacity: open >= 1 ? 0 : 1 }} transition={{ duration: reduce ? 0 : 0.7, ease: 'easeInOut' }} />
          ))}
          <motion.span className="pointer-events-none absolute -top-[16%] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-indigo-700 px-3 font-black text-white shadow-lg" style={{ fontSize: 'min(2.8vh, 1.9vw)' }}>
            {act.name}
          </motion.span>
        </div>
      )}

      {/* YOUR TURN: the hat gives the child a card */}
      {r?.mode === 'act' && act && (
        <div className="absolute left-1/2 top-[50%] z-20" style={{ width: 'min(40vh, 27vw)', aspectRatio: '0.8', translate: '-50% -50%', perspective: '900px' }}>
          <motion.div className="relative h-full w-full" style={{ transformStyle: 'preserve-3d' }}
            initial={reduce ? false : { y: 140, rotate: -12, scale: 0.6 }} animate={{ y: 0, rotate: 0, scale: 1, rotateY: flipped ? 180 : 0 }}
            transition={{ type: 'spring', stiffness: 120, damping: 14 }}>
            <div className="absolute inset-0 grid place-items-center rounded-[3vh] border-[0.8vh] border-yellow-200 bg-gradient-to-br from-purple-500 to-indigo-700 shadow-2xl" style={{ backfaceVisibility: 'hidden' }}>
              <span style={{ fontSize: 'min(14vh, 9vw)' }}>🎩</span>
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center rounded-[3vh] border-[0.8vh] border-yellow-200 bg-gradient-to-b from-amber-50 to-orange-100 p-[4%] shadow-2xl" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
              <img src={act.img} alt="" draggable={false} className="h-[72%] w-full object-contain" />
              <span className="mt-[2%] font-black text-orange-700" style={{ fontSize: 'min(5vh, 3.4vw)' }}>{EMOJI[act.word] ?? ''} {act.word}</span>
            </div>
          </motion.div>
          {/* calm count ring while the child acts */}
          {flipped && !canClap && !reduce && (
            <svg className="pointer-events-none absolute -right-[22%] top-[2%] h-[20%] w-[20%]" viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="16" fill="rgba(30,27,75,0.6)" stroke="rgba(255,255,255,0.25)" strokeWidth="4" />
              <motion.circle cx="20" cy="20" r="16" fill="none" stroke="#fde047" strokeWidth="4" strokeLinecap="round" transform="rotate(-90 20 20)"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 4, ease: 'linear' }} />
            </svg>
          )}
        </div>
      )}

      {/* audience cheer */}
      <AnimatePresence>
        {cheer > 0 && !reduce && [10, 26, 42, 58, 74, 90].map((x, k) => (
          <motion.span key={`${cheer}-${k}`} className="pointer-events-none absolute bottom-[6%] z-30 text-[5vh]" style={{ left: `${x}%` }}
            initial={{ y: 30, opacity: 0 }} animate={{ y: [30, -30, -50], opacity: [0, 1, 0] }} exit={{ opacity: 0 }} transition={{ duration: 1.6, delay: k * 0.07 }}>
            {k % 2 ? '👏' : '🎉'}
          </motion.span>
        ))}
      </AnimatePresence>

      {/* GUESS buttons: three spoken words */}
      {r?.mode === 'guess' && act && (
        <div className="absolute inset-x-0 bottom-[4%] z-30 flex justify-center gap-[3vw]">
          {r.options.map((i) => {
            const a = scene.acts[i];
            return (
              <motion.button key={`${round}-${i}`} type="button" aria-label={a.word} onClick={() => { void guess(i); }} disabled={solved}
                className={`flex items-center gap-2 rounded-full border-[0.6vh] px-[2.4vw] py-[1vh] font-black text-white shadow-[0_0.8vh_0_rgba(0,0,0,0.25)] ${solved && i === r.act ? 'border-lime-200 bg-gradient-to-b from-lime-400 to-green-600' : 'border-sky-200 bg-gradient-to-b from-sky-400 to-indigo-600'}`}
                style={{ fontSize: 'min(4.4vh, 3vw)' }}
                initial={reduce ? false : { y: 50, opacity: 0 }}
                animate={nope === i && !reduce ? { x: [0, -10, 10, -6, 0], y: 0, opacity: 1 } : { y: 0, opacity: solved && i !== r.act ? 0.4 : 1 }}
                transition={nope === i ? { duration: 0.45 } : {}} whileTap={{ scale: 0.92 }}>
                <span style={{ fontSize: '1.3em' }}>{EMOJI[a.word] ?? '❓'}</span>{a.word}
              </motion.button>
            );
          })}
        </div>
      )}

      {/* YOUR TURN: the applause button */}
      <AnimatePresence>
        {r?.mode === 'act' && canClap && (
          <motion.div className="absolute inset-x-0 bottom-[5%] z-30 flex justify-center" initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.button type="button" aria-label="I did it" onClick={() => { void clap(); }}
              className="flex items-center gap-2 rounded-full border-[0.6vh] border-yellow-100 bg-gradient-to-b from-amber-400 to-orange-600 px-[3vw] py-[1.2vh] font-black text-white shadow-[0_0.8vh_0_rgba(0,0,0,0.25)]"
              style={{ fontSize: 'min(4.6vh, 3.1vw)' }} whileTap={{ scale: 0.92 }}
              animate={reduce ? {} : { scale: [1, 1.07, 1] }} transition={{ duration: 1, repeat: Infinity }}>
              <span style={{ fontSize: '1.3em' }}>👏</span>I did it!
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <Bursts items={bursts} />
      <AnimatePresence>
        {done && (
          <motion.div className="absolute inset-x-0 bottom-[12%] z-40 flex justify-center" initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.9, type: 'spring' }}>
            <button onClick={onNext} className={`${CLAY_BUTTON} px-10 py-3 text-xl`}>Next ⭐</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
