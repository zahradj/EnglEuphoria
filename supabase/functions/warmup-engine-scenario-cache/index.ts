// Nightly warmup for engine_scenario_cache.
// For each active hub/CEFR/engine combo used in the last 7 days, pre-generate
// the top 3 upcoming scenarios so first-hit latency drops to zero.

import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  // Pick the top 15 (hub, cefr, engine, topic) combos used recently.
  const { data: recent } = await supabase
    .from('engine_scenario_cache')
    .select('engine, hub, cefr, topic, hit_count, last_hit_at')
    .order('hit_count', { ascending: false })
    .limit(50);

  const seen = new Set<string>();
  const top: Array<{ engine: string; hub: string; cefr: string; topic: string }> = [];
  for (const r of recent ?? []) {
    const key = `${r.hub}:${r.cefr}:${r.engine}:${r.topic}`;
    if (seen.has(key)) continue;
    seen.add(key);
    top.push(r as any);
    if (top.length >= 15) break;
  }

  let warmed = 0;
  for (const combo of top) {
    try {
      await supabase.functions.invoke('generate-engine-scenario', {
        body: {
          hub: combo.hub,
          cefr: combo.cefr,
          engine: combo.engine,
          topic: combo.topic,
          warmup: true,
        },
      });
      warmed += 1;
    } catch { /* skip failures, next run will retry */ }
  }

  return new Response(JSON.stringify({ warmed }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
