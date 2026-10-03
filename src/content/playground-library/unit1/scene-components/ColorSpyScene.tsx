import { useEffect, useRef } from 'react';
import type { Scene } from '../scenes';
import { safeSpeak, cueSpeakOnce } from '../audio';
import * as sfx from '../sfx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';

export function spyLine(clue: string, article?: 'a') {
  return article ? `I spy a ${clue.toLowerCase()}!` : `I spy something ${clue.toLowerCase()}!`;
}

/* ---------- Color Spy ("I spy something ___!" — find it among several visible at once) ---------- */

export function ColorSpyScene({ scene, onWin, onLose, onNext, sync }: { scene: Extract<Scene, { kind: 'color-spy' }>; onWin: (gem: boolean) => void; onLose: () => void; onNext: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, { roundIdx: 0, picked: null as string | null, correct: false });
  const { roundIdx, picked, correct } = state;
  const gemDone = useRef(false);
  const total = scene.clueOrder.length;
  const done = roundIdx >= total;
  const clue = !done ? scene.clueOrder[roundIdx] : null;

  useEffect(() => {
    if (!clue) return;
    setState((s) => ({ ...s, picked: null, correct: false }));
    cueSpeakOnce(spyLine(clue, scene.article), scene.who);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundIdx]);

  const pick = async (spot: (typeof scene.spots)[number]) => {
    if (correct || !clue) return;
    if (spot.colorWord !== clue) {
      sfx.wrong(); onLose();
      setState((s) => ({ ...s, picked: spot.colorWord }));
      window.setTimeout(() => setState((s) => ({ ...s, picked: null })), 500);
      return;
    }
    sfx.match();
    setState((s) => ({ ...s, picked: spot.colorWord, correct: true }));
    await safeSpeak(`Yes! ${spot.label}!`, scene.who);
    window.setTimeout(() => {
      const next = roundIdx + 1;
      const awardGem = next >= total && !gemDone.current;
      if (awardGem) { gemDone.current = true; sfx.gem(); onWin(true); }
      setState((s) => ({ ...s, roundIdx: next }));
    }, 900);
  };

  return (
    <div className="absolute inset-0 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30" />
      <div className="pointer-events-none absolute left-1/2 top-4 z-30 max-w-[92%] -translate-x-1/2 rounded-full bg-white/95 px-5 py-2 text-center text-sm font-black text-orange-700 shadow-xl backdrop-blur sm:text-base">
        {done ? 'You spied them all! ⭐' : `🔍 ${spyLine(clue ?? '', scene.article)}`} <span className="ml-1 opacity-60">({Math.min(roundIdx, total)}/{total})</span>
      </div>
      {!done && scene.spots.map((spot) => {
        const isPicked = picked === spot.colorWord;
        const isRightPick = isPicked && correct;
        const isWrongPick = isPicked && !correct;
        return (
          <button
            key={spot.colorWord}
            onClick={() => pick(spot)}
            disabled={correct}
            aria-label={`Is it ${spot.label}?`}
            className={`absolute z-20 -translate-x-1/2 -translate-y-1/2 grid h-20 w-20 place-items-center rounded-full border-4 border-white shadow-2xl transition active:scale-90 sm:h-24 sm:w-24 ${isRightPick ? 'scale-110 ring-4 ring-green-400' : isWrongPick ? 'animate-[lep1-shake_0.4s_ease-in-out] ring-4 ring-red-400' : 'animate-[lep1-hop_1.6s_ease-in-out_infinite]'}`}
            style={{ left: spot.left, top: spot.top, background: `${spot.colorHex}33`, backdropFilter: 'blur(2px)' }}
          >
            <span className="grid h-14 w-14 place-items-center rounded-full text-xl sm:h-16 sm:w-16" style={{ background: spot.colorHex }}>
              {isRightPick ? '✅' : isWrongPick ? '❌' : '🔍'}
            </span>
          </button>
        );
      })}
      {done && (
        <div className="absolute inset-x-0 bottom-8 z-30 flex justify-center">
          <button onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 text-xl font-black text-white shadow-2xl active:scale-95">Next →</button>
        </div>
      )}
    </div>
  );
}
