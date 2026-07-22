
import { useState, useRef, useEffect } from "react";

export function useSimpleWhiteboard() {
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<"pencil" | "eraser" | "text" | "rectangle" | "circle">("pencil");
  const [color, setColor] = useState("#9B87F5"); // Default purple color
  const [textContent, setTextContent] = useState("");
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });
  const [isAddingText, setIsAddingText] = useState(false);
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textInputRef = useRef<HTMLTextAreaElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Set canvas size
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    
    // Fill with white background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Handle resize
    const handleResize = () => {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.putImageData(imageData, 0, 0);
    };
    
    window.addEventListener("resize", handleResize);
    
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    // When text tool is selected, change cursor to text
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    if (tool === "text") {
      canvas.style.cursor = "text";
    } else if (tool === "rectangle" || tool === "circle") {
      canvas.style.cursor = "crosshair";
    } else {
      canvas.style.cursor = "default";
    }
  }, [tool]);

  useEffect(() => {
    // Focus text input when adding text
    if (isAddingText && textInputRef.current) {
      textInputRef.current.focus();
    }
  }, [isAddingText]);
  
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };
  
  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dataURL = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = "engleuphoria-drawing.png";
    link.href = dataURL;
    link.click();
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool === "text") {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      setTextPosition({ x, y });
      setIsAddingText(true);
      setTextContent("");
    }
  };

  const addTextToCanvas = () => {
    if (!textContent.trim()) {
      setIsAddingText(false);
      return;
    }
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.font = "16px Arial";
    ctx.fillStyle = color;
    ctx.fillText(textContent, textPosition.x, textPosition.y);
    
    setIsAddingText(false);
    setTextContent("");
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    if (tool === "rectangle" || tool === "circle") {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      setStartPosition({ x, y });
      setIsDrawing(true);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !(tool === "rectangle" || tool === "circle")) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    
    // Clear the canvas and redraw
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.putImageData(imageData, 0, 0);
    
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    
    if (tool === "rectangle") {
      ctx.beginPath();
      ctx.rect(
        startPosition.x,
        startPosition.y,
        currentX - startPosition.x,
        currentY - startPosition.y
      );
      ctx.stroke();
    } else if (tool === "circle") {
      const radius = Math.sqrt(
        Math.pow(currentX - startPosition.x, 2) + Math.pow(currentY - startPosition.y, 2)
      );
      ctx.beginPath();
      ctx.arc(startPosition.x, startPosition.y, radius, 0, 2 * Math.PI);
      ctx.stroke();
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };
  
  return {
    isDrawing,
    setIsDrawing,
    tool,
    setTool,
    color,
    setColor,
    canvasRef,
    clearCanvas,
    downloadCanvas,
    handleCanvasClick,
    isAddingText,
    setIsAddingText,
    textContent,
    setTextContent,
    textPosition,
    textInputRef,
    addTextToCanvas,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp
  };
}
