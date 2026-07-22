import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Target, ArrowUp, Award } from 'lucide-react';

interface SpeakingLevelIndicatorProps {
  currentLevel: string;
  speakingXP: number;
}

const levelData = {
  'A1': { name: 'Beginner', color: 'from-green-400 to-emerald-500', xpRange: [0, 500], next: 'A2' },
  'A2': { name: 'Elementary', color: 'from-blue-400 to-cyan-500', xpRange: [500, 1200], next: 'B1' },
  'B1': { name: 'Intermediate', color: 'from-purple-400 to-violet-500', xpRange: [1200, 2200], next: 'B2' },
  'B2': { name: 'Upper Intermediate', color: 'from-orange-400 to-amber-500', xpRange: [2200, 3500], next: 'C1' },
  'C1': { name: 'Advanced', color: 'from-red-400 to-pink-500', xpRange: [3500, 5000], next: 'C2' },
  'C2': { name: 'Mastery', color: 'from-indigo-400 to-purple-600', xpRange: [5000, 10000], next: null }
};

export const SpeakingLevelIndicator: React.FC<SpeakingLevelIndicatorProps> = ({
  currentLevel,
  speakingXP
}) => {
  const level = levelData[currentLevel as keyof typeof levelData] || levelData.A1;
  const [minXP, maxXP] = level.xpRange;
  const progressInLevel = Math.max(0, speakingXP - minXP);
  const xpNeededForLevel = maxXP - minXP;
  const progressPercentage = Math.min((progressInLevel / xpNeededForLevel) * 100, 100);
  const xpToNextLevel = Math.max(0, maxXP - speakingXP);

  return (
    <Card className="overflow-hidden bg-gradient-to-br from-background to-muted/20 border-2 border-primary/10">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 bg-gradient-to-br ${level.color} rounded-full flex items-center justify-center text-white font-bold text-lg`}>
              {currentLevel}
            </div>
            <div>
              <h3 className="font-semibold text-lg">{level.name} Speaker</h3>
              <p className="text-sm text-muted-foreground">CEFR Level {currentLevel}</p>
            </div>
          </div>
          
          {level.next && (
            <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary">
              <Target className="h-3 w-3 mr-1" />
              Next: {level.next}
            </Badge>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Level Progress</span>
            <span className="font-medium">
              {progressInLevel.toLocaleString()} / {xpNeededForLevel.toLocaleString()} XP
            </span>
          </div>
          
          <Progress 
            value={progressPercentage} 
            className={`h-3 bg-muted [&>div]:bg-gradient-to-r [&>div]:${level.color} [&>div]:animate-pulse`}
          />
          
          {level.next && xpToNextLevel > 0 && (
            <div className="flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg">
              <ArrowUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">
                {xpToNextLevel.toLocaleString()} XP to reach {level.next}
              </span>
            </div>
          )}
          
          {currentLevel === 'C2' && (
            <div className="flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
              <Award className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-700">
                🎉 Congratulations! You've reached mastery level!
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};