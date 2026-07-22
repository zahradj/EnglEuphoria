import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface SignalRow { hub: string | null; signal_type: string; severity: number }

const HUBS = ['playground', 'academy', 'success'] as const;

export default function CohortCompareTab() {
  const [byHub, setByHub] = useState<Record<string, Record<string, number>>>({});
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('learner_signals')
        .select('hub, signal_type, severity')
        .gt('decay_at', new Date().toISOString())
        .limit(2000);
      const m: Record<string, Record<string, number>> = {};
      for (const r of (data ?? []) as SignalRow[]) {
        const hub = r.hub ?? 'unknown';
        m[hub] ??= {};
        m[hub][r.signal_type] = (m[hub][r.signal_type] ?? 0) + 1;
      }
      setByHub(m);
    })();
  }, []);
  const types = ['frustration', 'boredom', 'overload', 'disengagement', 'too_hard', 'too_easy'];
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
      {HUBS.map((h) => (
        <Card key={h}>
          <CardHeader className="pb-2"><CardTitle className="capitalize text-sm">{h}</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm">
            {types.map((t) => (
              <div key={t} className="flex justify-between">
                <span className="text-muted-foreground">{t}</span>
                <span className="font-mono text-foreground">{byHub[h]?.[t] ?? 0}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
