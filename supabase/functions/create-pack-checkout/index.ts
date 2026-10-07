// Real checkout entry point for the credit_packs system — the thing
// CreditDisplay.tsx's "Buy Credits"/"Top Up"/"Add More" buttons navigate to
// (via /pricing) but that had no live purchase flow behind it until now.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  console.log(`[CREATE-PACK-CHECKOUT] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } },
  );

  try {
    const body = await req.json();
    const { packId } = body;
    const forStudentId = typeof body.studentId === "string" ? body.studentId : null;

    if (!packId || typeof packId !== "string") {
      throw new Error("Valid packId is required");
    }
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(packId)) {
      throw new Error("Invalid packId format");
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Authorization required");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user?.email) {
      throw new Error("User authentication failed");
    }
    const user = userData.user;
    logStep("User authenticated", { userId: user.id });

    // Who receives the credits: the signed-in user, or (family accounts) one of their children.
    let targetId = user.id;
    if (forStudentId && forStudentId !== user.id) {
      if (!uuidRegex.test(forStudentId)) throw new Error("Invalid studentId format");
      const { data: rel } = await supabaseClient
        .from("student_parent_relationships")
        .select("id")
        .eq("parent_id", user.id)
        .eq("student_id", forStudentId)
        .not("approved_at", "is", null)
        .maybeSingle();
      if (!rel) throw new Error("This learner is not in your family account");
      targetId = forStudentId;
    }

    // Stripe sends the receipt to the buyer. A child's login uses a made-up address, so use a real
    // parent's address for a child buying from their own profile.
    let billingEmail: string = user.email as string;
    if (billingEmail.endsWith(".invalid")) {
      const { data: rels } = await supabaseClient
        .from("student_parent_relationships")
        .select("parent_id")
        .eq("student_id", user.id)
        .not("approved_at", "is", null)
        .limit(1);
      const parentId = rels?.[0]?.parent_id;
      if (parentId) {
        const { data: parentUser } = await supabaseClient.auth.admin.getUserById(parentId);
        if (parentUser?.user?.email && !parentUser.user.email.endsWith(".invalid")) {
          billingEmail = parentUser.user.email;
        }
      }
    }

    // Pull the pack server-side — never trust a client-supplied price.
    const { data: pack, error: packError } = await supabaseClient
      .from("credit_packs")
      .select("*")
      .eq("id", packId)
      .eq("is_active", true)
      .single();

    if (packError || !pack) throw new Error("Credit pack not found or inactive");
    // Family packs are only sold to a parent buying for one of their children (family dashboard).
    if (pack.family_only && targetId === user.id) {
      throw new Error("Family packs are bought from the family dashboard");
    }
    if (!pack.price_eur || typeof pack.price_eur !== "number" || pack.price_eur <= 0) {
      throw new Error("Invalid pack price");
    }
    logStep("Pack validated", { name: pack.name, price: pack.price_eur, sessions: pack.session_count });

    // Deno's edge runtime needs the fetch-based HTTP client -- the SDK's
    // default (Node's http module) fails with a generic "connection" error
    // here, per Stripe's own guidance for Deno/edge deployments.
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
      httpClient: Stripe.createFetchHttpClient(),
    });

    const customers = await stripe.customers.list({ email: billingEmail, limit: 1 });
    let customerId: string;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const customer = await stripe.customers.create({ email: billingEmail, metadata: { user_id: user.id } });
      customerId = customer.id;
    }

    const origin = req.headers.get("origin") || "https://www.engleuphoria.com";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `${pack.name} — ${pack.session_count} lesson credits`,
              description: `${pack.session_count} lesson credits for the ${pack.student_level} hub`,
            },
            unit_amount: Math.round(pack.price_eur * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/pricing?checkout=success&session_id={CHECKOUT_SESSION_ID}${targetId !== user.id ? "&return=parent" : ""}`,
      cancel_url: targetId !== user.id ? `${origin}/parent` : `${origin}/pricing?checkout=cancelled`,
      metadata: {
        student_id: targetId,
        buyer_id: user.id,
        pack_id: pack.id,
        credits: String(pack.session_count),
        amount_eur: String(pack.price_eur),
      },
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage, type: (error as any)?.type, code: (error as any)?.code });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
