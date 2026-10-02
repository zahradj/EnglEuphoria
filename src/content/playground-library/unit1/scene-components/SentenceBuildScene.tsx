import { useEffect } from 'react';
import type { Scene } from '../scenes';
import { safeSpeak } from '../audio';
import * as sfx from '../sfx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';

/* ---------- Sentence build (shuffled words -> full sentence) ---------- */

function shuffledIndices(n: number): number[] {
  const arr = Array.from({ length: n }, (_, i) => i);
  for (let k = arr.length - 1; k > 0; k--) {
    const j = Math.floor(Math.random() * (k + 1));
    [arr[k], arr[j]] = [arr[j], arr[k]];
  }
  // A shuffle that happens to land in the original order defeats the
  // point of the exercise -- nudge with one swap so it's never a no-op
  // for anything longer than a single word.
  if (n > 1 && arr.every((v, i) => v === i)) [arr[0], arr[1]] = [arr[1], arr[0]];
  return arr;
}

export function SentenceBuildScene({ scene, onNext, onWin, onLose, sync }: { scene: Extract<Scene, { kind: 'sentence-build' }>; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, { round: 0, filledCount: 0, wrongIdx: null as number | null, gemDone: false, order: [] as number[] });
  const { round, filledCount, wrongIdx, gemDone, order } = state;
  // shuffledIndices() uses Math.random() — computing it independently on
  // each side would give the teacher and student different word orders, so
  // only the authority computes it (once per round) and it travels as
  // synced state, same as HelloDoorsScene's `order`.
  const isRemoteMirror = !!sync?.isSynced && !sync.isAuthority;
  const r = scene.rounds[round];
  const total = scene.rounds.length;
  const complete = round >= total;

  useEffect(() => {
    if (isRemoteMirror || complete) return;
    setState((s) => ({ ...s, filledCount: 0, wrongIdx: null, order: shuffledIndices(scene.rounds[round].words.length) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, complete, isRemoteMirror]);

  const tap = (wordIdx: number) => {
    if (isRemoteMirror || complete || wrongIdx !== null) return;
    if (wordIdx === filledCount) {
      sfx.match();
      const nextCount = filledCount + 1;
      setState((s) => ({ ...s, filledCount: nextCount }));
      if (nextCount >= r.words.length) {
        void safeSpeak(r.words.join(' '), 'pip');
        window.setTimeout(() => {
          const next = round + 1;
          const awardGem = next >= total && !gemDone;
          if (awardGem) { sfx.gem(); onWin(true); }
          setState((s) => ({ ...s, round: next, gemDone: s.gemDone || awardGem }));
        }, 1200);
      }
    } else {
      sfx.wrong(); onLose();
      setState((s) => ({ ...s, wrongIdx: wordIdx }));
      window.setTimeout(() => setState((s) => ({ ...s, wrongIdx: null })), 500);
    }
  };

  if (complete) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-cover bg-center pb-24" style={{ backgroundImage: `url(${scene.bg})` }}>
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
        <button onClick={onNext} className="relative z-10 animate-[lep1-slide-up_0.4s_ease-out] rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 text-xl font-black text-white shadow-2xl active:scale-95">You built {total} sentence{total === 1 ? '' : 's'}! ⭐ Next</button>
      </div>
    );
  }

  const side = scene.side;
  const vAlign = side === 'top' ? 'items-start pt-24' : 'items-center';
  const hAlign = side === 'right' ? 'justify-end' : side === 'left' ? 'justify-start' : 'justify-center';
  const choiceGradients = [
    'linear-gradient(135deg,#FE6A2F,#FF8A4C)', // orange
    'linear-gradient(135deg,#4FA9E0,#6EC6F0)', // blue
    'linear-gradient(135deg,#B85CD1,#D57BE6)', // purple
    'linear-gradient(135deg,#4ADE80,#86EFAC)', // green
  ];
  return (
    <div className={`absolute inset-0 flex bg-cover bg-center pb-24 ${vAlign} ${hAlign}`} style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute left-1/2 top-4 z-30 max-w-[92%] -translate-x-1/2 rounded-full bg-white/95 px-4 py-2 text-center text-sm font-black text-orange-700 shadow-xl backdrop-blur sm:text-base">🔀 {scene.teacher} <span className="ml-1 opacity-70">({round + 1}/{total})</span></div>
      <div className={`relative z-10 flex w-full flex-col items-center px-4 ${side && side !== 'top' ? 'max-w-[440px]' : 'max-w-[600px]'}`}>
        <div className="w-full rounded-[2.25rem] bg-white/90 p-6 shadow-2xl ring-4 ring-white/60 backdrop-blur-sm">
          {(r.img || r.emoji) && (
            <div className="mb-4 flex justify-center">
              {r.img ? (
                <img src={r.img} alt="" className="h-20 w-20 rounded-2xl object-cover shadow-md sm:h-24 sm:w-24" />
              ) : (
                <span className="text-6xl sm:text-7xl">{r.emoji}</span>
              )}
            </div>
          )}
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {r.words.map((w, i) => {
              const isFilled = i < filledCount;
              const isCurrent = i === filledCount;
              const color = isFilled ? (r.colors?.[i] ?? undefined) : undefined;
              const tone = isFilled
                ? 'border-green-300 bg-green-50'
                : isCurrent
                ? 'border-dashed border-amber-400 bg-amber-50'
                : 'border-dashed border-neutral-300 bg-neutral-100';
              return (
                <div key={i} className={`grid min-w-[2.5rem] place-items-center rounded-2xl border-4 px-3 font-black shadow-md transition-colors ${tone}`} style={{ height: 62, fontSize: 26, color: isFilled ? (color ?? '#C2410C') : 'transparent' }}>
                  {isFilled ? w : ' '}
                </div>
              );
            })}
          </div>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            {order.map((wordIdx, i) => {
              const used = wordIdx < filledCount;
              return (
                <button key={wordIdx} onClick={() => tap(wordIdx)} disabled={used} className={`rounded-2xl border-4 border-white px-5 py-3 text-lg font-black text-white shadow-xl transition active:scale-95 disabled:opacity-0 disabled:pointer-events-none sm:text-xl ${wrongIdx === wordIdx ? 'animate-[lep1-shake_0.4s_ease-out]' : ''}`} style={{ background: choiceGradients[i % choiceGradients.length] }}>{r.words[wordIdx]}</button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
