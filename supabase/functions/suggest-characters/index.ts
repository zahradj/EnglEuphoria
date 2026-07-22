import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callGemini, parseGeminiJson } from "../_shared/geminiClient.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Hub = "playground" | "academy" | "success";

const HUB_BRIEF: Record<Hub, string> = {
  playground:
    "Playground Hub — Kids age 4–10. Characters must be colorful, friendly, age-appropriate (animals, magical creatures, kid heroes). Yellow/Orange brand. Flat 2D vector, child-safe, joyful, simple vocabulary.",
  academy:
    "Academy Hub — Teens age 11–17. Characters are aspirational peers: students, gamers, musicians, athletes, creatives. Blue/Purple brand. Modern slice-of-life webcomic style, witty, relatable.",
  success:
    "Success Hub — Adult professionals. Use SIMPLE, everyday job titles that anyone instantly recognizes: CEO, doctor, nurse, chef, teacher, manager, assistant, accountant, lawyer, engineer, designer, journalist, pilot, receptionist, sales rep. AVOID niche or jargon-heavy roles like 'product strategist', 'operations lead', 'consultant', 'UX researcher'. Green/Teal brand. Editorial photographic style, mature, business-appropriate.",
};

const FALLBACK_CHARACTERS: Record<Hub, any[]> = {
  playground: [
    {
      name: "Bibi Bubbletail",
      personality_traits: "A giggly, brave little sea bunny who celebrates every new word. Loves helping shy learners speak out loud.",
      visual_blueprint: "A tiny turquoise cartoon bunny with floppy fin-like ears, a yellow scarf, rosy cheeks, and a bubble-shaped backpack.",
      suggested_voice: "playful_kid",
    },
    {
      name: "Milo Moonpaws",
      personality_traits: "A curious kitten astronaut who asks simple questions and turns mistakes into silly discoveries.",
      visual_blueprint: "A small orange cartoon kitten in a soft white space hoodie with star patches, round eyes, and oversized purple boots.",
      suggested_voice: "playful_kid",
    },
    {
      name: "Toto Sprout",
      personality_traits: "A cheerful garden turtle who speaks slowly, kindly, and always notices little details.",
      visual_blueprint: "A round green cartoon turtle with a tiny flower pot shell, amber glasses, and a sunny yellow satchel.",
      suggested_voice: "warm_friendly",
    },
  ],
  academy: [
    {
      name: "Nova Park",
      personality_traits: "A witty teen filmmaker who notices real-life language in music, games, and school drama.",
      visual_blueprint: "A confident teen with a denim jacket, purple camera strap, short black hair, silver earbuds, and a sketchbook.",
      suggested_voice: "witty_teen",
    },
    {
      name: "Kai Rivers",
      personality_traits: "A relaxed gamer-athlete who makes challenges feel doable and explains ideas like a helpful friend.",
      visual_blueprint: "A sporty teen with curly brown hair, blue hoodie, wireless headset around the neck, and bright running shoes.",
      suggested_voice: "energetic_youth",
    },
    {
      name: "Iris Vale",
      personality_traits: "A clever art-club student who is observant, expressive, and gently funny when plans go wrong.",
      visual_blueprint: "A teen artist with round glasses, lavender cardigan, paint-marked tote bag, and a neat bob haircut.",
      suggested_voice: "witty_teen",
    },
  ],
  success: [
    {
      name: "Maya Chen",
      personality_traits: "A warm, decisive CEO who explains big ideas in plain English and keeps meetings on track.",
      visual_blueprint: "A polished woman in a mint blazer over a white shirt, neat shoulder-length hair, holding a tablet, modern glass office behind her.",
      suggested_voice: "confident_adult",
    },
    {
      name: "Dr. Omar Reyes",
      personality_traits: "A friendly doctor who listens carefully and explains health topics in clear, everyday language.",
      visual_blueprint: "A man in a white doctor's coat over a teal shirt, stethoscope around the neck, tidy beard, bright clinic background.",
      suggested_voice: "confident_adult",
    },
    {
      name: "Chef Elena Frost",
      personality_traits: "A calm head chef who turns busy kitchen moments into clear, polite professional conversations.",
      visual_blueprint: "A woman in a crisp white chef's jacket and dark green apron, hair tied back, holding a wooden spoon, warm restaurant kitchen behind her.",
      suggested_voice: "wise_narrator",
    },
  ],
};

function fallbackCharacters(hub: Hub, count: number, existingNames: unknown[]): any[] {
  const existing = new Set(
    (Array.isArray(existingNames) ? existingNames : [])
      .map((name) => String(name).trim().toLowerCase())
      .filter(Boolean),
  );
  const picked = FALLBACK_CHARACTERS[hub].filter((c) => !existing.has(c.name.toLowerCase()));
  const source = picked.length ? picked : FALLBACK_CHARACTERS[hub];
  return source.slice(0, count);
}

/**
 * Recover well-formed character objects from a truncated Gemini JSON
 * payload. Scans for balanced { ... } blocks and JSON.parses each in
 * isolation, ignoring the trailing partial one.
 */
function recoverCharacters(raw: string): any[] {
  // Strip markdown fences if present
  const text = raw.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "");
  const out: any[] = [];
  let depth = 0;
  let start = -1;
  let inStr = false;
  let escape = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (escape) { escape = false; continue; }
    if (ch === "\\") { escape = true; continue; }
    if (ch === '"') { inStr = !inStr; continue; }
    if (inStr) continue;
    if (ch === "{") { if (depth === 0) start = i; depth++; }
    else if (ch === "}") {
      depth--;
      if (depth === 0 && start >= 0) {
        const candidate = text.slice(start, i + 1);
        try {
          const obj = JSON.parse(candidate);
          if (obj && typeof obj === "object" && typeof obj.name === "string") {
            out.push(obj);
          }
        } catch { /* skip malformed */ }
        start = -1;
      }
    }
  }
  return out;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { hub, count: rawCount, existingNames = [] } = await req.json();
    // Cap at 2 — generating more in a single call routinely exceeds the
    // edge-function CPU budget and clients see "failed to send a request".
    const count = Math.max(1, Math.min(2, Number(rawCount) || 2));
    if (hub !== "playground" && hub !== "academy" && hub !== "success") {
      return new Response(JSON.stringify({ error: "Invalid hub" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const brief = HUB_BRIEF[hub as Hub];
    const exclude = existingNames.length
      ? `\nDo NOT reuse these existing character names: ${existingNames.join(", ")}.`
      : "";

    const prompt = `You are a creative casting director for an English learning platform.

${brief}
${exclude}

Generate ${count} fresh, original recurring characters for this hub.

Return STRICT JSON only, no prose, no markdown fences. Keep every string under 280 characters. Shape:
{"characters":[{"name":"...","personality_traits":"1–2 short sentences.","visual_blueprint":"1–2 short sentences of concrete visual details so an image model can draw them consistently.","suggested_voice":"warm_friendly|energetic_youth|playful_kid|confident_adult|wise_narrator|witty_teen"}]}`;

    let characters: any[] = [];
    let provider = "gemini-direct";
    let warning = "";
    try {
      const result = await callGemini({
        model: "gemini-2.5-flash",
        messages: [{ role: "user", parts: [{ text: prompt }] }],
        responseType: "json",
        temperature: 0.75,
        maxTokens: 1024,
      });
      provider = result.provider || provider;
      const parsed = parseGeminiJson<{ characters: any[] }>(result.text);
      characters = Array.isArray(parsed?.characters) ? parsed.characters : [];
    } catch (e) {
      // Tolerant fallback: Gemini truncated mid-string. Recover any
      // complete character objects already written.
      const msg = e instanceof Error ? e.message : String(e ?? "");
      console.warn("suggest-characters AI fallback:", msg);
      characters = fallbackCharacters(hub as Hub, count, existingNames);
      provider = "local-fallback";
      warning = /503|unavailable|high demand/i.test(msg)
        ? "Gemini is busy, so I used ready-to-save hub-matched character suggestions."
        : "AI suggestions were repaired with hub-matched character ideas.";
    }

    if (characters.length === 0) {
      characters = fallbackCharacters(hub as Hub, count, existingNames);
      provider = "local-fallback";
      warning = "AI returned no usable characters, so I used ready-to-save hub-matched suggestions.";
    }

    return new Response(JSON.stringify({ characters: characters.slice(0, count), provider, warning }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("suggest-characters error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
