import { useEffect, useRef, useState } from 'react';
import type { Scene } from '../scenes';
import { CAST, COLOR_SKETCH } from '../scenes';
import { cueSpeak } from '../audio';

/* ---------- Color friends / Color the vocabulary ---------- */

/** Simple coloring-book line art (stroke-only, no fill) for the vocabulary-
 * coloring mode — code-drawn so no new image assets are needed. */
function VocabOutline({ kind }: { kind: 'apple' | 'water' | 'sun' | 'circle' | 'square' | 'triangle' }) {
  const stroke = { fill: 'none', stroke: '#1a1a1a', strokeWidth: 8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  if (kind === 'circle') {
    return (
      <svg viewBox="0 0 400 520" className="pointer-events-none absolute inset-0 h-full w-full">
        <circle cx="200" cy="280" r="130" {...stroke} />
      </svg>
    );
  }
  if (kind === 'square') {
    return (
      <svg viewBox="0 0 400 520" className="pointer-events-none absolute inset-0 h-full w-full">
        <rect x="90" y="170" width="220" height="220" rx="18" {...stroke} />
      </svg>
    );
  }
  if (kind === 'triangle') {
    return (
      <svg viewBox="0 0 400 520" className="pointer-events-none absolute inset-0 h-full w-full">
        <path d="M200 150 L320 390 L80 390 Z" {...stroke} />
      </svg>
    );
  }
  if (kind === 'apple') {
    return (
      <svg viewBox="0 0 400 520" className="pointer-events-none absolute inset-0 h-full w-full">
        <path d="M200 190 C170 158 118 168 98 208 C68 262 80 336 132 384 C162 412 190 420 200 410 C210 420 238 412 268 384 C320 336 332 262 302 208 C282 168 230 158 200 190 Z" {...stroke} />
        <path d="M200 190 L200 148" {...stroke} />
        <path d="M200 158 Q234 136 258 158 Q234 176 200 158 Z" {...stroke} />
      </svg>
    );
  }
  if (kind === 'water') {
    return (
      <svg viewBox="0 0 400 520" className="pointer-events-none absolute inset-0 h-full w-full">
        <path d="M150 160 L250 160 L228 400 L172 400 Z" {...stroke} />
        <path d="M162 290 Q200 268 238 290" {...stroke} />
      </svg>
    );
  }
  const rays = [0, 45, 90, 135, 180, 225, 270, 315];
  return (
    <svg viewBox="0 0 400 520" className="pointer-events-none absolute inset-0 h-full w-full">
      <circle cx="200" cy="280" r="80" {...stroke} />
      {rays.map((angle) => {
        const rad = (angle * Math.PI) / 180;
        const x1 = 200 + Math.cos(rad) * 100, y1 = 280 + Math.sin(rad) * 100;
        const x2 = 200 + Math.cos(rad) * 140, y2 = 280 + Math.sin(rad) * 140;
        return <line key={angle} x1={x1} y1={y1} x2={x2} y2={y2} {...stroke} />;
      })}
    </svg>
  );
}

export function ColorFriendsScene({ scene, onNext, onWin }: { scene: Extract<Scene, { kind: 'color-friends' }>; onNext: () => void; onWin: (gem: boolean) => void }) {
  const isVocabMode = Boolean(scene.vocabItems?.length);
  const CHARS = scene.cast ?? [];
  const VOCAB = scene.vocabItems ?? [];
  const count = isVocabMode ? VOCAB.length : CHARS.length;
  const PAINT_COLORS = ['#FE6A2F', '#F59E0B', '#FACC15', '#84CC16', '#22C55E', '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899', '#EF4444', '#78350F', '#111827'];
  const BRUSHES = [18, 30, 46];
  const [idx, setIdx] = useState(0);
  const [color, setColor] = useState(PAINT_COLORS[0]);
  const [brush, setBrush] = useState(BRUSHES[1]);
  const [gemDone, setGemDone] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const paintingRef = useRef(false);
  const lastPtRef = useRef<{ x: number; y: number } | null>(null);
  const who = !isVocabMode ? (CHARS[idx] ?? 'pip') : null;
  const c = who ? CAST[who] : null;
  const sketch = who ? COLOR_SKETCH[who] : null;
  const vocabItem = isVocabMode ? VOCAB[idx] : null;
  const label = isVocabMode ? vocabItem!.label : c!.name;

  useEffect(() => { clearCanvas(); if (idx > 0) cueSpeak(`${label}!`, who ?? 'teacher'); }, [idx]);

  const getCtx = () => canvasRef.current?.getContext('2d') ?? null;
  const clearCanvas = () => { const canvas = canvasRef.current; const ctx = getCtx(); if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height); };
  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr; canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  useEffect(() => { resizeCanvas(); const onResize = () => resizeCanvas(); window.addEventListener('resize', onResize); return () => window.removeEventListener('resize', onResize); }, [who, idx]);

  const localPoint = (e: React.PointerEvent<HTMLCanvasElement>) => { const r = canvasRef.current!.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  const strokeTo = (x: number, y: number) => {
    const ctx = getCtx();
    if (!ctx) return;
    const from = lastPtRef.current ?? { x, y };
    ctx.strokeStyle = color; ctx.lineWidth = brush; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(x, y); ctx.stroke();
    lastPtRef.current = { x, y };
  };
  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => { e.currentTarget.setPointerCapture(e.pointerId); paintingRef.current = true; const p = localPoint(e); lastPtRef.current = p; strokeTo(p.x, p.y); };
  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => { if (!paintingRef.current) return; const p = localPoint(e); strokeTo(p.x, p.y); };
  const endStroke = () => { paintingRef.current = false; lastPtRef.current = null; };
  const handleDone = () => {
    if (!gemDone) { setGemDone(true); onWin(true); }
    if (isVocabMode && vocabItem) void cueSpeak(`Yes! The ${vocabItem.label.toLowerCase()} is ${vocabItem.targetColorName.toLowerCase()}!`, 'pip');
    if (idx + 1 < count) setIdx(idx + 1); else onNext();
  };

  return (
    <div className="absolute inset-0 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/40 via-white/15 to-white/50" />
      <div className="pointer-events-none absolute left-1/2 top-3 z-30 max-w-[92%] -translate-x-1/2 rounded-full bg-white/95 px-5 py-2 text-center text-sm font-black text-orange-700 shadow-xl backdrop-blur sm:text-lg">
        🎨 Color the {label}!{isVocabMode && vocabItem && <span className="ml-1 opacity-60">Try {vocabItem.targetColorName}!</span>}
      </div>
      <div className="absolute inset-x-0 top-14 bottom-36 z-10 flex items-center justify-center">
        <div key={isVocabMode ? vocabItem!.label : who} className="relative aspect-[400/520] h-full max-h-full max-w-[calc(96*var(--svw,1vw))] overflow-hidden rounded-3xl bg-[#FFFDF7] shadow-2xl ring-2 ring-white/70">
          <canvas ref={canvasRef} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={endStroke} onPointerCancel={endStroke} onPointerLeave={endStroke} className="absolute inset-0 h-full w-full touch-none" style={{ cursor: 'crosshair' }} />
          {isVocabMode && vocabItem ? (
            <VocabOutline kind={vocabItem.outline} />
          ) : (
            <img src={sketch!} alt={label} className="pointer-events-none absolute inset-0 h-full w-full object-contain select-none" draggable={false} />
          )}
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-3 z-30 flex flex-col items-center gap-2">
        <div className="flex flex-wrap items-center justify-center gap-2 rounded-full bg-white/95 px-4 py-2 shadow-2xl">
          {PAINT_COLORS.map((col) => {
            const isSuggested = isVocabMode && vocabItem && col.toUpperCase() === vocabItem.targetColorHex.toUpperCase();
            return (
              <button key={col} onClick={() => setColor(col)} aria-label={`Color ${col}`} className={`h-10 w-10 rounded-full transition-transform active:scale-90 ${col === color ? 'ring-4 ring-orange-500 scale-110' : isSuggested ? 'ring-4 ring-orange-300 animate-pulse' : 'ring-2 ring-white'}`} style={{ backgroundColor: col }} />
            );
          })}
          <div className="mx-2 h-8 w-px bg-neutral-300" />
          {BRUSHES.map((size) => <button key={size} onClick={() => setBrush(size)} aria-label={`Brush ${size}`} className={`flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 transition-transform active:scale-90 ${size === brush ? 'ring-4 ring-orange-500 scale-110' : 'ring-2 ring-white'}`}><span className="block rounded-full bg-neutral-800" style={{ width: size * 0.5, height: size * 0.5 }} /></button>)}
          <button onClick={clearCanvas} className="ml-2 rounded-full bg-neutral-100 px-3 py-2 text-xs font-black text-neutral-700 shadow active:scale-95">↺ Clear</button>
        </div>
        <div className="flex items-center gap-2">
          {idx + 1 < count && <button onClick={() => setIdx(idx + 1)} className="rounded-full bg-white/95 px-5 py-2 text-sm font-black text-orange-700 shadow-lg active:scale-95">Next {isVocabMode ? 'Item' : 'Friend'} →</button>}
          <button onClick={handleDone} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-8 py-3 text-lg font-black text-white shadow-2xl active:scale-95">Done ⭐</button>
        </div>
      </div>
    </div>
  );
}
