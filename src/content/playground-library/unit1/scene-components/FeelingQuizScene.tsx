import { useEffect, useMemo } from 'react';
import type { Scene } from '../scenes';
import { CAST, getEmotionSprite } from '../scenes';
import { safeSpeak } from '../audio';
import * as sfx from '../sfx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { FEELING_EMOJI } from './shared';

/* ---------- Feeling quiz ---------- */

const EMOTION_WORD: Record<'happy' | 'sad' | 'angry', string> = { happy: 'Happy', sad: 'Sad', angry: 'Angry' };

export function FeelingQuizScene({ scene, onNext, onWin, onLose, sync }: { scene: Extract<Scene, { kind: 'feeling-quiz' }>; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, { round: 0, score: 0, picked: null as 'happy' | 'sad' | 'angry' | null, correct: null as boolean | null, gemDone: false });
  const { round, score, picked, correct, gemDone } = state;
  const total = scene.rounds.length;
  const finished = round >= total;
  const r = !finished ? scene.rounds[round] : null;

  const options = useMemo(() => {
    if (!r) return [] as ('happy' | 'sad' | 'angry')[];
    const others = (['happy', 'sad', 'angry'] as const).filter((e) => e !== r.emotion);
    const arr = [r.emotion, ...others];
    const seed = round * 7 + 3;
    return arr.map((e, i) => ({ e, k: (i * 131 + seed * 97) % 991 })).sort((a, b) => a.k - b.k).map((x) => x.e);
  }, [round, r]);

  useEffect(() => {
    if (!r) return;
    setState((s) => ({ ...s, picked: null, correct: null }));
    const t = window.setTimeout(() => void safeSpeak(r.prompt, 'teacher'), 300);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round]);

  const pick = async (choice: 'happy' | 'sad' | 'angry') => {
    if (!r || picked) return;
    const ok = choice === r.emotion;
    setState((s) => ({ ...s, picked: choice, correct: ok }));
    if (ok) {
      sfx.match();
      setState((s) => ({ ...s, score: s.score + 1 }));
      await safeSpeak(`${CAST[r.who].name} is ${r.emotion}!`, r.who);
      const next = round + 1;
      const awardGem = next >= total && !gemDone;
      if (awardGem) { sfx.gem(); onWin(true); }
      window.setTimeout(() => setState((s) => ({ ...s, round: next, gemDone: s.gemDone || awardGem })), 300);
    } else {
      sfx.wrong(); onLose();
      window.setTimeout(() => setState((s) => ({ ...s, picked: null, correct: null })), 700);
    }
  };

  if (finished) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-cover bg-center pb-24" style={{ backgroundImage: `url(${scene.bg})` }}>
        <div className="absolute inset-0 bg-black/30" />
        <button onClick={onNext} className="relative z-10 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 text-xl font-black text-white shadow-2xl active:scale-95">Great quiz! {score}/{total} ⭐ Next</button>
      </div>
    );
  }

  const c = CAST[r!.who];
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-between bg-cover bg-center px-4 py-4" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30" />
      <button onClick={() => void safeSpeak(r!.prompt, 'teacher')} className="relative z-20 mt-2 max-w-[92%] rounded-full bg-white/95 px-5 py-3 text-center text-base font-black text-orange-700 shadow-xl backdrop-blur active:scale-95 sm:text-lg">
        🔊 {r!.prompt} <span className="ml-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-600">{round + 1}/{total}</span>
      </button>
      <img src={getEmotionSprite(r!.who, r!.emotion)} alt={c.name} className="relative z-10 h-48 w-48 object-contain drop-shadow-2xl sm:h-60 sm:w-60" />
      <div className="relative z-10 flex w-full max-w-lg gap-3 pb-2">
        {options.map((opt) => (
          <button key={opt} onClick={() => pick(opt)} disabled={!!picked}
            className={`flex flex-1 flex-col items-center gap-1 rounded-3xl border-4 border-white p-3 shadow-2xl transition active:scale-95 disabled:opacity-60 ${picked === opt ? (correct ? 'ring-4 ring-green-300 scale-105' : 'animate-[lep1-shake_0.4s_ease-out]') : ''}`}
            style={{ background: 'linear-gradient(135deg,#FE6A2F,#FF8A4C)' }}
          >
            <span className="text-5xl">{FEELING_EMOJI[opt]}</span>
            <span className="text-xs font-black uppercase text-white drop-shadow">{EMOTION_WORD[opt]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
