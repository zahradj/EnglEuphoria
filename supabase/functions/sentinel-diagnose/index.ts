// sentinel-diagnose — Sentinel-1 Reliability Engineer Agent
// Receives a frontend crash payload, asks Gemini to draft a JSON data patch,
// and inserts a sentinel_incidents row for CTO review.
//
// Gatekeeper: Cycle 1 files (Onboarding, Auth, Placement Test) are NEVER patched.
// Runtime AI: Gemini direct (Lovable Gateway forbidden per project rule).

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

const CYCLE1_ROUTES = [
  "/onboarding",
  "/student-signup",
  "/teach-with-us",
  "/placement",
  "/auth",
  "/login",
  "/signup",
];

interface DiagnosticPayload {
  component_name?: string;
  route?: string;
  error_message?: string;
  error_stack?: string;
  current_state?: unknown;
  cycle1?: boolean;
}

const SYSTEM_PROMPT = `You are 'Sentinel-1', the Lead DevOps and Reliability Engineer for EnglEuphoria.

STRICT BOUNDARIES:
1. CYCLE 1 PROTECTION: Never propose fixes for Onboarding, Auth, or Placement Test. If origin is Cycle 1, set requires_human_intervention=true with cto_explanation="Revert to default state."
2. ALLOW-LIST: target_table MUST be one of: ${[...PATCHABLE_TABLES].join(", ")}. Any other table → requires_human_intervention=true.
3. NO HALLUCINATIONS: If you cannot pinpoint the exact cause from the logs, set requires_human_intervention=true and confidence_score below 50.
4. NO CODE: Only output a JSON data patch that will overwrite the corrupted state.

Analyze WHY current_state caused the error (missing field, wrong type, null hint, malformed array, etc.).

Output STRICT JSON only (no markdown, no prose):
{
  "confidence_score": 0-100,
  "root_cause_analysis": "Technical explanation",
  "cto_explanation": "One sentence for the human CTO",
  "target_table": "table_name_from_allowlist_or_empty",
  "proposed_data_patch": { /* corrected JSON state */ },
  "requires_human_intervention": boolean
}`;

async function callGemini(payload: DiagnosticPayload): Promise<Record<string, unknown> | null> {
  const apiKey = Deno.env.get("GEMINI_API_KEY") ?? Deno.env.get("GOOGLE_API_KEY");
  if (!apiKey) return null;

  const userPrompt = `system_diagnostic:
component_name: ${payload.component_name ?? "unknown"}
route: ${payload.route ?? "unknown"}
error_message: ${payload.error_message ?? ""}
error_stack: ${(payload.error_stack ?? "").slice(0, 2000)}
current_state: ${JSON.stringify(payload.current_state ?? {}, null, 2).slice(0, 4000)}`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.2 },
      }),
    },
  );

  if (!res.ok) {
    console.error("Gemini error", res.status, await res.text());
    return null;
  }
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse Gemini JSON", e, text.slice(0, 200));
    return null;
  }
}

function isCycle1(payload: DiagnosticPayload): boolean {
  if (payload.cycle1) return true;
  const r = (payload.route ?? "").toLowerCase();
  return CYCLE1_ROUTES.some((c) => r.startsWith(c));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const payload = (await req.json()) as DiagnosticPayload;
    if (!payload?.component_name || !payload?.error_message) {
      return new Response(JSON.stringify({ error: "component_name and error_message required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Resolve user (if signed in)
    let userId: string | null = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const anon = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader } } },
      );
      const { data } = await anon.auth.getUser(authHeader.replace("Bearer ", ""));
      userId = data?.user?.id ?? null;
    }

    const baseRow = {
      user_id: userId,
      component_name: payload.component_name,
      route: payload.route ?? null,
      error_message: payload.error_message,
      error_stack: payload.error_stack ?? null,
      current_state: payload.current_state ?? {},
    };

    // Gatekeeper: Cycle 1 → never diagnose
    if (isCycle1(payload)) {
      const { data, error } = await supabase
        .from("sentinel_incidents")
        .insert({
          ...baseRow,
          status: "needs_human",
          requires_human_intervention: true,
          confidence_score: 0,
          cto_explanation: "Cycle 1 origin — revert to default state.",
          root_cause_analysis: "Crash originated from Cycle 1 (Onboarding/Auth/Placement). Sentinel-1 is forbidden from proposing patches in this region.",
        })
        .select("id")
        .single();
      if (error) throw error;
      return new Response(JSON.stringify({ incident_id: data.id, status: "needs_human" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Ask Sentinel-1 (Gemini)
    const diagnosis = await callGemini(payload);

    let target_table: string | null = null;
    let proposed_data_patch: unknown = null;
    let confidence_score = 0;
    let root_cause_analysis = "Sentinel-1 could not reach Gemini or returned malformed output.";
    let cto_explanation = "Diagnosis unavailable — needs human review.";
    let requires_human_intervention = true;

    if (diagnosis) {
      const t = typeof diagnosis.target_table === "string" ? diagnosis.target_table : "";
      target_table = PATCHABLE_TABLES.has(t) ? t : null;
      proposed_data_patch = diagnosis.proposed_data_patch ?? null;
      confidence_score = Math.max(0, Math.min(100, Number(diagnosis.confidence_score) || 0));
      root_cause_analysis = String(diagnosis.root_cause_analysis ?? root_cause_analysis);
      cto_explanation = String(diagnosis.cto_explanation ?? cto_explanation);
      requires_human_intervention =
        Boolean(diagnosis.requires_human_intervention) || !target_table || confidence_score < 50;
    }

    const status = requires_human_intervention ? "needs_human" : "pending";

    const { data, error } = await supabase
      .from("sentinel_incidents")
      .insert({
        ...baseRow,
        target_table,
        proposed_data_patch,
        confidence_score,
        root_cause_analysis,
        cto_explanation,
        requires_human_intervention,
        status,
      })
      .select("id")
      .single();
    if (error) throw error;

    return new Response(JSON.stringify({ incident_id: data.id, status }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("sentinel-diagnose error", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
