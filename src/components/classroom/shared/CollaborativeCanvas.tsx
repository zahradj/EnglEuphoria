import React, { useRef, useEffect, useState, useCallback } from 'react';
import { WhiteboardStroke } from '@/services/whiteboardService';

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
}

const SHAPE_TOOLS: ToolKind[] = ['rect', 'circle', 'arrow', 'line'];
const isShape = (t: ToolKind) => SHAPE_TOOLS.includes(t);

export const CollaborativeCanvas: React.FC<CollaborativeCanvasProps> = ({
  userId,
  userName,
  canDraw,
  activeTool,
  activeColor,
  strokes,
  onAddStroke,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<Array<{ x: number; y: number }>>([]);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const startPointRef = useRef<{ x: number; y: number } | null>(null);

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
      const fs = fontSize ?? 20;
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

  const getCanvasPoint = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ('touches' in e) {
      const touch = e.touches[0];
      return { x: (touch.clientX - rect.left) * scaleX, y: (touch.clientY - rect.top) * scaleY };
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
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
    (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      if (!canDraw || activeTool === 'pointer' || activeTool === 'laser') return;
      const point = getCanvasPoint(e);
      if (!point) return;

      if (activeTool === 'text') {
        const text = window.prompt('Type text to place on the slide:');
        if (text && text.trim()) {
          commitStroke('text', [point], { text: text.trim(), fontSize: 22 });
        }
        return;
      }

      setIsDrawing(true);
      startPointRef.current = point;
      setCurrentPoints([point]);
      lastPointRef.current = point;
    },
    [canDraw, activeTool, activeColor],
  );

  const draw = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      if (!isDrawing || !canDraw) return;
      const point = getCanvasPoint(e);
      if (!point) return;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!ctx || !canvas) return;

      // Shape preview: redraw committed strokes + preview the in-progress shape.
      if (isShape(activeTool) && startPointRef.current) {
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
      setCurrentPoints((prev) => [...prev, point]);
      lastPointRef.current = point;
    },
    [isDrawing, canDraw, activeTool, activeColor, redrawAll, userId, userName],
  );

  const stopDrawing = useCallback(() => {
    if (!isDrawing) return;

    if (isShape(activeTool) && startPointRef.current && lastPointRef.current) {
      commitStroke(activeTool as any, [startPointRef.current, lastPointRef.current]);
      setIsDrawing(false);
      setCurrentPoints([]);
      startPointRef.current = null;
      lastPointRef.current = null;
      return;
    }

    if (currentPoints.length < 2) {
      setIsDrawing(false);
      setCurrentPoints([]);
      lastPointRef.current = null;
      startPointRef.current = null;
      return;
    }

    const tool = activeTool === 'eraser' ? 'eraser' : activeTool === 'highlighter' ? 'highlighter' : 'pen';
    commitStroke(tool, currentPoints);

    setIsDrawing(false);
    setCurrentPoints([]);
    lastPointRef.current = null;
    startPointRef.current = null;
  }, [isDrawing, currentPoints, activeTool, activeColor]);

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
