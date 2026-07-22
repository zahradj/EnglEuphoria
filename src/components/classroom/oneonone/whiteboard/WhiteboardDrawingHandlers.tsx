
import React from "react";
import { setupDrawingContext, createDrawEventHandlers } from "./drawingUtils";

interface WhiteboardDrawingHandlersProps {
  activeTool: "pencil" | "eraser" | "text" | "highlighter" | "shape" | "game";
  color: string;
  onGameToolClick: () => void;
}

export function createDrawingHandlers(
  activeTool: WhiteboardDrawingHandlersProps["activeTool"],
  color: string,
  onGameToolClick: () => void
) {
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool === "game") {
      onGameToolClick();
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool === "game") return;
    
    const canvas = e.currentTarget;
    const ctx = setupDrawingContext(canvas, activeTool, color);
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);

    const { draw, stopDrawing } = createDrawEventHandlers(canvas);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
  };

  return {
    handleCanvasClick,
    startDrawing
  };
}
