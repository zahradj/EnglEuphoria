import { useEffect, useRef } from 'react';
import type { Scene } from '../scenes';
import { safeSpeak } from '../../unit1/audio';
import * as sfx from '../../unit1/sfx';
import { Confetti } from '../../unit1/fx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { voiceOf } from './shared';

/* ---------- Frequency ladder ---------- */

const FREQUENCY_RUNGS: { key: 'never' | 'sometimes' | 'usually' | 'always'; label: string; color: string }[] = [
  { key: 'always', label: 'Always', color: '#FE6A2F' },
  { key: 'usually', label: 'Usually', color: '#FEBE4C' },
  { key: 'sometimes', label: 'Sometimes', color: '#4FA9E0' },
  { key: 'never', label: 'Never', color: '#94A3B8' },
];

export function FrequencyLadderScene({ scene, onNext, onWin, onLose, sync }: { scene: Extract<Scene, { kind: 'frequency-ladder' }>; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, { round: 0, picked: null as string | null, correct: false, wrong: null as string | null });
  const { round, picked, correct, wrong } = state;
  const gemDone = useRef(false);
  const total = scene.rounds.length;
  const complete = round >= total;
  const r = !complete ? scene.rounds[round] : null;

  useEffect(() => {
    if (complete) return;
    setState((s) => ({ ...s, picked: null, correct: false, wrong: null }));
    const t = window.setTimeout(() => void safeSpeak(`How often do you ${r!.action}?`, 'teacher'), 350);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, complete]);

  const tap = async (key: string) => {
    if (!r || picked) return;
    if (key !== r.answer) {
      sfx.wrong(); onLose();
      setState((s) => ({ ...s, wrong: key }));
      window.setTimeout(() => setState((s) => ({ ...s, wrong: null })), 500);
      return;
    }
    sfx.match();
    setState((s) => ({ ...s, picked: key, correct: true }));
    if (!gemDone.current) { gemDone.current = true; sfx.gem(); onWin(true); }
    await safeSpeak(r.line, voiceOf(scene.who));
    window.setTimeout(() => setState((s) => ({ ...s, round: s.round + 1 })), 1400);
  };

  if (complete) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
        <Confetti count={50} />
        <button onClick={onNext} className="relative z-10 animate-[lep1-slide-up_0.4s_ease-out] rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 text-xl font-black text-white shadow-2xl active:scale-95">You climbed the whole ladder! ⭐ Next</button>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute inset-0 bg-black/15" />
      <div className="pointer-events-none absolute left-1/2 top-4 z-30 max-w-[92%] -translate-x-1/2 rounded-full bg-white/95 px-4 py-2 text-center text-sm font-black text-orange-700 shadow-xl backdrop-blur sm:text-base">
        🪜 {scene.teacher} <span className="ml-1 opacity-60">({round + 1}/{total})</span>
      </div>
      <div className="absolute left-1/2 top-24 z-20 flex -translate-x-1/2 flex-col items-center gap-2 rounded-3xl bg-white/95 px-6 py-4 text-center shadow-2xl">
        <div className="text-[11px] font-black uppercase tracking-[0.25em] text-orange-500">How often do you...?</div>
        <div className="text-5xl">{r!.emoji}</div>
        <div className="text-lg font-black text-orange-800 sm:text-xl">{r!.action}</div>
      </div>
      {/* Bottom (Never) to top (Always) — a real ordered scale, not a flat
          option list, since the four answers actually rank against each
          other and the visual should say so. */}
      <div className="absolute inset-x-0 bottom-8 z-20 flex flex-col-reverse items-center gap-3 px-4">
        {FREQUENCY_RUNGS.map((rung) => {
          const isPicked = picked === rung.key;
          const showWrong = wrong === rung.key;
          const showRight = correct && rung.key === r!.answer;
          return (
            <button
              key={rung.key}
              onClick={() => tap(rung.key)}
              disabled={!!picked}
              className={`w-full max-w-sm rounded-2xl border-8 py-4 text-center text-xl font-black uppercase tracking-wide text-white shadow-2xl transition active:scale-95 disabled:cursor-not-allowed ${showWrong ? 'animate-[lep1-shake_0.4s_ease-in-out] border-red-400' : showRight || isPicked ? 'border-green-400 scale-105' : 'border-white'}`}
              style={{ background: rung.color }}
            >
              {rung.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
