import { EnhancedWhiteboardToolbar } from "./EnhancedWhiteboardToolbar";
import { useEnhancedWhiteboard } from "@/hooks/classroom/useEnhancedWhiteboard";

export function EnhancedWhiteboard() {
  const {
    canvasRef,
    activeTool,
    setActiveTool,
    color,
    setColor,
    brushSize,
    setBrushSize,
    opacity,
    setOpacity,
    zoom,
    setZoom,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    clearCanvas,
    downloadCanvas,
    undo,
    redo,
    canUndo,
    canRedo
  } = useEnhancedWhiteboard();

  return (
    <div className="h-full flex flex-col gap-3">
      <EnhancedWhiteboardToolbar
        activeTool={activeTool}
        onToolChange={setActiveTool}
        color={color}
        onColorChange={setColor}
        brushSize={brushSize}
        onBrushSizeChange={setBrushSize}
        opacity={opacity}
        onOpacityChange={setOpacity}
        zoom={zoom}
        onZoomChange={setZoom}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        onClear={clearCanvas}
        onDownload={downloadCanvas}
      />

      <div className="flex-1 relative overflow-auto min-h-[400px] rounded-xl">
        <div
          className="w-full h-full min-h-[400px]"
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: "top left",
            width: `${10000 / zoom}%`,
            height: `${10000 / zoom}%`,
          }}
        >
          <canvas
            ref={canvasRef}
            className="w-full h-full cursor-crosshair bg-white rounded-xl shadow-soft block"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
        </div>
      </div>
    </div>
  );
}
