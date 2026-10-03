import { useEffect } from 'react';
import type { Scene } from '../scenes';
import { cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { ShapeIcon, sayWithin } from './shared';

/* ---------- What Comes Next? (pattern train) ----------
 * Pattern completion as in Khan Academy Kids' pattern / sorting activities
 * (the colour-and-shape pattern games preschool apps lead with): a train of
 * coloured shapes repeats a pattern, the last wagon is empty, and the child
 * says and taps what comes next ("A red circle!"). Logic + the colour/shape
 * words together; the train toots off when the pattern is complete. */

export const NEXT_QUESTION = 'What comes next?';
export function nextLine(colorWord: string, shape: string) {
  const c = colorWord.toLowerCase();
  return `Yes! ${/^[aeiou]/.test(c) ? 'An' : 'A'} ${c} ${shape}!`;
}

type Car = { colorWord: string; colorHex: string; shape: 'circle' | 'square' | 'triangle' };
const key = (c: Car) => `${c.colorWord}:${c.shape}`;

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
      sfx.wrong(); onLose();
      setState((s) => ({ ...s, wrong: key(c) }));
      window.setTimeout(() => setState((s) => ({ ...s, wrong: '' })), 600);
      return;
    }
    sfx.match();
    setState((s) => ({ ...s, solved: true }));
    await sayWithin(nextLine(c.colorWord, c.shape), scene.who);
    await new Promise((res) => setTimeout(res, 1300));
    const next = round + 1;
    const awardGem = next >= total && !gemDone;
    if (awardGem) { sfx.gem(); onWin(true); }
    setState((s) => ({ ...s, round: next, solved: false, gemDone: s.gemDone || awardGem }));
  };

  if (!r) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-cover bg-center pb-24" style={{ backgroundImage: `url(${scene.bg})` }}>
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
    <div className="absolute inset-0 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute left-1/2 top-3 z-30 max-w-[92%] -translate-x-1/2 rounded-full bg-white/95 px-5 py-2 text-center text-base font-black text-orange-700 shadow-xl sm:text-xl">
        {solved ? `🎉 ${nextLine(r.answer.colorWord, r.answer.shape)}` : `🚂 ${NEXT_QUESTION} Say it, then tap it!`}
        <span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-sm text-orange-600">{round + 1}/{total}</span>
      </div>

      {/* The train */}
      <div className="absolute inset-x-0 top-[26%] z-20 flex justify-center px-3">
        <div className="flex items-end gap-2 transition-transform duration-[1200ms] ease-in" style={{ transform: solved ? 'translateX(120vw)' : undefined }}>
          <div className="grid h-[17vh] w-[15vh] place-items-center rounded-t-3xl rounded-bl-3xl bg-red-500 text-[8vh] shadow-xl ring-4 ring-white">🚂</div>
          {cars.map((c, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className={`grid h-[15vh] w-[15vh] place-items-center rounded-2xl border-4 shadow-xl ${c ? 'border-white bg-amber-100' : 'animate-pulse border-dashed border-orange-400 bg-white/80'}`}>
                {c ? <span className="block h-[10vh] w-[10vh]"><ShapeIcon shape={c.shape} fill={c.colorHex} /></span> : <span className="text-[7vh] font-black text-orange-400">?</span>}
              </div>
              <div className="-mt-1 flex gap-4"><span className="block h-4 w-4 rounded-full bg-neutral-700" /><span className="block h-4 w-4 rounded-full bg-neutral-700" /></div>
            </div>
          ))}
        </div>
      </div>

      {/* Choices */}
      <div className="absolute inset-x-0 bottom-[6%] z-30 flex flex-wrap justify-center gap-4 px-4">
        {r.options.map((c) => (
          <button
            key={key(c)}
            onClick={() => pick(c)}
            aria-label={`${c.colorWord.toLowerCase()} ${c.shape}`}
            className={`grid h-24 w-24 place-items-center rounded-3xl border-4 bg-white p-3 shadow-2xl transition active:scale-95 ${wrong === key(c) ? 'animate-[lep1-shake_0.4s_ease-in-out] border-red-400' : 'border-white'}`}
          >
            <ShapeIcon shape={c.shape} fill={c.colorHex} />
          </button>
        ))}
      </div>
    </div>
  );
}

/** Every voiced line, for the clip baker (scripts/generate-voice-cache.mjs mirrors this). */
export function patternTrainLines(scene: Extract<Scene, { kind: 'pattern-train' }>) {
  return [[scene.who, NEXT_QUESTION] as [string, string], ...scene.rounds.map((r) => [scene.who, nextLine(r.answer.colorWord, r.answer.shape)] as [string, string])];
}
