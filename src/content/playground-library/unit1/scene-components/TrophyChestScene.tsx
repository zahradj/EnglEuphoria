import { useEffect, useRef } from 'react';
import type { Scene } from '../scenes';
import { CAST } from '../scenes';
import { safeSpeak, cueSpeakOnce } from '../audio';
import * as sfx from '../sfx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';

/** Hand-drawn treasure chest — wooden body + hinged lid that pops open on `open`, used by the Trophy Chest capstone game. */
function TrophyChestArt({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 220 200" style={{ width: 'clamp(190px, calc(30*var(--svw,1vw)), 300px)', height: 'auto', overflow: 'visible', filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.35))' }}>
      <rect x="20" y="100" width="180" height="90" rx="14" fill="#C97A2F" stroke="#2B1E17" strokeWidth={5} />
      <rect x="20" y="128" width="180" height="14" fill="#8A5420" stroke="#2B1E17" strokeWidth={3} />
      <rect x="94" y="100" width="32" height="90" fill="#8A5420" stroke="#2B1E17" strokeWidth={3} />
      <circle cx="110" cy="145" r="14" fill="#F5B942" stroke="#2B1E17" strokeWidth={4} />
      <rect x="104" y="141" width="12" height="16" rx="3" fill="#8A5420" />
      <g style={{ transformBox: 'fill-box', transformOrigin: '50% 100%', transform: open ? 'rotate(-55deg) translate(-4px, -6px)' : 'rotate(0deg)', transition: 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1)' }}>
        <path d="M14 100 Q14 42 110 38 Q206 42 206 100 Z" fill="#E08A3C" stroke="#2B1E17" strokeWidth={5} />
        <rect x="94" y="38" width="32" height="62" fill="#8A5420" opacity={0.85} />
      </g>
      {open && (
        <g className="pointer-events-none">
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const a = (i / 6) * Math.PI * 2;
            return (
              <text key={i} x={110 + Math.cos(a) * 78} y={78 + Math.sin(a) * 58} fontSize="20" textAnchor="middle" style={{ animation: `lep1-pop-fade 0.9s ease-out ${i * 0.05}s both` }}>✨</text>
            );
          })}
        </g>
      )}
    </svg>
  );
}

/* ---------- Trophy chest ---------- */

export function TrophyChestScene({ scene, onNext, onWin, onLose, sync }: { scene: Extract<Scene, { kind: 'trophy-chest' }>; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void; sync?: ActivitySync }) {
  const [state, setState] = useSyncedState(sync, { roundIdx: 0, revealed: false, wrongPick: null as string | null, finished: false });
  const { roundIdx, revealed, wrongPick, finished } = state;
  const gemDone = useRef(false);
  const round = scene.rounds[roundIdx];
  const c = CAST[scene.who];

  useEffect(() => { if (round && !revealed) cueSpeakOnce(`Find the ${round.letter} sound!`, scene.who); }, [roundIdx]);

  const pick = async (choice: string) => {
    if (revealed || finished || !round) return;
    if (choice !== round.letter) {
      sfx.wrong(); onLose();
      setState((s) => ({ ...s, wrongPick: choice }));
      window.setTimeout(() => setState((s) => ({ ...s, wrongPick: null })), 450);
      return;
    }
    sfx.match();
    setState((s) => ({ ...s, revealed: true }));
    await safeSpeak(round.word, scene.who);
    await new Promise((r) => window.setTimeout(r, 1300));
    const next = roundIdx + 1;
    if (next >= scene.rounds.length) {
      if (!gemDone.current) { gemDone.current = true; sfx.gem(); onWin(true); }
      setState((s) => ({ ...s, finished: true }));
    } else {
      setState((s) => ({ ...s, revealed: false, roundIdx: next }));
    }
  };

  return (
    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-black/40" />
      <div className="pointer-events-none absolute left-1/2 top-3 z-30 max-w-[92%] -translate-x-1/2 rounded-full bg-white/95 px-5 py-2 text-center text-sm font-black text-orange-700 shadow-xl backdrop-blur sm:text-base">
        🗝️ {scene.teacher} {!finished && <span className="ml-1 opacity-60">({roundIdx + 1}/{scene.rounds.length})</span>}
      </div>

      {!finished ? (
        <div className="absolute inset-x-0 top-24 bottom-28 z-10 flex flex-col items-center justify-center gap-5 px-4">
          <div className="relative flex flex-col items-center">
            <TrophyChestArt open={revealed} />
            {revealed && round && (
              <div className="absolute -top-16 left-1/2 flex -translate-x-1/2 flex-col items-center" style={{ animation: 'lep1-pop 0.5s ease-out' }}>
                {round.img ? <img src={round.img} alt={round.word} className="h-20 w-20 object-contain drop-shadow-xl" /> : <span className="text-6xl">{round.emoji}</span>}
                <span className="mt-1 rounded-full bg-white/95 px-3 py-1 text-sm font-black text-orange-700 shadow">{round.word}</span>
              </div>
            )}
          </div>
          <img src={c.img} alt={c.name} width={64} height={64} className="h-16 w-16 object-contain animate-[lep1-hop_1.6s_ease-in-out_infinite]" />
          <button onClick={() => round && safeSpeak(round.word, scene.who)} disabled={revealed} className="rounded-full bg-white/90 px-4 py-2 text-sm font-bold text-orange-700 shadow-lg ring-2 ring-orange-200 backdrop-blur disabled:opacity-40">
            🔊 Hear it again
          </button>
          <div className="flex gap-3">
            {round?.choices.map((L) => (
              <button key={L} onClick={() => pick(L)} disabled={revealed}
                className={`grid h-20 w-20 place-items-center rounded-2xl text-4xl font-black text-white shadow-xl transition active:scale-90 disabled:opacity-50 sm:h-24 sm:w-24 sm:text-5xl ${wrongPick === L ? 'animate-[lep1-shake_0.4s_ease-in-out]' : ''}`}
                style={{ background: 'linear-gradient(135deg, #C97A2F, #F5B942)' }}>
                {L}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 px-6 text-center">
          <TrophyChestArt open />
          <div className="rounded-3xl bg-white/95 px-8 py-4 text-2xl font-black text-orange-700 shadow-2xl sm:text-3xl">🏆 The Trophy Chest is unlocked!</div>
          <button onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-8 py-3 text-lg font-black text-white shadow-2xl active:scale-95" style={{ animation: 'lep1-slide-up 0.4s ease-out' }}>
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
