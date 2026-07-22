import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Map, Loader2, Lock, Star, Trophy, AlertCircle, RefreshCw, Sun, Moon, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ConfettiEffect } from '@/components/gamification/ConfettiEffect';
import { useTimeOfDay } from '@/hooks/useTimeOfDay';
import { useReinforcementLesson } from '@/hooks/useReinforcementLesson';
import { sendMasteryReport } from '@/utils/sendMasteryReport';
import lionHero from '@/assets/vocabulary/lion.png';
import lSoundVideo from '@/assets/phonics/l-sound-mechanism.mp4.asset.json';

interface UnitWithLessons {
  id: string;
  title: string;
  unit_number: number;
  cefr_level: string;
  lessons: {
    id: string;
    title: string;
    sequence_order: number;
    cycle_type: string | null;
    completed: boolean;
  }[];
  masteryPassed: boolean;
  milestoneResult: { id: string; score: number; passed: boolean; weakest_skill: string | null } | null;
}

/* Firefly dot for night mode */
const Firefly = ({ delay, x, y }: { delay: number; x: number; y: number }) => (
  <div
    className="absolute w-1.5 h-1.5 rounded-full bg-amber-300/60 animate-firefly pointer-events-none"
    style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${delay}s` }}
  />
);

export const UnitRoadmap: React.FC = () => {
  const { user } = useAuth();
  const { timeOfDay, isDaytime } = useTimeOfDay();
  const { generate: generateReinforcement, isGenerating: isGeneratingReinforcement } = useReinforcementLesson();
  const [showConfetti, setShowConfetti] = useState(false);
  const [celebratedUnit, setCelebratedUnit] = useState<string | null>(null);

  const handleCelebrate = useCallback((unitId: string) => {
    if (celebratedUnit !== unitId) {
      setCelebratedUnit(unitId);
      setShowConfetti(true);
    }
  }, [celebratedUnit]);

  // Track which milestones we've already sent reports for this session
  const sentReportsRef = useRef<Set<string>>(new Set());



  const { data: units = [], isLoading } = useQuery({
    queryKey: ['unit-roadmap', user?.id],
    queryFn: async () => {
      const { data: unitsData, error: unitsError } = await supabase
        .from('curriculum_units')
        .select('id, title, unit_number, cefr_level')
        .order('unit_number');

      if (unitsError) throw unitsError;
      if (!unitsData?.length) return [];

      const unitIds = unitsData.map((u) => u.id);
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('curriculum_lessons')
        .select('id, title, sequence_order, cycle_type, unit_id')
        .in('unit_id', unitIds)
        .eq('is_review', false)
        .order('sequence_order');

      if (lessonsError) throw lessonsError;

      let completedLessonIds = new Set<string>();
      let masteryPassedLessonIds = new Set<string>();
      if (user?.id) {
        const { data: progressData } = await supabase
          .from('interactive_lesson_progress')
          .select('lesson_id, mastery_check_passed')
          .eq('student_id', user.id)
          .eq('lesson_status', 'completed');
        if (progressData) {
          completedLessonIds = new Set(progressData.map((p: any) => p.lesson_id));
          masteryPassedLessonIds = new Set(
            progressData.filter((p: any) => p.mastery_check_passed).map((p: any) => p.lesson_id)
          );
        }
      }

      let milestoneMap: Record<string, { id: string; score: number; passed: boolean; weakest_skill: string | null }> = {};
      if (user?.id) {
        const { data: milestones } = await supabase
          .from('mastery_milestone_results')
          .select('id, unit_id, score, passed, weakest_skill')
          .eq('student_id', user.id);
        if (milestones) {
          for (const m of milestones) {
            milestoneMap[m.unit_id] = { id: m.id, score: Number(m.score), passed: m.passed, weakest_skill: m.weakest_skill };
          }
        }
      }

      return unitsData.map((unit) => {
        const unitLessons = (lessonsData || [])
          .filter((l: any) => l.unit_id === unit.id)
          .map((l: any) => ({
            ...l,
            completed: completedLessonIds.has(l.id),
          }));

        const bridgeLesson = unitLessons.find((l: any) => l.cycle_type === 'bridge');
        const masteryPassed = bridgeLesson ? masteryPassedLessonIds.has(bridgeLesson.id) : false;

        return {
          ...unit,
          lessons: unitLessons,
          masteryPassed,
          milestoneResult: milestoneMap[unit.id] || null,
        };
      });
    },
    staleTime: 3 * 60 * 1000,
  });

  // Trigger mastery report emails for newly passed milestones (score >= 80%)
  useEffect(() => {
    if (!user?.id || units.length === 0) return;
    
    for (const unit of units) {
      const milestone = (unit as any).milestoneResult;
      if (
        milestone &&
        milestone.passed &&
        Number(milestone.score) >= 80 &&
        milestone.id &&
        !sentReportsRef.current.has(milestone.id)
      ) {
        sentReportsRef.current.add(milestone.id);
        sendMasteryReport({
          studentId: user.id,
          unitId: (unit as any).id,
          milestoneResultId: milestone.id,
        }).catch((err) => console.error('Mastery report send error:', err));
      }
    }
  }, [units, user?.id]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!units.length) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Map className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No curriculum units available yet.</p>
          <p className="text-sm text-muted-foreground mt-1">Your learning path will appear here once lessons are assigned.</p>
        </CardContent>
      </Card>
    );
  }

  const cycleLabel: Record<string, { label: string; emoji: string }> = {
    discovery: { label: 'Discovery', emoji: '🔍' },
    ladder: { label: 'Ladder', emoji: '🪜' },
    bridge: { label: 'Bridge', emoji: '🌉' },
  };

  const isUnitUnlocked = (idx: number): boolean => {
    if (idx === 0) return true;
    const prevUnit = units[idx - 1] as any;
    return prevUnit.masteryPassed;
  };

  // Night fireflies data (static positions)
  const fireflies = [
    { delay: 0, x: 10, y: 20 }, { delay: 1.5, x: 80, y: 15 },
    { delay: 0.8, x: 45, y: 70 }, { delay: 2.2, x: 25, y: 85 },
    { delay: 1.1, x: 70, y: 50 }, { delay: 3, x: 90, y: 35 },
  ];

  return (
    <>
      <ConfettiEffect trigger={showConfetti} onComplete={() => setShowConfetti(false)} />
      <Card className={cn(
        'relative overflow-hidden transition-colors duration-700',
        isDaytime
          ? 'bg-gradient-to-b from-sky-50 to-amber-50 dark:from-sky-950/30 dark:to-amber-950/20 border-amber-200/50'
          : 'bg-gradient-to-b from-indigo-950 to-slate-900 border-indigo-500/30'
      )}>
        {/* Night fireflies */}
        {!isDaytime && fireflies.map((f, i) => (
          <Firefly key={i} delay={f.delay} x={f.x} y={f.y} />
        ))}

        <CardHeader>
          <CardTitle className={cn(
            'flex items-center gap-2 text-lg transition-colors duration-500',
            !isDaytime && 'text-indigo-100'
          )}>
            <Map className={cn('h-5 w-5', isDaytime ? 'text-primary' : 'text-indigo-400')} />
            My Learning Path
            {/* Day/Night indicator */}
            <span className="ml-auto">
              {isDaytime ? (
                <Sun className="h-5 w-5 text-amber-500 animate-sway" />
              ) : (
                <Moon className="h-5 w-5 text-indigo-300 animate-pulse-slow" />
              )}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative space-y-0">
            {units.map((unit: any, idx: number) => {
              const allCompleted = unit.lessons.length > 0 && unit.lessons.every((l: any) => l.completed);
              const unitGold = allCompleted && unit.masteryPassed;
              const unlocked = isUnitUnlocked(idx);

              return (
                <div key={unit.id} className="relative">
                  {/* Connecting line */}
                  {idx < units.length - 1 && (
                    <div className={cn(
                      'absolute left-6 top-full w-0.5 h-6 z-0',
                      unitGold
                        ? (isDaytime ? 'bg-amber-400' : 'bg-amber-400/70')
                        : (isDaytime ? 'bg-border' : 'bg-indigo-700/50')
                    )} />
                  )}

                  <div className={cn(
                    'relative z-10 rounded-xl border-2 p-4 mb-6 transition-all duration-500',
                    !unlocked
                      ? isDaytime
                        ? 'border-border bg-muted/30 opacity-60'
                        : 'border-indigo-800/40 bg-indigo-950/40 opacity-50'
                      : unitGold
                        ? isDaytime
                          ? 'border-amber-400 bg-amber-50/50 dark:bg-amber-950/20'
                          : 'border-amber-400/60 bg-amber-950/30 animate-lantern-glow'
                        : isDaytime
                          ? 'border-border bg-card'
                          : 'border-indigo-600/40 bg-indigo-900/40'
                  )}>
                    {/* Unit header */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className={cn(
                        'flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold transition-colors duration-500',
                        !unlocked
                          ? isDaytime ? 'bg-muted text-muted-foreground' : 'bg-indigo-800/60 text-indigo-400'
                          : unitGold
                            ? 'bg-amber-400 text-white'
                            : isDaytime
                              ? 'bg-primary/10 text-primary'
                              : 'bg-indigo-700/50 text-indigo-300'
                      )}>
                        {!unlocked ? <Lock className="h-4 w-4" /> : unit.unit_number}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={cn(
                          'font-semibold truncate transition-colors duration-500',
                          isDaytime ? 'text-foreground' : 'text-indigo-100'
                        )}>{unit.title}</h3>
                        <Badge variant="outline" className={cn(
                          'text-xs mt-0.5',
                          !isDaytime && 'border-indigo-500/40 text-indigo-300'
                        )}>{unit.cefr_level}</Badge>
                      </div>
                      {unitGold && <span className="text-lg">🏆</span>}
                      {/* Day ambient birds on completed */}
                      {isDaytime && unitGold && <span className="text-sm animate-sway">🐦</span>}
                    </div>

                    {/* Gold Standard: Vocabulary Hero + Phonics Mechanism */}
                    {unit.title?.toLowerCase().includes('animal') && unlocked && (
                      <div className={cn(
                        'flex items-center gap-3 mb-3 p-3 rounded-2xl border',
                        'shadow-[0_4px_16px_rgba(0,0,0,0.06)]',
                        isDaytime
                          ? 'bg-gradient-to-r from-emerald-50/80 to-amber-50/40 border-emerald-200/50'
                          : 'bg-gradient-to-r from-emerald-950/20 to-amber-950/10 border-emerald-700/30'
                      )}>
                        {/* Professional Flat 2.0 wrapper */}
                        <div className="relative rounded-xl overflow-hidden shadow-[0_3px_10px_rgba(0,0,0,0.1)] bg-white dark:bg-gray-900 p-1.5 flex-shrink-0">
                          <img
                            src={lionHero}
                            alt="Lion - vocabulary hero"
                            className="w-14 h-14 object-contain"
                            loading="lazy"
                            width={56}
                            height={56}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            'text-xs font-bold',
                            isDaytime ? 'text-emerald-700' : 'text-emerald-300'
                          )}>🦁 Vocabulary Hero: Lion</p>
                          <p className={cn(
                            'text-[10px] mt-0.5',
                            isDaytime ? 'text-emerald-600/80' : 'text-emerald-400/70'
                          )}>Phonics Focus: /l/ sound</p>
                        </div>
                        <div className="flex gap-1.5">
                          {/* Audio play button */}
                          <button
                            onClick={() => {
                              const videoEl = document.getElementById('phonics-l-video') as HTMLVideoElement;
                              if (videoEl) {
                                videoEl.paused ? videoEl.play() : videoEl.pause();
                              }
                            }}
                            className={cn(
                              'flex items-center justify-center w-9 h-9 rounded-xl transition-colors',
                              isDaytime
                                ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-700'
                                : 'bg-emerald-800/40 hover:bg-emerald-700/50 text-emerald-300'
                            )}
                            title="Play /l/ sound"
                          >
                            <Volume2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}
                    {/* Phonics video (hidden, audio-only for now — replace with Veo render) */}
                    {unit.title?.toLowerCase().includes('animal') && unlocked && (
                      <video
                        id="phonics-l-video"
                        src={lSoundVideo.url}
                        className="hidden"
                        preload="none"
                      />
                    )}

                    {/* 3-Star lesson progress */}
                    <div className="flex items-center gap-3 ml-2">
                      {unit.lessons.map((lesson: any, li: number) => {
                        const prev = li === 0 ? unlocked : unit.lessons[li - 1]?.completed;
                        const available = unlocked && prev && !lesson.completed;
                        const cycle = lesson.cycle_type ? cycleLabel[lesson.cycle_type] : null;

                        return (
                          <div key={lesson.id} className="flex flex-col items-center gap-1 group relative">
                            {li > 0 && (
                              <div className={cn(
                                'absolute -left-3 top-3 w-3 h-0.5',
                                lesson.completed
                                  ? (isDaytime ? 'bg-amber-400' : 'bg-amber-400/60')
                                  : (isDaytime ? 'bg-border' : 'bg-indigo-700/50')
                              )} />
                            )}
                            <Star
                              className={cn(
                                'h-7 w-7 transition-all',
                                lesson.completed
                                  ? isDaytime
                                    ? 'text-amber-400 fill-amber-400 drop-shadow-sm'
                                    : 'text-amber-300 fill-amber-300 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]'
                                  : available
                                    ? isDaytime
                                      ? 'text-primary fill-primary/20'
                                      : 'text-indigo-400 fill-indigo-400/20'
                                    : isDaytime
                                      ? 'text-muted-foreground/40'
                                      : 'text-indigo-700/40'
                              )}
                            />
                            <span className={cn(
                              'text-[10px] text-center max-w-[60px] truncate',
                              isDaytime ? 'text-muted-foreground' : 'text-indigo-400'
                            )}>
                              {cycle ? `${cycle.emoji} ${cycle.label}` : `L${lesson.sequence_order}`}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Quiz / Milestone */}
                    <div className="flex items-center gap-3 ml-2 mt-2">
                      <div className="flex items-center gap-1.5">
                        <div className={cn('w-6 h-0.5', isDaytime ? 'bg-border' : 'bg-indigo-700/50')} />
                        {(() => {
                          const milestone = unit.milestoneResult;
                          if (unitGold || (milestone && milestone.passed)) {
                            return (
                              <div className="flex flex-col items-center gap-0.5">
                                <Trophy className={cn('h-6 w-6', isDaytime ? 'text-amber-500 fill-amber-100' : 'text-amber-400 fill-amber-400/20 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]')} />
                                <span className={cn('text-[10px] font-medium', isDaytime ? 'text-amber-600' : 'text-amber-300')}>
                                  {milestone ? `${Math.round(milestone.score)}%` : 'Passed'}
                                </span>
                              </div>
                            );
                          }
                          if (milestone && !milestone.passed) {
                            return (
                              <div className="flex flex-col items-center gap-0.5">
                                <AlertCircle className="h-6 w-6 text-destructive" />
                                <span className="text-[10px] text-destructive font-medium">
                                  {Math.round(milestone.score)}% — Review {milestone.weakest_skill || 'needed'}
                                </span>
                              </div>
                            );
                          }
                          if (allCompleted) {
                            return (
                              <div className="flex flex-col items-center gap-0.5">
                                <Trophy className={cn('h-6 w-6', isDaytime ? 'text-primary fill-primary/20' : 'text-indigo-400 fill-indigo-400/20')} />
                                <span className={cn('text-[10px] font-medium', isDaytime ? 'text-primary' : 'text-indigo-300')}>Take Quiz</span>
                              </div>
                            );
                          }
                          return (
                            <div className="flex flex-col items-center gap-0.5">
                              <Trophy className={cn('h-6 w-6', isDaytime ? 'text-muted-foreground/30' : 'text-indigo-800/40')} />
                              <span className={cn('text-[10px]', isDaytime ? 'text-muted-foreground' : 'text-indigo-600')}>Quiz</span>
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Mastery gate */}
                    {allCompleted && !unit.masteryPassed && !unit.milestoneResult && (
                      <div className={cn(
                        'mt-2 ml-2 text-xs flex items-center gap-1',
                        isDaytime ? 'text-amber-600 dark:text-amber-400' : 'text-amber-300/80'
                      )}>
                        <Lock className="h-3 w-3" />
                        Pass the Mastery Milestone quiz to unlock the next unit
                      </div>
                    )}

                    {/* Celebration button */}
                    {unit.milestoneResult?.passed && celebratedUnit !== unit.id && (
                      <div className="mt-3 ml-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className={cn(
                            isDaytime
                              ? 'text-amber-600 border-amber-300 hover:bg-amber-50'
                              : 'text-amber-300 border-amber-500/40 hover:bg-amber-900/30'
                          )}
                          onClick={() => handleCelebrate(unit.id)}
                        >
                          🎉 Celebrate!
                        </Button>
                      </div>
                    )}

                    {/* Retry */}
                    {unit.milestoneResult && !unit.milestoneResult.passed && (
                      <div className="mt-3 ml-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive border-destructive/30 hover:bg-destructive/5"
                          disabled={isGeneratingReinforcement}
                          onClick={() => {
                            if (user?.id) {
                              generateReinforcement({
                                unitId: unit.id,
                                weakestSkill: unit.milestoneResult.weakest_skill || 'speaking',
                                studentId: user.id,
                              });
                            }
                          }}
                        >
                          {isGeneratingReinforcement ? (
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          ) : (
                            <RefreshCw className="h-3 w-3 mr-1" />
                          )}
                          {isGeneratingReinforcement ? 'Generating...' : "Let's Practice More"}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </>
  );
};
