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

interface EarningRow {
  id: string;
  booking_id: string | null;
  teacher_amount: number;
  platform_amount: number | null;
  status: string | null;
  earned_at: string;
  adjustment_note: string | null;
  adjusted_at: string | null;
}

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
  // This month's per-lesson earnings rows — each one editable (bonus,
  // deduction, correction) with a reason; "owed" is their sum.
  const [earnings, setEarnings] = useState<EarningRow[]>([]);
  const [drafts, setDrafts] = useState<Record<string, { amount: string; note: string }>>({});
  const [savingEarningId, setSavingEarningId] = useState<string | null>(null);

  useEffect(() => {
    if (!teacher) return;
    setHubs(teacher.assigned_hubs);
    setMarkets(teacher.market_access);
    setRate(String(teacher.per_class_rate ?? 0));
    void refreshPayroll(teacher.user_id);
  }, [teacher]);

  async function refreshPayroll(uid: string) {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const [{ data: owedRows }, { data: ledgerRows }, { data: earningRows }] = await Promise.all([
      supabase.rpc('get_teacher_monthly_owed', { p_teacher_user_id: uid }),
      // Only real payouts — end_lesson also writes a per-lesson
      // 'pending_clearance' row here, which isn't a payment.
      supabase.from('teacher_payouts_ledger').select('*').eq('teacher_user_id', uid).eq('status', 'paid').order('paid_at', { ascending: false }).limit(12),
      (supabase as any)
        .from('teacher_earnings')
        .select('id, booking_id, teacher_amount, platform_amount, status, earned_at, adjustment_note, adjusted_at')
        .eq('teacher_id', uid)
        .gte('earned_at', monthStart)
        .order('earned_at', { ascending: false }),
    ]);
    const row: any = Array.isArray(owedRows) ? owedRows[0] : owedRows;
    setOwed(row ? { amount: Number(row.amount), classes_count: Number(row.classes_count), period_start: row.period_start, period_end: row.period_end } : null);
    setLedger(ledgerRows ?? []);
    const rows = (earningRows ?? []) as EarningRow[];
    setEarnings(rows);
    setDrafts(Object.fromEntries(rows.map((r) => [r.id, { amount: String(Number(r.teacher_amount)), note: r.adjustment_note ?? '' }])));
  }

  async function saveEarning(row: EarningRow) {
    if (!teacher) return;
    const draft = drafts[row.id];
    const amount = Number(draft?.amount);
    if (!draft || draft.amount.trim() === '' || Number.isNaN(amount) || amount < 0) {
      toast.error('Enter a valid non-negative amount');
      return;
    }
    if (amount !== Number(row.teacher_amount) && !draft.note.trim()) {
      toast.error('Add a reason for the change (the teacher sees it)');
      return;
    }
    setSavingEarningId(row.id);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const platform = Number(row.platform_amount ?? 0);
      const { error } = await (supabase as any)
        .from('teacher_earnings')
        .update({
          teacher_amount: amount,
          amount,
          // valid_amounts check: teacher + platform = gross
          gross_amount: amount + platform,
          adjustment_note: draft.note.trim() || null,
          adjusted_by: auth?.user?.id ?? null,
          adjusted_at: new Date().toISOString(),
        })
        .eq('id', row.id);
      if (error) throw error;
      toast.success('Earning updated');
      await refreshPayroll(teacher.user_id);
    } catch (e: any) {
      toast.error(e?.message ?? 'Failed to update earning');
    } finally {
      setSavingEarningId(null);
    }
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
      // Settle the individual lesson earnings that made up this payout.
      const { error: settleErr } = await (supabase as any)
        .from('teacher_earnings')
        .update({ status: 'paid', paid_at: new Date().toISOString() })
        .eq('teacher_id', teacher.user_id)
        .neq('status', 'paid')
        .gte('earned_at', owed.period_start)
        .lt('earned_at', new Date(new Date(owed.period_end).getTime() + 86_400_000).toISOString());
      if (settleErr) console.error('[TeacherManagementDrawer] settle earnings failed', settleErr);
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
                {owed?.classes_count ?? 0} unpaid lesson{owed?.classes_count === 1 ? '' : 's'} this month
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
              <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground mb-1">This month's lessons</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Adjust any lesson's pay (bonus, deduction or correction). A reason is required and is shown to the teacher.
              </p>
              {earnings.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No paid lessons this month yet.</p>
              ) : (
                <ul className="space-y-2">
                  {earnings.map((row) => {
                    const draft = drafts[row.id] ?? { amount: String(row.teacher_amount), note: '' };
                    const isPaid = row.status === 'paid';
                    const dirty = Number(draft.amount) !== Number(row.teacher_amount) || draft.note !== (row.adjustment_note ?? '');
                    return (
                      <li key={row.id} className="rounded-lg border border-border p-3 text-sm space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-muted-foreground">
                            {new Date(row.earned_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                          </span>
                          <Badge variant={isPaid ? 'default' : 'secondary'} className="text-[10px]">
                            {isPaid ? 'Paid' : 'Unpaid'}{row.adjusted_at ? ' · adjusted' : ''}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <div className="relative w-28 shrink-0">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
                            <Input
                              type="number" step="0.01" min="0" disabled={isPaid}
                              value={draft.amount}
                              onChange={(e) => setDrafts((d) => ({ ...d, [row.id]: { ...draft, amount: e.target.value } }))}
                              className="pl-7"
                            />
                          </div>
                          <Input
                            placeholder="Reason (e.g. bonus, late start)" disabled={isPaid}
                            value={draft.note}
                            onChange={(e) => setDrafts((d) => ({ ...d, [row.id]: { ...draft, note: e.target.value } }))}
                          />
                          <Button size="sm" onClick={() => saveEarning(row)} disabled={isPaid || !dirty || savingEarningId === row.id}>
                            {savingEarningId === row.id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
                          </Button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
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
