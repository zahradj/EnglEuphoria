
import { useRef, useEffect } from "react";
import { useAnnotationState } from "./hooks/useAnnotationState";
import { useCanvasDrawing } from "./hooks/useCanvasDrawing";

interface AnnotationCanvasProps {
  isAnnotationMode: boolean;
  annotationTool: "pen" | "eraser" | "rectangle" | "circle";
  color: string;
  currentPage: number;
  totalPages: number;
}

export function AnnotationCanvas({ 
  isAnnotationMode, 
  annotationTool, 
  color,
  currentPage,
  totalPages 
}: AnnotationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  const {
    isDrawing,
    setIsDrawing,
    lastPosition,
    setLastPosition,
    currentPosition,
    setCurrentPosition,
    annotations,
    clearCanvas: clearCanvasState,
    saveCurrentAnnotation,
    loadPageAnnotation,
    saveAnnotations: saveAnnotationsToStorage,
    loadAnnotations: loadAnnotationsFromStorage
  } = useAnnotationState({ currentPage, totalPages });
  
  const { drawStroke, drawShape } = useCanvasDrawing({
    isAnnotationMode,
    annotationTool,
    color,
    canvasRef,
    isDrawing,
    lastPosition,
    currentPosition
  });

  // Load annotations when page changes
  useEffect(() => {
    if (isAnnotationMode && canvasRef.current) {
      // Load annotations for current page if they exist
      if (annotations[currentPage]) {
        loadPageAnnotation(canvasRef.current, currentPage);
      } else {
        clearCanvasState(canvasRef.current);
      }
    }
  }, [currentPage, isAnnotationMode]);
  
  // Process stroke drawing during mouse/touch movement
  useEffect(() => {
    if (isDrawing && (annotationTool === "pen" || annotationTool === "eraser")) {
      drawStroke();
    }
  }, [isDrawing, currentPosition, annotationTool]);

  // Event Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isAnnotationMode || !canvasRef.current) return;
    
    setIsDrawing(true);
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    let posX, posY;
    if ('touches' in e) {
      posX = e.touches[0].clientX - rect.left;
      posY = e.touches[0].clientY - rect.top;
    } else {
      posX = e.nativeEvent.offsetX;
      posY = e.nativeEvent.offsetY;
    }
    
    setLastPosition({ x: posX, y: posY });
    setCurrentPosition({ x: posX, y: posY });
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isAnnotationMode || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    let currentX, currentY;
    if ('touches' in e) {
      currentX = e.touches[0].clientX - rect.left;
      currentY = e.touches[0].clientY - rect.top;
    } else {
      currentX = e.nativeEvent.offsetX;
      currentY = e.nativeEvent.offsetY;
    }

    setCurrentPosition({ x: currentX, y: currentY });
    
    if (annotationTool === "pen" || annotationTool === "eraser") {
      setLastPosition({ x: currentX, y: currentY });
    }
  };

  const stopDrawing = () => {
    if (!isDrawing || !canvasRef.current) {
      setIsDrawing(false);
      return;
    }
    
    // For shapes, draw only when the mouse is released
    if (annotationTool === "rectangle" || annotationTool === "circle") {
      drawShape();
    }
    
    // Save annotations for the current page
    saveCurrentAnnotation(canvasRef.current);
    setIsDrawing(false);
  };

  // Public functions for the component
  const clearCanvas = () => {
    clearCanvasState(canvasRef.current);
  };
  
  const saveAnnotations = () => {
    saveAnnotationsToStorage();
  };
  
  const loadAnnotations = () => {
    loadAnnotationsFromStorage(canvasRef.current);
  };

  return {
    canvasElement: (
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full z-10 touch-none"
        style={{ pointerEvents: 'all' }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
    ),
    clearCanvas,
    saveAnnotations,
    loadAnnotations
  };
}
