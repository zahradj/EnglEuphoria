import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { internalAuthHeaders } from "../_shared/internalAuth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify the caller is an admin — same pattern as approve-teacher.
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: callerUser }, error: userError } = await callerClient.auth.getUser();
    if (userError || !callerUser) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { data: roleData } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", callerUser.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Forbidden: admin role required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { applicationId, reason } = await req.json();
    if (!applicationId) {
      return new Response(JSON.stringify({ error: "applicationId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: appData, error: fetchError } = await adminClient
      .from("teacher_applications")
      .select("id, email, first_name, last_name, current_stage")
      .eq("id", applicationId)
      .single();

    if (fetchError || !appData) {
      return new Response(JSON.stringify({ error: "Application not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error: updateError } = await adminClient
      .from("teacher_applications")
      .update({ current_stage: "rejected", status: "rejected", rejection_reason: reason ?? null })
      .eq("id", applicationId);

    if (updateError) {
      return new Response(JSON.stringify({ error: `Failed to update application: ${updateError.message}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Pick the rejection template the same way TeacherApplicationReview does:
    // post-interview wording once they've reached the interview stage, the
    // plainer application-rejected template before that.
    const wasInterviewed = ["interview_pending", "interview_scheduled", "interview_completed", "final_review"].includes(
      appData.current_stage,
    );
    const templateName = wasInterviewed ? "post-interview-rejection" : "application-rejected";
    const fullName = `${appData.first_name || ""} ${appData.last_name || ""}`.trim() || appData.email.split("@")[0];

    // Send via direct HTTP call with the internal secret attached server-side
    // — this must never be callable straight from the browser, which is the
    // exact bug this function replaces (send-transactional-email requires
    // this header on every caller, and the browser can't safely hold it).
    let emailSuccess = false;
    let emailErrorMsg = "";
    try {
      const emailRes = await fetch(`${supabaseUrl}/functions/v1/send-transactional-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${serviceRoleKey}`,
          "apikey": serviceRoleKey,
          ...internalAuthHeaders(),
        },
        body: JSON.stringify({
          templateName,
          recipientEmail: appData.email,
          idempotencyKey: `${templateName}-${applicationId}`,
          templateData: { name: appData.first_name || fullName.split(" ")[0] },
        }),
      });
      const emailBody = await emailRes.text();
      if (!emailRes.ok) {
        emailErrorMsg = `HTTP ${emailRes.status}: ${emailBody}`;
      } else {
        emailSuccess = true;
      }
    } catch (fetchErr) {
      emailErrorMsg = fetchErr instanceof Error ? fetchErr.message : String(fetchErr);
    }

    if (!emailSuccess) {
      console.error("Rejection email failed:", emailErrorMsg);
    }

    return new Response(
      JSON.stringify({ success: true, emailSent: emailSuccess, emailError: emailSuccess ? undefined : emailErrorMsg }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
