import { useMemo, useState } from 'react';
import type { Scene } from '../scenes';
import { safeSpeak } from '../audio';
import * as sfx from '../sfx';

/* ---------- Memory ---------- */

export function MemoryScene({ scene, onNext, onWin, onLose }: { scene: Extract<Scene, { kind: 'memory' }>; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void }) {
  type Card = { key: string; pairId: string; label: string; emoji: string; img?: string };
  const deck = useMemo<Card[]>(() => {
    const base = scene.pairs.flatMap((p) => [{ key: `${p.id}-a`, pairId: p.id, label: p.label, emoji: p.emoji, img: p.img }, { key: `${p.id}-b`, pairId: p.id, label: p.label, emoji: p.emoji, img: p.img }]);
    return base.map((c, i) => ({ c, r: (i * 9301 + 49297) % 233280 })).sort((a, b) => a.r - b.r).map((x) => x.c);
  }, [scene.id]);
  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [gemDone, setGemDone] = useState(false);


  const tap = async (card: Card) => {
    if (busy || matched.has(card.pairId) || flipped.includes(card.key)) return;
    const next = [...flipped, card.key];
    setFlipped(next);
    void safeSpeak(card.label, 'teacher');
    if (next.length === 2) {
      setBusy(true);
      const a = deck.find((c) => c.key === next[0])!, b = deck.find((c) => c.key === next[1])!;
      await new Promise((r) => setTimeout(r, 700));
      if (a.pairId === b.pairId) {
        sfx.match();
        setMatched((m) => {
          const copy = new Set(m); copy.add(a.pairId);
          if (copy.size === scene.pairs.length && !gemDone) { sfx.gem(); setGemDone(true); onWin(true); }
          return copy;
        });
      } else { sfx.wrong(); onLose(); }
      setFlipped([]); setBusy(false);
    }
  };
  const complete = matched.size === scene.pairs.length;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-cover bg-center pb-24" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute left-1/2 top-4 z-30 max-w-[92%] -translate-x-1/2 rounded-full bg-white/95 px-4 py-2 text-center text-sm font-black text-orange-700 shadow-xl backdrop-blur sm:text-base">🧠 {scene.teacher}</div>
      <div className="relative z-10 grid w-full max-w-[860px] grid-cols-4 gap-5 px-4 sm:gap-6">
        {deck.map((card) => {
          const isMatched = matched.has(card.pairId);
          const isFlipped = flipped.includes(card.key) || isMatched;
          return (
            <button key={card.key} onClick={() => tap(card)} disabled={busy || isMatched} className="relative aspect-square [perspective:800px]" aria-label={isFlipped ? card.label : 'Hidden card'}>
              <div className="absolute inset-0 transition-transform duration-500 [transform-style:preserve-3d]" style={{ transform: isFlipped ? 'rotateY(180deg)' : undefined }}>
                <div className="absolute inset-0 flex items-center justify-center rounded-2xl border-4 border-white text-3xl font-black text-white shadow-xl [backface-visibility:hidden]" style={{ background: 'linear-gradient(135deg,#FE6A2F,#FF8A4C)' }}>?</div>
                <div className={`absolute inset-0 flex flex-col items-center justify-center rounded-2xl border-4 bg-white p-2 shadow-xl [backface-visibility:hidden] [transform:rotateY(180deg)] ${isMatched ? 'border-green-400 ring-4 ring-green-300/60' : 'border-white'}`}>
                  {card.img ? <img src={card.img} alt="" className="h-3/4 w-3/4 object-contain" draggable={false} /> : <span className="text-4xl">{card.emoji}</span>}
                  <span className="mt-1 text-[10px] font-black text-orange-700 sm:text-xs">{card.label}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      {complete && <div className="absolute inset-x-0 bottom-8 z-30 flex justify-center"><button onClick={onNext} className="animate-[lep1-slide-up_0.4s_ease-out] rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-3 text-lg font-black text-white shadow-2xl active:scale-95">All pairs! ⭐ Next</button></div>}
    </div>
  );
}
