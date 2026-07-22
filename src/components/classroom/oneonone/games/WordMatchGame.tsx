
import React from "react";
import { Button } from "@/components/ui/button";

export function WordMatchGame() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <h4 className="font-medium text-center">Words</h4>
        {["Happy", "Sad", "Big", "Small"].map((word, index) => (
          <Button key={index} variant="outline" className="w-full">
            {word}
          </Button>
        ))}
      </div>
      <div className="space-y-2">
        <h4 className="font-medium text-center">Meanings</h4>
        {["Large", "Joyful", "Tiny", "Unhappy"].map((meaning, index) => (
          <Button key={index} variant="outline" className="w-full">
            {meaning}
          </Button>
        ))}
      </div>
    </div>
  );
}
