
import React, { useRef, useEffect } from "react";

interface WhiteboardCanvasProps {
  activeTool: "pencil" | "eraser" | "text" | "highlighter" | "shape" | "game";
  color: string;
  onCanvasClick: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onStartDrawing: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  children?: React.ReactNode;
}

export function WhiteboardCanvas({ 
  activeTool, 
  color, 
  onCanvasClick, 
  onStartDrawing,
  children 
}: WhiteboardCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Make canvas responsive to container size
  useEffect(() => {
    const updateCanvasSize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      
      if (canvas && container) {
        const containerRect = container.getBoundingClientRect();
        canvas.width = containerRect.width;
        canvas.height = containerRect.height;
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="bg-white rounded-lg border h-full relative whiteboard-container overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-crosshair absolute inset-0"
        onMouseDown={onStartDrawing}
        onClick={onCanvasClick}
      />
      
      {children}
      
      <div className="absolute bottom-2 right-2 bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs z-20">
        Collaborative Mode
      </div>
    </div>
  );
}
