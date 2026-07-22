import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useProgressStats, useUserProgress } from '@/hooks/useProgress';
import { Trophy, BookOpen, Clock, Target, Flame, Star } from 'lucide-react';

interface ProgressOverviewProps {
  userId: string;
  compact?: boolean;
}

export const ProgressOverview: React.FC<ProgressOverviewProps> = ({ 
  userId, 
  compact = false 
}) => {
  const { data: stats, isLoading: statsLoading } = useProgressStats(userId);
  const { data: allProgress } = useUserProgress(userId);

  // Calculate streak (consecutive days with activity)
  const calculateStreak = () => {
    if (!allProgress || allProgress.length === 0) return 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let streak = 0;
    let checkDate = new Date(today);
    
    const activityDates = allProgress
      .filter(p => p.updated_at)
      .map(p => {
        const d = new Date(p.updated_at);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      });
    
    const uniqueDates = [...new Set(activityDates)].sort((a, b) => b - a);
    
    for (const dateTime of uniqueDates) {
      if (dateTime === checkDate.getTime()) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (dateTime < checkDate.getTime()) {
        break;
      }
    }
    
    return streak;
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (statsLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const streak = calculateStreak();
  const completionPercentage = stats?.totalLessons 
    ? Math.round((stats.completedLessons / stats.totalLessons) * 100) 
    : 0;

  if (compact) {
    return (
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1">
          <Trophy className="h-4 w-4 text-yellow-500" />
          <span className="font-medium">{stats?.completedLessons || 0}</span>
          <span className="text-muted-foreground">completed</span>
        </div>
        <div className="flex items-center gap-1">
          <Flame className="h-4 w-4 text-orange-500" />
          <span className="font-medium">{streak}</span>
          <span className="text-muted-foreground">day streak</span>
        </div>
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 text-blue-500" />
          <span className="font-medium">{stats?.averageScore || 0}%</span>
          <span className="text-muted-foreground">avg</span>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-medium">Overall Progress</span>
            <span className="text-muted-foreground">{completionPercentage}% complete</span>
          </div>
          <Progress value={completionPercentage} className="h-3" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={<Trophy className="h-5 w-5 text-yellow-500" />}
            label="Completed"
            value={stats?.completedLessons || 0}
            suffix="lessons"
          />
          <StatCard
            icon={<BookOpen className="h-5 w-5 text-blue-500" />}
            label="In Progress"
            value={stats?.inProgressLessons || 0}
            suffix="lessons"
          />
          <StatCard
            icon={<Clock className="h-5 w-5 text-purple-500" />}
            label="Time Spent"
            value={formatTime(stats?.totalTimeSpent || 0)}
          />
          <StatCard
            icon={<Target className="h-5 w-5 text-green-500" />}
            label="Avg Score"
            value={stats?.averageScore || 0}
            suffix="%"
          />
        </div>

        {/* Streak Banner */}
        {streak > 0 && (
          <div className="mt-4 p-3 bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-full">
              <Flame className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="font-semibold text-orange-700 dark:text-orange-400">
                {streak} Day Streak! 🔥
              </p>
              <p className="text-sm text-orange-600/80 dark:text-orange-300/80">
                Keep learning to maintain your streak
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  suffix?: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, suffix }) => (
  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
    <div className="p-2 bg-background rounded-lg">
      {icon}
    </div>
    <div>
      <p className="text-lg font-bold">
        {value}
        {suffix && <span className="text-sm font-normal text-muted-foreground ml-1">{suffix}</span>}
      </p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  </div>
);
