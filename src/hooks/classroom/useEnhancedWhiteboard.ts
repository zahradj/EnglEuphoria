import { useState, useRef, useCallback, useEffect } from "react";
import { useWhiteboardHistory } from "./useWhiteboardHistory";
import type { WhiteboardTool } from "@/components/classroom/modern/EnhancedWhiteboardToolbar";

export function useEnhancedWhiteboard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeTool, setActiveTool] = useState<WhiteboardTool>("pencil");
  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(2);
  const [opacity, setOpacity] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const initializedRef = useRef(false);

  const {
    saveState,
    undo,
    redo,
    clearHistory,
    canUndo,
    canRedo
  } = useWhiteboardHistory(canvasRef);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      if (w === 0 || h === 0) return;

      // Preserve existing strokes
      let snapshot: ImageData | null = null;
      if (canvas.width > 0 && canvas.height > 0) {
        try {
          snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
        } catch {
          snapshot = null;
        }
      }

      canvas.width = w;
      canvas.height = h;
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      if (snapshot) {
        ctx.putImageData(snapshot, 0, 0);
      }

      if (!initializedRef.current) {
        initializedRef.current = true;
        saveState();
      }
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [saveState]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "z" && !e.shiftKey) {
          e.preventDefault();
          undo();
        } else if (e.key === "y" || (e.key === "z" && e.shiftKey)) {
          e.preventDefault();
          redo();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  const getCanvasCoordinates = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Always reset compositing state so pen works after eraser/highlighter
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;

    const point = getCanvasCoordinates(e);
    setStartPoint(point);
    setIsDrawing(true);

    if (activeTool === "pencil" || activeTool === "highlighter" || activeTool === "eraser") {
      ctx.beginPath();
      ctx.moveTo(point.x, point.y);
    }
  }, [activeTool, getCanvasCoordinates]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const point = getCanvasCoordinates(e);

    if (activeTool === "pencil") {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.globalAlpha = 1;
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
    } else if (activeTool === "highlighter") {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize * 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.globalAlpha = opacity;
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
    } else if (activeTool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = brushSize * 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
      ctx.globalCompositeOperation = "source-over";
    }
  }, [isDrawing, activeTool, color, brushSize, opacity, getCanvasCoordinates]);

  const handleMouseUp = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPoint) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Reset to safe defaults before any shape drawing
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;

    const endPoint = getCanvasCoordinates(e);

    // Draw shapes
    if (activeTool === "line") {
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(startPoint.x, startPoint.y);
      ctx.lineTo(endPoint.x, endPoint.y);
      ctx.stroke();
    } else if (activeTool === "arrow") {
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.lineCap = "round";

      ctx.beginPath();
      ctx.moveTo(startPoint.x, startPoint.y);
      ctx.lineTo(endPoint.x, endPoint.y);
      ctx.stroke();

      const angle = Math.atan2(endPoint.y - startPoint.y, endPoint.x - startPoint.x);
      const headLength = brushSize * 5;
      ctx.beginPath();
      ctx.moveTo(endPoint.x, endPoint.y);
      ctx.lineTo(
        endPoint.x - headLength * Math.cos(angle - Math.PI / 6),
        endPoint.y - headLength * Math.sin(angle - Math.PI / 6)
      );
      ctx.moveTo(endPoint.x, endPoint.y);
      ctx.lineTo(
        endPoint.x - headLength * Math.cos(angle + Math.PI / 6),
        endPoint.y - headLength * Math.sin(angle + Math.PI / 6)
      );
      ctx.stroke();
    } else if (activeTool === "rectangle") {
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.strokeRect(
        startPoint.x,
        startPoint.y,
        endPoint.x - startPoint.x,
        endPoint.y - startPoint.y
      );
    } else if (activeTool === "circle") {
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      const radius = Math.sqrt(
        Math.pow(endPoint.x - startPoint.x, 2) + Math.pow(endPoint.y - startPoint.y, 2)
      );
      ctx.beginPath();
      ctx.arc(startPoint.x, startPoint.y, radius, 0, 2 * Math.PI);
      ctx.stroke();
    } else if (activeTool === "triangle") {
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.beginPath();
      ctx.moveTo(startPoint.x, endPoint.y);
      ctx.lineTo((startPoint.x + endPoint.x) / 2, startPoint.y);
      ctx.lineTo(endPoint.x, endPoint.y);
      ctx.closePath();
      ctx.stroke();
    }

    setIsDrawing(false);
    setStartPoint(null);
    saveState();
  }, [isDrawing, startPoint, activeTool, color, brushSize, getCanvasCoordinates, saveState]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    clearHistory();
    saveState();
  }, [clearHistory, saveState]);

  const downloadCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = `whiteboard-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  }, []);

  return {
    canvasRef,
    activeTool,
    setActiveTool,
    color,
    setColor,
    brushSize,
    setBrushSize,
    opacity,
    setOpacity,
    zoom,
    setZoom,
    isDrawing,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    clearCanvas,
    downloadCanvas,
    undo,
    redo,
    canUndo,
    canRedo
  };
}
