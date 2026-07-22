
import { useState, useEffect, useCallback, useRef } from 'react';
import { whiteboardService, WhiteboardStroke, WhiteboardState } from '@/services/whiteboardService';
import { useToast } from '@/hooks/use-toast';

interface UseRealTimeWhiteboardProps {
  roomId: string;
  userId: string;
  userName: string;
  isEnabled?: boolean;
}

export function useRealTimeWhiteboard({
  roomId,
  userId,
  userName,
  isEnabled = true
}: UseRealTimeWhiteboardProps) {
  const [whiteboardState, setWhiteboardState] = useState<WhiteboardState>({
    strokes: [],
    currentPage: 1,
    totalPages: 1
  });
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState<'pen' | 'highlighter' | 'eraser'>('pen');
  const [currentColor, setCurrentColor] = useState('#000000');
  const [currentWidth, setCurrentWidth] = useState(2);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!isEnabled) return;

    const unsubscribe = whiteboardService.subscribeToStrokes(roomId, (stroke) => {
      if (stroke.id === 'clear') {
        setWhiteboardState(prev => ({ ...prev, strokes: [] }));
        clearCanvas();
      } else {
        setWhiteboardState(prev => ({
          ...prev,
          strokes: [...prev.strokes, stroke]
        }));
        drawStroke(stroke);
      }
    });

    return unsubscribe;
  }, [roomId, isEnabled]);

  const startDrawing = useCallback((x: number, y: number) => {
    setIsDrawing(true);
  }, []);

  const draw = useCallback((x: number, y: number) => {
    if (!isDrawing || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw locally first for immediate feedback
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = currentWidth;
    ctx.lineCap = 'round';
    ctx.lineTo(x, y);
    ctx.stroke();
  }, [isDrawing, currentColor, currentWidth]);

  const stopDrawing = useCallback(async (points: Array<{ x: number; y: number }>) => {
    if (!isDrawing || points.length === 0) return;
    
    setIsDrawing(false);

    try {
      const stroke: Omit<WhiteboardStroke, 'id'> = {
        roomId,
        userId,
        userName,
        strokeData: {
          points,
          color: currentColor,
          width: currentWidth,
          tool: currentTool
        },
        timestamp: Date.now()
      };

      await whiteboardService.saveStroke(roomId, stroke);
    } catch (error) {
      console.error('Failed to save stroke:', error);
      toast({
        title: "Drawing Error",
        description: "Failed to save your drawing",
        variant: "destructive"
      });
    }
  }, [isDrawing, roomId, userId, userName, currentColor, currentWidth, currentTool, toast]);

  const clearWhiteboard = useCallback(async () => {
    try {
      await whiteboardService.clearWhiteboard(roomId);
      clearCanvas();
    } catch (error) {
      console.error('Failed to clear whiteboard:', error);
      toast({
        title: "Clear Error",
        description: "Failed to clear whiteboard",
        variant: "destructive"
      });
    }
  }, [roomId, toast]);

  const drawStroke = useCallback((stroke: WhiteboardStroke) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = stroke.strokeData.color;
    ctx.lineWidth = stroke.strokeData.width;
    ctx.lineCap = 'round';

    ctx.beginPath();
    stroke.strokeData.points.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.stroke();
  }, []);

  const clearCanvas = useCallback(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  const setTool = useCallback((tool: 'pen' | 'highlighter' | 'eraser') => {
    setCurrentTool(tool);
    if (tool === 'highlighter') {
      setCurrentWidth(8);
    } else if (tool === 'eraser') {
      setCurrentWidth(10);
    } else {
      setCurrentWidth(2);
    }
  }, []);

  return {
    whiteboardState,
    canvasRef,
    isDrawing,
    currentTool,
    currentColor,
    currentWidth,
    startDrawing,
    draw,
    stopDrawing,
    clearWhiteboard,
    setTool,
    setCurrentColor,
    setCurrentWidth
  };
}
