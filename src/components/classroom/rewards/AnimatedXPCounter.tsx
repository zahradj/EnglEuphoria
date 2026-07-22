import React, { useEffect, useState, useRef } from "react";
import { Star } from "lucide-react";

interface AnimatedXPCounterProps {
  currentXP: number;
  previousXP?: number;
  level: number;
  className?: string;
}

export function AnimatedXPCounter({ currentXP, previousXP = 0, level, className }: AnimatedXPCounterProps) {
  const [displayXP, setDisplayXP] = useState(currentXP);
  const [isAnimating, setIsAnimating] = useState(false);
  const counterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentXP !== previousXP && currentXP > previousXP) {
      setIsAnimating(true);
      
      // Animate the number counting up
      const difference = currentXP - previousXP;
      const duration = Math.min(difference * 50, 1000); // Max 1 second
      const steps = Math.max(10, Math.min(difference, 30));
      const increment = difference / steps;
      const stepDuration = duration / steps;
      
      let step = 0;
      const interval = setInterval(() => {
        step++;
        const newValue = previousXP + (increment * step);
        setDisplayXP(Math.round(newValue));
        
        if (step >= steps) {
          clearInterval(interval);
          setDisplayXP(currentXP);
          
          // End animation after a brief delay
          setTimeout(() => setIsAnimating(false), 500);
        }
      }, stepDuration);
      
      return () => clearInterval(interval);
    } else {
      setDisplayXP(currentXP);
    }
  }, [currentXP, previousXP]);

  const progressPercentage = (displayXP % 100);
  const shouldPulse = isAnimating || currentXP % 100 === 0; // Pulse when level up

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Level Badge */}
      <div 
        ref={counterRef}
        className={`mb-2 px-3 py-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white rounded-full font-bold text-sm flex items-center gap-1 shadow-lg transition-all duration-300 ${
          shouldPulse ? 'animate-pulse scale-110 shadow-xl' : ''
        } ${isAnimating ? 'animate-rainbow-shift' : ''}`}
      >
        <Star size={14} className={isAnimating ? "animate-sparkle" : ""} />
        Level {level}
      </div>

      {/* XP Progress */}
      <div className="w-full max-w-32">
        <div className="flex justify-between text-xs mb-1">
          <span className={`font-medium transition-all duration-300 ${isAnimating ? 'text-primary animate-bounce-light' : 'text-muted-foreground'}`}>
            XP
          </span>
          <span className={`font-bold transition-all duration-300 ${isAnimating ? 'text-primary scale-110' : 'text-foreground'}`}>
            {displayXP % 100}/100
          </span>
        </div>
        
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden shadow-inner">
          <div 
            className={`h-2 rounded-full transition-all duration-700 ease-out ${
              isAnimating 
                ? 'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 animate-pulse shadow-lg' 
                : 'bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600'
            }`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Floating XP Indicator */}
      {isAnimating && (
        <div className="absolute -top-2 -right-2 text-green-500 font-bold text-sm animate-float-up pointer-events-none">
          +{currentXP - previousXP} XP
        </div>
      )}
    </div>
  );
}