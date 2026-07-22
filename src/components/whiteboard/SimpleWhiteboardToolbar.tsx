
import { Button } from "@/components/ui/button";
import { Pencil, Eraser, Trash2, Download, Image, TextCursor, Square, Circle } from "lucide-react";

interface SimpleWhiteboardToolbarProps {
  tool: "pencil" | "eraser" | "text" | "rectangle" | "circle";
  setTool: (tool: "pencil" | "eraser" | "text" | "rectangle" | "circle") => void;
  color: string;
  setColor: (color: string) => void;
  clearCanvas: () => void;
  downloadCanvas: () => void;
}

export function SimpleWhiteboardToolbar({
  tool,
  setTool,
  color,
  setColor,
  clearCanvas,
  downloadCanvas
}: SimpleWhiteboardToolbarProps) {
  const colors = ["#9B87F5", "#14B8A6", "#F97316", "#FACC15", "#000000"];
  
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button
          variant={tool === "pencil" ? "default" : "outline"}
          size="sm"
          onClick={() => setTool("pencil")}
        >
          <Pencil size={16} className="mr-1" />
          Draw
        </Button>
        
        <Button
          variant={tool === "text" ? "default" : "outline"}
          size="sm"
          onClick={() => setTool("text")}
        >
          <TextCursor size={16} className="mr-1" />
          Text
        </Button>

        <Button
          variant={tool === "rectangle" ? "default" : "outline"}
          size="sm"
          onClick={() => setTool("rectangle")}
        >
          <Square size={16} className="mr-1" />
          Rectangle
        </Button>
        
        <Button
          variant={tool === "circle" ? "default" : "outline"}
          size="sm"
          onClick={() => setTool("circle")}
        >
          <Circle size={16} className="mr-1" />
          Circle
        </Button>
        
        <Button
          variant={tool === "eraser" ? "default" : "outline"}
          size="sm"
          onClick={() => setTool("eraser")}
        >
          <Eraser size={16} className="mr-1" />
          Erase
        </Button>
        
        <div className="flex items-center gap-1 ml-2">
          {colors.map((c) => (
            <div
              key={c}
              className={`w-6 h-6 rounded-full cursor-pointer ${
                color === c && tool !== "eraser" ? "ring-2 ring-offset-2 ring-gray-400" : ""
              }`}
              style={{ backgroundColor: c }}
              onClick={() => {
                setColor(c);
                if (tool === "eraser") setTool("pencil");
              }}
            />
          ))}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={clearCanvas}>
          <Trash2 size={16} className="mr-1" />
          Clear
        </Button>
        
        <Button variant="outline" size="sm" onClick={downloadCanvas}>
          <Download size={16} className="mr-1" />
          Save
        </Button>
        
        <Button variant="outline" size="sm" disabled>
          <Image size={16} className="mr-1" />
          Add Image
        </Button>
      </div>
    </div>
  );
}
