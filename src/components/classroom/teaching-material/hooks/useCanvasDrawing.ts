
import { RefObject, useEffect } from "react";
import { AnnotationTool } from "./useAnnotationState";

interface UseCanvasDrawingProps {
  isAnnotationMode: boolean;
  annotationTool: AnnotationTool;
  color: string;
  canvasRef: RefObject<HTMLCanvasElement>;
  isDrawing: boolean;
  lastPosition: { x: number, y: number };
  currentPosition: { x: number, y: number };
}

export function useCanvasDrawing({
  isAnnotationMode,
  annotationTool,
  color,
  canvasRef,
  isDrawing,
  lastPosition,
  currentPosition
}: UseCanvasDrawingProps) {
  
  // Setup canvas and drawing context
  useEffect(() => {
    if (isAnnotationMode && canvasRef.current) {
      const canvas = canvasRef.current;
      const parent = canvas.parentElement;
      
      if (parent) {
        canvas.width = parent.offsetWidth;
        canvas.height = parent.offsetHeight;
      }
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.lineWidth = annotationTool === "pen" ? 3 : annotationTool === "eraser" ? 20 : 2;
      }
    }
  }, [isAnnotationMode, annotationTool, canvasRef]);
  
  // Draw function for pen and eraser tools
  const drawStroke = () => {
    if (!isDrawing || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // For pen and eraser tools
    if (annotationTool === "pen" || annotationTool === "eraser") {
      ctx.beginPath();
      ctx.moveTo(lastPosition.x, lastPosition.y);
      ctx.lineTo(currentPosition.x, currentPosition.y);
      
      if (annotationTool === "pen") {
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
      } else { // eraser
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = 'rgba(0,0,0,1)';
        ctx.lineWidth = 20;
      }
      
      ctx.stroke();
      
      // Reset composite operation after eraser
      if (annotationTool === "eraser") {
        ctx.globalCompositeOperation = 'source-over';
      }
    }
  };
  
  // Draw shapes on mouse release
  const drawShape = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // For shapes, draw only when the mouse is released
    if (annotationTool === "rectangle") {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      const width = currentPosition.x - lastPosition.x;
      const height = currentPosition.y - lastPosition.y;
      ctx.strokeRect(lastPosition.x, lastPosition.y, width, height);
      ctx.stroke();
    } else if (annotationTool === "circle") {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      const radius = Math.sqrt(
        Math.pow(currentPosition.x - lastPosition.x, 2) + 
        Math.pow(currentPosition.y - lastPosition.y, 2)
      );
      ctx.arc(lastPosition.x, lastPosition.y, radius, 0, 2 * Math.PI);
      ctx.stroke();
    }
  };
  
  return {
    drawStroke,
    drawShape
  };
}
