import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { validateAndProcessUrl } from "./SafeUrlValidator";

interface EmbeddedGameData {
  id: string;
  title: string;
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isBlocked?: boolean;
}

export function useWhiteboardState() {
  const [activeTool, setActiveTool] = useState<"pencil" | "eraser" | "text" | "highlighter" | "shape" | "game">("pencil");
  const [color, setColor] = useState("#2563eb");
  const [activeShape, setActiveShape] = useState<"rectangle" | "circle">("rectangle");
  const [activeTab, setActiveTab] = useState("page1");
  const [embeddedGames, setEmbeddedGames] = useState<Record<string, EmbeddedGameData[]>>({});
  const [gameUrl, setGameUrl] = useState("");
  const [gameTitle, setGameTitle] = useState("");
  const [isGameDialogOpen, setIsGameDialogOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const addGame = () => {
    if (!gameUrl || !gameTitle) {
      toast({
        title: "Missing Information",
        description: "Please provide both game title and URL",
        variant: "destructive"
      });
      return;
    }

    const validation = validateAndProcessUrl(gameUrl);
    
    if (!validation.isValid) {
      toast({
        title: "Invalid URL",
        description: validation.warning || "Please provide a valid HTTPS URL",
        variant: "destructive"
      });
      return;
    }

    if (validation.warning && !validation.isTrusted) {
      toast({
        title: "Security Warning",
        description: validation.warning,
      });
    }
    
    // Calculate larger default size based on whiteboard container
    const whiteboardElement = document.querySelector('.whiteboard-container');
    let defaultWidth = 800; // Increased from 400
    let defaultHeight = 600; // Increased from 300
    
    if (whiteboardElement) {
      const rect = whiteboardElement.getBoundingClientRect();
      // Use 70% of available space instead of 50% and 40%
      defaultWidth = Math.min(800, rect.width * 0.7);
      defaultHeight = Math.min(600, rect.height * 0.7);
    }
    
    const newGame: EmbeddedGameData = {
      id: Date.now().toString(),
      title: gameTitle,
      url: validation.processedUrl,
      x: 50,
      y: 50,
      width: defaultWidth,
      height: defaultHeight,
      isBlocked: false
    };

    setEmbeddedGames(prev => ({
      ...prev,
      [activeTab]: [...(prev[activeTab] || []), newGame]
    }));
    
    setGameUrl("");
    setGameTitle("");
    setIsGameDialogOpen(false);
    
    toast({
      title: "Content Added",
      description: `${gameTitle} has been embedded with larger size for better visibility.`,
    });
  };

  const handleIframeError = (gameId: string) => {
    setEmbeddedGames(prev => ({
      ...prev,
      [activeTab]: (prev[activeTab] || []).map(game => 
        game.id === gameId ? { ...game, isBlocked: true } : game
      )
    }));
    
    toast({
      title: "Content Blocked",
      description: "This content cannot be embedded due to security restrictions. You can still open it in a new tab.",
      variant: "destructive"
    });
  };

  const removeGame = (gameId: string) => {
    setEmbeddedGames(prev => ({
      ...prev,
      [activeTab]: (prev[activeTab] || []).filter(game => game.id !== gameId)
    }));
    
    toast({
      title: "Content Removed",
      description: "The embedded content has been removed from the whiteboard.",
    });
  };

  return {
    activeTool,
    setActiveTool,
    color,
    setColor,
    activeShape,
    setActiveShape,
    activeTab,
    setActiveTab,
    embeddedGames,
    gameUrl,
    setGameUrl,
    gameTitle,
    setGameTitle,
    isGameDialogOpen,
    setIsGameDialogOpen,
    canvasRef,
    clearCanvas,
    addGame,
    handleIframeError,
    removeGame
  };
}
