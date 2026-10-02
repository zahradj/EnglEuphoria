import React, { useRef, useEffect, useState, useCallback } from 'react';
import { WhiteboardStroke } from '@/services/whiteboardService';
import { isActivityTarget } from '@/lib/penPassThrough';

type ToolKind =
  | 'pen'
  | 'highlighter'
  | 'eraser'
  | 'pointer'
  | 'text'
  | 'laser'
  | 'rect'
  | 'circle'
  | 'arrow'
  | 'line';

interface CollaborativeCanvasProps {
  roomId: string;
  userId: string;
  userName: string;
  role: 'teacher' | 'student';
  canDraw: boolean;
  activeTool: ToolKind;
  activeColor: string;
  strokes: WhiteboardStroke[];
  onAddStroke: (stroke: Omit<WhiteboardStroke, 'id' | 'roomId' | 'timestamp'>) => void;
  slideImageUrl?: string;
  /**
   * Student "smart pen": the layer is click-through, and a touch only starts a stroke when it
   * lands on empty space — a touch on a game piece goes to the game. The host element (the
   * stage the layer sits in) listens instead of this canvas. Teacher / web-page modes leave it off.
   */
  smartPen?: boolean;
}

const SHAPE_TOOLS: ToolKind[] = ['rect', 'circle', 'arrow', 'line'];
/** Text height as a fraction of the canvas height (~22px on a laptop stage). */
const TEXT_SIZE_FRACTION = 0.045;
const isShape = (t: ToolKind) => SHAPE_TOOLS.includes(t);

export const CollaborativeCanvas: React.FC<CollaborativeCanvasProps> = ({
  userId,
  userName,
  canDraw,
  activeTool,
  activeColor,
  strokes,
  onAddStroke,
  smartPen = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<Array<{ x: number; y: number }>>([]);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const startPointRef = useRef<{ x: number; y: number } | null>(null);
  // Synchronous mirrors of the drawing state: fast pointer events can arrive before React re-renders.
  const isDrawingRef = useRef(false);
  const pointsRef = useRef<Array<{ x: number; y: number }>>([]);

  const drawArrowHead = (
    ctx: CanvasRenderingContext2D,
    from: { x: number; y: number },
    to: { x: number; y: number },
    size = 12,
  ) => {
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    ctx.beginPath();
    ctx.moveTo(to.x, to.y);
    ctx.lineTo(to.x - size * Math.cos(angle - Math.PI / 6), to.y - size * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(to.x, to.y);
    ctx.lineTo(to.x - size * Math.cos(angle + Math.PI / 6), to.y - size * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
  };

  const drawStroke = (
    ctx: CanvasRenderingContext2D,
    stroke: WhiteboardStroke,
    canvasW: number,
    canvasH: number,
  ) => {
    const { points, color, width, tool, text, fontSize } = stroke.strokeData;
    if (!points || points.length === 0) return;

    const isNormalized = points.every((p: any) => Math.abs(p.x) <= 1.5 && Math.abs(p.y) <= 1.5);
    const toX = (x: number) => (isNormalized ? x * canvasW : x);
    const toY = (y: number) => (isNormalized ? y * canvasH : y);

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (tool === 'text' && text) {
      // New strokes store the size as a fraction of the canvas height so text
      // is the same size relative to the picture on every screen; older
      // strokes stored plain pixels.
      const fs = fontSize == null ? 20 : fontSize < 1 ? Math.max(10, fontSize * canvasH) : fontSize;
      ctx.fillStyle = color;
      ctx.font = `600 ${fs}px Inter, system-ui, sans-serif`;
      ctx.textBaseline = 'top';
      ctx.fillText(text, toX(points[0].x), toY(points[0].y));
      ctx.restore();
      return;
    }

    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
      ctx.lineWidth = width * 3;
    } else if (tool === 'highlighter') {
      ctx.globalCompositeOperation = 'multiply';
      ctx.strokeStyle = color;
      ctx.lineWidth = width * 2;
      ctx.globalAlpha = 0.3;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
    }

    if ((tool === 'rect' || tool === 'circle' || tool === 'arrow' || tool === 'line') && points.length >= 2) {
      const p0 = { x: toX(points[0].x), y: toY(points[0].y) };
      const p1 = { x: toX(points[1].x), y: toY(points[1].y) };
      if (tool === 'rect') {
        ctx.strokeRect(p0.x, p0.y, p1.x - p0.x, p1.y - p0.y);
      } else if (tool === 'circle') {
        const cx = (p0.x + p1.x) / 2;
        const cy = (p0.y + p1.y) / 2;
        const rx = Math.abs(p1.x - p0.x) / 2;
        const ry = Math.abs(p1.y - p0.y) / 2;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.stroke();
        if (tool === 'arrow') drawArrowHead(ctx, p0, p1, Math.max(10, width * 4));
      }
      ctx.restore();
      return;
    }

    if (points.length < 2) {
      ctx.restore();
      return;
    }
    ctx.beginPath();
    ctx.moveTo(toX(points[0].x), toY(points[0].y));
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(toX(points[i].x), toY(points[i].y));
    }
    ctx.stroke();
    ctx.restore();
  };

  const redrawAll = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    strokes.forEach((stroke) => drawStroke(ctx, stroke, canvas.width, canvas.height));
  }, [strokes]);

  useEffect(() => {
    redrawAll();
  }, [redrawAll]);

  type PointerLike = React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement> | { clientX: number; clientY: number };
  const getCanvasPoint = (e: PointerLike) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ('touches' in e) {
      const touch = e.touches[0];
      return { x: (touch.clientX - rect.left) * scaleX, y: (touch.clientY - rect.top) * scaleY };
    }
    const c = e as { clientX: number; clientY: number };
    return { x: (c.clientX - rect.left) * scaleX, y: (c.clientY - rect.top) * scaleY };
  };

  const commitStroke = (
    tool: WhiteboardStroke['strokeData']['tool'],
    points: Array<{ x: number; y: number }>,
    extra: Partial<WhiteboardStroke['strokeData']> = {},
  ) => {
    const canvas = canvasRef.current;
    const w = Math.max(1, canvas?.width ?? 1);
    const h = Math.max(1, canvas?.height ?? 1);
    const normalized = points.map((p) => ({ x: p.x / w, y: p.y / h }));
    onAddStroke({
      userId,
      userName,
      strokeData: {
        points: normalized,
        color: activeColor,
        width: tool === 'eraser' ? 12 : tool === 'highlighter' ? 8 : 3,
        tool,
        ...extra,
      },
    });
  };

  const startDrawing = useCallback(
    (e: PointerLike) => {
      if (!canDraw || activeTool === 'pointer' || activeTool === 'laser') return;
      const point = getCanvasPoint(e);
      if (!point) return;

      if (activeTool === 'text') {
        const text = window.prompt('Type text to place on the slide:');
        if (text && text.trim()) {
          commitStroke('text', [point], { text: text.trim(), fontSize: TEXT_SIZE_FRACTION });
        }
        return;
      }

      setIsDrawing(true);
      isDrawingRef.current = true;
      pointsRef.current = [point];
      startPointRef.current = point;
      setCurrentPoints([point]);
      lastPointRef.current = point;
    },
    [canDraw, activeTool, activeColor],
  );

  const draw = useCallback(
    (e: PointerLike) => {
      if (!(isDrawing || isDrawingRef.current) || !canDraw) return;
      const point = getCanvasPoint(e);
      if (!point) return;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!ctx || !canvas) return;

      // Shape preview: redraw committed strokes + preview the in-progress shape.
      if (isShape(activeTool) && startPointRef.current) {
        // Track the drag end — stopDrawing commits [start, last]. This was
        // missing, so every shape was saved with start === end (zero size)
        // and never appeared on the other screen.
        lastPointRef.current = point;
        redrawAll();
        const preview: WhiteboardStroke = {
          id: 'preview',
          roomId: '',
          userId,
          userName,
          timestamp: 0,
          strokeData: {
            points: [startPointRef.current, point],
            color: activeColor,
            width: 3,
            tool: activeTool as any,
          },
        };
        drawStroke(ctx, preview, canvas.width, canvas.height);
        return;
      }

      if (lastPointRef.current) {
        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        const tool = activeTool === 'eraser' ? 'eraser' : activeTool === 'highlighter' ? 'highlighter' : 'pen';
        if (tool === 'eraser') {
          ctx.globalCompositeOperation = 'destination-out';
          ctx.strokeStyle = 'rgba(0,0,0,1)';
          ctx.lineWidth = 12;
        } else if (tool === 'highlighter') {
          ctx.globalCompositeOperation = 'multiply';
          ctx.strokeStyle = activeColor;
          ctx.lineWidth = 8;
          ctx.globalAlpha = 0.3;
        } else {
          ctx.globalCompositeOperation = 'source-over';
          ctx.strokeStyle = activeColor;
          ctx.lineWidth = 3;
        }
        ctx.beginPath();
        ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
        ctx.restore();
      }
      pointsRef.current = [...pointsRef.current, point];
      setCurrentPoints((prev) => [...prev, point]);
      lastPointRef.current = point;
    },
    [isDrawing, canDraw, activeTool, activeColor, redrawAll, userId, userName],
  );

  const stopDrawing = useCallback(() => {
    if (!(isDrawing || isDrawingRef.current)) return;
    isDrawingRef.current = false;

    if (isShape(activeTool) && startPointRef.current && lastPointRef.current) {
      const s0 = startPointRef.current, s1 = lastPointRef.current;
      // A click without a drag isn't a shape.
      if (Math.hypot(s1.x - s0.x, s1.y - s0.y) >= 4) {
        commitStroke(activeTool as any, [s0, s1]);
      } else {
        redrawAll();
      }
      setIsDrawing(false);
      setCurrentPoints([]);
      startPointRef.current = null;
      lastPointRef.current = null;
      return;
    }

    const finalPoints = pointsRef.current.length >= currentPoints.length ? pointsRef.current : currentPoints;
    pointsRef.current = [];
    if (finalPoints.length < 2) {
      setIsDrawing(false);
      setCurrentPoints([]);
      lastPointRef.current = null;
      startPointRef.current = null;
      return;
    }

    const tool = activeTool === 'eraser' ? 'eraser' : activeTool === 'highlighter' ? 'highlighter' : 'pen';
    commitStroke(tool, finalPoints);

    setIsDrawing(false);
    setCurrentPoints([]);
    lastPointRef.current = null;
    startPointRef.current = null;
  }, [isDrawing, currentPoints, activeTool, activeColor, redrawAll]);

  // Student smart pen. Always point at the latest handlers (they close over fresh state each render).
  const handlersRef = useRef({ startDrawing, draw, stopDrawing });
  handlersRef.current = { startDrawing, draw, stopDrawing };

  useEffect(() => {
    if (!smartPen || !canDraw || activeTool === 'pointer' || activeTool === 'laser') return;
    const host = canvasRef.current?.parentElement?.parentElement; // canvas → pen layer → stage
    if (!host) return;

    let activePointer: number | null = null;
    let moved = false;

    const onDown = (e: PointerEvent) => {
      if (activePointer !== null) return;
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      // A game piece under the finger gets the touch; only empty space draws.
      if (isActivityTarget(e.target, host)) return;
      activePointer = e.pointerId;
      moved = false;
      handlersRef.current.startDrawing(e);
      e.preventDefault();
      e.stopPropagation();
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerId !== activePointer) return;
      moved = true;
      e.preventDefault();
      handlersRef.current.draw(e);
    };
    const onUp = (e: PointerEvent) => {
      if (e.pointerId !== activePointer) return;
      activePointer = null;
      handlersRef.current.stopDrawing();
      if (moved) {
        // The browser still sends a click after a drag; don't let it "tap" whatever the stroke ended on.
        const swallow = (ev: Event) => ev.stopPropagation();
        host.addEventListener('click', swallow, true);
        window.setTimeout(() => host.removeEventListener('click', swallow, true), 400);
      }
    };

    host.addEventListener('pointerdown', onDown, true);
    window.addEventListener('pointermove', onMove, { passive: false });
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    // Without this a finger-drag on empty space scrolls/pans instead of drawing.
    const previousTouchAction = host.style.touchAction;
    host.style.touchAction = 'none';

    return () => {
      host.removeEventListener('pointerdown', onDown, true);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      host.style.touchAction = previousTouchAction || '';
    };
  }, [smartPen, canDraw, activeTool]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      redrawAll();
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    const ro = new ResizeObserver(resizeCanvas);
    if (canvas.parentElement) ro.observe(canvas.parentElement);
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      ro.disconnect();
    };
  }, [redrawAll]);

  const getCursorStyle = () => {
    if (!canDraw) return 'default';
    if (activeTool === 'pointer') return 'default';
    if (activeTool === 'eraser') return 'cell';
    if (activeTool === 'text') return 'text';
    if (activeTool === 'laser') return 'pointer';
    return 'crosshair';
  };

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-10"
      style={{ cursor: getCursorStyle() }}
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onMouseLeave={stopDrawing}
      onTouchStart={startDrawing}
      onTouchMove={draw}
      onTouchEnd={stopDrawing}
    />
  );
};
