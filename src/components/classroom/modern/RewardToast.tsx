import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Star, Trophy, Zap } from "lucide-react";
import { audioService } from "@/services/audioService";

interface RewardToastProps {
  show: boolean;
  xp: number;
  message?: string;
  type?: "xp" | "badge" | "star";
  onComplete?: () => void;
}

export function RewardToast({
  show,
  xp,
  message = "Great work!",
  type = "xp",
  onComplete
}: RewardToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      // Type-aware reward stinger so every toast is audibly distinct.
      if (type === "star") audioService.playStarSound();
      else if (type === "badge") audioService.playStickerSound();
      else audioService.playRewardSound(xp);

      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(() => onComplete?.(), 300);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [show, onComplete, type, xp]);

  if (!visible) return null;

  const icons = {
    xp: <Zap className="w-5 h-5 text-classroom-reward" />,
    badge: <Trophy className="w-5 h-5 text-classroom-accent" />,
    star: <Star className="w-5 h-5 text-classroom-reward fill-classroom-reward" />
  };

  const colors = {
    xp: "from-classroom-reward/20 to-classroom-accent/20",
    badge: "from-classroom-accent/20 to-classroom-primary/20",
    star: "from-classroom-reward/20 to-yellow-500/20"
  };

  return (
    <div className="fixed bottom-24 right-6 z-[90] animate-slide-in-right">
      <GlassCard className={`p-4 min-w-[250px] bg-gradient-to-r ${colors[type]} shadow-glow`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full glass flex items-center justify-center">
            {icons[type]}
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium">{message}</div>
            <div className="text-lg font-bold text-classroom-reward animate-pulse">
              +{xp} XP
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

// Floating XP Indicator
interface FloatingXPProps {
  xp: number;
  position: { x: number; y: number };
  onComplete?: () => void;
}

export function FloatingXP({ xp, position, onComplete }: FloatingXPProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 1500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div
      className="fixed z-[90] pointer-events-none animate-fade-in"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: "translate(-50%, -50%)",
        animation: "floatUp 1.5s ease-out forwards"
      }}
    >
      <div className="text-2xl font-bold text-classroom-reward drop-shadow-glow">
        +{xp} XP
      </div>
    </div>
  );
}
