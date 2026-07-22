import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Keep in sync with src/gamification/xp/xpRules.ts
const XP_RULES: Record<string, number> = {
  phonics_listen: 10,
  vocab_quiz_pass: 25,
  speaking_submit: 50,
  speaking_bravery: 35,
  pronunciation_attempt: 15,
  pronunciation_improvement: 40,
  library_read: 30,
  class_attended: 100,
  mission_complete: 75,
  mastery_milestone: 60,
  review_streak: 20,
  lesson_complete: 80,
};

// Soft daily caps (best-effort, mirrors antiFarmingGuards.ts)
const DAILY_CAP: Record<string, number> = {
  phonics_listen: 20,
  vocab_quiz_pass: 30,
  speaking_submit: 15,
  speaking_bravery: 20,
  pronunciation_attempt: 30,
  library_read: 10,
  review_streak: 25,
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return json({ error: "unauthorized" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: auth } } }
    );
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) return json({ error: "unauthorized" }, 401);

    const { action, ref_id, is_remedial } = await req.json();
    const baseXp = XP_RULES[action];
    if (baseXp === undefined) return json({ error: "invalid_action" }, 400);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Cycle 3 "Grit" multiplier — server-authoritative, never trust the client beyond the boolean.
    const gritActive = is_remedial === true;
    const multiplier = gritActive ? 2 : 1;
    const multiplierReason = gritActive ? "grit" : null;

    // Anti-farming: enforce daily cap per action (cap applies to the doubled value).
    let xp = baseXp * multiplier;
    const cap = DAILY_CAP[action];
    if (cap !== undefined) {
      const today = new Date().toISOString().slice(0, 10);
      const { count } = await admin
        .from("xp_events")
        .select("id", { count: "exact", head: true })
        .eq("student_id", userId)
        .eq("action", action)
        .gte("created_at", `${today}T00:00:00Z`);
      if ((count ?? 0) >= cap) xp = 0;
    }

    // 1. Insert event (always records, even if xp=0, so pedagogy tracking persists)
    await admin.from("xp_events").insert({
      student_id: userId,
      action,
      xp,
      ref_id: ref_id ?? null,
      multiplier,
      multiplier_reason: multiplierReason,
    });


    // 2. Upsert total
    const { data: existing } = await admin
      .from("student_xp")
      .select("total_xp, current_level, xp_in_current_level")
      .eq("student_id", userId)
      .maybeSingle();

    const newTotal = (existing?.total_xp ?? 0) + xp;
    const newLevelXp = (existing?.xp_in_current_level ?? 0) + xp;
    const levelUp = newLevelXp >= 500;
    await admin.from("student_xp").upsert(
      {
        student_id: userId,
        total_xp: newTotal,
        current_level: levelUp ? (existing?.current_level ?? 1) + 1 : existing?.current_level ?? 1,
        xp_in_current_level: levelUp ? newLevelXp - 500 : newLevelXp,
        last_activity_date: new Date().toISOString().slice(0, 10),
      },
      { onConflict: "student_id" }
    );

    // 3. Tick streak
    const today = new Date().toISOString().slice(0, 10);
    const { data: streak } = await admin
      .from("student_learning_streaks")
      .select("current_streak, longest_streak, last_activity_date")
      .eq("student_id", userId)
      .eq("streak_type", "daily")
      .maybeSingle();

    let current = 1;
    if (streak?.last_activity_date) {
      const last = new Date(streak.last_activity_date);
      const diff = Math.floor((Date.now() - last.getTime()) / 86400000);
      if (diff === 0) current = streak.current_streak;
      else if (diff === 1) current = streak.current_streak + 1;
      else current = 1;
    }
    await admin.from("student_learning_streaks").upsert(
      {
        student_id: userId,
        streak_type: "daily",
        current_streak: current,
        longest_streak: Math.max(current, streak?.longest_streak ?? 0),
        last_activity_date: today,
      },
      { onConflict: "student_id,streak_type" }
    );

    return json({ ok: true, xp_awarded: xp, total_xp: newTotal, current_streak: current, multiplier_applied: multiplier });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
