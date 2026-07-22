// Weekly at-risk teachers digest → all admins.
// Reads teacher_kpi_alerts (unresolved) joined with teacher_profiles, then
// enqueues one admin-at-risk-teachers email per admin. Idempotent per week
// via idempotencyKey `atrisk-<admin_email>-<isoWeek>`.
import { createClient } from "npm:@supabase/supabase-js@2";
import { internalAuthHeaders } from "../_shared/internalAuth.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function isoWeekKey(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  const client = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // 1. Pull unresolved at-risk alerts
  const { data: alerts, error: alertErr } = await client
    .from("teacher_kpi_alerts")
    .select("teacher_id, overall_score, consecutive_weeks, weakest_sub_score, resolved_at")
    .is("resolved_at", null);

  if (alertErr) {
    return new Response(JSON.stringify({ error: alertErr.message }), {
      status: 500,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  const teacherIds = Array.from(new Set((alerts ?? []).map((a: any) => a.teacher_id)));

  let teachersPayload: any[] = [];
  if (teacherIds.length > 0) {
    const { data: profiles } = await client
      .from("teacher_profiles")
      .select("user_id, display_name, email")
      .in("user_id", teacherIds);

    const byId = new Map((profiles ?? []).map((p: any) => [p.user_id, p]));
    teachersPayload = (alerts ?? []).map((a: any) => {
      const p = byId.get(a.teacher_id) as any;
      return {
        name: p?.display_name || "Unknown",
        email: p?.email || undefined,
        teacherId: a.teacher_id,
        overallScore: Math.round(Number(a.overall_score) || 0),
        consecutiveWeeks: Number(a.consecutive_weeks) || 1,
        weakestSubScore: a.weakest_sub_score || undefined,
      };
    }).sort((x, y) => x.overallScore - y.overallScore);
  }

  // 2. Find all admin recipients
  const { data: adminRoles } = await client
    .from("user_roles")
    .select("user_id")
    .eq("role", "admin");

  const adminIds = (adminRoles ?? []).map((r: any) => r.user_id);
  if (adminIds.length === 0) {
    return new Response(JSON.stringify({ sent: 0, reason: "no_admins" }), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  const { data: adminUsers } = await client
    .from("users")
    .select("id, email")
    .in("id", adminIds);

  const adminEmails = (adminUsers ?? [])
    .map((u: any) => u.email)
    .filter((e: any): e is string => typeof e === "string" && e.includes("@"));

  if (adminEmails.length === 0) {
    return new Response(JSON.stringify({ sent: 0, reason: "no_admin_emails" }), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  const weekKey = isoWeekKey();
  const weekLabel = new Date().toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });
  const dashboardUrl = "https://engleuphoria.com/admin/teacher-kpi";

  let sent = 0;
  const errors: string[] = [];

  for (const email of adminEmails) {
    const { error } = await client.functions.invoke("send-transactional-email", {
      body: {
        templateName: "admin-at-risk-teachers",
        recipientEmail: email,
        idempotencyKey: `atrisk-${email}-${weekKey}`,
        templateData: {
          weekLabel,
          teachers: teachersPayload,
          dashboardUrl,
        },
      },
      headers: internalAuthHeaders(),
    });
    if (error) errors.push(`${email}: ${error.message ?? String(error)}`);
    else sent++;
  }

  // Optional Slack/Discord mirror. Both accept a JSON body with `text`
  // (Slack) or `content` (Discord); we send both keys so a single payload
  // works on either provider.
  const webhookUrl = Deno.env.get("STAFF_WEBHOOK_URL");
  let webhookStatus: number | "skipped" | "error" = "skipped";
  if (webhookUrl && teachersPayload.length > 0) {
    const lines = teachersPayload.slice(0, 10).map((t) =>
      `• *${t.name}* — KPI ${t.overallScore} · ${t.consecutiveWeeks}w${
        t.weakestSubScore ? ` · weak: ${t.weakestSubScore}` : ""
      } — <${dashboardUrl}?teacher=${encodeURIComponent(t.teacherId)}|open>`
    ).join("\n");
    const extra = teachersPayload.length > 10 ? `\n…and ${teachersPayload.length - 10} more` : "";
    const summary =
      `⚠️ *At-risk teachers digest — ${weekLabel}*\n` +
      `${teachersPayload.length} teacher(s) flagged (KPI < 55 for ≥ 2 weeks).\n\n${lines}${extra}\n\n` +
      `Dashboard: ${dashboardUrl}`;
    try {
      const resp = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: summary, content: summary }),
      });
      webhookStatus = resp.status;
    } catch (e) {
      webhookStatus = "error";
      errors.push(`webhook: ${(e as Error).message}`);
    }
  }

  return new Response(
    JSON.stringify({
      sent,
      admins: adminEmails.length,
      at_risk: teachersPayload.length,
      webhook: webhookStatus,
      errors,
    }),
    { headers: { ...CORS, "Content-Type": "application/json" } },
  );
});
