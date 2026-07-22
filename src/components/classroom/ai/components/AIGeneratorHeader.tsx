
import React from "react";
import { Zap } from "lucide-react";

export function AIGeneratorHeader() {
  return (
    <div className="p-4 border-b flex-shrink-0">
      <div className="flex items-center gap-2">
        <Zap className="text-purple-600" size={24} />
        <h2 className="text-xl font-semibold">AI Content Generator</h2>
      </div>
    </div>
  );
}
