
import { useState, useRef, useEffect } from "react";

export function useWhiteboard(initialPageCount = 3, initialTab = "page1") {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [activeTool, setActiveTool] = useState<"pencil" | "eraser" | "text" | "highlighter" | "shape" | "embed">("pencil");
  const [activeShape, setActiveShape] = useState<"rectangle" | "circle">("rectangle");
  const [color, setColor] = useState("#9B87F5"); // Default purple color
  const [pageCount, setPageCount] = useState(initialPageCount);
  
  const canvasRefs = useRef<Record<string, HTMLCanvasElement | null>>({});
  
  // Initialize canvas references
  useEffect(() => {
    const initialRefs: Record<string, HTMLCanvasElement | null> = {};
    
    for (let i = 1; i <= initialPageCount; i++) {
      initialRefs[`page${i}`] = null;
    }
    
    canvasRefs.current = initialRefs;
  }, [initialPageCount]);
  
  useEffect(() => {
    // Initialize the current tab canvas
    const canvas = canvasRefs.current[activeTab];
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Set canvas size
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    
    // Fill with white background if it's empty
    if (!canvas.hasAttribute("data-initialized")) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      canvas.setAttribute("data-initialized", "true");
    }
    
    // Handle resize
    const handleResize = () => {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      ctx.putImageData(imageData, 0, 0);
    };
    
    window.addEventListener("resize", handleResize);
    
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [activeTab]);
  
  const clearCanvas = () => {
    const canvas = canvasRefs.current[activeTab];
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };
  
  const downloadCanvas = () => {
    const canvas = canvasRefs.current[activeTab];
    if (!canvas) return;
    
    const dataURL = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `esl-lesson-${activeTab}.png`;
    link.href = dataURL;
    link.click();
  };
  
  const addNewPage = () => {
    const newPageNum = pageCount + 1;
    const newPageId = `page${newPageNum}`;
    
    // Update refs object
    canvasRefs.current[newPageId] = null;
    
    // Update page count
    setPageCount(newPageNum);
    
    // Switch to new page
    setActiveTab(newPageId);
  };
  
  return {
    activeTab,
    setActiveTab,
    activeTool,
    setActiveTool,
    activeShape,
    setActiveShape,
    color,
    setColor,
    pageCount,
    canvasRefs,
    clearCanvas,
    downloadCanvas,
    addNewPage
  };
}
