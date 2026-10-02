import { useMemo, useRef, useState } from 'react';
import type { Scene } from '../scenes';
import * as sfx from '../sfx';
import { PUZZLE_BOARD_SIZE } from './shared';

/* ---------- Jigsaw puzzle (real interlocking piece shapes, drag to assemble) ---------- */

// Seeded LCG so piece shapes/scatter are stable across re-renders.
function makeRng(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

function hashSeed(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return Math.abs(h) || 1;
}

// One edge from (x0,y0) to (x1,y1); dir 0 = flat, else a rounded tab (+1) or
// blank (-1) bulging to the left of travel direction.
function jigsawEdge(x0: number, y0: number, x1: number, y1: number, dir: number): string {
  if (dir === 0) return `L ${x1} ${y1}`;
  const dx = x1 - x0, dy = y1 - y0;
  const len = Math.hypot(dx, dy);
  const ux = dx / len, uy = dy / len;
  const px = -uy, py = ux;
  const A = len * 0.22 * dir;
  const pt = (t: number, p: number): [number, number] => [x0 + ux * len * t + px * A * p, y0 + uy * len * t + py * A * p];
  const [p1x, p1y] = pt(0.40, 0), [p2x, p2y] = pt(0.40, 0.9);
  const [p3x, p3y] = pt(0.47, 1.15), [p4x, p4y] = pt(0.5, 1.22), [p5x, p5y] = pt(0.53, 1.15);
  const [p6x, p6y] = pt(0.60, 0.9), [p7x, p7y] = pt(0.60, 0);
  return `L ${p1x} ${p1y} C ${p2x} ${p2y} ${p3x} ${p3y} ${p4x} ${p4y} C ${p5x} ${p5y} ${p6x} ${p6y} ${p7x} ${p7y} L ${x1} ${y1}`;
}

function jigsawPiecePath(x: number, y: number, w: number, h: number, top: number, right: number, bottom: number, left: number): string {
  let d = `M ${x} ${y} `;
  d += jigsawEdge(x, y, x + w, y, top) + ' ';
  d += jigsawEdge(x + w, y, x + w, y + h, right) + ' ';
  d += jigsawEdge(x + w, y + h, x, y + h, bottom) + ' ';
  d += jigsawEdge(x, y + h, x, y, left) + ' Z';
  return d;
}

export function JigsawPuzzleScene({ scene, onNext, onWin }: { scene: Extract<Scene, { kind: 'jigsaw-puzzle' }>; onNext: () => void; onWin: (gem: boolean) => void }) {
  const ROWS = scene.rows ?? 3;
  const COLS = scene.cols ?? 3;
  const CELL = 100 / COLS; // board-percent units (board is always 100x100)
  const PAD = CELL * 0.16; // room for tab overflow, same units
  const PIECE = CELL + PAD * 2;
  const TOLERANCE = PIECE * 0.4; // snap distance, in board-percent units
  const TRAY_GAP = 4; // visual gap between tray pieces and the board edge, board-percent units

  const pieces = useMemo(() => {
    const rng = makeRng(hashSeed(scene.id));
    const hSigns: number[][] = [];
    for (let i = 0; i < ROWS - 1; i++) { hSigns[i] = []; for (let c = 0; c < COLS; c++) hSigns[i][c] = rng() < 0.5 ? -1 : 1; }
    const vSigns: number[][] = [];
    for (let j = 0; j < COLS - 1; j++) { vSigns[j] = []; for (let r = 0; r < ROWS; r++) vSigns[j][r] = rng() < 0.5 ? -1 : 1; }
    const list: { id: string; r: number; c: number; d: string; targetLeft: number; targetTop: number; scatterLeft: number; scatterTop: number }[] = [];
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      const top = r === 0 ? 0 : -hSigns[r - 1][c];
      const bottom = r === ROWS - 1 ? 0 : hSigns[r][c];
      const left = c === 0 ? 0 : -vSigns[c - 1][r];
      const right = c === COLS - 1 ? 0 : vSigns[c][r];
      const targetLeft = c * CELL - PAD, targetTop = r * CELL - PAD;
      list.push({
        id: `${r}-${c}`, r, c,
        d: jigsawPiecePath(PAD, PAD, CELL, CELL, top, right, bottom, left),
        targetLeft, targetTop,
        // Placeholder — real tray position assigned just below, once every
        // piece exists (needs the full list to split left/right evenly).
        scatterLeft: 0, scatterTop: 0,
      });
    }
    // Scatter unplaced pieces into side trays (left/right of the board, not
    // on top of it) so the board stays visible as a clear "put it here"
    // target throughout — direct user request after an earlier version
    // piled every piece straight onto the board. Alternate left/right so
    // both trays fill evenly regardless of piece count.
    list.forEach((p, i) => {
      const onLeft = i % 2 === 0;
      p.scatterLeft = onLeft ? -(PIECE + TRAY_GAP) - rng() * 10 : 100 + TRAY_GAP + rng() * 10;
      p.scatterTop = rng() * (100 - PIECE);
    });
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene.id, ROWS, COLS]);

  const [positions, setPositions] = useState<Record<string, { left: number; top: number }>>(() => Object.fromEntries(pieces.map((p) => [p.id, { left: p.scatterLeft, top: p.scatterTop }])));
  const [placed, setPlaced] = useState<Set<string>>(new Set());
  const [zOrder, setZOrder] = useState<string[]>(pieces.map((p) => p.id));
  const stageRef = useRef<HTMLDivElement | null>(null);
  const dragId = useRef<string | null>(null);
  const gemDone = useRef(false);
  const total = pieces.length;
  const done = placed.size >= total;

  const bringToFront = (id: string) => setZOrder((z) => [...z.filter((x) => x !== id), id]);

  const onPointerDown = (id: string) => (e: React.PointerEvent) => {
    if (placed.has(id)) return;
    dragId.current = id;
    bringToFront(id);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    sfx.click();
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const id = dragId.current;
    if (!id) return;
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;
    // Wide bounds (not clamped to the board's own 0-100 range) so a piece
    // can be picked up from a side tray and dragged smoothly across the
    // whole stage, not just once it already reaches the board.
    setPositions((pos) => ({ ...pos, [id]: { left: Math.min(220, Math.max(-150, xPct - PIECE / 2)), top: Math.min(150, Math.max(-50, yPct - PIECE / 2)) } }));
  };
  const onPointerUp = () => {
    const id = dragId.current;
    dragId.current = null;
    if (!id) return;
    const piece = pieces.find((p) => p.id === id)!;
    const cur = positions[id];
    const dist = Math.hypot(cur.left - piece.targetLeft, cur.top - piece.targetTop);
    if (dist <= TOLERANCE) {
      setPositions((pos) => ({ ...pos, [id]: { left: piece.targetLeft, top: piece.targetTop } }));
      setPlaced((s) => {
        const next = new Set(s).add(id);
        if (next.size >= total && !gemDone.current) { gemDone.current = true; sfx.gem(); onWin(true); }
        return next;
      });
      sfx.match();
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center gap-4 overflow-hidden bg-cover bg-center pb-20 pt-20" style={{ backgroundImage: `url(${scene.bg})` }}>
      <div className="pointer-events-none absolute left-1/2 top-4 z-30 max-w-[92%] -translate-x-1/2 rounded-full bg-white/95 px-5 py-2 text-center text-sm font-black text-orange-700 shadow-xl backdrop-blur sm:text-base">
        🧩 {scene.teacher} <span className="ml-1 opacity-60">({placed.size}/{total})</span>
      </div>
      <div
        ref={stageRef}
        className={`relative ${PUZZLE_BOARD_SIZE} touch-none select-none`}
        style={{ aspectRatio: '1 / 1' }}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {/* Separate from stageRef (which must NOT clip — edge/corner pieces'
            tab-overflow padding puts their correct snap position slightly
            outside the 0-100% board box) so the faint reference picture still
            reads as one clean, rounded, bordered square. */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl border-4 border-white bg-white/40 shadow-2xl">
          <img src={scene.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-20" draggable={false} />
        </div>
        {/* Tray backdrops — visually separate "pieces to pick up" from "the
            picture to build", so a non-reading student can tell what to do
            from the layout alone, without needing the instruction text. */}
        {(['left', 'right'] as const).map((side) => (
          <div
            key={side}
            className="pointer-events-none absolute top-0 flex items-center justify-center rounded-3xl bg-white/25"
            style={{
              height: '100%',
              width: `${PIECE + TRAY_GAP + 12}%`,
              [side]: `-${PIECE + TRAY_GAP + 12}%`,
            } as React.CSSProperties}
          />
        ))}
        {zOrder.map((id) => {
          const piece = pieces.find((p) => p.id === id)!;
          const pos = positions[id];
          const isPlaced = placed.has(id);
          return (
            <div
              key={id}
              onPointerDown={onPointerDown(id)}
              className={`absolute ${isPlaced ? '' : 'cursor-grab active:cursor-grabbing'}`}
              style={{
                left: `${pos.left}%`, top: `${pos.top}%`, width: `${PIECE}%`, height: `${PIECE}%`,
                zIndex: isPlaced ? 1 : 10 + zOrder.indexOf(id),
                filter: isPlaced ? 'none' : 'drop-shadow(0 6px 10px rgba(0,0,0,0.45))',
                transition: isPlaced ? 'left 0.15s ease-out, top 0.15s ease-out' : undefined,
              }}
            >
              <svg viewBox={`0 0 ${PIECE} ${PIECE}`} width="100%" height="100%">
                <defs>
                  <clipPath id={`jig-${scene.id}-${id}`}>
                    <path d={piece.d} />
                  </clipPath>
                </defs>
                <image
                  href={scene.image}
                  x={-(piece.c * CELL - PAD)}
                  y={-(piece.r * CELL - PAD)}
                  width={100}
                  height={100}
                  preserveAspectRatio="xMidYMid slice"
                  clipPath={`url(#jig-${scene.id}-${id})`}
                />
                <path d={piece.d} fill="none" stroke="white" strokeWidth={0.8} opacity={0.9} />
              </svg>
            </div>
          );
        })}
      </div>
      {done && (
        <div className="absolute inset-x-0 bottom-8 z-30 flex justify-center" style={{ animation: 'lep1-slide-up 0.4s ease-out' }}>
          <button onClick={onNext} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 text-xl font-black text-white shadow-2xl active:scale-95">You built the whole picture! ⭐ Next</button>
        </div>
      )}
    </div>
  );
}
