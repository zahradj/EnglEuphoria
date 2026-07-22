import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Plus, Trash2, Tag, Copy, ChevronRight, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';

type Campaign = {
  id: string;
  name: string;
  campaign_type: string;
  channel: string | null;
  code: string | null;
  discount_pct: number | null;
  status: string;
  starts_at: string | null;
  ends_at: string | null;
  signups_count: number;
  conversions_count: number;
  revenue_cents: number;
  budget_cents: number;
  spend_cents: number;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  landing_url: string | null;
  target_hub: string | null;
};

const TYPES = ['referral', 'promo', 'paid_ad', 'organic', 'partnership'];
const STATUSES = ['draft', 'active', 'paused', 'ended'];
const CHANNELS = ['google', 'meta', 'tiktok', 'youtube', 'email', 'referral', 'organic', 'other'];
const HUBS = ['all', 'playground', 'academy', 'success'];

const emptyForm = {
  name: '',
  campaign_type: 'promo',
  channel: 'google',
  status: 'draft',
  code: '',
  discount_pct: '0',
  target_hub: 'all',
  landing_url: '',
  utm_source: '',
  utm_medium: '',
  utm_campaign: '',
  budget_cents: '0',
  starts_at: '',
  ends_at: '',
};

export const CampaignsTab = () => {
  const { user } = useAuth();
  const [rows, setRows] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('marketing_campaigns')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) toast.error(error.message);
    setRows((data as Campaign[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const trackedUrl = useMemo(() => {
    if (!form.landing_url) return '';
    try {
      const u = new URL(form.landing_url);
      if (form.utm_source) u.searchParams.set('utm_source', form.utm_source);
      if (form.utm_medium) u.searchParams.set('utm_medium', form.utm_medium);
      if (form.utm_campaign) u.searchParams.set('utm_campaign', form.utm_campaign);
      return u.toString();
    } catch { return ''; }
  }, [form.landing_url, form.utm_source, form.utm_medium, form.utm_campaign]);

  const create = async () => {
    if (!form.name) { toast.error('Name is required'); return; }
    const { error } = await supabase.from('marketing_campaigns').insert({
      name: form.name,
      campaign_type: form.campaign_type,
      channel: form.channel,
      code: form.code || null,
      discount_pct: Number(form.discount_pct) || 0,
      status: form.status,
      target_hub: form.target_hub,
      landing_url: form.landing_url || null,
      utm_source: form.utm_source || null,
      utm_medium: form.utm_medium || null,
      utm_campaign: form.utm_campaign || form.name.toLowerCase().replace(/\s+/g, '_'),
      budget_cents: Math.round((Number(form.budget_cents) || 0) * 100),
      starts_at: form.starts_at || null,
      ends_at: form.ends_at || null,
      created_by: user?.id,
    });
    if (error) { toast.error(error.message); return; }
    toast.success('Campaign created');
    setOpen(false);
    setStep(0);
    setForm(emptyForm);
    load();
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('marketing_campaigns').update({ status }).eq('id', id);
    if (error) toast.error(error.message); else { toast.success('Updated'); load(); }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this campaign?')) return;
    const { error } = await supabase.from('marketing_campaigns').delete().eq('id', id);
    if (error) toast.error(error.message); else { toast.success('Deleted'); load(); }
  };

  const totals = useMemo(() => {
    return rows.reduce((a, r) => ({
      spend: a.spend + (r.spend_cents || 0),
      revenue: a.revenue + (r.revenue_cents || 0),
      signups: a.signups + (r.signups_count || 0),
      conversions: a.conversions + (r.conversions_count || 0),
    }), { spend: 0, revenue: 0, signups: 0, conversions: 0 });
  }, [rows]);

  const money = (cents: number) => `$${(cents / 100).toFixed(0)}`;
  const cac = (r: Campaign) => r.conversions_count ? money(r.spend_cents / r.conversions_count) : '—';
  const roi = (r: Campaign) => {
    if (!r.spend_cents) return '—';
    const val = ((r.revenue_cents - r.spend_cents) / r.spend_cents) * 100;
    return `${val.toFixed(0)}%`;
  };

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total spend</p><p className="text-2xl font-semibold">{money(totals.spend)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Attributed revenue</p><p className="text-2xl font-semibold">{money(totals.revenue)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Signups</p><p className="text-2xl font-semibold">{totals.signups}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Paying conversions</p><p className="text-2xl font-semibold">{totals.conversions}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2"><Tag className="h-5 w-5" /> Campaigns &amp; Referrals</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Promo codes, paid ads, referrals — track spend, CAC and ROI in one place.</p>
          </div>
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setStep(0); }}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" /> New campaign</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle>Create campaign — step {step + 1} of 4</DialogTitle></DialogHeader>
              <Tabs value={String(step)} onValueChange={(v) => setStep(Number(v))}>
                <TabsList className="grid grid-cols-4">
                  <TabsTrigger value="0">Basics</TabsTrigger>
                  <TabsTrigger value="1">Audience</TabsTrigger>
                  <TabsTrigger value="2">Tracking</TabsTrigger>
                  <TabsTrigger value="3">Review</TabsTrigger>
                </TabsList>

                <TabsContent value="0" className="space-y-3 mt-4">
                  <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Summer promo 2026" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Type</Label>
                      <Select value={form.campaign_type} onValueChange={(v) => setForm({ ...form, campaign_type: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Channel</Label>
                      <Select value={form.channel} onValueChange={(v) => setForm({ ...form, channel: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{CHANNELS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Promo code</Label><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="SUMMER25" /></div>
                    <div><Label>Discount %</Label><Input type="number" value={form.discount_pct} onChange={(e) => setForm({ ...form, discount_pct: e.target.value })} /></div>
                  </div>
                </TabsContent>

                <TabsContent value="1" className="space-y-3 mt-4">
                  <div>
                    <Label>Target hub</Label>
                    <Select value={form.target_hub} onValueChange={(v) => setForm({ ...form, target_hub: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{HUBS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Starts</Label><Input type="datetime-local" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} /></div>
                    <div><Label>Ends</Label><Input type="datetime-local" value={form.ends_at} onChange={(e) => setForm({ ...form, ends_at: e.target.value })} /></div>
                  </div>
                  <div><Label>Budget (USD)</Label><Input type="number" value={form.budget_cents} onChange={(e) => setForm({ ...form, budget_cents: e.target.value })} placeholder="500" /></div>
                </TabsContent>

                <TabsContent value="2" className="space-y-3 mt-4">
                  <div><Label>Landing URL</Label><Input value={form.landing_url} onChange={(e) => setForm({ ...form, landing_url: e.target.value })} placeholder="https://engleuphoria.com/playground" /></div>
                  <div className="grid grid-cols-3 gap-3">
                    <div><Label>UTM source</Label><Input value={form.utm_source} onChange={(e) => setForm({ ...form, utm_source: e.target.value })} placeholder="google" /></div>
                    <div><Label>UTM medium</Label><Input value={form.utm_medium} onChange={(e) => setForm({ ...form, utm_medium: e.target.value })} placeholder="cpc" /></div>
                    <div><Label>UTM campaign</Label><Input value={form.utm_campaign} onChange={(e) => setForm({ ...form, utm_campaign: e.target.value })} placeholder="summer_promo" /></div>
                  </div>
                  {trackedUrl && (
                    <div className="rounded-md border bg-muted/40 p-3 text-xs font-mono break-all flex items-start gap-2">
                      <span className="flex-1">{trackedUrl}</span>
                      <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0" onClick={() => { navigator.clipboard.writeText(trackedUrl); toast.success('Copied'); }}><Copy className="h-3 w-3" /></Button>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="3" className="space-y-2 mt-4 text-sm">
                  <p><strong>{form.name || '(unnamed)'}</strong> — {form.campaign_type} via {form.channel}</p>
                  <p className="text-muted-foreground">Hub: {form.target_hub} · Code: {form.code || '—'} · Discount: {form.discount_pct}%</p>
                  <p className="text-muted-foreground">Budget: ${Number(form.budget_cents) || 0}</p>
                  <p className="text-muted-foreground">Tracking: {form.utm_source || '—'} / {form.utm_medium || '—'} / {form.utm_campaign || '—'}</p>
                </TabsContent>
              </Tabs>

              <DialogFooter className="flex justify-between sm:justify-between">
                <Button variant="outline" disabled={step === 0} onClick={() => setStep(s => s - 1)}><ChevronLeft className="h-4 w-4 mr-1" /> Back</Button>
                {step < 3
                  ? <Button onClick={() => setStep(s => s + 1)}>Next <ChevronRight className="h-4 w-4 ml-1" /></Button>
                  : <Button onClick={create}>Create campaign</Button>}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {loading ? <p className="text-muted-foreground">Loading…</p> : rows.length === 0 ? (
            <p className="text-muted-foreground text-sm">No campaigns yet. Create your first one.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Hub</TableHead>
                  <TableHead className="text-right">Signups</TableHead>
                  <TableHead className="text-right">Conv.</TableHead>
                  <TableHead className="text-right">Spend</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">CAC</TableHead>
                  <TableHead className="text-right">ROI</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">
                      <div>{r.name}</div>
                      {r.code && <div className="text-xs font-mono text-muted-foreground">{r.code}</div>}
                    </TableCell>
                    <TableCell><Badge variant="secondary">{r.channel ?? r.campaign_type}</Badge></TableCell>
                    <TableCell className="text-xs">{r.target_hub ?? '—'}</TableCell>
                    <TableCell className="text-right">{r.signups_count}</TableCell>
                    <TableCell className="text-right">{r.conversions_count}</TableCell>
                    <TableCell className="text-right">{money(r.spend_cents)}</TableCell>
                    <TableCell className="text-right">{money(r.revenue_cents)}</TableCell>
                    <TableCell className="text-right">{cac(r)}</TableCell>
                    <TableCell className="text-right">{roi(r)}</TableCell>
                    <TableCell>
                      <Select value={r.status} onValueChange={(v) => updateStatus(r.id, v)}>
                        <SelectTrigger className="w-28 h-8"><SelectValue /></SelectTrigger>
                        <SelectContent>{STATUSES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
