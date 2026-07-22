// Story Director — auto-configures the Story Creator form (title, character,
// theme, layout, prompt) based on the active hub, target vocabulary and the
// available Cast Vault. Returns strict JSON for instant state hydration.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { aiFetch } from "../_shared/aiFetch.ts";
import { parseAIJson, RAW_JSON_INSTRUCTION } from "../_shared/aiJson.ts";

import { requireAuth } from "../_shared/authGuard.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const THEMES = ["Adventure", "School Day", "Mystery", "Business Trip", "Negotiation"] as const;
const LAYOUTS = ["Classic", "Comic", "Case Study"] as const;

type Hub = "playground" | "academy" | "success";

interface CharacterRef { id?: string; name: string; visual_blueprint?: string }

interface ReqBody {
  hub?: Hub | string;
  vocabulary?: string[];
  characters?: CharacterRef[];
  cefrLevel?: string;
  genre?: string;
}

interface DirectorOutput {
  title: string;
  character_name: string;
  theme: typeof THEMES[number];
  layout: typeof LAYOUTS[number];
  prompt: string;
}

function normalizeHub(h?: string): Hub {
  const v = (h || "").toLowerCase();
  if (v === "playground" || v === "kids") return "playground";
  if (v === "success" || v === "professional" || v === "adults") return "success";
  return "academy";
}

function enforceLayout(hub: Hub, layout: string): typeof LAYOUTS[number] {
  if (hub === "success") return "Case Study";
  if (LAYOUTS.includes(layout as typeof LAYOUTS[number])) {
    // Academy/Playground default to Comic if model picked Case Study
    if (layout === "Case Study") return "Comic";
    return layout as typeof LAYOUTS[number];
  }
  return "Comic";
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const _auth = await requireAuth(req, { allowedRoles: ["admin","content_creator","teacher"] });
  if (!_auth.ok) return new Response(JSON.stringify(_auth.body), { status: _auth.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const body = (await req.json()) as ReqBody;
    const hub = normalizeHub(body.hub);
    const vocabulary = (body.vocabulary || []).map((w) => String(w).trim()).filter(Boolean).slice(0, 30);
    const characters = (body.characters || []).filter((c) => c?.name).slice(0, 24);
    const cefr = (body.cefrLevel || "B1").toString();
    const genre = (body.genre || "Everyday Life").toString();

    if (characters.length === 0) {
      return new Response(JSON.stringify({ error: "No characters available in the Cast Vault for this hub." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const characterList = characters
      .map((c, i) => `${i + 1}. ${c.name}${c.visual_blueprint ? ` — ${c.visual_blueprint.slice(0, 160)}` : ""}`)
      .join("\n");

    const systemPrompt = [
      "You are a Story Director for an English-learning platform.",
      "Based on the provided vocabulary words and the target Hub, design a story configuration.",
      "Return a strict JSON object with EXACTLY these keys:",
      "- title: a short, catchy title for the story (max 60 chars).",
      "- character_name: choose the BEST fitting character NAME from the provided Cast Vault list (must match exactly).",
      `- theme: one of ${JSON.stringify(THEMES)}.`,
      `- layout: one of ${JSON.stringify(LAYOUTS)}. Use "Case Study" for the Success hub and "Comic" for Academy/Playground.`,
      "- prompt: a 2-sentence detailed creative prompt that combines the chosen character, the chosen theme, and explicitly instructs the use of the target vocabulary words.",
      RAW_JSON_INSTRUCTION,
    ].join("\n");

    const userPrompt = [
      `Hub: ${hub}`,
      `CEFR level: ${cefr}`,
      `Genre hint: ${genre}`,
      `Target vocabulary (${vocabulary.length}): ${vocabulary.length ? vocabulary.join(", ") : "(none provided — invent age-appropriate vocab)"}`,
      `Available characters from the Cast Vault for this hub:`,
      characterList,
    ].join("\n");

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "AI gateway not configured." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResp = await aiFetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        temperature: 0.8,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!aiResp.ok) {
      const t = await aiResp.text();
      return new Response(JSON.stringify({ error: "AI gateway error", details: t }), {
        status: aiResp.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await aiResp.json();
    const raw = data?.choices?.[0]?.message?.content ?? "";
    const parsed = parseAIJson<Partial<DirectorOutput>>(raw, "ai-story-director");

    // Coerce + validate
    const charNames = characters.map((c) => c.name);
    const matchedCharacter = charNames.find(
      (n) => n.toLowerCase() === String(parsed.character_name || "").toLowerCase().trim(),
    ) ?? characters[0].name;

    const theme = (THEMES as readonly string[]).includes(String(parsed.theme))
      ? (parsed.theme as typeof THEMES[number])
      : (hub === "success" ? "Business Trip" : hub === "playground" ? "Adventure" : "School Day");

    const layout = enforceLayout(hub, String(parsed.layout || ""));

    const result: DirectorOutput = {
      title: (parsed.title || `${theme} with ${matchedCharacter}`).toString().slice(0, 80),
      character_name: matchedCharacter,
      theme,
      layout,
      prompt: (parsed.prompt || `Write a short ${theme.toLowerCase()} story starring ${matchedCharacter}. The story must naturally use these vocabulary words: ${vocabulary.join(", ")}.`).toString(),
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("ai-story-director error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
