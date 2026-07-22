import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { resolveStudentHub, normalizeHub } from "../_shared/resolveStudentHub.ts";
import { internalAuthHeaders, requireInternalSecret } from "../_shared/internalAuth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { to, type, data } = await req.json();

    // Public callers must be sending their own welcome email right after signup —
    // verify the caller's session actually belongs to `to`. Other edge functions
    // (no user session) authenticate via the internal shared secret instead.
    const hasInternalSecret = requireInternalSecret(req) === null;
    if (!hasInternalSecret) {
      const authHeader = req.headers.get("Authorization") ?? "";
      const anonClient = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader } } }
      );
      const { data: { user }, error: userError } = await anonClient.auth.getUser();
      if (userError || !user?.email || user.email.toLowerCase() !== String(to).toLowerCase()) {
        return new Response(
          JSON.stringify({ error: "Forbidden: can only send this email to your own address" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    console.log(`Processing ${type} email to ${to}`);

    // Map old types to transactional templates
    let templateName: string;
    const templateData: Record<string, any> = {};

    switch (type) {
      case 'student-welcome': {
        templateName = 'welcome-student';
        templateData.name = data?.userName;
        // Always resolve hub from DB — no hardcoded fallback.
        const explicit = normalizeHub(data?.studentLevel ?? data?.hub);
        const hub = explicit ?? (await resolveStudentHub({
          client: supabase,
          userId: data?.userId,
          email: to,
        }));
        if (hub) templateData.studentLevel = hub;
        break;
      }
      case 'teacher-welcome':
        templateName = 'welcome-teacher';
        templateData.name = data?.userName;
        break;
      default:
        // For email-confirmation, password-reset, login-notification, unusual-login-attempt
        // These are auth emails handled by auth-email-hook, not transactional
        console.log(`Email type '${type}' is handled by auth system, skipping transactional send`);
        return new Response(JSON.stringify({ success: true, note: 'Handled by auth system' }), {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
    }

    const { error } = await supabase.functions.invoke('send-transactional-email', {
      body: {
        templateName,
        recipientEmail: to,
        idempotencyKey: `user-email-${type}-${to}-${Date.now()}`,
        templateData,
      },
      headers: internalAuthHeaders(),
    });

    if (error) throw error;

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-user-emails:", error);
    return new Response(
      JSON.stringify({ error: error.message, success: false }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
