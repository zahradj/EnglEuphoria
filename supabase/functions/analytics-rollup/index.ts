// analytics-rollup — nightly cohort aggregator (manually triggerable).
// Writes beta_insights rows. Admin-only consumers.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
import { createClient } from 'npm:@supabase/supabase-js@2';

function percentile(sorted: number[], p: number): number {
  if (!sorted.length) return 0;
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.floor(p * (sorted.length - 1))));
  return sorted[idx];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // 1. slide events → drop-off concentration per lesson
    const { data: events } = await supabase
      .from('lesson_slide_events')
      .select('lesson_id, slide_index, dwell_ms, event_type')
      .gte('created_at', since)
      .limit(10000);

    const lessonStats = new Map<
      string,
      { dwells: number[]; dropOffSlides: number[]; sample: number }
    >();
    for (const e of events ?? []) {
      if (!e.lesson_id) continue;
      const s = lessonStats.get(e.lesson_id) ?? { dwells: [], dropOffSlides: [], sample: 0 };
      s.dwells.push(e.dwell_ms ?? 0);
      if (e.event_type === 'abandon' || e.event_type === 'drop_off') {
        s.dropOffSlides.push(e.slide_index);
      }
      s.sample += 1;
      lessonStats.set(e.lesson_id, s);
    }

    const rows: Array<Record<string, unknown>> = [];
    for (const [lessonId, s] of lessonStats) {
      const sorted = [...s.dwells].sort((a, b) => a - b);
      rows.push({
        scope: { lesson_id: lessonId },
        metric: 'slide_dwell_ms',
        p50: percentile(sorted, 0.5),
        p90: percentile(sorted, 0.9),
        sample_size: s.sample,
        flag: s.dropOffSlides.length > s.sample * 0.4 ? 'critical' : null,
        details: {
          drop_off_slides: s.dropOffSlides.slice(0, 50),
        },
      });
    }

    // 2. learner signals → counts per type
    const { data: signals } = await supabase
      .from('learner_signals')
      .select('signal_type, severity, hub')
      .gte('created_at', since)
      .limit(10000);

    const sigByType = new Map<string, number[]>();
    for (const s of signals ?? []) {
      const arr = sigByType.get(s.signal_type) ?? [];
      arr.push(Number(s.severity) || 0);
      sigByType.set(s.signal_type, arr);
    }
    for (const [type, sevs] of sigByType) {
      const sorted = [...sevs].sort((a, b) => a - b);
      rows.push({
        scope: {},
        metric: `signal:${type}`,
        p50: percentile(sorted, 0.5),
        p90: percentile(sorted, 0.9),
        sample_size: sevs.length,
        flag: sevs.length > 50 ? 'watch' : null,
        details: {},
      });
    }

    // 3. vocab arc completions → per-hub p50/p90 accuracy + sample
    const since7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: arcEvents } = await (supabase as any)
      .from('analytics_events')
      .select('event_data, created_at')
      .eq('event_type', 'vocab_arc_complete')
      .gte('created_at', since7)
      .limit(10000);
    const arcByHub = new Map<string, number[]>();
    for (const e of arcEvents ?? []) {
      const hub = (e.event_data?.hub as string) ?? 'unknown';
      const acc = Number(e.event_data?.accuracy) || 0;
      const arr = arcByHub.get(hub) ?? [];
      arr.push(acc);
      arcByHub.set(hub, arr);
    }
    for (const [hub, accs] of arcByHub) {
      const sorted = [...accs].sort((a, b) => a - b);
      rows.push({
        scope: { hub },
        metric: 'vocab_arc_accuracy',
        p50: percentile(sorted, 0.5),
        p90: percentile(sorted, 0.9),
        sample_size: accs.length,
        flag: accs.length >= 20 && percentile(sorted, 0.5) < 0.6 ? 'watch' : null,
        details: { window_days: 7 },
      });
    }

    // 4. repair efficacy — vocab_gamification_inject spike detector
    try {
      const { data: repairs } = await (supabase as any)
        .from('analytics_events')
        .select('event_data, created_at')
        .eq('event_type', 'qa_repair_applied')
        .gte('created_at', since7)
        .limit(10000);
      let inject = 0;
      let total = 0;
      for (const r of repairs ?? []) {
        total++;
        if (r.event_data?.target === 'vocab_gamification_inject') inject++;
      }
      const rate = total ? inject / total : 0;
      rows.push({
        scope: {},
        metric: 'repair:vocab_gamification_inject_rate',
        p50: rate,
        p90: rate,
        sample_size: total,
        flag: rate > 0.2 && total >= 20 ? 'critical' : null,
        details: { inject, total, window_days: 7 },
      });
    } catch { /* optional */ }

    if (rows.length) {
      await supabase.from('beta_insights').insert(rows);
    }

    // 5. Alert on critical repair-rate spike (WoW comparison)
    try {
      const critical = rows.find(
        (r) => r.metric === 'repair:vocab_gamification_inject_rate' && r.flag === 'critical',
      );
      const webhook = Deno.env.get('REPAIR_ALERT_WEBHOOK');
      if (critical && webhook) {
        // fetch prior-week baseline
        const since14 = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
        const { data: prior } = await (supabase as any)
          .from('beta_insights')
          .select('p50, sample_size, created_at')
          .eq('metric', 'repair:vocab_gamification_inject_rate')
          .gte('created_at', since14)
          .lt('created_at', since7)
          .order('created_at', { ascending: false })
          .limit(1);
        const priorRate = prior?.[0]?.p50 ?? 0;
        const delta = (critical.p50 as number) - Number(priorRate);
        if (delta > 0.2 || priorRate === 0) {
          const payload = {
            text: `🚨 vocab_gamification_inject repair spike: ${(
              (critical.p50 as number) * 100
            ).toFixed(1)}% this week (prior ${(Number(priorRate) * 100).toFixed(1)}%, n=${critical.sample_size})`,
          };
          await fetch(webhook, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          }).catch(() => {});
        }
      }
    } catch { /* optional */ }


    return new Response(
      JSON.stringify({ ok: true, inserted: rows.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, error: String((err as Error).message ?? err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
