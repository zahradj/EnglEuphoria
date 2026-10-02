import { useEffect, useMemo } from 'react';
import type { Scene } from '../scenes';
import { safeSpeak } from '../../unit1/audio';
import * as sfx from '../../unit1/sfx';
import { type ActivitySync, useSyncedState } from '../../sceneActivitySync';
import { CroppedImage } from '../../PictureMatchScene';
import { shuffledIndices } from './shared';

/* ---------- Memory ---------- */

export function MemoryScene({ scene, onNext, onWin, onLose, sync }: { scene: Extract<Scene, { kind: 'memory' }>; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void; sync?: ActivitySync }) {
  type Card = {
    key: string; pairId: string; label: string; emoji: string; variant: 'emoji' | 'word' | 'pic';
    img?: string; crop?: { x: number; y: number; w: number; h: number }; imgAspect?: number;
  };
  // Unshuffled and identical on both screens without needing to travel
  // over the sync channel — only the LAYOUT (see `order` below) needs
  // syncing, not which cards exist.
  const baseCards = useMemo<Card[]>(() => scene.pairs.flatMap((p) =>
    p.img
      ? [
          { key: `${p.id}-word`, pairId: p.id, label: p.label, emoji: p.emoji, variant: 'word' as const },
          { key: `${p.id}-pic`, pairId: p.id, label: p.label, emoji: p.emoji, img: p.img, crop: p.crop, imgAspect: p.imgAspect, variant: 'pic' as const },
        ]
      : [
          { key: `${p.id}-a`, pairId: p.id, label: p.label, emoji: p.emoji, variant: 'emoji' as const },
          { key: `${p.id}-b`, pairId: p.id, label: p.label, emoji: p.emoji, variant: 'emoji' as const },
        ]
  ), [scene.id]);

  // `matched` is a plain string[] (not a Set) because the synced snapshot
  // travels as JSON over the broadcast channel, which would silently
  // flatten a Set to `{}`. `order` is the shuffled layout (indices into
  // baseCards) — it used to be baked into a fixed, non-random formula
  // keyed only by card position, so the SAME layout appeared every single
  // time this scene was played. Real Math.random() shuffling needs to
  // travel as synced state instead (same pattern as HelloDoorsScene's own
  // `order`): only the authority side shuffles, so both screens land on
  // the identical random layout rather than two different ones.
  const [state, setState] = useSyncedState(sync, { order: [] as number[], flipped: [] as string[], matched: [] as string[], busy: false, gemDone: false });
  const { order, flipped, matched, busy, gemDone } = state;
  const matchedSet = useMemo(() => new Set(matched), [matched]);
  const isRemoteMirror = !!sync?.isSynced && !sync.isAuthority;

  useEffect(() => {
    if (isRemoteMirror) return;
    setState((s) => ({ ...s, order: shuffledIndices(baseCards.length), flipped: [], matched: [], busy: false, gemDone: false }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene.id, isRemoteMirror]);

  const deck = order.length === baseCards.length ? order.map((i) => baseCards[i]) : baseCards;

  const tap = async (card: Card) => {
    if (busy || matchedSet.has(card.pairId) || flipped.includes(card.key)) return;
    const next = [...flipped, card.key];
    setState((s) => ({ ...s, flipped: next }));
    void safeSpeak(card.label, 'teacher');
    if (next.length === 2) {
      setState((s) => ({ ...s, busy: true }));
      const a = deck.find((c) => c.key === next[0])!, b = deck.find((c) => c.key === next[1])!;
      await new Promise((r) => setTimeout(r, 700));
      if (a.pairId === b.pairId) {
        sfx.match();
        setState((s) => {
          const nextMatched = s.matched.includes(a.pairId) ? s.matched : [...s.matched, a.pairId];
          const justCompleted = nextMatched.length === scene.pairs.length && !s.gemDone;
          if (justCompleted) { sfx.gem(); onWin(true); }
          return { ...s, matched: nextMatched, gemDone: s.gemDone || justCompleted, flipped: [], busy: false };
        });
      } else {
        sfx.wrong(); onLose();
        setState((s) => ({ ...s, flipped: [], busy: false }));
      }
    }
  };
  const complete = matched.length === scene.pairs.length;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-cover bg-center pb-24" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute left-1/2 top-4 z-30 max-w-[92%] -translate-x-1/2 rounded-full bg-white/95 px-4 py-2 text-center text-sm font-black text-orange-700 shadow-xl backdrop-blur sm:text-base">🧠 {scene.teacher}</div>
      <div className="relative z-10 grid w-full max-w-[860px] grid-cols-4 gap-5 px-4 sm:gap-6">
        {deck.map((card) => {
          const isMatched = matchedSet.has(card.pairId);
          const isFlipped = flipped.includes(card.key) || isMatched;
          return (
            <button key={card.key} onClick={() => tap(card)} disabled={busy || isMatched} className="relative aspect-square [perspective:800px]" aria-label={isFlipped ? card.label : 'Hidden card'}>
              <div className="absolute inset-0 transition-transform duration-500 [transform-style:preserve-3d]" style={{ transform: isFlipped ? 'rotateY(180deg)' : undefined }}>
                <div className="absolute inset-0 flex items-center justify-center rounded-2xl border-4 border-white text-3xl font-black text-white shadow-xl [backface-visibility:hidden]" style={{ background: 'linear-gradient(135deg,#FE6A2F,#FF8A4C)' }}>?</div>
                <div className={`absolute inset-0 flex flex-col items-center justify-center overflow-hidden rounded-2xl border-4 bg-white shadow-xl [backface-visibility:hidden] [transform:rotateY(180deg)] ${card.variant === 'pic' ? '' : 'p-2'} ${isMatched ? 'border-green-400 ring-4 ring-green-300/60' : 'border-white'}`}>
                  {card.variant === 'pic' ? (
                    card.img && card.crop ? (
                      <CroppedImage src={card.img} crop={card.crop} aspect={card.imgAspect ?? 16 / 9} />
                    ) : (
                      <img src={card.img} alt={card.label} className="h-full w-full object-cover" />
                    )
                  ) : card.variant === 'word' ? (
                    // Word card: reading practice half of a word<->picture
                    // pair — just the text, no emoji, so the match is
                    // genuinely word-to-meaning rather than icon-to-icon.
                    <span className="px-1 text-center text-xl font-black leading-tight text-orange-700 sm:text-2xl">{card.label}</span>
                  ) : (
                    <>
                      <span className="text-4xl">{card.emoji}</span>
                      <span className="mt-1 text-[10px] font-black text-orange-700 sm:text-xs">{card.label}</span>
                    </>
                  )}
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
