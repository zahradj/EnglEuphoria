import { useEffect, useState } from 'react';
import type { CharKey } from '../scenes';
import { CAST, getEmotionSprite } from '../scenes';
import { safeSpeak } from '../audio';
import * as sfx from '../sfx';
import { SpriteMascot, MASCOT_EYE_BANDS } from '../SpriteMascot';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { FEELING_EMOJI } from './shared';

/* ---------- Free production "say it & check" (feelings-dice, he-she-say, i-am-feeling) ---------- */

export function ProduceSentenceScene({
  teacher, icon, rounds, announce, onNext, onWin, sync,
}: {
  teacher: string;
  icon: string;
  rounds: { key: string; who?: CharKey; emotion: 'happy' | 'sad' | 'angry'; sentence: string }[];
  announce?: { who: CharKey; text: string };
  onNext: () => void;
  onWin: (gem: boolean) => void;
  sync?: ActivitySync;
}) {
  const [state, setState] = useSyncedState(sync, { round: 0, revealed: false, gemDone: false });
  const { round, revealed, gemDone } = state;
  const isRemoteMirror = !!sync?.isSynced && !sync.isAuthority;
  const [talking, setTalking] = useState(false);
  const total = rounds.length;
  const finished = round >= total;
  const r = !finished ? rounds[round] : null;

  useEffect(() => {
    if (!r) return;
    if (announce) void safeSpeak(announce.text, announce.who);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round]);

  const reveal = async () => {
    if (isRemoteMirror || !r) return;
    setState((s) => ({ ...s, revealed: true }));
    sfx.pop();
    setTalking(true);
    await safeSpeak(r.sentence, r.who ?? 'teacher');
    setTalking(false);
  };
  const confirm = () => {
    if (isRemoteMirror || !r) return;
    if (!revealed) { void reveal(); return; }
    sfx.match();
    const next = round + 1;
    const awardGem = next >= total && !gemDone;
    if (awardGem) { sfx.gem(); onWin(true); }
    setState((s) => ({ ...s, round: next, revealed: false, gemDone: s.gemDone || awardGem }));
  };

  if (finished) {
    return (
      <div className="absolute inset-x-0 bottom-8 z-30 flex justify-center">
        <button onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 text-xl font-black text-white shadow-2xl active:scale-95 animate-[lep1-slide-up_0.4s_ease-out]">Great job! Next →</button>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6">
      <div className="pointer-events-none absolute inset-x-0 top-4 flex justify-center px-4">
        <div className="max-w-lg rounded-full bg-white/90 px-5 py-2 text-center text-sm font-black text-orange-700 shadow-lg backdrop-blur sm:text-base">{teacher} <span className="ml-1 opacity-60">({round + 1}/{total})</span></div>
      </div>
      <div className="flex flex-col items-center">
        {r!.who ? (
          <div className="h-56 w-56 drop-shadow-2xl sm:h-64 sm:w-64">
            <SpriteMascot
              profile={{ src: getEmotionSprite(r!.who, r!.emotion), eyeBand: MASCOT_EYE_BANDS[r!.who] }}
              emotion={r!.emotion}
              isTalking={talking}
              alt={CAST[r!.who].name}
            />
          </div>
        ) : (
          <div className="grid h-40 w-40 place-items-center rounded-full bg-gradient-to-br from-orange-300 to-pink-300 text-7xl shadow-2xl" style={{ animation: 'lep1-float 3s ease-in-out infinite' }}>🌟</div>
        )}
        <span className="mt-2 text-5xl">{FEELING_EMOJI[r!.emotion]}</span>
      </div>
      <div className="mt-4 min-h-[4.5rem] w-full max-w-md rounded-3xl bg-white/95 px-6 py-4 text-center shadow-2xl">
        {revealed
          ? <p className="text-2xl font-black text-orange-700 sm:text-3xl">“{r!.sentence}”</p>
          : <p className="text-lg font-bold text-neutral-500">{icon} Say it out loud, then tap to check!</p>}
      </div>
      <div className="mt-5 flex gap-3">
        {revealed && <button onClick={() => void reveal()} className="rounded-full bg-white/95 px-5 py-3 text-sm font-black text-orange-700 shadow ring-2 ring-orange-200 active:scale-95">🔊 Hear it again</button>}
        <button onClick={confirm} className="rounded-full bg-gradient-to-r from-orange-500 to-orange-600 px-7 py-3 text-base font-black text-white shadow-xl active:scale-95">
          {revealed ? '➜ Next round' : '✅ Check my answer'}
        </button>
      </div>
    </div>
  );
}
