
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play } from "lucide-react";

export function QuizSpinnerGame() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<string | null>(null);

  const spinnerQuestions = [
    "What is your favorite color?",
    "Name three animals",
    "Count to 10 in English",
    "Describe your bedroom",
    "What did you eat for breakfast?",
    "Tell me about your family",
    "What's the weather like today?",
    "Name five body parts"
  ];

  const spinWheel = () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    setSpinResult(null);
    
    // Simulate spinning animation
    setTimeout(() => {
      const randomQuestion = spinnerQuestions[Math.floor(Math.random() * spinnerQuestions.length)];
      setSpinResult(randomQuestion);
      setIsSpinning(false);
    }, 3000);
  };

  return (
    <div className="text-center space-y-6">
      <div className="relative mx-auto">
        <div 
          className={`w-48 h-48 mx-auto rounded-full border-8 border-orange-300 relative overflow-hidden transition-transform duration-3000 ${
            isSpinning ? 'animate-spin' : ''
          }`}
          style={{
            background: `conic-gradient(
              #ff6b6b 0deg 45deg,
              #4ecdc4 45deg 90deg,
              #45b7d1 90deg 135deg,
              #96ceb4 135deg 180deg,
              #ffd93d 180deg 225deg,
              #ff9ff3 225deg 270deg,
              #a8e6cf 270deg 315deg,
              #ffb3ba 315deg 360deg
            )`
          }}
        >
          {/* Wheel sections with numbers */}
          {[1, 2, 3, 4, 5, 6, 7, 8].map((num, index) => (
            <div
              key={num}
              className="absolute w-full h-full flex items-center justify-center text-white font-bold text-lg"
              style={{
                transform: `rotate(${index * 45}deg)`,
                clipPath: 'polygon(50% 50%, 50% 0%, 100% 0%)'
              }}
            >
              <span 
                className="absolute"
                style={{ 
                  transform: `rotate(-${index * 45}deg) translateY(-60px)`,
                }}
              >
                {num}
              </span>
            </div>
          ))}
          
          {/* Center circle */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full border-4 border-gray-400"></div>
        </div>
        
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
          <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-transparent border-b-red-500"></div>
        </div>
      </div>

      {spinResult && (
        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <h4 className="font-semibold text-yellow-800 mb-2">Your Question:</h4>
          <p className="text-yellow-700">{spinResult}</p>
        </Card>
      )}

      <Button 
        onClick={spinWheel} 
        disabled={isSpinning}
        size="lg"
        className="bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600"
      >
        <Play size={16} className="mr-2" />
        {isSpinning ? "Spinning..." : "Spin the Wheel!"}
      </Button>
    </div>
  );
}
