/**
 * TeacherRoster — Cycle 5 Admin
 *
 * Master roster of approved teachers with hubs, market, rate and current
 * month's owed. Clicking a row opens the management drawer.
 */
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Search, Users, Coins, Globe2, Star, Undo2 } from 'lucide-react';
import { TeacherManagementDrawer } from './TeacherManagementDrawer';

export interface RosterTeacher {
  user_id: string;
  name: string;
  email: string;
  avatar?: string | null;
  assigned_hubs: string[];
  market_access: string[];
  per_class_rate: number;
  owed_this_month: number;
  owed_classes: number;
}

const HUB_BADGE: Record<string, string> = {
  playground: 'bg-amber-100 text-amber-900 border-amber-300',
  academy: 'bg-blue-100 text-blue-900 border-blue-300',
  success: 'bg-emerald-100 text-emerald-900 border-emerald-300',
};

const HUB_LABEL: Record<string, string> = {
  playground: 'Playground',
  academy: 'Academy',
  success: 'Success',
};

export function TeacherRoster() {
  const [rows, setRows] = useState<RosterTeacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState<RosterTeacher | null>(null);
  const [promoting, setPromoting] = useState<string | null>(null);
  const { toast } = useToast();

  async function setMarketAccess(userId: string, markets: string[]) {
    setPromoting(userId);
    try {
      const { error } = await supabase
        .from('teacher_profiles')
        .update({ market_access: markets })
        .eq('user_id', userId);
      if (error) throw error;
      setRows((prev) => prev.map((r) => r.user_id === userId ? { ...r, market_access: markets } : r));
      toast({
        title: markets.includes('INTL') && markets.length > 1
          ? 'Promoted to International'
          : 'Restricted to local market',
        description: `Teacher now visible to: ${markets.join(', ')}`,
      });
    } catch (e: any) {
      toast({ title: 'Update failed', description: e?.message ?? String(e), variant: 'destructive' });
    } finally {
      setPromoting(null);
    }
  }

  async function load() {
    setLoading(true);
    try {
      const { data: profiles, error } = await supabase
        .from('teacher_profiles')
        .select('user_id, profile_image_url, per_class_rate, assigned_hubs, market_access, hub_role')
        .eq('profile_complete', true)
        .eq('profile_approved_by_admin', true);
      if (error) throw error;
      const ids = (profiles ?? []).map((p: any) => p.user_id);
      const { data: users } = await supabase
        .from('users').select('id, email, full_name').in('id', ids.length ? ids : ['00000000-0000-0000-0000-000000000000']);

      const owedResults = await Promise.all(
        ids.map(async (uid) => {
          const { data } = await supabase.rpc('get_teacher_monthly_owed', { p_teacher_user_id: uid });
          const row: any = Array.isArray(data) ? data[0] : data;
          return { uid, amount: Number(row?.amount ?? 0), n: Number(row?.classes_count ?? 0) };
        }),
      );
      const owedMap = new Map(owedResults.map((o) => [o.uid, o]));

      const merged: RosterTeacher[] = (profiles ?? []).map((p: any) => {
        const u = users?.find((x: any) => x.id === p.user_id);
        const o = owedMap.get(p.user_id);
        const assigned: string[] = Array.isArray(p.assigned_hubs) && p.assigned_hubs.length
          ? p.assigned_hubs
          : p.hub_role ? [normalizeLegacyHub(p.hub_role)] : [];
        return {
          user_id: p.user_id,
          name: u?.full_name || u?.email || 'Teacher',
          email: u?.email ?? '',
          avatar: p.profile_image_url,
          assigned_hubs: assigned,
          market_access: Array.isArray(p.market_access) && p.market_access.length ? p.market_access : ['DZ'],
          per_class_rate: Number(p.per_class_rate ?? 0),
          owed_this_month: o?.amount ?? 0,
          owed_classes: o?.n ?? 0,
        };
      });

      setRows(merged);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const needle = q.toLowerCase().trim();
    if (!needle) return rows;
    return rows.filter((r) =>
      r.name.toLowerCase().includes(needle) || r.email.toLowerCase().includes(needle),
    );
  }, [rows, q]);

  const totalOwed = rows.reduce((s, r) => s + r.owed_this_month, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Teachers</h1>
        <p className="text-sm text-muted-foreground">
          Roster, permissions, compensation and monthly payroll for all approved teachers.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={<Users className="h-4 w-4" />} label="Active teachers" value={rows.length.toString()} />
        <StatCard icon={<Coins className="h-4 w-4" />} label="Total owed this month" value={`€${totalOwed.toFixed(2)}`} accent />
        <StatCard icon={<Globe2 className="h-4 w-4" />} label="Markets covered"
          value={`${rows.filter(r => r.market_access.includes('DZ')).length} DZ · ${rows.filter(r => r.market_access.includes('INTL')).length} INTL`} />
      </div>

      <Card className="p-4">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search name or email…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            No approved teachers yet.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Teacher</TableHead>
                <TableHead>Hubs</TableHead>
                <TableHead>Market</TableHead>
                <TableHead className="text-right">Rate / class</TableHead>
                <TableHead className="text-right">Owed this month</TableHead>
                <TableHead className="text-right">Promotion</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => {
                const isIntl = r.market_access.includes('INTL');
                const isDz = r.market_access.includes('DZ');
                const promoted = isIntl && isDz;
                return (
                <TableRow key={r.user_id} className="cursor-pointer" onClick={() => setSelected(r)}>
                  <TableCell>
                    <div className="font-semibold">{r.name}</div>
                    <div className="text-xs text-muted-foreground">{r.email}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {r.assigned_hubs.length === 0 && <Badge variant="outline" className="text-xs">Unassigned</Badge>}
                      {r.assigned_hubs.map((h) => (
                        <Badge key={h} variant="outline" className={`text-xs border ${HUB_BADGE[h] ?? ''}`}>
                          {HUB_LABEL[h] ?? h}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {r.market_access.map((m) => (
                        <Badge key={m} variant={m === 'INTL' ? 'default' : 'secondary'} className="text-xs">
                          {m === 'INTL' && promoted ? '🌟 INTL' : m}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">€{r.per_class_rate.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <div className="font-bold text-base tabular-nums">€{r.owed_this_month.toFixed(2)}</div>
                    <div className="text-[11px] text-muted-foreground">{r.owed_classes} classes</div>
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    {isDz && !isIntl ? (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={promoting === r.user_id}
                        onClick={() => setMarketAccess(r.user_id, ['DZ', 'INTL'])}
                      >
                        <Star className="h-3.5 w-3.5 mr-1 text-amber-500" />
                        Promote to INTL
                      </Button>
                    ) : promoted ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={promoting === r.user_id}
                        onClick={() => setMarketAccess(r.user_id, ['DZ'])}
                      >
                        <Undo2 className="h-3.5 w-3.5 mr-1" />
                        Demote to DZ only
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">INTL only</span>
                    )}
                  </TableCell>
                </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>


      <TeacherManagementDrawer
        teacher={selected}
        onClose={() => setSelected(null)}
        onSaved={() => { setSelected(null); load(); }}
      />
    </div>
  );
}

function StatCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent?: boolean }) {
  return (
    <Card className={`p-4 ${accent ? 'bg-primary/5 border-primary/30' : ''}`}>
      <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wide font-semibold">
        {icon}{label}
      </div>
      <div className="mt-2 text-2xl font-bold tabular-nums">{value}</div>
    </Card>
  );
}

function normalizeLegacyHub(role: string): string {
  if (role.includes('playground')) return 'playground';
  if (role.includes('success')) return 'success';
  return 'academy';
}

export default TeacherRoster;
