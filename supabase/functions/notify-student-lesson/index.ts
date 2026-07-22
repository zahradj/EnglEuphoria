import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { internalAuthHeaders } from "../_shared/internalAuth.ts";

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

    const { student_email, student_name, student_level, lesson_title } = await req.json();

    if (!student_email || !student_name || !lesson_title) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Sending lesson-ready notification to ${student_email} for level: ${student_level || 'academy'}`);

    const { error } = await supabase.functions.invoke('send-transactional-email', {
      body: {
        templateName: 'student-lesson-ready',
        recipientEmail: student_email,
        idempotencyKey: `lesson-ready-${student_email}-${Date.now()}`,
        templateData: {
          studentName: student_name,
          lessonTitle: lesson_title,
          studentLevel: student_level || 'academy',
        },
      },
      headers: internalAuthHeaders(),
    });

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in notify-student-lesson:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
