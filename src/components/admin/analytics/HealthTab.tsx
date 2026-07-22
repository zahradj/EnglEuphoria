import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface Row { metric: string; p50: number; p90: number; sample_size: number; computed_at: string }

export default function HealthTab() {
  const [rows, setRows] = useState<Row[]>([]);
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('beta_insights')
        .select('metric, p50, p90, sample_size, computed_at')
        .order('computed_at', { ascending: false })
        .limit(50);
      setRows((data ?? []) as Row[]);
    })();
  }, []);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      {rows.length === 0 && (
        <Card className="md:col-span-2">
          <CardContent className="p-6 text-muted-foreground text-sm">
            No insights yet. Trigger the <code>analytics-rollup</code> function to populate.
          </CardContent>
        </Card>
      )}
      {rows.map((r, i) => (
        <Card key={i}>
          <CardHeader className="pb-2"><CardTitle className="text-sm">{r.metric}</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-1">
            <div>p50: <span className="font-mono text-foreground">{Number(r.p50).toFixed(2)}</span></div>
            <div>p90: <span className="font-mono text-foreground">{Number(r.p90).toFixed(2)}</span></div>
            <div className="text-muted-foreground text-xs">n={r.sample_size} · {new Date(r.computed_at).toLocaleString()}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
