
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { PenLine, Eraser, Trash2, Square, Circle, Save, Upload } from "lucide-react";

interface AnnotationToolbarProps {
  annotationTool: "pen" | "eraser" | "rectangle" | "circle";
  setAnnotationTool: (tool: "pen" | "eraser" | "rectangle" | "circle") => void;
  color: string;
  setColor: (color: string) => void;
  onClearAnnotations: () => void;
  onSaveAnnotations: () => void;
  onLoadAnnotations: () => void;
}

export function AnnotationToolbar({
  annotationTool,
  setAnnotationTool,
  color,
  setColor,
  onClearAnnotations,
  onSaveAnnotations,
  onLoadAnnotations,
}: AnnotationToolbarProps) {
  const { languageText } = useLanguage();
  
  return (
    <div className="flex items-center gap-2 p-2 bg-muted/20 border-b flex-wrap">
      <div className="flex items-center gap-2">
        <Button 
          variant={annotationTool === "pen" ? "secondary" : "ghost"} 
          size="sm" 
          onClick={() => setAnnotationTool("pen")}
          className="h-8 px-2"
        >
          <PenLine size={14} className="mr-1" />
          {languageText.draw}
        </Button>
        <Button 
          variant={annotationTool === "rectangle" ? "secondary" : "ghost"} 
          size="sm" 
          onClick={() => setAnnotationTool("rectangle")}
          className="h-8 px-2"
        >
          <Square size={14} className="mr-1" />
          {languageText.shapes}
        </Button>
        <Button 
          variant={annotationTool === "circle" ? "secondary" : "ghost"} 
          size="sm" 
          onClick={() => setAnnotationTool("circle")}
          className="h-8 px-2"
        >
          <Circle size={14} className="mr-1" />
          {languageText.circle || "Circle"}
        </Button>
        <Button 
          variant={annotationTool === "eraser" ? "secondary" : "ghost"} 
          size="sm" 
          onClick={() => setAnnotationTool("eraser")}
          className="h-8 px-2"
        >
          <Eraser size={14} className="mr-1" />
          {languageText.erase}
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClearAnnotations}
          className="h-8 px-2"
        >
          <Trash2 size={14} className="mr-1" />
          {languageText.clear}
        </Button>
      </div>
      
      <div className="flex items-center gap-2 ml-auto">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onSaveAnnotations}
          className="h-8 px-2"
        >
          <Save size={14} className="mr-1" />
          {languageText.save}
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onLoadAnnotations}
          className="h-8 px-2"
        >
          <Upload size={14} className="mr-1" />
          {languageText.upload}
        </Button>
      </div>
      
      <div className="flex items-center gap-1 ml-2">
        {["#9B87F5", "#14B8A6", "#F97316", "#FACC15", "#000000"].map((c) => (
          <div
            key={c}
            className={`w-5 h-5 rounded-full cursor-pointer ${
              color === c ? "ring-2 ring-offset-1 ring-gray-400" : ""
            }`}
            style={{ backgroundColor: c }}
            onClick={() => setColor(c)}
          />
        ))}
      </div>
    </div>
  );
}
