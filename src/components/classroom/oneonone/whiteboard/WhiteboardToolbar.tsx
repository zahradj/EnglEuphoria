
import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { 
  Pencil, 
  Eraser, 
  Type, 
  Square, 
  Circle, 
  Trash2, 
  Download,
  Upload,
  Highlighter,
  Gamepad2
} from "lucide-react";

interface WhiteboardToolbarProps {
  activeTool: "pencil" | "eraser" | "text" | "highlighter" | "shape" | "game";
  setActiveTool: (tool: "pencil" | "eraser" | "text" | "highlighter" | "shape" | "game") => void;
  activeShape: "rectangle" | "circle";
  color: string;
  setColor: (color: string) => void;
  clearCanvas: () => void;
  isGameDialogOpen: boolean;
  setIsGameDialogOpen: (open: boolean) => void;
  children?: React.ReactNode;
}

export function WhiteboardToolbar({
  activeTool,
  setActiveTool,
  activeShape,
  color,
  setColor,
  clearCanvas,
  isGameDialogOpen,
  setIsGameDialogOpen,
  children
}: WhiteboardToolbarProps) {
  const colors = ["#2563eb", "#16a34a", "#dc2626", "#ca8a04", "#7c3aed", "#000000"];

  return (
    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Button
            variant={activeTool === "pencil" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTool("pencil")}
          >
            <Pencil size={16} />
          </Button>
          
          <Button
            variant={activeTool === "highlighter" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTool("highlighter")}
          >
            <Highlighter size={16} />
          </Button>
          
          <Button
            variant={activeTool === "text" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTool("text")}
          >
            <Type size={16} />
          </Button>
          
          <Button
            variant={activeTool === "shape" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTool("shape")}
          >
            {activeShape === "rectangle" ? <Square size={16} /> : <Circle size={16} />}
          </Button>
          
          <Dialog open={isGameDialogOpen} onOpenChange={setIsGameDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant={activeTool === "game" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTool("game")}
              >
                <Gamepad2 size={16} />
              </Button>
            </DialogTrigger>
            {children}
          </Dialog>
          
          <Button
            variant={activeTool === "eraser" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTool("eraser")}
          >
            <Eraser size={16} />
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={clearCanvas}>
            <Trash2 size={16} />
          </Button>
          <Button variant="outline" size="sm">
            <Upload size={16} />
          </Button>
          <Button variant="outline" size="sm">
            <Download size={16} />
          </Button>
        </div>
      </div>
      
      {/* Color Palette */}
      <div className="flex items-center gap-2">
        {colors.map((c) => (
          <div
            key={c}
            className={`w-6 h-6 rounded-full cursor-pointer border-2 ${
              color === c ? "border-gray-400" : "border-gray-200"
            }`}
            style={{ backgroundColor: c }}
            onClick={() => setColor(c)}
          />
        ))}
      </div>
    </div>
  );
}
