// Repair Events tab — reads qa_repair_events (per-bucket telemetry logged by
// the orchestrator right after runQualityControl). Complements the richer
// Repair Efficacy tab (qa_repair_telemetry, verdict-level).

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface RepairEvent {
  id: string;
  lesson_id: string;
  hub: string | null;
  cefr: string | null;
  lesson_kind: string | null;
  pass_no: number;
  target: string;
  issue_codes: string[];
  verdict: string | null;
  created_at: string;
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export default function RepairEventsTab() {
  const [rows, setRows] = useState<RepairEvent[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const since = new Date(Date.now() - SEVEN_DAYS_MS).toISOString();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: err } = await (supabase.from('qa_repair_events' as any) as any)
        .select('*')
        .gte('created_at', since)
        .order('created_at', { ascending: false })
        .limit(1000);
      if (err) setError(err.message);
      else setRows((data as RepairEvent[]) ?? []);
    })();
  }, []);

  const stats = useMemo(() => {
    if (!rows) return null;
    const byCode = new Map<string, number>();
    const byTarget = new Map<string, number>();
    const byHubCefr = new Map<string, number>();
    for (const r of rows) {
      byTarget.set(r.target, (byTarget.get(r.target) ?? 0) + 1);
      const hc = `${r.hub ?? '—'} · ${r.cefr ?? '—'}`;
      byHubCefr.set(hc, (byHubCefr.get(hc) ?? 0) + 1);
      for (const c of r.issue_codes ?? []) byCode.set(c, (byCode.get(c) ?? 0) + 1);
    }
    const sortDesc = (m: Map<string, number>) =>
      [...m.entries()].sort((a, b) => b[1] - a[1]);
    return {
      total: rows.length,
      topCodes: sortDesc(byCode).slice(0, 12),
      topTargets: sortDesc(byTarget),
      byHubCefr: sortDesc(byHubCefr),
    };
  }, [rows]);

  if (error) {
    return (
      <Card><CardContent className="p-6 text-sm text-destructive">Failed to load: {error}</CardContent></Card>
    );
  }
  if (!rows) return <Card><CardContent className="p-6 text-sm text-muted-foreground">Loading…</CardContent></Card>;
  if (!stats || stats.total === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">
          No repair events in the last 7 days. Either publishes are clean or the orchestrator hasn't run yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Repair buckets (7d)" value={stats.total} />
        <StatCard label="Distinct codes" value={stats.topCodes.length} />
        <StatCard label="Distinct targets" value={stats.topTargets.length} />
      </div>

      <Card>
        <CardHeader><CardTitle>Top repair codes</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {stats.topCodes.map(([code, n]) => (
            <div key={code} className="flex items-center justify-between text-sm">
              <span className="font-mono">{code}</span>
              <Badge variant={code.startsWith('PREA1_') ? 'default' : 'secondary'}>{n}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>By repair target</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {stats.topTargets.map(([t, n]) => (
              <div key={t} className="flex items-center justify-between text-sm">
                <span className="font-mono">{t}</span>
                <Badge variant="secondary">{n}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>By hub × CEFR</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {stats.byHubCefr.map(([hc, n]) => (
              <div key={hc} className="flex items-center justify-between text-sm">
                <span>{hc}</span>
                <Badge variant="secondary">{n}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Recent events</CardTitle></CardHeader>
        <CardContent>
          <div className="max-h-96 overflow-y-auto space-y-2 text-xs">
            {rows.slice(0, 50).map((r) => (
              <div key={r.id} className="flex flex-wrap items-center gap-2 border-b border-border/50 pb-2">
                <span className="text-muted-foreground">{new Date(r.created_at).toLocaleString()}</span>
                <Badge variant="outline">{r.hub ?? '—'}</Badge>
                <Badge variant="outline">{r.cefr ?? '—'}</Badge>
                <span className="font-mono">{r.target}</span>
                <span className="text-muted-foreground">pass {r.pass_no}</span>
                {r.verdict && <Badge>{r.verdict}</Badge>}
                <span className="font-mono text-[10px] text-muted-foreground">{(r.issue_codes ?? []).join(', ')}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card className="bg-card/60 backdrop-blur">
      <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{label}</CardTitle></CardHeader>
      <CardContent><div className="text-3xl font-bold text-foreground">{value}</div></CardContent>
    </Card>
  );
}
