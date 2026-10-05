import { useEffect } from 'react';
import { motion } from 'framer-motion';
import type { Scene, PatternCar } from '../scenes';
import { cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { STICKER_FILTER, STICKER_TILTS, ShapeIcon, StickerButton, TrainEngine, TrainTrack, TrainWagon, sayWithin } from './shared';
import { Bursts, LivingBg, useBursts, useShake } from './gameFx';

/* ---------- What Comes Next? (pattern train) ----------
 * Pattern completion as in Khan Academy Kids' pattern / sorting activities
 * (the colour-and-shape pattern games preschool apps lead with): a train of
 * coloured shapes repeats a pattern, the last wagon is empty, and the child
 * says and taps what comes next ("A red circle!"). Logic + the colour/shape
 * words together; the train toots off when the pattern is complete. */

export const NEXT_QUESTION = 'What comes next?';
export function nextLine(colorWord: string, shape: string, word?: string) {
  const c = word ? word.toLowerCase() : `${colorWord.toLowerCase()} ${shape}`;
  return `Yes! ${/^[aeiou]/.test(c) ? 'An' : 'A'} ${c}!`;
}
const lineFor = (c: Car) => nextLine(c.colorWord, c.shape, c.word);

type Car = PatternCar;
const key = (c: Car) => (c.word ? `w:${c.word}` : `${c.colorWord}:${c.shape}`);
/** A wagon's load: the picture if there is one, else the coloured shape. */
function Load({ c }: { c: Car }) {
  return c.img
    ? <img src={c.img} alt={c.word ?? ''} draggable={false} className="h-full w-full object-contain" style={{ filter: STICKER_FILTER }} />
    : <ShapeIcon shape={c.shape} fill={c.colorHex} />;
}
const WAGON_COLORS = ['#3B82F6', '#22C55E', '#F59E0B', '#A855F7', '#14B8A6', '#EC4899'];

export function PatternTrainScene({ scene, onWin, onLose, onNext, sync }: { scene: Extract<Scene, { kind: 'pattern-train' }>; onWin: (gem: boolean) => void; onLose: () => void; onNext: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, {
    round: 0,
    solved: false,
    wrong: '',
    gemDone: false,
  });
  const { round, solved, wrong, gemDone } = state;
  const total = scene.rounds.length;
  const r = round < total ? scene.rounds[round] : undefined;
  const [bursts, fire] = useBursts();
  const [shakeCtl, shake] = useShake();

  useEffect(() => {
    if (!r) return;
    setState((s) => ({ ...s, solved: false, wrong: '' }));
    const t = window.setTimeout(() => cueSpeak(NEXT_QUESTION, scene.who), 500);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, scene.id]);

  const pick = async (c: Car) => {
    if (!r || solved) return;
    if (key(c) !== key(r.answer)) {
      sfx.wrong(); onLose(); shake();
      setState((s) => ({ ...s, wrong: key(c) }));
      window.setTimeout(() => setState((s) => ({ ...s, wrong: '' })), 600);
      return;
    }
    sfx.match();
    setState((s) => ({ ...s, solved: true }));
    window.setTimeout(() => fire(50, 34, 'stars'), 80);
    await sayWithin(lineFor(c), scene.who);
    await new Promise((res) => setTimeout(res, 1300));
    const next = round + 1;
    const awardGem = next >= total && !gemDone;
    if (awardGem) { sfx.gem(); onWin(true); }
    setState((s) => ({ ...s, round: next, solved: false, gemDone: s.gemDone || awardGem }));
  };

  if (!r) {
    return (
      <div className="absolute inset-0 flex items-center justify-center pb-24">
        <LivingBg img={scene.bg} video={scene.bgVideo} />
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 flex flex-col items-center gap-4 px-4">
          <div className="rounded-3xl bg-white px-8 py-3 text-center text-2xl font-black text-orange-600 shadow-2xl">🚂 Choo choo! You finished every pattern!</div>
          <button onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 text-xl font-black text-white shadow-2xl active:scale-95">Next ⭐</button>
        </div>
      </div>
    );
  }

  const cars: (Car | null)[] = [...r.pattern, solved ? r.answer : null];

  return (
    <motion.div className="absolute inset-0 overflow-hidden" animate={shakeCtl}>
      <LivingBg img={scene.bg} video={scene.bgVideo} />
      <div className="pointer-events-none absolute left-1/2 top-3 z-30 max-w-[92%] -translate-x-1/2 rounded-full bg-white/95 px-5 py-2 text-center text-base font-black text-orange-700 shadow-xl sm:text-xl">
        {solved ? `🎉 ${lineFor(r.answer)}` : `🚂 ${NEXT_QUESTION} Say it, then tap it!`}
        <span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-sm text-orange-600">{round + 1}/{total}</span>
      </div>

      {/* The train: a drawn toy train on a track; it chugs away when the pattern is done. */}
      <div className="absolute inset-x-0 top-[24%] z-20 flex flex-col items-center px-3">
        <div className="flex items-end gap-1 transition-transform duration-[1600ms] ease-in" style={{ transform: solved ? 'translateX(-130vw)' : undefined }}>
          <TrainEngine moving={solved} className="h-[19vh] w-[23vh] shrink-0" />
          {cars.map((c, i) => (
            <motion.div key={`${round}-${i}`} className="shrink-0" initial={{ x: 300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 220, damping: 18, delay: 0.1 + i * 0.09 }}>
              <TrainWagon color={WAGON_COLORS[i % WAGON_COLORS.length]} moving={solved} glow={!c} className="h-[19vh] w-[17.5vh]">
                {c
                  ? <motion.span className="block h-[9.5vh] w-[9.5vh]" initial={i === cars.length - 1 ? { scale: 0, y: -60 } : false} animate={{ scale: 1, y: [0, -4, 0] }} transition={i === cars.length - 1 ? { type: 'spring', stiffness: 320, damping: 12 } : { y: { duration: 0.6, repeat: Infinity, delay: i * 0.1 } }}><Load c={c} /></motion.span>
                  : <motion.span className="text-[6vh] font-black text-orange-400" animate={{ scale: [1, 1.25, 1] }} transition={{ duration: 1, repeat: Infinity }}>?</motion.span>}
              </TrainWagon>
            </motion.div>
          ))}
        </div>
        <TrainTrack moving={solved} className="-mt-[1.2vh] w-[96%]" />
      </div>

      {/* Choices */}
      <div className="absolute inset-x-0 bottom-[6%] z-30 flex flex-wrap justify-center gap-4 px-4">
        {r.options.map((c) => (
          <StickerButton
            key={key(c)}
            onClick={() => pick(c)}
            label={c.word ?? `${c.colorWord.toLowerCase()} ${c.shape}`}
            tilt={STICKER_TILTS[r.options.indexOf(c) % STICKER_TILTS.length]}
            state={wrong === key(c) ? 'wrong' : undefined}
            size="h-24 w-24 sm:h-28 sm:w-28"
          >
            <span className="block h-full w-full p-[6%]"><Load c={c} /></span>
          </StickerButton>
        ))}
      </div>
      <Bursts items={bursts} />
    </motion.div>
  );
}

/** Every voiced line, for the clip baker (scripts/generate-voice-cache.mjs mirrors this). */
export function patternTrainLines(scene: Extract<Scene, { kind: 'pattern-train' }>) {
  return [[scene.who, NEXT_QUESTION] as [string, string], ...scene.rounds.map((r) => [scene.who, lineFor(r.answer)] as [string, string])];
}
