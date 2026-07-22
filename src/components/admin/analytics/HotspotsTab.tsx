import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Row {
  id: string;
  metric: string;
  scope: { lesson_id?: string };
  p50: number;
  sample_size: number;
  flag: string | null;
  details: { drop_off_slides?: number[] };
}

export default function HotspotsTab() {
  const [rows, setRows] = useState<Row[]>([]);
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('beta_insights')
        .select('id, metric, scope, p50, sample_size, flag, details')
        .eq('metric', 'slide_dwell_ms')
        .not('flag', 'is', null)
        .order('computed_at', { ascending: false })
        .limit(50);
      setRows((data ?? []) as Row[]);
    })();
  }, []);
  return (
    <div className="space-y-3 mt-4">
      {rows.length === 0 && (
        <Card><CardContent className="p-6 text-sm text-muted-foreground">No hotspots flagged.</CardContent></Card>
      )}
      {rows.map((r) => (
        <Card key={r.id}>
          <CardContent className="p-4 flex items-center justify-between gap-4">
            <div>
              <div className="font-mono text-xs text-muted-foreground">{r.scope.lesson_id ?? '—'}</div>
              <div className="text-sm mt-1">
                Drop-off slides:{' '}
                <span className="font-mono">
                  {(r.details.drop_off_slides ?? []).slice(0, 6).join(', ') || '—'}
                </span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">n={r.sample_size}</div>
            </div>
            <Badge variant={r.flag === 'critical' ? 'destructive' : 'secondary'}>{r.flag}</Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
