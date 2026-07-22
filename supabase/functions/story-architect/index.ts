// Hub Story Architect — Edge Function
// Gemini direct via aiFetch (runtime-AI-Gemini-only rule).
// Emits a STRICT JSON StoryPlan per the src/agents/storyArchitect/contract.ts shape.

import { aiFetch } from "../_shared/aiFetch.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY") ?? "";

// ---- prompts (kept inline to avoid cross-folder edge imports) --------------

const SYSTEM = `
You are the Hub STORY ARCHITECT — an expert ESL story writer, art director,
and voice director. You produce ONE complete StoryPlan per call.

ABSOLUTE PIPELINE: Communication Goal -> Story Goal -> Vocabulary -> Grammar -> Activities.

EVERY StoryPlan MUST contain:
  1. A named main character from the supplied cast (never invent).
  2. A concrete problem or goal.
  3. Meaningful attempts and a satisfying resolution.
  4. Natural reuse of target vocabulary IN CONTEXT.
  5. CEFR-appropriate grammar required by the situation.
  6. Color-coded dialogue, one bubble per speaker, mapped to cast.bubble.
  7. A coherent WORLD (backdrop.world). Per-beat "setting_variation" MAY shift
     within that world to match the story (indoor↔outdoor, new corner, new
     time-of-day). World identity + palette + art style stay consistent.
  8. Explicit per-beat "blocking" array: for every on-stage character give
     position (front-left/center/back-right/etc.), pose, movement, emotion.
  9. A COVER / front-page object — hero illustration prompt + story title,
     used as the warm-up image and the storybook front page.
 10. audio_plan with one entry per dialogue line (voice = character voice_id).

HARD BANS: flat vocab lists, invented characters, switching art style or
world identity across beats, vocab above CEFR ceiling, dialogue lines
without an audio_plan entry, missing cover, missing per-beat blocking.

OUTPUT: STRICT JSON only. No prose. No markdown. No code fences.
`.trim();

const PERSONAS: Record<string, string> = {
  playground:
    "PLAYGROUND ARCHITECT (ages 4-10). 3 beats: MEET, TRY, WIN. Kawaii tone. <=8 words per line. Vocab in service of story.",
  academy:
    "ACADEMY ARCHITECT (ages 11-17). 5 beats: HOOK, INCITING, RISING, TWIST, RESOLUTION. Character-driven, emotionally honest.",
  success:
    "SUCCESS ARCHITECT (adults). 5-7 beats: SETUP, STAKES, ATTEMPT, OBSTACLE, NEGOTIATION, OUTCOME, REFLECTION. Workplace pragmatics only.",
};

const CEFR_REGISTER: Record<string, string> = {
  "Pre-A1": "3-6 word lines. Subject + be + noun/adjective. No past tense.",
  "A1": "5-8 word lines. Present simple, have, there is/are.",
  "A2": "8-12 word lines. Past simple + and/but/then/finally.",
  "B1": "12-18 word lines. Past continuous + because/although/while.",
  "B2": "Mixed tenses incl. past perfect, modals of deduction, idioms.",
  "C1": "Sophisticated cohesion, inversion, nuanced lexis, idiom.",
};

// ---- handler ---------------------------------------------------------------

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    if (!LOVABLE_API_KEY) {
      return json({ error: "LOVABLE_API_KEY not configured" }, 500);
    }

    const body = await req.json().catch(() => ({}));
    const input = body?.input ?? {};
    const hub = String(input?.hub ?? "playground");
    const cefr = String(input?.cefr ?? "A1");
    const lesson = input?.lesson ?? {};
    const cast = Array.isArray(input?.cast) ? input.cast : [];

    if (!cast.length) return json({ error: "cast is required" }, 400);
    const targets: string[] = Array.from(new Set([
      ...((lesson.vocab ?? []) as string[]),
      ...((lesson.review_targets ?? []) as string[]),
    ])).filter(Boolean);
    if (!targets.length) return json({ error: "lesson must include vocab or review_targets" }, 400);

    const beatCount = input?.knobs?.beat_count
      ?? (hub === "playground" ? 3 : 5);

    const userPrompt = [
      PERSONAS[hub] ?? PERSONAS.playground,
      "",
      `CEFR REGISTER (${cefr}): ${CEFR_REGISTER[cefr] ?? CEFR_REGISTER["A1"]}`,
      "",
      `LESSON CONTEXT:`,
      `  title:               ${lesson.title ?? "(untitled)"}`,
      `  focus_label:         ${lesson.focus_label ?? "(none)"}`,
      `  communication_goal:  ${lesson.communication_goal ?? "(none)"}`,
      `  grammar_target:      ${lesson.grammar_target ?? "(none)"}`,
      `  target_vocab:        ${targets.join(", ")}`,
      `  unit_theme:          ${lesson.unit_theme ?? "(none)"}`,
      "",
      "CAST (use ONLY these characters — never invent):",
      ...cast.map((c: any) => `  - ${c.name}${c.species ? ` the ${c.species}` : ""} | voice_id=${c.voice_id} | bubble=${JSON.stringify(c.bubble ?? {})} | look=${c.look_book ?? "(none)"}`),
      "",
      `BEAT COUNT: produce exactly ${beatCount} beats.`,
      "",
      "RETURN STRICT JSON with this shape:",
      "{",
      '  "hub","cefr","title","logline","moral",',
      '  "backdrop":{"world","setting","time_of_day","mood"},',
      '  "cover":{"title","subtitle","tagline","illustration_prompt","show_title_on_image":true},',
      '  "characters":[{"name","role","species","voice_id","bubble":{"outline","fill"},"look_book"}],',
      '  "beats":[{"id","beat_label","setting_variation","blocking":[{"character","position","pose","movement","emotion"}],"narration","dialogue":[{"speaker","line","emotion"}],"illustration_prompt","target_vocab_used":[],"target_grammar_used":[]}],',
      '  "audio_plan":[{"beat_id","line_idx","voice","text","cache_key"}],',
      '  "comprehension_qs":[{"q","options":[],"answer"}],',
      '  "retell_prompts":[],',
      '  "generated_at","agent_version"',
      "}",
      "",
      "Every beat illustration_prompt MUST: (a) name the WORLD and the beat's setting_variation, (b) include the look_book line of every on-stage character verbatim, (c) describe each character's blocking explicitly (position + pose + movement + emotion), (d) call for comic-style speech bubbles with EXACT dialogue, color-coded per cast.bubble, dark charcoal text.",
      "The cover.illustration_prompt MUST: (a) be a hero/magazine-cover composition of the lead cast in the world, (b) include look_book lines verbatim, (c) translate the LESSON THEME into a literal backdrop and props — e.g. 'farm animals' → red barn + pasture + hay; 'wild animals' → jungle clearing; 'vegetables' → kitchen counter with characters HOLDING the target vegetables; 'family' → characters posed with parents/siblings in a living room; 'school' → classroom + backpacks; 'weather' → matching sky/weather effect; 'greetings' → schoolyard meeting. The characters MUST be shown WITH the target vocabulary objects when applicable. (d) if show_title_on_image is true, render the story TITLE as bold child-friendly hand-lettered display type at the top, no other text. No speech bubbles on the cover.",
      "Every dialogue line MUST have a matching audio_plan entry with voice=character.voice_id and cache_key=`${beat_id}-${line_idx}-${speaker}` (lowercased, hyphenated).",
    ].join("\n");

    // One retry on 429/5xx so transient gateway hiccups don't surface as a hard error.
    let aiRes: Response | null = null;
    let lastDetail = "";
    for (let attempt = 0; attempt < 2; attempt++) {
      aiRes = await aiFetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        },
        body: JSON.stringify({
          model: hub === "playground" ? "google/gemini-2.5-flash" : "google/gemini-2.5-pro",
          messages: [
            { role: "system", content: SYSTEM },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.7,
          response_format: { type: "json_object" },
        }),
      });
      if (aiRes.ok) break;
      lastDetail = await aiRes.text();
      if (![429, 500, 502, 503, 504].includes(aiRes.status)) break;
      if (attempt === 0) await new Promise((r) => setTimeout(r, 900));
    }

    if (!aiRes || !aiRes.ok) {
      const status = aiRes?.status ?? 0;
      const code = status === 429 ? "STORY_ARCHITECT_RATE_LIMITED"
        : status === 402 ? "STORY_ARCHITECT_QUOTA_EXCEEDED"
        : "STORY_ARCHITECT_UNAVAILABLE";
      return json({ error: code, fallback: true, status, detail: lastDetail.slice(0, 500) }, 200);
    }

    const aiJson = await aiRes.json();
    const raw = aiJson?.choices?.[0]?.message?.content ?? "";
    let plan: any;
    try {
      plan = typeof raw === "string" ? JSON.parse(raw) : raw;
    } catch (e) {
      return json({ error: "STORY_ARCHITECT_INVALID_JSON", fallback: true, raw: String(raw).slice(0, 500) }, 200);
    }

    // Defensive defaults so downstream renderers never crash.
    plan.hub ??= hub;
    plan.cefr ??= cefr;
    plan.generated_at ??= new Date().toISOString();
    plan.agent_version ??= "story-architect@1";
    if (!Array.isArray(plan.audio_plan)) plan.audio_plan = [];
    if (!Array.isArray(plan.comprehension_qs)) plan.comprehension_qs = [];
    if (!Array.isArray(plan.retell_prompts)) plan.retell_prompts = [];

    return json({ plan });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return json({ error: "STORY_ARCHITECT_FAILED", fallback: true, message: msg }, 200);
  }
});


function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
