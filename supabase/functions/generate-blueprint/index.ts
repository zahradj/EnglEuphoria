// Generate a structured Lesson Blueprint via Lovable AI Gateway.
// Step 1 of the Blueprint-First architecture: the teacher reviews and edits
// this plan BEFORE the full 20+ slide deck is produced by generate-ppp-slides.
//
// Hub-aware: Playground / Academy / Success drives source rules, safety
// bouncer, pedagogy and CEFR window. Also asks the AI to pick ONE of three
// pedagogical frameworks (Discovery / TaskBased / Immersion) and emit the
// resulting `phases` array that the slide generator will follow verbatim.
import {
  buildBlueprintHubBlock,
  FRAMEWORK_DEFAULTS,
  isFramework,
  isPhase,
  normalizeHub,
  type LessonPhase,
  type PedagogicalFramework,
} from "../_shared/hubProfiles.ts";

import { aiFetch } from "../_shared/aiFetch.ts";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const {
      topic,
      target_audience,
      cefr_level = "A2",
      hub = "academy",
      target_hub, // ← preferred new field
      skill_focus = "Mixed Skills",
      source_material = "",
      source_url = "",
      student_user_id = "", // ← NEW: enables SRS-aware blueprint generation
    } = body || {};

    if (!topic || typeof topic !== "string") {
      return new Response(JSON.stringify({ error: "topic is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!target_audience || typeof target_audience !== "string") {
      return new Response(JSON.stringify({ error: "target_audience is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    // Lesson generation is governed by the configured AI providers, not the
    // legacy in-app `user_credits.lesson_credits` gate. Keeping blueprint
    // generation unblocked prevents false "workspace balance exhausted" errors
    // when Google Studio / Lovable AI Gateway balances are available.

    const resolvedHub = normalizeHub(target_hub ?? hub);
    const hubBlock = buildBlueprintHubBlock(resolvedHub, cefr_level);

    // ── SRS: fetch up to 5 items the student must review (silent on failure) ──
    let mandatoryReviewItems: Array<{ item_key: string; item_type: string; mastery_score: number }> = [];
    if (student_user_id && typeof student_user_id === "string") {
      try {
        const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
        const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
        if (SUPABASE_URL && SERVICE_KEY) {
          const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_due_review_items`, {
            method: "POST",
            headers: {
              apikey: SERVICE_KEY,
              Authorization: `Bearer ${SERVICE_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ p_user_id: student_user_id, p_hub: resolvedHub, p_limit: 5 }),
          });
          if (r.ok) {
            const rows = await r.json();
            if (Array.isArray(rows)) mandatoryReviewItems = rows;
          } else {
            console.warn("[SRS] get_due_review_items failed", r.status);
          }
        }
      } catch (e) {
        console.warn("[SRS] lookup error", e);
      }
    }

    const srsBlock = mandatoryReviewItems.length
      ? `\n\nMANDATORY REVIEW ITEMS (Spaced Repetition):
The student previously struggled with these ${mandatoryReviewItems.length} items.
You MUST seamlessly weave AT LEAST 3 of them into the new reading_passage_summary
and re-introduce them in target_vocabulary if they are vocabulary type — even though
today's topic is different. They must feel like natural parts of the story/context.

${mandatoryReviewItems.map((i) => `• "${i.item_key}" (${i.item_type}, mastery ${i.mastery_score}/100)`).join("\n")}`
      : "";


    const systemPrompt = `You are an EXPERT ESL CURRICULUM PLANNER for Engleuphoria.
Your job is to draft a COHESIVE 1-hour lesson BLUEPRINT — the structured plan that a teacher
will review and edit BEFORE the full 20-slide deck is generated.

Hard rules:
• target_vocabulary MUST contain 5–8 distinct words tightly tied to the topic. Each item needs a
  short definition (≤ 12 words) and one natural example sentence (≤ 18 words) using the word.
• target_grammar_rule MUST be ONE focused, teachable structure (e.g. "Past Simple regular verbs",
  "Comparative adjectives with -er/than", "Modal 'should' for advice"). Never list multiple rules.
• grammar_explanation: 1–2 sentence teacher-facing rationale explaining when/why students use it.
• reading_passage_summary: 2–4 sentences describing the Phase-2 passage (genre, scenario, characters)
  WITHOUT writing the passage itself. The passage will reuse every target_vocabulary word.
• final_speaking_mission: ONE concrete production task (≤ 30 words) that requires both the lexicon
  AND the grammar rule.
• lesson_title: short, vivid, classroom-ready (≤ 60 chars).
• pedagogical_framework: pick exactly ONE of "Discovery" | "TaskBased" | "Immersion" — see guide below.
• framework_rationale: 1 sentence (≤ 30 words) explaining why THIS framework fits THIS topic + hub.
• phases: ordered array of lesson phases the slide generator will follow. Use the framework's
  default order (see guide) but you may swap the last 1–2 phases if it improves cohesion.
• video_strategy: pick ONE moment in the lesson where a real YouTube video is the BEST teaching
  tool. Write a highly specific youtube_query that will resolve to a real, safe, hub-appropriate
  clip. Choose target_phase using these rules:
    – If pedagogical_framework = "TaskBased": target_phase MUST be the FIRST phase
      (the hook / impossible task — show real-world execution).
    – If pedagogical_framework = "Discovery": target_phase MUST be a MIDDLE phase
      (Reading or Comprehension — students hunt for the rule in the video).
    – If pedagogical_framework = "Immersion": target_phase MUST be the phase IMMEDIATELY
      AFTER "Vocabulary" (the core immersive story).
  Examples by hub:
    – Playground: "animated cartoon counting apples for kids"
    – Academy:    "short street interview asking for directions in London"
    – Success:    "Steve Jobs negotiation skills short clip"
  rationale: 1 sentence (≤ 25 words) explaining why this clip serves the lesson.

CEFR-align everything to ${cefr_level}, clamped to the hub window above. Tone: warm, professional,
joyful (or hub-appropriate — see hub block). No placeholders.

${hubBlock}

${
      source_material
        ? `IMPORTANT — SOURCE-GROUNDED MODE:
A teacher has provided source material from the web${source_url ? ` (${source_url})` : ""}.
You MUST base the target_vocabulary, target_grammar_rule, and reading_passage_summary
ENTIRELY on this source text. Do NOT invent outside concepts. Pull vocabulary directly
from the source. Identify a grammar rule that genuinely appears in the source. The
reading passage summary should describe a faithful adaptation of this source for
${cefr_level} learners.

If the source material violates the SAFETY rules above, REJECT it: return a blueprint whose
lesson_title starts with "REJECTED:" and explain in framework_rationale why it failed safety.`
        : ""
    }${srsBlock}`;

    const trimmedSource = String(source_material || "").slice(0, 10000);

    const userPrompt = `Topic: ${topic}
Target audience: ${target_audience}
CEFR level: ${cefr_level}
Hub: ${resolvedHub}
Skill focus: ${skill_focus}
${trimmedSource ? `\nSOURCE MATERIAL (ground truth — base the blueprint on this):\n"""\n${trimmedSource}\n"""\n` : ""}
Draft the lesson blueprint now. Pick the best pedagogical framework and emit its phase order.`;

    const tool = {
      type: "function",
      function: {
        name: "emit_blueprint",
        description: "Return the structured lesson blueprint.",
        parameters: {
          type: "object",
          properties: {
            lesson_title: { type: "string" },
            target_vocabulary: {
              type: "array",
              minItems: 5,
              maxItems: 8,
              items: {
                type: "object",
                properties: {
                  word: { type: "string" },
                  definition: { type: "string" },
                  example: { type: "string" },
                },
                required: ["word", "definition", "example"],
                additionalProperties: false,
              },
            },
            target_grammar_rule: { type: "string" },
            grammar_explanation: { type: "string" },
            reading_passage_summary: { type: "string" },
            final_speaking_mission: { type: "string" },
            pedagogical_framework: {
              type: "string",
              enum: ["Discovery", "TaskBased", "Immersion"],
            },
            framework_rationale: { type: "string" },
            phases: {
              type: "array",
              minItems: 4,
              maxItems: 6,
              items: {
                type: "string",
                enum: ["Vocabulary", "Reading", "Comprehension", "Grammar", "Speaking", "Writing"],
              },
            },
            video_strategy: {
              type: "object",
              description:
                "AI-curated YouTube video plan. youtube_query MUST be a highly specific search " +
                "string the YouTube Data API can resolve to a real-world clip. target_phase MUST " +
                "be one of the phases in the phases[] array.",
              properties: {
                youtube_query: { type: "string" },
                target_phase: {
                  type: "string",
                  enum: ["Vocabulary", "Reading", "Comprehension", "Grammar", "Speaking", "Writing"],
                },
                rationale: { type: "string" },
              },
              required: ["youtube_query", "target_phase"],
              additionalProperties: false,
            },
          },
          required: [
            "lesson_title",
            "target_vocabulary",
            "target_grammar_rule",
            "grammar_explanation",
            "reading_passage_summary",
            "final_speaking_mission",
            "pedagogical_framework",
            "framework_rationale",
            "phases",
            "video_strategy",
          ],
          additionalProperties: false,
        },
      },
    } as const;

    // ─── Self-Healing JSON Wrapper ───
    // Up to 3 attempts. On JSON-parse failure or missing tool_call, append a
    // corrective instruction and retry. After 3 fails, return graceful UI error.
    const callGemini = async (extraInstruction: string) => {
      return await aiFetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt + (extraInstruction ? `\n\n${extraInstruction}` : "") },
            { role: "user", content: userPrompt },
          ],
          tools: [tool],
          tool_choice: { type: "function", function: { name: "emit_blueprint" } },
        }),
      });
    };

    const HEAL_INSTRUCTION =
      "CRITICAL: Your last output contained invalid JSON. Ensure all quotes are escaped and brackets are closed.";

    let blueprint: any = null;
    let lastErrorDetail = "";

    for (let attempt = 0; attempt < 3; attempt++) {
      const aiResp = await callGemini(attempt === 0 ? "" : HEAL_INSTRUCTION);

      if (!aiResp.ok) {
        const detail = await aiResp.text();
        if (aiResp.status === 429) {
          return new Response(
            JSON.stringify({ error: "Rate limit reached. Please try again in a moment." }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }
        if (aiResp.status === 402) {
          return new Response(
            JSON.stringify({ error: "AI credits exhausted. Add funds in Settings → Workspace → Usage." }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }
        lastErrorDetail = `gateway ${aiResp.status}: ${detail}`;
        console.error(`[blueprint attempt ${attempt + 1}] gateway error`, aiResp.status);
        continue;
      }

      try {
        const data = await aiResp.json();
        const toolCall = data?.choices?.[0]?.message?.tool_calls?.[0];
        const argsRaw = toolCall?.function?.arguments;
        if (!argsRaw) throw new Error("No tool_call in response");
        blueprint = typeof argsRaw === "string" ? JSON.parse(argsRaw) : argsRaw;
        break; // success
      } catch (e) {
        lastErrorDetail = (e as Error).message;
        console.warn(`[blueprint attempt ${attempt + 1}] JSON parse failed:`, lastErrorDetail);
      }
    }

    if (!blueprint) {
      return new Response(
        JSON.stringify({
          error: "The AI encountered a formatting error. Please try generating again.",
          detail: lastErrorDetail,
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Self-heal: enforce framework + phases sanity, fall back to defaults when invalid.
    const framework: PedagogicalFramework = isFramework(blueprint.pedagogical_framework)
      ? blueprint.pedagogical_framework
      : (resolvedHub === "Playground" ? "Immersion" : resolvedHub === "Success" ? "TaskBased" : "Discovery");

    let phases: LessonPhase[] = Array.isArray(blueprint.phases)
      ? blueprint.phases.filter(isPhase)
      : [];
    // De-duplicate while preserving order.
    phases = Array.from(new Set(phases));
    if (phases.length < 4) phases = FRAMEWORK_DEFAULTS[framework];

    blueprint.target_hub = resolvedHub;
    blueprint.pedagogical_framework = framework;
    blueprint.phases = phases;
    if (typeof blueprint.framework_rationale !== "string" || !blueprint.framework_rationale.trim()) {
      blueprint.framework_rationale = `Default framework for the ${resolvedHub} hub.`;
    }

    // Self-heal video_strategy: must be an object with a real youtube_query and a phase
    // that exists in phases[]. If invalid, build a sensible default from the framework.
    const vs = blueprint.video_strategy;
    const phaseSet = new Set(phases);
    const defaultPhaseForFramework: LessonPhase =
      framework === "TaskBased" ? phases[0]
        : framework === "Discovery" ? (phases[Math.floor(phases.length / 2)] ?? phases[1] ?? phases[0])
        : (phases.find((p, i) => i > 0 && (phases[i - 1] === "Vocabulary")) ?? phases[1] ?? phases[0]);
    const validQuery = vs && typeof vs.youtube_query === "string" && vs.youtube_query.trim().length > 3;
    const validPhase = vs && typeof vs.target_phase === "string" && phaseSet.has(vs.target_phase as LessonPhase);
    blueprint.video_strategy = {
      youtube_query: validQuery
        ? String(vs.youtube_query).trim()
        : `${blueprint.lesson_title || topic} short video for ${resolvedHub.toLowerCase()} learners`,
      target_phase: validPhase ? vs.target_phase : defaultPhaseForFramework,
      rationale: typeof vs?.rationale === "string" ? vs.rationale : `Authentic ${resolvedHub} listening input.`,
    };

    // Detect a model-side safety rejection.
    if (typeof blueprint.lesson_title === "string" && blueprint.lesson_title.startsWith("REJECTED:")) {
      return new Response(
        JSON.stringify({
          error:
            "This source material did not pass our safety check for the selected hub. Please try a different topic or source.",
          rejection_reason: blueprint.framework_rationale,
        }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (
      !blueprint.lesson_title ||
      !Array.isArray(blueprint.target_vocabulary) ||
      blueprint.target_vocabulary.length < 3 ||
      !blueprint.target_grammar_rule ||
      !blueprint.reading_passage_summary ||
      !blueprint.final_speaking_mission
    ) {
      return new Response(
        JSON.stringify({ error: "Blueprint missing required fields. Please retry." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(JSON.stringify({ blueprint }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-blueprint error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
