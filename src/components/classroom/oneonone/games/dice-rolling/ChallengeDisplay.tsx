
import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { DiceResult } from "./types";

interface ChallengeDisplayProps {
  aiChallenge: string;
  isRolling: boolean;
  diceResults: DiceResult[];
}

export function ChallengeDisplay({ aiChallenge, isRolling, diceResults }: ChallengeDisplayProps) {
  if (!aiChallenge || isRolling) {
    return null;
  }

  return (
    <Card className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border-green-200 text-center max-w-2xl">
      <div className="flex items-center justify-center gap-2 mb-2">
        <Star size={18} className="text-yellow-500" />
        <h4 className="font-bold text-green-800">Your Challenge:</h4>
        <Star size={18} className="text-yellow-500" />
      </div>
      <p className="text-green-700 text-lg leading-relaxed">{aiChallenge}</p>
      <Badge variant="secondary" className="mt-3">
        +{diceResults.length * 2} points earned
      </Badge>
    </Card>
  );
}
