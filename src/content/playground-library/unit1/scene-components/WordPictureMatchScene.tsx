import { useEffect, useMemo, useRef } from 'react';
import type { Scene } from '../scenes';
import { safeSpeak } from '../audio';
import * as sfx from '../sfx';
import { Confetti } from '../fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';

/* ---------- Word-picture match (printed word is the prompt; tap to hear it,
 * then pick the matching picture — whole-word reading-readiness, not an
 * audio-led quiz) ---------- */

export function WordPictureMatchScene({ scene, onWin, onLose, onNext, sync }: { scene: Extract<Scene, { kind: 'word-picture-match' }>; onWin: (gem: boolean) => void; onLose: () => void; onNext: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, { roundIdx: 0, picked: null as string | null, correct: false });
  const { roundIdx, picked, correct } = state;
  const gemDone = useRef(false);
  const total = scene.rounds.length;
  const done = roundIdx >= total;
  const round = !done ? scene.rounds[roundIdx] : null;

  const options = useMemo(() => {
    if (!round) return [];
    const opts = [
      { img: round.correctImg, label: round.correctLabel, isCorrect: true },
      ...round.distractors.map((d) => ({ ...d, isCorrect: false })),
    ];
    for (let i = opts.length - 1; i > 0; i--) {
      const j = (i * 7 + roundIdx * 13) % (i + 1);
      [opts[i], opts[j]] = [opts[j], opts[i]];
    }
    return opts;
  }, [round, roundIdx]);

  useEffect(() => {
    if (!round) return;
    setState((s) => ({ ...s, picked: null, correct: false }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundIdx]);

  const hearWord = async () => {
    if (!round) return;
    sfx.click();
    await safeSpeak(round.word, round.who);
  };

  const pick = async (label: string, isCorrect: boolean) => {
    if (picked) return;
    if (!isCorrect) {
      sfx.wrong(); onLose();
      setState((s) => ({ ...s, picked: label }));
      window.setTimeout(() => setState((s) => ({ ...s, picked: null })), 600);
      return;
    }
    sfx.match();
    setState((s) => ({ ...s, picked: label, correct: true }));
    if (round) await safeSpeak(`Yes! ${round.word}!`, round.who);
  };

  const next = () => {
    const n = roundIdx + 1;
    if (n >= total && !gemDone.current) { gemDone.current = true; sfx.gem(); onWin(true); }
    setState((s) => ({ ...s, roundIdx: n }));
  };

  if (done) {
    return (
      <div className="absolute inset-0 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/25">
          <Confetti />
          <button onClick={onNext} className="pointer-events-auto rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 text-xl font-black text-white shadow-2xl active:scale-95">Next →</button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute inset-0 bg-black/20" />
      <div className="pointer-events-none absolute inset-x-0 top-5 z-20 flex justify-center px-4">
        <div className="rounded-full bg-white/95 px-5 py-2 text-center text-xs font-black uppercase tracking-widest text-orange-700 shadow-xl sm:text-sm">
          Read the Sign! <span className="opacity-60">({roundIdx + 1}/{total})</span>
        </div>
      </div>
      <div className="absolute inset-x-0 top-20 z-20 flex justify-center px-4">
        <button
          onClick={hearWord}
          className="rounded-[2rem] border-8 border-white bg-white px-10 py-5 text-4xl font-black uppercase tracking-wide text-orange-600 shadow-2xl transition active:scale-95 sm:text-5xl"
          aria-label={`Hear the word ${round!.word}`}
        >
          {round!.word} <span className="align-middle text-2xl">🔊</span>
        </button>
      </div>
      <div className="absolute inset-x-0 top-1/2 z-10 flex translate-y-4 flex-wrap justify-center gap-6 px-4 sm:gap-10">
        {options.map((opt) => {
          const isPicked = picked === opt.label;
          const showWrong = isPicked && !opt.isCorrect;
          const showRight = correct && opt.isCorrect;
          return (
            <button
              key={opt.label}
              onClick={() => pick(opt.label, opt.isCorrect)}
              disabled={correct}
              className={`grid h-32 w-32 place-items-center rounded-3xl border-8 bg-white shadow-2xl transition active:scale-95 sm:h-40 sm:w-40 ${showWrong ? 'animate-[lep1-shake_0.4s_ease-in-out] border-red-400' : showRight ? 'border-green-400' : 'border-white'}`}
              aria-label={opt.label}
            >
              <img src={opt.img} alt={opt.label} className="h-20 w-20 object-contain sm:h-24 sm:w-24" />
            </button>
          );
        })}
      </div>
      {correct && (
        <div className="absolute inset-x-0 bottom-8 z-30 flex justify-center">
          <button onClick={next} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-8 py-3 text-lg font-black text-white shadow-2xl active:scale-95" style={{ animation: 'lep1-slide-up 0.4s ease-out' }}>Next →</button>
        </div>
      )}
    </div>
  );
}
