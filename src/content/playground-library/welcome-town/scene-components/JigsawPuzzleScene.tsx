import { useEffect, useMemo, useRef, useState } from 'react';
import type { Scene } from '../scenes';
import * as sfx from '../../unit1/sfx';

/* ---------- Jigsaw puzzle (real drag-to-assemble puzzle — reuses drag-
   match's native PointerEvent + tolerance-radius drop pattern, but each
   piece is a CSS-cropped slice of one full image via percentage
   background-size/-position, so every piece renders correctly at any
   rendered pixel size without needing the image's real dimensions) ------- */

export function JigsawPuzzleScene({ scene, onNext, onWin, onLose }: { scene: Extract<Scene, { kind: 'jigsaw-puzzle' }>; onNext: () => void; onWin: (gem: boolean) => void; onLose: () => void }) {
  const { rows, cols, image } = scene;
  const total = rows * cols;
  const containerRef = useRef<HTMLDivElement>(null);
  // The ghost piece renders as a child of the OUTER scene root (see its
  // render below), not of containerRef's inner framed box — so its
  // percentage position needs to be measured against that outer root, a
  // separate ref from containerRef (which stays scoped to the drop-tolerance
  // math against the inner box, unaffected by this).
  const outerRef = useRef<HTMLDivElement>(null);
  const [placed, setPlaced] = useState<Set<number>>(new Set());
  // xPct/yPct: see DragMatchScene's identical comment — `position: fixed`
  // breaks once any ancestor (MainStage's letterbox scale) has a CSS
  // transform, so the ghost piece must be `absolute` + container-relative
  // percentage instead of `fixed` + raw client pixels.
  const [drag, setDrag] = useState<{ idx: number; x: number; y: number; startX: number; startY: number; xPct: number; yPct: number } | null>(null);
  const [wrongIdx, setWrongIdx] = useState<number | null>(null);
  const gemDone = useRef(false);

  const pieces = useMemo(() => Array.from({ length: total }, (_, i) => ({ row: Math.floor(i / cols), col: i % cols })), [total, cols]);
  const trayOrder = useMemo(() => {
    const order = pieces.map((_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = (i * 7 + 3) % (i + 1);
      [order[i], order[j]] = [order[j], order[i]];
    }
    return order;
  }, [scene.id]);

  const pieceStyle = (idx: number): React.CSSProperties => {
    const { row, col } = pieces[idx];
    return {
      backgroundImage: `url(${image})`,
      backgroundSize: `${cols * 100}% ${rows * 100}%`,
      backgroundPosition: `${cols > 1 ? (col / (cols - 1)) * 100 : 0}% ${rows > 1 ? (row / (rows - 1)) * 100 : 0}%`,
    };
  };

  const toPct = (clientX: number, clientY: number) => {
    const rect = outerRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return { xPct: 50, yPct: 50 };
    return { xPct: ((clientX - rect.left) / rect.width) * 100, yPct: ((clientY - rect.top) / rect.height) * 100 };
  };

  const startDrag = (e: React.PointerEvent, idx: number) => {
    if (placed.has(idx)) return;
    e.preventDefault();
    sfx.click();
    setDrag({ idx, x: e.clientX, y: e.clientY, startX: e.clientX, startY: e.clientY, ...toPct(e.clientX, e.clientY) });
  };

  useEffect(() => {
    if (!drag) return;
    const move = (e: PointerEvent) => setDrag((d) => (d ? { ...d, x: e.clientX, y: e.clientY, ...toPct(e.clientX, e.clientY) } : d));
    const up = (e: PointerEvent) => {
      const movedDist = Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY);
      if (movedDist < 20) { setDrag(null); return; }
      const container = containerRef.current;
      if (container) {
        const rect = container.getBoundingClientRect();
        const { row, col } = pieces[drag.idx];
        const targetX = rect.left + ((col + 0.5) / cols) * rect.width;
        const targetY = rect.top + ((row + 0.5) / rows) * rect.height;
        const dist = Math.hypot(e.clientX - targetX, e.clientY - targetY);
        const tolerance = Math.min(rect.width / cols, rect.height / rows) * 0.6;
        if (dist <= tolerance) {
          sfx.match();
          setPlaced((prev) => {
            const next = new Set(prev).add(drag.idx);
            if (next.size === total && !gemDone.current) { gemDone.current = true; sfx.gem(); onWin(true); }
            return next;
          });
        } else {
          sfx.wrong(); onLose();
          setWrongIdx(drag.idx);
          window.setTimeout(() => setWrongIdx(null), 500);
        }
      }
      setDrag(null);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
  }, [drag, pieces, cols, rows, total, onWin, onLose]);

  const done = placed.size === total;

  return (
    <div ref={outerRef} className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-gradient-to-b from-orange-50 to-pink-50 px-4 pb-28 pt-16 touch-none">
      <div className="pointer-events-none absolute inset-x-0 top-4 z-30 flex justify-center px-4">
        <div className="max-w-[92%] rounded-full bg-white/95 px-5 py-2 text-center text-sm font-black text-orange-700 shadow-xl sm:text-base">
          {'\u{1F9E9}'} {scene.teacher} <span className="ml-1 opacity-60">({placed.size}/{total})</span>
        </div>
      </div>
      <div ref={containerRef} className="relative aspect-video w-full max-w-2xl overflow-hidden rounded-3xl border-4 border-white bg-white shadow-2xl">
        {/* A faint full-picture guide underneath — a real jigsaw box lid,
            not a vocabulary hint — so a young learner can see the shape
            they're building toward instead of placing pieces blind. */}
        <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-15" draggable={false} />
        <div className="pointer-events-none absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }}>
          {pieces.map((_, i) => <div key={`slot-${i}`} className="border border-dashed border-white/50" />)}
        </div>
        {pieces.map((p, i) => placed.has(i) && (
          <div
            key={`placed-${i}`}
            className="absolute"
            style={{ left: `${(p.col / cols) * 100}%`, top: `${(p.row / rows) * 100}%`, width: `${100 / cols}%`, height: `${100 / rows}%`, ...pieceStyle(i), animation: 'lep1-pop 0.3s ease-out' }}
          />
        ))}
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-6 z-30 flex flex-wrap justify-center gap-3 px-4">
        {trayOrder.map((i) => {
          if (placed.has(i)) return null;
          // Stays mounted (just hidden) while dragged — same fix as
          // DragMatchScene's tray button, same reason: unmounting the
          // element the live-classroom DOM-tap mirror cached a reference
          // to detaches it, so the other participant's screen never
          // receives the pointermove/pointerup that would move it.
          const isBeingDragged = drag?.idx === i;
          return (
            <button
              key={`tray-${i}`}
              onPointerDown={(e) => startDrag(e, i)}
              aria-label={`Puzzle piece ${i + 1}`}
              className={`touch-none rounded-xl shadow-2xl ring-4 ring-white transition active:scale-95 ${wrongIdx === i ? 'animate-[lep1-shake_0.4s_ease-in-out]' : ''} ${isBeingDragged ? 'pointer-events-none opacity-0' : 'pointer-events-auto'}`}
              style={{ width: 64, height: 64, ...pieceStyle(i), animation: isBeingDragged || wrongIdx === i ? undefined : 'lep1-hop 1.6s ease-in-out infinite' }}
            />
          );
        })}
      </div>
      {/* absolute + percentage, not fixed + raw pixels — see DragMatchScene's
          comment on its own ghost for why (MainStage's scaled letterbox
          frame breaks `position: fixed`'s viewport-relative assumption). */}
      {drag && (
        <div className="pointer-events-none absolute z-50 -translate-x-1/2 -translate-y-1/2 rounded-xl shadow-2xl ring-4 ring-white" style={{ left: `${drag.xPct}%`, top: `${drag.yPct}%`, width: 72, height: 72, ...pieceStyle(drag.idx) }} />
      )}
      {done && (
        <div className="absolute inset-x-0 bottom-8 z-40 flex justify-center">
          <button onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 text-xl font-black text-white shadow-2xl active:scale-95">You built it! ⭐ Next</button>
        </div>
      )}
    </div>
  );
}
