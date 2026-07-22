/**
 * TeacherManagementDrawer — slide-out panel for an individual teacher.
 * Three tabs: Permissions & Hubs · Compensation · Payroll & Ledger.
 */
import { useEffect, useState } from 'react';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, Coins, Layers, Receipt } from 'lucide-react';
import type { RosterTeacher } from './TeacherRoster';

interface Props {
  teacher: RosterTeacher | null;
  onClose: () => void;
  onSaved: () => void;
}

const HUBS = [
  { key: 'playground', label: 'Playground (Kids)' },
  { key: 'academy', label: 'Academy (Teens)' },
  { key: 'success', label: 'Success (Pro)' },
] as const;

const MARKETS = [
  { key: 'DZ', label: 'Local DZ' },
  { key: 'INTL', label: 'International' },
] as const;

export function TeacherManagementDrawer({ teacher, onClose, onSaved }: Props) {
  const [hubs, setHubs] = useState<string[]>([]);
  const [markets, setMarkets] = useState<string[]>([]);
  const [rate, setRate] = useState('0');
  const [savingPerm, setSavingPerm] = useState(false);
  const [savingComp, setSavingComp] = useState(false);
  const [marking, setMarking] = useState(false);
  const [ledger, setLedger] = useState<any[]>([]);
  const [owed, setOwed] = useState<{ amount: number; classes_count: number; period_start: string; period_end: string } | null>(null);

  useEffect(() => {
    if (!teacher) return;
    setHubs(teacher.assigned_hubs);
    setMarkets(teacher.market_access);
    setRate(String(teacher.per_class_rate ?? 0));
    void refreshPayroll(teacher.user_id);
  }, [teacher]);

  async function refreshPayroll(uid: string) {
    const [{ data: owedRows }, { data: ledgerRows }] = await Promise.all([
      supabase.rpc('get_teacher_monthly_owed', { p_teacher_user_id: uid }),
      supabase.from('teacher_payouts_ledger').select('*').eq('teacher_user_id', uid).order('paid_at', { ascending: false }).limit(12),
    ]);
    const row: any = Array.isArray(owedRows) ? owedRows[0] : owedRows;
    setOwed(row ? { amount: Number(row.amount), classes_count: Number(row.classes_count), period_start: row.period_start, period_end: row.period_end } : null);
    setLedger(ledgerRows ?? []);
  }

  function toggleHub(hub: string, on: boolean) {
    setHubs((prev) => on ? Array.from(new Set([...prev, hub])) : prev.filter((h) => h !== hub));
  }
  function toggleMarket(m: string, on: boolean) {
    setMarkets((prev) => on ? Array.from(new Set([...prev, m])) : prev.filter((x) => x !== m));
  }

  function deriveHubRole(selected: string[]): string | null {
    const has = (k: string) => selected.includes(k);
    if (has('academy') && has('success')) return 'academy_success_mentor';
    if (has('academy')) return 'academy_mentor';
    if (has('success')) return 'success_mentor';
    if (has('playground')) return 'playground_specialist';
    return null;
  }

  async function savePermissions() {
    if (!teacher) return;
    setSavingPerm(true);
    try {
      const hub_role = deriveHubRole(hubs);
      const { error } = await supabase
        .from('teacher_profiles')
        .update({ assigned_hubs: hubs, market_access: markets, hub_role })
        .eq('user_id', teacher.user_id);
      if (error) throw error;
      toast.success('Permissions saved');
      onSaved();
    } catch (e: any) {
      toast.error(e?.message ?? 'Failed to save permissions');
    } finally {
      setSavingPerm(false);
    }
  }

  async function saveCompensation() {
    if (!teacher) return;
    const numeric = Number(rate);
    if (Number.isNaN(numeric) || numeric < 0) {
      toast.error('Enter a valid non-negative rate');
      return;
    }
    setSavingComp(true);
    try {
      const { error } = await supabase
        .from('teacher_profiles')
        .update({ per_class_rate: numeric })
        .eq('user_id', teacher.user_id);
      if (error) throw error;
      toast.success('Pay rate updated');
      await refreshPayroll(teacher.user_id);
      onSaved();
    } catch (e: any) {
      toast.error(e?.message ?? 'Failed to update rate');
    } finally {
      setSavingComp(false);
    }
  }

  async function markAsPaid() {
    if (!teacher || !owed) return;
    setMarking(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const { error } = await supabase.from('teacher_payouts_ledger').insert({
        teacher_user_id: teacher.user_id,
        period_start: owed.period_start,
        period_end: owed.period_end,
        classes_count: owed.classes_count,
        rate_applied: teacher.per_class_rate,
        amount: owed.amount,
        currency: 'EUR',
        status: 'paid',
        paid_by: auth?.user?.id ?? null,
      });
      if (error) throw error;
      toast.success(`Marked €${owed.amount.toFixed(2)} as paid`);
      await refreshPayroll(teacher.user_id);
    } catch (e: any) {
      toast.error(e?.message ?? 'Failed to record payout');
    } finally {
      setMarking(false);
    }
  }

  if (!teacher) return null;

  return (
    <Sheet open={!!teacher} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-xl">{teacher.name}</SheetTitle>
          <SheetDescription>{teacher.email}</SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="permissions" className="mt-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="permissions" className="gap-1.5"><Layers className="h-3.5 w-3.5" />Permissions</TabsTrigger>
            <TabsTrigger value="compensation" className="gap-1.5"><Coins className="h-3.5 w-3.5" />Compensation</TabsTrigger>
            <TabsTrigger value="payroll" className="gap-1.5"><Receipt className="h-3.5 w-3.5" />Payroll</TabsTrigger>
          </TabsList>

          {/* TAB 1 */}
          <TabsContent value="permissions" className="space-y-6 mt-6">
            <section>
              <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground mb-3">Hubs</h3>
              <div className="space-y-3">
                {HUBS.map((h) => (
                  <div key={h.key} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <Label htmlFor={`hub-${h.key}`} className="font-medium cursor-pointer">{h.label}</Label>
                    <Switch id={`hub-${h.key}`} checked={hubs.includes(h.key)} onCheckedChange={(v) => toggleHub(h.key, v)} />
                  </div>
                ))}
              </div>
            </section>

            <Separator />

            <section>
              <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground mb-3">Market access</h3>
              <div className="space-y-3">
                {MARKETS.map((m) => (
                  <div key={m.key} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <Label htmlFor={`mkt-${m.key}`} className="font-medium cursor-pointer">{m.label}</Label>
                    <Switch id={`mkt-${m.key}`} checked={markets.includes(m.key)} onCheckedChange={(v) => toggleMarket(m.key, v)} />
                  </div>
                ))}
              </div>
            </section>

            <Button onClick={savePermissions} disabled={savingPerm} className="w-full">
              {savingPerm ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Save permissions
            </Button>
          </TabsContent>

          {/* TAB 2 */}
          <TabsContent value="compensation" className="space-y-6 mt-6">
            <div>
              <Label htmlFor="rate" className="text-sm font-semibold">Per-class rate (EUR)</Label>
              <p className="text-xs text-muted-foreground mb-2">Amount paid per completed 30-min session.</p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
                  <Input id="rate" type="number" step="0.01" min="0" value={rate} onChange={(e) => setRate(e.target.value)} className="pl-7" />
                </div>
                <Button onClick={saveCompensation} disabled={savingComp}>
                  {savingComp ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
                </Button>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-1">
              <div className="text-xs uppercase font-semibold text-muted-foreground">Quick preview</div>
              <div className="text-sm">10 classes → <span className="font-bold tabular-nums">€{(Number(rate || '0') * 10).toFixed(2)}</span></div>
              <div className="text-sm">25 classes → <span className="font-bold tabular-nums">€{(Number(rate || '0') * 25).toFixed(2)}</span></div>
              <div className="text-sm">50 classes → <span className="font-bold tabular-nums">€{(Number(rate || '0') * 50).toFixed(2)}</span></div>
            </div>
          </TabsContent>

          {/* TAB 3 */}
          <TabsContent value="payroll" className="space-y-6 mt-6">
            <div className="rounded-xl border-2 border-primary/40 bg-primary/5 p-6 text-center">
              <div className="text-xs uppercase tracking-wide font-bold text-primary mb-2">Total owed this month</div>
              <div className="text-5xl font-extrabold tabular-nums">€{(owed?.amount ?? 0).toFixed(2)}</div>
              <div className="text-sm text-muted-foreground mt-2">
                {owed?.classes_count ?? 0} completed × €{teacher.per_class_rate.toFixed(2)}
              </div>
              <Button
                onClick={markAsPaid}
                disabled={marking || !owed || owed.amount <= 0}
                className="mt-4 w-full"
                size="lg"
              >
                {marking ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                Mark as Paid
              </Button>
            </div>

            <div>
              <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground mb-3">Ledger history</h3>
              {ledger.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No payouts recorded yet.</p>
              ) : (
                <ul className="space-y-2">
                  {ledger.map((row: any) => (
                    <li key={row.id} className="flex items-center justify-between rounded-lg border border-border p-3 text-sm">
                      <div>
                        <div className="font-semibold tabular-nums">€{Number(row.amount).toFixed(2)}</div>
                        <div className="text-xs text-muted-foreground">
                          {row.classes_count} classes · {new Date(row.period_start).toLocaleDateString()} → {new Date(row.period_end).toLocaleDateString()}
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-[10px]">
                        {new Date(row.paid_at).toLocaleDateString()}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
