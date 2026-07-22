
import React, { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { audioService } from "@/services/audioService";

interface StarRewardsLineProps {
  points: number;
  milestones: number[];
}

export function StarRewardsLine({ points, milestones }: StarRewardsLineProps) {
  const { languageText } = useLanguage();
  const [previousPoints, setPreviousPoints] = useState(points);
  
  // Check for milestone achievements and play celebration sound
  useEffect(() => {
    if (points > previousPoints) {
      const newMilestones = milestones.filter(m => m <= points && m > previousPoints);
      if (newMilestones.length > 0) {
        // Play celebration sound for milestone achievement
        audioService.playCelebrationSound();
      }
    }
    setPreviousPoints(points);
  }, [points, previousPoints, milestones]);
  
  // Sort milestones in descending order
  const sortedMilestones = [...milestones].sort((a, b) => b - a);
  
  // Define colors for each level
  const levelColors = [
    "bg-purple-light text-purple-dark fill-purple",
    "bg-teal-light text-teal-dark fill-teal",
    "bg-orange-light text-orange-dark fill-orange",
    "bg-yellow-light text-yellow-dark fill-yellow",
    "bg-primary/20 text-primary fill-primary/80"
  ];
  
  return (
    <div className="h-full flex flex-col items-center py-3 px-1">
      <div className="text-xs font-medium mb-2 text-center">
        {languageText.rewards}
      </div>
      
      <div className="flex-1 w-[2px] bg-gradient-to-b from-purple-light via-teal-light to-yellow-light relative">
        {sortedMilestones.map((milestone, index) => {
          const isEarned = points >= milestone;
          const colorIndex = Math.min(index, levelColors.length - 1);
          const colorClass = isEarned ? levelColors[colorIndex] : "bg-gray-100 text-gray-400";
          
          return (
            <div 
              key={milestone} 
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{ 
                left: "50%", 
                top: `${(index + 1) * 100 / (sortedMilestones.length + 1)}%` 
              }}
            >
              <div 
                className={`flex items-center justify-center w-7 h-7 rounded-full transition-all duration-500 ${colorClass} ${
                  isEarned ? "animate-pulse-subtle scale-125 shadow-[0_0_12px_rgba(250,204,21,0.55)] ring-2 ring-yellow-300/60" : ""
                }`}
              >
                <Star 
                  size={15} 
                  className={`transition-all duration-500 ${isEarned ? "drop-shadow-[0_0_4px_rgba(255,255,255,0.9)]" : "text-gray-400"}`} 
                />
              </div>
            </div>
          );
        })}
        
        {/* Current position indicator */}
        <div 
          className="absolute w-2 h-2 bg-primary rounded-full transform -translate-x-1/2 shadow-md animate-pulse"
          style={{ 
            left: "50%", 
            top: `${100 - (points / Math.max(...milestones)) * 100}%`,
            display: points <= Math.max(...milestones) ? "block" : "none"
          }}
        />
      </div>
    </div>
  );
}
