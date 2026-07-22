import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { internalAuthHeaders } from "../_shared/internalAuth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const payload = await req.json();
    const studentId = payload.record?.id;
    const studentEmail = payload.record?.email;
    const studentName = payload.record?.full_name;

    if (!studentId || !studentEmail || !studentName) {
      throw new Error("Missing student information");
    }

    const { error } = await supabase.functions.invoke('send-transactional-email', {
      body: {
        templateName: 'admin-new-student',
        recipientEmail: 'f.zahra.Djaanine@engleuphoria.com',
        idempotencyKey: `admin-student-${studentId}`,
        templateData: { studentName, studentEmail, studentId },
      },
      headers: internalAuthHeaders(),
    });

    if (error) throw error;

    console.log("Admin notification sent for new student:", studentName);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in notify-admin-new-student:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
