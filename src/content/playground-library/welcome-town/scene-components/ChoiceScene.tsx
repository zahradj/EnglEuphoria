import { useEffect, useRef } from 'react';
import type { Scene } from '../scenes';
import { CAST } from '../scenes';
import { safeSpeak, cueSpeak, cueSpeakOnce } from '../../unit1/audio';
import * as sfx from '../../unit1/sfx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { voiceOf, CharacterPointer } from './shared';

/* ---------- Choice (new: simple multiple-choice tap) ---------- */

export function ChoiceScene({ scene, onNext, onWin, onLose, sync }: { scene: Extract<Scene, { kind: 'choice' }>; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, { picked: null as string | null, correct: false });
  const { picked, correct } = state;
  const gemDone = useRef(false);

  useEffect(() => {
    setState({ picked: null, correct: false });
    gemDone.current = false;
    cueSpeakOnce(scene.prompt, voiceOf(scene.who));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene.id]);

  const pick = async (label: string, isCorrect: boolean) => {
    if (correct) return;
    if (!isCorrect) {
      sfx.wrong(); onLose();
      setState((s) => ({ ...s, picked: label }));
      window.setTimeout(() => setState((s) => ({ ...s, picked: null })), 600);
      return;
    }
    sfx.match();
    setState((s) => ({ ...s, picked: label, correct: true }));
    if (!gemDone.current) { gemDone.current = true; sfx.gem(); onWin(true); }
    await safeSpeak(`Yes! ${label}!`, voiceOf(scene.who));
  };

  return (
    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute inset-0 bg-black/20" />
      {/* Only useful when the referenced character sits outside the
          options row's vertical band (roughly 42%-58% of the screen,
          where the big tappable option cards render) — otherwise the
          cards themselves cover whoever the arrow would point at. */}
      {scene.pointTo?.map((p, i) => (
        <CharacterPointer key={`point-${i}`} left={p.left} top={p.top} dir={p.dir} color={CAST[p.who].color} />
      ))}
      <div className="pointer-events-none absolute inset-x-0 top-6 z-20 flex justify-center px-4">
        <div className="rounded-full bg-white/95 px-5 py-3 text-center text-base font-bold text-orange-800 shadow-xl sm:text-lg">{scene.prompt}</div>
      </div>
      <button onClick={() => cueSpeak(scene.prompt, voiceOf(scene.who))} className="absolute right-4 top-4 z-30 rounded-full bg-white/95 px-3 py-2 text-sm font-black text-orange-700 shadow-lg active:scale-95">🔊 Again</button>
      <div className="absolute inset-x-0 top-1/2 z-10 flex -translate-y-1/2 flex-wrap justify-center gap-6 px-4 sm:gap-10">
        {scene.options.map((opt) => {
          const isPicked = picked === opt.label;
          const showWrong = isPicked && !opt.correct;
          const showRight = correct && opt.correct;
          return (
            <button
              key={opt.label}
              onClick={() => pick(opt.label, !!opt.correct)}
              disabled={correct}
              className={`grid h-36 w-36 place-items-center rounded-3xl border-8 bg-white shadow-2xl transition active:scale-95 sm:h-44 sm:w-44 ${showWrong ? 'animate-[lep1-shake_0.4s_ease-in-out] border-red-400' : showRight ? 'border-green-400' : 'border-white'}`}
              aria-label={opt.label}
            >
              <span className="text-5xl">{opt.emoji}</span>
              <span className="mt-2 text-lg font-black text-orange-700">{opt.label}</span>
            </button>
          );
        })}
      </div>
      {correct && (
        <div className="absolute inset-x-0 bottom-8 z-30 flex justify-center">
          <button onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 text-xl font-black text-white shadow-2xl active:scale-95">Next ⭐</button>
        </div>
      )}
    </div>
  );
}
