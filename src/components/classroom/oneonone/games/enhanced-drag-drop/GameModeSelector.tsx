
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GameMode } from "./types";

interface GameModeSelectorProps {
  gameModes: GameMode[];
  currentMode: GameMode;
  onModeChange: (mode: GameMode) => void;
}

export function GameModeSelector({ gameModes, currentMode, onModeChange }: GameModeSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {gameModes.map((mode) => (
        <Button
          key={mode.id}
          variant={currentMode.id === mode.id ? "default" : "outline"}
          size="sm"
          onClick={() => onModeChange(mode)}
          className="text-xs"
        >
          {mode.name}
          <Badge variant="secondary" className="ml-1 text-xs">
            L{mode.difficulty}
          </Badge>
        </Button>
      ))}
    </div>
  );
}
