// Fast-path confirmation called by /pricing right after the Stripe
// redirect, so the student sees their new credits immediately instead of
// waiting on webhook delivery. Re-verifies the session against Stripe
// itself (never trusts client-supplied amounts) and performs the exact
// same idempotent grant as stripe-webhook — whichever of the two runs
// first wins, the other is a harmless no-op via the unique constraint.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  console.log(`[VERIFY-PACK-CHECKOUT] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } },
  );

  try {
    const { sessionId } = await req.json();
    if (!sessionId || typeof sessionId !== "string" || !sessionId.startsWith("cs_") || sessionId.length > 200) {
      throw new Error("Invalid session id");
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Authorization required");
    const { data: userData, error: userError } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (userError || !userData.user) throw new Error("Authentication failed");
    const callerId = userData.user.id;

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2023-10-16" });
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Ownership check — the session must belong to the caller, not just
    // any valid Stripe session id someone happens to pass in.
    if (session.metadata?.student_id !== callerId) {
      throw new Error("This session does not belong to you");
    }

    if (session.payment_status !== "paid") {
      return new Response(JSON.stringify({ success: false, status: session.payment_status }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const packId = session.metadata?.pack_id;
    const credits = Number(session.metadata?.credits ?? 0);
    const amountEur = Number(session.metadata?.amount_eur ?? (session.amount_total ?? 0) / 100);
    if (!packId || !credits) throw new Error("Session is missing pack metadata");

    const { error: insertError } = await supabase.from("credit_purchases").insert({
      student_id: callerId,
      pack_id: packId,
      credits_purchased: credits,
      amount_paid: amountEur,
      currency: "EUR",
      payment_method: "stripe",
      stripe_session_id: session.id,
    });

    if (insertError && insertError.code !== "23505") {
      throw insertError;
    }

    logStep("Verified", { callerId, packId, credits, alreadyGranted: insertError?.code === "23505" });

    return new Response(JSON.stringify({ success: true, status: "paid", credits_granted: credits }), {
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
