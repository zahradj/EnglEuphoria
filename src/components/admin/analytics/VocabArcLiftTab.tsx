// Vocab Arc Lift — Academy vocab-gamification retention KPI.
// Reads `analytics_events` (event_type='vocab_arc_complete') and compares
// arc-tagged recall accuracy to the baseline vocab mastery in `student_mastery`.

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

type Row = { event_data: any; created_at: string | null };

interface Bucket { n: number; sumAcc: number }
const empty = (): Bucket => ({ n: 0, sumAcc: 0 });
const avg = (b: Bucket) => (b.n ? Math.round(b.sumAcc / b.n) : 0);

export default function VocabArcLiftTab() {
  const [byTag, setByTag] = useState<Record<string, Bucket>>({});
  const [baseline, setBaseline] = useState<Bucket>(empty());
  const [totalEvents, setTotalEvents] = useState(0);
  const [loading, setLoading] = useState(true);
  const [rangeDays, setRangeDays] = useState<7 | 30>(30);
  const [series, setSeries] = useState<Array<{ day: string; n: number; acc: number }>>([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const since = new Date(Date.now() - rangeDays * 24 * 60 * 60 * 1000).toISOString();
        const [arcRes, baseRes] = await Promise.all([
          (supabase as any)
            .from('analytics_events')
            .select('event_data, created_at')
            .eq('event_type', 'vocab_arc_complete')
            .gte('created_at', since)
            .limit(1000),
          (supabase as any)
            .from('student_mastery')
            .select('mastery_score')
            .eq('item_type', 'vocab')
            .gte('last_tested', since)
            .limit(1000),
        ]);

        const tags: Record<string, Bucket> = {};
        const byDay: Record<string, Bucket> = {};
        (arcRes.data as Row[] | null ?? []).forEach((r) => {
          const tag = r.event_data?.telemetry_tag ?? 'unknown';
          const acc = Number(r.event_data?.accuracy ?? 0);
          tags[tag] ??= empty();
          tags[tag].n += 1;
          tags[tag].sumAcc += acc;
          const d = (r.created_at ?? '').slice(0, 10);
          if (d) {
            byDay[d] ??= empty();
            byDay[d].n += 1;
            byDay[d].sumAcc += acc;
          }
        });
        setByTag(tags);
        setTotalEvents((arcRes.data as any[] | null)?.length ?? 0);

        // Build zero-filled series
        const out: Array<{ day: string; n: number; acc: number }> = [];
        for (let i = rangeDays - 1; i >= 0; i--) {
          const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
          const b = byDay[d] ?? empty();
          out.push({ day: d, n: b.n, acc: avg(b) });
        }
        setSeries(out);

        const base = empty();
        (baseRes.data as { mastery_score: number | null }[] | null ?? []).forEach((r) => {
          const s = Number(r.mastery_score ?? 0);
          base.n += 1;
          base.sumAcc += s;
        });
        setBaseline(base);
      } finally {
        setLoading(false);
      }
    })();
  }, [rangeDays]);

  const arcAll: Bucket = Object.values(byTag).reduce(
    (a, b) => ({ n: a.n + b.n, sumAcc: a.sumAcc + b.sumAcc }),
    empty(),
  );
  const lift = avg(arcAll) - avg(baseline);

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading vocab arc telemetry…</div>;
  }

  if (totalEvents === 0) {
    return (
      <Card className="bg-card/60">
        <CardHeader><CardTitle>Vocab Arc Lift</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No <code className="text-xs">vocab_arc_complete</code> events in the last 30 days yet.
            The Academy vocab-gamification arc emits telemetry once authed students complete an injected slide.
          </p>
        </CardContent>
      </Card>
    );
  }

  const maxN = Math.max(1, ...series.map((p) => p.n));
  const w = 640;
  const h = 96;
  const barW = series.length > 0 ? w / series.length : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-2">
        <Button size="sm" variant={rangeDays === 7 ? 'default' : 'outline'} onClick={() => setRangeDays(7)}>7d</Button>
        <Button size="sm" variant={rangeDays === 30 ? 'default' : 'outline'} onClick={() => setRangeDays(30)}>30d</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card/60">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Arc completions ({rangeDays}d)</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-foreground">{arcAll.n}</div></CardContent>
        </Card>
        <Card className="bg-card/60">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Arc recall accuracy</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-foreground">{avg(arcAll)}%</div></CardContent>
        </Card>
        <Card className="bg-card/60">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Lift vs. baseline vocab</CardTitle></CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${lift >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {lift >= 0 ? '+' : ''}{lift}pp
            </div>
            <div className="text-xs text-muted-foreground mt-1">baseline {avg(baseline)}% · n={baseline.n}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/60">
        <CardHeader className="pb-2"><CardTitle className="text-base">Daily trend</CardTitle></CardHeader>
        <CardContent>
          <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-24">
            {series.map((p, i) => {
              const bh = (p.n / maxN) * (h - 24);
              return (
                <g key={p.day}>
                  <rect x={i * barW + 1} y={h - bh - 16} width={Math.max(1, barW - 2)} height={bh}
                    className="fill-primary/70" />
                  <title>{`${p.day} · ${p.n} completions · ${p.acc}% acc`}</title>
                </g>
              );
            })}
            <line x1={0} y1={h - 16} x2={w} y2={h - 16} className="stroke-border" strokeWidth={1} />
          </svg>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{series[0]?.day ?? ''}</span>
            <span>peak {maxN}/day</span>
            <span>{series[series.length - 1]?.day ?? ''}</span>
          </div>
        </CardContent>
      </Card>


      <Card className="bg-card/60">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">By arc slide type</CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const header = ['telemetry_tag', 'completions', 'avg_accuracy_pct'];
              const rows = Object.entries(byTag)
                .sort((a, b) => b[1].n - a[1].n)
                .map(([tag, b]) => [tag, String(b.n), String(avg(b))]);
              rows.push(['__baseline_vocab__', String(baseline.n), String(avg(baseline))]);
              rows.push(['__arc_total__', String(arcAll.n), String(avg(arcAll))]);
              const csv = [header, ...rows]
                .map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(','))
                .join('\n');
              const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `vocab-arc-lift-${new Date().toISOString().slice(0, 10)}.csv`;
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead className="text-muted-foreground text-left">
              <tr><th className="py-1">Telemetry tag</th><th className="py-1">Completions</th><th className="py-1">Avg accuracy</th></tr>
            </thead>
            <tbody>
              {Object.entries(byTag).sort((a, b) => b[1].n - a[1].n).map(([tag, b]) => (
                <tr key={tag} className="border-t border-border/40">
                  <td className="py-2 font-mono text-xs">{tag}</td>
                  <td className="py-2">{b.n}</td>
                  <td className="py-2">{avg(b)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
