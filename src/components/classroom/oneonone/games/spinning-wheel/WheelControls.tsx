
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RotateCcw, Settings } from "lucide-react";

interface WheelControlsProps {
  score: number;
  onReset: () => void;
  onGenerateNewContent: () => void;
}

export function WheelControls({ score, onReset, onGenerateNewContent }: WheelControlsProps) {
  return (
    <div className="flex items-center justify-between">
      <Badge variant="outline">Score: {score}</Badge>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onReset}>
          <RotateCcw size={14} className="mr-1" />
          Reset
        </Button>
        <Button variant="outline" size="sm" onClick={onGenerateNewContent}>
          <Settings size={14} className="mr-1" />
          New Content
        </Button>
      </div>
    </div>
  );
}
