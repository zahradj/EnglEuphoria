/**
 * Admin analytics — VocabGamesSlot pass rates across all hubs.
 *
 * Reads `analytics_events` rows emitted by VocabGamesSlot (`onComplete`) and
 * aggregates by hub × mode × game archetype. Deterministic, no AI.
 */

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Row = {
  hub?: string;
  mode?: string;
  accuracy?: number;
  passed?: boolean;
  ms_elapsed?: number;
  games?: string[];
};

type Bucket = {
  key: string;
  runs: number;
  passed: number;
  totalAccuracy: number;
  totalMs: number;
};

export default function VocabGamesAnalytics() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { data } = await supabase
        .from('analytics_events')
        .select('event_name, properties, created_at')
        .eq('event_name', 'vocab-games:complete')
        .gte('created_at', since)
        .limit(5000);
      if (cancelled) return;
      const list = (data ?? []).map((r: any) => (r.properties ?? {}) as Row);
      setRows(list);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const byHubMode = useMemo(() => {
    const map = new Map<string, Bucket>();
    for (const r of rows) {
      const key = `${r.hub ?? 'unknown'} · ${r.mode ?? 'lesson'}`;
      const b = map.get(key) ?? {
        key,
        runs: 0,
        passed: 0,
        totalAccuracy: 0,
        totalMs: 0,
      };
      b.runs += 1;
      if (r.passed) b.passed += 1;
      b.totalAccuracy += r.accuracy ?? 0;
      b.totalMs += r.ms_elapsed ?? 0;
      map.set(key, b);
    }
    return Array.from(map.values()).sort((a, b) => b.runs - a.runs);
  }, [rows]);

  const totals = useMemo(() => {
    const runs = rows.length;
    const passed = rows.filter((r) => r.passed).length;
    const avgAcc =
      runs > 0
        ? rows.reduce((s, r) => s + (r.accuracy ?? 0), 0) / runs
        : 0;
    return { runs, passed, avgAcc };
  }, [rows]);

  return (
    <div className="max-w-[960px] mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Vocab Games Analytics</h1>
      <p className="text-sm text-muted-foreground">
        Last 30 days · aggregated across Playground / Academy / Success.
      </p>

      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total runs</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {loading ? '…' : totals.runs}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Quiz pass rate</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {loading
              ? '…'
              : totals.runs > 0
                ? `${Math.round((totals.passed / totals.runs) * 100)}%`
                : '—'}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Avg accuracy</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {loading ? '…' : `${Math.round(totals.avgAcc * 100)}%`}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>By hub × mode</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading…</div>
          ) : byHubMode.length === 0 ? (
            <div className="text-sm text-muted-foreground">No events yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="py-1">Scope</th>
                  <th className="py-1 text-right">Runs</th>
                  <th className="py-1 text-right">Pass %</th>
                  <th className="py-1 text-right">Avg acc</th>
                  <th className="py-1 text-right">Avg time</th>
                </tr>
              </thead>
              <tbody>
                {byHubMode.map((b) => (
                  <tr key={b.key} className="border-t">
                    <td className="py-1">{b.key}</td>
                    <td className="py-1 text-right">{b.runs}</td>
                    <td className="py-1 text-right">
                      {b.runs > 0 ? `${Math.round((b.passed / b.runs) * 100)}%` : '—'}
                    </td>
                    <td className="py-1 text-right">
                      {b.runs > 0
                        ? `${Math.round((b.totalAccuracy / b.runs) * 100)}%`
                        : '—'}
                    </td>
                    <td className="py-1 text-right">
                      {b.runs > 0
                        ? `${Math.round(b.totalMs / b.runs / 1000)}s`
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
