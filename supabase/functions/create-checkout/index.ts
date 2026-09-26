
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
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
    logStep("Function started");

    // SECURITY: Input validation
    const body = await req.json();
    const { planId, paymentType } = body;
    
    // Validate planId
    if (!planId || typeof planId !== 'string') {
      throw new Error("Valid Plan ID is required");
    }
    
    // Validate planId format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(planId)) {
      throw new Error("Invalid Plan ID format");
    }
    
    // Validate paymentType if provided
    if (paymentType && typeof paymentType !== 'string') {
      throw new Error("Invalid payment type");
    }
    
    logStep("Input validated", { planId, paymentType });

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Authorization required");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user?.email) {
      throw new Error("User authentication failed");
    }

    const user = userData.user;
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Get subscription plan details with validation.
    // NOTE: this used to query a `payment_plans` table that doesn't exist --
    // the real table is `subscription_plans`, which prices in two columns
    // (price_dzd / price_eur) instead of one price+currency pair.
    const { data: plan, error: planError } = await supabaseClient
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .eq('is_active', true)
      .single();

    if (planError || !plan) throw new Error("Payment plan not found");

    // Currency follows the same DZ/EUR split used everywhere else in the app
    // (see src/lib/marketRegion.ts) -- every non-DZ region settles in EUR,
    // and DZ's listed payment method is 'bank_dz' (a manual path), not
    // Stripe -- create-pack-checkout uses this exact same EUR-only
    // convention for that reason, so this mirrors it rather than guessing
    // at Stripe DZD support.
    const price = plan.price_eur;
    const currency = 'eur';

    // SECURITY: Validate plan data
    if (!price || typeof price !== 'number' || price <= 0) {
      throw new Error("Invalid plan price");
    }
    if (!plan.name || typeof plan.name !== 'string') {
      throw new Error("Invalid plan name");
    }

    // Validate price is reasonable (prevent manipulation)
    if (price > 10000) { // Max €10,000
      throw new Error("Price exceeds maximum allowed");
    }

    logStep("Payment plan validated", { planName: plan.name, price });

    // Deno's edge runtime needs the fetch-based HTTP client -- the SDK's
    // default (Node's http module) fails with a generic "connection" error
    // here, per Stripe's own guidance for Deno/edge deployments.
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
      httpClient: Stripe.createFetchHttpClient(),
    });

    // Check for existing Stripe customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { user_id: user.id }
      });
      customerId = customer.id;
      logStep("New customer created", { customerId });
    }

    const origin = req.headers.get("origin") || "http://localhost:3000";
    
    // Create checkout session -- every subscription_plans row is a
    // recurring plan by definition (that's the table's whole purpose), so
    // mode is always 'subscription'; interval_type is 'monthly' | 'yearly'
    // and needs mapping to Stripe's 'month' | 'year'.
    const sessionConfig: any = {
      customer: customerId,
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: plan.name,
              description: `${plan.name} - English Learning Platform`
            },
            unit_amount: Math.round(price * 100), // Convert to cents
            recurring: { interval: plan.interval_type === 'yearly' ? 'year' : 'month' },
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/payment-canceled`,
      metadata: {
        user_id: user.id,
        plan_id: planId,
      }
    };

    const session = await stripe.checkout.sessions.create(sessionConfig);
    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    // KNOWN GAP, NOT FIXED HERE: the `payments` table requires a non-null
    // lesson_id and has none of payment_gateway/gateway_transaction_id/
    // plan_id/metadata -- this insert has always failed (silently, since the
    // error below is only logged, never thrown) and still will. Recording a
    // subscription payment needs an actual schema decision (what does
    // "payment for no specific lesson" mean in a lesson-shaped table?), not
    // a guessed placeholder lesson_id -- left exactly as broken as before
    // rather than inventing a fake one.
    const { error: paymentError } = await supabaseClient
      .from('payments')
      .insert({
        student_id: user.id,
        amount: price,
        currency,
        status: 'pending',
        payment_method: 'stripe',
      });

    if (paymentError) {
      logStep("Error creating payment record", { error: paymentError });
    } else {
      logStep("Payment record created");
    }

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
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
