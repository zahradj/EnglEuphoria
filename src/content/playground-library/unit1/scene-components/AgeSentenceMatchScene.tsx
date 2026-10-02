import { useMemo, useRef, useState } from 'react';
import type { Scene } from '../scenes';
import { CAST } from '../scenes';
import { safeSpeak } from '../audio';
import * as sfx from '../sfx';
import { BALLOONS_SPRITE } from './shared';

export function AgeSentenceMatchScene({ scene, onNext, onWin, onLose }: { scene: Extract<Scene, { kind: 'age-sentence-match' }>; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void }) {
  const cards = useMemo(() => {
    const arr = scene.friends.map((f, i) => ({ i, text: `${CAST[f.who].name} is ${f.age}!` }));
    return [...arr].sort(() => Math.random() - 0.5);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [wrongCard, setWrongCard] = useState<number | null>(null);
  const [gemDone, setGemDone] = useState(false);
  const allMatched = matched.size >= scene.friends.length;

  const [dragging, setDragging] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState({ dx: 0, dy: 0 });
  const [hotFriend, setHotFriend] = useState<number | null>(null);
  const friendRefs = useRef<Record<number, HTMLElement | null>>({});
  const start = useRef({ x: 0, y: 0 });

  const hitTest = (x: number, y: number): number | null => {
    for (let i = 0; i < scene.friends.length; i++) {
      const el = friendRefs.current[i];
      if (!el) continue;
      const b = el.getBoundingClientRect();
      const PAD = 24;
      if (x >= b.left - PAD && x <= b.right + PAD && y >= b.top - PAD && y <= b.bottom + PAD) return i;
    }
    return null;
  };

  const attemptMatch = async (cardIdx: number, friendIdx: number) => {
    const card = cards[cardIdx];
    if (card.i === friendIdx) {
      sfx.match();
      const next = new Set(matched).add(card.i);
      setMatched(next);
      const f = scene.friends[card.i];
      await safeSpeak(card.text, f.who);
      if (next.size >= scene.friends.length && !gemDone) { sfx.gem(); setGemDone(true); onWin(true); }
    } else {
      sfx.wrong(); onLose(); setWrongCard(cardIdx);
      window.setTimeout(() => setWrongCard(null), 400);
    }
  };

  const onDown = (idx: number) => (e: React.PointerEvent<HTMLButtonElement>) => {
    if (matched.has(cards[idx].i)) return;
    setDragging(idx);
    start.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture?.(e.pointerId);
    void safeSpeak(cards[idx].text, scene.friends[cards[idx].i].who);
  };
  const onMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (dragging === null) return;
    setDragOffset({ dx: e.clientX - start.current.x, dy: e.clientY - start.current.y });
    setHotFriend(hitTest(e.clientX, e.clientY));
  };
  const onUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    const idx = dragging;
    setDragging(null);
    setHotFriend(null);
    setDragOffset({ dx: 0, dy: 0 });
    if (idx === null) return;
    const friendIdx = hitTest(e.clientX, e.clientY);
    if (friendIdx !== null) void attemptMatch(idx, friendIdx);
  };

  return (
    <div className="absolute inset-0 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30" />
      <div className="pointer-events-none absolute inset-x-0 top-3 z-30 flex items-start justify-between px-4">
        <div className="rounded-2xl bg-white/95 px-4 py-2 text-sm font-black text-orange-700 shadow-xl">🎯 {matched.size}/{scene.friends.length}</div>
        <div className="max-w-[70%] rounded-full bg-white/95 px-5 py-2 text-center text-sm font-black text-orange-700 shadow-xl">{scene.teacher}</div>
      </div>
      <div className="absolute inset-x-0 top-20 z-20 flex flex-wrap justify-center gap-4 px-6">
        {cards.map((card, idx) => {
          const f = scene.friends[card.i];
          const color = CAST[f.who].color;
          const isMatched = matched.has(card.i);
          if (isMatched) return null;
          return (
            <button
              key={idx}
              onPointerDown={onDown(idx)} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
              className={`touch-none select-none rounded-2xl bg-white/95 px-3 py-2 shadow-xl backdrop-blur ${dragging === idx ? 'z-30 scale-110' : ''} ${wrongCard === idx ? 'animate-[lep1-shake_0.4s_ease-out]' : ''}`}
              style={{
                outline: `3px solid ${wrongCard === idx ? '#f43f5e' : color}`, boxShadow: `0 6px 18px ${color}55`,
                transform: dragging === idx ? `translate(${dragOffset.dx}px, ${dragOffset.dy}px) scale(1.15)` : undefined,
                transition: dragging === idx ? 'none' : 'transform 200ms cubic-bezier(0.34,1.56,0.64,1)',
              }}
            >
              <div className="flex items-center justify-center gap-1.5">
                <div className="pointer-events-none text-center font-black leading-none" style={{ fontSize: 'clamp(0.9rem, calc(1.5*var(--svw,1vw)), 1.2rem)' }}>
                  <span style={{ color }}>{CAST[f.who].name}</span>
                  <span className="text-slate-800"> is </span>
                  <span className="text-orange-600" style={{ WebkitTextStroke: '1px #FE6A2F' }}>{f.age}</span>
                  <span className="text-slate-800">!</span>
                </div>
                <span className="pointer-events-none text-sm">🔊</span>
              </div>
              <div className="pointer-events-none mt-0.5 text-center text-[9px] font-black uppercase tracking-widest text-slate-500">grab & drag me!</div>
            </button>
          );
        })}
      </div>
      {scene.friends.map((f, i) => {
        const c = CAST[f.who];
        const isDone = matched.has(i);
        const isHot = hotFriend === i;
        return (
          <div
            key={i}
            ref={(el) => { friendRefs.current[i] = el; }}
            aria-hidden={isDone}
            className="absolute z-10 select-none transition-transform"
            style={{ left: `${(i / scene.friends.length) * 100}%`, bottom: '6%', width: `${(1 / scene.friends.length) * 100 * 1.35}%`, opacity: isDone ? 0.5 : 1, transform: isHot ? 'scale(1.1)' : undefined }}
          >
            <img
              src={BALLOONS_SPRITE[f.who] ?? c.img}
              alt={c.name}
              className="pointer-events-none relative w-full drop-shadow-2xl"
              style={{ animation: 'lep1-float 2.6s ease-in-out infinite', transformOrigin: '50% 90%' }}
            />
            <div
              className="pointer-events-none absolute left-1/2 -translate-x-1/2 rounded-full bg-white px-4 py-1.5 text-base font-black shadow-lg"
              style={{ bottom: -10, color: c.color, border: `2px solid ${c.color}`, whiteSpace: 'nowrap', boxShadow: `0 4px 14px ${c.color}66`, outline: isHot ? `3px solid ${c.color}` : undefined }}
            >
              {isDone ? `${c.name} is ${f.age}! ⭐` : c.name}
            </div>
          </div>
        );
      })}
      {allMatched && (
        <div className="absolute inset-x-0 bottom-6 z-30 flex justify-center">
          <button onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-8 py-3 text-lg font-black text-white shadow-2xl active:scale-95">Next →</button>
        </div>
      )}
    </div>
  );
}
