import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Target, 
  Calendar, 
  Clock, 
  Star, 
  BookOpen, 
  Play, 
  CheckCircle,
  Trophy,
  Rocket,
  Zap,
  Layers,
  Loader2
} from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useUserProgress, useProgressStats } from '@/hooks/useProgress';
import { LessonPlayer } from './LessonPlayer';
import { MemoryBank } from './MemoryBank';
import { CanvasLessonPlayer } from './CanvasLessonPlayer';
import { ProgressOverview } from './ProgressOverview';

interface CurriculumLesson {
  id: string;
  title: string;
  description: string | null;
  sequence_order: number | null;
  duration_minutes: number | null;
  xp_reward: number | null;
  difficulty_level: string;
  content: any;
  unit?: {
    id: string;
    title: string;
    unit_number: number;
  } | null;
}

interface GroupedLessons {
  unit: {
    id: string;
    title: string;
    unit_number: number;
  } | null;
  lessons: CurriculumLesson[];
}

export const LearningPathTab = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [playingLesson, setPlayingLesson] = useState<CurriculumLesson | null>(null);

  // Fetch user progress
  const { data: userProgress = [] } = useUserProgress(user?.id);
  const { data: progressStats } = useProgressStats(user?.id);

  // Create a map of lesson progress for quick lookup
  const progressMap = React.useMemo(() => {
    const map: Record<string, { status: string; score: number | null }> = {};
    userProgress.forEach((p: any) => {
      map[p.lesson_id] = { status: p.status, score: p.score };
    });
    return map;
  }, [userProgress]);

  useEffect(() => {
    const savedProfile = localStorage.getItem('studentProfile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
  }, []);

  // Fetch real curriculum lessons
  const { data: lessons = [], isLoading } = useQuery({
    queryKey: ['learning-path-lessons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('curriculum_lessons')
        .select(`
          id,
          title,
          description,
          sequence_order,
          duration_minutes,
          xp_reward,
          difficulty_level,
          content,
          unit:curriculum_units(id, title, unit_number)
        `)
        .eq('is_published', true)
        .order('sequence_order', { ascending: true });

      if (error) throw error;
      
      // Transform the data to handle Supabase's array return for single relations
      return (data || []).map((item: any) => ({
        ...item,
        unit: Array.isArray(item.unit) ? item.unit[0] : item.unit,
      })) as CurriculumLesson[];
    },
  });

  // Group lessons by unit
  const groupedLessons: GroupedLessons[] = React.useMemo(() => {
    const groups: Map<string | null, GroupedLessons> = new Map();
    
    lessons.forEach((lesson) => {
      const unitKey = lesson.unit?.id || null;
      
      if (!groups.has(unitKey)) {
        groups.set(unitKey, {
          unit: lesson.unit || null,
          lessons: [],
        });
      }
      
      groups.get(unitKey)!.lessons.push(lesson);
    });

    // Sort by unit number
    return Array.from(groups.values()).sort((a, b) => {
      if (!a.unit) return 1;
      if (!b.unit) return -1;
      return a.unit.unit_number - b.unit.unit_number;
    });
  }, [lessons]);

  const getTotalProgress = () => {
    if (lessons.length === 0) return 0;
    const completed = lessons.filter(l => progressMap[l.id]?.status === 'completed').length;
    return Math.round((completed / lessons.length) * 100);
  };

  const getTotalXP = () => {
    return progressStats?.completedLessons 
      ? lessons.filter(l => progressMap[l.id]?.status === 'completed')
          .reduce((sum, l) => sum + (l.xp_reward || 0), 0)
      : 0;
  };

  const getNextLesson = () => {
    // Find first lesson that isn't completed
    for (const group of groupedLessons) {
      for (const lesson of group.lessons) {
        if (progressMap[lesson.id]?.status !== 'completed') {
          return lesson;
        }
      }
    }
    return null;
  };

  const handleStartLesson = (lesson: CurriculumLesson) => {
    setPlayingLesson(lesson);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-3 text-muted-foreground">Loading your learning path...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="text-center py-12">
            <Rocket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Complete Your Profile First!
            </h3>
            <p className="text-muted-foreground mb-4">
              To see your personalized learning path, please complete your student application form.
            </p>
            <Button 
              onClick={() => navigate('/student-application')}
              className="bg-gradient-to-r from-emerald-600 to-blue-600"
            >
              Complete Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const nextLesson = getNextLesson();

  // If playing a lesson, show the player
  if (playingLesson && user) {
    // Detect canvas-based lessons (slides with canvasElements)
    const slides = playingLesson.content?.slides || [];
    const isCanvasLesson = slides.some((s: any) => s.canvasElements && s.canvasElements.length > 0);

    if (isCanvasLesson) {
      return (
        <CanvasLessonPlayer
          slides={slides}
          lessonTitle={playingLesson.title}
          onClose={() => setPlayingLesson(null)}
          onComplete={(score) => {
            setPlayingLesson(null);
          }}
        />
      );
    }

    return (
      <LessonPlayer
        lessonId={playingLesson.id}
        lessonTitle={playingLesson.title}
        slides={slides}
        userId={user.id}
        xpReward={playingLesson.xp_reward || 100}
        onClose={() => setPlayingLesson(null)}
        onComplete={() => {
          setPlayingLesson(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Progress */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            Your Path to Fluency
          </h1>
          <p className="text-muted-foreground mt-1">
            Personalized just for you, {profile?.basicInfo?.name || 'Learner'}! 🌟
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">{getTotalXP()} XP</div>
          <div className="text-sm text-muted-foreground">Total Earned</div>
        </div>
      </div>

      {/* Long-term memory widget — Spaced Repetition System */}
      <MemoryBank />

      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Your Progress Journey
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{Math.round(getTotalProgress())}% Complete</span>
            </div>
            <Progress value={getTotalProgress()} className="h-3" />
            
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="text-center">
                <div className="text-lg font-bold text-primary">
                  {groupedLessons.length}
                </div>
                <div className="text-xs text-muted-foreground">Total Units</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">
                  {lessons.length}
                </div>
                <div className="text-xs text-muted-foreground">Total Lessons</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">
                  {lessons.reduce((acc, l) => acc + (l.xp_reward || 0), 0)}
                </div>
                <div className="text-xs text-muted-foreground">Available XP</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Learning Path by Units */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          Your Learning Journey
        </h2>
        
        {groupedLessons.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No lessons available yet</h3>
              <p className="text-muted-foreground">
                Check back soon for new curriculum content!
              </p>
            </CardContent>
          </Card>
        ) : (
          groupedLessons.map((group, groupIndex) => (
            <Card 
              key={group.unit?.id || 'no-unit'} 
              className={`transition-all duration-200 hover:shadow-md ${
                groupIndex === 0 ? 'ring-2 ring-primary bg-primary/5' : ''
              }`}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center text-white font-bold
                      ${groupIndex === 0 ? 'bg-primary' : 'bg-muted-foreground/50'}
                    `}>
                      {group.unit ? (
                        <Layers className="h-5 w-5" />
                      ) : (
                        groupIndex + 1
                      )}
                    </div>
                    <div>
                      <div className="text-lg">
                        {group.unit 
                          ? `Unit ${group.unit.unit_number}: ${group.unit.title}`
                          : 'General Lessons'
                        }
                      </div>
                      <div className="text-sm text-muted-foreground font-normal">
                        {group.lessons.length} lesson{group.lessons.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </CardTitle>
                  
                  <div className="flex items-center gap-2">
                    {groupIndex === 0 && (
                      <Badge variant="default" className="bg-primary">
                        Current
                      </Badge>
                    )}
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {group.lessons.reduce((acc, l) => acc + (l.xp_reward || 0), 0)} XP
                      </div>
                      <div className="text-xs text-muted-foreground">Total</div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-2">
                  {group.lessons.map((lesson, lessonIndex) => (
                    <div 
                      key={lesson.id} 
                      className="flex items-center justify-between p-3 bg-background rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`
                          w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium
                          ${lessonIndex === 0 && groupIndex === 0 
                            ? 'bg-green-500 text-white' 
                            : 'bg-muted text-muted-foreground'
                          }
                        `}>
                          {lessonIndex === 0 && groupIndex === 0 
                            ? <CheckCircle className="h-3 w-3" /> 
                            : lesson.sequence_order || lessonIndex + 1
                          }
                        </div>
                        <div>
                          <div className="font-medium text-sm">{lesson.title}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-2">
                            {lesson.duration_minutes && (
                              <>
                                <Clock className="h-3 w-3" />
                                {lesson.duration_minutes} min
                              </>
                            )}
                            <span>•</span>
                            <span className="capitalize">{lesson.difficulty_level}</span>
                            {lesson.xp_reward && (
                              <>
                                <span>•</span>
                                <Star className="h-3 w-3 text-yellow-500" />
                                {lesson.xp_reward} XP
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {groupIndex === 0 && lessonIndex === 1 && (
                        <Button size="sm" variant="outline">
                          <Play className="h-3 w-3 mr-1" />
                          Start
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Motivational Footer */}
      <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <CardContent className="text-center py-6">
          <Zap className="h-8 w-8 mx-auto mb-2 text-yellow-300" />
          <h3 className="text-lg font-bold mb-2">You're Doing Amazing!</h3>
          <p className="opacity-90">
            Keep going, {profile?.basicInfo?.name || 'Learner'}! Every lesson brings you closer to English fluency. 🚀
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
