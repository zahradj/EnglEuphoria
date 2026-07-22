// Weekly per-teacher KPI digest. Reads teacher_performance_metrics +
// teacher_kpi_snapshots (last 30d for trend delta) and emails each teacher
// their overall KPI, tier, trend, and top focus area.
// Idempotent per teacher per ISO week.
import { createClient } from "npm:@supabase/supabase-js@2";
import { internalAuthHeaders } from "../_shared/internalAuth.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function tierLabel(score: number) {
  if (score >= 95) return "Elite";
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Strong";
  if (score >= 55) return "On Track";
  return "At Risk";
}

const TIPS: Record<string, { area: string; tip: string }> = {
  attendance_rate: { area: "Attendance", tip: "Confirm bookings 24h ahead; avoid last-minute cancellations." },
  lesson_quality_score: { area: "Lesson Quality", tip: "Request feedback at lesson end — higher ratings lift this fastest." },
  student_progress_impact: { area: "Student Progress", tip: "Assign homework and follow up on speech attempts." },
  response_time_score: { area: "Response Time", tip: "Reply to student messages within 12 hours." },
  feedback_completion_rate: { area: "Feedback Completion", tip: "Leave 2+ sentences of written feedback after every lesson." },
  curriculum_coverage: { area: "Curriculum Coverage", tip: "Complete each unit's 6-lesson arc; avoid skipping mastery quizzes." },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  const client = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: metrics } = await client
    .from("teacher_performance_metrics")
    .select("teacher_id, overall_kpi_score, attendance_rate, lesson_quality_score, student_progress_impact, response_time_score, feedback_completion_rate, curriculum_coverage");

  const rows = metrics ?? [];
  if (rows.length === 0) {
    return new Response(JSON.stringify({ sent: 0, reason: "no_metrics" }),
      { headers: { ...CORS, "Content-Type": "application/json" } });
  }

  const teacherIds = rows.map((r: any) => r.teacher_id);
  const { data: users } = await client
    .from("users")
    .select("id, first_name, email")
    .in("id", teacherIds);
  const userById = new Map((users ?? []).map((u: any) => [u.id, u]));

  const since = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);
  const { data: snaps } = await client
    .from("teacher_kpi_snapshots")
    .select("teacher_id, snapshot_date, overall_kpi_score")
    .gte("snapshot_date", since)
    .in("teacher_id", teacherIds);
  const snapsById = new Map<string, { d: string; v: number }[]>();
  (snaps ?? []).forEach((s: any) => {
    const arr = snapsById.get(s.teacher_id) ?? [];
    arr.push({ d: s.snapshot_date, v: Number(s.overall_kpi_score) });
    snapsById.set(s.teacher_id, arr);
  });

  const weekKey = new Date().toISOString().slice(0, 10);
  const weekLabel = new Date().toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });
  const dashboardUrl = "https://engleuphoria.com/teacher/kpi";

  let sent = 0;
  const errors: string[] = [];

  const SUBS = [
    "attendance_rate", "lesson_quality_score", "student_progress_impact",
    "response_time_score", "feedback_completion_rate", "curriculum_coverage",
  ] as const;

  for (const r of rows) {
    const u: any = userById.get(r.teacher_id);
    const email = u?.email;
    if (!email) continue;

    const overall = Number(r.overall_kpi_score) || 0;
    const arr = (snapsById.get(r.teacher_id) ?? []).sort((a, b) => a.d.localeCompare(b.d));
    const trendDelta = arr.length > 1 ? arr[arr.length - 1].v - arr[0].v : 0;

    const lowest = SUBS
      .map((k) => ({ k, v: Number((r as any)[k]) || 0 }))
      .sort((a, b) => a.v - b.v)[0];
    const tip = TIPS[lowest.k];

    const { error } = await client.functions.invoke("send-transactional-email", {
      body: {
        templateName: "teacher-kpi-weekly-digest",
        recipientEmail: email,
        idempotencyKey: `kpi-digest-${r.teacher_id}-${weekKey}`,
        templateData: {
          teacherName: u?.first_name ?? undefined,
          weekLabel,
          overallKpi: overall,
          tierLabel: tierLabel(overall),
          trendDelta,
          weakestArea: tip?.area,
          weakestTip: tip?.tip,
          dashboardUrl,
        },
      },
      headers: internalAuthHeaders(),
    });
    if (error) errors.push(`${email}: ${error.message ?? String(error)}`);
    else sent++;
  }

  return new Response(JSON.stringify({ sent, total: rows.length, errors }),
    { headers: { ...CORS, "Content-Type": "application/json" } });
});
