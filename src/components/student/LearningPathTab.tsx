import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Target,
  Calendar,
  CheckCircle,
  Trophy,
  Zap,
  Layers,
  Loader2,
  ArrowRight,
  Clock,
  Sparkles,
} from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useStudentLevel } from '@/hooks/useStudentLevel';
import {
  fetchLevelMap,
  normalizeCefr,
  resolveStudentPath,
  type Hub,
  type LevelMapUnit,
  type StudentPath,
} from '@/services/activeCoreLessonResolver';
import { MemoryBank } from './MemoryBank';

const UNITS_PER_LEVEL = 10;

type SlotStatus = 'known' | 'done' | 'next' | 'next_soon' | 'upcoming' | 'coming_soon';

function toCoreHub(level: string | null): Hub {
  if (level === 'professional') return 'success';
  if (level === 'academy') return 'academy';
  return 'playground';
}

/**
 * The student's learning path for their level: all 10 units of the
 * curriculum blueprint (built or coming soon), in order. Units the trial
 * teacher marked as already known show as "Known", finished lessons as
 * done, the lesson their path points to as "Up next", and lessons not built
 * yet as "Coming soon" — they join the path automatically once added.
 */
export const LearningPathTab = () => {
  const { user } = useAuth();
  const { studentLevel } = useStudentLevel();
  const hub = toCoreHub(studentLevel);

  const { data, isLoading } = useQuery({
    queryKey: ['learning-path', user?.id, hub],
    enabled: !!user?.id,
    queryFn: async () => {
      const uid = user!.id;
      const [path, priorRes, placementRes] = await Promise.all([
        resolveStudentPath(uid),
        (supabase as any)
          .from('student_prior_knowledge')
          .select('cefr_level, start_unit, unit_marks')
          .eq('student_id', uid)
          .maybeSingle(),
        (supabase as any)
          .from('placement_results')
          .select('cefr_level, method')
          .eq('student_id', uid)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);
      const prior = priorRes.data as { cefr_level: string | null; start_unit: number; unit_marks: Record<string, string> } | null;
      const level =
        normalizeCefr(path?.level) ??
        normalizeCefr(prior?.cefr_level) ??
        normalizeCefr(placementRes.data?.cefr_level);
      const map = level ? await fetchLevelMap(hub, level) : [];
      return {
        path: path as StudentPath | null,
        level,
        map,
        prior: prior && normalizeCefr(prior.cefr_level) === level ? prior : null,
        fromTrial: placementRes.data?.method === 'trial_lesson',
      };
    },
  });

  const level = data?.level ?? null;
  const path = data?.path ?? null;
  const prior = data?.prior ?? null;

  const units: LevelMapUnit[] = React.useMemo(() => {
    const byNumber = new Map((data?.map ?? []).map(u => [u.unitNumber, u]));
    return Array.from({ length: UNITS_PER_LEVEL }, (_, i) =>
      byNumber.get(i + 1) ?? { unitNumber: i + 1, unitTitle: null, lessons: [] });
  }, [data?.map]);

  const statusOf = (unit: number, lesson: number, published: boolean): SlotStatus => {
    const pu = path?.unit ?? null;
    const pl = path?.lesson ?? null;
    if (pu == null || pl == null) {
      return published ? 'upcoming' : 'coming_soon';
    }
    const before = unit < pu || (unit === pu && lesson < pl);
    const at = unit === pu && lesson === pl;
    if (before) {
      const knownUnit = prior && (unit < (prior.start_unit ?? 1) || prior.unit_marks?.[String(unit)] === 'known');
      return knownUnit ? 'known' : 'done';
    }
    if (at) {
      if (path?.mode === 'level_complete') return 'done';
      return published ? 'next' : 'next_soon';
    }
    return published ? 'upcoming' : 'coming_soon';
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

  const slots = units.flatMap(u => u.lessons.map(l => ({ u: u.unitNumber, l, status: statusOf(u.unitNumber, l.lesson, l.published) })));
  const doneCount = slots.filter(s => s.status === 'done' || s.status === 'known').length;
  const progressPct = slots.length ? Math.round((doneCount / slots.length) * 100) : 0;
  const builtCount = slots.filter(s => s.l.published).length;
  const upNext = slots.find(s => s.status === 'next' || s.status === 'next_soon') ?? null;
  const upNextUnit = upNext ? units.find(u => u.unitNumber === upNext.u) : null;

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
            {level
              ? data?.fromTrial
                ? `Level ${level} · set by your teacher in your trial lesson${prior && prior.start_unit > 1 ? ` · starting at Unit ${prior.start_unit}` : ''}`
                : `Level ${level}`
              : 'Your level appears here after your trial lesson or placement test.'}
          </p>
        </div>
        {level && (
          <div className="rounded-full px-4 py-1.5 text-lg font-extrabold bg-primary/10 text-primary ring-1 ring-primary/30">
            {level}
          </div>
        )}
      </div>

      {/* Long-term memory widget — Spaced Repetition System */}
      <MemoryBank />

      {path?.mode === 'level_complete' ? (
        <Card className="ring-2 ring-emerald-400/60 bg-emerald-50/60 dark:bg-emerald-950/20">
          <CardContent className="flex items-center gap-4 py-5">
            <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Level complete</div>
              <div className="font-semibold">You finished every {level} lesson!</div>
              <div className="text-xs text-muted-foreground">Your teacher will move you up to the next level.</div>
            </div>
          </CardContent>
        </Card>
      ) : upNext ? (
        <Card className="ring-2 ring-primary bg-primary/5">
          <CardContent className="flex items-center gap-4 py-5">
            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
              {upNext.status === 'next' ? <ArrowRight className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold uppercase tracking-wider text-primary">
                {upNext.status === 'next' ? 'Up next in your class' : 'Up next · coming soon'}
              </div>
              <div className="font-semibold truncate">{upNext.l.title}</div>
              <div className="text-xs text-muted-foreground">
                {level} · Unit {upNext.u}{upNextUnit?.unitTitle ? ` (${upNextUnit.unitTitle})` : ''} · Lesson {upNext.l.lesson}
                {upNext.status === 'next_soon' && ' — this lesson is being made. Your classes review earlier lessons until it opens.'}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Your Progress Journey{level ? ` · ${level}` : ''}
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
                <div className="text-lg font-bold text-primary">{UNITS_PER_LEVEL}</div>
                <div className="text-xs text-muted-foreground">Units</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">{doneCount} / {slots.length}</div>
                <div className="text-xs text-muted-foreground">Lessons done</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">{builtCount}</div>
                <div className="text-xs text-muted-foreground">Lessons ready</div>
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

        {!level ? (
          <Card>
            <CardContent className="text-center py-12">
              <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Your path starts after your trial lesson</h3>
              <p className="text-muted-foreground">
                Your teacher will set your level in your trial class, and your lessons will appear here.
              </p>
            </CardContent>
          </Card>
        ) : (
          units.map((unit) => {
            const unitSlots = slots.filter(s => s.u === unit.unitNumber);
            const isCurrentUnit = upNext?.u === unit.unitNumber;
            const allKnown = unitSlots.length > 0 && unitSlots.every(s => s.status === 'known');
            const allDone = unitSlots.length > 0 && unitSlots.every(s => s.status === 'done' || s.status === 'known');
            const anyBuilt = unitSlots.some(s => s.l.published);
            return (
              <Card
                key={unit.unitNumber}
                className={`transition-all duration-200 ${isCurrentUnit ? 'ring-2 ring-primary bg-primary/5' : ''} ${!anyBuilt && !allDone ? 'opacity-75' : ''}`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between gap-3">
                    <CardTitle className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                        allDone ? 'bg-green-500' : isCurrentUnit ? 'bg-primary' : 'bg-muted-foreground/50'
                      }`}>
                        {allDone ? <CheckCircle className="h-5 w-5" /> : <Layers className="h-5 w-5" />}
                      </div>
                      <div>
                        <div className="text-lg">
                          Unit {unit.unitNumber}{unit.unitTitle ? `: ${unit.unitTitle}` : ''}
                        </div>
                        <div className="text-sm text-muted-foreground font-normal">
                          {unitSlots.length
                            ? `${unitSlots.length} lessons${anyBuilt ? '' : ' · coming soon'}`
                            : 'Coming soon'}
                        </div>
                      </div>
                    </CardTitle>
                    {allKnown ? (
                      <Badge variant="outline" className="text-emerald-700 border-emerald-300">Known (from trial)</Badge>
                    ) : allDone ? (
                      <Badge variant="outline" className="text-green-600 border-green-300">Done</Badge>
                    ) : isCurrentUnit ? (
                      <Badge className="bg-primary">Current</Badge>
                    ) : !anyBuilt ? (
                      <Badge variant="outline" className="text-muted-foreground">Coming soon</Badge>
                    ) : null}
                  </div>
                </CardHeader>

                {unitSlots.length > 0 && !allKnown && (
                  <CardContent>
                    <div className="space-y-2">
                      {unitSlots.map(({ l, status }) => {
                        const next = status === 'next' || status === 'next_soon';
                        const done = status === 'done' || status === 'known';
                        const soon = status === 'coming_soon' || status === 'next_soon';
                        return (
                          <div
                            key={l.id}
                            className={`flex items-center justify-between p-3 rounded-lg border ${next ? 'bg-primary/10 border-primary/40' : 'bg-background'} ${soon && !next ? 'opacity-70' : ''}`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                                done ? 'bg-green-500 text-white' : next ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                              }`}>
                                {done ? <CheckCircle className="h-3 w-3" /> : l.lesson}
                              </div>
                              <div>
                                <div className="font-medium text-sm">{l.title}</div>
                                <div className="text-xs text-muted-foreground">Lesson {l.lesson}</div>
                              </div>
                            </div>
                            {next && <Badge className="bg-primary">{status === 'next' ? 'Up next' : 'Up next · soon'}</Badge>}
                            {status === 'done' && <Badge variant="outline" className="text-green-600 border-green-300">Done</Badge>}
                            {status === 'known' && <Badge variant="outline" className="text-emerald-700 border-emerald-300">Known</Badge>}
                            {status === 'coming_soon' && <Badge variant="outline" className="text-muted-foreground">Coming soon</Badge>}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                )}
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
