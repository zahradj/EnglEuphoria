import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClassFrictionHeatmapProps {
  teacherId: string;
}

type Range = 7 | 30;

interface StrikeRow {
  student_id: string;
  target_label: string;
  target_type: string;
  strike_level: number;
  occurred_at: string;
}

/**
 * Aggregates 3-strike events into a friction heatmap.
 * Green  = <20% of strike events on this target reached strike 3.
 * Orange = 20–40%.
 * Red    = >40%.
 */
export const ClassFrictionHeatmap: React.FC<ClassFrictionHeatmapProps> = ({ teacherId }) => {
  const [range, setRange] = useState<Range>(7);

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ['scaffold-strikes', teacherId, range],
    queryFn: async () => {
      const since = new Date(Date.now() - range * 24 * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from('scaffold_strike_events')
        .select('student_id, target_label, target_type, strike_level, occurred_at')
        .gte('occurred_at', since)
        .order('occurred_at', { ascending: false })
        .limit(2000);
      if (error) throw error;
      return (data ?? []) as StrikeRow[];
    },
  });

  const grouped = useMemo(() => {
    const map = new Map<string, { label: string; type: string; total: number; strike3: number }>();
    for (const r of rows) {
      const key = `${r.target_type}::${r.target_label}`;
      const cur = map.get(key) ?? { label: r.target_label, type: r.target_type, total: 0, strike3: 0 };
      cur.total += 1;
      if (r.strike_level >= 3) cur.strike3 += 1;
      map.set(key, cur);
    }
    return Array.from(map.values())
      .map((v) => ({ ...v, ratio: v.total ? v.strike3 / v.total : 0 }))
      .sort((a, b) => b.ratio - a.ratio || b.total - a.total)
      .slice(0, 24);
  }, [rows]);

  return (
    <Card className="border-primary/20">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Flame className="h-4 w-4 text-primary" /> Class Friction Heatmap
        </CardTitle>
        <Select value={String(range)} onValueChange={(v) => setRange(Number(v) as Range)}>
          <SelectTrigger className="w-[140px] h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : grouped.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-primary/20 bg-primary/5 p-8 text-center">
            <AlertTriangle className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No strike data yet for this window.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {grouped.map((g) => {
              const tone =
                g.ratio > 0.4
                  ? 'bg-destructive/15 border-destructive/50 text-destructive'
                  : g.ratio >= 0.2
                  ? 'bg-orange-500/15 border-orange-500/50 text-orange-700 dark:text-orange-300'
                  : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-300';
              return (
                <div
                  key={`${g.type}-${g.label}`}
                  className={cn('rounded-lg border p-2.5', tone)}
                  title={`${g.strike3}/${g.total} reached the reteach modal`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold truncate">{g.label}</span>
                    <Badge variant="outline" className="text-[10px]">{g.type}</Badge>
                  </div>
                  <div className="mt-1 text-xs opacity-80">
                    {Math.round(g.ratio * 100)}% reteach · {g.total} hits
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClassFrictionHeatmap;
