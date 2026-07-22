// Pedagogical Health Panel — admin/content-creator view of the latest
// stabilization report for a given lesson. Reuses existing UI primitives.

import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ValidatorRow {
  validator: string;
  verdict: 'pass' | 'repair' | 'block';
  issues?: Array<{ code: string; message: string; severity: string }>;
  metrics?: Record<string, unknown>;
}

interface RepairRow {
  kind: string;
  reason: string;
  appliedAt: string;
}

interface ReportRow {
  id: string;
  final_verdict: 'pass' | 'repair' | 'block';
  verdicts: ValidatorRow[];
  metrics: Record<string, unknown>;
  repairs_applied: RepairRow[];
  created_at: string;
}

function verdictTone(v: ReportRow['final_verdict']) {
  if (v === 'pass') return 'default';
  if (v === 'repair') return 'secondary';
  return 'destructive';
}

export function PedagogicalHealthPanel({ lessonId }: { lessonId: string }) {
  const [report, setReport] = useState<ReportRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    (async () => {
      const { data } = await supabase
        .from('pedagogical_quality_reports' as any)
        .select('*')
        .eq('lesson_id', lessonId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (alive) {
        setReport((data as ReportRow | null) ?? null);
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [lessonId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pedagogical Health</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">Loading…</CardContent>
      </Card>
    );
  }

  if (!report) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pedagogical Health</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          No stabilization report yet for this lesson.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Pedagogical Health</CardTitle>
        <Badge variant={verdictTone(report.final_verdict) as any}>
          {report.final_verdict.toUpperCase()}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
          {report.verdicts?.map((v) => (
            <div key={v.validator} className="rounded-md border p-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium capitalize">{v.validator}</span>
                <Badge variant={verdictTone(v.verdict) as any}>{v.verdict}</Badge>
              </div>
              {v.issues?.length ? (
                <ul className="mt-1 list-disc pl-4 text-xs text-muted-foreground">
                  {v.issues.slice(0, 3).map((i, idx) => (
                    <li key={idx}>{i.message}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-1 text-xs text-muted-foreground">All checks passed.</p>
              )}
            </div>
          ))}
        </div>

        {report.repairs_applied?.length ? (
          <div>
            <h4 className="text-sm font-medium">Repairs applied</h4>
            <ul className="mt-1 space-y-1 text-xs text-muted-foreground">
              {report.repairs_applied.map((r, idx) => (
                <li key={idx}>
                  <span className="font-mono">{r.kind}</span> — {r.reason}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <p className="text-xs text-muted-foreground">
          Generated {new Date(report.created_at).toLocaleString()}
        </p>
      </CardContent>
    </Card>
  );
}

export default PedagogicalHealthPanel;
