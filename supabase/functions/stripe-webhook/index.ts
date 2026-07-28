// Authoritative payment confirmation for the credit_packs purchase flow.
// Previously nothing server-side ever confirmed a payment except the
// client calling back after a Stripe redirect (verify-payment) — a closed
// tab or dropped connection meant Stripe had the money but the DB never
// granted credits. This webhook is the real source of truth: Stripe calls
// it directly, independent of whether the customer's browser survives the
// round trip.
//
// SETUP REQUIRED (cannot be done from here — needs the Stripe dashboard):
//   1. Stripe Dashboard → Developers → Webhooks → Add endpoint
//      URL: https://dcoxpyzoqjvmuuygvlme.supabase.co/functions/v1/stripe-webhook
//      Events: checkout.session.completed
//   2. Copy the generated signing secret and set it in Supabase:
//      supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const logStep = (step: string, details?: any) => {
  console.log(`[STRIPE-WEBHOOK] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`);
};

async function sendReceiptEmail(
  supabase: ReturnType<typeof createClient>,
  params: { email: string; name: string | null; packName: string; credits: number; amountEur: number },
) {
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  if (!RESEND_API_KEY) {
    logStep("Skipping receipt email — RESEND_API_KEY not configured");
    return;
  }

  const { data: suppressed } = await supabase
    .from("suppressed_emails")
    .select("id")
    .eq("email", params.email.toLowerCase())
    .maybeSingle();
  if (suppressed) {
    logStep("Receipt email suppressed", { email: params.email });
    return;
  }

  const greeting = params.name ? `Hi ${params.name},` : "Hi,";
  const html = `<!doctype html>
<html><body style="font-family:Arial,Helvetica,sans-serif;background:#f9fafb;padding:24px;margin:0;">
  <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
    <div style="background:#4f46e5;height:4px;"></div>
    <div style="padding:28px 28px 20px;">
      <h1 style="font-size:22px;color:#4f46e5;margin:0 0 16px;">Payment received ✅</h1>
      <p style="font-size:15px;color:#1f2937;line-height:1.6;margin:0 0 20px;">${greeting}<br/>Thanks for your purchase — here's your receipt.</p>
      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px 20px;margin:0 0 20px;">
        <p style="font-size:14px;color:#374151;margin:0 0 8px;"><strong>Pack:</strong> ${params.packName}</p>
        <p style="font-size:14px;color:#374151;margin:0 0 8px;"><strong>Credits added:</strong> ${params.credits}</p>
        <p style="font-size:14px;color:#374151;margin:0;"><strong>Amount paid:</strong> €${params.amountEur.toFixed(2)}</p>
      </div>
      <p style="font-size:13px;color:#6b7280;line-height:1.5;margin:0;">Your credits are already available in your account — head to your dashboard to book a lesson.</p>
    </div>
    <div style="background:#111827;padding:16px 28px;text-align:center;">
      <p style="font-size:12px;color:#9ca3af;margin:0;">© 2026 EnglEuphoria. The Future of Learning.</p>
    </div>
  </div>
</body></html>`;

  const idempotencyKey = `receipt-${params.email}-${params.credits}-${Date.now()}`;
  try {
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify({
        from: "EnglEuphoria <noreply@engleuphoria.com>",
        to: [params.email],
        subject: `Receipt: ${params.packName} — €${params.amountEur.toFixed(2)}`,
        html,
      }),
    });
    if (!resendRes.ok) {
      const body = await resendRes.text().catch(() => "");
      logStep("Receipt email send failed", { status: resendRes.status, body });
    } else {
      logStep("Receipt email sent", { email: params.email });
    }
  } catch (e) {
    logStep("Receipt email threw", { error: String((e as Error)?.message || e) });
  }
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const signature = req.headers.get("stripe-signature");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const rawBody = await req.text();

  if (!signature || !webhookSecret) {
    logStep("Missing signature or webhook secret — rejecting");
    return new Response(JSON.stringify({ error: "Webhook not configured" }), { status: 400 });
  }

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2023-10-16",
  });

  let event: Stripe.Event;
  try {
    // Async variant — Deno's SubtleCrypto-based Stripe SDK needs this over
    // the sync constructEvent.
    event = await stripe.webhooks.constructEventAsync(rawBody, signature, webhookSecret);
  } catch (err) {
    logStep("Signature verification failed", { error: String((err as Error)?.message || err) });
    return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 400 });
  }

  logStep("Event received", { type: event.type, id: event.id });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode !== "payment" || session.payment_status !== "paid") {
        return new Response(JSON.stringify({ skipped: "not a paid one-time payment" }), { status: 200 });
      }

      const studentId = session.metadata?.student_id;
      const packId = session.metadata?.pack_id;
      const credits = Number(session.metadata?.credits ?? 0);
      const amountEur = Number(session.metadata?.amount_eur ?? (session.amount_total ?? 0) / 100);

      if (!studentId || !packId || !credits) {
        logStep("Missing metadata on session — cannot grant credits", { sessionId: session.id });
        return new Response(JSON.stringify({ error: "Missing metadata" }), { status: 200 });
      }

      const { data: pack } = await supabase
        .from("credit_packs")
        .select("name")
        .eq("id", packId)
        .maybeSingle();

      // Idempotent: stripe_session_id is UNIQUE. A retry of this same event
      // (Stripe retries on any non-2xx, and this can also race the client's
      // fast-path verify call) hits the unique violation and is a no-op —
      // add_credits_on_purchase() only fires on a successful INSERT.
      const { error: insertError } = await supabase.from("credit_purchases").insert({
        student_id: studentId,
        pack_id: packId,
        credits_purchased: credits,
        amount_paid: amountEur,
        currency: "EUR",
        payment_method: "stripe",
        stripe_session_id: session.id,
      });

      if (insertError) {
        if (insertError.code === "23505") {
          logStep("Already processed (idempotent no-op)", { sessionId: session.id });
          return new Response(JSON.stringify({ ok: true, already_processed: true }), { status: 200 });
        }
        throw insertError;
      }

      logStep("Credits granted", { studentId, packId, credits });

      const { data: student } = await supabase
        .from("users")
        .select("email, full_name")
        .eq("id", studentId)
        .maybeSingle();

      if (student?.email) {
        await sendReceiptEmail(supabase, {
          email: student.email,
          name: student.full_name ?? null,
          packName: pack?.name ?? "Lesson credits",
          credits,
          amountEur,
        });
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (e) {
    logStep("Handler error", { error: String((e as Error)?.message || e) });
    // Return 500 so Stripe retries — this path only reaches here for
    // unexpected DB errors, not duplicate events (handled above).
    return new Response(JSON.stringify({ error: "Internal error" }), { status: 500 });
  }
});
