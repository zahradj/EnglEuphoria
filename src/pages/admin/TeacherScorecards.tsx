import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQueries, useQuery } from '@tanstack/react-query';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { fetchTeacherScorecard, type Scorecard } from '@/hooks/useTeacherScorecard';
import { ScorecardView, STATUS_STYLE, buildGoals, type Goal } from '@/components/teacher/scorecard/TeachingScorecard';

interface TeacherLite {
  id: string;
  name: string;
}

interface Row extends TeacherLite {
  loading: boolean;
  failed: boolean;
  data: Scorecard | null;
  goals: Goal[];
  attention: Goal[];
  judged: number;
  onTrack: number;
}

const GOAL_ORDER = ['On time', 'Delivered', 'Reports', 'Talking', 'Confidence'];

/**
 * Admin overview: every teacher cleared to teach, five dots each, the ones who need support first.
 * It shows the SAME scorecard each teacher sees, so a conversation about it starts from shared numbers.
 */
export default function TeacherScorecards() {
  const [open, setOpen] = useState<Row | null>(null);

  const { data: teachers = [], isLoading: loadingTeachers } = useQuery<TeacherLite[]>({
    queryKey: ['scorecard-teachers'],
    queryFn: async () => {
      const { data: profiles, error } = await (supabase as any)
        .from('teacher_profiles').select('user_id, can_teach').eq('can_teach', true);
      if (error) throw error;
      const ids = (profiles ?? []).map((p: any) => p.user_id);
      if (ids.length === 0) return [];
      const { data: users } = await supabase.from('users').select('id, full_name').in('id', ids);
      const names = new Map((users ?? []).map((u: any) => [u.id, u.full_name]));
      return ids.map((id: string) => ({ id, name: (names.get(id) as string) || 'Teacher' }));
    },
  });

  const results = useQueries({
    queries: teachers.map((t) => ({
      queryKey: ['teacher-scorecard', t.id],
      staleTime: 60_000,
      retry: false,
      queryFn: () => fetchTeacherScorecard(t.id),
    })),
  });

  const rows: Row[] = useMemo(() => {
    const built = teachers.map((t, i) => {
      const r = results[i];
      const data = (r?.data as Scorecard | undefined) ?? null;
      const goals = data ? buildGoals(data) : [];
      const judged = goals.filter((g) => g.status !== 'collecting');
      return {
        ...t,
        loading: !!r?.isLoading,
        failed: !!r?.isError,
        data,
        goals,
        attention: judged.filter((g) => g.status === 'attention'),
        judged: judged.length,
        onTrack: judged.filter((g) => g.status === 'good').length,
      } as Row;
    });
    // Needs-attention first, then fewest goals on track, then name.
    return built.sort((a, b) =>
      b.attention.length - a.attention.length ||
      (a.judged ? a.onTrack / a.judged : 1) - (b.judged ? b.onTrack / b.judged : 1) ||
      a.name.localeCompare(b.name));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teachers, results.map((r) => r.dataUpdatedAt).join(',')]);

  const needSupport = rows.filter((r) => r.attention.length > 0).length;
  const anyFailed = rows.some((r) => r.failed);

  return (
    <div className="container mx-auto max-w-4xl space-y-5 p-4 md:p-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit">
        <Link to="/admin/teacher-kpi"><ArrowLeft className="mr-2 h-4 w-4" />Teacher KPI</Link>
      </Button>

      <header>
        <h1 className="text-2xl font-bold md:text-3xl">Teacher scorecards</h1>
        <p className="text-muted-foreground">
          The same five goals every teacher sees, from the last 90 days. A grey dot means "still collecting data".
        </p>
      </header>

      {loadingTeachers ? (
        <div className="space-y-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}</div>
      ) : teachers.length === 0 ? (
        <p className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground">No teachers are cleared to teach yet.</p>
      ) : (
        <>
          <p className="text-sm" aria-live="polite">
            <strong>{rows.length}</strong> {rows.length === 1 ? 'teacher' : 'teachers'}
            {' · '}
            {needSupport === 0
              ? <span className="text-emerald-700 dark:text-emerald-400">no one needs support right now</span>
              : <span className="text-rose-700 dark:text-rose-400"><strong>{needSupport}</strong> could use support</span>}
          </p>

          {anyFailed && (
            <p className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm dark:bg-amber-950/20">
              Some scorecards couldn't load. If this is the first time, the database update for scorecards may not have been applied yet.
            </p>
          )}

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground" aria-hidden>
            <span>Dots, left to right:</span>
            {GOAL_ORDER.map((g) => <span key={g}>{g}</span>)}
          </div>

          <ul className="space-y-3">
            {rows.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => r.data && setOpen(r)}
                  disabled={!r.data}
                  className="flex min-h-[72px] w-full items-center gap-3 rounded-2xl border bg-card p-4 text-left shadow-sm transition hover:border-primary/50 disabled:opacity-70"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold">{r.name}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {r.loading ? 'Loading…'
                        : r.failed ? 'Not available yet'
                        : r.judged === 0 ? 'Collecting data (needs a few more lessons)'
                        : r.attention.length > 0 ? `Could use support with: ${r.attention.map((g) => g.title.toLowerCase()).join(', ')}`
                        : `${r.onTrack} of ${r.judged} goals on track`}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5" role="img"
                    aria-label={r.goals.map((g) => `${g.title}: ${STATUS_STYLE[g.status].label}`).join('. ')}>
                    {(r.goals.length ? r.goals : Array.from({ length: 5 })).map((g: any, i) => (
                      <span key={i} className={`h-3.5 w-3.5 rounded-full ${g ? STATUS_STYLE[g.status as Goal['status']].bar : 'bg-muted'}`} />
                    ))}
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{open?.name}</DialogTitle>
            <DialogDescription>This is exactly what {open?.name} sees on their "My teaching" page.</DialogDescription>
          </DialogHeader>
          {open?.data && <ScorecardView data={open.data} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
