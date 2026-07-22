import { GlassButton } from "@/components/ui/glass-button";
import { GlassCard } from "@/components/ui/glass-card";
import {
  Pencil,
  Highlighter,
  Eraser,
  Type,
  Square,
  Circle,
  Minus,
  MoveUpRight,
  StickyNote,
  Pointer,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Download,
  Trash2,
  Triangle
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export type WhiteboardTool =
  | "pencil"
  | "highlighter"
  | "eraser"
  | "text"
  | "line"
  | "arrow"
  | "rectangle"
  | "circle"
  | "triangle"
  | "sticky-note"
  | "laser-pointer";

interface EnhancedWhiteboardToolbarProps {
  activeTool: WhiteboardTool;
  onToolChange: (tool: WhiteboardTool) => void;
  color: string;
  onColorChange: (color: string) => void;
  brushSize: number;
  onBrushSizeChange: (size: number) => void;
  opacity: number;
  onOpacityChange: (opacity: number) => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onClear: () => void;
  onDownload: () => void;
}

const PRESET_COLORS = [
  "#000000", // Black
  "#EF4444", // Red
  "#3B82F6", // Blue
  "#22C55E", // Green
  "#F59E0B", // Orange
  "#8B5CF6", // Purple
];

const ZOOM_LEVELS = [25, 50, 100, 150, 200];

export function EnhancedWhiteboardToolbar({
  activeTool,
  onToolChange,
  color,
  onColorChange,
  brushSize,
  onBrushSizeChange,
  opacity,
  onOpacityChange,
  zoom,
  onZoomChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onClear,
  onDownload
}: EnhancedWhiteboardToolbarProps) {
  const tools = [
    { id: "pencil" as const, icon: Pencil, label: "Pencil", shortcut: "P" },
    { id: "highlighter" as const, icon: Highlighter, label: "Highlighter", shortcut: "H" },
    { id: "eraser" as const, icon: Eraser, label: "Eraser", shortcut: "E" },
    { id: "text" as const, icon: Type, label: "Text", shortcut: "T" },
  ];

  const shapeTools = [
    { id: "line" as const, icon: Minus, label: "Line", shortcut: "L" },
    { id: "arrow" as const, icon: MoveUpRight, label: "Arrow", shortcut: "A" },
    { id: "rectangle" as const, icon: Square, label: "Rectangle", shortcut: "R" },
    { id: "circle" as const, icon: Circle, label: "Circle", shortcut: "C" },
    { id: "triangle" as const, icon: Triangle, label: "Triangle", shortcut: "Shift+T" },
  ];

  const annotationTools = [
    { id: "sticky-note" as const, icon: StickyNote, label: "Sticky Note", shortcut: "N" },
    { id: "laser-pointer" as const, icon: Pointer, label: "Laser Pointer", shortcut: "Shift+L" },
  ];

  return (
    <GlassCard className="p-3">
      <div className="flex flex-wrap items-center gap-3">
        {/* Tool Group 1: Drawing */}
        <div className="flex gap-1">
          {tools.map((tool) => (
            <GlassButton
              key={tool.id}
              variant={activeTool === tool.id ? "primary" : "default"}
              size="sm"
              onClick={() => onToolChange(tool.id)}
              title={`${tool.label} (${tool.shortcut})`}
              className={activeTool === tool.id ? "shadow-glow" : ""}
            >
              <tool.icon className="w-4 h-4" />
            </GlassButton>
          ))}
        </div>

        <Separator orientation="vertical" className="h-8" />

        {/* Tool Group 2: Shapes */}
        <div className="flex gap-1">
          {shapeTools.map((tool) => (
            <GlassButton
              key={tool.id}
              variant={activeTool === tool.id ? "primary" : "default"}
              size="sm"
              onClick={() => onToolChange(tool.id)}
              title={`${tool.label} (${tool.shortcut})`}
              className={activeTool === tool.id ? "shadow-glow" : ""}
            >
              <tool.icon className="w-4 h-4" />
            </GlassButton>
          ))}
        </div>

        <Separator orientation="vertical" className="h-8" />

        {/* Tool Group 3: Annotations */}
        <div className="flex gap-1">
          {annotationTools.map((tool) => (
            <GlassButton
              key={tool.id}
              variant={activeTool === tool.id ? "primary" : "default"}
              size="sm"
              onClick={() => onToolChange(tool.id)}
              title={`${tool.label} (${tool.shortcut})`}
              className={activeTool === tool.id ? "shadow-glow" : ""}
            >
              <tool.icon className="w-4 h-4" />
            </GlassButton>
          ))}
        </div>

        <Separator orientation="vertical" className="h-8" />

        {/* Tool Group 4: Controls */}
        <div className="flex gap-1">
          <GlassButton
            variant="default"
            size="sm"
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </GlassButton>
          <GlassButton
            variant="default"
            size="sm"
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </GlassButton>
        </div>

        <Separator orientation="vertical" className="h-8" />

        {/* Color Picker */}
        <Popover>
          <PopoverTrigger asChild>
            <GlassButton variant="default" size="sm" className="gap-2">
              <div
                className="w-5 h-5 rounded border-2 border-white/20"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs">Color</span>
            </GlassButton>
          </PopoverTrigger>
          <PopoverContent className="w-auto glass p-3">
            <div className="space-y-3">
              <div className="flex gap-2">
                {PRESET_COLORS.map((presetColor) => (
                  <button
                    key={presetColor}
                    onClick={() => onColorChange(presetColor)}
                    className={`w-8 h-8 rounded border-2 transition-all hover:scale-110 ${
                      color === presetColor ? "border-classroom-primary scale-110" : "border-white/20"
                    }`}
                    style={{ backgroundColor: presetColor }}
                  />
                ))}
              </div>
              <div className="flex gap-2 items-center">
                <Input
                  type="color"
                  value={color}
                  onChange={(e) => onColorChange(e.target.value)}
                  className="w-16 h-8 p-0 border-0"
                />
                <Input
                  type="text"
                  value={color}
                  onChange={(e) => onColorChange(e.target.value)}
                  className="flex-1 text-xs"
                  placeholder="#000000"
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Brush Size */}
        <Popover>
          <PopoverTrigger asChild>
            <GlassButton variant="default" size="sm" className="gap-2">
              <div
                className="rounded-full bg-foreground"
                style={{ width: Math.min(brushSize, 16), height: Math.min(brushSize, 16) }}
              />
              <span className="text-xs">Size: {brushSize}px</span>
            </GlassButton>
          </PopoverTrigger>
          <PopoverContent className="w-64 glass p-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium">Brush Size</label>
                <Slider
                  value={[brushSize]}
                  onValueChange={([value]) => onBrushSizeChange(value)}
                  min={1}
                  max={20}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="flex gap-2">
                <GlassButton size="sm" variant="default" onClick={() => onBrushSizeChange(2)}>
                  Thin (2px)
                </GlassButton>
                <GlassButton size="sm" variant="default" onClick={() => onBrushSizeChange(6)}>
                  Medium (6px)
                </GlassButton>
                <GlassButton size="sm" variant="default" onClick={() => onBrushSizeChange(12)}>
                  Thick (12px)
                </GlassButton>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Opacity (for highlighter) */}
        {activeTool === "highlighter" && (
          <Popover>
            <PopoverTrigger asChild>
              <GlassButton variant="default" size="sm" className="gap-2">
                <span className="text-xs">Opacity: {Math.round(opacity * 100)}%</span>
              </GlassButton>
            </PopoverTrigger>
            <PopoverContent className="w-64 glass p-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium">Opacity</label>
                  <Slider
                    value={[opacity * 100]}
                    onValueChange={([value]) => onOpacityChange(value / 100)}
                    min={10}
                    max={100}
                    step={10}
                    className="w-full"
                  />
                </div>
                <div className="flex gap-2">
                  <GlassButton size="sm" variant="default" onClick={() => onOpacityChange(0.3)}>
                    Light (30%)
                  </GlassButton>
                  <GlassButton size="sm" variant="default" onClick={() => onOpacityChange(0.5)}>
                    Medium (50%)
                  </GlassButton>
                  <GlassButton size="sm" variant="default" onClick={() => onOpacityChange(1)}>
                    Solid (100%)
                  </GlassButton>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}

        {/* Zoom Controls */}
          <Popover>
            <PopoverTrigger asChild>
              <GlassButton variant="default" size="sm" className="gap-2">
                <span className="text-xs">Zoom: {zoom}%</span>
              </GlassButton>
            </PopoverTrigger>
          <PopoverContent className="w-auto glass p-3">
            <div className="flex gap-2">
              {ZOOM_LEVELS.map((level) => (
                <GlassButton
                  key={level}
                  size="sm"
                  variant={zoom === level ? "primary" : "default"}
                  onClick={() => onZoomChange(level)}
                >
                  {level}%
                </GlassButton>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <Separator orientation="vertical" className="h-8" />

        {/* Actions */}
        <div className="flex gap-1">
          <GlassButton
            variant="default"
            size="sm"
            onClick={onDownload}
            title="Download"
          >
            <Download className="w-4 h-4" />
          </GlassButton>
          <GlassButton
            variant="default"
            size="sm"
            onClick={onClear}
            title="Clear Canvas"
          >
            <Trash2 className="w-4 h-4" />
          </GlassButton>
        </div>
      </div>
    </GlassCard>
  );
}
