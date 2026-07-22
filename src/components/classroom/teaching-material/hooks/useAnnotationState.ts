import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "@/components/ui/sonner";

export type AnnotationTool = "pen" | "eraser" | "rectangle" | "circle";

export interface UseAnnotationStateProps {
  currentPage: number;
  totalPages: number;
}

export function useAnnotationState({ currentPage, totalPages }: UseAnnotationStateProps) {
  const { languageText } = useLanguage();
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });
  const [currentPosition, setCurrentPosition] = useState({ x: 0, y: 0 });
  // Keep annotations for each page
  const [annotations, setAnnotations] = useState<Record<number, string>>({});
  
  const clearCanvas = (canvas: HTMLCanvasElement | null) => {
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Remove annotations for the current page
      const updatedAnnotations = { ...annotations };
      delete updatedAnnotations[currentPage];
      setAnnotations(updatedAnnotations);
    }
  };
  
  const saveCurrentAnnotation = (canvas: HTMLCanvasElement | null) => {
    if (!canvas) return;
    
    const dataUrl = canvas.toDataURL();
    setAnnotations(prev => ({
      ...prev,
      [currentPage]: dataUrl
    }));
  };
  
  const loadPageAnnotation = (canvas: HTMLCanvasElement | null, page: number) => {
    if (!canvas || !annotations[page]) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = annotations[page];
  };
  
  const saveAnnotations = () => {
    try {
      // Save all annotations to local storage
      localStorage.setItem('esl-classroom-annotations', JSON.stringify(annotations));
      toast(languageText.annotationsSaved || "Annotations saved successfully!");
    } catch (e) {
      toast.error(languageText.errorSavingAnnotations || "Error saving annotations");
      console.error("Error saving annotations:", e);
    }
  };
  
  const loadAnnotations = (canvas: HTMLCanvasElement | null) => {
    try {
      // Load annotations from local storage
      const savedAnnotations = localStorage.getItem('esl-classroom-annotations');
      if (savedAnnotations) {
        const parsedAnnotations = JSON.parse(savedAnnotations);
        setAnnotations(parsedAnnotations);
        
        // Load current page annotation if it exists
        if (parsedAnnotations[currentPage]) {
          loadPageAnnotation(canvas, currentPage);
        }
        
        toast(languageText.annotationsLoaded || "Annotations loaded successfully!");
      } else {
        toast.info(languageText.noSavedAnnotations || "No saved annotations found");
      }
    } catch (e) {
      toast.error(languageText.errorLoadingAnnotations || "Error loading annotations");
      console.error("Error loading annotations:", e);
    }
  };
  
  return {
    isDrawing,
    setIsDrawing,
    lastPosition,
    setLastPosition,
    currentPosition,
    setCurrentPosition,
    annotations,
    clearCanvas,
    saveCurrentAnnotation,
    loadPageAnnotation,
    saveAnnotations,
    loadAnnotations
  };
}
