import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { internalAuthHeaders } from "../_shared/internalAuth.ts";

// Called every 10 minutes by pg_cron. Looks at the live-classroom crashes that
// src/lib/classroomCrashLog.ts writes to `system_errors`, and emails the admin
// when the same scene keeps crashing — so nobody has to run a query by hand.
//
// Safe to call without a secret: it takes no input, only reads recent errors,
// and `classroom_crash_alerts` de-duplicates so a repeat call is a no-op.

const WINDOW_MINUTES = 60; // look at crashes from the last hour
const MIN_CRASHES = 3; // a scene needs this many to count as a problem
const QUIET_HOURS = 6; // and we won't re-alert about it for this long

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// "ClassroomScenePlayer > Scene l1-model-h [sound-model] · student mirror · crash #1"
//   -> "Scene l1-model-h [sound-model]". Outer-boundary crashes share one key.
function sceneKey(componentName: string): string {
  const m = componentName.match(/^ClassroomScenePlayer > (Scene \S+ \[[^\]]+\])/);
  if (m) return m[1];
  if (componentName.startsWith("ClassroomScenePlayer > Lesson player (outer)")) return "Lesson player (outer)";
  return componentName.replace(/^ClassroomScenePlayer > /, "").slice(0, 120);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const since = new Date(Date.now() - WINDOW_MINUTES * 60_000).toISOString();
    const { data: rows, error } = await supabase
      .from("system_errors")
      .select("component_name, error_message, user_id, created_at, route")
      .like("component_name", "ClassroomScenePlayer >%")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(1000);
    if (error) throw error;

    const groups = new Map<string, { count: number; users: Set<string>; lastSeen: string; sample: string }>();
    for (const r of rows ?? []) {
      const key = sceneKey(r.component_name ?? "unknown");
      // Rows are newest-first, so the first one seen for a key is its latest crash.
      const g = groups.get(key) ?? { count: 0, users: new Set<string>(), lastSeen: r.created_at, sample: r.error_message };
      g.count += 1;
      if (r.user_id) g.users.add(r.user_id);
      groups.set(key, g);
    }

    const noisy = [...groups.entries()].filter(([, g]) => g.count >= MIN_CRASHES);
    if (noisy.length === 0) return json({ alerted: 0, checked: rows?.length ?? 0 });

    const quietSince = new Date(Date.now() - QUIET_HOURS * 3_600_000).toISOString();
    const { data: recent, error: recentErr } = await supabase
      .from("classroom_crash_alerts")
      .select("scene_key")
      .gte("alerted_at", quietSince);
    if (recentErr) throw recentErr;
    const already = new Set((recent ?? []).map((a) => a.scene_key));

    const fresh = noisy.filter(([key]) => !already.has(key));
    if (fresh.length === 0) return json({ alerted: 0, suppressed: noisy.length });

    const scenes = fresh
      .sort((a, b) => b[1].count - a[1].count)
      .map(([key, g]) => ({ key, count: g.count, users: g.users.size, lastSeen: g.lastSeen, sample: g.sample.slice(0, 200) }));

    const { error: mailErr } = await supabase.functions.invoke("send-transactional-email", {
      body: {
        templateName: "admin-classroom-crash",
        recipientEmail: "f.zahra.Djaanine@engleuphoria.com",
        idempotencyKey: `classroom-crash-${new Date().toISOString().slice(0, 13)}-${scenes.map((s) => s.key).join("|").slice(0, 80)}`,
        templateData: { scenes, windowMinutes: WINDOW_MINUTES },
      },
      headers: internalAuthHeaders(),
    });
    if (mailErr) {
      // supabase-js hides the real reason behind a generic message; read the response body.
      let detail = mailErr.message;
      try { detail = (await (mailErr as { context?: Response }).context?.text()) ?? detail; } catch { /* keep generic message */ }
      throw new Error(`email send failed: ${detail}`);
    }

    // Only mark as alerted once the email was accepted, so a failed send retries next run.
    const { error: markErr } = await supabase
      .from("classroom_crash_alerts")
      .insert(scenes.map((s) => ({ scene_key: s.key, crash_count: s.count })));
    if (markErr) console.error("classroom-crash-alert: could not record alert", markErr);

    return json({ alerted: scenes.length, scenes: scenes.map((s) => s.key) });
  } catch (e) {
    console.error("classroom-crash-alert failed:", e);
    return json({ error: e instanceof Error ? e.message : "Internal server error" }, 500);
  }
});
