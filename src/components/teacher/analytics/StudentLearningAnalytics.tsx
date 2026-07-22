import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, BookOpen, Trophy, Star, Target, Sparkles, TrendingUp } from 'lucide-react';
import { DynamicAvatar } from '@/components/student/DynamicAvatar';
import { StudentStatusCard } from './StudentStatusCard';
import { WeeklyStreakCalendar } from './WeeklyStreakCalendar';
import { GiftAccessoryButton } from './GiftAccessoryButton';
import { ClassFrictionHeatmap } from './ClassFrictionHeatmap';
import { motion, AnimatePresence } from 'framer-motion';

interface StudentLearningAnalyticsProps {
  teacherId: string;
}

const WEEKLY_GOAL_MINUTES = 150;

const LEVEL_LABELS: Record<number, string> = {
  1: 'The Magical Forest',
  2: 'The Crystal Cave',
  3: 'The Cloud Kingdom',
  4: 'The Ocean Depths',
  5: 'The Star Summit',
};

export const StudentLearningAnalytics: React.FC<StudentLearningAnalyticsProps> = ({ teacherId }) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // Fetch students linked to this teacher
  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: ['teacher-linked-students', teacherId],
    queryFn: async () => {
      const { data: bookings } = await supabase
        .from('class_bookings')
        .select('student_id')
        .eq('teacher_id', teacherId);
      const uniqueIds = [...new Set(bookings?.map(b => b.student_id) || [])];
      if (!uniqueIds.length) return [];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name, email, current_level')
        .in('id', uniqueIds);
      return profiles || [];
    },
    enabled: !!teacherId,
  });

  const activeStudentId = selectedStudentId || students[0]?.id || null;

  // Fetch lesson progress for selected student
  const { data: lessonProgress = [] } = useQuery({
    queryKey: ['student-lesson-progress', activeStudentId],
    queryFn: async () => {
      const { data } = await supabase
        .from('interactive_lesson_progress')
        .select('*, lesson:curriculum_lessons(title, difficulty_level, duration_minutes, content)')
        .eq('student_id', activeStudentId!);
      return data || [];
    },
    enabled: !!activeStudentId,
  });

  // Fetch student inventory (accessories)
  const { data: inventoryItems = [] } = useQuery({
    queryKey: ['student-inventory-analytics', activeStudentId],
    queryFn: async () => {
      const { data } = await supabase
        .from('student_inventory')
        .select('*, accessory:accessories(name, type, image_url, hub_requirement)')
        .eq('student_id', activeStudentId!);
      return data || [];
    },
    enabled: !!activeStudentId,
  });

  // Calculate metrics
  const metrics = useMemo(() => {
    const completedLessons = lessonProgress.filter((p: any) => p.completed);
    const totalMinutes = completedLessons.reduce((sum: number, p: any) => {
      return sum + ((p.lesson as any)?.duration_minutes || 30);
    }, 0);
    const weeklyMinutes = Math.min(totalMinutes, WEEKLY_GOAL_MINUTES);
    const equippedCount = inventoryItems.filter((i: any) => i.is_equipped).length;
    const totalAccessories = inventoryItems.length;

    // Build mastery grid (5 levels, up to 10 lessons each)
    const masteryGrid: { level: number; lessons: { id: string; title: string; status: 'mastered' | 'in_progress' | 'locked' }[] }[] = [];
    for (let lvl = 1; lvl <= 5; lvl++) {
      const levelLessons = lessonProgress
        .filter((p: any) => {
          const diff = (p.lesson as any)?.difficulty_level || '';
          return diff.includes(String(lvl)) || diff.toLowerCase() === `level ${lvl}`;
        })
        .map((p: any) => ({
          id: p.id,
          title: (p.lesson as any)?.title || `Lesson ${lvl}`,
          status: (p.completed ? 'mastered' : 'in_progress') as 'mastered' | 'in_progress' | 'locked',
        }));

      // Pad with locked slots if fewer than expected
      while (levelLessons.length < 3) {
        levelLessons.push({ id: `locked-${lvl}-${levelLessons.length}`, title: 'Locked', status: 'locked' as const });
      }
      masteryGrid.push({ level: lvl, lessons: levelLessons });
    }

    return { completedLessons: completedLessons.length, totalMinutes, weeklyMinutes, equippedCount, totalAccessories, masteryGrid };
  }, [lessonProgress, inventoryItems]);

  const weeklyProgress = Math.round((metrics.weeklyMinutes / WEEKLY_GOAL_MINUTES) * 100);
  const activeStudent = students.find((s: any) => s.id === activeStudentId);

  if (studentsLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (!students.length) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground">No Students Yet</h3>
          <p className="text-muted-foreground mt-2">Students will appear here once they book sessions with you.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <ClassFrictionHeatmap teacherId={teacherId} />
      {/* Student Selector + Gift Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          Learning Analytics
        </h2>
        <div className="flex items-center gap-2">
          {activeStudentId && (
            <GiftAccessoryButton
              studentId={activeStudentId}
              studentName={activeStudent?.display_name || 'Student'}
            />
          )}
          <Select value={activeStudentId || ''} onValueChange={setSelectedStudentId}>
            <SelectTrigger className="w-[240px]">
              <SelectValue placeholder="Select student" />
            </SelectTrigger>
            <SelectContent>
              {students.map((s: any) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.display_name || s.email || 'Student'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Student Status Card */}
      {activeStudentId && (
        <StudentStatusCard
          studentId={activeStudentId}
          studentName={activeStudent?.display_name || 'Student'}
          cefrLevel={activeStudent?.current_level || 'Pre-A1'}
        />
      )}

      {/* Weekly Streak Calendar */}
      {activeStudentId && (
        <WeeklyStreakCalendar studentId={activeStudentId} />
      )}

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Weekly Clock - Radial Progress */}
        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Weekly Learning Clock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-4">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                  <motion.circle
                    cx="60" cy="60" r="52" fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 52}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 52 * (1 - weeklyProgress / 100) }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-foreground">{metrics.weeklyMinutes}</span>
                  <span className="text-xs text-muted-foreground">/ {WEEKLY_GOAL_MINUTES}m</span>
                </div>
              </div>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              {weeklyProgress >= 100 ? '🎉 Weekly goal reached!' : `${100 - weeklyProgress}% to weekly goal`}
            </p>
          </CardContent>
        </Card>

        {/* Session & Vocabulary Stats */}
        <Card className="border-accent/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="h-4 w-4" />
              Learning Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Lessons Completed</span>
              <Badge variant="secondary" className="font-mono">{metrics.completedLessons}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Minutes</span>
              <Badge variant="secondary" className="font-mono">{metrics.totalMinutes}m</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Accessories Earned</span>
              <Badge variant="secondary" className="font-mono">{metrics.totalAccessories}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">CEFR Level</span>
              <Badge className="bg-primary/10 text-primary">{activeStudent?.current_level || 'Pre-A1'}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Vault Preview - Avatar with Accessories */}
        <Card className="border-secondary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Avatar Vault
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-3">
              <DynamicAvatar studentId={activeStudentId || ''} hub="playground" size="md" />
              <div className="flex flex-wrap gap-1 justify-center">
                {inventoryItems.slice(0, 5).map((item: any) => (
                  <Badge key={item.id} variant={item.is_equipped ? 'default' : 'outline'} className="text-xs">
                    {item.is_equipped && <Star className="h-3 w-3 mr-1" />}
                    {(item.accessory as any)?.name || 'Item'}
                  </Badge>
                ))}
                {inventoryItems.length === 0 && (
                  <p className="text-xs text-muted-foreground">No accessories yet</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mastery Grid - Level Pathway */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            Curriculum Mastery Pathway
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.masteryGrid.map((level) => (
              <div key={level.level} className="flex items-center gap-4">
                <div className="w-32 shrink-0">
                  <p className="text-sm font-medium text-foreground">Level {level.level}</p>
                  <p className="text-xs text-muted-foreground truncate">{LEVEL_LABELS[level.level] || `Level ${level.level}`}</p>
                </div>
                <div className="flex gap-2 flex-1 flex-wrap">
                  <AnimatePresence>
                    {level.lessons.map((lesson, idx) => (
                      <motion.div
                        key={lesson.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`
                          h-8 w-8 rounded-md flex items-center justify-center text-xs font-bold
                          ${lesson.status === 'mastered'
                            ? 'bg-emerald-500/20 text-emerald-600 border border-emerald-500/30'
                            : lesson.status === 'in_progress'
                              ? 'bg-amber-500/20 text-amber-600 border border-amber-500/30'
                              : 'bg-muted text-muted-foreground border border-border'
                          }
                        `}
                        title={lesson.title}
                      >
                        {lesson.status === 'mastered' ? '✓' : lesson.status === 'in_progress' ? '◎' : '🔒'}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Victory Alert Preview */}
      {metrics.completedLessons > 0 && (
        <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <CardContent className="py-4 flex items-center gap-4">
            <span className="text-3xl">✋</span>
            <div>
              <p className="font-semibold text-foreground">
                High Five! {activeStudent?.display_name || 'Student'} completed {metrics.completedLessons} lesson{metrics.completedLessons > 1 ? 's' : ''} and earned {metrics.totalAccessories} accessory{metrics.totalAccessories !== 1 ? 'ies' : ''}!
              </p>
              <p className="text-sm text-muted-foreground">
                Total study time: {metrics.totalMinutes} minutes this week.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
