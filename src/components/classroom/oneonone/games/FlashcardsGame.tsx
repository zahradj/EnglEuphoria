
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RotateCcw } from "lucide-react";

export function FlashcardsGame() {
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const flashcards = [
    { word: "Apple", translation: "A red or green fruit", image: "🍎" },
    { word: "Cat", translation: "A small furry pet animal", image: "🐱" },
    { word: "House", translation: "A place where people live", image: "🏠" },
    { word: "Book", translation: "Something you read", image: "📚" }
  ];

  const flipCard = () => {
    setIsFlipped(!isFlipped);
  };

  const nextCard = () => {
    setFlashcardIndex((flashcardIndex + 1) % flashcards.length);
    setIsFlipped(false);
  };

  return (
    <div className="text-center">
      <div className="mb-4">
        <Badge variant="secondary">{flashcardIndex + 1} / {flashcards.length}</Badge>
      </div>
      
      <div 
        className="w-64 h-40 mx-auto mb-6 cursor-pointer perspective-1000"
        onClick={flipCard}
      >
        <div className={`relative w-full h-full transition-transform duration-600 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
          {/* Front */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex flex-col items-center justify-center text-white backface-hidden">
            <div className="text-4xl mb-2">{flashcards[flashcardIndex].image}</div>
            <h3 className="text-xl font-bold">{flashcards[flashcardIndex].word}</h3>
          </div>
          
          {/* Back */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center text-white backface-hidden rotate-y-180">
            <p className="text-center px-4">{flashcards[flashcardIndex].translation}</p>
          </div>
        </div>
      </div>
      
      <div className="flex gap-3 justify-center">
        <Button onClick={flipCard} variant="outline">
          <RotateCcw size={16} className="mr-1" />
          Flip
        </Button>
        <Button onClick={nextCard}>
          Next Card
        </Button>
      </div>
    </div>
  );
}
