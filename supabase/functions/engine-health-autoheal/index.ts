// Engine Health auto-heal — daily cron. For each (engine, hub) that has
// suffered ≥3 consecutive days of accuracy < 0.55 AND completion < 0.6,
// seed an eased difficulty tuning delta into analytics_tuning_log so
// engineSlotInjector picks it up. Never overrides CEFR/curriculum.
import { createClient } from "npm:@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ACC_FLOOR = 0.55;
const COMP_FLOOR = 0.6;
const CONSEC_DAYS = 3;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  const client = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const since = new Date(Date.now() - (CONSEC_DAYS + 1) * 86400_000).toISOString();
  const { data: runs, error } = await client
    .from("student_engine_runs")
    .select("engine, hub, accuracy, completed, created_at")
    .gte("created_at", since);
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: CORS });

  // Bucket by (engine, hub, YYYY-MM-DD)
  const daily = new Map<string, { acc: number[]; comp: number[] }>();
  for (const r of runs ?? []) {
    const day = String((r as any).created_at).slice(0, 10);
    const key = `${(r as any).engine}||${(r as any).hub}||${day}`;
    const b = daily.get(key) || { acc: [], comp: [] };
    b.acc.push(Number((r as any).accuracy) || 0);
    b.comp.push((r as any).completed ? 1 : 0);
    daily.set(key, b);
  }

  // Regroup per (engine, hub) with per-day averages, chronologically
  const perEngine = new Map<string, { day: string; acc: number; comp: number }[]>();
  for (const [key, b] of daily.entries()) {
    const [engine, hub, day] = key.split("||");
    const arr = perEngine.get(`${engine}||${hub}`) || [];
    const avg = (xs: number[]) => xs.reduce((s, n) => s + n, 0) / xs.length;
    arr.push({ day, acc: avg(b.acc), comp: avg(b.comp) });
    perEngine.set(`${engine}||${hub}`, arr);
  }

  const healed: string[] = [];
  for (const [key, days] of perEngine.entries()) {
    days.sort((a, b) => a.day.localeCompare(b.day));
    const tail = days.slice(-CONSEC_DAYS);
    if (tail.length < CONSEC_DAYS) continue;
    const breach = tail.every((d) => d.acc < ACC_FLOOR && d.comp < COMP_FLOOR);
    if (!breach) continue;
    const [engine, hub] = key.split("||");

    // Idempotency: skip if we already logged auto-heal today.
    const today = new Date().toISOString().slice(0, 10);
    const { data: dupe } = await client
      .from("analytics_tuning_log")
      .select("id")
      .eq("engine", engine)
      .eq("hub", hub)
      .eq("action", "auto_heal_ease")
      .gte("created_at", today)
      .maybeSingle();
    if (dupe) continue;

    await client.from("analytics_tuning_log").insert({
      engine,
      hub,
      action: "auto_heal_ease",
      delta: { difficulty: -1, note: `Eased after ${CONSEC_DAYS}d below floors` },
      reason: `acc<${ACC_FLOOR} & comp<${COMP_FLOOR} for ${CONSEC_DAYS} consecutive days`,
    });
    healed.push(`${engine}/${hub}`);
  }

  return new Response(JSON.stringify({ healed, checked: perEngine.size }), {
    headers: { ...CORS, "Content-Type": "application/json" },
  });
});
