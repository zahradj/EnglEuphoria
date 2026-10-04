import { useMemo, useState } from 'react';
import type { Scene } from '../scenes';
import { safeSpeak } from '../audio';
import * as sfx from '../sfx';
import { STICKER_FILTER, STICKER_TILTS } from './shared';

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
      <div className="relative z-10 grid w-full grid-cols-4 gap-4 px-4 sm:gap-5" style={{ maxWidth: `min(860px, ${Math.round(66 * 4 / Math.max(1, Math.ceil(deck.length / 4)))}vh)` }}>
        {deck.map((card) => {
          const isMatched = matched.has(card.pairId);
          const isFlipped = flipped.includes(card.key) || isMatched;
          const tilt = STICKER_TILTS[deck.indexOf(card) % STICKER_TILTS.length];
          return (
            <button key={card.key} onClick={() => tap(card)} disabled={busy || isMatched} className="relative aspect-square [perspective:800px]" aria-label={isFlipped ? card.label : 'Hidden card'}>
              <div className="absolute inset-0 [transform-style:preserve-3d]" style={{ transform: isFlipped ? 'rotateY(180deg)' : undefined, transition: 'transform 0.55s cubic-bezier(.3,1.5,.5,1)' }}>
                {/* Back: a round star sticker (die-cut white edge, shine). */}
                <div className="absolute inset-[6%] [backface-visibility:hidden]" style={{ filter: STICKER_FILTER, transform: `rotate(${tilt}deg)` }}>
                  <div className="relative grid h-full w-full place-items-center overflow-hidden rounded-full" style={{ background: 'radial-gradient(circle at 32% 28%, #FFC58F 0, #FE6A2F 58%, #DB4A16 100%)' }}>
                    <div className="absolute inset-0 opacity-25" style={{ backgroundImage: 'radial-gradient(circle, #fff 1.6px, transparent 2px)', backgroundSize: '14px 14px' }} />
                    <span className="relative text-[min(7.5vh,5.5vw)] drop-shadow-[0_2px_0_rgba(0,0,0,0.25)]">⭐</span>
                    <div className="absolute -left-1/4 top-0 h-full w-1/3 rotate-12 bg-white/25 blur-sm" />
                  </div>
                </div>
                {/* Face: the toy itself as a sticker — no white card. */}
                <div className="absolute inset-0 flex flex-col items-center justify-center [backface-visibility:hidden] [transform:rotateY(180deg)]" style={isMatched ? { animation: 'lep1-pop 0.5s ease-out' } : undefined}>
                  {isMatched && <span className="pointer-events-none absolute inset-[10%] rounded-full bg-emerald-300/60 blur-xl" />}
                  {isMatched && <span className="pointer-events-none absolute -right-1 -top-2 z-10 text-2xl" style={{ animation: 'lep1-wobble 1s ease-in-out infinite' }}>✨</span>}
                  <div className="relative h-full w-full scale-110" style={{ filter: STICKER_FILTER, transform: `rotate(${-tilt}deg)` }}>
                    {card.img ? <img src={card.img} alt="" className="h-full w-full object-contain" draggable={false} /> : <span className="grid h-full w-full place-items-center text-5xl">{card.emoji}</span>}
                  </div>
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
