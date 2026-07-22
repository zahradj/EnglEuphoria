import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StudentLearningStreak } from "@/types/gamification";
import { Flame, Calendar, Award, TrendingUp } from "lucide-react";
import { ClayCard, ClayIcon, ClayBadge, ClayProgress } from "@/components/ui/clay";

interface StreakCardProps {
  streaks: StudentLearningStreak[];
  onUpdateStreak: (streakType: 'daily' | 'weekly' | 'monthly') => Promise<any>;
}

export function StreakCard({ streaks, onUpdateStreak }: StreakCardProps) {
  const dailyStreak = streaks.find(s => s.streak_type === 'daily');
  const weeklyStreak = streaks.find(s => s.streak_type === 'weekly');
  const monthlyStreak = streaks.find(s => s.streak_type === 'monthly');

  const getStreakReward = (streak: number) => {
    if (streak >= 30) return { coins: 50, level: 'epic' };
    if (streak >= 14) return { coins: 25, level: 'rare' };
    if (streak >= 7) return { coins: 10, level: 'uncommon' };
    if (streak >= 3) return { coins: 5, level: 'common' };
    return { coins: 0, level: 'none' };
  };

  const isToday = (dateString: string) => {
    const today = new Date().toDateString();
    const streakDate = new Date(dateString).toDateString();
    return today === streakDate;
  };

  const streakProgress = () => {
    const s = dailyStreak?.current_streak || 0;
    if (s >= 30) return 100;
    if (s >= 14) return ((s - 14) / 16) * 100;
    if (s >= 7) return ((s - 7) / 7) * 100;
    if (s >= 3) return ((s - 3) / 4) * 100;
    return (s / 3) * 100;
  };

  return (
    <ClayCard subject="streak" className="p-0">
      <div className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <ClayIcon subject="streak" size="sm">
            <Flame className="h-4 w-4 text-white" />
          </ClayIcon>
          <h3 className="font-bold text-orange-800">Learning Streaks</h3>
        </div>

        {/* Daily Streak */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ClayIcon subject="phonics" size="sm">
                <Calendar className="h-3.5 w-3.5 text-amber-800" />
              </ClayIcon>
              <div>
                <p className="font-semibold text-sm">Daily Streak</p>
                <p className="text-xs text-muted-foreground">
                  Current: {dailyStreak?.current_streak || 0} days
                </p>
              </div>
            </div>
            <div className="text-right">
              <ClayBadge subject="streak" label={`🔥 ${dailyStreak?.current_streak || 0}`} />
              {dailyStreak && getStreakReward(dailyStreak.current_streak).coins > 0 && (
                <p className="text-[10px] text-amber-700 mt-1">
                  +{getStreakReward(dailyStreak.current_streak).coins} coins
                </p>
              )}
            </div>
          </div>

          {dailyStreak && !isToday(dailyStreak.last_activity_date || dailyStreak.lastActivityDate as any) && (
            <Button
              onClick={() => onUpdateStreak('daily')}
              className="w-full clay-phonics border-none text-amber-900 font-semibold hover:brightness-105"
            >
              Continue Streak
            </Button>
          )}

          {dailyStreak && isToday((dailyStreak.last_activity_date || dailyStreak.lastActivityDate) as any) && (
            <div className="clay-vocab p-3">
              <p className="text-xs text-emerald-800 flex items-center gap-1 font-medium">
                <Award className="h-3.5 w-3.5" />
                Streak updated today! Keep it up tomorrow.
              </p>
            </div>
          )}
        </div>

        {/* Progress */}
        {dailyStreak && (
          <div className="mt-4 space-y-1.5">
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Progress to next reward</span>
              <span>
                {dailyStreak.current_streak >= 30 ? 'Max reward!' :
                 dailyStreak.current_streak >= 14 ? `${30 - dailyStreak.current_streak} days to epic` :
                 dailyStreak.current_streak >= 7 ? `${14 - dailyStreak.current_streak} days to rare` :
                 dailyStreak.current_streak >= 3 ? `${7 - dailyStreak.current_streak} days to uncommon` :
                 `${3 - dailyStreak.current_streak} days to first reward`}
              </span>
            </div>
            <ClayProgress value={streakProgress()} subject="phonics" height={8} />
          </div>
        )}

        {/* Longest Streak */}
        {dailyStreak && dailyStreak.longest_streak > 0 && (
          <div className="clay-phonics p-3 mt-3">
            <p className="text-xs text-amber-800 flex items-center gap-1 font-medium">
              <TrendingUp className="h-3.5 w-3.5" />
              Your longest streak: {dailyStreak.longest_streak} days
            </p>
          </div>
        )}

        {/* Weekly + Monthly */}
        <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-orange-200/40">
          <div className="clay text-center p-3">
            <p className="text-[10px] font-medium text-muted-foreground">Weekly</p>
            <p className="text-lg font-bold text-blue-700">{weeklyStreak?.current_streak || 0}</p>
          </div>
          <div className="clay text-center p-3">
            <p className="text-[10px] font-medium text-muted-foreground">Monthly</p>
            <p className="text-lg font-bold text-violet-700">{monthlyStreak?.current_streak || 0}</p>
          </div>
        </div>
      </div>
    </ClayCard>
  );
}
