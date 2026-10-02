import { useEffect, useRef } from 'react';
import type { Scene } from '../scenes';
import { cueSpeak, cueSpeakOnce } from '../../unit1/audio';
import * as sfx from '../../unit1/sfx';
import { Confetti } from '../../unit1/fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { voiceOf } from './shared';

/* ---------- True / False (a spoken statement, judged True or False — a
   fast binary listening check, no scene-hotspot dependency, so it can
   freely mix content across topics/backgrounds in one scene). ---------- */

export function TrueFalseScene({ scene, onNext, onWin, onLose, sync }: { scene: Extract<Scene, { kind: 'true-false' }>; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, { round: 0, picked: null as 'true' | 'false' | null, correct: false });
  const { round, picked, correct } = state;
  const gemDone = useRef(false);
  const total = scene.rounds.length;
  const complete = round >= total;
  const r = !complete ? scene.rounds[round] : null;

  useEffect(() => {
    if (complete) return;
    setState((s) => ({ ...s, picked: null, correct: false }));
    cueSpeakOnce(r!.statement, voiceOf(r!.who));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, complete]);

  const answer = (guess: boolean) => {
    if (!r || correct) return;
    if (guess !== r.isTrue) {
      sfx.wrong(); onLose();
      setState((s) => ({ ...s, picked: guess ? 'true' : 'false' }));
      window.setTimeout(() => setState((s) => ({ ...s, picked: null })), 600);
      return;
    }
    sfx.match();
    setState((s) => ({ ...s, picked: guess ? 'true' : 'false', correct: true }));
    if (!gemDone.current) { gemDone.current = true; sfx.gem(); onWin(true); }
    window.setTimeout(() => setState((s) => ({ ...s, round: s.round + 1 })), 900);
  };

  if (complete) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
        <Confetti count={50} />
        <button onClick={onNext} className="relative z-10 animate-[lep1-slide-up_0.4s_ease-out] rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 text-xl font-black text-white shadow-2xl active:scale-95">Great listening! ⭐ Next</button>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute inset-0 bg-black/25" />
      <div className="pointer-events-none absolute inset-x-0 top-6 z-20 flex justify-center px-4">
        <div className="rounded-full bg-white/95 px-5 py-3 text-center text-base font-bold text-orange-800 shadow-xl sm:text-lg">
          {scene.teacher} <span className="ml-1 opacity-60">({round + 1}/{total})</span>
        </div>
      </div>
      <div className="absolute inset-x-0 top-1/3 z-10 flex justify-center px-6">
        <div className="max-w-md rounded-3xl border-4 border-white bg-white/95 px-6 py-5 text-center shadow-2xl">
          <p className="text-2xl font-black text-orange-800">“{r!.statement}”</p>
          <button onClick={() => cueSpeak(r!.statement, voiceOf(r!.who))} className="mt-2 text-sm font-semibold text-neutral-500 underline decoration-dotted active:scale-95">🔊 Hear it again</button>
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-10 z-20 flex justify-center gap-6 px-4">
        <button
          onClick={() => answer(true)} disabled={correct}
          className={`grid h-24 w-32 place-items-center rounded-3xl border-8 bg-white text-2xl font-black text-emerald-600 shadow-2xl transition active:scale-95 sm:h-28 sm:w-40 ${picked === 'true' && !correct ? 'animate-[lep1-shake_0.4s_ease-in-out] border-red-400' : picked === 'true' && correct ? 'border-green-400' : 'border-white'}`}
        >✅ True</button>
        <button
          onClick={() => answer(false)} disabled={correct}
          className={`grid h-24 w-32 place-items-center rounded-3xl border-8 bg-white text-2xl font-black text-rose-600 shadow-2xl transition active:scale-95 sm:h-28 sm:w-40 ${picked === 'false' && !correct ? 'animate-[lep1-shake_0.4s_ease-in-out] border-red-400' : picked === 'false' && correct ? 'border-green-400' : 'border-white'}`}
        >❌ False</button>
      </div>
    </div>
  );
}
