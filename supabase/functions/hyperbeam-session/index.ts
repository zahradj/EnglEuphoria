// Hyperbeam session minter. Creates a virtual cloud-browser room and
// returns the embed URL the frontend SDK should mount.
//
// Auth: requires a logged-in Supabase user (verified via JWT).
// Body: { startUrl?: string, ttl?: number }
// Response: { embedUrl: string, sessionId: string, adminToken: string }

import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateBody {
  startUrl?: string;
  ttl?: number; // seconds
}

const HYPERBEAM_API = "https://engine.hyperbeam.com/v0/vm";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const HB_KEY = Deno.env.get("HYPERBEAM_API_KEY");
    if (!HB_KEY) {
      return json({ error: "HYPERBEAM_API_KEY not configured" }, 500);
    }

    // Verify caller
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      return json({ error: "Unauthorized" }, 401);
    }

    let body: CreateBody = {};
    try {
      body = await req.json();
    } catch (_) {
      body = {};
    }

    const startUrl = typeof body.startUrl === "string" && body.startUrl.startsWith("http")
      ? body.startUrl
      : "https://www.gamestolearnenglish.com/";
    const ttl = typeof body.ttl === "number" ? Math.min(Math.max(body.ttl, 60), 60 * 60 * 4) : 60 * 60;

    const hbRes = await fetch(HYPERBEAM_API, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HB_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        start_url: startUrl,
        // Performance tuning — cut bandwidth ~50% and improve EU/Africa latency.
        region: "EU",
        width: 1024,
        height: 768,
        fps: 30,
        ublock: true,
        offline_timeout: ttl,
        control_disable_default: false,
      }),
    });

    if (!hbRes.ok) {
      const text = await hbRes.text();
      console.error("Hyperbeam API error:", hbRes.status, text);
      return json({ error: "hyperbeam_failed", status: hbRes.status, detail: text }, 502);
    }

    const data = await hbRes.json();
    return json({
      embedUrl: data.embed_url,
      sessionId: data.session_id,
      adminToken: data.admin_token,
    }, 200);
  } catch (err) {
    console.error("hyperbeam-session error:", err);
    return json({ error: String(err?.message ?? err) }, 500);
  }
});

function json(payload: unknown, status: number) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
