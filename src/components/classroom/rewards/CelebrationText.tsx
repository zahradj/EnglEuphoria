
import React from "react";
import { Star, Trophy, Award } from "lucide-react";

interface CelebrationTextProps {
  points: number;
  reason?: string;
  isVisible: boolean;
}

export function CelebrationText({ points, reason, isVisible }: CelebrationTextProps) {
  const getIcon = () => {
    if (points >= 40) return Trophy;
    if (points >= 20) return Award;
    return Star;
  };

  const getColorClass = () => {
    if (points >= 40) return "text-orange-500";
    if (points >= 20) return "text-purple-500";
    return "text-yellow-500";
  };

  const getGradientStyle = () => {
    if (points >= 40) return { background: 'var(--gradient-celebration)' };
    if (points >= 20) return { background: 'var(--gradient-cool)' };
    return { background: 'var(--gradient-warm)' };
  };

  const IconComponent = getIcon();

  if (!isVisible) return null;

  return (
    <div className="flex flex-col items-center animate-celebration-bounce">
      {/* Sparkling background circle */}
      <div className="absolute inset-0 rounded-full opacity-30 animate-gentle-pulse blur-xl"
           style={getGradientStyle()}></div>
      
      <div className="flex items-center gap-4 mb-4 relative z-10">
        <IconComponent 
          size={56} 
          className={`${getColorClass()} animate-sparkle drop-shadow-lg`} 
        />
        <div className="text-7xl font-bold text-white drop-shadow-2xl animate-celebration-bounce font-nunito">
          +{points}
        </div>
        <div className="text-3xl font-bold drop-shadow-lg animate-sparkle"
             style={{ color: 'hsl(var(--joy-yellow))' }}>
          XP
        </div>
      </div>
      
      {reason && (
        <div className="text-xl font-semibold text-white/95 drop-shadow-lg text-center max-w-lg mb-3 relative z-10">
          {reason}
        </div>
      )}
      
      {/* Celebration emojis */}
      <div className="flex gap-2 text-4xl animate-celebration-bounce relative z-10">
        <span className="animate-sparkle">🎉</span>
        <span className="animate-sparkle" style={{ animationDelay: '0.2s' }}>⭐</span>
        <span className="animate-sparkle" style={{ animationDelay: '0.4s' }}>🎊</span>
      </div>
      
      {/* Magical sparkles around */}
      <div className="absolute -top-8 -left-8 text-2xl animate-sparkle opacity-80">✨</div>
      <div className="absolute -top-4 -right-12 text-xl animate-sparkle opacity-70" style={{ animationDelay: '0.3s' }}>💫</div>
      <div className="absolute -bottom-6 -left-10 text-lg animate-sparkle opacity-60" style={{ animationDelay: '0.6s' }}>⭐</div>
      <div className="absolute -bottom-8 -right-8 text-2xl animate-sparkle opacity-75" style={{ animationDelay: '0.9s' }}>✨</div>
    </div>
  );
}
