// Weekly nudge to parents when their student completed new engine runs in the
// last 7 days. Enqueues a lightweight email with a deep-link to /parent/quest-log.
// Idempotent per (parent_email, week) via a natural key on email_send_log.
import { createClient } from "npm:@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  const client = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const since = new Date(Date.now() - 7 * 86400_000).toISOString();
  const weekKey = new Date().toISOString().slice(0, 10);

  const { data: runs } = await client
    .from("student_engine_runs")
    .select("user_id, engine, accuracy, created_at")
    .gte("created_at", since);

  const byStudent = new Map<string, { count: number; avg: number }>();
  for (const r of runs ?? []) {
    const uid = String((r as any).user_id);
    const prev = byStudent.get(uid) || { count: 0, avg: 0 };
    const acc = Number((r as any).accuracy) || 0;
    const nextCount = prev.count + 1;
    byStudent.set(uid, { count: nextCount, avg: (prev.avg * prev.count + acc) / nextCount });
  }
  if (byStudent.size === 0) {
    return new Response(JSON.stringify({ nudged: 0 }), { headers: { ...CORS, "Content-Type": "application/json" } });
  }

  const studentIds = Array.from(byStudent.keys());
  const { data: rels } = await client
    .from("student_parent_relationships")
    .select("student_id, parent_id")
    .in("student_id", studentIds);

  const parentIds = Array.from(new Set((rels ?? []).map((r: any) => r.parent_id)));
  if (parentIds.length === 0) {
    return new Response(JSON.stringify({ nudged: 0 }), { headers: { ...CORS, "Content-Type": "application/json" } });
  }

  const { data: parents } = await client
    .from("users")
    .select("id, email, full_name")
    .in("id", parentIds);

  // Filter out parents who disabled the weekly summary preference.
  const { data: prefs } = await client
    .from("parent_notification_preferences")
    .select("parent_id, weekly_summary")
    .in("parent_id", parentIds);
  const optedOut = new Set(
    (prefs ?? [])
      .filter((p: any) => p.weekly_summary === false)
      .map((p: any) => String(p.parent_id)),
  );

  const emailByParent = new Map<string, { email: string; name: string | null }>();
  for (const p of parents ?? []) {
    if (optedOut.has(String((p as any).id))) continue;
    emailByParent.set(String((p as any).id), { email: (p as any).email, name: (p as any).full_name ?? null });
  }

  let nudged = 0;
  for (const rel of rels ?? []) {
    const student = byStudent.get(String((rel as any).student_id));
    const parent = emailByParent.get(String((rel as any).parent_id));
    if (!student || !parent?.email) continue;

    const dedupeKey = `parent-quest-nudge:${parent.email}:${weekKey}`;
    const { data: existing } = await client
      .from("email_send_log")
      .select("id")
      .eq("dedupe_key", dedupeKey)
      .maybeSingle();
    if (existing) continue;

    const questLogUrl = `https://www.engleuphoria.com/parent/quest-log/${(rel as any).student_id}`;
    const pct = Math.round(student.avg * 100);
    // Issue (or reuse) an unsubscribe token for this parent's email.
    let token: string | null = null;
    {
      const { data: existingTok } = await client
        .from("email_unsubscribe_tokens")
        .select("token")
        .eq("email", parent.email)
        .maybeSingle();
      if (existingTok?.token) {
        token = existingTok.token as string;
      } else {
        const newTok = crypto.randomUUID();
        const { error: insErr } = await client
          .from("email_unsubscribe_tokens")
          .insert({ token: newTok, email: parent.email });
        if (!insErr) token = newTok;
      }
    }
    const prefsUrl = token
      ? `https://www.engleuphoria.com/parent/notifications?token=${token}`
      : `https://www.engleuphoria.com/parent/notifications`;
    const unsubUrl = token
      ? `https://www.engleuphoria.com/parent/notifications?token=${token}&unsubscribe=1`
      : prefsUrl;
    const subject = `New quests this week — ${student.count} adventures, ${pct}% accuracy`;
    const html = `<div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:auto;padding:24px;background:#F5F3FF;border-radius:16px">
      <h2 style="color:#6B21A8">New Language Engine quests this week</h2>
      <p>Your learner completed <b>${student.count}</b> immersive quests with an average of <b>${pct}%</b> accuracy.</p>
      <p style="margin:24px 0"><a href="${questLogUrl}" style="background:#6B21A8;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:700">Open Quest Log</a></p>
      <p style="color:#666;font-size:12px">Engleuphoria — where English feels like play.<br/>
        <a href="${prefsUrl}" style="color:#6B21A8">Manage email preferences</a> ·
        <a href="${unsubUrl}" style="color:#6B21A8">Unsubscribe</a>
      </p>
    </div>`;

    await client.from("email_queue_messages").insert({
      to_email: parent.email,
      subject,
      html,
      status: "pending",
      dedupe_key: dedupeKey,
    });
    await client.from("email_send_log").insert({ dedupe_key: dedupeKey, to_email: parent.email });
    nudged++;
  }

  return new Response(JSON.stringify({ nudged }), { headers: { ...CORS, "Content-Type": "application/json" } });
});
