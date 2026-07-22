import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sword, BookOpen, CheckCircle2, Lock, Play } from 'lucide-react';
import { useIronLessons, IronLesson } from '@/hooks/useIronLessons';
import { IronLessonPlayer } from './IronLessonPlayer';
import { cn } from '@/lib/utils';

const COHORT_THEMES = {
  A: {
    name: 'Foundation',
    gradient: 'from-blue-500 to-blue-600',
    bg: 'bg-blue-50 dark:bg-blue-950',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-600 dark:text-blue-400',
  },
  B: {
    name: 'Bridge',
    gradient: 'from-amber-500 to-amber-600',
    bg: 'bg-amber-50 dark:bg-amber-950',
    border: 'border-amber-200 dark:border-amber-800',
    text: 'text-amber-600 dark:text-amber-400',
  },
  C: {
    name: 'Mastery',
    gradient: 'from-emerald-500 to-emerald-600',
    bg: 'bg-emerald-50 dark:bg-emerald-950',
    border: 'border-emerald-200 dark:border-emerald-800',
    text: 'text-emerald-600 dark:text-emerald-400',
  },
};

interface IronStudentDashboardProps {
  cohortGroup: 'A' | 'B' | 'C';
}

export const IronStudentDashboard: React.FC<IronStudentDashboardProps> = ({ cohortGroup }) => {
  const [selectedLesson, setSelectedLesson] = useState<IronLesson | null>(null);
  const theme = COHORT_THEMES[cohortGroup];

  const { data: lessons, isLoading } = useIronLessons({
    cohortGroup,
    status: 'live',
  });

  if (selectedLesson) {
    return (
      <IronLessonPlayer
        lesson={selectedLesson}
        onBack={() => setSelectedLesson(null)}
      />
    );
  }

  return (
    <div className={cn('min-h-dvh p-6', theme.bg)}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={cn('w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br', theme.gradient)}>
              <Sword className="h-7 w-7 text-white" />
            </div>
            <div>
              <Badge className={cn('bg-gradient-to-r text-white mb-1', theme.gradient)}>
                Cohort {cohortGroup}: {theme.name}
              </Badge>
              <h1 className="text-2xl font-bold text-foreground">Iron Curriculum</h1>
              <p className="text-sm text-muted-foreground">Your PPP Learning Journey</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className={cn('border', theme.border)}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Available Lessons</p>
                  <p className="text-2xl font-bold">{lessons?.length || 0}</p>
                </div>
                <BookOpen className={cn('h-8 w-8', theme.text)} />
              </div>
            </CardContent>
          </Card>
          <Card className={cn('border', theme.border)}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>
          <Card className={cn('border', theme.border)}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Progress</p>
                  <p className="text-2xl font-bold">0%</p>
                </div>
                <Progress value={0} className="w-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lessons Grid */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Available Lessons</h2>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded w-3/4 mb-4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : lessons?.length === 0 ? (
            <Card className={cn('border', theme.border)}>
              <CardContent className="py-12 text-center">
                <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg mb-2">No Lessons Available</h3>
                <p className="text-muted-foreground">
                  Your teacher hasn't published any lessons for your cohort yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lessons?.map((lesson) => (
                <Card
                  key={lesson.id}
                  className={cn(
                    'border cursor-pointer transition-all hover:shadow-md',
                    theme.border
                  )}
                  onClick={() => setSelectedLesson(lesson)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{lesson.title}</CardTitle>
                      <Badge variant="outline">{lesson.cefr_level}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        {lesson.iron_modules?.module_name || 'General'}
                      </div>
                      <Button size="sm" variant="ghost" className={theme.text}>
                        <Play className="h-4 w-4 mr-1" />
                        Start
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
