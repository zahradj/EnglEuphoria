import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Loader2, Timer } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Row {
  id: string;
  created_at: string;
  user_id: string | null;
  resource_id: string | null;
  new_values: any;
}

interface TeacherBucket {
  teacherId: string;
  total: number;
  rushed: number;
  onTime: number;
  full: number;
  leftEarly: number;
  sample: number[];
}

type Mode = 'trial' | 'standard';

function useAudit(action: 'trial_ended' | 'class_ended') {
  return useQuery({
    queryKey: ['admin-pacing-audit', action],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('id, created_at, user_id, resource_id, new_values')
        .eq('action', action)
        .order('created_at', { ascending: false })
        .limit(500);
      if (error) throw error;
      return (data ?? []) as Row[];
    },
    staleTime: 30_000,
  });
}

/** For trials: mandatory=25, total=30. For standard: read per-row from audit. */
function bucketize(rows: Row[], mode: Mode): TeacherBucket[] {
  const byTeacher = new Map<string, TeacherBucket>();
  for (const row of rows) {
    const teacherId = row.user_id ?? 'unknown';
    const minutes = Number(
      mode === 'trial'
        ? row.new_values?.trial_ended_at_minutes
        : row.new_values?.ended_at_minutes,
    );
    if (!Number.isFinite(minutes)) continue;
    const mandatory = Number(row.new_values?.mandatory_minutes) || (mode === 'trial' ? 25 : 55);
    const total = Number(row.new_values?.total_minutes) || (mode === 'trial' ? 30 : 60);
    const leftEarly = row.new_values?.left_early === true;

    let b = byTeacher.get(teacherId);
    if (!b) {
      b = { teacherId, total: 0, rushed: 0, onTime: 0, full: 0, leftEarly: 0, sample: [] };
      byTeacher.set(teacherId, b);
    }
    b.total += 1;
    if (leftEarly) b.leftEarly += 1;
    if (minutes <= mandatory) b.rushed += 1;
    else if (minutes < total) b.onTime += 1;
    else b.full += 1;
    if (b.sample.length < 10) b.sample.push(minutes);
  }
  return Array.from(byTeacher.values()).sort((a, b) => b.total - a.total);
}

function PacingList({ rows, mode }: { rows: Row[]; mode: Mode }) {
  const buckets = useMemo(() => bucketize(rows, mode), [rows, mode]);
  const rushedLabel = mode === 'trial' ? '≤25 min' : '≤ mandatory';
  const bonusLabel = mode === 'trial' ? '26–29 min' : 'bonus window';
  const fullLabel = mode === 'trial' ? '30 min' : 'full duration';

  if (buckets.length === 0) {
    return (
      <Card className="p-8 text-center text-sm text-muted-foreground">
        No {mode} sessions recorded yet.
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {buckets.map((b) => {
        const rushedPct = Math.round((b.rushed / b.total) * 100);
        const isRusher = b.total >= 3 && rushedPct >= 70;
        return (
          <Card key={b.teacherId} className="p-4">
            <div className="flex items-center gap-2 text-sm flex-wrap">
              <code className="font-mono text-xs text-muted-foreground">
                {b.teacherId === 'unknown' ? 'unknown' : b.teacherId.slice(0, 8)}
              </code>
              <span className="text-muted-foreground">·</span>
              <span className="font-medium">
                {b.total} {mode}
                {b.total === 1 ? '' : 's'}
              </span>
              {isRusher && <Badge variant="destructive" className="ml-2">Rusher</Badge>}
              {b.leftEarly > 0 && (
                <Badge variant="outline" className="ml-1">
                  {b.leftEarly} left early
                </Badge>
              )}
            </div>
            <div className="mt-2 flex items-center gap-4 text-xs">
              <span className="text-destructive">
                {rushedLabel}: <strong>{b.rushed}</strong> ({rushedPct}%)
              </span>
              <span className="text-amber-600 dark:text-amber-400">
                {bonusLabel}: <strong>{b.onTime}</strong>
              </span>
              <span className="text-emerald-600 dark:text-emerald-400">
                {fullLabel}: <strong>{b.full}</strong>
              </span>
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground">
              Recent: {b.sample.join(', ')} min
            </div>
          </Card>
        );
      })}
    </div>
  );
}

/**
 * Admin-only pacing dashboard.
 * Reads `trial_ended` and `class_ended` audit_logs written by
 * TeacherClassroom.handleEndClass and buckets each teacher's ends into
 * rushed / bonus-window / full-duration so ops can spot pacing issues.
 */
export default function TrialPacingAudit() {
  const [mode, setMode] = useState<Mode>('trial');
  const trials = useAudit('trial_ended');
  const standard = useAudit('class_ended');
  const active = mode === 'trial' ? trials : standard;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-5xl space-y-4">
        <header className="flex items-center gap-3">
          <Timer className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-semibold">Pacing Audit</h1>
            <p className="text-sm text-muted-foreground">
              Per-teacher end-minute distribution. Trials: 25 mandatory + 5 bonus.
              Standard: hub-dependent (PG 30, Academy/Success 60). Last 500 events per tab.
            </p>
          </div>
        </header>

        <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
          <TabsList>
            <TabsTrigger value="trial">Trial ({trials.data?.length ?? 0})</TabsTrigger>
            <TabsTrigger value="standard">Standard ({standard.data?.length ?? 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="trial" className="mt-4">
            {trials.isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : trials.error ? (
              <Card className="p-4 text-sm text-destructive">
                Failed to load: {(trials.error as Error).message}
              </Card>
            ) : (
              <PacingList rows={trials.data ?? []} mode="trial" />
            )}
          </TabsContent>

          <TabsContent value="standard" className="mt-4">
            {standard.isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : standard.error ? (
              <Card className="p-4 text-sm text-destructive">
                Failed to load: {(standard.error as Error).message}
              </Card>
            ) : (
              <PacingList rows={standard.data ?? []} mode="standard" />
            )}
          </TabsContent>
        </Tabs>

        {(active.data?.length ?? 0) > 0 && (
          <details className="pt-4">
            <summary className="text-xs text-muted-foreground cursor-pointer">
              Show raw {mode} events ({active.data!.length})
            </summary>
            <div className="mt-2 space-y-1">
              {active.data!.map((row) => {
                const mins =
                  mode === 'trial'
                    ? row.new_values?.trial_ended_at_minutes
                    : row.new_values?.ended_at_minutes;
                return (
                  <div key={row.id} className="text-[11px] font-mono text-muted-foreground">
                    {formatDistanceToNow(new Date(row.created_at), { addSuffix: true })} ·{' '}
                    teacher {row.user_id?.slice(0, 8) ?? '—'} · {mins}min · phase=
                    {row.new_values?.phase} · hub={row.new_values?.hub_type}
                    {row.new_values?.left_early && ' · LEFT EARLY'}
                  </div>
                );
              })}
            </div>
          </details>
        )}
      </div>
    </div>
  );
}
