// assign-extra-practice: evaluates one just-ended Academy lesson's
// quiz_responses against Novakid's per-domain automatic Extra Practice rule
// (Speaking: any 1 failed competency; Grammar/Reading: >=50% of that
// domain's competencies failed) and auto-assigns a matching pre-authored
// practice lesson for every domain that triggers.
//
// MUST run server-side with the service-role key: remedial_lessons' RLS
// insert policy requires auth.uid() = student_id, but this is invoked from
// the TEACHER's session right after they end the lesson (LessonWrapUpDialog),
// so a client-side insert as the teacher would be silently rejected by RLS.
// Same reasoning generate-smart-homework already uses for its own
// teacher-writes-on-behalf-of-student inserts.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { evaluateDomainCompetencies } from "../_shared/evaluateDomainCompetencies.ts";

type Hub = "playground" | "academy" | "professional";

interface Body {
  bookingId: string;
  studentId: string;
  hub: Hub;
}

const MAX_ATTEMPTS_PER_DOMAIN = 2;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "POST only" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseUser = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );
  const { data: claims } = await supabaseUser.auth.getClaims(authHeader.replace("Bearer ", ""));
  const callerId = claims?.claims?.sub;
  if (!callerId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: roleRows } = await supabase.from("user_roles").select("role").eq("user_id", callerId);
  const roles = (roleRows ?? []).map((r: { role: string }) => r.role);
  if (!roles.includes("teacher") && !roles.includes("admin")) {
    return new Response(JSON.stringify({ error: "Forbidden — teacher role required" }), {
      status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (!body?.bookingId || !body?.studentId || !body?.hub) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Only Academy has a real, live auto-graded quiz signal today.
  if (body.hub !== "academy") {
    return new Response(JSON.stringify({ outcomes: [] }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Confirm the caller actually teaches this booking — a teacher role alone
  // shouldn't be enough to trigger remediation writes for an arbitrary
  // student on someone else's booking.
  const { data: booking } = await supabase
    .from("class_bookings")
    .select("id, teacher_id")
    .eq("id", body.bookingId)
    .maybeSingle();
  if (!booking || booking.teacher_id !== callerId) {
    return new Response(JSON.stringify({ error: "Forbidden — not this booking's teacher" }), {
      status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const outcomes: Array<{ domain: string; failedTags: string[]; assigned: boolean; reason?: string }> = [];

  try {
    const { data: session } = await supabase
      .from("classroom_sessions")
      .select("id, lesson_id")
      .eq("booking_id", body.bookingId)
      .maybeSingle();
    if (!session?.id) {
      return new Response(JSON.stringify({ outcomes }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: responses } = await supabase
      .from("quiz_responses")
      .select("is_correct, skill_tag")
      .eq("session_id", session.id)
      .eq("student_id", body.studentId);
    if (!responses?.length) {
      return new Response(JSON.stringify({ outcomes }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const domainResults = evaluateDomainCompetencies(
      responses.map((r) => ({ skillTag: r.skill_tag, isCorrect: r.is_correct })),
    );

    for (const result of domainResults) {
      if (!result.shouldAssign) continue;
      const fullTags = result.failedTags.map((tag) => `${result.domain}:${tag}`);

      const { data: priorForDomain } = await supabase
        .from("remedial_lessons")
        .select("failed_tags")
        .eq("student_id", body.studentId)
        .eq("kind", "competency")
        .eq("hub", body.hub);
      const priorAttempts = (priorForDomain ?? []).filter((row: { failed_tags: string[] | null }) =>
        (row.failed_tags ?? []).some((t: string) => t.startsWith(`${result.domain}:`)),
      ).length;
      if (priorAttempts >= MAX_ATTEMPTS_PER_DOMAIN) {
        outcomes.push({ domain: result.domain, failedTags: result.failedTags, assigned: false, reason: "attempt_cap_reached" });
        continue;
      }

      const targetSystems = ["academy", "teen", "teens"];
      const { data: practiceLesson } = await supabase
        .from("curriculum_lessons")
        .select("id")
        .eq("is_review", true)
        .eq("is_published", true)
        .in("target_system", targetSystems)
        .contains("skills_focus", [result.domain])
        .limit(1)
        .maybeSingle();
      if (!practiceLesson?.id) {
        outcomes.push({ domain: result.domain, failedTags: result.failedTags, assigned: false, reason: "no_matching_lesson" });
        continue;
      }

      const { data: remedialRow, error: remedialError } = await supabase
        .from("remedial_lessons")
        .insert({
          student_id: body.studentId,
          source_lesson_id: session.lesson_id,
          generated_lesson_id: practiceLesson.id,
          retest_lesson_id: session.lesson_id,
          kind: "competency",
          failed_tags: fullTags,
          hub: body.hub,
          status: "pending",
        })
        .select("id")
        .single();
      if (remedialError || !remedialRow) {
        console.warn("[assign-extra-practice] remedial_lessons insert failed:", remedialError?.message);
        outcomes.push({ domain: result.domain, failedTags: result.failedTags, assigned: false, reason: "insert_failed" });
        continue;
      }

      const { data: existingSchedule } = await supabase
        .from("scheduled_lessons")
        .select("teacher_id")
        .eq("student_id", body.studentId)
        .limit(1)
        .maybeSingle();
      const teacherId = existingSchedule?.teacher_id ?? callerId;

      const { error: scheduleError } = await supabase.from("scheduled_lessons").insert({
        student_id: body.studentId,
        teacher_id: teacherId,
        lesson_id: practiceLesson.id,
        status: "auto_assigned",
        scheduled_for: new Date().toISOString(),
        auto_assigned: true,
        source_remedial_id: remedialRow.id,
        badge: "extra_practice",
      });
      if (scheduleError) {
        console.warn("[assign-extra-practice] scheduled_lessons insert failed:", scheduleError.message);
        outcomes.push({ domain: result.domain, failedTags: result.failedTags, assigned: false, reason: "insert_failed" });
        continue;
      }

      outcomes.push({ domain: result.domain, failedTags: result.failedTags, assigned: true });
    }

    return new Response(JSON.stringify({ outcomes }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[assign-extra-practice] unexpected error:", (e as Error).message);
    return new Response(JSON.stringify({ error: "Internal error", outcomes }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
