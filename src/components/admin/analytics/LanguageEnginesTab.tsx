// Language Engines — completion rate + accuracy for immersive quests.
// Reads `analytics_events` (event_type='vocab_arc_complete') and filters by
// `event_data.telemetry_tag` prefix `language_engine_`.

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

type Row = { event_data: any; created_at: string | null };
interface Bucket { n: number; sumAcc: number }
const empty = (): Bucket => ({ n: 0, sumAcc: 0 });
const avg = (b: Bucket) => (b.n ? Math.round(b.sumAcc / b.n) : 0);

const ENGINE_LABEL: Record<string, string> = {
  story_engine: 'Story Quest',
  escape_room: 'Escape Room',
  detective_mystery: 'Detective Mystery',
  hidden_object: 'Hidden Object',
};

function parseTag(tag: string): { engine: string; mode: string } | null {
  if (!tag?.startsWith('language_engine_')) return null;
  const rest = tag.slice('language_engine_'.length);
  const m = rest.match(/^(.*)_(lesson|review|quiz)$/);
  if (!m) return { engine: rest, mode: 'lesson' };
  return { engine: m[1], mode: m[2] };
}

export default function LanguageEnginesTab() {
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

  const { byEngine, byMode, byDay, totals } = useMemo(() => {
    const byEngine: Record<string, Bucket> = {};
    const byMode: Record<string, Bucket> = {};
    const byDay: Record<string, Bucket> = {};
    let n = 0;
    let sumAcc = 0;
    let passed = 0;
    for (const r of rows) {
      const parsed = parseTag(r.event_data?.telemetry_tag ?? '');
      if (!parsed) continue;
      const acc = Number(r.event_data?.accuracy ?? 0);
      n += 1;
      sumAcc += acc;
      if (acc >= 80) passed += 1;
      byEngine[parsed.engine] ??= empty();
      byEngine[parsed.engine].n += 1;
      byEngine[parsed.engine].sumAcc += acc;
      byMode[parsed.mode] ??= empty();
      byMode[parsed.mode].n += 1;
      byMode[parsed.mode].sumAcc += acc;
      const d = (r.created_at ?? '').slice(0, 10);
      if (d) {
        byDay[d] ??= empty();
        byDay[d].n += 1;
        byDay[d].sumAcc += acc;
      }
    }
    return {
      byEngine, byMode, byDay,
      totals: { n, avgAcc: n ? Math.round(sumAcc / n) : 0, completionRate: n ? Math.round((passed / n) * 100) : 0 },
    };
  }, [rows]);

  const sortedDays = Object.keys(byDay).sort();

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Stat label="Engine runs" value={totals.n} />
        <Stat label="Average accuracy" value={`${totals.avgAcc}%`} />
        <Stat label="Completion rate (≥80%)" value={`${totals.completionRate}%`} />
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">By engine type</CardTitle></CardHeader>
        <CardContent>
          {Object.keys(byEngine).length === 0 ? (
            <p className="text-sm text-muted-foreground">No engine activity in this window.</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(byEngine)
                .sort((a, b) => b[1].n - a[1].n)
                .map(([engine, b]) => (
                  <div key={engine} className="flex items-center justify-between border-b border-border/50 pb-2">
                    <div className="font-medium text-foreground">{ENGINE_LABEL[engine] ?? engine}</div>
                    <div className="text-sm text-muted-foreground">
                      {b.n} runs · {avg(b)}% accuracy
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">By mode</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {(['lesson', 'review', 'quiz'] as const).map((mode) => {
              const b = byMode[mode] ?? empty();
              return (
                <div key={mode} className="rounded-lg border border-border p-3">
                  <div className="text-xs uppercase text-muted-foreground">{mode}</div>
                  <div className="text-2xl font-bold text-foreground">{b.n}</div>
                  <div className="text-sm text-muted-foreground">{avg(b)}% accuracy</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Daily trend</CardTitle></CardHeader>
        <CardContent>
          {sortedDays.length === 0 ? (
            <p className="text-sm text-muted-foreground">No data.</p>
          ) : (
            <div className="space-y-1 max-h-64 overflow-auto">
              {sortedDays.map((d) => {
                const b = byDay[d];
                return (
                  <div key={d} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground font-mono">{d}</span>
                    <span className="text-foreground">{b.n} runs · {avg(b)}%</span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <Card className="bg-card/60 backdrop-blur">
      <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{label}</CardTitle></CardHeader>
      <CardContent><div className="text-3xl font-bold text-foreground">{value}</div></CardContent>
    </Card>
  );
}
