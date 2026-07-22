import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Row {
  id: string;
  student_id: string;
  signal_type: string;
  severity: number;
  hub: string | null;
  evidence: unknown;
  created_at: string;
}

export default function SignalInboxTab() {
  const [rows, setRows] = useState<Row[]>([]);
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('learner_signals')
        .select('id, student_id, signal_type, severity, hub, evidence, created_at')
        .order('created_at', { ascending: false })
        .limit(100);
      setRows((data ?? []) as Row[]);
    })();
  }, []);
  return (
    <div className="space-y-2 mt-4">
      {rows.length === 0 && (
        <Card><CardContent className="p-6 text-sm text-muted-foreground">No signals.</CardContent></Card>
      )}
      {rows.map((r) => (
        <Card key={r.id}>
          <CardContent className="p-3 flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Badge variant={r.severity > 0.7 ? 'destructive' : 'secondary'}>{r.signal_type}</Badge>
                <span className="text-xs text-muted-foreground">{r.hub ?? '—'}</span>
                <span className="text-xs text-muted-foreground">sev {Number(r.severity).toFixed(2)}</span>
              </div>
              <div className="font-mono text-xs text-muted-foreground truncate mt-1">{r.student_id}</div>
            </div>
            <div className="text-xs text-muted-foreground whitespace-nowrap">
              {new Date(r.created_at).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
