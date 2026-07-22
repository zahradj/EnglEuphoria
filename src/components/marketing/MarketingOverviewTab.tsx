import { useMarketingMetrics } from '@/hooks/useMarketingMetrics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, Users, Target, Repeat, DollarSign, Sparkles, ArrowDown, RefreshCw, Activity, CircleDollarSign, CalendarCheck } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { cn } from '@/lib/utils';

const HUB_META = {
  playground: { label: 'Playground', accent: 'from-orange-500/20 to-amber-400/10 border-orange-500/30', chip: 'bg-orange-500/15 text-orange-700 dark:text-orange-300' },
  academy:    { label: 'Academy',    accent: 'from-purple-500/20 to-indigo-400/10 border-purple-500/30', chip: 'bg-purple-500/15 text-purple-700 dark:text-purple-300' },
  success:    { label: 'Success',    accent: 'from-emerald-500/20 to-teal-400/10 border-emerald-500/30', chip: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' },
} as const;

const KpiCard = ({
  title, value, hint, Icon,
}: { title: string; value: string | number; hint?: string; Icon: any }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-foreground">{value}</div>
      {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
    </CardContent>
  </Card>
);

const heatColor = (pct: number) => {
  if (pct >= 60) return 'bg-emerald-500/80 text-white';
  if (pct >= 40) return 'bg-emerald-500/50 text-emerald-950 dark:text-white';
  if (pct >= 20) return 'bg-amber-500/40 text-amber-950 dark:text-white';
  if (pct > 0) return 'bg-rose-500/25 text-rose-950 dark:text-rose-100';
  return 'bg-muted text-muted-foreground';
};

const relTime = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

export const MarketingOverviewTab = () => {
  const m = useMarketingMetrics();

  if (m.loading && m.funnel.length === 0) {
    return <p className="text-muted-foreground">Loading metrics…</p>;
  }
  if (m.error) {
    return <p className="text-destructive">Error: {m.error}</p>;
  }

  const funnelMax = Math.max(...m.funnel.map((f) => f.count), 1);

  return (
    <div className="space-y-6">
      {/* Range picker + refresh */}
      <div className="flex items-center justify-between">
        <div className="inline-flex rounded-lg border border-border bg-card p-1">
          {(['7d', '30d', '90d'] as const).map((r) => (
            <button
              key={r}
              onClick={() => m.setRange(r)}
              className={cn(
                'px-3 py-1 text-xs font-semibold rounded-md transition',
                m.range === r ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {r === '7d' ? 'Last 7 days' : r === '30d' ? 'Last 30 days' : 'Last 90 days'}
            </button>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={m.refetch} disabled={m.loading}>
          <RefreshCw className={cn('h-3.5 w-3.5 mr-2', m.loading && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {/* Top KPIs — snapshot */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard title="Signups (range)" value={m.funnel[0]?.count ?? 0} Icon={Users} hint={`${m.range} window`} />
        <KpiCard title="Activation rate" value={`${m.activationRate}%`} Icon={Target} hint="Onboarded ÷ signups (7d)" />
        <KpiCard title="Revenue (30d)" value={`$${(m.revenueCents30d / 100).toFixed(2)}`} Icon={DollarSign} />
        <KpiCard title="Active campaigns" value={m.activeCampaigns} Icon={Sparkles} />
      </div>

      {/* Funnel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" /> Acquisition funnel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {m.funnel.map((stage, i) => {
              const widthPct = Math.round((stage.count / funnelMax) * 100);
              return (
                <div key={stage.key}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium text-foreground">{stage.label}</span>
                    <span className="flex items-center gap-3">
                      <span className="font-mono font-bold">{stage.count.toLocaleString()}</span>
                      {stage.dropoff !== null && (
                        <span className={cn(
                          'inline-flex items-center gap-1 text-xs',
                          stage.dropoff > 50 ? 'text-destructive' : stage.dropoff > 25 ? 'text-amber-600' : 'text-muted-foreground'
                        )}>
                          <ArrowDown className="h-3 w-3" />
                          {stage.dropoff}% drop
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all"
                      style={{ width: `${Math.max(widthPct, 3)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Hub split */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Hub split</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {m.hubSplit.map((h) => {
            const meta = HUB_META[h.hub];
            return (
              <Card key={h.hub} className={cn('bg-gradient-to-br', meta.accent, 'border')}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{meta.label}</CardTitle>
                    <Badge className={cn('border-0', meta.chip)}>{h.signups} signups</Badge>
                  </div>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-xs text-muted-foreground">Bookings</div>
                    <div className="text-xl font-bold">{h.bookings}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Paid</div>
                    <div className="text-xl font-bold">{h.paid}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Revenue</div>
                    <div className="text-xl font-bold">${(h.revenueCents / 100).toFixed(0)}</div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Channels + Live activity — two-column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CircleDollarSign className="h-4 w-4 text-primary" /> Channel attribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {m.channels.length === 0 ? (
              <p className="text-sm text-muted-foreground">No attributed traffic in this window.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Channel</TableHead>
                    <TableHead className="text-right">Signups</TableHead>
                    <TableHead className="text-right">Bookings</TableHead>
                    <TableHead className="text-right">Paid</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {m.channels.map((c) => (
                    <TableRow key={c.channel}>
                      <TableCell className="font-medium">{c.channel}</TableCell>
                      <TableCell className="text-right font-mono">{c.signups}</TableCell>
                      <TableCell className="text-right font-mono">{c.bookings}</TableCell>
                      <TableCell className="text-right font-mono">{c.paid}</TableCell>
                      <TableCell className="text-right font-mono">${(c.revenueCents / 100).toFixed(0)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" /> Live activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {m.liveEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">Quiet in this window.</p>
            ) : (
              <ul className="space-y-2 max-h-72 overflow-auto pr-1">
                {m.liveEvents.map((e, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span
                      className={cn(
                        'mt-1 h-2 w-2 rounded-full shrink-0',
                        e.kind === 'signup' && 'bg-primary',
                        e.kind === 'booking' && 'bg-amber-500',
                        e.kind === 'paid' && 'bg-emerald-500',
                        e.kind === 'event' && 'bg-muted-foreground',
                      )}
                    />
                    <div className="flex-1">
                      <div className="text-foreground">{e.label}</div>
                      <div className="text-xs text-muted-foreground">{relTime(e.at)}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cohort retention */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarCheck className="h-4 w-4 text-primary" /> Weekly cohort retention
          </CardTitle>
        </CardHeader>
        <CardContent>
          {m.cohorts.length === 0 ? (
            <p className="text-sm text-muted-foreground">Not enough cohort data yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground text-xs uppercase">
                    <th className="text-left py-2 pr-4">Cohort (week)</th>
                    <th className="text-right py-2 pr-4">Size</th>
                    <th className="text-center py-2 px-2">D1</th>
                    <th className="text-center py-2 px-2">D7</th>
                    <th className="text-center py-2 px-2">D14</th>
                    <th className="text-center py-2 px-2">D30</th>
                  </tr>
                </thead>
                <tbody>
                  {m.cohorts.map((c) => (
                    <tr key={c.cohort} className="border-t border-border">
                      <td className="py-2 pr-4 font-mono text-xs">{c.cohort}</td>
                      <td className="py-2 pr-4 text-right font-mono">{c.cohortSize}</td>
                      {(['d1', 'd7', 'd14', 'd30'] as const).map((k) => (
                        <td key={k} className="py-1 px-1">
                          <div className={cn('rounded-md py-1.5 text-center text-xs font-semibold', heatColor(c[k]))}>
                            {c[k]}%
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Signup trend */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /> Signups — last 30 days</CardTitle></CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={m.signupTrend}>
                <defs>
                  <linearGradient id="signupFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(d: string) => d.slice(5)} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Area type="monotone" dataKey="count" stroke="hsl(var(--primary))" fill="url(#signupFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Legacy KPI section — retention/revenue snapshot */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Retention & revenue snapshot</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <KpiCard title="Active streaks" value={m.activeStreaks} Icon={Repeat} hint="Streak ≥ 1" />
          <KpiCard title="Total students" value={m.signupsTotal.toLocaleString()} Icon={Users} />
          <KpiCard title="Paid conversions (30d)" value={m.paidConversions30d} Icon={DollarSign} />
          <KpiCard title="First lesson booked (7d)" value={m.firstLessonBooked7d} Icon={Sparkles} />
        </div>
      </div>
    </div>
  );
};
