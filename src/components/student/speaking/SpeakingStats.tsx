
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SpeakingProgress } from '@/types/speaking';
import { Flame, Trophy, Clock, Star, Award } from 'lucide-react';

interface SpeakingStatsProps {
  progress: SpeakingProgress | null;
  todaysSpeakingTime: number;
}

export const SpeakingStats: React.FC<SpeakingStatsProps> = ({ progress, todaysSpeakingTime }) => {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getBadgeDisplay = (badge: string) => {
    const badgeMap: Record<string, { icon: string; name: string; color: string }> = {
      'first_words': { icon: '🎯', name: 'First Words', color: 'bg-blue-100 text-blue-800' },
      'speaking_streak': { icon: '🔥', name: 'Speaking Streak', color: 'bg-orange-100 text-orange-800' },
      'confident_speaker': { icon: '🎖️', name: 'Confident Speaker', color: 'bg-purple-100 text-purple-800' },
      'conversation_master': { icon: '💬', name: 'Conversation Master', color: 'bg-green-100 text-green-800' }
    };

    const badgeInfo = badgeMap[badge] || { icon: '⭐', name: badge, color: 'bg-gray-100 text-gray-800' };
    return (
      <Badge key={badge} className={`${badgeInfo.color} border-0`}>
        {badgeInfo.icon} {badgeInfo.name}
      </Badge>
    );
  };

  if (!progress) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">
            <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Start practicing to see your progress!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Current Streak */}
        <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-orange-50 to-red-50 border-orange-200 hover:border-orange-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-orange-700">
              <div className="p-1 bg-orange-100 rounded-full group-hover:animate-pulse">
                <Flame className="h-3 w-3" />
              </div>
              Speaking Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600 animate-scale-in">
              {progress.current_streak}
            </div>
            <p className="text-xs text-orange-600/80 mt-1">
              {progress.current_streak === 1 ? 'day' : 'days'} in a row 🔥
            </p>
          </CardContent>
        </Card>

        {/* Total Speaking Time */}
        <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 hover:border-blue-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-blue-700">
              <div className="p-1 bg-blue-100 rounded-full group-hover:animate-pulse">
                <Clock className="h-3 w-3" />
              </div>
              Total Practice
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 animate-scale-in">
              {formatTime(progress.total_speaking_time)}
            </div>
            <p className="text-xs text-blue-600/80 mt-1">
              {progress.total_sessions} sessions completed ✨
            </p>
          </CardContent>
        </Card>

        {/* Speaking XP */}
        <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 hover:border-purple-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-purple-700">
              <div className="p-1 bg-purple-100 rounded-full group-hover:animate-pulse">
                <Star className="h-3 w-3" />
              </div>
              Speaking XP
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600 animate-scale-in">
              {progress.speaking_xp}
            </div>
            <p className="text-xs text-purple-600/80 mt-1">
              Level {progress.current_cefr_level} 🎯
            </p>
          </CardContent>
        </Card>

        {/* Today's Practice */}
        <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:border-green-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-green-700">
              <div className="p-1 bg-green-100 rounded-full group-hover:animate-pulse">
                <Trophy className="h-3 w-3" />
              </div>
              Today's Practice
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 animate-scale-in">
              {formatTime(todaysSpeakingTime)}
            </div>
            <p className="text-xs text-green-600/80 mt-1">
              Keep it up! 💪
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Badges Section */}
      {progress.badges_earned && progress.badges_earned.length > 0 && (
        <Card className="animate-fade-in bg-gradient-to-br from-background to-muted/20 border-2 border-dashed border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-2 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full">
                <Award className="h-5 w-5 text-yellow-600" />
              </div>
              Your Achievements
              <Badge variant="secondary" className="ml-2">
                {progress.badges_earned.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {progress.badges_earned.map((badge, index) => (
                <div key={badge} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                  {getBadgeDisplay(badge)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
