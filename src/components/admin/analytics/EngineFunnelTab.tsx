// Language Engines — Deep-dive funnel & drop-off heatmap.
// Per-engine × mode matrix, accuracy distribution heatmap, and median duration.
// Reads `analytics_events` (event_type='vocab_arc_complete') filtered by
// `event_data.telemetry_tag` prefix `language_engine_`.

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

type Row = { event_data: any; created_at: string | null };

const ENGINE_LABEL: Record<string, string> = {
  story_engine: 'Story Quest',
  escape_room: 'Escape Room',
  detective_mystery: 'Detective Mystery',
  hidden_object: 'Hidden Object',
};
const ENGINES = ['story_engine', 'escape_room', 'detective_mystery', 'hidden_object'] as const;
const MODES = ['lesson', 'review', 'quiz'] as const;
const BUCKETS: { label: string; min: number; max: number }[] = [
  { label: '<50', min: 0, max: 49 },
  { label: '50–69', min: 50, max: 69 },
  { label: '70–79', min: 70, max: 79 },
  { label: '80–89', min: 80, max: 89 },
  { label: '90–100', min: 90, max: 100 },
];

function parseTag(tag: string): { engine: string; mode: string } | null {
  if (!tag?.startsWith('language_engine_')) return null;
  const rest = tag.slice('language_engine_'.length);
  const m = rest.match(/^(.*)_(lesson|review|quiz)$/);
  if (!m) return { engine: rest, mode: 'lesson' };
  return { engine: m[1], mode: m[2] };
}

function median(nums: number[]): number {
  if (!nums.length) return 0;
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : Math.round((s[mid - 1] + s[mid]) / 2);
}

export default function EngineFunnelTab() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [rangeDays, setRangeDays] = useState<7 | 30>(30);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const since = new Date(Date.now() - rangeDays * 24 * 60 * 60 * 1000).toISOString();
      const res = await (supabase as any)
        .from('analytics_events')
        .select('event_data, created_at')
        .eq('event_type', 'vocab_arc_complete')
        .gte('created_at', since)
        .limit(5000);
      setRows((res.data as Row[] | null) ?? []);
      setLoading(false);
    })();
  }, [rangeDays]);

  const { matrix, heatmap, durations, dropOff } = useMemo(() => {
    // matrix[engine][mode] = { n, sumAcc, durations[] }
    const matrix: Record<string, Record<string, { n: number; sumAcc: number; durations: number[] }>> = {};
    const heatmap: Record<string, number[]> = {}; // engine -> counts per bucket
    const durations: Record<string, number[]> = {};
    const dropOff: Record<string, { started: number; passed: number }> = {};
    for (const eng of ENGINES) {
      matrix[eng] = {};
      heatmap[eng] = BUCKETS.map(() => 0);
      durations[eng] = [];
      dropOff[eng] = { started: 0, passed: 0 };
      for (const m of MODES) matrix[eng][m] = { n: 0, sumAcc: 0, durations: [] };
    }

    for (const r of rows) {
      const parsed = parseTag(r.event_data?.telemetry_tag ?? '');
      if (!parsed) continue;
      const eng = parsed.engine;
      const mode = parsed.mode;
      if (!matrix[eng] || !matrix[eng][mode]) continue;
      const acc = Number(r.event_data?.accuracy ?? 0);
      const dur = Number(r.event_data?.duration_ms ?? 0);
      matrix[eng][mode].n += 1;
      matrix[eng][mode].sumAcc += acc;
      if (dur > 0) {
        matrix[eng][mode].durations.push(dur);
        durations[eng].push(dur);
      }
      const bIdx = BUCKETS.findIndex((b) => acc >= b.min && acc <= b.max);
      if (bIdx >= 0) heatmap[eng][bIdx] += 1;
      dropOff[eng].started += 1;
      if (acc >= 80) dropOff[eng].passed += 1;
    }
    return { matrix, heatmap, durations, dropOff };
  }, [rows]);

  const maxHeat = Math.max(1, ...Object.values(heatmap).flat());

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setRangeDays(7)}
          className={`px-3 py-1 rounded text-sm ${rangeDays === 7 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
        >
          Last 7 days
        </button>
        <button
          onClick={() => setRangeDays(30)}
          className={`px-3 py-1 rounded text-sm ${rangeDays === 30 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
        >
          Last 30 days
        </button>
        {loading && <span className="text-sm text-muted-foreground">Loading…</span>}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Engine × Mode matrix</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground border-b border-border">
                <th className="py-2 pr-4">Engine</th>
                {MODES.map((m) => <th key={m} className="py-2 pr-4 capitalize">{m}</th>)}
                <th className="py-2 pr-4">Total</th>
                <th className="py-2 pr-4">Median duration</th>
              </tr>
            </thead>
            <tbody>
              {ENGINES.map((eng) => {
                const total = MODES.reduce((s, m) => s + matrix[eng][m].n, 0);
                const totalAcc = MODES.reduce((s, m) => s + matrix[eng][m].sumAcc, 0);
                const medDurMs = median(durations[eng]);
                return (
                  <tr key={eng} className="border-b border-border/50">
                    <td className="py-2 pr-4 font-medium text-foreground">{ENGINE_LABEL[eng] ?? eng}</td>
                    {MODES.map((m) => {
                      const b = matrix[eng][m];
                      const acc = b.n ? Math.round(b.sumAcc / b.n) : 0;
                      return (
                        <td key={m} className="py-2 pr-4 text-muted-foreground">
                          {b.n ? `${b.n} · ${acc}%` : '—'}
                        </td>
                      );
                    })}
                    <td className="py-2 pr-4 text-foreground">
                      {total ? `${total} · ${Math.round(totalAcc / total)}%` : '—'}
                    </td>
                    <td className="py-2 pr-4 text-muted-foreground">
                      {medDurMs ? `${(medDurMs / 1000).toFixed(1)}s` : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Accuracy distribution heatmap</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground border-b border-border">
                <th className="py-2 pr-4">Engine</th>
                {BUCKETS.map((b) => <th key={b.label} className="py-2 pr-2 text-center">{b.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {ENGINES.map((eng) => (
                <tr key={eng} className="border-b border-border/50">
                  <td className="py-2 pr-4 font-medium text-foreground whitespace-nowrap">
                    {ENGINE_LABEL[eng] ?? eng}
                  </td>
                  {heatmap[eng].map((count, i) => {
                    const intensity = count / maxHeat;
                    return (
                      <td key={i} className="py-1 pr-2 text-center">
                        <div
                          className="rounded px-2 py-2 text-xs font-medium"
                          style={{
                            backgroundColor: `hsl(var(--primary) / ${0.08 + intensity * 0.72})`,
                            color: intensity > 0.5 ? 'hsl(var(--primary-foreground))' : 'hsl(var(--foreground))',
                          }}
                        >
                          {count || '·'}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-xs text-muted-foreground">
            Darker cells = more runs landing in that accuracy band. Concentration in ≥80 columns indicates the
            engine is well-calibrated for its cohort.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Drop-off funnel (started → passed ≥80%)</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {ENGINES.map((eng) => {
              const d = dropOff[eng];
              const pct = d.started ? Math.round((d.passed / d.started) * 100) : 0;
              return (
                <div key={eng} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">{ENGINE_LABEL[eng] ?? eng}</span>
                    <span className="text-muted-foreground">
                      {d.passed}/{d.started} passed · {pct}%
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
