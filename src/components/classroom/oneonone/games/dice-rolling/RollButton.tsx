
import React from "react";
import { Button } from "@/components/ui/button";
import { Shuffle } from "lucide-react";

interface RollButtonProps {
  isRolling: boolean;
  onRoll: () => void;
}

export function RollButton({ isRolling, onRoll }: RollButtonProps) {
  return (
    <Button 
      onClick={onRoll} 
      disabled={isRolling}
      size="lg"
      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-3"
    >
      {isRolling ? (
        <>
          <Shuffle size={20} className="mr-2 animate-spin" />
          Rolling...
        </>
      ) : (
        <>
          <Shuffle size={20} className="mr-2" />
          Roll the Dice!
        </>
      )}
    </Button>
  );
}
