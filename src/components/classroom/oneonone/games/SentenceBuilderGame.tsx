
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";

export function SentenceBuilderGame() {
  const sentenceWords = ["The", "cat", "is", "sleeping", "on", "the", "sofa"];
  const [draggedWords, setDraggedWords] = useState<string[]>([]);

  const addWordToSentence = (word: string) => {
    setDraggedWords([...draggedWords, word]);
  };

  const clearSentence = () => {
    setDraggedWords([]);
  };

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg min-h-16 border-2 border-dashed border-gray-300">
        <h4 className="text-sm font-medium mb-2 text-gray-600">Build your sentence:</h4>
        <div className="flex flex-wrap gap-2">
          {draggedWords.map((word, index) => (
            <Badge key={index} variant="default" className="text-sm">
              {word}
            </Badge>
          ))}
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {sentenceWords.map((word, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => addWordToSentence(word)}
            className="hover:bg-blue-50"
          >
            {word}
          </Button>
        ))}
      </div>
      
      <div className="flex gap-2">
        <Button onClick={clearSentence} variant="outline" size="sm">
          Clear
        </Button>
        <Button size="sm">
          <CheckCircle size={16} className="mr-1" />
          Check Answer
        </Button>
      </div>
    </div>
  );
}
