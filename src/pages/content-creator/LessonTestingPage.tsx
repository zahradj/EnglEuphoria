import React, { useEffect, useMemo, useState } from 'react';
import { Play, RefreshCw, AlertTriangle, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { toast } from 'sonner';
import {
  runLessonTestSuite,
  buildTestMatrix,
  type TestSuiteResult,
  type TestRunResult,
  type DetectorFailure,
} from '@/testing';
import type { Hub, CEFR, LessonKind } from '@/testing/types';

type Row = {
  id: string;
  run_label: string | null;
  hub: string;
  cefr_level: string;
  lesson_kind: string;
  qa_verdict: string | null;
  stab_verdict: string | null;
  overall_verdict: 'pass' | 'warn' | 'fail';
  detector_failures: DetectorFailure[] | null;
  duration_ms: number | null;
  created_at: string;
};

const HUBS: Hub[] = ['playground', 'academy', 'success'];
const CEFRS: CEFR[] = ['pre-a1', 'a1', 'a2', 'b1', 'b2', 'c1'];

export default function LessonTestingPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [scopeHub, setScopeHub] = useState<Hub | 'all'>('all');
  const [scopeKind, setScopeKind] = useState<LessonKind | 'all'>('all');
  const [drawerRun, setDrawerRun] = useState<Row | null>(null);
  const [liveResult, setLiveResult] = useState<TestSuiteResult | null>(null);

  const fetchRows = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('lesson_test_runs' as any)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);
    if (error) toast.error(`Failed to load test runs: ${error.message}`);
    setRows(((data ?? []) as unknown) as Row[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchRows();
    const sub = supabase
      .channel('lesson_test_runs_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lesson_test_runs' }, () => fetchRows())
      .subscribe();
    return () => { supabase.removeChannel(sub); };
  }, []);

  const matrixHeatmap = useMemo(() => {
    const cell = new Map<string, { pass: number; warn: number; fail: number }>();
    for (const r of rows) {
      const key = `${r.hub}|${r.cefr_level}`;
      const c = cell.get(key) ?? { pass: 0, warn: 0, fail: 0 };
      c[r.overall_verdict]++;
      cell.set(key, c);
    }
    return cell;
  }, [rows]);

  const runScope = async () => {
    setRunning(true);
    setLiveResult(null);
    try {
      const cases = buildTestMatrix({
        hubs: scopeHub === 'all' ? undefined : [scopeHub],
        kinds: scopeKind === 'all' ? undefined : [scopeKind],
      });
      toast.info(`Running ${cases.length} test case(s)…`);
      const result = await runLessonTestSuite({
        cases,
        persist: true,
        runLabel: `manual-${new Date().toISOString()}`,
      });
      setLiveResult(result);
      toast.success(`Done: ${result.passCount} pass / ${result.warnCount} warn / ${result.failCount} fail`);
      fetchRows();
    } catch (e: any) {
      toast.error(`Suite failed: ${e?.message ?? e}`);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Lesson Testing & Validation</h1>
          <p className="text-sm text-muted-foreground">
            Continuous quality harness across every Hub × CEFR × Lesson Kind.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={scopeHub} onValueChange={(v) => setScopeHub(v as any)}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Hub" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Hubs</SelectItem>
              {HUBS.map((h) => <SelectItem key={h} value={h}>{h}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={scopeKind} onValueChange={(v) => setScopeKind(v as any)}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Lesson Kind" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Kinds</SelectItem>
              {(['standard','true_beginner','speaking_heavy','phonics','grammar','review'] as LessonKind[]).map((k) =>
                <SelectItem key={k} value={k}>{k.replace('_',' ')}</SelectItem>
              )}
            </SelectContent>
          </Select>
          <Button onClick={runScope} disabled={running}>
            {running ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
            Run Suite
          </Button>
          <Button variant="outline" size="icon" onClick={fetchRows} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </header>

      {liveResult && (
        <Card>
          <CardHeader><CardTitle>Last Run · {liveResult.runLabel}</CardTitle></CardHeader>
          <CardContent className="flex items-center gap-6 text-sm">
            <VerdictPill v="pass" count={liveResult.passCount} />
            <VerdictPill v="warn" count={liveResult.warnCount} />
            <VerdictPill v="fail" count={liveResult.failCount} />
            <span className="text-muted-foreground">Total: {liveResult.totalCases}</span>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Hub × CEFR Pass-Rate Heatmap</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="p-2">Hub</th>
                  {CEFRS.map((c) => <th key={c} className="p-2 text-center uppercase">{c}</th>)}
                </tr>
              </thead>
              <tbody>
                {HUBS.map((hub) => (
                  <tr key={hub} className="border-t border-border">
                    <td className="p-2 font-medium capitalize">{hub}</td>
                    {CEFRS.map((cefr) => {
                      const c = matrixHeatmap.get(`${hub}|${cefr}`) ?? { pass: 0, warn: 0, fail: 0 };
                      const total = c.pass + c.warn + c.fail;
                      const rate = total ? c.pass / total : -1;
                      return (
                        <td key={cefr} className="p-2 text-center">
                          <div
                            className="rounded-md py-2 text-xs font-medium"
                            style={{
                              background:
                                rate < 0 ? 'hsl(var(--muted))' :
                                rate >= 0.85 ? 'hsl(142 70% 45% / 0.25)' :
                                rate >= 0.6 ? 'hsl(45 90% 55% / 0.25)' :
                                'hsl(0 75% 55% / 0.25)',
                            }}
                          >
                            {total === 0 ? '—' : `${Math.round(rate * 100)}% (${total})`}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Recent Runs</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr className="text-left text-muted-foreground">
                  <th className="p-3">When</th>
                  <th className="p-3">Hub</th>
                  <th className="p-3">CEFR</th>
                  <th className="p-3">Kind</th>
                  <th className="p-3">QA</th>
                  <th className="p-3">Stab</th>
                  <th className="p-3">Verdict</th>
                  <th className="p-3">Failures</th>
                  <th className="p-3">Duration</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => setDrawerRun(r)}
                    className="border-t border-border hover:bg-muted/30 cursor-pointer"
                  >
                    <td className="p-3 text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</td>
                    <td className="p-3 capitalize">{r.hub}</td>
                    <td className="p-3 uppercase">{r.cefr_level}</td>
                    <td className="p-3">{r.lesson_kind}</td>
                    <td className="p-3"><span className="text-xs">{r.qa_verdict ?? '—'}</span></td>
                    <td className="p-3"><span className="text-xs">{r.stab_verdict ?? '—'}</span></td>
                    <td className="p-3"><VerdictPill v={r.overall_verdict} /></td>
                    <td className="p-3">{r.detector_failures?.length ?? 0}</td>
                    <td className="p-3 text-xs text-muted-foreground">{r.duration_ms ?? 0} ms</td>
                  </tr>
                ))}
                {rows.length === 0 && !loading && (
                  <tr><td colSpan={9} className="p-8 text-center text-muted-foreground">No test runs yet. Click <strong>Run Suite</strong> to begin.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Sheet open={!!drawerRun} onOpenChange={(o) => !o && setDrawerRun(null)}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {drawerRun?.hub} · {drawerRun?.cefr_level?.toUpperCase()} · {drawerRun?.lesson_kind}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex gap-2 items-center">
              <VerdictPill v={drawerRun?.overall_verdict ?? 'pass'} />
              <Badge variant="outline">QA: {drawerRun?.qa_verdict ?? '—'}</Badge>
              <Badge variant="outline">Stab: {drawerRun?.stab_verdict ?? '—'}</Badge>
            </div>
            <div className="space-y-2">
              {(drawerRun?.detector_failures ?? []).map((f, i) => (
                <div key={i} className="rounded-md border border-border p-3">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{f.detector}</div>
                    <Badge variant={f.severity === 'error' ? 'destructive' : f.severity === 'warn' ? 'default' : 'secondary'}>
                      {f.severity}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{f.category}{f.slideIndex != null ? ` · slide ${f.slideIndex}` : ''}</div>
                  <div className="text-sm mt-1">{f.message}</div>
                  {f.evidence != null && (
                    <pre className="mt-2 text-[10px] bg-muted/40 p-2 rounded overflow-x-auto">{JSON.stringify(f.evidence, null, 2)}</pre>
                  )}
                </div>
              ))}
              {(drawerRun?.detector_failures?.length ?? 0) === 0 && (
                <div className="text-muted-foreground text-center py-4">No detector failures recorded.</div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function VerdictPill({ v, count }: { v: 'pass' | 'warn' | 'fail'; count?: number }) {
  const map = {
    pass: { icon: CheckCircle2, label: 'Pass', cls: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30' },
    warn: { icon: AlertTriangle, label: 'Warn', cls: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30' },
    fail: { icon: XCircle, label: 'Fail', cls: 'bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30' },
  }[v];
  const Icon = map.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs ${map.cls}`}>
      <Icon className="h-3 w-3" />
      {map.label}{count != null ? ` · ${count}` : ''}
    </span>
  );
}
