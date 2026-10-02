import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Target,
  Calendar,
  Clock,
  Star,
  BookOpen,
  CheckCircle,
  Trophy,
  Zap,
  Layers,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useUserProgress } from '@/hooks/useProgress';
import { useStudentLevel } from '@/hooks/useStudentLevel';
import {
  fetchHubLessonSequence,
  normalizeCefr,
  readLessonPointerState,
  type Hub,
  type LessonMeta,
} from '@/services/activeCoreLessonResolver';
import { MemoryBank } from './MemoryBank';

const LEVEL_ORDER = ['Pre-A1', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

interface PathLesson extends LessonMeta {
  description: string | null;
  duration_minutes: number | null;
  xp_reward: number | null;
}

interface UnitGroup {
  unitNumber: number | null;
  lessons: PathLesson[];
}

function toCoreHub(level: string | null): Hub {
  if (level === 'professional') return 'success';
  if (level === 'academy') return 'academy';
  return 'playground';
}

/**
 * The student's learning path: the level their teacher saved in the trial
 * class (or their placement test), that level's lessons for their hub in
 * teaching order, and "Up next" on the lesson their path points to
 * (student_lesson_pointers — the same pointer the classroom opens).
 */
export const LearningPathTab = () => {
  const { user } = useAuth();
  const { studentLevel } = useStudentLevel();
  const hub = toCoreHub(studentLevel);

  const { data: userProgress = [] } = useUserProgress(user?.id);
  const progressMap = React.useMemo(() => {
    const map: Record<string, { status: string; score: number | null }> = {};
    userProgress.forEach((p: any) => {
      map[p.lesson_id] = { status: p.status, score: p.score };
    });
    return map;
  }, [userProgress]);

  const { data, isLoading } = useQuery({
    queryKey: ['learning-path', user?.id, hub],
    enabled: !!user?.id,
    queryFn: async () => {
      const uid = user!.id;
      const [placementRes, profileRes, pointer, sequence] = await Promise.all([
        (supabase as any)
          .from('placement_results')
          .select('cefr_level, method, created_at')
          .eq('student_id', uid)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        (supabase as any)
          .from('student_profiles')
          .select('final_cefr_level')
          .eq('user_id', uid)
          .maybeSingle(),
        readLessonPointerState(uid),
        fetchHubLessonSequence(hub),
      ]);

      const savedLevel =
        normalizeCefr(placementRes.data?.cefr_level) ??
        normalizeCefr(profileRes.data?.final_cefr_level);

      // The pointer may sit in a later level once the student moves up —
      // follow it; otherwise show the saved level.
      const pointerId = pointer.currentLessonId;
      const pointerLesson = pointerId ? sequence.find(l => l.id === pointerId) ?? null : null;
      const pathLevel = normalizeCefr(pointerLesson?.slot_cefr_level) ?? savedLevel;

      const levelLessons = pathLevel
        ? sequence.filter(l => normalizeCefr(l.slot_cefr_level) === pathLevel)
        : [];

      // Extra display fields for just this level's lessons.
      let extras: Record<string, Partial<PathLesson>> = {};
      if (levelLessons.length) {
        const { data: rows } = await supabase
          .from('curriculum_lessons')
          .select('id, description, duration_minutes, xp_reward')
          .in('id', levelLessons.map(l => l.id));
        extras = Object.fromEntries((rows ?? []).map((r: any) => [r.id, r]));
      }

      return {
        savedLevel,
        pathLevel,
        fromTrial: placementRes.data?.method === 'trial_lesson',
        pointerId: pointerLesson ? pointerId : null,
        // Finished everything published at this level so far.
        finishedPointer: !!pointerLesson && pointer.lastCompletedLessonId === pointerId,
        lessons: levelLessons.map(l => ({
          ...l,
          description: null,
          duration_minutes: null,
          xp_reward: null,
          ...extras[l.id],
        })) as PathLesson[],
      };
    },
  });

  const lessons = data?.lessons ?? [];
  const pointerIndex = data?.pointerId ? lessons.findIndex(l => l.id === data.pointerId) : -1;

  const finishedPointer = !!data?.finishedPointer && pointerIndex >= 0;
  const isDone = (l: PathLesson, i: number) =>
    progressMap[l.id]?.status === 'completed' ||
    (pointerIndex >= 0 && (i < pointerIndex || (finishedPointer && i === pointerIndex)));

  // Up next: the pointer lesson — or, once it's finished, the next lesson
  // published at this level since (new units join the path in order).
  // Without a pointer: the first lesson not yet done.
  const upNextIndex = pointerIndex >= 0
    ? (finishedPointer ? (pointerIndex + 1 < lessons.length ? pointerIndex + 1 : -1) : pointerIndex)
    : lessons.findIndex((l, i) => !isDone(l, i));
  const waitingForNew = finishedPointer && upNextIndex < 0;

  const groups: UnitGroup[] = React.useMemo(() => {
    const byUnit = new Map<string, UnitGroup>();
    for (const l of lessons) {
      const n = l.slot_unit_number == null || String(l.slot_unit_number).trim() === '' ? null : Number(l.slot_unit_number);
      const key = String(n);
      if (!byUnit.has(key)) byUnit.set(key, { unitNumber: n, lessons: [] });
      byUnit.get(key)!.lessons.push(l);
    }
    return Array.from(byUnit.values());
  }, [lessons]);

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

  const doneCount = lessons.filter((l, i) => isDone(l, i)).length;
  const progressPct = lessons.length ? Math.round((doneCount / lessons.length) * 100) : 0;
  const earnedXP = lessons.filter((l, i) => isDone(l, i)).reduce((sum, l) => sum + (l.xp_reward || 0), 0);
  const upNext = upNextIndex >= 0 ? lessons[upNextIndex] : null;
  const levelLabel = data?.pathLevel ?? null;

  return (
    <div className="space-y-6">
      {/* Header with level */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            Your Path to Fluency
          </h1>
          <p className="text-muted-foreground mt-1">
            {levelLabel
              ? data?.fromTrial && data.savedLevel === levelLabel
                ? `Level ${levelLabel} · set by your teacher in your trial lesson`
                : `Level ${levelLabel}`
              : 'Your level appears here after your trial lesson or placement test.'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {levelLabel && (
            <div className="rounded-full px-4 py-1.5 text-lg font-extrabold bg-primary/10 text-primary ring-1 ring-primary/30">
              {levelLabel}
            </div>
          )}
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">{earnedXP} XP</div>
            <div className="text-sm text-muted-foreground">Total Earned</div>
          </div>
        </div>
      </div>

      {/* Long-term memory widget — Spaced Repetition System */}
      <MemoryBank />

      {upNext && (
        <Card className="ring-2 ring-primary bg-primary/5">
          <CardContent className="flex items-center gap-4 py-5">
            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
              <ArrowRight className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold uppercase tracking-wider text-primary">Up next in your class</div>
              <div className="font-semibold truncate">{upNext.title}</div>
              <div className="text-xs text-muted-foreground">
                {levelLabel} · Unit {upNext.slot_unit_number ?? '—'} · Lesson {upNext.slot_lesson_number ?? '—'}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {waitingForNew && (
        <Card className="ring-2 ring-emerald-400/60 bg-emerald-50/60 dark:bg-emerald-950/20">
          <CardContent className="flex items-center gap-4 py-5">
            <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">All caught up</div>
              <div className="font-semibold">You finished every {levelLabel} lesson so far!</div>
              <div className="text-xs text-muted-foreground">
                New lessons are on the way. The next one appears here, in order, as soon as it's added.
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Your Progress Journey{levelLabel ? ` · ${levelLabel}` : ''}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Level progress</span>
              <span>{progressPct}% Complete</span>
            </div>
            <Progress value={progressPct} className="h-3" />

            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="text-center">
                <div className="text-lg font-bold text-primary">{groups.length}</div>
                <div className="text-xs text-muted-foreground">Units</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">{doneCount} / {lessons.length}</div>
                <div className="text-xs text-muted-foreground">Lessons done</div>
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

        {groups.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {levelLabel ? `No ${levelLabel} lessons yet` : 'Your path starts after your trial lesson'}
              </h3>
              <p className="text-muted-foreground">
                {levelLabel
                  ? 'Check back soon for new lessons at your level!'
                  : 'Your teacher will set your level in your trial class, and your lessons will appear here.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          groups.map((group) => {
            const isCurrentUnit = upNext ? group.lessons.some(l => l.id === upNext.id) : false;
            return (
              <Card
                key={String(group.unitNumber)}
                className={`transition-all duration-200 hover:shadow-md ${isCurrentUnit ? 'ring-2 ring-primary bg-primary/5' : ''}`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${isCurrentUnit ? 'bg-primary' : 'bg-muted-foreground/50'}`}>
                        <Layers className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-lg">
                          {group.unitNumber != null ? `${levelLabel} · Unit ${group.unitNumber}` : `${levelLabel} lessons`}
                        </div>
                        <div className="text-sm text-muted-foreground font-normal">
                          {group.lessons.length} lesson{group.lessons.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </CardTitle>
                    {isCurrentUnit && (
                      <Badge variant="default" className="bg-primary">Current</Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-2">
                    {group.lessons.map((lesson) => {
                      const i = lessons.indexOf(lesson);
                      const done = isDone(lesson, i);
                      const next = i === upNextIndex;
                      return (
                        <div
                          key={lesson.id}
                          className={`flex items-center justify-between p-3 rounded-lg border ${next ? 'bg-primary/10 border-primary/40' : 'bg-background'}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                              done ? 'bg-green-500 text-white' : next ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                            }`}>
                              {done ? <CheckCircle className="h-3 w-3" /> : lesson.slot_lesson_number ?? i + 1}
                            </div>
                            <div>
                              <div className="font-medium text-sm">{lesson.title}</div>
                              <div className="text-xs text-muted-foreground flex items-center gap-2">
                                <span>Lesson {lesson.slot_lesson_number ?? i + 1}</span>
                                {lesson.duration_minutes ? (
                                  <>
                                    <span>•</span>
                                    <Clock className="h-3 w-3" />
                                    {lesson.duration_minutes} min
                                  </>
                                ) : null}
                                {lesson.xp_reward ? (
                                  <>
                                    <span>•</span>
                                    <Star className="h-3 w-3 text-yellow-500" />
                                    {lesson.xp_reward} XP
                                  </>
                                ) : null}
                              </div>
                            </div>
                          </div>
                          {next && <Badge className="bg-primary">Up next</Badge>}
                          {done && !next && <Badge variant="outline" className="text-green-600 border-green-300">Done</Badge>}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Motivational Footer */}
      <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <CardContent className="text-center py-6">
          <Zap className="h-8 w-8 mx-auto mb-2 text-yellow-300" />
          <h3 className="text-lg font-bold mb-2">You're Doing Amazing!</h3>
          <p className="opacity-90">
            Every lesson brings you closer to English fluency. 🚀
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
