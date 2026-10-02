import { useEffect, useRef, useState } from 'react';
import type { Scene } from '../scenes';
import { CAST } from '../scenes';
import { safeSpeak, cueSpeak, cueSpeakOnce, playLetterPhonic } from '../audio';
import * as sfx from '../sfx';
import { scatterPositions } from './shared';

/* ---------- Basket ---------- */

export function BasketScene({ scene, onWin, onLose, onNext }: { scene: Extract<Scene, { kind: 'basket' }>; onWin: (gem: boolean) => void; onLose: () => void; onNext: () => void }) {
  type Slot = { idx: number; it: typeof scene.items[number]; collected: boolean; dragging: boolean; dx: number; dy: number; flash: 'none' | 'good' | 'bad' };
  const [slots, setSlots] = useState<Slot[]>(() => scene.items.map((it, idx) => ({ idx, it, collected: false, dragging: false, dx: 0, dy: 0, flash: 'none' })));
  const [basketHot, setBasketHot] = useState(false);
  const [gemAwarded, setGemAwarded] = useState(false);
  const basketRef = useRef<HTMLDivElement | null>(null);
  const dragIdx = useRef<number | null>(null);
  const start = useRef({ x: 0, y: 0 });
  const c = CAST[scene.who];
  const got = slots.filter((s) => s.collected).length;
  const done = got >= scene.goal;

  useEffect(() => {
    if (done && !gemAwarded) { setGemAwarded(true); onWin(true); cueSpeak(`Yes! The ${scene.letter} portal is open!`, scene.who); }
  }, [done, gemAwarded]);

  function onDown(idx: number) {
    return (e: React.PointerEvent<HTMLButtonElement>) => {
      const s = slots.find((x) => x.idx === idx);
      if (!s || s.collected) return;
      sfx.pop();
      cueSpeakOnce(s.it.word, 'teacher');
      dragIdx.current = idx;
      start.current = { x: e.clientX, y: e.clientY };
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      setSlots((p) => p.map((x) => (x.idx === idx ? { ...x, dragging: true, dx: 0, dy: 0, flash: 'none' } : x)));
    };
  }
  function onMove(e: React.PointerEvent<HTMLButtonElement>) {
    const idx = dragIdx.current;
    if (idx === null) return;
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;
    setSlots((p) => p.map((x) => (x.idx === idx ? { ...x, dx, dy } : x)));
    const b = basketRef.current?.getBoundingClientRect();
    if (b) setBasketHot(e.clientX >= b.left && e.clientX <= b.right && e.clientY >= b.top && e.clientY <= b.bottom);
  }
  function onUp(e: React.PointerEvent<HTMLButtonElement>) {
    const idx = dragIdx.current;
    dragIdx.current = null;
    setBasketHot(false);
    if (idx === null) return;
    const b = basketRef.current?.getBoundingClientRect();
    const dropped = b && e.clientX >= b.left && e.clientX <= b.right && e.clientY >= b.top && e.clientY <= b.bottom;
    setSlots((p) => p.map((x) => {
      if (x.idx !== idx) return x;
      if (!dropped) return { ...x, dragging: false, dx: 0, dy: 0 };
      if (x.it.hit) { sfx.match(); if (scene.announceOnDrop !== false) void playLetterPhonic(scene.letter).then(() => safeSpeak(x.it.word, scene.who)); return { ...x, collected: true, dragging: false, dx: 0, dy: 0, flash: 'good' }; }
      sfx.wrong(); onLose();
      return { ...x, dragging: false, dx: 0, dy: 0, flash: 'bad' };
    }));
    window.setTimeout(() => setSlots((p) => p.map((x) => (x.idx === idx ? { ...x, flash: 'none' } : x))), 700);
  }

  // Top row stays at 56% (not the [10,74] used by the color/sound circle
  // scenes) — this basket sits near the TOP of the screen (top-16), not
  // vertically centered, so scattered items need to clear ITS zone instead.
  const orbit = scatterPositions(scene.items.length, [56, 78], 20);
  const collectedItems = slots.filter((s) => s.collected);

  return (
    <div className="absolute inset-0">
      <div className="pointer-events-none absolute left-4 top-4 z-30 max-w-[260px] rounded-2xl bg-white/95 px-3 py-2 text-sm font-bold text-neutral-800 shadow-xl backdrop-blur sm:max-w-[320px] sm:text-base">{scene.teacher}</div>
      <div ref={basketRef} className={`absolute left-1/2 top-16 z-10 grid h-56 w-56 -translate-x-1/2 place-items-center rounded-full border-4 border-dashed shadow-2xl backdrop-blur transition-all sm:h-72 sm:w-72 ${basketHot ? 'scale-110 border-green-400 bg-green-100/90' : 'border-white/80 bg-white/40'}`}>
        <div className={`absolute inset-0 rounded-full opacity-70 ${done ? '' : 'animate-pulse'}`} style={{ background: `radial-gradient(circle at center, ${c.color}cc, transparent 70%)` }} />
        <div className="relative flex flex-col items-center gap-1 text-center">
          <span className="grid h-28 w-28 place-items-center rounded-3xl text-7xl font-black text-white shadow-lg sm:h-36 sm:w-36 sm:text-8xl" style={{ background: `linear-gradient(135deg, ${c.color}, #FEBE4C)` }}>{scene.letter}</span>
          <p className="text-lg font-black leading-none" style={{ color: c.color }}>{scene.phoneme}</p>
          <p className="text-xs font-bold text-orange-700">⭐ {got}/{scene.goal}</p>
          {/* Collected items render as children of the basket itself, not a
              separately positioned div measured against its pixel
              coordinates — see ColorSortScene for why that approach used to
              land off-center. */}
          {collectedItems.length > 0 && (
            <div className="mt-0.5 flex max-w-[10rem] flex-wrap items-center justify-center gap-1 sm:max-w-[12rem]">
              {collectedItems.map((s) => (
                <span key={s.idx} className="grid h-6 w-6 place-items-center rounded-full bg-white/90 text-xs shadow ring-2 ring-green-400 animate-[lep1-pop_0.4s_ease-out] sm:h-7 sm:w-7 sm:text-sm">✅</span>
              ))}
            </div>
          )}
        </div>
      </div>
      {slots.map((s, i) => {
        if (s.collected) return null;
        const pos = orbit[i % orbit.length];
        const glow = s.flash === 'bad' ? 'drop-shadow-[0_0_14px_rgba(239,68,68,0.9)] animate-[lep1-shake_0.4s_ease-in-out]' : s.flash === 'good' ? 'drop-shadow-[0_0_18px_rgba(34,197,94,0.9)]' : 'drop-shadow-[0_6px_14px_rgba(0,0,0,0.4)]';
        return (
          <button key={s.idx} onPointerDown={onDown(s.idx)} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
            className={`absolute -translate-x-1/2 -translate-y-1/2 touch-none select-none bg-transparent p-0 transition ${glow} ${s.dragging ? 'z-20 scale-125' : 'hover:scale-110 animate-[lep1-float_3s_ease-in-out_infinite]'}`}
            style={{ left: pos.left, top: pos.top, width: 'clamp(88px, calc(16*var(--svh,1vh)), 208px)', height: 'clamp(88px, calc(16*var(--svh,1vh)), 208px)', animationDelay: `${(i % 4) * 0.3}s`, transform: s.dragging ? `translate(calc(-50% + ${s.dx}px), calc(-50% + ${s.dy}px)) scale(1.25) rotate(-4deg)` : `translate(-50%, -50%) rotate(${pos.rot}deg)`, transition: s.dragging ? 'none' : 'transform 250ms cubic-bezier(0.34,1.56,0.64,1)' }}
            aria-label={s.it.word}
          >
            {s.it.img ? <img src={s.it.img} alt={s.it.word} draggable={false} className="pointer-events-none h-full w-full object-contain" /> : <span className="pointer-events-none grid h-full w-full place-items-center text-7xl">{s.it.emoji}</span>}
          </button>
        );
      })}
      {done && (
        <div className="absolute inset-x-0 top-4 flex justify-center">
          <button onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-8 py-3 text-lg font-black text-white shadow-2xl active:scale-95 animate-[lep1-slide-up_0.4s_ease-out]">✨ Portal open! Next →</button>
        </div>
      )}
    </div>
  );
}
