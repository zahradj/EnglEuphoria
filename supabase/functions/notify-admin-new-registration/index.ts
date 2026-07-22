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

    const { name, email, role, registeredAt } = await req.json();

    console.log(`New ${role} registration: ${name} (${email})`);

    const { error } = await supabase.functions.invoke('send-transactional-email', {
      body: {
        templateName: 'admin-new-registration',
        recipientEmail: 'f.zahra.Djaanine@engleuphoria.com',
        idempotencyKey: `admin-reg-${email}-${Date.now()}`,
        templateData: { name, email, role, registeredAt: registeredAt || new Date().toISOString() },
      },
      headers: internalAuthHeaders(),
    });

    if (error) throw error;

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending admin notification:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
