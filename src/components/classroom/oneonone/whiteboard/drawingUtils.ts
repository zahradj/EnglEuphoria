
export const setupDrawingContext = (
  canvas: HTMLCanvasElement,
  activeTool: "pencil" | "eraser" | "text" | "highlighter" | "shape" | "game",
  color: string
) => {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  
  switch (activeTool) {
    case "pencil":
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      break;
    case "eraser":
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 20;
      break;
    case "highlighter":
      ctx.strokeStyle = `${color}80`;
      ctx.lineWidth = 15;
      break;
    default:
      return null;
  }
  
  return ctx;
};

export const createDrawEventHandlers = (canvas: HTMLCanvasElement) => {
  const draw = (e: MouseEvent) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    canvas.removeEventListener('mousemove', draw);
    canvas.removeEventListener('mouseup', stopDrawing);
  };

  return { draw, stopDrawing };
};
