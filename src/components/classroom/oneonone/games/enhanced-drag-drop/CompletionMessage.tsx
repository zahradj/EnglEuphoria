
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

interface CompletionMessageProps {
  score: number;
  onPlayAgain: () => void;
}

export function CompletionMessage({ score, onPlayAgain }: CompletionMessageProps) {
  return (
    <Card className="p-4 bg-green-50 border-green-200 text-center">
      <div className="flex items-center justify-center gap-2 mb-2">
        <Star size={20} className="text-yellow-500" />
        <h3 className="text-lg font-bold text-green-800">Congratulations!</h3>
        <Star size={20} className="text-yellow-500" />
      </div>
      <p className="text-green-700">
        You completed all matches! Final Score: {score} points
      </p>
      <Button 
        className="mt-2" 
        onClick={onPlayAgain}
      >
        Play Again
      </Button>
    </Card>
  );
}
