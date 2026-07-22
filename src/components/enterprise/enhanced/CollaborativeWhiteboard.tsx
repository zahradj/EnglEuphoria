import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { 
  Pen, 
  Eraser, 
  Square, 
  Circle, 
  Type, 
  Undo, 
  Redo, 
  Download,
  Trash2,
  Palette,
  MousePointer,
  Hand
} from 'lucide-react';

interface DrawingElement {
  id: string;
  type: 'pen' | 'eraser' | 'rectangle' | 'circle' | 'text';
  points?: number[];
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  text?: string;
  color: string;
  strokeWidth: number;
  timestamp: number;
  userId: string;
  userName: string;
}

interface Cursor {
  userId: string;
  userName: string;
  x: number;
  y: number;
  color: string;
}

export const CollaborativeWhiteboard = ({ 
  roomId, 
  userId, 
  userName 
}: { 
  roomId: string; 
  userId: string; 
  userName: string; 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState<'pen' | 'eraser' | 'rectangle' | 'circle' | 'text' | 'select'>('pen');
  const [currentColor, setCurrentColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [elements, setElements] = useState<DrawingElement[]>([]);
  const [cursors, setCursors] = useState<Map<string, Cursor>>(new Map());
  const [history, setHistory] = useState<DrawingElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const { toast } = useToast();
  const drawingChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const cursorChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const colors = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500'];

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Set up real-time collaboration
    const cleanupSubs = setupRealtimeCollaboration();
    
    return () => {
      cleanupSubs?.();
    };
  }, [roomId]);

  const setupRealtimeCollaboration = () => {
    // Subscribe to drawing events
    const drawingChannel = supabase
      .channel(`whiteboard_${roomId}`)
      .on('broadcast', { event: 'drawing' }, (payload) => {
        const element = payload.payload as DrawingElement;
        if (element.userId !== userId) {
          setElements(prev => [...prev, element]);
          drawElement(element);
        }
      })
      .on('broadcast', { event: 'clear' }, () => {
        clearCanvas();
      })
      .subscribe();

    // Subscribe to cursor movements
    const cursorChannel = supabase
      .channel(`cursors_${roomId}`)
      .on('presence', { event: 'sync' }, () => {
        const presenceState = cursorChannel.presenceState();
        const newCursors = new Map<string, Cursor>();
        
        Object.values(presenceState).flat().forEach((presence: any) => {
          if (presence.userId !== userId) {
            newCursors.set(presence.userId, presence);
          }
        });
        
        setCursors(newCursors);
      })
      .subscribe();

    drawingChannelRef.current = drawingChannel;
    cursorChannelRef.current = cursorChannel;

    return () => {
      supabase.removeChannel(drawingChannel);
      supabase.removeChannel(cursorChannel);
      drawingChannelRef.current = null;
      cursorChannelRef.current = null;
    };
  };

  const drawElement = useCallback((element: DrawingElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = element.color;
    ctx.lineWidth = element.strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    switch (element.type) {
      case 'pen':
        if (element.points && element.points.length > 2) {
          ctx.beginPath();
          ctx.moveTo(element.points[0], element.points[1]);
          for (let i = 2; i < element.points.length; i += 2) {
            ctx.lineTo(element.points[i], element.points[i + 1]);
          }
          ctx.stroke();
        }
        break;

      case 'eraser':
        if (element.points && element.points.length > 2) {
          ctx.globalCompositeOperation = 'destination-out';
          ctx.beginPath();
          ctx.moveTo(element.points[0], element.points[1]);
          for (let i = 2; i < element.points.length; i += 2) {
            ctx.lineTo(element.points[i], element.points[i + 1]);
          }
          ctx.stroke();
          ctx.globalCompositeOperation = 'source-over';
        }
        break;

      case 'rectangle':
        if (element.x && element.y && element.width && element.height) {
          ctx.strokeRect(element.x, element.y, element.width, element.height);
        }
        break;

      case 'circle':
        if (element.x && element.y && element.width) {
          ctx.beginPath();
          ctx.arc(element.x, element.y, element.width / 2, 0, 2 * Math.PI);
          ctx.stroke();
        }
        break;

      case 'text':
        if (element.text && element.x && element.y) {
          ctx.fillStyle = element.color;
          ctx.font = `${element.strokeWidth * 8}px Arial`;
          ctx.fillText(element.text, element.x, element.y);
        }
        break;
    }
  }, []);

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    elements.forEach(element => drawElement(element));
  }, [elements, drawElement]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (currentTool === 'select') return;

    setIsDrawing(true);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (currentTool === 'pen' || currentTool === 'eraser') {
      // Start drawing path
    } else if (currentTool === 'text') {
      const text = prompt('Enter text:');
      if (text) {
        const element: DrawingElement = {
          id: `${Date.now()}-${Math.random()}`,
          type: 'text',
          x,
          y,
          text,
          color: currentColor,
          strokeWidth,
          timestamp: Date.now(),
          userId,
          userName
        };

        addElement(element);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Update cursor position for other users
    const cursorCh = cursorChannelRef.current;
    cursorCh?.track({
      userId,
      userName,
      x,
      y,
      color: currentColor
    });

    if (!isDrawing || currentTool === 'select' || currentTool === 'text') return;

    // Continue drawing logic here
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const addElement = (element: DrawingElement) => {
    setElements(prev => {
      const newElements = [...prev, element];
      
      // Add to history
      setHistory(prevHistory => [...prevHistory.slice(0, historyIndex + 1), newElements]);
      setHistoryIndex(prev => prev + 1);
      
      return newElements;
    });

    drawElement(element);

    // Broadcast to other users
    drawingChannelRef.current?.send({
      type: 'broadcast',
      event: 'drawing',
      payload: element
    });
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setElements([]);
    
    // Add to history
    setHistory(prev => [...prev.slice(0, historyIndex + 1), []]);
    setHistoryIndex(prev => prev + 1);
  };

  const handleClear = () => {
    clearCanvas();
    
    // Broadcast clear to other users
    drawingChannelRef.current?.send({
      type: 'broadcast',
      event: 'clear',
      payload: {}
    });
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      setElements(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
      setElements(history[historyIndex + 1]);
    }
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `whiteboard-${roomId}-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Pen className="h-5 w-5" />
            Collaborative Whiteboard
          </CardTitle>
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            {cursors.size + 1} active
          </Badge>
        </div>
        
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Tools */}
          <div className="flex items-center gap-1 border rounded p-1">
            <Button
              variant={currentTool === 'select' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentTool('select')}
            >
              <MousePointer className="h-4 w-4" />
            </Button>
            <Button
              variant={currentTool === 'pen' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentTool('pen')}
            >
              <Pen className="h-4 w-4" />
            </Button>
            <Button
              variant={currentTool === 'eraser' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentTool('eraser')}
            >
              <Eraser className="h-4 w-4" />
            </Button>
            <Button
              variant={currentTool === 'rectangle' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentTool('rectangle')}
            >
              <Square className="h-4 w-4" />
            </Button>
            <Button
              variant={currentTool === 'circle' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentTool('circle')}
            >
              <Circle className="h-4 w-4" />
            </Button>
            <Button
              variant={currentTool === 'text' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentTool('text')}
            >
              <Type className="h-4 w-4" />
            </Button>
          </div>

          {/* Colors */}
          <div className="flex items-center gap-1 border rounded p-1">
            {colors.map(color => (
              <button
                key={color}
                className={`w-6 h-6 rounded border-2 ${
                  currentColor === color ? 'border-gray-800' : 'border-gray-300'
                }`}
                style={{ backgroundColor: color }}
                onClick={() => setCurrentColor(color)}
              />
            ))}
          </div>

          {/* Stroke Width */}
          <div className="flex items-center gap-2">
            <span className="text-sm">Size:</span>
            <Input
              type="range"
              min="1"
              max="20"
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(Number(e.target.value))}
              className="w-16"
            />
            <span className="text-sm w-6">{strokeWidth}</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 border rounded p-1">
            <Button variant="ghost" size="sm" onClick={handleUndo}>
              <Undo className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleRedo}>
              <Redo className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={downloadCanvas}>
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleClear}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 relative">
        <canvas
          ref={canvasRef}
          className="w-full h-96 border cursor-crosshair"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
        
        {/* Render cursors */}
        {Array.from(cursors.values()).map(cursor => (
          <div
            key={cursor.userId}
            className="absolute pointer-events-none z-10"
            style={{
              left: cursor.x,
              top: cursor.y,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div 
              className="w-3 h-3 rounded-full border-2 border-white"
              style={{ backgroundColor: cursor.color }}
            />
            <div className="text-xs bg-black text-white px-1 rounded mt-1">
              {cursor.userName}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};