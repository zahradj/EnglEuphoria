
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { GameMode, MatchItem, DragDropGameState } from "./types";
import { generateGameContent } from "./gameContentGenerator";

export function useDragDropGame(initialGameMode: GameMode) {
  const [gameMode, setGameMode] = useState<GameMode>(initialGameMode);
  const [gameState, setGameState] = useState<DragDropGameState>({
    leftItems: [],
    rightItems: [],
    matches: {},
    score: 0,
    isLoading: false
  });
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  
  const { toast } = useToast();

  const loadGameContent = useCallback(async (mode: GameMode) => {
    setGameState(prev => ({ ...prev, isLoading: true }));
    
    setTimeout(async () => {
      const { leftItems, rightItems } = await generateGameContent(mode);
      
      setGameState({
        leftItems,
        rightItems,
        matches: {},
        score: 0,
        isLoading: false
      });
    }, 1000);
  }, []);

  useEffect(() => {
    loadGameContent(gameMode);
  }, [gameMode, loadGameContent]);

  const handleDragStart = useCallback((e: React.DragEvent, itemId: string) => {
    setDraggedItem(itemId);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    
    if (!draggedItem) return;

    const draggedItemData = gameState.leftItems.find(item => item.id === draggedItem);
    const targetItemData = gameState.rightItems.find(item => item.id === targetId);

    if (draggedItemData && targetItemData) {
      if (draggedItemData.matchId === targetItemData.matchId) {
        // Correct match
        setGameState(prev => ({
          ...prev,
          matches: { ...prev.matches, [draggedItem]: targetId },
          score: prev.score + 10
        }));
        
        toast({
          title: "Correct Match! 🎉",
          description: "Great job! You earned 10 points.",
        });
      } else {
        // Incorrect match
        toast({
          title: "Try Again",
          description: "That's not quite right. Keep trying!",
          variant: "destructive"
        });
      }
    }

    setDraggedItem(null);
  }, [draggedItem, gameState.leftItems, gameState.rightItems, toast]);

  const handleReset = useCallback(() => {
    loadGameContent(gameMode);
  }, [gameMode, loadGameContent]);

  const handleNewSet = useCallback(() => {
    loadGameContent(gameMode);
  }, [gameMode, loadGameContent]);

  const handleModeChange = useCallback((mode: GameMode) => {
    setGameMode(mode);
  }, []);

  return {
    gameMode,
    gameState,
    draggedItem,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleReset,
    handleNewSet,
    handleModeChange
  };
}
