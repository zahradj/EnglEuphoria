
import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { MaterialToolbar } from "@/components/classroom/teaching-material/MaterialToolbar";
import { AnnotationToolbar } from "@/components/classroom/teaching-material/AnnotationToolbar";
import { AnnotationCanvas } from "@/components/classroom/teaching-material/AnnotationCanvas";
import { PaginationControls } from "@/components/classroom/teaching-material/PaginationControls";
import { MaterialContent } from "@/components/classroom/teaching-material/MaterialContent";

interface TeachingMaterialProps {
  materialType: "pdf" | "image" | "video" | "interactive";
  source: string;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  allowAnnotation?: boolean;
}

export function TeachingMaterial({
  materialType,
  source,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  allowAnnotation = true,
}: TeachingMaterialProps) {
  const [zoom, setZoom] = useState(100);
  const [isAnnotationMode, setIsAnnotationMode] = useState(false);
  const [localCurrentPage, setLocalCurrentPage] = useState(currentPage);
  const [annotationTool, setAnnotationTool] = useState<"pen" | "eraser" | "rectangle" | "circle">("pen");
  const [color, setColor] = useState("#9B87F5"); // Default purple color
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    setLocalCurrentPage(currentPage);
  }, [currentPage]);

  const handleZoomIn = () => {
    if (zoom < 200) setZoom(zoom + 25);
  };

  const handleZoomOut = () => {
    if (zoom > 50) setZoom(zoom - 25);
  };

  const handlePrevPage = () => {
    if (localCurrentPage > 1) {
      const newPage = localCurrentPage - 1;
      setLocalCurrentPage(newPage);
      if (onPageChange) {
        onPageChange(newPage);
      }
    }
  };

  const handleNextPage = () => {
    if (localCurrentPage < totalPages) {
      const newPage = localCurrentPage + 1;
      setLocalCurrentPage(newPage);
      if (onPageChange) {
        onPageChange(newPage);
      }
    }
  };

  const toggleAnnotationMode = () => {
    setIsAnnotationMode(!isAnnotationMode);
  };

  // Use our enhanced annotation canvas component
  const { canvasElement, clearCanvas, saveAnnotations, loadAnnotations } = AnnotationCanvas({
    isAnnotationMode,
    annotationTool,
    color,
    currentPage: localCurrentPage,
    totalPages
  });

  return (
    <div className="flex flex-col h-full w-full bg-white rounded-lg shadow-sm border">
      <MaterialToolbar 
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        isAnnotationMode={isAnnotationMode}
        toggleAnnotationMode={toggleAnnotationMode}
        allowAnnotation={allowAnnotation}
      />

      {isAnnotationMode && (
        <AnnotationToolbar 
          annotationTool={annotationTool}
          setAnnotationTool={setAnnotationTool}
          color={color}
          setColor={setColor}
          onClearAnnotations={clearCanvas}
          onSaveAnnotations={saveAnnotations}
          onLoadAnnotations={loadAnnotations}
        />
      )}

      <div className="flex-1 relative overflow-auto bg-muted/20">
        <div 
          className="min-h-full flex items-center justify-center p-2 relative"
          style={{ transform: `scale(${zoom / 100})` }}
          ref={canvasContainerRef}
        >
          <MaterialContent 
            materialType={materialType}
            source={source}
            currentPage={localCurrentPage}
          />
          
          {isAnnotationMode && canvasElement}
        </div>
      </div>

      <PaginationControls 
        currentPage={localCurrentPage}
        totalPages={totalPages}
        onPrevPage={handlePrevPage}
        onNextPage={handleNextPage}
      />
    </div>
  );
}
