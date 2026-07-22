
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RotateCcw } from "lucide-react";

interface GameControlsProps {
  score: number;
  rollCount: number;
  onReset: () => void;
}

export function GameControls({ score, rollCount, onReset }: GameControlsProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Badge variant="outline">Score: {score}</Badge>
        <Badge variant="outline">Rolls: {rollCount}</Badge>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onReset}>
          <RotateCcw size={14} className="mr-1" />
          Reset
        </Button>
      </div>
    </div>
  );
}
