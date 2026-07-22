
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  Pencil, 
  Eraser, 
  Trash2, 
  Download, 
  Image, 
  TextCursor, 
  Square, 
  Circle as CircleIcon, 
  Highlighter,
  Link
} from "lucide-react";

interface WhiteboardToolbarProps {
  activeTool: "pencil" | "eraser" | "text" | "highlighter" | "shape" | "embed";
  setActiveTool: (tool: "pencil" | "eraser" | "text" | "highlighter" | "shape" | "embed") => void;
  activeShape: "rectangle" | "circle";
  color: string;
  setColor: (color: string) => void;
  clearCanvas: () => void;
  downloadCanvas: () => void;
  onEmbedLink?: () => void;
}

export function WhiteboardToolbar({
  activeTool,
  setActiveTool,
  activeShape,
  color,
  setColor,
  clearCanvas,
  downloadCanvas,
  onEmbedLink
}: WhiteboardToolbarProps) {
  const { languageText } = useLanguage();
  const colors = ["#9B87F5", "#14B8A6", "#F97316", "#FACC15", "#000000"];
  
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
      <div className="flex items-center gap-1">
        <Button
          variant={activeTool === "pencil" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTool("pencil")}
        >
          <Pencil size={16} className="mr-1" />
          {languageText.draw}
        </Button>
        
        <Button
          variant={activeTool === "highlighter" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTool("highlighter")}
        >
          <Highlighter size={16} className="mr-1" />
          {languageText.highlight}
        </Button>
        
        <Button
          variant={activeTool === "text" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTool("text")}
        >
          <TextCursor size={16} className="mr-1" />
          {languageText.text}
        </Button>
        
        <Button
          variant={activeTool === "shape" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTool("shape")}
        >
          {activeShape === "rectangle" ? 
            <Square size={16} className="mr-1" /> : 
            <CircleIcon size={16} className="mr-1" />
          }
          {languageText.shapes}
        </Button>
        
        <Button
          variant={activeTool === "embed" ? "default" : "outline"}
          size="sm"
          onClick={() => {
            setActiveTool("embed");
            onEmbedLink?.();
          }}
        >
          <Link size={16} className="mr-1" />
          Embed Link
        </Button>
        
        <Button
          variant={activeTool === "eraser" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTool("eraser")}
        >
          <Eraser size={16} className="mr-1" />
          {languageText.erase}
        </Button>
      </div>
      
      <div className="flex items-center gap-1">
        {colors.map((c) => (
          <div
            key={c}
            className={`w-6 h-6 rounded-full cursor-pointer ${
              color === c && activeTool !== "eraser" ? "ring-2 ring-offset-2 ring-gray-400" : ""
            }`}
            style={{ backgroundColor: c }}
            onClick={() => {
              setColor(c);
              if (activeTool === "eraser") setActiveTool("pencil");
            }}
          />
        ))}
      </div>
      
      <div className="flex items-center gap-1">
        <Button variant="outline" size="sm" onClick={clearCanvas}>
          <Trash2 size={16} className="mr-1" />
          {languageText.clear}
        </Button>
        
        <Button variant="outline" size="sm" onClick={downloadCanvas}>
          <Download size={16} className="mr-1" />
          {languageText.save}
        </Button>
        
        <Button variant="outline" size="sm" disabled>
          <Image size={16} className="mr-1" />
          {languageText.addImage}
        </Button>
      </div>
    </div>
  );
}
