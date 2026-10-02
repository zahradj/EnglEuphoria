import { useEffect, useRef, useState } from 'react';
import type { Scene } from '../scenes';
import { CAST } from '../scenes';
import { safeSpeak, playLetterPhonic } from '../audio';
import * as sfx from '../sfx';

/* ---------- Trace ---------- */

export function TraceScene({ scene, onNext, onWin }: { scene: Extract<Scene, { kind: 'trace' }>; onNext: () => void; onWin: (gem: boolean) => void }) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [done, setDone] = useState(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const [strokes, setStrokes] = useState<string[]>([]);
  const currentPath = useRef<string>('');

  type TraceSegment = { from: { x: number; y: number }; to: { x: number; y: number } };
  const TRACE_SEGMENTS: Record<string, TraceSegment[]> = {
    H: [{ from: { x: 170, y: 130 }, to: { x: 170, y: 470 } }, { from: { x: 430, y: 130 }, to: { x: 430, y: 470 } }, { from: { x: 175, y: 305 }, to: { x: 425, y: 305 } }],
    M: [{ from: { x: 155, y: 470 }, to: { x: 195, y: 130 } }, { from: { x: 195, y: 130 }, to: { x: 300, y: 455 } }, { from: { x: 300, y: 455 }, to: { x: 405, y: 130 } }, { from: { x: 405, y: 130 }, to: { x: 455, y: 235 } }],
    A: [{ from: { x: 300, y: 130 }, to: { x: 150, y: 470 } }, { from: { x: 300, y: 130 }, to: { x: 450, y: 470 } }, { from: { x: 205, y: 340 }, to: { x: 395, y: 340 } }],
    S: [{ from: { x: 400, y: 175 }, to: { x: 200, y: 175 } }, { from: { x: 200, y: 175 }, to: { x: 200, y: 295 } }, { from: { x: 200, y: 295 }, to: { x: 400, y: 295 } }, { from: { x: 400, y: 295 }, to: { x: 400, y: 415 } }, { from: { x: 400, y: 415 }, to: { x: 200, y: 415 } }],
    T: [{ from: { x: 150, y: 150 }, to: { x: 450, y: 150 } }, { from: { x: 300, y: 150 }, to: { x: 300, y: 470 } }],
    B: [
      { from: { x: 180, y: 130 }, to: { x: 180, y: 470 } },
      { from: { x: 180, y: 130 }, to: { x: 380, y: 130 } }, { from: { x: 380, y: 130 }, to: { x: 380, y: 290 } }, { from: { x: 380, y: 290 }, to: { x: 180, y: 290 } },
      { from: { x: 180, y: 290 }, to: { x: 400, y: 290 } }, { from: { x: 400, y: 290 }, to: { x: 400, y: 470 } }, { from: { x: 400, y: 470 }, to: { x: 180, y: 470 } },
    ],
  };
  const HIT_RADIUS = 72;
  const BUCKETS_PER_SEGMENT = 16;
  const MIN_SEGMENT_COVERAGE = 0.38;
  const segments = TRACE_SEGMENTS[scene.letter.toUpperCase()] ?? TRACE_SEGMENTS.H;
  const segmentBuckets = useRef<Set<number>[]>(segments.map(() => new Set<number>()));
  const [zonesDone, setZonesDone] = useState(0);

  useEffect(() => {
    segmentBuckets.current = segments.map(() => new Set<number>());
    setZonesDone(0); setStrokes([]); setDone(false);
  }, [scene.id]);

  const localPoint = (e: React.PointerEvent) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    return { x: ((e.clientX - rect.left) / rect.width) * 600, y: ((e.clientY - rect.top) / rect.height) * 600 };
  };
  const segmentHit = (p: { x: number; y: number }, s: TraceSegment) => {
    const vx = s.to.x - s.from.x, vy = s.to.y - s.from.y;
    const lenSq = vx * vx + vy * vy;
    const rawT = lenSq === 0 ? 0 : ((p.x - s.from.x) * vx + (p.y - s.from.y) * vy) / lenSq;
    const t = Math.max(0, Math.min(1, rawT));
    const closest = { x: s.from.x + vx * t, y: s.from.y + vy * t };
    return { t, distance: Math.hypot(p.x - closest.x, p.y - closest.y) };
  };
  const start = (e: React.PointerEvent) => {
    if (done) return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    setDrawing(true);
    const p = localPoint(e);
    lastPoint.current = p;
    currentPath.current = `M ${p.x} ${p.y}`;
    setStrokes((s) => [...s, currentPath.current]);
  };
  const move = (e: React.PointerEvent) => {
    if (!drawing || done) return;
    const p = localPoint(e);
    const last = lastPoint.current;
    if (!last) return;
    const dx = p.x - last.x, dy = p.y - last.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 3) return;
    lastPoint.current = p;
    currentPath.current += ` L ${p.x} ${p.y}`;
    setStrokes((s) => { const copy = [...s]; copy[copy.length - 1] = currentPath.current; return copy; });
    let changed = false;
    const samples = Math.max(1, Math.ceil(dist / 12));
    for (let step = 0; step <= samples; step += 1) {
      const t = step / samples;
      const sample = { x: last.x + dx * t, y: last.y + dy * t };
      let best: { i: number; t: number; distance: number } | undefined;
      for (let i = 0; i < segments.length; i += 1) {
        const hit = segmentHit(sample, segments[i]);
        if (!best || hit.distance < best.distance) best = { i, ...hit };
      }
      if (best && best.distance <= HIT_RADIUS) {
        const bucket = Math.max(0, Math.min(BUCKETS_PER_SEGMENT - 1, Math.floor(best.t * BUCKETS_PER_SEGMENT)));
        const before = segmentBuckets.current[best.i].size;
        segmentBuckets.current[best.i].add(bucket);
        if (segmentBuckets.current[best.i].size !== before) changed = true;
      }
    }
    const doneCount = segmentBuckets.current.filter((set) => set.size / BUCKETS_PER_SEGMENT >= MIN_SEGMENT_COVERAGE).length;
    if (changed) setZonesDone(doneCount);
    if (doneCount >= segments.length && !done) {
      setDone(true); sfx.gem(); onWin(true);
      if (scene.speakWord === false) void playLetterPhonic(scene.letter);
      else void playLetterPhonic(scene.letter).then(() => safeSpeak(scene.word, scene.who));
    }
  };
  const end = () => { setDrawing(false); lastPoint.current = null; };
  const reset = () => { setStrokes([]); segmentBuckets.current = segments.map(() => new Set<number>()); setZonesDone(0); setDone(false); };

  const pct = Math.round((zonesDone / segments.length) * 100);
  const c = CAST[scene.who];

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-cover bg-center pb-24" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="absolute inset-0 bg-black/25 backdrop-blur-sm" />
      <div className="pointer-events-none absolute left-1/2 top-4 z-30 max-w-[92%] -translate-x-1/2 rounded-full bg-white/95 px-4 py-2 text-center text-sm font-black text-orange-700 shadow-xl backdrop-blur sm:text-base">✍️ {scene.teacher}</div>
      <div className="relative z-10 flex w-full max-w-[560px] flex-col items-center px-4">
        <div className="relative aspect-square w-full touch-none rounded-3xl border-4 border-white/60 bg-white/25 shadow-2xl backdrop-blur" style={{ boxShadow: done ? `0 0 60px ${c.color}aa` : undefined }}>
          <svg ref={svgRef} viewBox="0 0 600 600" className="h-full w-full select-none" onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={end}>
            <text x="300" y="470" textAnchor="middle" fontSize="520" fontWeight="900" fontFamily="system-ui, sans-serif" fill="none" stroke={c.color} strokeWidth="12" strokeDasharray="18 14" opacity="0.85">{scene.letter}</text>
            <text x="300" y="470" textAnchor="middle" fontSize="520" fontWeight="900" fontFamily="system-ui, sans-serif" fill={c.color} opacity={pct / 100}>{scene.letter}</text>
            {strokes.map((d, i) => <path key={i} d={d} fill="none" stroke="white" strokeWidth="22" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />)}
          </svg>
          <div className="pointer-events-none absolute inset-x-4 bottom-3 h-3 overflow-hidden rounded-full bg-white/50">
            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${c.color}, #fff)` }} />
          </div>
        </div>
        <div className="mt-4 flex w-full items-center gap-2">
          <button onClick={reset} className="flex-1 rounded-full bg-white/95 py-3 text-sm font-black text-orange-700 shadow ring-2 ring-orange-200 active:scale-95">🧽 Erase</button>
          <button onClick={() => { void playLetterPhonic(scene.letter); }} className="flex-1 rounded-full bg-white/95 py-3 text-sm font-black text-orange-700 shadow ring-2 ring-orange-200 active:scale-95">🔊 Listen</button>
        </div>
        <button
          onClick={() => { if (!done) { setDone(true); sfx.gem(); onWin(true); if (scene.speakWord === false) { void playLetterPhonic(scene.letter); } else { void playLetterPhonic(scene.letter).then(() => safeSpeak(scene.word, scene.who)); } } onNext(); }}
          className="mt-4 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-3 text-lg font-black text-white shadow-2xl active:scale-95"
        >
          Great tracing! ⭐ Next
        </button>
      </div>
    </div>
  );
}
