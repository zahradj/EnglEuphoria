import { useEffect, useMemo, useRef } from 'react';
import type { Scene } from '../scenes';
import { safeSpeak, cueSpeakOnce } from '../audio';
import * as sfx from '../sfx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';

/* ---------- Video comprehension check (one very-easy picture question) ---------- */

export function VideoCheckScene({ scene, onNext, onWin, onLose, sync }: { scene: Extract<Scene, { kind: 'video-check' }>; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, { picked: null as string | null, correct: false });
  const { picked, correct } = state;
  const gemDone = useRef(false);

  const options = useMemo(() => {
    const opts = [
      { img: scene.correctImg, label: scene.correctLabel, isCorrect: true },
      ...scene.distractors.map((d) => ({ ...d, isCorrect: false })),
    ];
    for (let i = opts.length - 1; i > 0; i--) {
      const j = i % 2 === 0 ? 0 : i - 1; // fixed, deterministic shuffle — single question, no round index to seed with
      [opts[i], opts[j]] = [opts[j], opts[i]];
    }
    return opts;
  }, [scene]);

  useEffect(() => {
    cueSpeakOnce(scene.question, 'teacher');
  }, [scene]);

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
    if (!gemDone.current) { gemDone.current = true; sfx.gem(); onWin(true); }
    await safeSpeak(`Yes! ${scene.correctLabel}!`, 'teacher');
  };

  return (
    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute inset-0 bg-black/20" />
      <div className="pointer-events-none absolute inset-x-0 top-6 z-20 flex justify-center px-4">
        <div className="rounded-full bg-white/95 px-5 py-3 text-center text-base font-bold text-orange-800 shadow-xl sm:text-lg">{scene.question}</div>
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
          <button onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-8 py-3 text-lg font-black text-white shadow-2xl active:scale-95" style={{ animation: 'lep1-slide-up 0.4s ease-out' }}>Next →</button>
        </div>
      )}
    </div>
  );
}
