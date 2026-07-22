
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shuffle, RotateCcw } from "lucide-react";

interface GameControlsProps {
  score: number;
  completedMatches: number;
  totalMatches: number;
  onReset: () => void;
  onNewSet: () => void;
}

export function GameControls({ 
  score, 
  completedMatches, 
  totalMatches, 
  onReset, 
  onNewSet 
}: GameControlsProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Badge variant="outline">Score: {score}</Badge>
        <Badge variant="outline">
          Progress: {completedMatches}/{totalMatches}
        </Badge>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onReset}>
          <RotateCcw size={14} className="mr-1" />
          Reset
        </Button>
        <Button variant="outline" size="sm" onClick={onNewSet}>
          <Shuffle size={14} className="mr-1" />
          New Set
        </Button>
      </div>
    </div>
  );
}
