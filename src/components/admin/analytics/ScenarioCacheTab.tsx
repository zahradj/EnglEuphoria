// Scenario Cache admin — top cached engine scenarios, hit rate, purge stale.
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

type Row = {
  id: string;
  engine: string;
  hub: string;
  cefr: string;
  topic: string | null;
  hit_count: number;
  last_hit_at: string;
  created_at: string;
};

export default function ScenarioCacheTab() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [purging, setPurging] = useState(false);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from('engine_scenario_cache')
      .select('id, engine, hub, cefr, topic, hit_count, last_hit_at, created_at')
      .order('hit_count', { ascending: false })
      .limit(50);
    if (error) toast.error(error.message);
    setRows((data as Row[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const totalHits = rows.reduce((s, r) => s + r.hit_count, 0);
  const reused = rows.filter((r) => r.hit_count > 1).length;
  const hitRate = rows.length ? Math.round((reused / rows.length) * 100) : 0;

  async function purgeStale() {
    setPurging(true);
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { error, count } = await supabase
      .from('engine_scenario_cache')
      .delete({ count: 'exact' })
      .lt('last_hit_at', cutoff)
      .lt('hit_count', 2);
    setPurging(false);
    if (error) return toast.error(error.message);
    toast.success(`Purged ${count ?? 0} stale scenarios`);
    load();
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Cached scenarios (top 50)" value={rows.length} />
        <StatCard label="Total hits" value={totalHits} />
        <StatCard label="Reuse rate" value={`${hitRate}%`} />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Top cached scenarios</CardTitle>
          <Button variant="outline" size="sm" onClick={purgeStale} disabled={purging}>
            {purging ? 'Purging…' : 'Purge stale (>30d, <2 hits)'}
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No cached scenarios yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-muted-foreground">
                  <tr>
                    <th className="py-2 pr-3">Engine</th>
                    <th className="py-2 pr-3">Hub</th>
                    <th className="py-2 pr-3">CEFR</th>
                    <th className="py-2 pr-3">Topic</th>
                    <th className="py-2 pr-3">Hits</th>
                    <th className="py-2 pr-3">Last hit</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className="border-t border-border/50">
                      <td className="py-2 pr-3 font-medium">{r.engine}</td>
                      <td className="py-2 pr-3"><Badge variant="secondary">{r.hub}</Badge></td>
                      <td className="py-2 pr-3">{r.cefr}</td>
                      <td className="py-2 pr-3 text-muted-foreground">{r.topic ?? '—'}</td>
                      <td className="py-2 pr-3 font-mono">{r.hit_count}</td>
                      <td className="py-2 pr-3 text-muted-foreground">
                        {new Date(r.last_hit_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <Card className="bg-card/60 backdrop-blur">
      <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{label}</CardTitle></CardHeader>
      <CardContent><div className="text-3xl font-bold text-foreground">{value}</div></CardContent>
    </Card>
  );
}
