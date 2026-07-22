
import React from "react";
import { Card } from "@/components/ui/card";
import { DiceConfig } from "./types";

interface GameInstructionsProps {
  diceConfig: DiceConfig;
}

export function GameInstructions({ diceConfig }: GameInstructionsProps) {
  return (
    <Card className="p-3 bg-gray-50 text-center max-w-md">
      <p className="text-sm text-gray-600">
        {diceConfig.description}. Roll the dice and complete the AI-generated challenge!
      </p>
    </Card>
  );
}
