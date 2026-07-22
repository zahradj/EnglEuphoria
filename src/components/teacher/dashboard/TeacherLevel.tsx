import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Award } from 'lucide-react';

export const TeacherLevel = () => {
  const currentLevel = "Major";
  const ratePerLesson = 20;
  const nextLevel = "Master";
  const progress = 65;

  return (
    <Card className="border border-border shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
          <Award className="h-4 w-4 text-accent" />
          Your level
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Current Level</span>
            <span className="text-lg font-bold text-accent">{currentLevel}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Rate per lesson</span>
            <span className="text-base font-semibold text-foreground">${ratePerLesson}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Progress to {nextLevel}</span>
            <span className="font-medium text-foreground">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
};
