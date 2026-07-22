import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, TrendingUp } from 'lucide-react';

interface TeacherLevelCardProps {
  currentLevel: string;
  currentRate: number;
  nextLevel: string;
  nextRate: number;
  progressPercent: number;
}

export const TeacherLevelCard: React.FC<TeacherLevelCardProps> = ({
  currentLevel,
  currentRate,
  nextLevel,
  nextRate,
  progressPercent
}) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Award className="w-5 h-5 text-primary" />
          Your Level
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Level */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Badge className="bg-primary text-primary-foreground">{currentLevel}</Badge>
            <span className="text-lg font-bold text-foreground">${currentRate.toFixed(2)}/class</span>
          </div>
          <p className="text-xs text-muted-foreground">Current level</p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress to next level</span>
            <span className="font-medium text-foreground">{progressPercent}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Next Level */}
        <div className="border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <Badge variant="outline">{nextLevel}</Badge>
            </div>
            <span className="font-semibold text-green-600">${nextRate.toFixed(2)}/class</span>
          </div>
          <p className="text-xs text-muted-foreground">Next level (estimated)</p>
        </div>
      </CardContent>
    </Card>
  );
};
