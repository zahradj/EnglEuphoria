import { useEffect, useState } from 'react';
import type { Scene, CharKey } from '../scenes';
import { CAST, getEmotionSprite } from '../scenes';
import * as sfx from '../sfx';
import { PUZZLE_BOARD_SIZE } from './shared';

/* ---------- Puzzle ---------- */

export function PuzzleScene({ scene, onNext, onWin, onLose }: { scene: Extract<Scene, { kind: 'puzzle' }>; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void }) {
  const [round, setRound] = useState(0);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [pick, setPick] = useState<CharKey | null>(null);
  const [correct, setCorrect] = useState<boolean | null>(null);
  const [gemDone, setGemDone] = useState(false);
  const total = scene.rounds.length;
  const finished = round >= total;
  const r = !finished ? scene.rounds[round] : null;
  const GRID = 9;

  useEffect(() => {
    if (finished) return;
    setRevealed(new Set()); setPick(null); setCorrect(null);
  }, [round, finished]);

  const tapPiece = (i: number) => { if (!r || correct !== null) return; setRevealed((s) => { const c = new Set(s); c.add(i); return c; }); sfx.match(); };
  const guess = async (who: CharKey) => {
    if (!r || correct !== null) return;
    setPick(who);
    const ok = who === r.who;
    setCorrect(ok);
    if (ok) {
      sfx.match(); setRevealed(new Set(Array.from({ length: GRID }, (_, i) => i))); sfx.gem();
      window.setTimeout(() => { const next = round + 1; if (next >= total && !gemDone) { setGemDone(true); onWin(true); } setRound(next); }, 2200);
    } else { sfx.wrong(); onLose(); window.setTimeout(() => { setPick(null); setCorrect(null); }, 700); }
  };

  if (finished) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-cover bg-center pb-24" style={{ backgroundImage: `url(${scene.bg})` }}>
        <button onClick={onNext} className="relative z-10 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 text-xl font-black text-white shadow-2xl active:scale-95">You guessed them all! ⭐ Next</button>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-cover bg-center px-4 pb-24" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute left-1/2 top-4 z-30 max-w-[92%] -translate-x-1/2 rounded-full bg-white/95 px-4 py-2 text-center text-sm font-black text-orange-700 shadow-xl backdrop-blur sm:text-base">🧩 {scene.teacher} <span className="ml-1 opacity-70">({round + 1}/{total})</span></div>
      <div className={`relative z-10 mt-16 aspect-square ${PUZZLE_BOARD_SIZE} overflow-hidden rounded-3xl border-4 border-white shadow-2xl`}>
        <img src={r!.emotion ? getEmotionSprite(r!.who, r!.emotion) : r!.img} alt="mystery friend" className="absolute inset-0 h-full w-full object-contain" draggable={false} />
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
          {Array.from({ length: GRID }, (_, i) => {
            const isRev = revealed.has(i);
            return <button key={i} onClick={() => tapPiece(i)} disabled={isRev} className={`border border-white/50 transition-opacity duration-300 ${isRev ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} style={{ background: 'linear-gradient(135deg,#FE6A2F,#FEBE4C)' }} aria-label={`Reveal piece ${i + 1}`}><span className="text-2xl font-black text-white drop-shadow">?</span></button>;
          })}
        </div>
      </div>
      <p className="relative z-10 rounded-full bg-white/95 px-4 py-2 text-sm font-bold text-neutral-800 shadow backdrop-blur">💡 {r!.hint}</p>
      <div className="relative z-10 flex flex-wrap justify-center gap-3">
        {Array.from(new Set(scene.rounds.map((rd) => rd.who))).map((who) => {
          const c = CAST[who];
          const isPick = pick === who;
          const showWrong = isPick && correct === false;
          return (
            <button key={who} onClick={() => guess(who)} disabled={correct !== null} className={`flex flex-col items-center rounded-2xl border-4 bg-white/95 px-4 py-3 shadow-xl active:scale-95 ${isPick && correct ? 'border-green-400 ring-4 ring-green-300/60' : showWrong ? 'border-red-400 animate-[lep1-shake_0.4s_ease-out]' : 'border-white'}`}>
              <img src={c.img} alt={c.name} className="h-16 w-16 object-contain" draggable={false} />
              <span className="mt-1 text-sm font-black text-orange-700">{c.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
