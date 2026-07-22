
import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Trophy, Star, Zap, AlertCircle } from "lucide-react";
import { Achievement } from "@/services/progressAnalyticsService";

interface AchievementNotificationProps {
  achievement: Achievement & { xp_reward: number };
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

export function AchievementNotification({
  achievement,
  onClose,
  autoClose = true,
  duration = 5000
}: AchievementNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Validate achievement data
    if (!achievement || !achievement.name || !achievement.description) {
      setError('Invalid achievement data');
      return;
    }

    if (autoClose && duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, achievement]);

  const handleClose = () => {
    try {
      setIsVisible(false);
      setTimeout(() => {
        onClose();
      }, 300); // Allow fade out animation
    } catch (error) {
      console.error('Error closing achievement notification:', error);
      onClose(); // Fallback to immediate close
    }
  };

  if (error) {
    return (
      <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
        <Card className="bg-error-soft border-2 border-error/20 shadow-lg max-w-sm">
          <div className="p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-error" />
            <span className="text-sm text-error-foreground">{error}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0 text-error/60 hover:text-error"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
      <Card className="bg-gradient-to-r from-primary-50 to-accent-50 border-2 border-primary-200 shadow-lg max-w-sm">
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary rounded-full">
                <Trophy className="h-4 w-4 text-white" />
              </div>
              <div className="text-sm font-semibold text-primary-800">Achievement Unlocked!</div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-6 w-6 p-0 text-text-muted hover:text-text"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-3 mb-3">
            <div className="text-3xl" role="img" aria-label={achievement.name}>
              {achievement.icon || '🏆'}
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-primary-900">{achievement.name}</h4>
              <p className="text-sm text-primary-700">{achievement.description}</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="bg-primary-100 text-primary-800">
              {achievement.category || 'Achievement'}
            </Badge>
            <div className="flex items-center gap-1 text-sm font-semibold text-primary-800">
              <Zap className="h-4 w-4" />
              +{achievement.xp_reward || 0} XP
            </div>
          </div>

          {/* Celebration animation */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden rounded-lg">
            <div className="absolute top-2 left-2 animate-bounce">
              <Star className="h-3 w-3 text-primary-400 fill-primary-400" />
            </div>
            <div className="absolute top-3 right-4 animate-bounce delay-100">
              <Star className="h-2 w-2 text-accent-400 fill-accent-400" />
            </div>
            <div className="absolute bottom-3 left-6 animate-bounce delay-200">
              <Star className="h-2 w-2 text-primary-400 fill-primary-400" />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
