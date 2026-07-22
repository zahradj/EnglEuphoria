
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  console.log(`[VERIFY-PAYMENT] ${step}${details ? ` - ${JSON.stringify(details)}` : ''}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    // SECURITY: Input validation
    const body = await req.json();
    const { sessionId } = body;
    
    if (!sessionId || typeof sessionId !== 'string') {
      throw new Error("Valid Session ID is required");
    }
    
    // Validate sessionId format (Stripe checkout session format)
    if (!sessionId.startsWith('cs_')) {
      throw new Error("Invalid Session ID format");
    }
    
    // Prevent excessively long sessionIds (potential DoS)
    if (sessionId.length > 200) {
      throw new Error("Session ID too long");
    }

    logStep("Verifying payment", { sessionId });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    logStep("Session retrieved", { status: session.payment_status, mode: session.mode });

    if (session.payment_status === 'paid') {
      // Update payment status
      const { error: updateError } = await supabaseClient
        .from('payments')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('gateway_transaction_id', sessionId);

      if (updateError) throw updateError;

      // For subscriptions, create subscription record
      if (session.mode === 'subscription' && session.subscription) {
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        
        // SECURITY: Validate metadata exists
        if (!session.metadata?.user_id || !session.metadata?.plan_id) {
          throw new Error("Missing required metadata");
        }
        
        // SECURITY: Validate subscription data
        if (!subscription.id || !subscription.status) {
          throw new Error("Invalid subscription data");
        }
        
        const { error: subError } = await supabaseClient
          .from('subscriptions')
          .upsert({
            user_id: session.metadata.user_id,
            plan_id: session.metadata.plan_id,
            stripe_subscription_id: subscription.id,
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString()
          });

        if (subError) throw subError;
        logStep("Subscription created/updated");
      }

      logStep("Payment verified and updated");
      return new Response(JSON.stringify({ success: true, status: 'paid' }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: false, status: session.payment_status }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
