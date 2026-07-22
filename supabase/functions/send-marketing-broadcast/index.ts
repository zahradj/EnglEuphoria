// Deno edge function: resolve audience & mark broadcast as sent.
// This does not integrate with an ESP yet — it counts recipients from the
// audience_filter and stamps sent_at. Wire to Resend/SES later.

import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type AudienceFilter = {
  hub?: "playground" | "academy" | "success" | "all";
  role?: "student" | "teacher" | "parent" | "all";
  min_lessons?: number;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { broadcast_id } = await req.json();
    if (!broadcast_id) {
      return new Response(JSON.stringify({ error: "broadcast_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: b, error: bErr } = await admin
      .from("marketing_broadcasts")
      .select("*")
      .eq("id", broadcast_id)
      .maybeSingle();
    if (bErr || !b) throw bErr ?? new Error("Broadcast not found");

    const f = (b.audience_filter ?? {}) as AudienceFilter;

    // Resolve audience count from users table. Hub filter maps to current_system.
    let q = admin.from("users").select("id", { count: "exact", head: true });
    if (f.role && f.role !== "all") q = q.eq("role", f.role);
    if (f.hub && f.hub !== "all") q = q.eq("current_system", f.hub);
    const { count } = await q;
    const recipients = count ?? 0;

    await admin
      .from("marketing_broadcasts")
      .update({
        status: "sent",
        sent_at: new Date().toISOString(),
        recipients_count: recipients,
      })
      .eq("id", broadcast_id);

    return new Response(
      JSON.stringify({ ok: true, recipients }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message ?? e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
