
import React from "react";
import { Book } from "lucide-react";
import { EnhancedDictionary } from "@/components/classroom/oneonone/dictionary/EnhancedDictionary";

export function DictionaryTabContent() {
  const handleAddToVocab = (word: string, definition: string) => {
    // This would integrate with student vocabulary tracking
    // For now, just log the action
  };

  return (
    <div className="h-full flex flex-col">
      <h4 className="font-semibold mb-3 flex items-center gap-2">
        <Book size={16} />
        Dictionary
      </h4>
      <div className="flex-1 overflow-hidden">
        <EnhancedDictionary onAddToVocab={handleAddToVocab} />
      </div>
    </div>
  );
}
