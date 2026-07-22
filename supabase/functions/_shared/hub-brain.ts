// Shared runtime for the 3 hub-specific brain edge functions.
// - CORS
// - Input validation (CEFR/hub gate)
// - aiFetch-based JSON generation with the hardcoded persona prompt
// - Per-hub violation policy: Playground sanitizes; Academy/Success repair-then-422

import { aiFetch } from "./aiFetch.ts";
import { requireAuth } from "./authGuard.ts";
import {
  HUB_VIOLATION_POLICY,
  HUB_WHITELIST,
  sanitizeHubLesson,
  type HubId,
  validateHubWhitelist,
  type WhitelistReport,
} from "./hubWhitelist.ts";
import { buildPreA1Directive } from "./prea1Directive.ts";
import { buildGrammarDirective, resolveGrammarFromMatrix } from "./grammarMatrix.ts";
import { buildPosDirective } from "./posValidator.ts";
import { buildStorybookDirective } from "./storybookDirective.ts";
import { buildHubCefrPreamble, type Cefr, type Hub } from "./pedagogy/index.ts";
import { buildExpertTeacherPreamble } from "./expertTeacherPreamble.ts";
import { buildPedagogySkillsBlock } from "./pedagogySkills.ts";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const HUB_CEFR_RANGE: Record<HubId, ReadonlyArray<string>> = {
  playground: ["Pre-A1", "A1", "A2", "B1"],
  academy: ["Pre-A1", "A1", "A2", "B1", "B2", "C1"],
  success: ["Pre-A1", "A1", "A2", "B1", "B2", "C1"],
};

export interface BrainInput {
  unit_id?: string;
  lesson_id?: string;
  cefr: string;
  topic: string;
  lesson_kind?: string;
  /** Playground only: when set, regenerate only this lesson within the locked 7-lesson template. */
  target_lesson_number?: number;
  learner_profile?: unknown;
  /** Curriculum-bound pedagogy context (optional but recommended). */
  grammar_focus?: string[];
  vocab_focus?: string[];
  communication_goal?: string;
  review_targets?: string[];
  /** Backdrop world hint (e.g. "Space", "Kitchen", "Forest"). Binds story setting + image prompts. */
  unit_theme?: string;
  /** Human-friendly scene phrase derived from unit_theme (e.g. "in a deep-space rocket"). */
  scene_phrase?: string;
}

export interface BrainResult {
  hub: HubId;
  lesson: unknown;
  whitelist: WhitelistReport;
  repaired: boolean;
  sanitized?: { removed: number; removedTypes: string[] };
}

export interface BrainOptions {
  /**
   * OpenAI/Gemini `response_format`. When provided, structured-outputs is used
   * (e.g. Playground passes a strict json_schema). When omitted, falls back to
   * `{ type: "json_object" }`.
   */
  responseFormat?: unknown;
  validateResult?: (lesson: unknown) => { ok: true } | { ok: false; message: string };
  buildResultRepairPrompt?: (message: string) => string;
  buildFallbackResult?: (body: BrainInput, message: string) => unknown;
  transformResult?: (lesson: unknown, body: BrainInput) => unknown;
}

function escapeRawWhitespaceInStrings(s: string): string {
  let out = "", inStr = false, esc = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (esc) { out += c; esc = false; continue; }
    if (c === "\\") { out += c; esc = true; continue; }
    if (c === '"') { inStr = !inStr; out += c; continue; }
    if (inStr) {
      if (c === "\n") { out += "\\n"; continue; }
      if (c === "\r") { out += "\\r"; continue; }
      if (c === "\t") { out += "\\t"; continue; }
    }
    out += c;
  }
  return out;
}

function parseLesson(raw: string): unknown {
  let s = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
  // Slice to outermost JSON object/array
  const start = s.search(/[\{\[]/);
  if (start > 0) s = s.slice(start);
  const openCh = s[0];
  const closeCh = openCh === "[" ? "]" : "}";
  const lastClose = s.lastIndexOf(closeCh);
  if (lastClose > 0) s = s.slice(0, lastClose + 1);
  try {
    return JSON.parse(s);
  } catch {
    // Strip control chars + trailing commas + escape raw newlines/tabs inside strings
    let cleaned = s.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "")
      .replace(/,(\s*[}\]])/g, "$1");
    cleaned = escapeRawWhitespaceInStrings(cleaned);
    try {
      return JSON.parse(cleaned);
    } catch {
      // Auto-balance braces/brackets for truncated outputs
      let opens = 0, opensB = 0, inStr = false, esc = false;
      for (let i = 0; i < cleaned.length; i++) {
        const c = cleaned[i];
        if (esc) { esc = false; continue; }
        if (c === "\\") { esc = true; continue; }
        if (c === '"') { inStr = !inStr; continue; }
        if (inStr) continue;
        if (c === "{") opens++;
        else if (c === "}") opens--;
        else if (c === "[") opensB++;
        else if (c === "]") opensB--;
      }
      if (inStr) cleaned += '"';
      // Trim trailing partial property like `,"foo":` or `,"foo"`
      cleaned = cleaned.replace(/,\s*"[^"]*"\s*:?\s*$/g, "");
      cleaned = cleaned.replace(/,\s*$/g, "");
      while (opensB-- > 0) cleaned += "]";
      while (opens-- > 0) cleaned += "}";
      return JSON.parse(cleaned);
    }
  }
}


async function callBrain(args: {
  systemPrompt: string;
  userPrompt: string;
  responseFormat?: unknown;
}): Promise<unknown> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

  const doCall = async (system: string, user: string): Promise<string> => {
    const res = await aiFetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        response_format: args.responseFormat ?? { type: "json_object" },
        max_tokens: 12000,
      }),
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(`brain ai call failed: ${res.status} ${txt.slice(0, 240)}`);
    }
    const json = await res.json();
    if (json && json.error === true) {
      const err: any = new Error(json.message || "AI provider overloaded");
      err._overloaded = !!json.overloaded;
      throw err;
    }
    const content =
      json?.choices?.[0]?.message?.content ??
      json?.candidates?.[0]?.content?.parts?.[0]?.text ??
      "";
    if (!content) throw new Error("brain ai returned empty content");
    return content as string;
  };

  const STRICT_JSON_REMINDER =
    "\n\nCRITICAL: Return STRICT valid JSON only. Escape every internal double quote inside string values as \\\". Escape newlines as \\n. Never include unescaped \" inside a string. No trailing commas. No comments. No markdown fences.";

  const first = await doCall(args.systemPrompt + STRICT_JSON_REMINDER, args.userPrompt);
  try {
    return parseLesson(first);
  } catch (e1) {
    const msg = e1 instanceof Error ? e1.message : String(e1);
    console.warn(`[hub-brain] parse_failed, retrying with strict repair: ${msg}`);
    const repairUser =
      `The previous JSON was malformed (${msg}). Re-emit the SAME lesson as STRICT valid JSON. ` +
      `Escape every internal double quote as \\\". Escape newlines as \\n. No trailing commas. No markdown. ` +
      `Original request:\n\n${args.userPrompt}`;
    const second = await doCall(args.systemPrompt + STRICT_JSON_REMINDER, repairUser);
    return parseLesson(second);
  }
}



function validateInput(hub: HubId, body: BrainInput): { ok: true } | { ok: false; error: string } {
  if (!body || typeof body !== "object") return { ok: false, error: "missing body" };
  if (!body.topic || typeof body.topic !== "string") return { ok: false, error: "topic required" };
  if (!body.cefr || typeof body.cefr !== "string") return { ok: false, error: "cefr required" };
  if (!HUB_CEFR_RANGE[hub].includes(body.cefr)) {
    return {
      ok: false,
      error: `CEFR ${body.cefr} is not allowed for hub ${hub} (allowed: ${HUB_CEFR_RANGE[hub].join(", ")}).`,
    };
  }
  return { ok: true };
}

function safePreamble(hub: HubId, cefr: string): string {
  try {
    return buildHubCefrPreamble(hub as Hub, cefr as Cefr);
  } catch {
    return ""; // pedagogy module may not cover every cefr/hub combo — fail open
  }
}

function buildUserPrompt(hub: HubId, body: BrainInput): string {
  // Curriculum Brain: derive goal + grammar from the Topic×CEFR matrix when caller
  // didn't provide them. This guarantees grammar varies per unit and matches the
  // communicative objective instead of repeating "It is a..." everywhere.
  const resolved = resolveGrammarFromMatrix(body.topic, body.cefr);
  const effectiveGoal = body.communication_goal?.trim() || resolved.communicationGoal;
  const effectiveGrammar = body.grammar_focus?.length ? body.grammar_focus : resolved.grammar;
  const preamble = safePreamble(hub, body.cefr);
  const expertPreamble = buildExpertTeacherPreamble({
    hub,
    cefr: body.cefr,
    unitTopic: body.topic,
    unitId: body.unit_id,
    lessonId: body.lesson_id,
    targetLessonNumber: body.target_lesson_number ?? null,
  });
  const pedagogyBlock = buildPedagogySkillsBlock(hub, body.cefr);
  const grammarDirective = buildGrammarDirective(body.topic, body.cefr, effectiveGoal, effectiveGrammar);
  const posDirective = buildPosDirective(body.vocab_focus ?? []);
  const storybookDirective = buildStorybookDirective(
    body.topic,
    body.cefr,
    effectiveGoal,
    body.vocab_focus ?? [],
    effectiveGrammar,
  );

  const pipelineDirective = [
    `=== CURRICULUM BRAIN — GENERATION PIPELINE (BINDING ORDER) ===`,
    `You MUST resolve fields in this exact order. Do NOT pick vocabulary first.`,
    `  1. unit_theme              (single coherent world — never mix "school" + "family")`,
    `  2. cefr                    (already fixed: ${body.cefr})`,
    `  3. communication_goal      (what the learner can SAY after the lesson)`,
    `  4. grammar_target          (the structure that enables the goal)`,
    `  5. story_goal              (Character → Problem → Resolution arc for L4 storybook)`,
    `  6. vocabulary              (chosen to FEED the grammar + story, not invented first)`,
    `  7. activities              (must let the learner USE grammar + vocab to hit the goal)`,
    `  8. assessment              (checks the SAME grammar in the SAME topic)`,
    `Every lesson object MUST emit unit_theme, communication_goal, grammar_target, story_goal BEFORE vocab.`,
    `Vocabulary that does not serve the grammar_target or story_goal is FORBIDDEN.`,
    `=== END PIPELINE ===`,
  ].join("\n");

  const themeVal = body.unit_theme?.trim();
  const sceneVal = body.scene_phrase?.trim();
  const themeDirective = themeVal
    ? [
        `=== BACKDROP WORLD (BINDING) ===`,
        `unit_theme: "${themeVal}"${sceneVal ? ` — scene phrase: "${sceneVal}"` : ""}.`,
        `EVERY story scene, character setting, sentence_model context, example sentence, and image_prompt MUST take place inside this world.`,
        `Do NOT default to a generic classroom/park. If unit_theme is "Space", characters are astronauts on a rocket/planet. If "Kitchen", they are at a stove/market. If "Forest", they are among trees/animals.`,
        `Reject vocab/story content that cannot be depicted inside "${themeVal}".`,
        `=== END BACKDROP WORLD ===`,
      ].join("\n")
    : "";

  const curriculumLines = [
    `Unit theme (single coherent world): ${themeVal || body.topic}`,
    themeVal && themeVal !== body.topic ? `Unit topic (language focus): ${body.topic}` : "",
    sceneVal ? `Scene phrase (use in image prompts + story setting): ${sceneVal}` : "",
    `Communication goal: ${effectiveGoal}`,
    `Grammar target (must teach): ${effectiveGrammar.join(", ")}`,
    body.vocab_focus?.length ? `Target vocabulary (must feed grammar + story): ${body.vocab_focus.join(", ")}` : "",
    body.review_targets?.length ? `Review targets (recycle): ${body.review_targets.join(", ")}` : "",
  ].filter(Boolean);


  if (hub === "playground") {
    const targetN = Number.isFinite(body.target_lesson_number as number)
      ? Number(body.target_lesson_number)
      : null;
    return [
      expertPreamble,
      pedagogyBlock,
      preamble,
      pipelineDirective,
      grammarDirective,
      posDirective,
      storybookDirective,
      themeDirective,


      "",
      `Hub: playground`,
      `CEFR: ${body.cefr}`,
      `Unit topic: ${body.topic}`,
      body.lesson_kind ? `Lesson archetype focus: ${body.lesson_kind}` : "",
      ...curriculumLines,
      body.learner_profile ? `Learner profile: ${JSON.stringify(body.learner_profile)}` : "",
      "",
      `Generate ONE complete Playground UNIT CONTENT JSON object for the locked 7-lesson template.`,
      `Return the root object directly as { "unit_topic": string, "unit_theme": string, "unit_topics": { "l1": string, "l2": string, "l3": string }, "lessons": [...] }.`,
      `Do NOT return a single lesson. Do NOT wrap the answer in { "lesson": ... }. Do NOT emit slides, image_url, audio_url, activities, blocks, or layout fields.`,
      `The lessons array MUST contain exactly 7 objects with lesson_number 1 through 7.`,
      targetN && targetN >= 1 && targetN <= 7
        ? `FOCUS: The caller is regenerating lesson ${targetN}. Spend extra effort on lesson ${targetN}, BUT still emit a COMPLETE valid 7-lesson unit. Do NOT emit minimal stubs; the validator requires full lesson objects for L1-L4, complete L1-L3 vocab/phonics, and valid L4 story reuse.`
        : "",
      `All vocabulary, phonics, and story content MUST stay within the curriculum context above — do not invent off-syllabus targets.`,
      `Lesson objects 1–4 MUST include "unit_theme", "communication_goal", "grammar_target", "story_goal", AND "focus_label" (2–6 word distinct title) fields BEFORE their "vocab" array. Lessons missing these fields will be rejected.`,
      `Lessons 1–4 MUST ALSO include: "objectives" (array of 2–3 can-do statements), "key_phrases" (array of 3–6 target chunks drawn from sentence_models), and "success_check" (single-line exit-ticket string). Empty arrays/strings = HARD reject.`,
      `Every slide, activity, and sentence_model inside lesson N MUST visibly advance that lesson's focus_label — off-label filler is rejected.`,
      `Obey the LESSON ROLE RECIPES in the contract: L1 introduces NEW vocab, L2 recycles L1 with no new headwords, L3 is a communicative task, L4 storybook uses ONLY L1–L3 vocab.`,
      `LOCKED PHASE STRUCTURE: L1 MUST generate content for warm-up, vocabulary, modeling, phonics, sentence, spelling. L2 MUST generate warm-up, vocab refresher, modeling, phonics, sentence, practice, listening, spelling. L3 MUST generate warm-up, vocab refresher, communicative modeling, phonics, sentence, roleplay/game, spelling. L4 MUST be story first, then story vocabulary, phonics review, story video, look-and-say, retell, story review. L5 reviews everything from L1-L4. L6 is the 80% mastery quiz. L7 is stretch/remediation only after failed quiz.`,
      `SMART MODELING RULE: If the topic/goal is greetings, introductions, politeness, classroom routines, feelings, or another formulaic communication goal, modeling MUST be a short cast conversation/video/song model and grammar_target MUST be a lexical chunk such as "My name is ___" — never force "It is a ___" onto greetings. Use grammar charts only for object/description topics.`,
      `Lesson 4 storybook MUST obey the STORYBOOK BRAIN directive above: real character, real problem, real resolution — never a vocabulary list disguised as a story.`,
      `Across L1–L4 the four "focus_label" values MUST be DISTINCT and each must reflect that lesson's communication_goal (not the unit topic).`,


    ]
      .filter(Boolean)
      .join("\n");
  }

  return [
    expertPreamble,
    pedagogyBlock,
    preamble,
    pipelineDirective,
    grammarDirective,
    posDirective,
    storybookDirective,
    themeDirective,


    "",
    `Hub: ${hub}`,
    `CEFR: ${body.cefr}`,
    `Topic: ${body.topic}`,
    body.lesson_kind ? `Lesson kind: ${body.lesson_kind}` : "",
    body.unit_id ? `Unit: ${body.unit_id}` : "",
    body.lesson_id ? `Lesson: ${body.lesson_id}` : "",
    ...curriculumLines,
    "",
    `Generate a complete lesson JSON for this hub. Remember: every "type" you emit MUST be in the ALLOWED list. Allowed types: ${[
      ...HUB_WHITELIST[hub],
    ].join(", ")}.`,
    curriculumLines.length
      ? `Stay strictly within the curriculum context above — grammar, vocabulary, and communication goal are binding.`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}


function buildRepairPrompt(hub: HubId, offending: string[]): string {
  return [
    `Your previous lesson contained these forbidden "type" values for the ${hub} hub: ${offending.join(", ")}.`,
    `Regenerate the COMPLETE lesson JSON. Replace each forbidden activity with an equivalent activity whose "type" is in: ${[
      ...HUB_WHITELIST[hub],
    ].join(", ")}.`,
    `Do not include any other types. Return only the JSON object.`,
  ].join("\n");
}

function isProviderOverload(err: unknown, msg: string): boolean {
  if (!!(err as any)?._overloaded) return true;
  // Match EITHER a retryable status code OR a known overload phrase.
  // Previous version required BOTH, which let raw "Failover (gemini-direct) failed: 503 ..."
  // strings slip through as generic 500s.
  if (/\b(429|503|502|504)\b/.test(msg)) return true;
  return /(high demand|overload|overloaded|unavailable|UNAVAILABLE|try again later|temporar|rate limit|Failover|gemini-direct|gateway.*failed)/i.test(
    msg,
  );
}

export async function handleBrainRequest(
  hub: HubId,
  brainPrompt: string,
  req: Request,
  options: BrainOptions = {},
): Promise<Response> {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const auth = await requireAuth(req, {
    allowedRoles: ["admin", "content_creator", "teacher"],
  });
  if (!auth.ok) {
    return new Response(JSON.stringify(auth.body), {
      status: auth.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: BrainInput;
  try {
    body = (await req.json()) as BrainInput;
  } catch {
    return new Response(JSON.stringify({ error: "invalid_json" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const v = validateInput(hub, body);
  if (!v.ok) {
    return new Response(JSON.stringify({ error: "invalid_input", message: v.error }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const isPreA1 = body.cefr === "Pre-A1";
  const systemPrompt = isPreA1
    ? `${buildPreA1Directive(hub)}\n\n${brainPrompt}`
    : brainPrompt;
  const userPrompt = buildUserPrompt(hub, body);
  const policy = HUB_VIOLATION_POLICY[hub];

  try {
    let lesson = await callBrain({
      systemPrompt,
      userPrompt,
      responseFormat: options.responseFormat,
    });
    if (options.transformResult) lesson = options.transformResult(lesson, body);
    const initialValidation = options.validateResult?.(lesson);
    if (initialValidation && !initialValidation.ok) {
      const repairUser = `${userPrompt}\n\n---STRUCTURE REPAIR---\n${
        options.buildResultRepairPrompt?.(initialValidation.message) ?? initialValidation.message
      }`;
      lesson = await callBrain({
        systemPrompt,
        userPrompt: repairUser,
        responseFormat: options.responseFormat,
      });
      if (options.transformResult) lesson = options.transformResult(lesson, body);
      const repairedValidation = options.validateResult?.(lesson);
      if (repairedValidation && !repairedValidation.ok) {
        throw new Error(`brain returned invalid ${hub} payload after repair: ${repairedValidation.message}`);
      }
    }
    let report = validateHubWhitelist(hub, lesson);
    let repaired = false;
    let sanitized: BrainResult["sanitized"];

    if (!report.ok) {
      if (policy === "sanitize") {
        // Playground: strip banned blocks. The 4-year-old never sees them.
        const out = sanitizeHubLesson(hub, lesson);
        lesson = out.lesson;
        sanitized = { removed: out.removed, removedTypes: out.removedTypes };
        report = validateHubWhitelist(hub, lesson);
        repaired = out.removed > 0;
      } else {
        // Academy / Success: one bounded repair pass, then 422.
        repaired = true;
        const repairUser = `${userPrompt}\n\n---REPAIR---\n${buildRepairPrompt(hub, report.offending)}`;
        lesson = await callBrain({
          systemPrompt,
          userPrompt: repairUser,
          responseFormat: options.responseFormat,
        });
        if (options.transformResult) lesson = options.transformResult(lesson, body);
        report = validateHubWhitelist(hub, lesson);
      }
    }

    if (!report.ok) {
      return new Response(
        JSON.stringify({
          error: "HUB_COMPONENT_NOT_ALLOWED",
          message: `Auto-repair failed. The ${hub} brain emitted forbidden component types.`,
          hub,
          offending: report.offending,
          locations: report.locations.slice(0, 10),
        }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const result: BrainResult = { hub, lesson, whitelist: report, repaired, sanitized };
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const overloaded = isProviderOverload(err, msg);
    console.error(`[hub-brain:${hub}] brain_failed:`, msg);
    if (!overloaded && options.buildFallbackResult) {
      try {
        let fallback = options.buildFallbackResult(body, msg);
        if (options.transformResult) fallback = options.transformResult(fallback, body);
        const report = validateHubWhitelist(hub, fallback);
        if (report.ok) {
          const result: BrainResult = { hub, lesson: fallback, whitelist: report, repaired: true };
          return new Response(JSON.stringify(result), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      } catch (fallbackErr) {
        console.error(`[hub-brain:${hub}] fallback_failed:`, fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr));
      }
    }
    return new Response(
      JSON.stringify({
        error: overloaded ? "ai_overloaded" : "brain_failed",
        message: overloaded
          ? "The AI engine is overloaded right now. Wait ~15 seconds and retry."
          : msg,
        hub,
        retryable: overloaded,
        fallback: overloaded,
      }),
      { status: overloaded ? 503 : 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
}

