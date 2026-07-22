import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type MarketingRange = '7d' | '30d' | '90d';

export interface FunnelStage {
  key: string;
  label: string;
  count: number;
  dropoff: number | null; // % dropoff from previous stage
}

export interface HubKpis {
  hub: 'playground' | 'academy' | 'success';
  signups: number;
  bookings: number;
  paid: number;
  revenueCents: number;
}

export interface ChannelRow {
  channel: string; // referral_code or referrer host or 'direct'
  signups: number;
  bookings: number;
  paid: number;
  revenueCents: number;
}

export interface CohortCell {
  cohort: string; // ISO week start
  cohortSize: number;
  d1: number;
  d7: number;
  d14: number;
  d30: number;
}

export interface LiveEvent {
  at: string;
  kind: 'signup' | 'booking' | 'paid' | 'event';
  label: string;
}

export interface MarketingMetrics {
  range: MarketingRange;
  setRange: (r: MarketingRange) => void;

  // Legacy KPIs (kept for backwards compat with existing cards)
  signups7d: number;
  signups30d: number;
  signupsTotal: number;
  onboardingCompleted7d: number;
  firstLessonBooked7d: number;
  activationRate: number;
  activeStreaks: number;
  d7Retained: number;
  d30Retained: number;
  mrrCents: number;
  paidConversions30d: number;
  revenueCents30d: number;
  activeCampaigns: number;
  signupTrend: { date: string; count: number }[];

  // New — range-aware
  funnel: FunnelStage[];
  hubSplit: HubKpis[];
  channels: ChannelRow[];
  cohorts: CohortCell[];
  liveEvents: LiveEvent[];

  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const ISO = (d: Date) => d.toISOString();
const dayStr = (d: Date) => d.toISOString().slice(0, 10);

const rangeToDays = (r: MarketingRange): number =>
  r === '7d' ? 7 : r === '30d' ? 30 : 90;

const normalizeHub = (raw?: string | null): 'playground' | 'academy' | 'success' | null => {
  const v = String(raw ?? '').toLowerCase();
  if (!v) return null;
  if (v.includes('play') || v.includes('kid') || v.includes('child')) return 'playground';
  if (v.includes('academy') || v.includes('teen')) return 'academy';
  if (v.includes('success') || v.includes('professional') || v.includes('adult') || v === 'hub') return 'success';
  return null;
};

const hostOfReferrer = (ref: string | null | undefined): string => {
  if (!ref) return 'direct';
  try {
    const u = new URL(ref);
    return u.hostname.replace(/^www\./, '');
  } catch {
    return 'direct';
  }
};

// ISO week start (Monday)
const weekStart = (d: Date): string => {
  const x = new Date(d);
  const day = (x.getUTCDay() + 6) % 7;
  x.setUTCDate(x.getUTCDate() - day);
  return x.toISOString().slice(0, 10);
};

export const useMarketingMetrics = (): MarketingMetrics => {
  const [range, setRange] = useState<MarketingRange>('30d');

  const [state, setState] = useState<Omit<MarketingMetrics, 'refetch' | 'range' | 'setRange'>>({
    signups7d: 0,
    signups30d: 0,
    signupsTotal: 0,
    onboardingCompleted7d: 0,
    firstLessonBooked7d: 0,
    activationRate: 0,
    activeStreaks: 0,
    d7Retained: 0,
    d30Retained: 0,
    mrrCents: 0,
    paidConversions30d: 0,
    revenueCents30d: 0,
    activeCampaigns: 0,
    signupTrend: [],
    funnel: [],
    hubSplit: [],
    channels: [],
    cohorts: [],
    liveEvents: [],
    loading: true,
    error: null,
  });

  const load = useCallback(async () => {
    try {
      setState((s) => ({ ...s, loading: true, error: null }));
      const now = new Date();
      const days = rangeToDays(range);
      const dRange = new Date(now.getTime() - days * 86400000);
      const d7 = new Date(now.getTime() - 7 * 86400000);
      const d30 = new Date(now.getTime() - 30 * 86400000);
      const d90 = new Date(now.getTime() - 90 * 86400000);

      const [
        signups7d,
        signups30d,
        signupsTotal,
        onboarding7d,
        firstLesson7d,
        activeStreaks,
        revenueRows,
        activeCampaigns,
        signupTrendRows,
        // Range-scoped queries
        signupsInRange,
        onboardedInRange,
        bookingsInRange,
        paidInRange,
        analyticsInRange,
        cohortSignups,
        cohortBookings,
      ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true })
          .eq('role', 'student').gte('created_at', ISO(d7)),
        supabase.from('users').select('*', { count: 'exact', head: true })
          .eq('role', 'student').gte('created_at', ISO(d30)),
        supabase.from('users').select('*', { count: 'exact', head: true })
          .eq('role', 'student'),
        supabase.from('placement_results').select('*', { count: 'exact', head: true })
          .gte('created_at', ISO(d7)),
        supabase.from('class_bookings').select('*', { count: 'exact', head: true })
          .gte('created_at', ISO(d7)),
        supabase.from('student_learning_streaks').select('*', { count: 'exact', head: true })
          .gte('current_streak', 1),
        supabase.from('lesson_payments').select('amount, created_at, status, user_id')
          .gte('created_at', ISO(d30)).eq('status', 'paid'),
        supabase.from('marketing_campaigns').select('*', { count: 'exact', head: true })
          .eq('status', 'active'),
        supabase.from('users').select('created_at')
          .eq('role', 'student').gte('created_at', ISO(d30))
          .order('created_at', { ascending: true }).limit(1000),

        // Range-scoped signups with attribution fields
        supabase.from('users').select('id, created_at, referral_code, current_system')
          .eq('role', 'student').gte('created_at', ISO(dRange))
          .order('created_at', { ascending: false }).limit(1000),
        supabase.from('placement_results').select('user_id, created_at')
          .gte('created_at', ISO(dRange)).limit(1000),
        supabase.from('class_bookings').select('id, user_id, hub_type, created_at, scheduled_at')
          .gte('created_at', ISO(dRange)).order('created_at', { ascending: false }).limit(1000),
        supabase.from('lesson_payments').select('user_id, amount, created_at, status')
          .gte('created_at', ISO(dRange)).eq('status', 'paid').limit(1000),
        supabase.from('analytics_events').select('user_id, event_type, referrer, created_at')
          .gte('created_at', ISO(dRange)).order('created_at', { ascending: false }).limit(1000),

        // Cohort inputs: 90d signups + 90d bookings
        supabase.from('users').select('id, created_at')
          .eq('role', 'student').gte('created_at', ISO(d90)).limit(2000),
        supabase.from('class_bookings').select('user_id, created_at')
          .gte('created_at', ISO(d90)).limit(5000),
      ]);

      const revenueCents30d = (revenueRows.data ?? []).reduce(
        (sum: number, r: any) => sum + Math.round(parseFloat(r.amount ?? 0) * 100), 0,
      );
      const paidConversions30d = (revenueRows.data ?? []).length;

      // Trend
      const map = new Map<string, number>();
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 86400000);
        map.set(dayStr(d), 0);
      }
      for (const r of signupTrendRows.data ?? []) {
        const k = dayStr(new Date(r.created_at as string));
        map.set(k, (map.get(k) ?? 0) + 1);
      }
      const trend = Array.from(map.entries()).map(([date, count]) => ({ date, count }));

      const sUp7 = signups7d.count ?? 0;
      const act7 = onboarding7d.count ?? 0;
      const activationRate = sUp7 > 0 ? Math.round((act7 / sUp7) * 100) : 0;

      // ===== Funnel (range-scoped)
      const signupsList = signupsInRange.data ?? [];
      const onboardedUsers = new Set((onboardedInRange.data ?? []).map((r: any) => r.user_id));
      const bookedUsers = new Set((bookingsInRange.data ?? []).map((r: any) => r.user_id));
      const paidUsers = new Set((paidInRange.data ?? []).map((r: any) => r.user_id));
      const signupIds = new Set(signupsList.map((u: any) => u.id));

      const sT = signupsList.length;
      const oT = signupsList.filter((u: any) => onboardedUsers.has(u.id)).length;
      const bT = signupsList.filter((u: any) => bookedUsers.has(u.id)).length;
      const pT = signupsList.filter((u: any) => paidUsers.has(u.id)).length;
      const dropoff = (curr: number, prev: number) =>
        prev > 0 ? Math.round(((prev - curr) / prev) * 100) : null;

      const funnel: FunnelStage[] = [
        { key: 'signup', label: 'Signed up', count: sT, dropoff: null },
        { key: 'onboarded', label: 'Onboarded', count: oT, dropoff: dropoff(oT, sT) },
        { key: 'booked', label: 'First lesson booked', count: bT, dropoff: dropoff(bT, oT) },
        { key: 'paid', label: 'Paid', count: pT, dropoff: dropoff(pT, bT) },
      ];

      // ===== Hub split
      const bookings = bookingsInRange.data ?? [];
      const paidByUser = new Map<string, number>();
      for (const p of paidInRange.data ?? []) {
        const cents = Math.round(parseFloat(p.amount ?? 0) * 100);
        paidByUser.set(p.user_id, (paidByUser.get(p.user_id) ?? 0) + cents);
      }
      const hubs: Array<'playground' | 'academy' | 'success'> = ['playground', 'academy', 'success'];
      const hubSplit: HubKpis[] = hubs.map((h) => {
        const hubBookings = bookings.filter((b: any) => normalizeHub(b.hub_type) === h);
        const hubUsers = new Set(hubBookings.map((b: any) => b.user_id));
        const hubSignups = signupsList.filter((u: any) => normalizeHub(u.current_system) === h).length;
        let revenue = 0;
        let paid = 0;
        for (const uid of hubUsers) {
          const r = paidByUser.get(uid) ?? 0;
          if (r > 0) {
            revenue += r;
            paid += 1;
          }
        }
        return {
          hub: h,
          signups: hubSignups,
          bookings: hubBookings.length,
          paid,
          revenueCents: revenue,
        };
      });

      // ===== Channel attribution
      const analytics = analyticsInRange.data ?? [];
      const refByUser = new Map<string, string>();
      for (const e of analytics) {
        if (!e.user_id) continue;
        if (!refByUser.has(e.user_id)) refByUser.set(e.user_id, hostOfReferrer(e.referrer));
      }
      const channelBuckets = new Map<string, ChannelRow>();
      const addChannel = (c: string) => {
        if (!channelBuckets.has(c)) {
          channelBuckets.set(c, { channel: c, signups: 0, bookings: 0, paid: 0, revenueCents: 0 });
        }
        return channelBuckets.get(c)!;
      };
      for (const u of signupsList) {
        const c = u.referral_code || refByUser.get(u.id) || 'direct';
        const row = addChannel(c);
        row.signups += 1;
        if (bookedUsers.has(u.id)) row.bookings += 1;
        if (paidUsers.has(u.id)) {
          row.paid += 1;
          row.revenueCents += paidByUser.get(u.id) ?? 0;
        }
      }
      const channels = Array.from(channelBuckets.values())
        .sort((a, b) => b.signups - a.signups)
        .slice(0, 10);

      // ===== Cohort retention (weekly cohorts, up to 12 weeks)
      const cohortUsers = cohortSignups.data ?? [];
      const cohortMap = new Map<string, { size: number; users: Set<string>; firstActivityAt: Map<string, number> }>();
      for (const u of cohortUsers) {
        const w = weekStart(new Date(u.created_at));
        if (!cohortMap.has(w)) {
          cohortMap.set(w, { size: 0, users: new Set(), firstActivityAt: new Map() });
        }
        const c = cohortMap.get(w)!;
        c.size += 1;
        c.users.add(u.id);
        c.firstActivityAt.set(u.id, new Date(u.created_at).getTime());
      }
      const activityByUser = new Map<string, number[]>();
      for (const b of cohortBookings.data ?? []) {
        if (!b.user_id) continue;
        const t = new Date(b.created_at).getTime();
        if (!activityByUser.has(b.user_id)) activityByUser.set(b.user_id, []);
        activityByUser.get(b.user_id)!.push(t);
      }
      const cohorts: CohortCell[] = Array.from(cohortMap.entries())
        .sort((a, b) => (a[0] < b[0] ? 1 : -1))
        .slice(0, 12)
        .map(([cohort, data]) => {
          const buckets = { d1: 0, d7: 0, d14: 0, d30: 0 };
          for (const uid of data.users) {
            const acts = activityByUser.get(uid) ?? [];
            const signup = data.firstActivityAt.get(uid) ?? 0;
            for (const t of acts) {
              const diff = Math.floor((t - signup) / 86400000);
              if (diff >= 0 && diff <= 30) buckets.d30 += 1;
              if (diff >= 0 && diff <= 14) buckets.d14 += 1;
              if (diff >= 0 && diff <= 7) buckets.d7 += 1;
              if (diff >= 0 && diff <= 1) buckets.d1 += 1;
              break; // count each user at most once per bucket max
            }
          }
          const pct = (n: number) => (data.size > 0 ? Math.round((n / data.size) * 100) : 0);
          return {
            cohort,
            cohortSize: data.size,
            d1: pct(buckets.d1),
            d7: pct(buckets.d7),
            d14: pct(buckets.d14),
            d30: pct(buckets.d30),
          };
        });

      // ===== Live events
      const liveEvents: LiveEvent[] = [];
      for (const u of signupsList.slice(0, 20)) {
        liveEvents.push({ at: u.created_at, kind: 'signup', label: 'New student signed up' });
      }
      for (const b of bookings.slice(0, 20)) {
        liveEvents.push({
          at: b.created_at,
          kind: 'booking',
          label: `Booked a ${normalizeHub(b.hub_type) ?? 'lesson'} class`,
        });
      }
      for (const p of paidInRange.data ?? []) {
        liveEvents.push({
          at: p.created_at,
          kind: 'paid',
          label: `Paid $${parseFloat(p.amount ?? 0).toFixed(2)}`,
        });
      }
      liveEvents.sort((a, b) => (a.at < b.at ? 1 : -1));

      setState({
        signups7d: sUp7,
        signups30d: signups30d.count ?? 0,
        signupsTotal: signupsTotal.count ?? 0,
        onboardingCompleted7d: act7,
        firstLessonBooked7d: firstLesson7d.count ?? 0,
        activationRate,
        activeStreaks: activeStreaks.count ?? 0,
        d7Retained: 0,
        d30Retained: 0,
        mrrCents: Math.round(revenueCents30d),
        paidConversions30d,
        revenueCents30d,
        activeCampaigns: activeCampaigns.count ?? 0,
        signupTrend: trend,
        funnel,
        hubSplit,
        channels,
        cohorts,
        liveEvents: liveEvents.slice(0, 20),
        loading: false,
        error: null,
      });
    } catch (e: any) {
      console.error('useMarketingMetrics error', e);
      setState((s) => ({ ...s, loading: false, error: e.message ?? 'Failed to load metrics' }));
    }
  }, [range]);

  useEffect(() => { load(); }, [load]);

  return { ...state, range, setRange, refetch: load };
};
