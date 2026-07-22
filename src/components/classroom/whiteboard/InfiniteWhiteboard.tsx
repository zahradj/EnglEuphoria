import React, { useRef, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SoundButton } from "@/components/ui/sound-button";
import { Badge } from "@/components/ui/badge";
import { ZoomIn, ZoomOut, Move, RotateCcw, Download } from "lucide-react";

interface InfiniteWhiteboardProps {
  activeTool: string;
  color: string;
  onCanvasClick?: (e: React.MouseEvent) => void;
  children?: React.ReactNode;
}

export function InfiniteWhiteboard({ 
  activeTool, 
  color, 
  onCanvasClick,
  children 
}: InfiniteWhiteboardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set larger canvas size for more drawing space
    canvas.width = 4000;
    canvas.height = 3000;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Fill with white background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const handleZoom = (direction: 'in' | 'out') => {
    const factor = direction === 'in' ? 1.2 : 0.8;
    const newZoom = Math.min(Math.max(zoom * factor, 0.1), 5);
    setZoom(newZoom);
  };

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (activeTool === 'pan' || e.button === 1) { // Middle mouse button
      setIsPanning(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    } else if (onCanvasClick) {
      onCanvasClick(e);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      const deltaX = e.clientX - lastPanPoint.x;
      const deltaY = e.clientY - lastPanPoint.y;
      setPan(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dataURL = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = "whiteboard-export.png";
    link.href = dataURL;
    link.click();
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      {/* Zoom and Pan Controls */}
      <div className="flex items-center justify-between p-2 border-b bg-gray-50">
        <div className="flex items-center gap-2">
          <SoundButton
            variant="outline"
            size="sm"
            onClick={() => handleZoom('out')}
          >
            <ZoomOut size={14} />
          </SoundButton>
          <Badge variant="secondary" className="px-2 py-1 text-xs">
            {Math.round(zoom * 100)}%
          </Badge>
          <SoundButton
            variant="outline"
            size="sm"
            onClick={() => handleZoom('in')}
          >
            <ZoomIn size={14} />
          </SoundButton>
        </div>
        
        <div className="flex items-center gap-2">
          <SoundButton
            variant="outline"
            size="sm"
            onClick={handleReset}
            title="Reset zoom and position"
          >
            <RotateCcw size={14} />
          </SoundButton>
          <SoundButton
            variant="outline"
            size="sm"
            onClick={downloadCanvas}
          >
            <Download size={14} />
          </SoundButton>
        </div>
      </div>

      {/* Canvas Container - Made taller */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-hidden relative bg-gray-100 min-h-[600px]"
        style={{ cursor: activeTool === 'pan' ? 'grab' : 'default' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Grid background */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(#000 1px, transparent 1px),
              linear-gradient(90deg, #000 1px, transparent 1px)
            `,
            backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
            transform: `translate(${pan.x}px, ${pan.y}px)`
          }}
        />
        
        {/* Main Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            cursor: activeTool === 'pencil' ? 'crosshair' : 
                   activeTool === 'eraser' ? 'grab' :
                   activeTool === 'text' ? 'text' : 'default'
          }}
        />
        
        {/* Embedded content container */}
        <div 
          className="absolute"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0'
          }}
        >
          {children}
        </div>
      </div>
      
      {/* Status indicators */}
      <div className="flex items-center justify-between p-2 bg-gray-50 border-t text-xs text-gray-600">
        <span>Pan: {Math.round(pan.x)}, {Math.round(pan.y)}</span>
        <Badge className="bg-blue-100 text-blue-700">
          Extended Canvas
        </Badge>
      </div>
    </Card>
  );
}
