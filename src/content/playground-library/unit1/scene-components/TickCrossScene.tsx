import { useEffect } from 'react';
import type { Scene } from '../scenes';
import { cueSpeak } from '../audio';
import * as sfx from '../sfx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { sayWithin } from './shared';

/* ---------- Tick or Cross ----------
 * Cambridge Pre A1 Starters Reading & Writing Part 1 ("Look and read. Put a
 * tick or a cross"), as a story check: a picture from the story, a sentence
 * read aloud, and the child taps ✓ (yes, it's true) or ✗ (no). Builds
 * reading + listening comprehension after a story. */

export const RIGHT_LINE = "That's right!";

export function TickCrossScene({ scene, onWin, onLose, onNext, sync }: { scene: Extract<Scene, { kind: 'tick-cross' }>; onWin: (gem: boolean) => void; onLose: () => void; onNext: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, { round: 0, answered: '', wrong: '', gemDone: false });
  const { round, answered, wrong, gemDone } = state;
  const total = scene.rounds.length;
  const r = round < total ? scene.rounds[round] : undefined;

  useEffect(() => {
    if (!r) return;
    setState((s) => ({ ...s, answered: '', wrong: '' }));
    const t = window.setTimeout(() => cueSpeak(r.sentence, scene.who), 500);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, scene.id]);

  const answer = async (yes: boolean) => {
    if (!r || answered) return;
    const pick = yes ? 'tick' : 'cross';
    if (yes !== r.isTrue) {
      sfx.wrong(); onLose();
      setState((s) => ({ ...s, wrong: pick }));
      window.setTimeout(() => setState((s) => ({ ...s, wrong: '' })), 600);
      return;
    }
    sfx.match();
    setState((s) => ({ ...s, answered: pick }));
    await sayWithin(RIGHT_LINE, scene.who, 2500);
    await new Promise((res) => setTimeout(res, 500));
    const next = round + 1;
    const awardGem = next >= total && !gemDone;
    if (awardGem) { sfx.gem(); onWin(true); }
    setState((s) => ({ ...s, round: next, gemDone: s.gemDone || awardGem }));
  };

  if (!r) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-cover bg-center pb-24" style={{ backgroundImage: `url(${scene.bg})` }}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 flex flex-col items-center gap-4 px-4">
          <div className="rounded-3xl bg-white px-8 py-3 text-center text-2xl font-black text-orange-600 shadow-2xl">✅ Great reading!</div>
          <button onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 text-xl font-black text-white shadow-2xl active:scale-95">Next ⭐</button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute inset-0 bg-black/25" />
      <div className="pointer-events-none absolute left-1/2 top-3 z-30 max-w-[92%] -translate-x-1/2 rounded-full bg-white/95 px-5 py-2 text-center text-base font-black text-orange-700 shadow-xl sm:text-lg">
        👂 Listen. Yes or no?
        <span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-sm text-orange-600">{round + 1}/{total}</span>
      </div>
      <div className="absolute inset-x-0 top-[12%] z-20 flex flex-col items-center gap-3 px-4">
        <img src={r.img} alt="" className="h-[42vh] w-auto max-w-[92%] rounded-3xl border-8 border-white object-cover shadow-2xl" draggable={false} />
        {/* Listening first: the children can't read yet — the sentence is a small caption. */}
        <button onClick={() => cueSpeak(r.sentence, scene.who)} aria-label="Hear it again" className="flex flex-col items-center rounded-3xl bg-white px-6 py-2 shadow-2xl active:scale-95">
          <span className="text-4xl">🔊</span>
          <span className="text-sm font-semibold text-slate-500">{r.sentence}</span>
        </button>
      </div>
      <div className="absolute inset-x-0 bottom-[5%] z-30 flex justify-center gap-6">
        {([['tick', true, '✔', 'bg-green-500'], ['cross', false, '✘', 'bg-rose-500']] as const).map(([k, yes, mark, bg]) => (
          <button
            key={k}
            onClick={() => answer(yes)}
            aria-label={yes ? 'Yes' : 'No'}
            className={`grid h-24 w-24 place-items-center rounded-full border-8 text-5xl font-black text-white shadow-2xl transition active:scale-95 ${bg} ${answered === k ? 'scale-110 border-yellow-300' : 'border-white'} ${wrong === k ? 'animate-[lep1-shake_0.4s_ease-in-out]' : ''}`}
          >
            {mark}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Every voiced line, for the clip baker. */
export function tickCrossLines(scene: Extract<Scene, { kind: 'tick-cross' }>) {
  return [[scene.who, RIGHT_LINE] as [string, string], ...scene.rounds.map((r) => [scene.who, r.sentence] as [string, string])];
}
