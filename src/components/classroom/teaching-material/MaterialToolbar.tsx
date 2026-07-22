
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { ZoomIn, ZoomOut, Edit3 } from "lucide-react";

interface MaterialToolbarProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  isAnnotationMode: boolean;
  toggleAnnotationMode: () => void;
  allowAnnotation: boolean;
}

export function MaterialToolbar({
  zoom,
  onZoomIn,
  onZoomOut,
  isAnnotationMode,
  toggleAnnotationMode,
  allowAnnotation,
}: MaterialToolbarProps) {
  const { languageText } = useLanguage();

  return (
    <div className="p-2 bg-muted/30 border-b flex items-center justify-between">
      <h3 className="font-medium text-sm">{languageText.lessonMaterial}</h3>
      
      <div className="flex items-center gap-1">
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0"
          onClick={onZoomOut}
          disabled={zoom <= 50}
        >
          <ZoomOut size={14} />
        </Button>
        
        <span className="text-xs w-10 text-center">{zoom}%</span>
        
        <Button 
          variant="ghost" 
          size="sm"
          className="h-8 w-8 p-0"
          onClick={onZoomIn}
          disabled={zoom >= 200}
        >
          <ZoomIn size={14} />
        </Button>
        
        {allowAnnotation && (
          <Button 
            variant={isAnnotationMode ? "default" : "ghost"} 
            size="sm"
            className="text-xs px-2 py-1 h-7"
            onClick={toggleAnnotationMode}
          >
            {isAnnotationMode ? languageText.exitAnnotation : languageText.annotate}
          </Button>
        )}
      </div>
    </div>
  );
}
