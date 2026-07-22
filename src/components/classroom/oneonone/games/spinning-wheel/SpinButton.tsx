
import React from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";

interface SpinButtonProps {
  isSpinning: boolean;
  onSpin: () => void;
}

export function SpinButton({ isSpinning, onSpin }: SpinButtonProps) {
  return (
    <Button 
      onClick={onSpin} 
      disabled={isSpinning}
      size="lg"
      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3"
    >
      {isSpinning ? (
        <>
          <Pause size={20} className="mr-2" />
          Spinning...
        </>
      ) : (
        <>
          <Play size={20} className="mr-2" />
          Spin the Wheel!
        </>
      )}
    </Button>
  );
}
