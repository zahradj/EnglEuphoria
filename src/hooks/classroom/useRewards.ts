import { useState, useCallback } from "react";
import { audioService } from "@/services/audioService";

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt?: Date;
  isNew?: boolean;
}

interface Achievement {
  id: string;
  title: string;
  xp: number;
  timestamp: Date;
  iconType: "star" | "trophy" | "zap";
}

export function useRewards() {
  const [currentXP, setCurrentXP] = useState(0);
  const [level, setLevel] = useState(1);
  const [starCount, setStarCount] = useState(0);
  const [badges, setBadges] = useState<Badge[]>([
    { id: "first-lesson", name: "First Steps", description: "Complete your first lesson", icon: "🌟" },
    { id: "quick-learner", name: "Quick Learner", description: "Answer 5 questions correctly", icon: "⚡" },
    { id: "perfect-score", name: "Perfect Score", description: "Get 100% on a quiz", icon: "🎯" },
    { id: "consistent", name: "Consistency", description: "Attend 5 lessons in a row", icon: "📅" },
    { id: "helpful", name: "Helpful", description: "Help a classmate", icon: "🤝" },
    { id: "creative", name: "Creative Mind", description: "Create something unique on the whiteboard", icon: "🎨" }
  ]);
  const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([]);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showBadgeReveal, setShowBadgeReveal] = useState(false);
  const [newBadge, setNewBadge] = useState<Badge | null>(null);

  const nextLevelXP = level * 100;

  const addXP = useCallback((amount: number, reason?: string) => {
    setCurrentXP(prev => {
      const newXP = prev + amount;
      const newLevel = Math.floor(newXP / 100) + 1;
      
      if (newLevel > level) {
        setLevel(newLevel);
        setShowLevelUp(true);
        audioService.playCelebrationSound();
        setTimeout(() => setShowLevelUp(false), 3000);
      }

      // Add to recent achievements
      if (reason) {
        const achievement: Achievement = {
          id: Date.now().toString(),
          title: reason,
          xp: amount,
          timestamp: new Date(),
          iconType: "star"
        };
        setRecentAchievements(prev => [achievement, ...prev].slice(0, 10));
      }

      return newXP;
    });
  }, [level]);

  const addStars = useCallback((count: number) => {
    setStarCount(prev => prev + count);
    audioService.playStarSound();
  }, []);

  const earnBadge = useCallback((badgeId: string) => {
    setBadges(prev => {
      const updatedBadges = prev.map(badge => {
        if (badge.id === badgeId && !badge.earnedAt) {
          const earnedBadge = { ...badge, earnedAt: new Date(), isNew: true };
          setNewBadge(earnedBadge);
          setShowBadgeReveal(true);
          audioService.playStickerSound();
          setTimeout(() => {
            setShowBadgeReveal(false);
            setNewBadge(null);
          }, 3000);
          return earnedBadge;
        }
        return badge;
      });
      return updatedBadges;
    });
  }, []);

  const clearBadgeNew = useCallback((badgeId: string) => {
    setBadges(prev =>
      prev.map(badge =>
        badge.id === badgeId ? { ...badge, isNew: false } : badge
      )
    );
  }, []);

  return {
    currentXP,
    level,
    nextLevelXP,
    starCount,
    badges,
    recentAchievements,
    showLevelUp,
    showBadgeReveal,
    newBadge,
    addXP,
    addStars,
    earnBadge,
    clearBadgeNew
  };
}
