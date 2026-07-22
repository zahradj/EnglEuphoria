
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WhiteboardCanvas } from "./WhiteboardCanvas";
import { EmbeddedGame } from "./EmbeddedGame";

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

interface WhiteboardTabsSectionProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeTool: "pencil" | "eraser" | "text" | "highlighter" | "shape" | "game";
  color: string;
  onCanvasClick: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onStartDrawing: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  currentPageGames: EmbeddedGameData[];
  onRemoveGame: (gameId: string) => void;
  onIframeError: (gameId: string) => void;
}

export function WhiteboardTabsSection({
  activeTab,
  setActiveTab,
  activeTool,
  color,
  onCanvasClick,
  onStartDrawing,
  currentPageGames = [], // Default to empty array
  onRemoveGame,
  onIframeError
}: WhiteboardTabsSectionProps) {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col h-full">
      <TabsList className="mb-2 flex-shrink-0">
        <TabsTrigger value="page1">Page 1</TabsTrigger>
        <TabsTrigger value="page2">Page 2</TabsTrigger>
        <TabsTrigger value="page3">Page 3</TabsTrigger>
      </TabsList>
      
      <TabsContent value={activeTab} className="flex-1 m-0 relative min-h-0">
        <WhiteboardCanvas
          activeTool={activeTool}
          color={color}
          onCanvasClick={onCanvasClick}
          onStartDrawing={onStartDrawing}
        >
          {currentPageGames.map((game) => (
            <EmbeddedGame
              key={game.id}
              game={game}
              onRemove={onRemoveGame}
              onError={onIframeError}
            />
          ))}
        </WhiteboardCanvas>
      </TabsContent>
    </Tabs>
  );
}
