import { useEffect, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../../unit1/audio';
import * as sfx from '../../unit1/sfx';
import { Confetti } from '../../unit1/fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { voiceOf } from './shared';
import { CLAY_BUTTON, THICK_WORDS } from '../../unit1/scene-components/shared';

/* ---------- Field Guide (A1 U2L4 signature, plan docs/a1-unit-2-jungle.md §5.4) ----------
 * The child writes a jungle field-guide card, one sentence at a time: "It's ___." → big / small / long, then the colour,
 * then "It can ___." and "It can't ___.". Each sentence has a gap and word chips; a wrong word makes the animal shake its
 * head ("No! I'm not small!") and the chip wobbles away; a right word drops into the card and the sentence is read aloud.
 * When the four sentences are in, the child reads the whole card aloud and the teacher taps ✓ — the card is stamped.
 * Mechanics: "What Am I?" animal riddle cards (I am… I have… I can…; TES, games4esl), Cambridge Starters "give very basic
 * descriptions … colour, size", Wordwall gap-fill. Better: the child BUILDS the 4-sentence description the unit asks for
 * (the plan's evidence), every choice is checked against the real animal, and the finished cards stay as their own
 * field guide. Replaces the planned "Mixed-up Animal" (that needs new part art; this serves the objective directly). */

type Guide = Extract<Scene, { kind: 'field-guide' }>;
const blank = (frame: string, word: string | null) => frame.replace('___', word ?? '____');

export function FieldGuideScene({ scene, onNext, onWin, onLose, sync }: { scene: Guide; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void; sync?: ActivitySync }) {
  const reduce = useReducedMotion();
  const total = scene.animals.length;
  const [state, setState] = useSyncedState(sync, { animal: 0, line: 0, wrong: '', read: false, done: false });
  const ai = Math.max(0, Math.min(total - 1, Number(state.animal) || 0));
  const a = scene.animals[ai];
  const lines = a?.lines ?? [];
  const li = Math.max(0, Math.min(lines.length, Number(state.line) || 0));
  const cardFull = li >= lines.length;
  const done = !!state.done;
  const gemDone = useRef(false);

  useEffect(() => {
    if (done && !gemDone.current) { gemDone.current = true; sfx.gem(); onWin(true); cueSpeak(scene.doneLine, voiceOf(scene.who)); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);
  useEffect(() => {
    if (done || !a) return undefined;
    const t = window.setTimeout(() => cueSpeak(`What is it like? Let's write the ${a.name} card!`, voiceOf(scene.who)), 500);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ai, done]);

  const pick = (word: string) => {
    const l = lines[li];
    if (done || !l || cardFull) return;
    if (word !== l.answer) {
      sfx.wrong(); onLose();
      cueSpeak(l.no ?? 'No! Look again!', voiceOf(scene.who));
      setState((s) => ({ ...s, wrong: word }));
      window.setTimeout(() => setState((s) => ({ ...s, wrong: '' })), 700);
      return;
    }
    sfx.match();
    cueSpeak(blank(l.frame, l.answer), 'teacher');
    setState((s) => ({ ...s, line: (Number(s.line) || 0) + 1, wrong: '' }));
  };
  const readIt = () => {
    if (!cardFull || done) return;
    sfx.gem();
    setState((s) => {
      const next = (Number(s.animal) || 0) + 1;
      return next >= total ? { ...s, done: true, read: true } : { ...s, animal: next, line: 0, read: false };
    });
  };

  return (
    <div className="absolute inset-0 select-none overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="absolute inset-0 bg-black/15" />
      {done && <Confetti count={70} />}
      <div className="pointer-events-none absolute inset-x-0 top-[7%] z-30 flex justify-center px-14">
        <span className="text-center font-black text-white" style={{ ...THICK_WORDS, fontSize: 'clamp(1.1rem, min(calc(2.6*var(--svw,1vw)), 4.4vh), 2.1rem)' }}>
          {done ? scene.doneLine : `📒 ${scene.title}`}
        </span>
      </div>

      {a && !done && (
        <AnimatePresence mode="wait">
          <motion.div key={ai} className="absolute inset-x-[5%] top-[16%] bottom-[22%] z-20 flex gap-[2vw] rounded-[3vh] border-[0.6vh] border-amber-700/60 bg-[#fdf6e3] p-[2vh] shadow-2xl"
            initial={reduce ? false : { rotateY: -70, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }} exit={{ opacity: 0, x: -60 }} transition={{ duration: 0.5 }}>
            {/* the animal */}
            <div className="relative flex w-[34%] flex-col items-center justify-center rounded-[2vh] border-[0.4vh] border-dashed border-amber-600/50 bg-white/70">
              <motion.img src={a.img} alt={a.name} draggable={false} className="max-h-[78%] w-[80%] object-contain drop-shadow-[0_1vh_0.8vh_rgba(0,0,0,0.25)]"
                animate={state.wrong ? { rotate: [0, -10, 10, -6, 0] } : reduce ? {} : { y: [0, -6, 0] }}
                transition={state.wrong ? { duration: 0.6 } : { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }} />
              <span className="mt-[1vh] font-black uppercase tracking-wider text-amber-800" style={{ fontSize: 'min(3.2vh, 2vw)' }}>{a.name}</span>
              {cardFull && <motion.span className="absolute right-[6%] top-[6%] rounded-full border-[0.4vh] border-emerald-600 px-3 py-1 font-black text-emerald-700" style={{ fontSize: 'min(2.4vh, 1.5vw)', rotate: -12 }} initial={{ scale: 2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>✓ DONE</motion.span>}
            </div>
            {/* the sentences */}
            <div className="flex flex-1 flex-col justify-center gap-[1.6vh]">
              {lines.map((l, i) => (
                <div key={i} className={`rounded-[1.5vh] px-[1.5vw] py-[1vh] font-black leading-tight ${i < li ? 'bg-emerald-50 text-[#3b2410]' : i === li ? 'bg-yellow-100 text-[#3b2410] ring-[0.4vh] ring-yellow-400' : 'text-neutral-300'}`} style={{ fontSize: 'min(4.4vh, 2.8vw)' }}>
                  {i < li ? blank(l.frame, l.answer) : blank(l.frame, null)}
                  {i < li && <button type="button" onClick={() => cueSpeak(blank(l.frame, l.answer), 'teacher')} aria-label="Hear it" className="ms-2 align-middle text-[0.7em]">🔊</button>}
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* chips / read button */}
      {a && !done && (
        <div className="absolute inset-x-0 bottom-[4%] z-30 flex justify-center gap-[1.5vw]">
          {!cardFull && lines[li]?.options.map((w) => (
            <motion.button key={`${ai}-${li}-${w}`} type="button" onClick={() => pick(w)} whileTap={{ scale: 0.92 }}
              animate={state.wrong === w ? { x: [0, -10, 10, -6, 0], opacity: [1, 0.6, 1] } : {}}
              className="rounded-[2vh] border-[0.4vh] border-white bg-gradient-to-b from-sky-400 to-sky-600 px-[2.4vw] py-[1.4vh] font-black text-white shadow-[0_0.7vh_0_rgba(0,0,0,0.25)]"
              style={{ fontSize: 'min(4vh, 2.6vw)' }}>{w}</motion.button>
          ))}
          {cardFull && (
            <motion.button type="button" onClick={readIt} initial={reduce ? false : { scale: 0 }} animate={{ scale: 1 }} className={`${CLAY_BUTTON} px-8 py-3`} style={{ fontSize: 'min(3.6vh, 2.3vw)' }}>
              📖 I read my card! ✓
            </motion.button>
          )}
        </div>
      )}
      {done && <button type="button" onClick={onNext} className={`${CLAY_BUTTON} absolute bottom-[12%] left-1/2 z-40 -translate-x-1/2 px-10 py-3 text-xl`}>Next ⭐</button>}
    </div>
  );
}
