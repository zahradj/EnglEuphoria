import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Scene } from '../scenes';
import { cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { Confetti } from '../fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { CLAY_BUTTON, STICKER_FILTER, StickerButton, STICKER_TILTS, sayWithin } from './shared';
import { Bursts, useBursts } from './gameFx';

/* ---------- Animal Riddles (Pre-A1 Unit 7 Lesson 4 signature game) ----------
 * At the farm fair an animal hides behind the show-tent curtain. Pip gives
 * clues one at a time — "It says moo." "It is big." "It is black and white."
 * — and asks "What animal is this?". The child can answer after any clue by
 * tapping one of the pictures; the curtain opens and the animal says hello
 * ("It's a cow! Moo!"). A wrong pick is named back ("No! It isn't the pig.")
 * and the next clue comes. Researched: "Guess the animal" riddle cards and
 * I-spy clue games (games4esl, British Council LearnEnglish Kids), Cambridge
 * Pre A1 Starters listening (understand short descriptions), Khan Academy
 * Kids calm listen-and-choose.
 * Better: the clues use only words the child already knows (sounds, big /
 * small, colours), so listening to a whole sentence — not one word — finds the
 * animal; the child chooses WHEN to answer (more clues = more help, never a
 * penalty); every wrong pick names an animal; no clock. */

type Riddle = Extract<Scene, { kind: 'animal-riddle' }>;
export const RIDDLE_ASK = 'What animal is this?';
export const riddleNo = (label: string) => `No! It isn't the ${label}.`;

export function AnimalRiddleScene({ scene, onWin, onLose, onNext, sync }: { scene: Riddle; onWin: (gem: boolean) => void; onLose: () => void; onNext: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, { round: 0, clue: 0, open: false, wrong: -1, gemDone: false });
  const { round, clue, open, wrong, gemDone } = state;
  const total = scene.rounds.length;
  const done = round >= total;
  const r = scene.rounds[round];
  const busy = useRef(false);
  const [bursts, fire] = useBursts();
  const answer = r ? scene.animals[r.answer] : undefined;

  const sayClue = async (k: number) => {
    if (!r) return;
    const c = r.clues[k];
    if (c) await sayWithin(c, scene.who, 3500);
    await sayWithin(RIDDLE_ASK, scene.who, 2500);
  };

  useEffect(() => {
    if (!r) return;
    const t = window.setTimeout(() => { void sayClue(0); }, 700);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, scene.id]);

  const moreClue = async () => {
    if (!r || open || busy.current || clue >= r.clues.length - 1) return;
    busy.current = true;
    sfx.click();
    const k = clue + 1;
    setState((s) => ({ ...s, clue: k }));
    await sayClue(k);
    busy.current = false;
  };

  const pick = async (i: number) => {
    if (!r || open || busy.current) return;
    const a = scene.animals[i];
    if (!a) return;
    busy.current = true;
    if (i !== r.answer) {
      sfx.wrong(); onLose();
      setState((s) => ({ ...s, wrong: i }));
      await sayWithin(riddleNo(a.label), scene.who, 2500);
      setState((s) => ({ ...s, wrong: -1 }));
      busy.current = false;
      if (clue < r.clues.length - 1) void moreClue();
      return;
    }
    sfx.match();
    fire(50, 40, 'confetti');
    setState((s) => ({ ...s, open: true }));
    await sayWithin(a.say, scene.who, 3500);
    busy.current = false;
  };

  const next = () => {
    sfx.click();
    const n = round + 1;
    if (n >= total && !gemDone) { sfx.gem(); onWin(true); void sayWithin(scene.doneLine, scene.who, 4000); }
    setState((s) => ({ ...s, round: n, clue: 0, open: false, wrong: -1, gemDone: s.gemDone || n >= total }));
  };

  return (
    <div className="absolute inset-0 select-none overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute inset-0 bg-black/15" />
      {done && <Confetti count={70} />}

      {done ? (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 px-4">
          <div className="rounded-3xl bg-white/95 px-8 py-3 text-center text-2xl font-black text-orange-600 shadow-2xl">{'\u{1F3C6}'} {scene.doneLine}</div>
          <button onClick={onNext} className={`${CLAY_BUTTON} px-10 py-3 text-xl`}>Next {'⭐'}</button>
        </div>
      ) : r && (
        <>
          {/* The clues so far. */}
          <div className="absolute left-1/2 top-14 z-30 flex w-[min(92vw,640px)] -translate-x-1/2 flex-col items-center gap-1.5 [@media(max-height:500px)]:top-12 [@media(max-height:500px)]:gap-0.5">
            {r.clues.slice(0, clue + 1).map((c, k) => (
              <motion.div key={`${round}-${k}`} initial={{ y: -12, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                className="rounded-2xl bg-white/95 px-4 py-1.5 text-center text-base font-black text-sky-800 shadow-lg sm:text-xl [@media(max-height:500px)]:py-0.5 [@media(max-height:500px)]:text-sm">
                {'\u{1F4AC}'} {c}
              </motion.div>
            ))}
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-orange-500 px-4 py-1 text-sm font-black text-white shadow sm:text-base">{RIDDLE_ASK}</div>
              {!open && clue < r.clues.length - 1 && (
                <button onClick={() => { void moreClue(); }} className="rounded-full bg-white/95 px-3 py-1 text-sm font-black text-sky-700 shadow active:scale-95 sm:text-base">{'\u{1F4A1}'} Another clue</button>
              )}
            </div>
          </div>

          {/* The show tent: the curtain hides the animal until it is found. */}
          <div className="absolute left-1/2 top-[44%] z-20 aspect-[4/3] h-[30vh] -translate-x-1/2 -translate-y-1/2 [@media(max-height:500px)]:top-[58%] [@media(max-height:500px)]:h-[22vh] overflow-hidden rounded-t-[40%] border-[6px] border-amber-700 bg-amber-50 shadow-2xl">
            <AnimatePresence>
              {open && answer && (
                <motion.img key={`a-${round}`} src={answer.img} alt={answer.label} draggable={false} className="absolute inset-x-0 bottom-1 mx-auto h-[88%] object-contain"
                  style={{ filter: STICKER_FILTER }} initial={{ y: 60, scale: 0.6 }} animate={{ y: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 220, damping: 14 }} />
              )}
            </AnimatePresence>
            <motion.div className="absolute inset-y-0 left-0 w-1/2 bg-[repeating-linear-gradient(90deg,#dc2626_0_16px,#b91c1c_16px_32px)]" animate={{ x: open ? '-100%' : '0%' }} transition={{ duration: 0.6 }} />
            <motion.div className="absolute inset-y-0 right-0 w-1/2 bg-[repeating-linear-gradient(90deg,#dc2626_0_16px,#b91c1c_16px_32px)]" animate={{ x: open ? '100%' : '0%' }} transition={{ duration: 0.6 }} />
            {!open && <span className="absolute inset-0 grid place-items-center text-[min(10vh,7vw)] font-black text-yellow-200 drop-shadow">?</span>}
            <Bursts items={bursts} />
          </div>

          {/* Answers, or the reveal + next. */}
          <div className="absolute inset-x-0 bottom-[4%] z-30 flex flex-col items-center gap-2">
            {!open ? (
              <>
                <div className="flex flex-wrap justify-center gap-3">
                  {r.options.map((i, k) => {
                    const a = scene.animals[i];
                    if (!a) return null;
                    return (
                      <StickerButton key={`${round}-${i}`} onClick={() => { void pick(i); }} label={a.label} tilt={STICKER_TILTS[k % STICKER_TILTS.length]}
                        state={wrong === i ? 'wrong' : undefined} size="h-[min(17vh,15vw)] w-[min(17vh,15vw)]" delay={k * 0.06}>
                        <img src={a.img} alt="" draggable={false} className="h-full w-full object-contain" />
                      </StickerButton>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="rounded-3xl bg-white/95 px-5 py-2 text-center text-2xl font-black text-neutral-800 shadow-2xl">{answer?.say}</div>
                <button onClick={next} className={`${CLAY_BUTTON} px-8 py-3 text-lg`}>{round + 1 < total ? 'Next animal ▶' : 'Finish ⭐'}</button>
              </div>
            )}
          </div>
          <button onClick={() => { void sayClue(clue); }} aria-label="Hear it again" className="absolute right-3 top-14 z-30 rounded-full bg-white/90 px-4 py-2 text-lg font-black text-orange-700 shadow-lg active:scale-95">{'\u{1F50A}'}</button>
        </>
      )}
    </div>
  );
}

/** Every voiced line, for the clip baker (scripts/generate-voice-cache.mjs mirrors this). */
export function animalRiddleLines(scene: Riddle) {
  const used = new Set(scene.rounds.flatMap((r) => r.options));
  return [
    [scene.who, RIDDLE_ASK],
    ...scene.rounds.flatMap((r) => r.clues.map((c) => [scene.who, c])),
    ...[...used].flatMap((i) => { const a = scene.animals[i]; return a ? [[scene.who, a.say], [scene.who, riddleNo(a.label)]] : []; }),
    [scene.who, scene.doneLine],
  ] as [string, string][];
}
