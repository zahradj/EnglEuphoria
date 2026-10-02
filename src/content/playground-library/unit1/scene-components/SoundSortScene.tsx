import { useEffect, useRef, useState } from 'react';
import type { Scene } from '../scenes';
import { CAST } from '../scenes';
import { cueSpeak, cueSpeakOnce, playLetterPhonic } from '../audio';
import * as sfx from '../sfx';
import { scatterPositions } from './shared';

/* ---------- Sound sort ---------- */

export function SoundSortScene({ scene, onWin, onLose, onNext }: { scene: Extract<Scene, { kind: 'sound-sort' }>; onWin: (gem: boolean) => void; onLose: () => void; onNext: () => void }) {
  type Slot = { idx: number; it: typeof scene.items[number]; collected: boolean; dragging: boolean; dx: number; dy: number; flash: 'none' | 'good' | 'bad' };
  const [slots, setSlots] = useState<Slot[]>(() => scene.items.map((it, idx) => ({ idx, it, collected: false, dragging: false, dx: 0, dy: 0, flash: 'none' })));
  const [hotLetter, setHotLetter] = useState<string | null>(null);
  const [gemAwarded, setGemAwarded] = useState(false);
  const targetRefs = useRef<Record<string, HTMLElement | null>>({});
  const dragIdx = useRef<number | null>(null);
  const start = useRef({ x: 0, y: 0 });
  const done = slots.every((s) => s.collected);

  useEffect(() => { if (done && !gemAwarded) { setGemAwarded(true); onWin(true); cueSpeak('Amazing! All sounds sorted!', 'teacher'); } }, [done, gemAwarded]);

  function hitTest(x: number, y: number, itemEl?: Element | null): string | null {
    let cx = x, cy = y;
    if (itemEl) { const r = (itemEl as HTMLElement).getBoundingClientRect(); cx = r.left + r.width / 2; cy = r.top + r.height / 2; }
    const PAD = 48;
    let best: { letter: string; dist: number } | null = null;
    for (const t of scene.targets) {
      const el = targetRefs.current[t.letter];
      if (!el) continue;
      const b = el.getBoundingClientRect();
      const inside = (cx >= b.left - PAD && cx <= b.right + PAD && cy >= b.top - PAD && cy <= b.bottom + PAD) || (x >= b.left - PAD && x <= b.right + PAD && y >= b.top - PAD && y <= b.bottom + PAD);
      if (!inside) continue;
      const d = Math.hypot(cx - (b.left + b.width / 2), cy - (b.top + b.height / 2));
      if (!best || d < best.dist) best = { letter: t.letter, dist: d };
    }
    return best?.letter ?? null;
  }

  const onDown = (idx: number) => (e: React.PointerEvent<HTMLButtonElement>) => {
    const s = slots.find((x) => x.idx === idx);
    if (!s || s.collected) return;
    sfx.pop();
    const speaker = scene.targets.find((t) => t.letter === s.it.letter)?.who ?? 'pip';
    cueSpeakOnce(s.it.word, speaker);
    dragIdx.current = idx;
    start.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setSlots((p) => p.map((x) => (x.idx === idx ? { ...x, dragging: true, dx: 0, dy: 0, flash: 'none' } : x)));
  };
  const onMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const idx = dragIdx.current;
    if (idx === null) return;
    const dx = e.clientX - start.current.x, dy = e.clientY - start.current.y;
    setSlots((p) => p.map((x) => (x.idx === idx ? { ...x, dx, dy } : x)));
    setHotLetter(hitTest(e.clientX, e.clientY, e.currentTarget));
  };
  const onUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    const idx = dragIdx.current;
    dragIdx.current = null;
    const dropLetter = hitTest(e.clientX, e.clientY, e.currentTarget);
    setHotLetter(null);
    if (idx === null) return;
    setSlots((p) => p.map((x) => {
      if (x.idx !== idx) return x;
      if (!dropLetter) return { ...x, dragging: false, dx: 0, dy: 0 };
      if (dropLetter === x.it.letter) { sfx.match(); return { ...x, collected: true, dragging: false, dx: 0, dy: 0, flash: 'good' }; }
      sfx.wrong(); onLose();
      return { ...x, dragging: false, dx: 0, dy: 0, flash: 'bad' };
    }));
    window.setTimeout(() => setSlots((p) => p.map((x) => (x.idx === idx ? { ...x, flash: 'none' } : x))), 700);
  };

  const orbit = scatterPositions(scene.items.length, [10, 74], 20);

  return (
    <div className="absolute inset-0">
      <div className="pointer-events-none absolute inset-0 z-0 bg-white/25 backdrop-blur-md" />
      <div className="pointer-events-none absolute left-1/2 top-3 z-30 max-w-[92%] -translate-x-1/2 rounded-full bg-white/95 px-4 py-2 text-center text-sm font-bold text-orange-700 shadow-xl backdrop-blur sm:text-base">🎧 {scene.teacher}</div>
      <div className="absolute inset-x-0 top-1/2 z-10 flex -translate-y-1/2 items-center justify-center gap-6 px-4 sm:gap-10">
        {scene.targets.map((t) => {
          const c = CAST[t.who];
          const hot = hotLetter === t.letter;
          const collectedItems = slots.filter((s) => s.collected && s.it.letter === t.letter);
          const total = slots.filter((s) => s.it.letter === t.letter).length;
          return (
            <button key={t.letter} type="button" ref={(el) => { targetRefs.current[t.letter] = el; }} onClick={() => void playLetterPhonic(t.letter)}
              className={`relative grid h-40 w-40 place-items-center rounded-full border-4 border-dashed shadow-2xl backdrop-blur transition-all sm:h-48 sm:w-48 cursor-pointer active:scale-95 ${hot ? 'scale-110 border-green-400 bg-green-100/90' : 'border-white/80 bg-white/40'}`}>
              <div className="pointer-events-none absolute inset-0 animate-pulse rounded-full opacity-60" style={{ background: `radial-gradient(circle at center, ${c.color}cc, transparent 70%)` }} />
              <div className="pointer-events-none relative flex flex-col items-center gap-1">
                <span className="grid h-24 w-24 place-items-center rounded-3xl text-6xl font-black text-white shadow-lg sm:h-28 sm:w-28 sm:text-7xl" style={{ background: `linear-gradient(135deg, ${c.color}, #FEBE4C)` }}>{t.letter}</span>
                <p className="text-sm font-black leading-none" style={{ color: c.color }}>{t.phoneme}</p>
                <p className="text-[10px] font-bold text-orange-700">⭐ {collectedItems.length}/{total}</p>
                {/* Collected items render as children of this already-centered
                    button, not a separately positioned div measured against
                    the target's pixel coordinates — see ColorSortScene for
                    why that measurement approach used to land off-center. */}
                {collectedItems.length > 0 && (
                  <div className="mt-0.5 flex flex-wrap items-center justify-center gap-1">
                    {collectedItems.map((s) => (
                      <span key={s.idx} className="grid h-7 w-7 place-items-center rounded-full bg-white/90 text-sm shadow ring-2 ring-green-400 animate-[lep1-pop_0.4s_ease-out]">✅</span>
                    ))}
                  </div>
                )}
              </div>
            </button>
          );
        })}
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
            {s.it.img ? <img src={s.it.img} alt={s.it.word} draggable={false} className="pointer-events-none h-full w-full object-contain" /> : <span className="pointer-events-none grid h-full w-full place-items-center text-6xl">{s.it.emoji}</span>}
          </button>
        );
      })}
      {done && (
        <div className="absolute inset-x-0 bottom-6 flex justify-center">
          <button onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-8 py-3 text-lg font-black text-white shadow-2xl active:scale-95 animate-[lep1-slide-up_0.4s_ease-out]">✨ All sounds matched! Next →</button>
        </div>
      )}
    </div>
  );
}
