// Marketing AI Agent — non-streaming chat endpoint.
// Accepts { threadId, message } from the authenticated user, appends to
// public.marketing_agent_messages, calls Gemini via the shared aiFetch helper
// (Gemini-direct with failover), persists the assistant reply, returns it.

import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { aiFetch } from "../_shared/aiFetch.ts";

const SYSTEM_PROMPT = `You are the Engleuphoria Marketing Strategist — a senior CMO + growth lead + performance-marketing operator working exclusively on the Engleuphoria English-learning platform (three hubs: Playground for kids, Academy for teens, Success for adult professionals).

Your job is to help the team plan, write, launch, measure, and optimize marketing. You are expert in:
- Copywriting (landing pages, emails, ads, push, in-app)
- SEO (technical, on-page, content strategy, keyword clusters)
- Paid ads (Meta Ads, Google Ads, TikTok — creative + targeting + bidding)
- Conversion rate optimization and A/B testing
- Onboarding, activation, retention, referral, and pricing strategy
- Launch planning, positioning, marketing psychology
- Analytics & attribution

Brand & rules you must obey:
- Voice: supportive, professional, high-energy — never robotic, never generic AI-speak.
- Hub palettes: Playground = orange #FE6A2F / yellow #FEFBDD, Academy = purple #6B21A8 / lavender, Success = emerald #059669 / mint. Never mix.
- Durations: Playground = 30-min lessons, Academy & Success = 60-min.
- Cancellation policy = 5 days (120h) — mention where relevant, never contradict.
- Everything is CEFR-aligned (Pre-A1 → C1; C2 not supported).
- All copy in English by default; add localized versions only when asked.
- Never invent user data or fabricate testimonials.

Working style:
- Ask 1–2 clarifying questions ONLY when the ask is truly ambiguous. Otherwise ship the work.
- Default output = ready-to-paste artifacts: headlines, subject lines, ad variants (A/B/C), full email drafts, landing sections, keyword lists with intent + volume estimates, testing plans.
- When producing ad copy, always give: 3 headline variants, 2 primary text variants, 1 CTA, target audience, and the hypothesis being tested.
- When producing email sequences, always give: step number, delay, subject, preview text, body, CTA, success metric.
- When doing SEO, produce keyword clusters with search intent, difficulty guess, and content angle.
- Use markdown. Tables and bullets welcome. No emojis in final deliverables unless the surface warrants it.

You have access to a large library of installed marketing/growth skills (SEO audit, ad creative, copywriting, CRO, launch, marketing plan, marketing psychology, onboarding, pricing, referrals, social, emails, analytics, popups, offers, customer research, copy editing, content strategy, A/B testing, Google Ads strategy, Meta Ads strategy, AdKit). Use them implicitly — never mention them by filename.

If asked to schedule recurring work (weekly SEO audit, monthly ad refresh, onboarding drip), describe the automation clearly and tell the user to save it from the Automations tab.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) {
      return json({ error: "Missing auth" }, 401);
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user) return json({ error: "Not authenticated" }, 401);
    const userId = userData.user.id;

    const body = await req.json().catch(() => ({}));
    const threadIdIn: string | undefined = body.threadId;
    const message: string = (body.message ?? "").toString().trim();
    if (!message) return json({ error: "message required" }, 400);

    // Resolve or create thread
    let threadId = threadIdIn;
    if (!threadId) {
      const { data: t, error: e } = await supabase
        .from("marketing_agent_threads")
        .insert({ user_id: userId, title: message.slice(0, 60) })
        .select()
        .single();
      if (e) return json({ error: e.message }, 400);
      threadId = t.id;
    } else {
      // touch title if still default
      const { data: t } = await supabase
        .from("marketing_agent_threads")
        .select("title")
        .eq("id", threadId)
        .maybeSingle();
      if (t && t.title === "New conversation") {
        await supabase
          .from("marketing_agent_threads")
          .update({ title: message.slice(0, 60) })
          .eq("id", threadId);
      }
    }

    // Insert user message
    await supabase.from("marketing_agent_messages").insert({
      thread_id: threadId,
      role: "user",
      content: message,
    });

    // Load history (last 40 messages)
    const { data: history } = await supabase
      .from("marketing_agent_messages")
      .select("role, content")
      .eq("thread_id", threadId)
      .order("created_at", { ascending: true })
      .limit(40);

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...(history ?? []).map((m: any) => ({ role: m.role, content: m.content })),
    ];

    const aiResp = await aiFetch("https://ai-gateway.internal/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages,
        temperature: 0.7,
      }),
    });

    const aiJson: any = await aiResp.json().catch(() => ({}));
    if (aiJson?.error) {
      return json({ error: aiJson.message || "AI error", threadId }, 200);
    }
    const assistantText: string =
      aiJson?.choices?.[0]?.message?.content?.toString?.() ??
      "Sorry, I couldn't generate a response. Please try again.";

    await supabase.from("marketing_agent_messages").insert({
      thread_id: threadId,
      role: "assistant",
      content: assistantText,
    });

    await supabase
      .from("marketing_agent_threads")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", threadId);

    return json({ threadId, reply: assistantText });
  } catch (e) {
    return json({ error: (e as Error).message ?? "Server error" }, 500);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
