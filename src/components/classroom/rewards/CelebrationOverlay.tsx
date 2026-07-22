
import React, { useEffect, useState } from "react";
import { ParticleSystem } from "./ParticleSystem";
import { CelebrationText } from "./CelebrationText";

interface CelebrationOverlayProps {
  isVisible: boolean;
  points: number;
  reason?: string;
  onComplete: () => void;
  duration?: number;
}

export function CelebrationOverlay({ 
  isVisible, 
  points, 
  reason, 
  onComplete, 
  duration = 2500 
}: CelebrationOverlayProps) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShowContent(true);
      
      const timer = setTimeout(() => {
        setShowContent(false);
        setTimeout(onComplete, 300); // Wait for fade-out animation
      }, duration);

      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [isVisible, duration, onComplete]);

  if (!isVisible && !showContent) return null;

  const isLevelUp = reason?.includes("LEVEL UP");

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-white/20 backdrop-blur-md z-[9999] transition-opacity duration-300 ${
          showContent ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onComplete}
      />
      
      {/* Celebration Content */}
      <div 
        className={`fixed inset-0 flex items-center justify-center z-[9999] pointer-events-none transition-all duration-500 ${
          showContent ? 'opacity-100 scale-100' : 'opacity-0 scale-80'
        } ${isLevelUp ? 'animate-bounce-in' : ''}`}
      >
        <div className={`relative ${showContent && isLevelUp ? 'animate-shake' : ''}`}>
          {/* Background glow effect */}
          <div className={`absolute inset-0 rounded-full blur-3xl scale-150 animate-pulse ${
            isLevelUp 
              ? 'bg-gradient-to-r from-[hsl(var(--neon-pink))/40] via-[hsl(var(--neon-cyan))/40] to-[hsl(var(--neon-purple))/40]' 
              : 'bg-gradient-to-r from-[hsl(var(--neon-yellow))/20] via-[hsl(var(--neon-orange))/20] to-[hsl(var(--neon-magenta))/20]'
          }`} />
          
          {/* Main celebration content */}
          <div className="relative">
            <CelebrationText 
              points={points} 
              reason={reason} 
              isVisible={showContent} 
            />
          </div>
        </div>
      </div>
      
      {/* Particle System */}
      <ParticleSystem 
        isActive={isVisible} 
        particleCount={isLevelUp ? 150 : points >= 40 ? 80 : points >= 20 ? 60 : 40}
        duration={duration + 500}
      />
    </>
  );
}
