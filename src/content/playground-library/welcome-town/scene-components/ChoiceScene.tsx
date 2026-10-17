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
      {scene.look === 'bottles' ? (
        <div className="absolute inset-x-0 top-1/2 z-10 flex -translate-y-1/2 flex-wrap items-end justify-center gap-[4vw] px-4">
          <style>{`@keyframes ch-bob { 0%,100% { transform: translateY(0) rotate(-6deg); } 50% { transform: translateY(-10px) rotate(5deg); } }
            @keyframes ch-glow { 0%,100% { box-shadow: 0 0 0 0 rgba(254,175,21,0.0), inset -10px -14px 22px rgba(3,105,161,0.35); } 50% { box-shadow: 0 0 34px 10px rgba(254,175,21,0.75), inset -10px -14px 22px rgba(3,105,161,0.35); } }`}</style>
          {scene.options.map((opt, i) => {
            const isPicked = picked === opt.label;
            const showWrong = isPicked && !opt.correct;
            const showRight = correct && opt.correct;
            return (
              <button
                key={opt.label}
                onClick={() => pick(opt.label, !!opt.correct)}
                disabled={correct}
                aria-label={opt.label}
                className={`flex w-[min(30vw,13rem)] flex-col items-center transition active:scale-95 ${showWrong ? 'animate-[lep1-shake_0.4s_ease-in-out]' : ''} ${correct && !opt.correct ? 'opacity-40' : ''}`}
              >
                {/* the bottle: cork, neck, glass body with the picture inside */}
                <span className="flex flex-col items-center" style={{ animation: `ch-bob ${2.6 + i * 0.4}s ease-in-out ${i * 0.3}s infinite` }}>
                  <span className={`h-[min(3vh,1.1rem)] w-[min(5vh,2rem)] rounded-[4px] bg-gradient-to-b from-[#c08a52] to-[#8a5427] shadow transition ${showRight ? '-translate-y-6 rotate-45 opacity-0' : ''}`} style={{ transitionDuration: '500ms' }} />
                  <span className="h-[min(4vh,1.5rem)] w-[min(6vh,2.4rem)] rounded-t-[8px] border-[3px] border-b-0 border-white/80 bg-sky-100/70" />
                  <span
                    className={`relative grid h-[min(19vh,8.5rem)] w-[min(17vh,7.5rem)] place-items-center rounded-[42%_42%_30%_30%] border-[4px] ${showWrong ? 'border-red-400' : showRight ? 'border-[#FEAF15]' : 'border-white/85'} bg-gradient-to-b from-sky-50/85 via-cyan-100/75 to-teal-300/80`}
                    style={{ boxShadow: 'inset -10px -14px 22px rgba(3,105,161,0.35)', animation: showRight ? 'ch-glow 1.2s ease-in-out infinite' : undefined }}
                  >
                    <span className="absolute left-[18%] top-[12%] h-[34%] w-[12%] rounded-full bg-white/70" />
                    <span className="text-[min(7vh,3rem)] drop-shadow">{opt.emoji}</span>
                  </span>
                </span>
                {/* the message: a paper scroll that unrolls */}
                <span className={`mt-3 rounded-md border-2 border-[#c8963e] bg-[#FEFBDD] px-3 py-2 text-center text-[min(2.4vh,1.05rem)] font-black leading-tight text-orange-800 shadow-lg transition ${showRight ? 'scale-110' : ''}`} style={{ rotate: `${[-2, 1.5, -1][i % 3]}deg` }}>
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
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
      )}
      {correct && (
        <div className="absolute inset-x-0 bottom-8 z-30 flex justify-center">
          <button onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 text-xl font-black text-white shadow-2xl active:scale-95">Next ⭐</button>
        </div>
      )}
    </div>
  );
}
