
import React from "react";
import { Card } from "@/components/ui/card";
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from "lucide-react";
import { DiceResult } from "./types";

interface DiceDisplayProps {
  diceCount: number;
  diceResults: DiceResult[];
  isRolling: boolean;
}

export function DiceDisplay({ diceCount, diceResults, isRolling }: DiceDisplayProps) {
  const getDiceIcon = (value: number) => {
    const icons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];
    const IconComponent = icons[value - 1] || Dice1;
    return <IconComponent size={24} />;
  };

  return (
    <div className="flex gap-4 justify-center flex-wrap">
      {Array(diceCount).fill(0).map((_, index) => {
        const result = diceResults[index];
        return (
          <Card
            key={index}
            className={`p-6 transition-all duration-200 ${
              isRolling ? 'animate-bounce' : 'hover:scale-105'
            }`}
            style={{
              backgroundColor: result?.color || '#f3f4f6',
              borderColor: result?.color || '#e5e7eb'
            }}
          >
            <div className="flex flex-col items-center space-y-2">
              <div className="text-white">
                {result ? getDiceIcon(result.value) : getDiceIcon(1)}
              </div>
              <div className="text-white font-semibold text-sm text-center min-h-[20px]">
                {result?.content || '?'}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
