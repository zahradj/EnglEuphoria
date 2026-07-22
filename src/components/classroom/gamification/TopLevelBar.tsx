import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { soundEffectsService } from "@/services/soundEffectsService";

interface TopLevelBarProps {
  currentXP: number;
  maxXP?: number;
  level: number;
  starCount: number;
  isAnimating?: boolean;
}

export function TopLevelBar({ 
  currentXP, 
  maxXP = 100, 
  level, 
  starCount,
  isAnimating = false 
}: TopLevelBarProps) {
  const [animatingSegments, setAnimatingSegments] = useState<number[]>([]);
  const [previousXP, setPreviousXP] = useState(currentXP);
  
  const segments = 10;
  const xpPerSegment = maxXP / segments;
  const normalizedXP = currentXP % maxXP; // Handle level-ups
  const filledSegments = Math.floor(normalizedXP / xpPerSegment);

  useEffect(() => {
    if (currentXP > previousXP) {
      const prevSegments = Math.floor((previousXP % maxXP) / xpPerSegment);
      const newSegments = Math.floor(normalizedXP / xpPerSegment);
      
      // Animate each new segment with delay
      for (let i = prevSegments; i < newSegments; i++) {
        setTimeout(() => {
          setAnimatingSegments(prev => [...prev, i]);
          soundEffectsService.playStarEarned();
        }, (i - prevSegments) * 100);
      }
      
      // Clear animations after they complete
      setTimeout(() => {
        setAnimatingSegments([]);
      }, (newSegments - prevSegments) * 100 + 500);
    }
    
    setPreviousXP(currentXP);
  }, [currentXP, previousXP, xpPerSegment, normalizedXP, maxXP]);

  // Pop on star burst (the scale-in animation)
  useEffect(() => {
    if (isAnimating) soundEffectsService.playPop();
  }, [isAnimating]);

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 max-w-4xl w-full pointer-events-none">
      <div className="h-full flex items-center gap-2 px-4">
        {/* Segmented Progress Bar — frameless */}
        <div className="flex-1 flex gap-1 max-w-2xl">
          {Array.from({ length: segments }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-2 rounded-full transition-all duration-300 ${
                i < filledSegments
              ? 'bg-gradient-to-r from-[hsl(var(--neon-cyan))] via-[hsl(var(--neon-purple))] to-[hsl(var(--neon-magenta))]'
              : 'bg-white/20 border border-white/30'
              } ${animatingSegments.includes(i) ? 'animate-pulse scale-110' : ''}`}
              style={{
                transform: animatingSegments.includes(i) ? 'scale(1.1)' : 'scale(1)',
              }}
            />
          ))}
        </div>

        {/* Star — bare, no chip frame, no count number. Just the synced star. */}
        <Star
          className={`w-9 h-9 fill-[hsl(var(--neon-yellow))] text-[hsl(var(--neon-yellow))] drop-shadow-[0_0_10px_hsl(var(--neon-yellow)/0.85)] ${
            isAnimating ? 'animate-scale-in' : ''
          }`}
          aria-label={`${starCount} stars earned`}
        />
      </div>
    </div>
  );
}
