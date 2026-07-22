
import { useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";

interface WhiteboardCanvasProps {
  pageId: string;
  activeTool: "pencil" | "eraser" | "text" | "highlighter" | "shape" | "embed";
  color: string;
  isCollaborative?: boolean;
  canvasRef: (el: HTMLCanvasElement | null) => void;
}

export function WhiteboardCanvas({
  pageId,
  activeTool,
  color,
  isCollaborative = true,
  canvasRef
}: WhiteboardCanvasProps) {
  const { languageText } = useLanguage();
  
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = e.currentTarget;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.beginPath();
    
    // Set drawing styles based on active tool
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    
    switch (activeTool) {
      case "pencil":
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        break;
      case "eraser":
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 20;
        break;
      case "highlighter":
        ctx.strokeStyle = `${color}80`; // Add transparency
        ctx.lineWidth = 15;
        break;
      case "text":
        // Handle text input (in a real app, would open a text input at click position)
        return;
      case "shape":
        // Handle shape drawing (in a real app, would start shape at click position)
        return;
      case "embed":
        // Handle embed link placement - this will be handled by the parent component
        return;
    }
    
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
    
    // Set drawing state
    canvas.setAttribute("data-drawing", "true");
    canvas.setAttribute("data-last-x", posX.toString());
    canvas.setAttribute("data-last-y", posY.toString());
  };
  
  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = e.currentTarget;
    if (!canvas || canvas.getAttribute("data-drawing") !== "true") return;
    
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
    
    const lastX = parseFloat(canvas.getAttribute("data-last-x") || "0");
    const lastY = parseFloat(canvas.getAttribute("data-last-y") || "0");
    
    ctx.lineTo(posX, posY);
    ctx.stroke();
    
    canvas.setAttribute("data-last-x", posX.toString());
    canvas.setAttribute("data-last-y", posY.toString());
  };
  
  const stopDrawing = () => {
    const canvas = document.querySelector(`canvas[data-page-id="${pageId}"]`);
    if (!canvas) return;
    
    canvas.removeAttribute("data-drawing");
  };
  
  return (
    <div className="relative bg-white rounded-lg border overflow-hidden aspect-video">
      <canvas
        ref={canvasRef}
        data-page-id={pageId}
        className="w-full h-full touch-none"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
      
      {isCollaborative && (
        <Badge 
          variant="secondary" 
          className="absolute bottom-2 right-2"
        >
          {languageText.collaborative}
        </Badge>
      )}
    </div>
  );
}
