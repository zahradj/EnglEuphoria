
import React from "react";
import { Dialog } from "@/components/ui/dialog";
import { WhiteboardToolbar } from "./whiteboard/WhiteboardToolbar";
import { EmbeddedGameDialog } from "./whiteboard/EmbeddedGameDialog";
import { WhiteboardTabsSection } from "./whiteboard/WhiteboardTabsSection";
import { useWhiteboardState } from "./whiteboard/useWhiteboardState";
import { createDrawingHandlers } from "./whiteboard/WhiteboardDrawingHandlers";

export function OneOnOneWhiteboard() {
  const {
    activeTool,
    setActiveTool,
    color,
    setColor,
    activeShape,
    activeTab,
    setActiveTab,
    embeddedGames,
    gameUrl,
    setGameUrl,
    gameTitle,
    setGameTitle,
    isGameDialogOpen,
    setIsGameDialogOpen,
    clearCanvas,
    addGame,
    handleIframeError,
    removeGame
  } = useWhiteboardState();

  const { handleCanvasClick, startDrawing } = createDrawingHandlers(
    activeTool,
    color,
    () => setIsGameDialogOpen(true)
  );

  const currentPageGames = embeddedGames[activeTab] || [];

  return (
    <div className="h-full flex flex-col relative">
      <WhiteboardToolbar
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        activeShape={activeShape}
        color={color}
        setColor={setColor}
        clearCanvas={clearCanvas}
        isGameDialogOpen={isGameDialogOpen}
        setIsGameDialogOpen={setIsGameDialogOpen}
      >
        <Dialog open={isGameDialogOpen} onOpenChange={setIsGameDialogOpen}>
          <EmbeddedGameDialog
            gameTitle={gameTitle}
            setGameTitle={setGameTitle}
            gameUrl={gameUrl}
            setGameUrl={setGameUrl}
            onAddGame={addGame}
          />
        </Dialog>
      </WhiteboardToolbar>

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
    </div>
  );
}
