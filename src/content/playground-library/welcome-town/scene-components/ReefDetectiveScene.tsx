import { useEffect, useMemo, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../../unit1/audio';
import * as sfx from '../../unit1/sfx';
import { Confetti } from '../../unit1/fx';
import { CalmBg, Bursts, useBursts } from '../../unit1/scene-components/gameFx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { voiceOf } from './shared';
import { CLAY_BUTTON } from '../../unit1/scene-components/shared';
import { SKIN, PILL_FONT, jewel } from '../../gameSkin';
import {
  DETECTIVE_HIDE, DETECTIVE_LOOK, DETECTIVE_NO, DETECTIVE_YES, allQuestions, caughtLine, fits, foundLine, guessLine, questionText,
} from './reefDetectiveRules';

/* ---------- Reef Detective ★ (docs/a1-unit-6-ocean.md §6.4) ----------
 * Part 1 (the child asks): six sea animals on the board; one is Coral's secret. The child taps a question chip
 * ("Is it swimming?", "Is it big?", "Is it a crab?"), says it, and Coral answers "Yes, it is! / No, it isn't!". The
 * answer is pinned to the clue board and the animals that don't fit are crossed out — until the child names the last one.
 * Part 2 (swap): the child hides an animal and Bub asks; the child answers Yes, it is / No, it isn't (a wrong answer
 * for their own card: "Look at your card again!"). Bub guesses at the end.
 * Mechanics (docs/research/playground-a1u6-research.md, Lesson 4): Guess Who / teach-this yes-no card games, the
 * video-game "detective board" (clues pinned until the case is solved). Better: the board only moves when the child
 * ASKS in English, every clue stays pinned with its answer, and the child is the one who answers in part 2. */

type Det = Extract<Scene, { kind: 'reef-detective' }>;

export function ReefDetectiveScene({ scene, onNext, onWin, onLose, sync }: { scene: Det; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void; sync?: ActivitySync }) {
  const reduce = useReducedMotion();
  const suspects = scene.suspects;
  const secretIdx = Math.max(0, Math.min(suspects.length - 1, scene.secret));
  const [state, setState] = useSyncedState(sync, { part: 1, asked: [] as string[], found: false, hidden: -1, hideStep: 0, answers: [] as string[], wrong: '', done: false });
  const part = state.part === 2 ? 2 : 1;
  const asked = Array.isArray(state.asked) ? state.asked.map(String) : [];
  const answers = Array.isArray(state.answers) ? state.answers.map(String) : [];
  const hidden = Number.isInteger(state.hidden) && state.hidden >= 0 && state.hidden < suspects.length ? state.hidden : -1;
  const hideStep = Math.max(0, Number(state.hideStep) || 0);
  const done = !!state.done;
  const found = !!state.found;
  const [bursts, fire] = useBursts();
  const gemDone = useRef(false);
  const secret = suspects[secretIdx];

  const crossed = useMemo(() => {
    const set = new Set<number>();
    if (part === 1) suspects.forEach((s, i) => { if (asked.some((k) => fits(s, k) !== fits(secret, k))) set.add(i); });
    else suspects.forEach((s, i) => { if (answers.some((a, j) => scene.hideAsks[j] && fits(s, scene.hideAsks[j]) !== (a === 'yes'))) set.add(i); });
    return set;
  }, [part, asked, answers, suspects, secret, scene.hideAsks]);

  useEffect(() => {
    const t = window.setTimeout(() => cueSpeak(scene.intro, voiceOf(scene.who)), 600);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (done && !gemDone.current) { gemDone.current = true; sfx.gem(); onWin(true); cueSpeak(scene.doneLine, voiceOf(scene.who)); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);
  // Part 2: Bub asks the next question
  useEffect(() => {
    if (part !== 2 || hidden < 0 || done) return undefined;
    const t = window.setTimeout(() => {
      if (hideStep < scene.hideAsks.length) cueSpeak(questionText(scene.hideAsks[hideStep]), voiceOf(scene.helper));
      else cueSpeak(guessLine(suspects[hidden]), voiceOf(scene.helper));
    }, 700);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [part, hidden, hideStep, done]);

  const ask = (key: string) => {
    if (part !== 1 || found || asked.includes(key)) return;
    cueSpeak(questionText(key), 'teacher');
    const yes = fits(secret, key);
    setState((s) => ({ ...s, asked: [...(Array.isArray(s.asked) ? s.asked : []), key] }));
    window.setTimeout(() => {
      if (key.startsWith('name:') && yes) {
        sfx.match(); fire(30, 40, 'stars');
        setState((s) => ({ ...s, found: true }));
        cueSpeak(foundLine(secret), voiceOf(scene.who));
      } else {
        if (yes) sfx.match(); else sfx.reveal();
        cueSpeak(yes ? DETECTIVE_YES : DETECTIVE_NO, voiceOf(scene.who));
      }
    }, 900);
  };
  const toPart2 = () => { cueSpeak(DETECTIVE_HIDE, voiceOf(scene.helper)); setState((s) => ({ ...s, part: 2, hidden: -1, hideStep: 0, answers: [] })); };
  const hide = (i: number) => { if (part === 2 && hidden < 0) { sfx.match(); setState((s) => ({ ...s, hidden: i })); } };
  const reply = (yes: boolean) => {
    if (part !== 2 || hidden < 0 || done) return;
    const me = suspects[hidden];
    if (hideStep >= scene.hideAsks.length) {
      if (!yes) { sfx.wrong(); onLose(); setState((s) => ({ ...s, wrong: 'no' })); cueSpeak(DETECTIVE_LOOK, voiceOf(scene.helper)); return; }
      fire(50, 45, 'stars'); cueSpeak(caughtLine(me), voiceOf(scene.helper));
      window.setTimeout(() => setState((s) => ({ ...s, done: true })), 1200);
      return;
    }
    const truth = fits(me, scene.hideAsks[hideStep]);
    if (yes !== truth) {
      sfx.wrong(); onLose();
      setState((s) => ({ ...s, wrong: yes ? 'yes' : 'no' }));
      window.setTimeout(() => setState((s) => ({ ...s, wrong: '' })), 700);
      cueSpeak(DETECTIVE_LOOK, voiceOf(scene.helper));
      return;
    }
    sfx.match();
    cueSpeak(yes ? DETECTIVE_YES : DETECTIVE_NO, 'teacher');
    setState((s) => ({ ...s, hideStep: (Number(s.hideStep) || 0) + 1, answers: [...(Array.isArray(s.answers) ? s.answers : []), yes ? 'yes' : 'no'], wrong: '' }));
  };

  const clues = part === 1
    ? asked.map((k) => ({ q: questionText(k), yes: fits(secret, k) }))
    : answers.map((a, j) => ({ q: questionText(scene.hideAsks[j] ?? ''), yes: a === 'yes' }));
  const chips = part === 1 ? allQuestions(suspects).filter((k) => !asked.includes(k) && (!k.startsWith('name:') || !crossed.has(suspects.findIndex((s) => `name:${s.name}` === k)))) : [];

  return (
    <div className="absolute inset-0 select-none overflow-hidden" style={{ background: '#0C2A3F' }}>
      <CalmBg img={scene.bg} />
      <div className="pointer-events-none absolute inset-x-0 top-[3%] z-30 flex justify-center px-16">
        <span className={`px-6 py-1.5 text-center ${SKIN.pill}`} style={{ fontSize: PILL_FONT }}>
          🔍 {done ? scene.doneLine : part === 1 ? scene.title : hidden < 0 ? 'Hide an animal!' : `Answer ${scene.helperName}!`}
        </span>
      </div>

      {/* the suspects */}
      <div className={`absolute left-[3%] top-[11%] z-10 grid h-[46%] w-[60%] grid-cols-3 gap-[1.4vh] p-[1.6vh] ${SKIN.frame}`}>
        {suspects.map((s, i) => {
          const out = crossed.has(i);
          const mine = part === 2 && hidden === i;
          const win = part === 1 && found && i === secretIdx;
          return (
            <motion.button key={s.name} type="button" onClick={() => hide(i)} disabled={part !== 2 || hidden >= 0}
              className={`relative flex flex-col items-center justify-center overflow-hidden p-[0.8vh] ${SKIN.card} ${mine || win ? 'ring-[0.6vh] ring-[#FEAF15]' : ''}`}
              animate={{ scale: win ? [1, 1.08, 1] : 1 }}
              transition={{ duration: reduce ? 0 : 0.45 }}>
              <img src={s.img} alt={s.name} draggable={false} className="h-[68%] w-full object-contain drop-shadow transition-[filter,opacity] duration-500" style={{ filter: out ? 'grayscale(1)' : 'none', opacity: out ? 0.4 : 1 }} />
              <span className={`font-black ${SKIN.ink}`} style={{ fontSize: 'min(2.4vh, 1.6vw)' }}>{s.name}</span>
              {out && <span className="absolute inset-0 grid place-items-center text-[8vh] font-black text-[#E11D48] drop-shadow-[0_0.3vh_0_#FFFFFF]">✕</span>}
              {mine && <span className="absolute end-[4%] top-[4%] rounded-full bg-[#FEAF15] px-2 text-[1.8vh] font-black text-[#2A1A05]">🤫 mine</span>}
            </motion.button>
          );
        })}
      </div>

      {/* the clue board (cork) */}
      <div className="absolute right-[3%] top-[11%] z-10 flex h-[46%] w-[33%] flex-col gap-[1vh] overflow-hidden rounded-[2.4vh] border-[0.6vh] border-[#8B5A2B] p-[1.6vh] shadow-[0_1.6vh_3vh_rgba(40,20,5,0.45)]"
        style={{ background: 'radial-gradient(circle at 20% 20%, #D9A066 0 2px, transparent 3px) 0 0/18px 18px, linear-gradient(180deg, #C98B52, #B07440)' }}>
        <span className="text-center font-black text-white drop-shadow" style={{ fontSize: 'min(2.6vh, 1.7vw)' }}>📌 Clue board</span>
        <AnimatePresence>
          {clues.map((c, i) => (
            <motion.div key={`${part}-${i}`} initial={reduce ? false : { scale: 0.6, rotate: -8, opacity: 0 }} animate={{ scale: 1, rotate: i % 2 ? 2 : -2, opacity: 1 }}
              className="relative rounded-[1vh] bg-[#FEFBDD] px-[1vh] py-[0.6vh] shadow-md">
              <span className="absolute -top-[0.8vh] left-1/2 h-[1.6vh] w-[1.6vh] -translate-x-1/2 rounded-full bg-[#E11D48] shadow" />
              <span className={`block font-bold ${SKIN.ink}`} style={{ fontSize: 'min(2vh, 1.35vw)' }}>{c.q}</span>
              <span className={`block font-black ${c.yes ? 'text-[#15803D]' : 'text-[#BE123C]'}`} style={{ fontSize: 'min(2vh, 1.35vw)' }}>{c.yes ? `✓ ${DETECTIVE_YES}` : `✕ ${DETECTIVE_NO}`}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* the questions / the answers */}
      {!done && (
        <div className={`absolute inset-x-[3%] bottom-[3%] z-30 flex min-h-[22%] flex-col items-center justify-center gap-[1.2vh] px-[1.6vw] py-[1.2vh] ${SKIN.panel}`}>
          {part === 1 && !found && (
            <>
              <span className={`font-black ${SKIN.ink}`} style={{ fontSize: 'min(2.8vh, 1.9vw)' }}>Ask {scene.whoName} a question — tap it and say it!</span>
              <div className="flex flex-wrap justify-center gap-[0.8vw]">
                {chips.map((k, ci) => (
                  <motion.button key={k} type="button" onClick={() => ask(k)} whileTap={{ scale: 0.93 }}
                    className={`rounded-[1.6vh] px-[1.1vw] py-[0.6vh] font-black ${jewel(k.startsWith('name:') ? 3 : ci)}`} style={{ fontSize: 'min(2.3vh, 1.6vw)' }}>
                    {questionText(k)}
                  </motion.button>
                ))}
              </div>
            </>
          )}
          {part === 1 && found && (
            <>
              <span className={`text-center font-black ${SKIN.ink}`} style={{ fontSize: 'min(3.4vh, 2.3vw)' }}>{foundLine(secret)}</span>
              <button type="button" onClick={toPart2} className={`rounded-full px-7 py-2 font-black ${jewel(0)}`} style={{ fontSize: 'min(2.8vh, 1.9vw)' }}>Now you hide one! 🤫</button>
            </>
          )}
          {part === 2 && hidden < 0 && (
            <span className={`text-center font-black ${SKIN.ink}`} style={{ fontSize: 'min(3vh, 2vw)' }}>Tap an animal to hide it. {scene.helperName} will ask you!</span>
          )}
          {part === 2 && hidden >= 0 && (
            <>
              <span className={`text-center font-black ${SKIN.ink}`} style={{ fontSize: 'min(3.4vh, 2.3vw)' }}>
                {scene.helperName}: {hideStep < scene.hideAsks.length ? questionText(scene.hideAsks[hideStep]) : guessLine(suspects[hidden])}
              </span>
              <div className="flex gap-[1.2vw]">
                <motion.button type="button" onClick={() => reply(true)} animate={state.wrong === 'yes' ? { x: [0, -10, 10, -6, 0] } : {}} className={`rounded-full px-7 py-2 font-black ${jewel(2)}`} style={{ fontSize: 'min(2.8vh, 1.9vw)' }}>👍 {DETECTIVE_YES}</motion.button>
                <motion.button type="button" onClick={() => reply(false)} animate={state.wrong === 'no' ? { x: [0, -10, 10, -6, 0] } : {}} className={`rounded-full px-7 py-2 font-black ${jewel(0)}`} style={{ fontSize: 'min(2.8vh, 1.9vw)' }}>👎 {DETECTIVE_NO}</motion.button>
              </div>
            </>
          )}
        </div>
      )}

      {done && <Confetti count={90} />}
      <Bursts items={bursts} />
      {done && <button type="button" onClick={onNext} className={`${CLAY_BUTTON} absolute bottom-[6%] left-1/2 z-40 -translate-x-1/2 px-10 py-3 text-xl`}>Next ⭐</button>}
    </div>
  );
}
