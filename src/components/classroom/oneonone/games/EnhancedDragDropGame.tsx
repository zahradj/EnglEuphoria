
import React from "react";
import { Card } from "@/components/ui/card";
import { GameModeSelector } from "./enhanced-drag-drop/GameModeSelector";
import { GameControls } from "./enhanced-drag-drop/GameControls";
import { DragItem } from "./enhanced-drag-drop/DragItem";
import { DropTarget } from "./enhanced-drag-drop/DropTarget";
import { CompletionMessage } from "./enhanced-drag-drop/CompletionMessage";
import { useDragDropGame } from "./enhanced-drag-drop/useDragDropGame";
import { GameMode } from "./enhanced-drag-drop/types";

export function EnhancedDragDropGame() {
  const gameModes: GameMode[] = [
    { id: 'word-definition', name: 'Word-Definition', description: 'Match words with meanings', difficulty: 1 },
    { id: 'category-sort', name: 'Category Sort', description: 'Sort items by category', difficulty: 2 },
    { id: 'image-word', name: 'Image-Word', description: 'Match images with words', difficulty: 1 },
    { id: 'grammar-function', name: 'Grammar Function', description: 'Match grammar terms with examples', difficulty: 3 }
  ];

  const {
    gameMode,
    gameState,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleReset,
    handleNewSet,
    handleModeChange
  } = useDragDropGame(gameModes[0]);

  const completedMatches = Object.keys(gameState.matches).length;
  const totalMatches = gameState.leftItems.length;
  const isComplete = completedMatches === totalMatches && totalMatches > 0;

  return (
    <div className="space-y-4">
      <GameModeSelector
        gameModes={gameModes}
        currentMode={gameMode}
        onModeChange={handleModeChange}
      />

      <GameControls
        score={gameState.score}
        completedMatches={completedMatches}
        totalMatches={totalMatches}
        onReset={handleReset}
        onNewSet={handleNewSet}
      />

      {gameState.isLoading ? (
        <Card className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Generating new content...</p>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {/* Left Column - Items to Drag */}
          <div className="space-y-2">
            <h4 className="font-semibold text-center mb-3">Drag Items</h4>
            {gameState.leftItems.map((item) => (
              <DragItem
                key={item.id}
                item={item}
                isMatched={!!gameState.matches[item.id]}
                onDragStart={handleDragStart}
              />
            ))}
          </div>

          {/* Right Column - Drop Targets */}
          <div className="space-y-2">
            <h4 className="font-semibold text-center mb-3">Drop Here</h4>
            {gameState.rightItems.map((item) => (
              <DropTarget
                key={item.id}
                item={item}
                isTarget={Object.values(gameState.matches).includes(item.id)}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              />
            ))}
          </div>
        </div>
      )}

      {isComplete && (
        <CompletionMessage
          score={gameState.score}
          onPlayAgain={handleReset}
        />
      )}
    </div>
  );
}
