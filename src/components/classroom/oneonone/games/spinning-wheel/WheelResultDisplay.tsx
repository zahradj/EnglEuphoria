
import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WheelSegment } from "./types";

interface WheelResultDisplayProps {
  selectedSegment: WheelSegment | null;
  isSpinning: boolean;
}

export function WheelResultDisplay({ selectedSegment, isSpinning }: WheelResultDisplayProps) {
  if (!selectedSegment || isSpinning) {
    return null;
  }

  return (
    <Card className="p-4 bg-yellow-50 border-yellow-200 text-center max-w-md">
      <h4 className="font-bold text-yellow-800 mb-2">Your Challenge:</h4>
      <p className="text-yellow-700 text-lg">{selectedSegment.content}</p>
      <Badge variant="secondary" className="mt-2">
        +5 points
      </Badge>
    </Card>
  );
}
