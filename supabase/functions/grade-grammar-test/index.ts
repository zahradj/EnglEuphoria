import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { internalAuthHeaders } from "../_shared/internalAuth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Keep this in sync with src/data/recruitmentGrammarQuestions.ts.
// Server-side answer key prevents tampering — only ids + correct indices.
const ANSWER_KEY: Record<string, number> = {
  "a2-01": 1, "a2-02": 1, "a2-03": 1, "a2-04": 2, "a2-05": 2, "a2-06": 2,
  "a2-07": 2, "a2-08": 1, "a2-09": 1, "a2-10": 2,
  "b1-01": 2, "b1-02": 1, "b1-03": 1, "b1-04": 1, "b1-05": 2, "b1-06": 0,
  "b1-07": 2, "b1-08": 1, "b1-09": 0, "b1-10": 2, "b1-11": 0, "b1-12": 1,
  "b1-13": 2, "b1-14": 1, "b1-15": 1, "b1-16": 2, "b1-17": 1, "b1-18": 1,
  "b2-01": 2, "b2-02": 1, "b2-03": 2, "b2-04": 1, "b2-05": 0, "b2-06": 1,
  "b2-07": 3, "b2-08": 1, "b2-09": 0, "b2-10": 2, "b2-11": 1, "b2-12": 2,
  "b2-13": 0, "b2-14": 1, "b2-15": 1, "b2-16": 1, "b2-17": 1, "b2-18": 2,
  "c1-01": 1, "c1-02": 2, "c1-03": 1, "c1-04": 0, "c1-05": 0, "c1-06": 2,
  "c1-07": 2, "c1-08": 2, "c1-09": 1, "c1-10": 0, "c1-11": 0, "c1-12": 1,
  "c1-13": 0, "c1-14": 1,
};

const PASS_THRESHOLD = 85;

type CanonicalHub = 'playground' | 'academy' | 'success';

function normalizeHub(value: unknown): CanonicalHub | null {
  const v = String(value ?? '').trim().toLowerCase().replace(/[_-]+/g, ' ');
  if (!v) return null;
  if (v.includes('playground') || v.includes('kid') || v.includes('child')) return 'playground';
  if (v.includes('success') || v.includes('professional') || v.includes('adult') || v === 'hub') return 'success';
  if (v.includes('academy') || v.includes('teen')) return 'academy';
  return null;
}

function normalizeAgeGroups(value: unknown): CanonicalHub | null {
  const items = Array.isArray(value) ? value.map(String) : [String(value ?? '')];
  const normalized = items.map((item) => item.toLowerCase());
  const hasAdult = normalized.some((item) => item.includes('adult'));
  const hasTeen = normalized.some((item) => item.includes('teen'));
  const hasKid = normalized.some((item) => item.includes('kid') || item.includes('child'));
  const count = Number(hasAdult) + Number(hasTeen) + Number(hasKid);
  if (count !== 1) return null;
  if (hasAdult) return 'success';
  if (hasTeen) return 'academy';
  if (hasKid) return 'playground';
  return null;
}

function samplerForHub(hub: CanonicalHub): string {
  return hub === 'playground' ? 'playground_sampler' : hub === 'success' ? 'success_sampler' : 'academy_sampler';
}

function durationForHub(hub: CanonicalHub): number {
  return hub === 'playground' ? 30 : 60;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { applicationId, email, answers } = await req.json();

    if (!applicationId || !email || !Array.isArray(answers) || answers.length === 0) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let correct = 0;
    const total = answers.length;
    const questionIds: string[] = [];
    for (const a of answers) {
      const qid = String(a.questionId);
      questionIds.push(qid);
      if (typeof ANSWER_KEY[qid] === "number" && a.selected === ANSWER_KEY[qid]) correct++;
    }
    const percentage = total > 0 ? (correct / total) * 100 : 0;
    const passed = percentage >= PASS_THRESHOLD;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { error: insertErr } = await supabase.from("teacher_grammar_tests").insert({
      application_id: applicationId,
      email,
      score: correct,
      total,
      percentage: Number(percentage.toFixed(2)),
      passed,
      answers,
      question_ids: questionIds,
      submitted_at: new Date().toISOString(),
    });
    if (insertErr) throw insertErr;

    let inviteToken: string | null = null;
    let roomToken: string | null = null;
    let bookingLink: string | null = null;
    let appForInvite: any = null;
    if (passed) {
      // Reuse an existing token if one was already minted, otherwise create one now.
      const { data: existing } = await supabase
        .from("teacher_applications")
        .select("id, first_name, last_name, email, interview_invite_token, hub_preference, preferred_age_groups")
        .eq("id", applicationId)
        .maybeSingle();
      appForInvite = existing;
      inviteToken = existing?.interview_invite_token ?? crypto.randomUUID();
    }

    const { data: appRow, error: updateErr } = await supabase
      .from("teacher_applications")
      .update({
        grammar_test_status: passed ? "passed" : "failed",
        grammar_score: Number(percentage.toFixed(2)),
        status: passed ? "grammar_passed" : "rejected_grammar",
        current_stage: passed ? "grammar_passed" : "rejected_grammar",
        ...(passed && inviteToken
          ? { interview_invite_token: inviteToken, interview_invite_sent_at: new Date().toISOString() }
          : {}),
      })
      .eq("id", applicationId)
      .select("first_name, last_name")
      .maybeSingle();
    if (updateErr) throw updateErr;

    if (passed && appForInvite) {
      const canonicalHub = normalizeHub(appForInvite.hub_preference) ?? normalizeAgeGroups(appForInvite.preferred_age_groups);
      const hubPatch = canonicalHub
        ? {
            hub: canonicalHub,
            hub_type: canonicalHub,
            mock_lesson_key: samplerForHub(canonicalHub),
            duration_minutes: durationForHub(canonicalHub),
          }
        : { duration_minutes: 60 };

      const { data: adminRole } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "admin")
        .limit(1)
        .maybeSingle();

      if (adminRole?.user_id) {
        const expiresAtIso = new Date(Date.now() + 48 * 60 * 60_000).toISOString();
        const candidateName = [appForInvite.first_name, appForInvite.last_name].filter(Boolean).join(" ").trim() || "Applicant";
        const { data: latest } = await supabase
          .from("interviews")
          .select("id, room_token, scheduled_at, status")
          .eq("application_id", applicationId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        const reusable = latest && latest.status === "awaiting_booking" && !latest.scheduled_at;
        if (reusable) {
          const { data: refreshed, error: refreshErr } = await supabase
            .from("interviews")
            .update({
              booking_token_expires_at: expiresAtIso,
              teacher_email: appForInvite.email,
              teacher_name: candidateName,
              ...hubPatch,
            })
            .eq("id", latest.id)
            .select("room_token")
            .maybeSingle();
          if (refreshErr) console.error("grade-grammar-test: interview refresh failed", refreshErr);
          roomToken = refreshed?.room_token ?? latest.room_token ?? null;
        } else {
          const { data: created, error: createErr } = await supabase
            .from("interviews")
            .insert({
              application_id: applicationId,
              admin_id: adminRole.user_id,
              teacher_email: appForInvite.email,
              teacher_name: candidateName,
              status: "awaiting_booking",
              booking_token_expires_at: expiresAtIso,
              ...hubPatch,
            })
            .select("room_token")
            .maybeSingle();
          if (createErr) console.error("grade-grammar-test: interview create failed", createErr);
          roomToken = created?.room_token ?? null;
        }
        if (roomToken) {
          const siteUrl = Deno.env.get("PUBLIC_SITE_URL") || "https://www.engleuphoria.com";
          bookingLink = `${siteUrl}/interview/${roomToken}`;
        }
      } else {
        console.error("grade-grammar-test: no admin user found for interview assignment");
      }
    }

    // Fire automated email — pass → interview invite with scheduling link, fail → rejection.
    const applicantName = [appRow?.first_name, appRow?.last_name].filter(Boolean).join(" ").trim() || "there";
    const siteUrl = Deno.env.get("PUBLIC_SITE_URL") || "https://www.engleuphoria.com";
    try {
      if (passed && inviteToken) {
        await supabase.functions.invoke("send-transactional-email", {
          body: {
            templateName: "interview-invitation",
            recipientEmail: email,
            idempotencyKey: `grammar-pass-invite-${applicationId}`,
            templateData: {
              name: applicantName,
              applicationId,
              confirmUrl: bookingLink ?? `${siteUrl}/teacher/interview/schedule/${inviteToken}`,
            },
          },
          headers: internalAuthHeaders(),
        });
      } else if (!passed) {
        await supabase.functions.invoke("send-transactional-email", {
          body: {
            templateName: "application-rejected",
            recipientEmail: email,
            idempotencyKey: `grammar-fail-reject-${applicationId}`,
            templateData: { name: applicantName },
          },
          headers: internalAuthHeaders(),
        });
      }
    } catch (mailErr) {
      console.error("grade-grammar-test: email dispatch failed", mailErr);
      // Don't fail the grading response — status is already persisted.
    }


    return new Response(
      JSON.stringify({
        score: correct,
        total,
        percentage: Number(percentage.toFixed(2)),
        passed,
        inviteToken,
        roomToken,
        bookingLink,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (err) {
    const anyErr = err as any;
    const message =
      anyErr?.message ||
      anyErr?.error_description ||
      anyErr?.hint ||
      anyErr?.details ||
      (typeof err === "string" ? err : JSON.stringify(err, Object.getOwnPropertyNames(anyErr ?? {})));
    console.error("grade-grammar-test error:", message, "raw:", JSON.stringify(anyErr, Object.getOwnPropertyNames(anyErr ?? {})));
    return new Response(JSON.stringify({ error: message || "Unknown grading error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
