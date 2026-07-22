// Nightly TTL sweep for the QA hallucination judge cache + telemetry retention.
// Evicts judge cache rows older than 30d and prunes qa_repair_telemetry /
// qa_sweep_audit rows older than 90d so dashboards stay snappy.
// Invoke manually:
//   supabase.functions.invoke("qa-judge-cache-sweep", { body: { triggered_by: "manual" } })
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TTL_DAYS = 30;
const TELEMETRY_RETENTION_DAYS = 90;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  let triggered_by = "cron";
  let actor_user_id: string | null = null;
  try {
    const body = await req.json().catch(() => ({}));
    if (body && typeof body.triggered_by === "string") triggered_by = body.triggered_by;
    if (body && typeof body.actor_user_id === "string") actor_user_id = body.actor_user_id;
  } catch {
    // empty body is fine
  }

  const cutoff = new Date(Date.now() - TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const telemetryCutoff = new Date(
    Date.now() - TELEMETRY_RETENTION_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();

  try {
    // Load per-judge TTL overrides (judge -> days).
    const { data: overrideRows, error: ovErr } = await supabase
      .from("qa_judge_ttl_overrides")
      .select("judge, ttl_days");
    if (ovErr) throw new Error(`qa_judge_ttl_overrides: ${ovErr.message}`);
    const overrides = new Map<string, number>(
      (overrideRows ?? []).map((r: { judge: string; ttl_days: number }) => [r.judge, r.ttl_days]),
    );

    let cache_evicted = 0;
    const per_judge: Record<string, number> = {};

    // Per-judge eviction for any judge with an override.
    for (const [judge, days] of overrides) {
      const judgeCutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
      const { data: rows, error } = await supabase
        .from("qa_judge_cache")
        .delete()
        .eq("judge_name", judge)
        .lt("created_at", judgeCutoff)
        .select("id");
      if (error) throw new Error(`qa_judge_cache[${judge}]: ${error.message}`);
      const n = rows?.length ?? 0;
      cache_evicted += n;
      per_judge[judge] = n;
    }

    // Default TTL eviction for everything else.
    let defaultQuery = supabase
      .from("qa_judge_cache")
      .delete()
      .lt("created_at", cutoff)
      .select("id");
    if (overrides.size > 0) {
      defaultQuery = defaultQuery.not(
        "judge_name",
        "in",
        `(${[...overrides.keys()].map((j) => `"${j.replace(/"/g, '""')}"`).join(",")})`,
      );
    }
    const { data: cacheRows, error: cacheErr } = await defaultQuery;
    if (cacheErr) throw new Error(`qa_judge_cache: ${cacheErr.message}`);
    cache_evicted += cacheRows?.length ?? 0;


    const { data: eventRows, error: eventErr } = await supabase
      .from("qa_judge_cache_events")
      .delete()
      .lt("created_at", cutoff)
      .select("id");
    if (eventErr) throw new Error(`qa_judge_cache_events: ${eventErr.message}`);

    const { data: telemetryRows, error: telemetryErr } = await supabase
      .from("qa_repair_telemetry")
      .delete()
      .lt("created_at", telemetryCutoff)
      .select("id");
    if (telemetryErr) throw new Error(`qa_repair_telemetry: ${telemetryErr.message}`);

    const { data: auditRows, error: auditErr } = await supabase
      .from("qa_sweep_audit")
      .delete()
      .lt("created_at", telemetryCutoff)
      .select("id");
    if (auditErr) throw new Error(`qa_sweep_audit: ${auditErr.message}`);

    const events_evicted = eventRows?.length ?? 0;
    const telemetry_evicted = telemetryRows?.length ?? 0;
    const audit_evicted = auditRows?.length ?? 0;

    await supabase.from("qa_sweep_audit").insert({
      triggered_by,
      actor_user_id,
      cache_evicted,
      events_evicted,
      ttl_days: TTL_DAYS,
      cutoff,
      error: telemetry_evicted || audit_evicted
        ? `retention: telemetry=${telemetry_evicted} audit=${audit_evicted}`
        : null,
    });

    return new Response(
      JSON.stringify({
        ok: true,
        ttl_days: TTL_DAYS,
        cutoff,
        cache_evicted,
        cache_evicted_per_judge: per_judge,
        ttl_overrides: Object.fromEntries(overrides),
        events_evicted,
        telemetry_retention_days: TELEMETRY_RETENTION_DAYS,
        telemetry_cutoff: telemetryCutoff,
        telemetry_evicted,
        audit_evicted,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    await supabase.from("qa_sweep_audit").insert({
      triggered_by,
      actor_user_id,
      ttl_days: TTL_DAYS,
      cutoff,
      error,
    });
    return new Response(
      JSON.stringify({ error }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
