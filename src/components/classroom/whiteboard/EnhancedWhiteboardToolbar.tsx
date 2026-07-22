
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { SoundButton } from "@/components/ui/sound-button";
import { 
  Pencil, 
  Eraser, 
  Type, 
  Square, 
  Circle, 
  Trash2, 
  Download,
  Highlighter,
  Move,
  Link,
  Palette
} from "lucide-react";

interface EmbeddedContent {
  id: string;
  title: string;
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface EnhancedWhiteboardToolbarProps {
  activeTool: "pencil" | "eraser" | "text" | "highlighter" | "shape" | "move";
  setActiveTool: (tool: "pencil" | "eraser" | "text" | "highlighter" | "shape" | "move") => void;
  activeShape: "rectangle" | "circle";
  setActiveShape: (shape: "rectangle" | "circle") => void;
  color: string;
  setColor: (color: string) => void;
  strokeWidth: number;
  setStrokeWidth: (width: number) => void;
  onAddEmbeddedContent?: (content: Omit<EmbeddedContent, 'id'>) => void;
}

export function EnhancedWhiteboardToolbar({
  activeTool,
  setActiveTool,
  activeShape,
  setActiveShape,
  color,
  setColor,
  strokeWidth,
  setStrokeWidth,
  onAddEmbeddedContent
}: EnhancedWhiteboardToolbarProps) {
  const [isEmbedDialogOpen, setIsEmbedDialogOpen] = useState(false);
  const [embedUrl, setEmbedUrl] = useState("");
  const [embedTitle, setEmbedTitle] = useState("");

  const colors = [
    "#9B87F5", "#14B8A6", "#F97316", "#FACC15", "#000000", 
    "#EF4444", "#3B82F6", "#10B981", "#8B5CF6", "#F59E0B"
  ];

  const handleEmbedLink = () => {
    if (!embedTitle.trim() || !embedUrl.trim()) return;
    
    let processedUrl = embedUrl.trim();
    if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
      processedUrl = `https://${processedUrl}`;
    }
    
    // Process YouTube URLs to embed format
    if (processedUrl.includes('youtube.com/watch?v=')) {
      const videoId = new URL(processedUrl).searchParams.get('v');
      if (videoId) {
        processedUrl = `https://www.youtube.com/embed/${videoId}`;
      }
    } else if (processedUrl.includes('youtu.be/')) {
      const videoId = processedUrl.split('youtu.be/')[1]?.split('?')[0];
      if (videoId) {
        processedUrl = `https://www.youtube.com/embed/${videoId}`;
      }
    }
    
    const newContent = {
      title: embedTitle,
      url: processedUrl,
      x: 50,
      y: 50,
      width: 1000,
      height: 700
    };
    
    if (onAddEmbeddedContent) {
      onAddEmbeddedContent(newContent);
    }
    
    setEmbedTitle("");
    setEmbedUrl("");
    setIsEmbedDialogOpen(false);
  };

  const clearCanvas = () => {
  };

  const downloadCanvas = () => {
  };

  return (
    <>
      <div className="bg-white border rounded-lg shadow-sm">
        <div className="p-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Button
                variant={activeTool === "pencil" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTool("pencil")}
                className="h-7 w-7 p-0"
              >
                <Pencil size={12} />
              </Button>
              
              <Button
                variant={activeTool === "highlighter" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTool("highlighter")}
                className="h-7 w-7 p-0"
              >
                <Highlighter size={12} />
              </Button>
              
              <Button
                variant={activeTool === "text" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTool("text")}
                className="h-7 w-7 p-0"
              >
                <Type size={12} />
              </Button>
              
              <Button
                variant={activeTool === "shape" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTool("shape")}
                className="h-7 w-7 p-0"
              >
                {activeShape === "rectangle" ? <Square size={12} /> : <Circle size={12} />}
              </Button>
              
              <Button
                variant={activeTool === "move" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTool("move")}
                className="h-7 w-7 p-0"
              >
                <Move size={12} />
              </Button>
              
              <Button
                variant={activeTool === "eraser" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTool("eraser")}
                className="h-7 w-7 p-0"
              >
                <Eraser size={12} />
              </Button>
              
              <Separator orientation="vertical" className="h-6 mx-1" />
              
              <div className="flex items-center gap-1">
                <Palette size={12} className="text-gray-600" />
                {colors.slice(0, 5).map((c) => (
                  <div
                    key={c}
                    className={`w-5 h-5 rounded-full cursor-pointer border transition-all hover:scale-110 ${
                      color === c ? "border-gray-400 scale-110" : "border-gray-200"
                    }`}
                    style={{ backgroundColor: c }}
                    onClick={() => setColor(c)}
                  />
                ))}
              </div>
              
              <Separator orientation="vertical" className="h-6 mx-1" />
              
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-600">Size:</span>
                <div className="w-16">
                  <Slider
                    value={[strokeWidth]}
                    onValueChange={(value) => setStrokeWidth(value[0])}
                    max={10}
                    min={1}
                    step={1}
                    className="cursor-pointer"
                  />
                </div>
                <Badge variant="outline" className="text-xs min-w-[25px] text-center px-1 py-0 h-5">
                  {strokeWidth}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEmbedDialogOpen(true)}
                className="h-7 w-7 p-0 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
              >
                <Link size={12} />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={clearCanvas}
                className="h-7 w-7 p-0 hover:bg-red-50 hover:border-red-200"
              >
                <Trash2 size={12} />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={downloadCanvas}
                className="h-7 w-7 p-0"
              >
                <Download size={12} />
              </Button>
            </div>
          </div>

          {activeTool === "shape" && (
            <div className="flex items-center gap-1 mt-1 pt-1 border-t">
              <span className="text-xs text-gray-600">Shape:</span>
              <div className="flex gap-1">
                <Button
                  variant={activeShape === "rectangle" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveShape("rectangle")}
                  className="h-6 px-2 text-xs"
                >
                  <Square size={10} className="mr-1" />
                  Rectangle
                </Button>
                <Button
                  variant={activeShape === "circle" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveShape("circle")}
                  className="h-6 px-2 text-xs"
                >
                  <Circle size={10} className="mr-1" />
                  Circle
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Dialog open={isEmbedDialogOpen} onOpenChange={setIsEmbedDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link size={20} />
              Embed Content to Whiteboard
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="embedTitle">Content Title</Label>
              <Input
                id="embedTitle"
                value={embedTitle}
                onChange={(e) => setEmbedTitle(e.target.value)}
                placeholder="Enter a title for this content..."
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="embedUrl">URL</Label>
              <Input
                id="embedUrl"
                value={embedUrl}
                onChange={(e) => setEmbedUrl(e.target.value)}
                placeholder="Paste URL (YouTube, Google Docs, etc.)..."
                className="mt-1"
                onKeyDown={(e) => e.key === 'Enter' && handleEmbedLink()}
              />
              <p className="text-xs text-gray-500 mt-1">
                Content will be scaled to fit the large whiteboard (1000×700px default)
              </p>
            </div>
            
            <div className="flex justify-end gap-2 pt-2">
              <SoundButton variant="outline" onClick={() => setIsEmbedDialogOpen(false)}>
                Cancel
              </SoundButton>
              <SoundButton 
                onClick={handleEmbedLink}
                disabled={!embedUrl.trim() || !embedTitle.trim()}
                soundType="success"
                className="bg-blue-600 hover:bg-blue-700"
              >
                Embed Content
              </SoundButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
