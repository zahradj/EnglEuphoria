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

    const { email, name, role, studentLevel, userId, interests, mainGoal } = await req.json();

    // Public callers must be sending their own welcome email right after signup —
    // verify the caller's session actually belongs to `email`. Other edge functions
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
      if (userError || !user?.email || user.email.toLowerCase() !== String(email).toLowerCase()) {
        return new Response(
          JSON.stringify({ error: "Forbidden: can only send a welcome email to your own address" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    console.log(`Sending welcome email to ${role}: ${name} (${email})`);

    const templateName = role === 'teacher' ? 'welcome-teacher' : 'welcome-student';
    const templateData: Record<string, any> = { name };
    if (interests) templateData.interests = interests;
    if (mainGoal) templateData.mainGoal = mainGoal;

    if (role !== 'teacher') {
      // Always derive the canonical hub server-side. No "Academy" fallback —
      // resolveStudentHub returns null when truly unknown so the template
      // can render a neutral phrase instead of guessing.
      const explicit = normalizeHub(studentLevel);
      const hub = explicit ?? (await resolveStudentHub({
        client: supabase,
        userId,
        email,
      }));
      if (hub) templateData.studentLevel = hub;
    }

    const { error } = await supabase.functions.invoke('send-transactional-email', {
      body: {
        templateName,
        recipientEmail: email,
        idempotencyKey: `welcome-${role}-${email}-${Date.now()}`,
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
    console.error("Error sending welcome email:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
