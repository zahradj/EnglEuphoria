
import React from "react";
import { Textarea } from "@/components/ui/textarea";

interface SimpleWhiteboardCanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  isDrawing: boolean;
  setIsDrawing: (isDrawing: boolean) => void;
  tool: "pencil" | "eraser" | "text" | "rectangle" | "circle";
  color: string;
  handleCanvasClick?: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  isAddingText?: boolean;
  textPosition?: { x: number; y: number };
  textContent?: string;
  setTextContent?: (text: string) => void;
  textInputRef?: React.RefObject<HTMLTextAreaElement>;
  addTextToCanvas?: () => void;
  handleMouseDown?: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  handleMouseMove?: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  handleMouseUp?: () => void;
}

export function SimpleWhiteboardCanvas({
  canvasRef,
  isDrawing,
  setIsDrawing,
  tool,
  color,
  handleCanvasClick,
  isAddingText = false,
  textPosition = { x: 0, y: 0 },
  textContent = "",
  setTextContent = () => {},
  textInputRef,
  addTextToCanvas = () => {},
  handleMouseDown,
  handleMouseMove,
  handleMouseUp
}: SimpleWhiteboardCanvasProps) {
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (tool === "text" || tool === "rectangle" || tool === "circle") return; // Don't start drawing if text or shape tool is selected
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    setIsDrawing(true);
    
    // Set drawing styles
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = tool === "eraser" ? "#ffffff" : color;
    ctx.lineWidth = tool === "eraser" ? 20 : 5;
    
    // Get position
    let posX, posY;
    if ("touches" in e) {
      // Touch event
      const rect = canvas.getBoundingClientRect();
      posX = e.touches[0].clientX - rect.left;
      posY = e.touches[0].clientY - rect.top;
    } else {
      // Mouse event
      posX = e.nativeEvent.offsetX;
      posY = e.nativeEvent.offsetY;
    }
    
    ctx.beginPath();
    ctx.moveTo(posX, posY);
  };
  
  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || tool === "text" || tool === "rectangle" || tool === "circle") return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Get position
    let posX, posY;
    if ("touches" in e) {
      // Touch event
      const rect = canvas.getBoundingClientRect();
      posX = e.touches[0].clientX - rect.left;
      posY = e.touches[0].clientY - rect.top;
    } else {
      // Mouse event
      posX = e.nativeEvent.offsetX;
      posY = e.nativeEvent.offsetY;
    }
    
    ctx.lineTo(posX, posY);
    ctx.stroke();
  };
  
  const stopDrawing = () => {
    setIsDrawing(false);
    if (handleMouseUp) {
      handleMouseUp();
    }
  };
  
  return (
    <div className="relative border rounded-lg overflow-hidden bg-white">
      <canvas
        ref={canvasRef}
        className="w-full h-[400px] touch-none"
        onMouseDown={(e) => {
          if (tool === "text") {
            handleCanvasClick?.(e);
          } else if (tool === "rectangle" || tool === "circle") {
            handleMouseDown?.(e);
          } else {
            startDrawing(e);
          }
        }}
        onMouseMove={(e) => {
          if (tool === "rectangle" || tool === "circle") {
            handleMouseMove?.(e);
          } else {
            draw(e);
          }
        }}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
      
      {isAddingText && (
        <div
          className="absolute"
          style={{
            left: `${textPosition.x}px`,
            top: `${textPosition.y - 20}px`,
          }}
        >
          <Textarea
            ref={textInputRef}
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            className="bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0 min-h-[20px] resize-none"
            placeholder="Type here..."
            onBlur={addTextToCanvas}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                addTextToCanvas();
              }
            }}
          />
        </div>
      )}
    </div>
  );
}
