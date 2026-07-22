// Vocabulary Image Architect — Edge Function.
// Gemini direct via aiFetch crafts a theme-aware, cast-aware image prompt for
// ONE vocabulary item, then delegates rendering to generate-playground-images
// (Nano Banana Pro pipeline) so the existing style registry + caching apply.

import { aiFetch } from "../_shared/aiFetch.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

// Theme → backdrop mapping. Used both to bias Gemini and as a safety fallback.
const THEME_BACKDROP: Record<string, string> = {
  "farm animals": "sunny farm with red barn, fences and green pasture",
  "wild animals": "lush jungle clearing with tall trees",
  animals: "soft forest meadow with friendly trees",
  pets: "cozy living room with rug and toys",
  ocean: "shallow turquoise sea with sand and shells",
  vegetables: "bright kitchen counter with wooden cutting board",
  fruits: "orchard picnic with baskets",
  food: "warm kitchen with table set",
  family: "family living room, framed photos on the wall",
  school: "tidy classroom with desks and chalkboard",
  weather: "open sky landscape matching the weather",
  clothes: "kid-friendly bedroom with wardrobe",
  body: "playful park backdrop, soft pastels",
  colors: "rainbow studio backdrop",
  greetings: "school yard entrance, morning light",
  numbers: "playful classroom number wall",
};

const SYSTEM = `
You are the VOCABULARY IMAGE ARCHITECT — an expert children's book illustrator
+ ESL pedagogue. Given ONE vocabulary item, you craft ONE perfect image prompt
that:

  1. Locks the lesson THEME as the backdrop (forest for "wild animals", farm
     for "farm animals", kitchen for vegetables, family room for "family",
     classroom for "school", etc.). If a backdrop hint is supplied, USE IT.
  2. If the word is a CONCRETE NOUN (apple, cat, barn) → render the object as
     the clear hero of the scene, life-like proportions, theme backdrop behind.
     Cast members are OPTIONAL background dressing.
  3. If the word is a VERB / GREETING / ACTION (hello, goodbye, jump, hug) →
     the cast member(s) MUST perform the action in the theme backdrop. Use
     TWO characters for greetings/dialogue. Include comic speech bubbles
     ONLY for greetings/dialogue verbs.
  4. If the word is an ADJECTIVE → show a cast member or object embodying the
     property in the theme backdrop.
  5. NEVER include any text on the image except the requested speech bubble.
  6. Always inject the supplied character look_book lines VERBATIM when a cast
     member is used, so the character looks identical across the lesson.

Return STRICT JSON only. No prose. No markdown. Shape:
{
  "pos": "noun|verb|adjective|phrase|greeting|other",
  "theme_backdrop": "<one short phrase>",
  "composition": "<one sentence framing>",
  "uses_cast": true|false,
  "cast_names": ["..."],
  "image_prompt": "<final prompt to send to the image renderer>"
}
`.trim();

async function sha256Hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    if (!LOVABLE_API_KEY) return json({ error: "LOVABLE_API_KEY not configured" }, 500);

    const body = await req.json().catch(() => ({}));
    const input = body?.input ?? {};
    const word = String(input.word ?? "").trim();
    if (!word) return json({ error: "word is required" }, 400);

    const hub = String(input.hub ?? "playground");
    const cefr = String(input.cefr ?? "A1");
    const theme = String(input.theme ?? "").trim();
    const style = String(input.style ?? "kawaii-chibi-mascot");
    const backdropHint =
      input.backdrop ||
      THEME_BACKDROP[theme.toLowerCase()] ||
      "soft kid-friendly studio backdrop matching the theme";

    const forceRegen = !!body?.force;
    const castSig = [input.castMember?.name, input.partner?.name].filter(Boolean).sort().join("+");
    const cacheKey = await sha256Hex(
      JSON.stringify({ w: word.toLowerCase(), s: style, t: theme.toLowerCase(), h: hub, c: cefr, cast: castSig, b: backdropHint }),
    );

    const sb = SUPABASE_URL && SERVICE_KEY ? createClient(SUPABASE_URL, SERVICE_KEY) : null;

    // 1) Cache hit — return immediately.
    if (sb && !forceRegen) {
      const { data: hit } = await sb
        .from("vocab_image_cache")
        .select("image_url, plan, status")
        .eq("cache_key", cacheKey)
        .maybeSingle();
      if (hit?.status === "ready" && hit.image_url) {
        return json({ plan: hit.plan, url: hit.image_url, cached: true, cache_key: cacheKey });
      }
    }

    // 2) Reserve the row (idempotent upsert) so concurrent calls converge.
    if (sb) {
      await sb.from("vocab_image_cache").upsert(
        {
          cache_key: cacheKey,
          word, style, theme: theme || null, hub, cefr,
          status: "pending",
        },
        { onConflict: "cache_key", ignoreDuplicates: false },
      );
    }

    const castBlock = [
      input.castMember
        ? `LEAD CAST: ${input.castMember.name}${input.castMember.species ? ` the ${input.castMember.species}` : ""}\n  look_book: ${input.castMember.look_book ?? "(none)"}`
        : "LEAD CAST: (none — render the object directly if it is a concrete noun)",
      input.partner
        ? `PARTNER CAST: ${input.partner.name}${input.partner.species ? ` the ${input.partner.species}` : ""}\n  look_book: ${input.partner.look_book ?? "(none)"}`
        : "",
    ].filter(Boolean).join("\n");

    const userPrompt = [
      `WORD: "${word}"`,
      `HUB: ${hub}    CEFR: ${cefr}`,
      `LESSON THEME: ${theme || "(none provided)"}`,
      `BACKDROP HINT: ${backdropHint}`,
      `STYLE KEY: ${style}`,
      "",
      castBlock,
      "",
      "Craft ONE final image_prompt suitable for Nano Banana Pro. Bake in the",
      "backdrop, the character look_book verbatim if a cast member is used,",
      "explicit framing, and the no-text rule.",
    ].join("\n");

    const recordFailure = async (msg: string) => {
      if (!sb) return;
      await sb.rpc as never; // no-op typing
      await sb.from("vocab_image_cache").update({
        status: "failed",
        last_error: msg.slice(0, 500),
        updated_at: new Date().toISOString(),
      }).eq("cache_key", cacheKey);
    };

    const aiRes = await aiFetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.55,
        response_format: { type: "json_object" },
      }),
    });
    if (!aiRes.ok) {
      const detail = await aiRes.text();
      await recordFailure(`ai ${aiRes.status}: ${detail}`);
      return json({ error: "AI call failed", status: aiRes.status, detail, cache_key: cacheKey }, 502);
    }
    const aiJson = await aiRes.json();
    const raw = aiJson?.choices?.[0]?.message?.content ?? "{}";
    let plan: any;
    try { plan = typeof raw === "string" ? JSON.parse(raw) : raw; }
    catch {
      await recordFailure("non-json plan");
      return json({ error: "Architect returned non-JSON", raw: String(raw).slice(0, 600), cache_key: cacheKey }, 502);
    }

    plan.word = word;
    plan.style = style;
    plan.pos ??= "other";
    plan.theme_backdrop ??= backdropHint;
    plan.uses_cast ??= !!input.castMember;
    plan.cast_names ??= [input.castMember?.name, input.partner?.name].filter(Boolean);
    if (!plan.image_prompt) {
      plan.image_prompt = `${plan.composition ?? ""} ${backdropHint}. ${word}.`.trim();
    }

    // Delegate rendering.
    let url: string | null = null;
    let cached = false;
    let renderError: string | null = null;
    try {
      const sb2 = sb ?? createClient(SUPABASE_URL, SERVICE_KEY);
      const { data: imgData, error: imgErr } = await sb2.functions.invoke(
        "generate-playground-images",
        {
          body: {
            subjects: [word],
            style,
            promptOverrides: { [word]: plan.image_prompt },
          },
        },
      );
      if (imgErr) {
        renderError = imgErr.message ?? String(imgErr);
      } else {
        const first = (imgData?.images ?? [])[0];
        url = first?.url ?? null;
        cached = !!first?.cached;
      }
    } catch (e) {
      renderError = e instanceof Error ? e.message : String(e);
    }

    // Persist result — success or failure — so retries are safe.
    if (sb) {
      if (url) {
        await sb.from("vocab_image_cache").update({
          image_url: url,
          image_prompt: plan.image_prompt,
          plan,
          status: "ready",
          last_error: null,
          updated_at: new Date().toISOString(),
        }).eq("cache_key", cacheKey);
      } else {
        await sb.from("vocab_image_cache").update({
          image_prompt: plan.image_prompt,
          plan,
          status: "failed",
          last_error: (renderError ?? "render returned no url").slice(0, 500),
          attempts: 1,
          updated_at: new Date().toISOString(),
        }).eq("cache_key", cacheKey);
      }
    }

    return json({ plan, url, cached, cache_key: cacheKey, error: renderError ?? undefined });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return json({ error: msg }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

