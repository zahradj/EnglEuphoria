import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Row {
  id: string;
  student_id: string;
  lesson_id: string | null;
  engine: string;
  delta: { field?: string; before?: unknown; after?: unknown; fired_count?: number; blocked?: boolean };
  reason: string | null;
  created_at: string;
}

type Filter = 'all' | 'a1_blueprint' | 'other';

export default function TuningLogTab() {
  const [rows, setRows] = useState<Row[]>([]);
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('analytics_tuning_log')
        .select('id, student_id, lesson_id, engine, delta, reason, created_at')
        .order('created_at', { ascending: false })
        .limit(200);
      setRows((data ?? []) as Row[]);
    })();
  }, []);

  const filtered = useMemo(() => {
    if (filter === 'a1_blueprint') return rows.filter((r) => r.engine === 'qa.a1_blueprint');
    if (filter === 'other') return rows.filter((r) => r.engine !== 'qa.a1_blueprint');
    return rows;
  }, [rows, filter]);

  const a1Count = rows.filter((r) => r.engine === 'qa.a1_blueprint').length;

  return (
    <div className="space-y-3 mt-4">
      <div className="flex items-center gap-2">
        <Button size="sm" variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')}>
          All ({rows.length})
        </Button>
        <Button size="sm" variant={filter === 'a1_blueprint' ? 'default' : 'outline'} onClick={() => setFilter('a1_blueprint')}>
          A1 Blueprint ({a1Count})
        </Button>
        <Button size="sm" variant={filter === 'other' ? 'default' : 'outline'} onClick={() => setFilter('other')}>
          Other ({rows.length - a1Count})
        </Button>
      </div>

      {filtered.length === 0 && (
        <Card><CardContent className="p-6 text-sm text-muted-foreground">No tunings applied yet.</CardContent></Card>
      )}
      {filtered.map((r) => {
        const isBlueprint = r.engine === 'qa.a1_blueprint';
        return (
          <Card key={r.id}>
            <CardContent className="p-3 flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={isBlueprint ? 'default' : 'secondary'}>{r.engine}</Badge>
                  {isBlueprint ? (
                    <>
                      {typeof r.delta?.fired_count === 'number' && (
                        <span className="text-xs font-mono text-muted-foreground">
                          fired={r.delta.fired_count}
                        </span>
                      )}
                      {r.delta?.blocked ? (
                        <Badge variant="destructive">blocked</Badge>
                      ) : (
                        <Badge variant="outline">warn</Badge>
                      )}
                    </>
                  ) : (
                    <>
                      <span className="text-sm text-foreground">{r.delta?.field}</span>
                      <span className="text-xs font-mono text-muted-foreground">
                        {String(r.delta?.before)} → {String(r.delta?.after)}
                      </span>
                    </>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-1 truncate">{r.reason}</div>
              </div>
              <div className="text-xs text-muted-foreground whitespace-nowrap">
                {new Date(r.created_at).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
