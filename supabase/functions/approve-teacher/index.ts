import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { internalAuthHeaders } from "../_shared/internalAuth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SITE_URL = "https://engleuphoria.com";

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

    // Verify the caller is an admin
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

    const { applicationId, email, firstName, lastName } = await req.json();
    if (!applicationId || !email) {
      return new Response(JSON.stringify({ error: "applicationId and email are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const fullName = `${firstName || ""} ${lastName || ""}`.trim() || email.split("@")[0];

    // Step 1: Check if user already exists
    const { data: existingUsers } = await adminClient.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );

    let authUserId: string;
    let setPasswordUrl = `${SITE_URL}/set-password`;

    if (existingUser) {
      authUserId = existingUser.id;
      console.log(`User already exists in auth: ${authUserId}`);
      const { data: linkData } = await adminClient.auth.admin.generateLink({
        type: "magiclink",
        email,
        options: { redirectTo: `${SITE_URL}/set-password` },
      });
      if (linkData?.properties?.action_link) {
        setPasswordUrl = linkData.properties.action_link;
      }
    } else {
      const { data: createData, error: createError } = await adminClient.auth.admin.createUser({
        email,
        email_confirm: false,
        user_metadata: { full_name: fullName, role: "teacher" },
      });

      if (createError) {
        console.error("Create user error:", createError);
        return new Response(JSON.stringify({ error: `Failed to create auth account: ${createError.message}` }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      authUserId = createData.user.id;
      console.log(`Created auth user: ${authUserId}`);

      const { data: linkData } = await adminClient.auth.admin.generateLink({
        type: "invite",
        email,
        options: { redirectTo: `${SITE_URL}/set-password` },
      });
      if (linkData?.properties?.action_link) {
        setPasswordUrl = linkData.properties.action_link;
      }
    }

    // Upsert into public.users
    const { error: usersError } = await adminClient.from("users").upsert(
      { id: authUserId, email, full_name: fullName, role: "teacher" },
      { onConflict: "id" }
    );
    if (usersError) console.error("Users upsert error:", usersError);

    // Insert user_roles
    const { error: roleInsertError } = await adminClient.from("user_roles").upsert(
      { user_id: authUserId, role: "teacher" },
      { onConflict: "user_id,role" }
    );
    if (roleInsertError) console.error("Role insert error:", roleInsertError);

    // Fetch application data
    const { data: appData } = await adminClient
      .from("teacher_applications")
      .select("*")
      .eq("id", applicationId)
      .single();

    // Create teacher profile. cv_url moves here permanently on hire — the
    // application row's copy is subject to the rejected-applicant cleanup
    // job, but a hired teacher's CV should never be auto-deleted.
    const { error: profileError } = await adminClient.from("teacher_profiles").upsert(
      {
        user_id: authUserId,
        bio: appData?.bio || "",
        video_url: appData?.video_url || "",
        specializations: appData?.preferred_age_groups || [],
        languages_spoken: appData?.languages_spoken || ["English"],
        years_experience: appData?.teaching_experience_years || 0,
        profile_image_url: appData?.professional_photo_url || "",
        cv_url: appData?.cv_url ?? null,
        profile_complete: false,
        can_teach: false,
        is_available: false,
        profile_approved_by_admin: false,
      },
      { onConflict: "user_id" }
    );
    if (profileError) console.error("Profile upsert error:", profileError);

    // Update application status
    const { error: appUpdateError } = await adminClient
      .from("teacher_applications")
      .update({
        current_stage: "interview_completed",
        status: "accepted",
        user_id: authUserId,
      })
      .eq("id", applicationId);

    if (appUpdateError) {
      console.error("Application update error:", appUpdateError);
      return new Response(JSON.stringify({ error: `Failed to update application: ${appUpdateError.message}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Send branded welcome email via direct HTTP call to avoid functions.invoke issues
    let emailSuccess = false;
    let emailErrorMsg = "";
    let resendId: string | null = null;
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
          templateName: "final-welcome",
          recipientEmail: email,
          idempotencyKey: `teacher-welcome-${applicationId}-${Date.now()}`,
          templateData: {
            name: fullName,
            setPasswordUrl,
          },
        }),
      });
      const emailBody = await emailRes.text();
      console.log(`Email response status: ${emailRes.status}, body: ${emailBody}`);
      if (!emailRes.ok) {
        emailErrorMsg = `HTTP ${emailRes.status}: ${emailBody}`;
      } else {
        emailSuccess = true;
        // Capture resend_id so the resend-webhook can later match this row
        // and update it with the real delivered/bounced/complained status --
        // without it, this row is stuck showing "sent" forever regardless of
        // what actually happens after Resend hands the email off.
        try {
          resendId = JSON.parse(emailBody)?.resend_id ?? null;
        } catch {
          // non-JSON body — leave resendId null, nothing else to do here
        }
      }
    } catch (fetchErr) {
      console.error("Email fetch error:", fetchErr);
      emailErrorMsg = fetchErr.message || "Unknown fetch error";
    }

    if (!emailSuccess) {
      console.error("Email enqueue failed:", emailErrorMsg);
      await adminClient.from("system_emails").insert({
        email_type: "teacher_welcome",
        recipient_email: email,
        recipient_name: fullName,
        subject: "Welcome to the EnglEuphoria Family! 🌟",
        delivery_status: "failed",
        error_message: emailErrorMsg,
        related_entity_id: applicationId,
        related_entity_type: "teacher_application",
      });
    } else {
      console.log(`✅ Welcome email queued for ${email}`);
      await adminClient.from("system_emails").insert({
        email_type: "teacher_welcome",
        recipient_email: email,
        recipient_name: fullName,
        subject: "Welcome to the EnglEuphoria Family! 🌟",
        delivery_status: "sent",
        sent_at: new Date().toISOString(),
        related_entity_id: applicationId,
        related_entity_type: "teacher_application",
        ...(resendId ? { metadata: { resend_id: resendId } } : {}),
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        userId: authUserId,
        message: `Teacher ${fullName} approved. Branded welcome email queued for ${email}.`,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(JSON.stringify({ error: error.message || "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
