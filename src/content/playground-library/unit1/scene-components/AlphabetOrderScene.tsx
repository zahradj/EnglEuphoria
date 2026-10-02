import { useEffect, useMemo, useRef, useState } from 'react';
import type { Scene } from '../scenes';
import { playLetterName } from '../audio';
import * as sfx from '../sfx';

/* ---------- Alphabet order ---------- */

export function AlphabetOrderScene({ scene, onNext, onWin }: { scene: Extract<Scene, { kind: 'alphabet-order' }>; onNext: () => void; onWin: (gem: boolean) => void }) {
  const [seqIdx, setSeqIdx] = useState(0);
  const [placed, setPlaced] = useState<string[]>([]);
  const [wrongLetter, setWrongLetter] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState(false);
  const [done, setDone] = useState(false);
  const gemRef = useRef(false);
  const current = scene.sequences[seqIdx];
  const target = current.split('');

  const shuffled = useMemo(() => {
    const arr = target.slice();
    for (let tries = 0; tries < 8; tries++) {
      for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[arr[i], arr[j]] = [arr[j], arr[i]]; }
      if (arr.join('') !== current) break;
    }
    return arr;
  }, [seqIdx]);

  const [used, setUsed] = useState<Set<number>>(new Set());
  useEffect(() => { setPlaced([]); setUsed(new Set()); }, [seqIdx]);

  const COLORS = ['#FE6A2F', '#22C55E', '#3B82F6', '#EC4899', '#F59E0B', '#8B5CF6'];
  const colorFor = (L: string) => COLORS[(L.charCodeAt(0) - 65) % COLORS.length];

  const dropZoneRef = useRef<HTMLDivElement | null>(null);
  const dragIdx = useRef<number | null>(null);
  const start = useRef({ x: 0, y: 0 });
  const [dragging, setDragging] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState({ dx: 0, dy: 0 });
  const [zoneHot, setZoneHot] = useState(false);

  const isOverZone = (x: number, y: number) => {
    const b = dropZoneRef.current?.getBoundingClientRect();
    return !!b && x >= b.left && x <= b.right && y >= b.top && y <= b.bottom;
  };

  const place = async (idx: number, L: string) => {
    if (used.has(idx) || celebrate || done) return;
    const nextExpected = target[placed.length];
    if (L === nextExpected) {
      const nextPlaced = [...placed, L];
      setPlaced(nextPlaced);
      setUsed((s) => new Set(s).add(idx));
      sfx.pop();
      await playLetterName(L);
      if (nextPlaced.length === target.length) {
        setCelebrate(true); sfx.gem();
        await new Promise((r) => setTimeout(r, 400));
        for (const ch of target) await playLetterName(ch);
        await new Promise((r) => setTimeout(r, 500));
        setCelebrate(false);
        if (seqIdx + 1 < scene.sequences.length) { setSeqIdx(seqIdx + 1); }
        else { setDone(true); if (!gemRef.current) { gemRef.current = true; onWin(true); } }
      }
    } else { setWrongLetter(L); sfx.wrong(); window.setTimeout(() => setWrongLetter(null), 450); }
  };

  const onDown = (idx: number) => (e: React.PointerEvent<HTMLButtonElement>) => {
    if (used.has(idx) || celebrate || done) return;
    setDragging(idx);
    dragIdx.current = idx;
    start.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (dragIdx.current === null) return;
    setDragOffset({ dx: e.clientX - start.current.x, dy: e.clientY - start.current.y });
    setZoneHot(isOverZone(e.clientX, e.clientY));
  };
  const onUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    const idx = dragIdx.current;
    dragIdx.current = null;
    setDragging(null);
    setZoneHot(false);
    setDragOffset({ dx: 0, dy: 0 });
    if (idx === null) return;
    if (isOverZone(e.clientX, e.clientY)) void place(idx, shuffled[idx]);
  };

  return (
    <div className="absolute inset-0 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/35 via-white/10 to-white/40" />
      <div className="pointer-events-none absolute left-1/2 top-3 z-30 max-w-[92%] -translate-x-1/2 rounded-full bg-white/95 px-5 py-2 text-center text-sm font-black text-orange-700 shadow-xl backdrop-blur sm:text-lg">🔤 Alphabet Order — Drag A → B → C!</div>
      {!done && (
        <div className="absolute inset-x-0 top-20 bottom-24 z-10 flex flex-col items-center justify-between gap-3 px-3 py-3">
          <div ref={dropZoneRef} className={`flex flex-wrap items-end justify-center gap-3 rounded-2xl px-6 py-4 backdrop-blur transition-all ${zoneHot ? 'scale-105 bg-white/70 ring-4 ring-emerald-300' : 'bg-white/40'}`}>
            {target.map((tgt, i) => {
              const filled = placed[i];
              const bg = filled ? colorFor(filled) : 'rgba(255,255,255,0.5)';
              return <div key={i} className="flex h-24 w-20 items-center justify-center rounded-xl text-5xl font-black text-white sm:h-28 sm:w-24 sm:text-6xl" style={{ backgroundColor: bg, animation: filled ? 'lep1-blockDrop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)' : undefined, color: filled ? 'white' : 'rgba(0,0,0,0.35)' }}>{filled ?? tgt}</div>;
            })}
          </div>
          <div className="text-3xl font-black text-white drop-shadow-lg">↓ Next: <span className="text-orange-300">{target[placed.length] ?? '✓'}</span></div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {shuffled.map((L, i) => (
              <button key={`${i}-${L}`} onPointerDown={onDown(i)} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} disabled={used.has(i)}
                className={`flex h-24 w-24 touch-none select-none items-center justify-center rounded-2xl text-5xl font-black text-white shadow-lg sm:h-28 sm:w-28 sm:text-6xl ${dragging === i ? 'z-20 scale-125' : ''}`}
                style={{
                  backgroundColor: colorFor(L), opacity: used.has(i) ? 0.25 : 1,
                  animation: wrongLetter === L && !used.has(i) ? 'lep1-blockShake 0.4s ease-in-out' : undefined,
                  transform: dragging === i ? `translate(${dragOffset.dx}px, ${dragOffset.dy}px) scale(1.25)` : undefined,
                  transition: dragging === i ? 'none' : 'transform 200ms cubic-bezier(0.34,1.56,0.64,1)',
                }}>{L}</button>
            ))}
          </div>
          <div className="text-sm font-black text-white drop-shadow-md">Round {seqIdx + 1} / {scene.sequences.length}</div>
        </div>
      )}
      {done && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4">
          <div className="text-8xl animate-bounce">🎉</div>
          <div className="rounded-3xl bg-white/95 px-8 py-4 text-3xl font-black text-orange-600 shadow-2xl">ABC master!</div>
          <button onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-8 py-3 text-lg font-black text-white shadow-2xl active:scale-95">Continue ⭐</button>
        </div>
      )}
      {celebrate && <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"><div className="rounded-full bg-white/95 px-6 py-3 text-3xl font-black text-orange-600 shadow-2xl animate-bounce">✨ {current}! ✨</div></div>}
    </div>
  );
}
