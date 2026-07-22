import { useEffect, useRef, useState } from 'react';
import type { StrokePayload } from '@/hooks/useLiveClassroom';

export type AnnotationTool = 'pen' | 'laser' | 'none';

interface Props {
  tool: AnnotationTool;
  color: string;
  width?: number;
  onStroke: (p: Omit<StrokePayload, 'senderId'>) => void;
  onLaser: (p: { x: number; y: number }) => void;
  registerStrokeHandler: (h: (p: StrokePayload) => void) => () => void;
  registerClearHandler: (h: () => void) => () => void;
}

/**
 * Transparent absolute-positioned drawing canvas.
 * - Local strokes are rendered immediately AND broadcast.
 * - Remote strokes received via registerStrokeHandler are also drawn here.
 * - "clear" wipes the canvas on both sides.
 */
export function AnnotationOverlay({
  tool, color, width = 4, onStroke, onLaser, registerStrokeHandler, registerClearHandler,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  // Resize observer to keep canvas in sync with container
  useEffect(() => {
    const el = canvasRef.current?.parentElement;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const rect = el.getBoundingClientRect();
      setSize({ w: rect.width, h: rect.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Draw remote strokes
  useEffect(() => {
    const off = registerStrokeHandler((p) => {
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) return;
      drawSegment(ctx, p.prevX, p.prevY, p.x, p.y, p.color, p.width);
    });
    return off;
  }, [registerStrokeHandler]);

  useEffect(() => {
    const off = registerClearHandler(() => {
      const c = canvasRef.current;
      const ctx = c?.getContext('2d');
      if (c && ctx) ctx.clearRect(0, 0, c.width, c.height);
    });
    return off;
  }, [registerClearHandler]);

  const getPos = (e: React.PointerEvent) => {
    const c = canvasRef.current!;
    const rect = c.getBoundingClientRect();
    return { x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height };
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (tool !== 'pen') return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    drawing.current = true;
    last.current = getPos(e);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const pos = getPos(e);
    if (tool === 'laser') {
      onLaser(pos);
      return;
    }
    if (!drawing.current || !last.current || tool !== 'pen') return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const c = canvasRef.current!;
    const px = last.current.x * c.width;
    const py = last.current.y * c.height;
    const cx = pos.x * c.width;
    const cy = pos.y * c.height;
    drawSegment(ctx, px, py, cx, cy, color, width);
    onStroke({ prevX: last.current.x, prevY: last.current.y, x: pos.x, y: pos.y, color, width });
    last.current = pos;
  };

  const handlePointerUp = () => { drawing.current = false; last.current = null; };

  return (
    <canvas
      ref={canvasRef}
      width={size.w}
      height={size.h}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      className="absolute inset-0 z-20"
      style={{
        width: '100%',
        height: '100%',
        cursor: tool === 'pen' ? 'crosshair' : tool === 'laser' ? 'none' : 'default',
        pointerEvents: tool === 'none' ? 'none' : 'auto',
        touchAction: 'none',
      }}
    />
  );
}

function drawSegment(ctx: CanvasRenderingContext2D, px: number, py: number, x: number, y: number, color: string, width: number) {
  // px/py/x/y are in unit coords if <1 — convert
  const c = ctx.canvas;
  const a = px <= 1 ? px * c.width : px;
  const b = py <= 1 ? py * c.height : py;
  const cc = x <= 1 ? x * c.width : x;
  const dd = y <= 1 ? y * c.height : y;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = width;
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(a, b);
  ctx.lineTo(cc, dd);
  ctx.stroke();
}
