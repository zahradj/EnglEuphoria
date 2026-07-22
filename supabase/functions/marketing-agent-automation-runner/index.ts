// Marketing AI Agent — automation runner.
// Invoked manually ("Run now") or by pg_cron. Given { automationId }, it
// loads the automation, builds a preset prompt for its type, calls Gemini,
// stores the result in marketing_agent_automation_runs, and updates the
// automation's last_run_at / last_run_status.

import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { aiFetch } from "../_shared/aiFetch.ts";

const SYSTEM_PROMPT = `You are the Engleuphoria Marketing Strategist running a scheduled marketing job. Produce a clean, ready-to-paste markdown report. No preamble, no apologies, no "as an AI". Structure with headings and bullets. Keep it under 1500 words.`;

const PROMPT_BUILDERS: Record<string, (p: any) => string> = {
  weekly_seo_audit: (p) =>
    `Perform a weekly SEO audit for ${p.url ?? "https://engleuphoria.com"}. Cover: (1) 5 highest-priority technical issues, (2) 10 target keywords with intent + estimated difficulty, (3) 5 content briefs for the coming week (title, target keyword, outline), (4) 3 quick-win on-page fixes.`,
  daily_ad_creative_refresh: (p) =>
    `Generate 3 fresh ${p.platform ?? "Meta"} ad creatives for the ${p.hub ?? "Academy"} hub targeting ${p.audience ?? "adults aged 25-45 interested in learning English"}. For each variant give: hook headline, primary text (max 125 chars), description, CTA, targeting notes, and the hypothesis being tested. Rotate angle: pain, outcome, social proof.`,
  onboarding_email_drip: (p) =>
    `Design a 5-email onboarding drip for new ${p.hub ?? "Academy"} signups. For each email give: day offset, subject line (2 variants), preview text, full body, primary CTA, success metric.`,
  weekly_content_brief: (p) =>
    `Produce 5 content briefs for next week's blog + social. Topics: ${p.topics ?? "English learning tips, teacher stories, learner wins, CEFR progression, exam prep"}. For each: hook headline, target keyword, outline (H2s), CTA to Engleuphoria, distribution plan (blog + social platforms).`,
  monthly_pricing_review: (p) =>
    `Review Engleuphoria pricing for the ${p.hub ?? "Academy"} hub and recommend 3 experiments to test next month. Include hypothesis, expected impact, guardrails, and rollout plan.`,
  custom_prompt: (p) => p.prompt || "Give a concise weekly marketing update for the Engleuphoria team.",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const body = await req.json().catch(() => ({}));
  const automationId: string | undefined = body.automationId;
  if (!automationId) {
    return json({ error: "automationId required" }, 400);
  }

  const { data: automation, error: aErr } = await admin
    .from("marketing_agent_automations")
    .select("*")
    .eq("id", automationId)
    .maybeSingle();

  if (aErr || !automation) return json({ error: "automation not found" }, 404);
  if (!automation.enabled) return json({ error: "automation disabled" }, 400);

  const builder = PROMPT_BUILDERS[automation.automation_type] ?? PROMPT_BUILDERS.custom_prompt;
  const prompt = builder(automation.params ?? {});

  const { data: run } = await admin
    .from("marketing_agent_automation_runs")
    .insert({
      automation_id: automationId,
      status: "running",
      input: { prompt, params: automation.params },
    })
    .select()
    .single();

  try {
    const aiResp = await aiFetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY") ?? ""}`,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
      }),
    });

    const aiJson: any = await aiResp.json().catch(() => ({}));
    if (aiJson?.error) throw new Error(aiJson.message || "AI error");

    const output: string =
      aiJson?.choices?.[0]?.message?.content?.toString?.() ?? "";

    await admin
      .from("marketing_agent_automation_runs")
      .update({
        status: "completed",
        output: { text: output },
        finished_at: new Date().toISOString(),
      })
      .eq("id", run!.id);

    await admin
      .from("marketing_agent_automations")
      .update({ last_run_at: new Date().toISOString(), last_run_status: "completed" })
      .eq("id", automationId);

    return json({ ok: true, runId: run!.id, output });
  } catch (e) {
    const msg = (e as Error).message ?? "error";
    await admin
      .from("marketing_agent_automation_runs")
      .update({ status: "failed", error: msg, finished_at: new Date().toISOString() })
      .eq("id", run!.id);
    await admin
      .from("marketing_agent_automations")
      .update({ last_run_at: new Date().toISOString(), last_run_status: "failed" })
      .eq("id", automationId);
    return json({ error: msg }, 200);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
