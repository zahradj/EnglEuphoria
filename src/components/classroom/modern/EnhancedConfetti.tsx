import { useEffect, useState } from "react";
import confetti from "canvas-confetti";

type ConfettiPattern = "fountain" | "explosion" | "spiral" | "burst" | "stars";

interface EnhancedConfettiProps {
  trigger: boolean;
  pattern?: ConfettiPattern;
  duration?: number;
  onComplete?: () => void;
}

export function EnhancedConfetti({
  trigger,
  pattern = "burst",
  duration = 3000,
  onComplete
}: EnhancedConfettiProps) {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!trigger) return;

    setIsActive(true);

    const patterns: Record<ConfettiPattern, () => void> = {
      fountain: () => {
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

        const interval = setInterval(() => {
          const timeLeft = animationEnd - Date.now();
          if (timeLeft <= 0) {
            clearInterval(interval);
            return;
          }

          const particleCount = 50 * (timeLeft / duration);
          confetti({
            ...defaults,
            particleCount,
            origin: { x: 0.5, y: 0.9 }
          });
        }, 250);
      },

      explosion: () => {
        const count = 200;
        const defaults = {
          origin: { y: 0.5 },
          zIndex: 9999
        };

        confetti({
          ...defaults,
          particleCount: count,
          spread: 360,
          startVelocity: 55,
          decay: 0.9,
          scalar: 1.2
        });
      },

      spiral: () => {
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        let skew = 1;

        const randomInRange = (min: number, max: number) => {
          return Math.random() * (max - min) + min;
        };

        const frame = () => {
          const timeLeft = animationEnd - Date.now();
          const ticks = Math.max(200, 500 * (timeLeft / duration));
          skew = Math.max(0.8, skew - 0.001);

          confetti({
            particleCount: 1,
            startVelocity: 0,
            ticks: ticks,
            origin: {
              x: Math.random(),
              y: Math.random() * skew - 0.2
            },
            colors: ["#FFD700", "#FFA500", "#FF69B4"],
            shapes: ["circle", "square"],
            gravity: randomInRange(0.4, 0.6),
            scalar: randomInRange(0.8, 1.2),
            drift: randomInRange(-0.4, 0.4),
            zIndex: 9999
          });

          if (timeLeft > 0) {
            requestAnimationFrame(frame);
          }
        };

        frame();
      },

      burst: () => {
        const duration = 15 * 1000;
        const animationEnd = Date.now() + duration;
        const colors = ["#FFD700", "#FFA500", "#FF69B4", "#00CED1", "#FF6347"];

        (function frame() {
          confetti({
            particleCount: 2,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: colors,
            zIndex: 9999
          });
          confetti({
            particleCount: 2,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: colors,
            zIndex: 9999
          });

          if (Date.now() < animationEnd) {
            requestAnimationFrame(frame);
          }
        })();
      },

      stars: () => {
        const defaults = {
          spread: 360,
          ticks: 100,
          gravity: 0,
          decay: 0.94,
          startVelocity: 30,
          shapes: ["star"],
          colors: ["#FFD700", "#FFA500", "#FFE45C"],
          zIndex: 9999
        };

        const shoot = () => {
          confetti({
            ...defaults,
            particleCount: 40,
            scalar: 1.2,
            shapes: ["star"]
          });

          confetti({
            ...defaults,
            particleCount: 10,
            scalar: 0.75,
            shapes: ["circle"]
          });
        };

        setTimeout(shoot, 0);
        setTimeout(shoot, 100);
        setTimeout(shoot, 200);
      }
    };

    // Execute the pattern
    patterns[pattern]();

    // Play celebration sound (optional - can be implemented later)
    // playSound('celebration');

    // Cleanup after duration
    const timer = setTimeout(() => {
      setIsActive(false);
      onComplete?.();
    }, duration);

    return () => {
      clearTimeout(timer);
      setIsActive(false);
    };
  }, [trigger, pattern, duration, onComplete]);

  return null;
}

// Level Up Animation Component
interface LevelUpAnimationProps {
  show: boolean;
  level: number;
  onComplete?: () => void;
}

export function LevelUpAnimation({ show, level, onComplete }: LevelUpAnimationProps) {
  useEffect(() => {
    if (!show) return;

    // Full screen celebration
    confetti({
      particleCount: 100,
      spread: 160,
      origin: { y: 0.6 },
      colors: ["#FFD700", "#FFA500", "#FF69B4"],
      zIndex: 9999
    });

    const timer = setTimeout(() => {
      onComplete?.();
    }, 3000);

    return () => clearTimeout(timer);
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-md animate-fade-in">
      <div className="text-center space-y-6 animate-scale-in">
        <div className="text-8xl font-bold text-transparent bg-gradient-to-r from-classroom-reward via-classroom-accent to-classroom-primary bg-clip-text animate-pulse">
          LEVEL UP!
        </div>
        <div className="text-6xl font-bold text-white">
          Level {level}
        </div>
        <div className="text-2xl text-classroom-accent">
          Amazing progress! Keep it up! 🎉
        </div>
      </div>
    </div>
  );
}

// Badge Reveal Animation Component
interface BadgeRevealProps {
  show: boolean;
  badge: {
    icon: string;
    name: string;
    description: string;
  };
  onComplete?: () => void;
}

export function BadgeReveal({ show, badge, onComplete }: BadgeRevealProps) {
  useEffect(() => {
    if (!show) return;

    // Sparkle effect
    confetti({
      particleCount: 50,
      spread: 100,
      origin: { y: 0.6 },
      colors: ["#FFD700", "#FFF"],
      shapes: ["star", "circle"],
      zIndex: 9999
    });

    const timer = setTimeout(() => {
      onComplete?.();
    }, 3000);

    return () => clearTimeout(timer);
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="glass p-8 rounded-2xl text-center space-y-4 max-w-md animate-scale-in shadow-glow">
        <div className="text-7xl animate-bounce">{badge.icon}</div>
        <div className="space-y-2">
          <div className="text-2xl font-bold text-classroom-reward">New Badge Earned!</div>
          <div className="text-xl font-semibold">{badge.name}</div>
          <div className="text-sm text-muted-foreground">{badge.description}</div>
        </div>
      </div>
    </div>
  );
}
