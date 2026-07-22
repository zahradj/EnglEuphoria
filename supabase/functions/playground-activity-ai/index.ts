// playground-activity-ai
// Generates a structured `config` JSON for a Playground Creator activity / game block.
// Called from src/pages/playground-creator/inspector/ActivityTab.tsx
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { aiFetch } from "../_shared/aiFetch.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SYSTEM = `You are an activity designer for a young-learner (Pre-A1 → A2) English Playground lesson.

You will receive a JSON payload:
{
  activity_type, topic, vocab, cefr, instructions,
  context: {
    lesson_number, objective, grammar_target, sentence_frame,
    phonic, ace_role, page_label, page_phase
  },
  current_config
}

Use EVERY field of context to ground the activity:
- "objective" tells you what the child must be able to DO after this activity.
- "grammar_target" + "sentence_frame" tell you the exact pattern to drill (e.g. "It is a ___.").
- "vocab" is the ONLY word pool you may use (no off-topic words).
- "phonic" (if present) tells you the focus letter/sound for phonics activities.
- "page_phase" tells you the pedagogical moment (warmup, modeling, practice, review…) — adjust difficulty: warmup = recognition, practice = recall, review = production.
- "ace_role" hints at Activate / Connect / Express weighting.
- Honor any free-text "instructions" from the author.

Return ONLY a single JSON object — no prose, no markdown fences — that fits the requested activity_type.

Schemas:
- multiple:       { "prompt": string, "options": string[], "answer": string }
- match:          { "prompt": string, "pairs": [{ "left": string, "right": string }] }
- fill:           { "prompt": string, "sentence": string, "answer": string, "options": string[] }
- memory:         { "prompt": string, "pairs": [{ "id": string, "label": string, "emoji": string }] }
- tap_order:      { "prompt": string, "items": [{ "label": string, "emoji": string }] }
- sort:           { "prompt": string, "buckets": [{ "id": string, "label": string, "emoji": string }], "items": [{ "label": string, "bucket": string, "emoji": string }] }
- word_builder:   { "prompt": string, "word": string, "extras": string[] }
- sound_blend:    { "prompt": string, "word": string, "sounds": string[] }
- missing_letter: { "prompt": string, "word": string, "missing_letter": string, "missing_position": number }
- phonics_hunt:   { "prompt": string, "letter": string, "items": [{ "word": string, "has_letter": boolean }] }
- trace:          { "prompt": string, "letter": string, "word": string, "phoneme": string }
- balloon_pop:    { "prompt": string, "targetSound": string, "associatedWords": string[], "balloonColor": "bg-pink-400"|"bg-amber-400"|"bg-sky-400"|"bg-emerald-400" }
- family_tree:    { "prompt": string, "themeColor": string, "members": [{ "role": "man"|"woman"|"boy"|"girl"|"baby", "label": string }] }
- echo:           { "prompt": string, "word": string }
- speaking_mission: { "prompt": string }
- storybook:      { "prompt": string, "scenes": [{ "text": string, "taps": string[] }] }
- pedagogy_contract: { "communication_goal": string, "grammar_target": string, "focus_label": string, "sentence_models": string[] }

Rules:
- Vocabulary AT OR BELOW the requested CEFR — Pre-A1/A1 means concrete, picturable, ≤ 1-2 syllables when possible.
- Use ONLY words from the provided vocab list.
- If a sentence_frame exists and the activity carries a sentence (fill, multiple, speaking_mission), the sentence MUST follow that exact frame with one vocab word in the blank.
- For phonics activities, the phonic.letter / phonic.sound is binding — every word must demonstrate it.
- 3–6 items max. No abstract language. No idioms.
- The "prompt" must be a short, kid-friendly instruction (≤ 8 words) tied to the lesson objective.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const {
      activity_type,
      topic = "",
      vocab = [],
      cefr = "Pre-A1",
      instructions = "",
      context = {},
      current_config = {},
    } = await req.json();

    if (!activity_type) {
      return new Response(JSON.stringify({ error: "activity_type required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userPayload = JSON.stringify({
      activity_type,
      topic,
      vocab,
      cefr,
      instructions,
      context,
      current_config,
    });

    const res = await aiFetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: userPayload },
        ],
      }),
    });

    if (!res.ok) {
      const txt = await res.text();
      return new Response(JSON.stringify({ error: `AI ${res.status}: ${txt}` }), {
        status: res.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const json = await res.json();
    const raw = json?.choices?.[0]?.message?.content ?? "{}";
    let config: any = {};
    try {
      config = typeof raw === "string" ? JSON.parse(raw) : raw;
    } catch {
      config = { _raw: raw };
    }
    return new Response(JSON.stringify({ config }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(
      JSON.stringify({ error: e?.message ?? "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
