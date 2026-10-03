import { useEffect, useMemo, useRef } from 'react';
import type { Scene } from '../scenes';
import { safeSpeak, cueSpeakOnce } from '../audio';
import * as sfx from '../sfx';
import { Confetti } from '../fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';

/* ---------- Color quiz (tap-select multiple choice, distinct interaction from color-sort's drag) ---------- */

export function ColorQuizScene({ scene, onNext, onWin, onLose, sync }: { scene: Extract<Scene, { kind: 'color-quiz' }>; onWin: (gem: boolean) => void; onLose: () => void; onNext: () => void; sync?: ActivitySync }) {
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
    // Deterministic shuffle (seeded by round index) so options don't jump on re-render.
    for (let i = opts.length - 1; i > 0; i--) {
      const j = (i * 7 + roundIdx * 13) % (i + 1);
      [opts[i], opts[j]] = [opts[j], opts[i]];
    }
    return opts;
  }, [round, roundIdx]);

  useEffect(() => {
    if (!round) return;
    setState((s) => ({ ...s, picked: null, correct: false }));
    cueSpeakOnce(`Which one is ${round.colorWord}?`, round.who);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundIdx]);

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
    // "Yes! The leaf is green!" / "Yes! The grapes are purple!"
    if (round) {
      const w = round.correctLabel.toLowerCase();
      await safeSpeak(`Yes! The ${w} ${/[^s]s$/.test(w) ? 'are' : 'is'} ${round.colorWord.toLowerCase()}!`, round.who);
    }
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
      <div className="pointer-events-none absolute inset-x-0 top-6 z-20 flex justify-center px-4">
        <div className="rounded-full bg-white/95 px-5 py-3 text-center text-base font-bold text-orange-800 shadow-xl sm:text-lg">
          Which one is <span style={{ color: round!.colorHex }} className="font-black uppercase">{round!.colorWord}</span>? <span className="opacity-60">({roundIdx + 1}/{total})</span>
        </div>
      </div>
      <div className="absolute inset-x-0 top-1/2 z-10 flex -translate-y-1/2 flex-wrap justify-center gap-6 px-4 sm:gap-10">
        {options.map((opt) => {
          const isPicked = picked === opt.label;
          const showWrong = isPicked && !opt.isCorrect;
          const showRight = correct && opt.isCorrect;
          return (
            <button
              key={opt.label}
              onClick={() => pick(opt.label, opt.isCorrect)}
              disabled={correct}
              className={`grid h-36 w-36 place-items-center rounded-3xl border-8 bg-white shadow-2xl transition active:scale-95 sm:h-44 sm:w-44 ${showWrong ? 'animate-[lep1-shake_0.4s_ease-in-out] border-red-400' : showRight ? 'border-green-400' : 'border-white'}`}
              aria-label={opt.label}
            >
              <img src={opt.img} alt={opt.label} className="h-24 w-24 object-contain sm:h-28 sm:w-28" />
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
