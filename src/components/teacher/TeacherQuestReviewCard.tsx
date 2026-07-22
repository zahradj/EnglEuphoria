/**
 * TeacherQuestReviewCard
 *
 * Per-student Language Engine review — reads `student_engine_runs` and
 * shows each student's last 5 runs with a mini accuracy trend, plus
 * "Struggling" and "Star Explorer" chips.
 *
 * Zero writes. Roster is supplied by the caller.
 */

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Compass, Sparkles, AlertTriangle } from 'lucide-react';

type EngineKind = 'story' | 'escape_room' | 'detective_mystery' | 'hidden_object';

const ENGINE_SHORT: Record<EngineKind, string> = {
  story: 'Story',
  escape_room: 'Escape',
  detective_mystery: 'Detective',
  hidden_object: 'Hidden',
};

interface RunRow {
  user_id: string;
  engine: EngineKind;
  accuracy: number;
  duration_ms: number;
  created_at: string;
  unit_id: string;
}

interface StudentAgg {
  student_id: string;
  student_name?: string;
  runs: RunRow[];
  avgAccuracy: number;
  totalRuns: number;
  topEngine?: EngineKind;
}

interface Props {
  students: Array<{ id: string; name?: string }>;
}

export default function TeacherQuestReviewCard({ students }: Props) {
  const ids = useMemo(() => students.map((s) => s.id).filter(Boolean), [students]);
  const [rows, setRows] = useState<RunRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    if (ids.length === 0) {
      setRows([]);
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('student_engine_runs')
        .select('user_id, engine, accuracy, duration_ms, created_at, unit_id')
        .in('user_id', ids)
        .order('created_at', { ascending: false })
        .limit(500);
      if (!alive) return;
      if (error || !data) {
        setRows([]);
      } else {
        setRows(data as any);
      }
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [ids.join(',')]);

  const perStudent: StudentAgg[] = useMemo(() => {
    const byUser = new Map<string, RunRow[]>();
    for (const r of rows) {
      const arr = byUser.get(r.user_id) ?? [];
      arr.push(r);
      byUser.set(r.user_id, arr);
    }
    return students
      .map((s) => {
        const all = byUser.get(s.id) ?? [];
        const last5 = all.slice(0, 5);
        const avg =
          last5.length > 0
            ? last5.reduce((sum, r) => sum + Number(r.accuracy || 0), 0) / last5.length
            : 0;
        const counts = new Map<EngineKind, number>();
        for (const r of all) counts.set(r.engine, (counts.get(r.engine) ?? 0) + 1);
        let topEngine: EngineKind | undefined;
        let topN = 0;
        counts.forEach((n, k) => {
          if (n > topN) {
            topN = n;
            topEngine = k;
          }
        });
        return {
          student_id: s.id,
          student_name: s.name,
          runs: last5,
          avgAccuracy: avg,
          totalRuns: all.length,
          topEngine,
        };
      })
      .filter((s) => s.totalRuns > 0)
      .sort((a, b) => b.totalRuns - a.totalRuns);
  }, [rows, students]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Compass className="h-5 w-5 text-purple-500" /> Quest Review
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (perStudent.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Compass className="h-5 w-5 text-purple-500" /> Quest Review
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No Language Engine runs yet. Students will appear here after completing their
            first quest.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Compass className="h-5 w-5 text-purple-500" /> Quest Review
          <Badge variant="outline" className="ml-auto text-xs">
            {perStudent.length} active
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {perStudent.map((s) => {
          const pct = Math.round(s.avgAccuracy * 100);
          const struggling = s.runs.length >= 3 && s.avgAccuracy < 0.5;
          const star = s.runs.length >= 3 && s.avgAccuracy >= 0.85;
          // Auto-tune visibility (mirrors engineSlotInjector thresholds).
          const tune =
            s.runs.length < 3
              ? null
              : s.avgAccuracy < 0.6
                ? { label: 'Eased', className: 'bg-sky-100 text-sky-800' }
                : s.avgAccuracy > 0.9
                  ? { label: 'Stretched', className: 'bg-violet-100 text-violet-800' }
                  : { label: 'Standard', className: 'bg-slate-100 text-slate-700' };
          return (
            <div
              key={s.student_id}
              className="flex items-center gap-4 rounded-lg border p-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-medium truncate">
                    {s.student_name || s.student_id.slice(0, 8)}
                  </span>
                  {star && (
                    <Badge className="bg-yellow-100 text-yellow-800 gap-1">
                      <Sparkles className="h-3 w-3" /> Star Explorer
                    </Badge>
                  )}
                  {struggling && (
                    <Badge variant="destructive" className="gap-1">
                      <AlertTriangle className="h-3 w-3" /> Needs help
                    </Badge>
                  )}
                  {tune && (
                    <Badge className={`${tune.className} text-xs`} title="Auto-tune difficulty on next lesson">
                      Difficulty: {tune.label}
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {s.totalRuns} quest{s.totalRuns === 1 ? '' : 's'} · {pct}% avg
                  {s.topEngine && <> · favorite: {ENGINE_SHORT[s.topEngine]}</>}
                </div>
              </div>
              {/* Mini trend: last 5 accuracy bars, oldest → newest */}
              <div className="flex items-end gap-0.5 h-8" aria-label="Last 5 accuracy trend">
                {[...s.runs].reverse().map((r, i) => {
                  const h = Math.max(4, Math.round((r.accuracy || 0) * 32));
                  const color =
                    r.accuracy >= 0.8
                      ? 'bg-emerald-500'
                      : r.accuracy >= 0.5
                        ? 'bg-amber-400'
                        : 'bg-rose-400';
                  return (
                    <div
                      key={i}
                      className={`w-1.5 rounded-sm ${color}`}
                      style={{ height: `${h}px` }}
                      title={`${Math.round(r.accuracy * 100)}% · ${ENGINE_SHORT[r.engine]}`}
                    />
                  );
                })}
              </div>
              <div className="text-right w-16 text-sm font-semibold">{pct}%</div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
