import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { Star, Trophy, Award, Zap, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";

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
  icon: React.ReactNode;
}

interface ModernRewardsPanelProps {
  currentXP: number;
  nextLevelXP: number;
  level: number;
  badges: Badge[];
  recentAchievements: Array<{
    id: string;
    title: string;
    xp: number;
    timestamp: Date;
    iconType: "star" | "trophy" | "zap";
  }>;
  starCount?: number;
  isTeacher?: boolean;
  onAwardStar?: () => void;
}

export function ModernRewardsPanel({
  currentXP = 0,
  nextLevelXP = 100,
  level = 1,
  badges = [],
  recentAchievements = [],
  starCount = 0,
  isTeacher = false,
  onAwardStar
}: ModernRewardsPanelProps) {
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [animateXP, setAnimateXP] = useState(false);

  const xpProgress = (currentXP / nextLevelXP) * 100;
  const rankTitle = getRankTitle(level);

  // Trigger animation when XP changes
  useEffect(() => {
    setAnimateXP(true);
    const timer = setTimeout(() => setAnimateXP(false), 500);
    return () => clearTimeout(timer);
  }, [currentXP]);

  function getRankTitle(lvl: number): string {
    if (lvl >= 50) return "Master";
    if (lvl >= 30) return "Expert";
    if (lvl >= 20) return "Advanced";
    if (lvl >= 10) return "Intermediate";
    if (lvl >= 5) return "Learner";
    return "Beginner";
  }

  return (
    <GlassCard className="h-full flex flex-col p-4 space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-classroom-primary/30 scrollbar-track-transparent">
      {/* Level Display */}
      <div className="text-center space-y-2">
        <div className="relative inline-flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-classroom-reward to-classroom-accent rounded-full animate-pulse opacity-30 blur-xl" />
          <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-classroom-reward to-classroom-accent flex items-center justify-center shadow-glow">
            <div className="text-4xl font-bold text-white">{level}</div>
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-lg font-semibold text-classroom-reward">{rankTitle}</div>
          <div className="text-sm text-muted-foreground">Level {level}</div>
        </div>
      </div>

      {/* XP Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Progress to Level {level + 1}</span>
          <span className="text-muted-foreground">
            {currentXP} / {nextLevelXP} XP
          </span>
        </div>
        <div className="relative">
          <Progress
            value={xpProgress}
            className={`h-3 ${animateXP ? "animate-pulse" : ""}`}
          />
          {/* Milestone markers */}
          <div className="absolute inset-0 flex justify-around items-center pointer-events-none">
            {[25, 50, 75, 100].map((milestone) => (
              <div
                key={milestone}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  xpProgress >= milestone
                    ? "bg-classroom-reward scale-125 shadow-glow"
                    : "bg-background/50 scale-75"
                }`}
              />
            ))}
          </div>
        </div>
        <div className="text-xs text-center text-muted-foreground">
          {nextLevelXP - currentXP} XP to next level
        </div>
      </div>

      {/* Star Collection — frameless, no count number */}
      <div className="px-1">
        <div className="flex flex-wrap gap-1.5 justify-center">
          {Array.from({ length: Math.min(starCount, 10) }).map((_, i) => (
            <Star
              key={i}
              className="w-7 h-7 text-classroom-reward fill-classroom-reward drop-shadow-[0_0_8px_hsl(var(--classroom-reward)/0.7)] animate-scale-in"
              style={{ animationDelay: `${i * 50}ms` }}
            />
          ))}
        </div>

        {/* Teacher Award Button */}
        {isTeacher && onAwardStar && (
          <GlassButton
            variant="primary"
            className="w-full mt-3 bg-gradient-to-r from-[hsl(var(--neon-magenta))] to-[hsl(var(--neon-purple))] hover:scale-110 active:scale-95 transition-all duration-200 neon-glow-magenta animate-pulse border-2 border-[hsl(var(--neon-magenta)/0.5)]"
            onClick={onAwardStar}
          >
            <Star className="w-4 h-4 mr-2 fill-[hsl(var(--neon-yellow))] text-[hsl(var(--neon-yellow))] drop-shadow-[0_0_8px_hsl(var(--neon-yellow))] animate-bounce" />
            Award Star to Student
          </GlassButton>
        )}
      </div>

      {/* Badges Display */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-classroom-accent" />
          <h3 className="font-semibold">Badges Earned</h3>
          <span className="text-sm text-muted-foreground">({badges.filter(b => b.earnedAt).length})</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {badges.map((badge) => (
            <button
              key={badge.id}
              onClick={() => setSelectedBadge(badge)}
              className={`relative p-3 rounded-lg transition-all duration-300 ${
                badge.earnedAt
                  ? "glass hover:scale-105 hover:shadow-glow"
                  : "bg-background/10 opacity-40 grayscale"
              }`}
            >
              {badge.isNew && badge.earnedAt && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-classroom-reward rounded-full animate-pulse shadow-glow" />
              )}
              <div className="text-3xl text-center">{badge.icon}</div>
              <div className="text-xs text-center mt-1 line-clamp-1">{badge.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Achievements */}
      <div className="space-y-2 flex-1">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-classroom-success" />
          <h3 className="font-semibold">Recent Achievements</h3>
        </div>
        <div className="space-y-2">
          {recentAchievements.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Complete activities to earn achievements!
            </div>
          ) : (
            recentAchievements.slice(0, 5).map((achievement) => {
              const icons = {
                star: <Star className="w-5 h-5 text-classroom-reward" />,
                trophy: <Trophy className="w-5 h-5 text-classroom-accent" />,
                zap: <Zap className="w-5 h-5 text-classroom-success" />
              };

              return (
                <GlassCard
                  key={achievement.id}
                  variant="light"
                  className="p-3 hover:scale-102 transition-transform animate-fade-in"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-classroom-success/20 flex items-center justify-center">
                      {icons[achievement.iconType]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium line-clamp-1">{achievement.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(achievement.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-sm font-bold text-classroom-reward">+{achievement.xp} XP</div>
                  </div>
                </GlassCard>
              );
            })
          )}
        </div>
      </div>

      {/* Badge Details Modal */}
      {selectedBadge && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedBadge(null)}
        >
          <GlassCard
            className="max-w-sm w-full p-6 space-y-4 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center space-y-3">
              <div className="text-6xl">{selectedBadge.icon}</div>
              <div>
                <h3 className="text-xl font-bold">{selectedBadge.name}</h3>
                <p className="text-sm text-muted-foreground mt-2">{selectedBadge.description}</p>
              </div>
              {selectedBadge.earnedAt && (
                <div className="text-xs text-muted-foreground">
                  Earned on {new Date(selectedBadge.earnedAt).toLocaleDateString()}
                </div>
              )}
            </div>
            <GlassButton
              variant="primary"
              className="w-full"
              onClick={() => setSelectedBadge(null)}
            >
              Close
            </GlassButton>
          </GlassCard>
        </div>
      )}
    </GlassCard>
  );
}
