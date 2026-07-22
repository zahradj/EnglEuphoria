/**
 * TeacherVocabGamesReportCard
 *
 * Teacher-facing summary of vocab-games engine performance for a set of
 * students. Reads `analytics_events` rows emitted by `vocabArcObserver`
 * (`event_type='vocab_arc_complete'`) and rolls them up by:
 *   - mode (lesson / review / quiz — inferred from telemetry_tag)
 *   - student (accuracy avg, attempts, last played, quiz pass rate)
 *
 * Zero writes. Read-only report. Caller supplies the student roster.
 *
 * Pedagogy (senior-ai-edtech-architect):
 *   - Quiz pass = accuracy ≥ 0.8 (matches VocabGamesSlot passThreshold default).
 *   - "Struggling" chip = 2+ quiz fails or <0.5 avg accuracy over ≥3 sessions.
 */

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

type Mode = 'lesson' | 'review' | 'quiz';

interface Row {
  student_id: string;
  student_name?: string;
  by_mode: Record<Mode, {
    sessions: number;
    avg_accuracy: number;
    total_correct: number;
    total_attempts: number;
    last_at?: string;
    quiz_passes?: number;
    quiz_fails?: number;
  }>;
}

interface Event {
  user_id: string;
  created_at: string;
  event_data: {
    hub?: string;
    lesson_id?: string | null;
    telemetry_tag?: string;
    source?: string;
    accuracy?: number;
    attempts?: number;
    correct?: number;
  } | null;
}

type EngineType = 'story' | 'escape' | 'detective' | 'hidden' | 'other';

function isEngineEvent(ev: Event): boolean {
  const tag = ev.event_data?.telemetry_tag || '';
  return (
    ev.event_data?.source === 'language_engine_studio' ||
    tag.startsWith('language_engine_')
  );
}

function inferEngineType(tag: string | undefined): EngineType {
  if (!tag) return 'other';
  if (tag.includes('story')) return 'story';
  if (tag.includes('escape')) return 'escape';
  if (tag.includes('detective')) return 'detective';
  if (tag.includes('hidden')) return 'hidden';
  return 'other';
}

function inferMode(tag: string | undefined): Mode {
  if (!tag) return 'lesson';
  if (tag.includes('quiz')) return 'quiz';
  if (tag.includes('review')) return 'review';
  return 'lesson';
}

export interface TeacherVocabGamesReportCardProps {
  students: Array<{ id: string; name?: string }>;
  /** How far back to look (days). Default 30. */
  daysBack?: number;
  className?: string;
}

export default function TeacherVocabGamesReportCard({
  students,
  daysBack = 30,
  className,
}: TeacherVocabGamesReportCardProps) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [bossByStudent, setBossByStudent] = useState<Record<string, { boss: { wins: number; total: number }; rescue: { wins: number; total: number } }>>({});
  const [engineByStudent, setEngineByStudent] = useState<Record<string, { sessions: number; accSum: number; byType: Record<EngineType, number> }>>({});
  const [loading, setLoading] = useState(true);

  const studentIds = useMemo(() => students.map((s) => s.id).filter(Boolean), [students]);
  const nameById = useMemo(
    () => Object.fromEntries(students.map((s) => [s.id, s.name])),
    [students],
  );

  useEffect(() => {
    let cancelled = false;
    if (studentIds.length === 0) {
      setRows([]);
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      const since = new Date(Date.now() - daysBack * 86_400_000).toISOString();
      const [{ data, error }, { data: bossData }] = await Promise.all([
        (supabase as any)
          .from('analytics_events')
          .select('user_id, created_at, event_data')
          .eq('event_type', 'vocab_arc_complete')
          .in('user_id', studentIds)
          .gte('created_at', since)
          .order('created_at', { ascending: false })
          .limit(2000),
        (supabase as any)
          .from('analytics_events')
          .select('user_id, event_data')
          .eq('event_type', 'vocab_boss_complete')
          .in('user_id', studentIds)
          .gte('created_at', since)
          .limit(2000),
      ]);

      if (cancelled) return;
      if (error || !Array.isArray(data)) {
        setRows([]);
        setLoading(false);
        return;
      }

      // Boss & Rescue win rate rollup (split by variant).
      const bossAcc: Record<string, { boss: { wins: number; total: number }; rescue: { wins: number; total: number } }> = {};
      for (const ev of (bossData ?? []) as Array<{ user_id: string; event_data: any }>) {
        const b = (bossAcc[ev.user_id] ??= { boss: { wins: 0, total: 0 }, rescue: { wins: 0, total: 0 } });
        const bin = ev.event_data?.variant === 'rescue' ? b.rescue : b.boss;
        bin.total += 1;
        if (ev.event_data?.victory) bin.wins += 1;
      }
      setBossByStudent(bossAcc);

      const bucket = new Map<string, Row>();
      for (const id of studentIds) {
        bucket.set(id, {
          student_id: id,
          student_name: nameById[id],
          by_mode: {
            lesson: { sessions: 0, avg_accuracy: 0, total_correct: 0, total_attempts: 0 },
            review: { sessions: 0, avg_accuracy: 0, total_correct: 0, total_attempts: 0 },
            quiz: { sessions: 0, avg_accuracy: 0, total_correct: 0, total_attempts: 0, quiz_passes: 0, quiz_fails: 0 },
          },
        });
      }

      const accAcc: Record<string, Record<Mode, number>> = {};
      const engineAcc: Record<string, { sessions: number; accSum: number; byType: Record<EngineType, number> }> = {};
      for (const ev of data as Event[]) {
        const row = bucket.get(ev.user_id);
        if (!row) continue;
        const tag = ev.event_data?.telemetry_tag;
        const acc =
          typeof ev.event_data?.accuracy === 'number'
            ? ev.event_data!.accuracy! > 1
              ? ev.event_data!.accuracy! / 100
              : ev.event_data!.accuracy!
            : 0;

        if (isEngineEvent(ev)) {
          const type = inferEngineType(tag);
          const e = (engineAcc[ev.user_id] ??= {
            sessions: 0,
            accSum: 0,
            byType: { story: 0, escape: 0, detective: 0, hidden: 0, other: 0 },
          });
          e.sessions += 1;
          e.accSum += acc;
          e.byType[type] += 1;
          continue;
        }

        const mode = inferMode(tag);
        const bin = row.by_mode[mode];
        bin.sessions += 1;
        bin.total_correct += ev.event_data?.correct ?? 0;
        bin.total_attempts += ev.event_data?.attempts ?? 0;
        accAcc[ev.user_id] ??= { lesson: 0, review: 0, quiz: 0 };
        accAcc[ev.user_id][mode] += acc;
        if (!bin.last_at || ev.created_at > bin.last_at) bin.last_at = ev.created_at;
        if (mode === 'quiz') {
          if (acc >= 0.8) bin.quiz_passes = (bin.quiz_passes ?? 0) + 1;
          else bin.quiz_fails = (bin.quiz_fails ?? 0) + 1;
        }
      }
      // finalize avg
      for (const row of bucket.values()) {
        (['lesson', 'review', 'quiz'] as Mode[]).forEach((m) => {
          const n = row.by_mode[m].sessions;
          row.by_mode[m].avg_accuracy =
            n > 0 ? (accAcc[row.student_id]?.[m] ?? 0) / n : 0;
        });
      }
      setEngineByStudent(engineAcc);

      setRows([...bucket.values()]);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [studentIds, daysBack, nameById]);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          Vocab Games — Report Card
          <span className="text-xs font-normal text-muted-foreground">
            last {daysBack} days
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : !rows || rows.length === 0 ? (
          <div className="text-sm text-muted-foreground py-6 text-center">
            No vocab-games activity yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-muted-foreground border-b">
                  <th className="py-2 pr-3">Student</th>
                  <th className="py-2 pr-3">Lesson</th>
                  <th className="py-2 pr-3">Review</th>
                  <th className="py-2 pr-3">Quiz</th>
                  <th className="py-2 pr-3">Boss</th>
                  <th className="py-2 pr-3">Rescue</th>
                  <th className="py-2 pr-3">Engines</th>
                  <th className="py-2 pr-3">Signal</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const q = r.by_mode.quiz;
                  const overallAcc =
                    (r.by_mode.lesson.avg_accuracy * r.by_mode.lesson.sessions +
                      r.by_mode.review.avg_accuracy * r.by_mode.review.sessions +
                      q.avg_accuracy * q.sessions) /
                    Math.max(
                      1,
                      r.by_mode.lesson.sessions + r.by_mode.review.sessions + q.sessions,
                    );
                  const total =
                    r.by_mode.lesson.sessions + r.by_mode.review.sessions + q.sessions;
                  const struggling =
                    (q.quiz_fails ?? 0) >= 2 || (total >= 3 && overallAcc < 0.5);
                  const strong = total >= 3 && overallAcc >= 0.85;
                  return (
                    <tr key={r.student_id} className="border-b last:border-0">
                      <td className="py-2 pr-3 font-medium">
                        {r.student_name || r.student_id.slice(0, 8)}
                      </td>
                      <ModeCell bin={r.by_mode.lesson} />
                      <ModeCell bin={r.by_mode.review} />
                      <ModeCell bin={r.by_mode.quiz} showQuiz />
                      <BossCell stats={bossByStudent[r.student_id]?.boss} label="fights" />
                      <BossCell stats={bossByStudent[r.student_id]?.rescue} label="rescues" />
                      <EngineCell stats={engineByStudent[r.student_id]} />
                      <td className="py-2 pr-3">
                        {struggling ? (
                          <Badge variant="destructive" className="gap-1">
                            <AlertTriangle className="h-3 w-3" /> Reinforce
                          </Badge>
                        ) : strong ? (
                          <Badge className="gap-1 bg-emerald-600 hover:bg-emerald-600">
                            <CheckCircle2 className="h-3 w-3" /> Strong
                          </Badge>
                        ) : total === 0 ? (
                          <Badge variant="outline" className="gap-1">
                            <Clock className="h-3 w-3" /> No data
                          </Badge>
                        ) : (
                          <Badge variant="secondary">On track</Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ModeCell({
  bin,
  showQuiz = false,
}: {
  bin: Row['by_mode'][Mode];
  showQuiz?: boolean;
}) {
  if (bin.sessions === 0) {
    return <td className="py-2 pr-3 text-muted-foreground">—</td>;
  }
  return (
    <td className="py-2 pr-3 tabular-nums">
      <div className="font-medium">{Math.round(bin.avg_accuracy * 100)}%</div>
      <div className="text-[11px] text-muted-foreground">
        {bin.sessions} {bin.sessions === 1 ? 'run' : 'runs'}
        {showQuiz && (bin.quiz_passes || bin.quiz_fails) ? (
          <>
            {' · '}
            <span className="text-emerald-600">{bin.quiz_passes ?? 0}✓</span>
            {' / '}
            <span className="text-red-600">{bin.quiz_fails ?? 0}✗</span>
          </>
        ) : null}
      </div>
    </td>
  );
}

function BossCell({ stats, label = 'fights' }: { stats?: { wins: number; total: number }; label?: string }) {
  if (!stats || stats.total === 0) {
    return <td className="py-2 pr-3 text-muted-foreground">—</td>;
  }
  const winRate = stats.wins / stats.total;
  return (
    <td className="py-2 pr-3 tabular-nums">
      <div className="font-medium">{Math.round(winRate * 100)}%</div>
      <div className="text-[11px] text-muted-foreground">
        {stats.wins}/{stats.total} {label}
      </div>
    </td>
  );
}

function EngineCell({
  stats,
}: {
  stats?: { sessions: number; accSum: number; byType: Record<EngineType, number> };
}) {
  if (!stats || stats.sessions === 0) {
    return <td className="py-2 pr-3 text-muted-foreground">—</td>;
  }
  const acc = stats.accSum / stats.sessions;
  const topEntry = (Object.entries(stats.byType) as Array<[EngineType, number]>)
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1])[0];
  const label = topEntry ? `${topEntry[0]} ×${stats.sessions}` : `${stats.sessions} runs`;
  return (
    <td className="py-2 pr-3 tabular-nums">
      <div className="font-medium">{Math.round(acc * 100)}%</div>
      <div className="text-[11px] text-muted-foreground capitalize">{label}</div>
    </td>
  );
}
