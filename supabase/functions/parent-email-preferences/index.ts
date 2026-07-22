// One-click parent notification preference endpoint (token-based, unauthenticated).
// GET  ?token=... -> returns current preferences for the parent linked to the token's email.
// POST { token, weekly_summary?, quest_nudges?, unsubscribe_all? } -> updates & marks token used.
//
// Uses the existing email_unsubscribe_tokens table (token -> email) and
// parent_notification_preferences (keyed by parent_id).
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

function admin() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );
}

async function resolveParent(token: string) {
  const db = admin();
  const { data: tok } = await db
    .from("email_unsubscribe_tokens")
    .select("token, email, used_at")
    .eq("token", token)
    .maybeSingle();
  if (!tok) return { error: "invalid_token" as const };
  // Look up parent profile by email.
  const { data: profile } = await db
    .from("profiles")
    .select("id")
    .eq("email", tok.email)
    .maybeSingle();
  if (!profile) return { error: "no_profile" as const, token: tok };
  return { token: tok, parentId: profile.id as string };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token") || (req.method === "POST" ? (await req.clone().json().catch(() => ({}))).token : null);
    if (!token) return new Response(JSON.stringify({ error: "missing_token" }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });

    const resolved = await resolveParent(token);
    if ("error" in resolved && resolved.error === "invalid_token") {
      return new Response(JSON.stringify({ error: "invalid_token" }), { status: 404, headers: { ...cors, "Content-Type": "application/json" } });
    }
    const db = admin();

    if (req.method === "GET") {
      let prefs: any = null;
      if ("parentId" in resolved && resolved.parentId) {
        const { data } = await db
          .from("parent_notification_preferences")
          .select("weekly_summary, quest_nudges")
          .eq("parent_id", resolved.parentId)
          .maybeSingle();
        prefs = data;
      }
      return new Response(JSON.stringify({ email: resolved.token.email, prefs }), { headers: { ...cors, "Content-Type": "application/json" } });
    }

    // POST
    const body = await req.json().catch(() => ({}));
    if (!("parentId" in resolved) || !resolved.parentId) {
      // No parent profile; still record used_at so future emails stop after unsubscribe_all.
      await db.from("email_unsubscribe_tokens").update({ used_at: new Date().toISOString() }).eq("token", token);
      return new Response(JSON.stringify({ ok: true, note: "no_profile" }), { headers: { ...cors, "Content-Type": "application/json" } });
    }
    const patch: Record<string, unknown> = { parent_id: resolved.parentId, updated_at: new Date().toISOString() };
    if (body.unsubscribe_all === true) {
      patch.weekly_summary = false;
      patch.quest_nudges = false;
    } else {
      if (typeof body.weekly_summary === "boolean") patch.weekly_summary = body.weekly_summary;
      if (typeof body.quest_nudges === "boolean") patch.quest_nudges = body.quest_nudges;
    }
    await db.from("parent_notification_preferences").upsert(patch, { onConflict: "parent_id" });
    await db.from("email_unsubscribe_tokens").update({ used_at: new Date().toISOString() }).eq("token", token);
    return new Response(JSON.stringify({ ok: true }), { headers: { ...cors, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
