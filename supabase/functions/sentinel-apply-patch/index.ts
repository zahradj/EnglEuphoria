// sentinel-apply-patch — Applies an admin-approved Sentinel-1 patch.
// Requires admin role. Defense-in-depth: re-checks allow-list and incident status.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const PATCHABLE_TABLES = new Set([
  "curriculum_lessons",
  "lesson_blocks",
  "slides",
  "curriculum_units",
  "homework_packs",
  "game_packs",
  "arcade_sessions",
]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const token = authHeader.replace("Bearer ", "");

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: claimsData, error: claimsErr } = await userClient.auth.getClaims(token);
    if (claimsErr || !claimsData?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub as string;

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Verify admin role
    const { data: roleRow } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) {
      return new Response(JSON.stringify({ error: "Admin only" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { incident_id, action } = await req.json();
    if (!incident_id || !["approve", "reject", "needs_human"].includes(action)) {
      return new Response(JSON.stringify({ error: "Invalid request" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: incident, error: fetchErr } = await admin
      .from("sentinel_incidents")
      .select("*")
      .eq("id", incident_id)
      .single();
    if (fetchErr || !incident) {
      return new Response(JSON.stringify({ error: "Incident not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "reject") {
      await admin
        .from("sentinel_incidents")
        .update({ status: "rejected", reviewed_by: userId, resolved_at: new Date().toISOString() })
        .eq("id", incident_id);
      return new Response(JSON.stringify({ status: "rejected" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "needs_human") {
      await admin
        .from("sentinel_incidents")
        .update({ status: "needs_human", reviewed_by: userId })
        .eq("id", incident_id);
      return new Response(JSON.stringify({ status: "needs_human" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // approve → apply patch
    if (incident.requires_human_intervention) {
      return new Response(JSON.stringify({ error: "Incident requires human intervention" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!incident.target_table || !PATCHABLE_TABLES.has(incident.target_table)) {
      return new Response(JSON.stringify({ error: "target_table not in allow-list" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!incident.target_row_id) {
      await admin
        .from("sentinel_incidents")
        .update({
          status: "needs_human",
          reviewed_by: userId,
          apply_error: "target_row_id missing",
        })
        .eq("id", incident_id);
      return new Response(
        JSON.stringify({ error: "target_row_id missing — flagged as needs_human" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const patch = incident.proposed_data_patch ?? {};
    if (typeof patch !== "object" || Array.isArray(patch)) {
      return new Response(JSON.stringify({ error: "Patch must be an object" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error: updateErr } = await admin
      .from(incident.target_table)
      .update(patch)
      .eq("id", incident.target_row_id);

    if (updateErr) {
      await admin
        .from("sentinel_incidents")
        .update({ status: "failed", reviewed_by: userId, apply_error: updateErr.message })
        .eq("id", incident_id);
      return new Response(JSON.stringify({ error: updateErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await admin
      .from("sentinel_incidents")
      .update({
        status: "applied",
        reviewed_by: userId,
        resolved_at: new Date().toISOString(),
      })
      .eq("id", incident_id);

    return new Response(JSON.stringify({ status: "applied" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("sentinel-apply-patch error", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
