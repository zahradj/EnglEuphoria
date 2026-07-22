
import React, { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog } from "@/components/ui/dialog";
import { WhiteboardCanvas } from "./whiteboard/WhiteboardCanvas";
import { WhiteboardToolbar } from "./whiteboard/WhiteboardToolbar";
import { WhiteboardTabsSection } from "./whiteboard/WhiteboardTabsSection";
import { EmbeddedGame } from "./whiteboard/EmbeddedGame";
import { EmbedLinkDialog } from "./whiteboard/EmbedLinkDialog";
import { EmbeddedGameDialog } from "./whiteboard/EmbeddedGameDialog";
import { Palette, Users, Sparkles, Link } from "lucide-react";

interface EnhancedOneOnOneWhiteboardProps {
  currentUser?: {
    role: 'teacher' | 'student';
    name: string;
  };
}

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

export function EnhancedOneOnOneWhiteboard({ 
  currentUser = { role: 'teacher', name: 'Teacher' }
}: EnhancedOneOnOneWhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showEmbedDialog, setShowEmbedDialog] = useState(false);
  const [showGameDialog, setShowGameDialog] = useState(false);
  
  // Whiteboard state
  const [activeTool, setActiveTool] = useState<"pencil" | "eraser" | "text" | "highlighter" | "shape" | "game">("pencil");
  const [color, setColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [activeShape, setActiveShape] = useState<"circle" | "rectangle">("rectangle");
  const [activeTab, setActiveTab] = useState("page1");
  
  // Embedded games state
  const [embeddedGames, setEmbeddedGames] = useState<Record<string, EmbeddedGameData[]>>({});
  const [gameUrl, setGameUrl] = useState("");
  const [gameTitle, setGameTitle] = useState("");
  
  // Embed link state
  const [embedUrl, setEmbedUrl] = useState("");
  const [embedTitle, setEmbedTitle] = useState("");

  const isTeacher = currentUser.role === 'teacher';

  const clearCanvas = () => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  };

  const addGame = () => {
    if (!gameTitle || !gameUrl) return;
    
    const newGame: EmbeddedGameData = {
      id: Date.now().toString(),
      title: gameTitle,
      url: gameUrl.startsWith('http') ? gameUrl : `https://${gameUrl}`,
      x: 100,
      y: 100,
      width: 600,
      height: 400
    };

    setEmbeddedGames(prev => ({
      ...prev,
      [activeTab]: [...(prev[activeTab] || []), newGame]
    }));

    setGameTitle("");
    setGameUrl("");
    setShowGameDialog(false);
  };

  const addEmbedLink = () => {
    if (!embedTitle || !embedUrl) return;
    
    const newEmbed: EmbeddedGameData = {
      id: Date.now().toString(),
      title: embedTitle,
      url: embedUrl.startsWith('http') ? embedUrl : `https://${embedUrl}`,
      x: 150,
      y: 150,
      width: 600,
      height: 400
    };

    setEmbeddedGames(prev => ({
      ...prev,
      [activeTab]: [...(prev[activeTab] || []), newEmbed]
    }));

    setEmbedTitle("");
    setEmbedUrl("");
    setShowEmbedDialog(false);
  };

  const removeGame = (gameId: string) => {
    setEmbeddedGames(prev => ({
      ...prev,
      [activeTab]: (prev[activeTab] || []).filter(game => game.id !== gameId)
    }));
  };

  const handleIframeError = (gameId: string) => {
    setEmbeddedGames(prev => ({
      ...prev,
      [activeTab]: (prev[activeTab] || []).map(game => 
        game.id === gameId ? { ...game, isBlocked: true } : game
      )
    }));
  };

  const currentPageGames = embeddedGames[activeTab] || [];

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool === "game") {
      setShowGameDialog(true);
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool === "pencil" || activeTool === "eraser") {
      setIsDrawing(true);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-sm overflow-hidden whiteboard-container">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Palette size={20} className="text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-800">Interactive Whiteboard</h2>
          </div>
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            <Users size={12} className="mr-1" />
            Live
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {isTeacher ? 'Teaching Mode' : 'Learning Mode'}
          </Badge>
          {isTeacher && (
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowEmbedDialog(true)}
                className="text-xs"
              >
                <Link size={12} className="mr-1" />
                Link
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowGameDialog(true)}
                className="text-xs"
              >
                <Sparkles size={12} className="mr-1" />
                Game
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <WhiteboardToolbar 
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        activeShape={activeShape}
        color={color}
        setColor={setColor}
        clearCanvas={clearCanvas}
        isGameDialogOpen={showGameDialog}
        setIsGameDialogOpen={setShowGameDialog}
      />

      <Separator />

      {/* Main Content */}
      <div className="flex-1 relative bg-white overflow-hidden">
        <WhiteboardCanvas 
          activeTool={activeTool}
          color={color}
          onCanvasClick={handleCanvasClick}
          onStartDrawing={startDrawing}
        >
          {currentPageGames.map((game) => (
            <EmbeddedGame
              key={game.id}
              game={game}
              onRemove={removeGame}
              onError={handleIframeError}
            />
          ))}
        </WhiteboardCanvas>
      </div>

      {/* Tabs Section */}
      <WhiteboardTabsSection 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeTool={activeTool}
        color={color}
        onCanvasClick={handleCanvasClick}
        onStartDrawing={startDrawing}
        currentPageGames={currentPageGames}
        onRemoveGame={removeGame}
        onIframeError={handleIframeError}
      />

      {/* Dialogs */}
      <Dialog open={showEmbedDialog} onOpenChange={setShowEmbedDialog}>
        <EmbedLinkDialog 
          isOpen={showEmbedDialog}
          onClose={() => setShowEmbedDialog(false)}
          url={embedUrl}
          setUrl={setEmbedUrl}
          title={embedTitle}
          setTitle={setEmbedTitle}
          onEmbed={addEmbedLink}
        />
      </Dialog>
      
      <Dialog open={showGameDialog} onOpenChange={setShowGameDialog}>
        <EmbeddedGameDialog
          gameTitle={gameTitle}
          setGameTitle={setGameTitle}
          gameUrl={gameUrl}
          setGameUrl={setGameUrl}
          onAddGame={addGame}
        />
      </Dialog>
    </div>
  );
}
