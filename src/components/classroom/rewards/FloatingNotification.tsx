import React, { useEffect, useState } from "react";
import { Star, Trophy, Award } from "lucide-react";

interface FloatingNotificationProps {
  points: number;
  reason?: string;
  isVisible: boolean;
  onComplete: () => void;
}

export function FloatingNotification({ points, reason, isVisible, onComplete }: FloatingNotificationProps) {
  const [shouldShow, setShouldShow] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<'enter' | 'float' | 'exit'>('enter');

  useEffect(() => {
    if (isVisible) {
      setShouldShow(true);
      setAnimationPhase('enter');
      
      // Enter phase
      setTimeout(() => setAnimationPhase('float'), 200);
      
      // Exit phase
      setTimeout(() => {
        setAnimationPhase('exit');
        setTimeout(() => {
          setShouldShow(false);
          onComplete();
        }, 300);
      }, 2500);
    }
  }, [isVisible, onComplete]);

  if (!shouldShow) return null;

  const getIcon = () => {
    if (points >= 40) return Trophy;
    if (points >= 20) return Award;
    return Star;
  };

  const getColors = () => {
    if (points >= 40) return "from-yellow-400 via-orange-500 to-red-500";
    if (points >= 20) return "from-blue-400 via-purple-500 to-pink-500";
    return "from-green-400 via-teal-500 to-blue-500";
  };

  const Icon = getIcon();
  const gradientColors = getColors();

  const getAnimationClasses = () => {
    switch (animationPhase) {
      case 'enter':
        return "scale-0 opacity-0 translate-y-8";
      case 'float':
        return "scale-100 opacity-100 translate-y-0 animate-bounce-gentle";
      case 'exit':
        return "scale-75 opacity-0 -translate-y-4";
      default:
        return "";
    }
  };

  return (
    <div className="fixed top-24 right-6 z-50 pointer-events-none">
      <div className={`transition-all duration-300 ease-out ${getAnimationClasses()}`}>
        <div className={`bg-gradient-to-r ${gradientColors} text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 min-w-48`}>
          <div className="p-2 bg-white/20 rounded-full">
            <Icon size={20} className="text-white animate-sparkle" />
          </div>
          <div>
            <div className="font-bold text-lg">+{points} XP</div>
            {reason && <div className="text-sm opacity-90">{reason}</div>}
          </div>
          <div className="text-2xl animate-pulse">✨</div>
        </div>
      </div>
    </div>
  );
}