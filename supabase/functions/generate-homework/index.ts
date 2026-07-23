// generate-homework — Unified Homework Pipeline
// 7-stage pipeline that consumes the Unified Lesson Context Object and
// emits a canonical homework payload consumed by <HomeworkPlayer />.
//
// Stages:
//   1. context     — load Unified Lesson Context (hydrate missing scopes from DB)
//   2. blueprint   — derive homework targets from vocab + grammar + pronunciation
//   3. activities  — AI generates 3 activities (Gemini direct via aiFetch)
//   4. adaptive    — clamp difficulty + xp_reward using adaptive_profile
//   5. validate    — schema + token-equality + vocab-reuse checks (one repair retry)
//   6. persist     — insert into homework_assignments
//   7. assign      — optional assigned_student_id link
//
// All failures return HTTP 200 with { success:false, stage, error, detail, retryable }
// so the supabase-js client exposes the body (functions.invoke swallows non-2xx bodies).

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { aiFetch } from "../_shared/aiFetch.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Hub = "playground" | "academy" | "success";
type Stage =
  | "auth"
  | "context"
  | "blueprint"
  | "activities"
  | "adaptive"
  | "validate"
  | "persist"
  | "assign";

const HUB_RULES: Record<Hub, string> = {
  playground:
    'AUDIENCE: kids aged 4-9. Tone: enthusiastic, magical, simple. CEFR: Pre-A1 to A2. ' +
    'Sentences must be ≤6 words. Use concrete nouns and physical verbs only. No abstract ideas, no business themes.',
  academy:
    'AUDIENCE: teenagers aged 10-15. Tone: engaging, relevant, slightly informal. CEFR: A2 to B2. ' +
    'Sentences may be 6-10 words. Use everyday teen contexts (school, sport, tech, friends).',
  success:
    'AUDIENCE: adult professionals. Tone: formal, sophisticated, business-oriented. CEFR: B1 to C2. ' +
    'Sentences may be 8-14 words and may use intermediate idioms or business collocations.',
};

const HUB_TIME: Record<Hub, string> = {
  playground: "8–10 min",
  academy: "12–15 min",
  success: "15–20 min",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const logStage = (stage: Stage, payload: Record<string, unknown>) => {
  try {
    console.log(JSON.stringify({ fn: "generate-homework", stage, ts: Date.now(), ...payload }));
  } catch {
    console.log(`[generate-homework] ${stage}`);
  }
};

const fail = (
  stage: Stage,
  error: string,
  opts: { detail?: unknown; code?: string; retryable?: boolean; httpStatus?: number } = {},
) => {
  const body = {
    success: false,
    stage,
    error,
    code: opts.code,
    detail: typeof opts.detail === "string" ? opts.detail : opts.detail ? JSON.stringify(opts.detail).slice(0, 800) : undefined,
    retryable: opts.retryable ?? false,
  };
  logStage(stage, { ok: false, error, code: opts.code, retryable: body.retryable });
  return json(body, opts.httpStatus ?? 200);
};

// ───────────────────── helpers ─────────────────────

const toStrings = (arr: unknown): string[] =>
  (Array.isArray(arr) ? arr : [])
    .map((v: any) => (typeof v === "string" ? v : v?.word || v?.term || ""))
    .filter((v: string) => typeof v === "string" && v.trim().length > 0)
    .map((v: string) => v.trim());

const safeJsonParse = (raw: string): { ok: true; value: any } | { ok: false; error: string } => {
  const trimmed = (raw || "").replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
  try {
    return { ok: true, value: JSON.parse(trimmed) };
  } catch (e1) {
    const first = trimmed.indexOf("{");
    const last = trimmed.lastIndexOf("}");
    if (first >= 0 && last > first) {
      try {
        return { ok: true, value: JSON.parse(trimmed.slice(first, last + 1)) };
      } catch (e2) {
        return { ok: false, error: (e2 as Error).message };
      }
    }
    return { ok: false, error: (e1 as Error).message };
  }
};

const normaliseHub = (raw: unknown): Hub =>
  (["playground", "academy", "success"].includes(String(raw)) ? (raw as Hub) : "academy");

const resolveDueDate = (body: Record<string, any>): { ok: true; value: string } | { ok: false; error: string } => {
  const raw = body.due_date ?? body.dueDate ?? body.selectedDueDate;
  if (typeof raw === "string" && raw.trim().length > 0) {
    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) {
      return { ok: false, error: "Invalid homework due date. Please choose a valid date." };
    }
    return { ok: true, value: parsed.toISOString() };
  }

  const fallback = new Date();
  fallback.setDate(fallback.getDate() + 7);
  return { ok: true, value: fallback.toISOString() };
};

// ───────────────────── unified context ─────────────────────

interface UnifiedContext {
  hub: Hub;
  cefr_level: string;
  lesson_id: string | null;
  title: string;
  image_style: string | null;
  vocabulary: string[];           // vocabulary_scope.items
  grammar: string;                // grammar_scope.pattern
  phonics: string;                // pronunciation_scope.focus
  difficulty_tier: number;        // adaptive_profile.difficulty_tier (1..5)
  xp_curve_multiplier: number;    // gamification_state.xp_multiplier
  lesson_state: Record<string, unknown>;
}

async function loadUnifiedContext(
  supabase: ReturnType<typeof createClient>,
  body: Record<string, any>,
): Promise<UnifiedContext> {
  const hub = normaliseHub(body.hub);
  const lessonId: string | null = body.lesson_id || null;

  // Pull anything the caller already gave us.
  const bp = body.blueprint || {};
  const vocabularyScope = body.vocabulary_scope || {};
  const grammarScope = body.grammar_scope || {};
  const pronunciationScope = body.pronunciation_scope || {};
  const adaptiveProfile = body.adaptive_profile || {};
  const gamificationState = body.gamification_state || {};
  const lessonState = body.lesson_state || {};

  let resolvedTitle = body.title || bp.title || "Homework";
  let resolvedImageStyle: string | null = body.image_style || bp.image_style || null;
  let cefr = body.cefr_level || bp.cefr_level || lessonState.cefr_level || "";

  let vocab: string[] = [
    ...toStrings(vocabularyScope.items),
    ...toStrings(vocabularyScope.target_vocabulary),
    ...toStrings(bp.vocabulary),
    ...toStrings(bp.target_vocabulary),
    ...toStrings(bp.vocabulary_list),
  ];
  let grammar = grammarScope.pattern || grammarScope.focus || bp.grammar || bp.grammar_focus || bp.target_grammar_rule || "";
  let phonics = pronunciationScope.focus || pronunciationScope.targets || bp.target_phonics || bp.phonics || bp.phonics_focus || "";

  // Hydrate from DB if we have a lesson id and any scope is thin.
  if (lessonId) {
    const { data: lesson, error: lessonErr } = await supabase
      .from("curriculum_lessons")
      .select("title, vocabulary_list, grammar_pattern, phonics_focus, content, image_style, unit_id, slot_cefr_level, lesson_state")
      .eq("id", lessonId)
      .maybeSingle();
    if (lessonErr) {
      logStage("context", { warn: "lesson lookup failed", detail: lessonErr.message });
    }
    if (lesson) {
      resolvedTitle = lesson.title || resolvedTitle;
      resolvedImageStyle = resolvedImageStyle || (lesson as any).image_style || null;
      cefr = cefr || (lesson as any).slot_cefr_level || "";
      vocab = Array.from(new Set([...vocab, ...toStrings((lesson as any).vocabulary_list)]));
      grammar = grammar || (lesson as any).grammar_pattern || "";
      phonics = phonics || (lesson as any).phonics_focus || "";

      // Merge inline content blueprint as a last resort
      const inlineContent = (lesson as any).content || {};
      if (typeof inlineContent === "object") {
        vocab = Array.from(new Set([...vocab, ...toStrings(inlineContent.vocabulary)]));
        if (!grammar) grammar = inlineContent.grammar || inlineContent.grammar_focus || "";
        if (!phonics) phonics = inlineContent.phonics || inlineContent.phonics_focus || "";
      }
      // Adopt the lesson_state we read if the caller didn't pass one.
      if (!Object.keys(lessonState).length && (lesson as any).lesson_state) {
        Object.assign(lessonState, (lesson as any).lesson_state);
      }

      // Fallback to unit vocabulary themes
      if (vocab.length < 3 && (lesson as any).unit_id) {
        const { data: unit } = await supabase
          .from("curriculum_units")
          .select("vocabulary_themes, cefr_level")
          .eq("id", (lesson as any).unit_id)
          .maybeSingle();
        if (!cefr && unit?.cefr_level) cefr = unit.cefr_level;
        const themes: string[] = Array.isArray(unit?.vocabulary_themes) ? (unit!.vocabulary_themes as any) : [];
        if (themes.length > 0) {
          const { data: bankRows } = await supabase
            .from("vocabulary_bank")
            .select("word")
            .in("theme", themes)
            .limit(20);
          vocab = Array.from(new Set([...vocab, ...toStrings(bankRows?.map((r: any) => r.word))]));
        }
      }
    }
  }

  // Last-resort vocabulary fallback at the CEFR level
  if (vocab.length < 3 && cefr) {
    const { data: bankRows } = await supabase
      .from("vocabulary_bank")
      .select("word")
      .eq("cefr_level", cefr)
      .limit(20);
    vocab = Array.from(new Set([...vocab, ...toStrings(bankRows?.map((r: any) => r.word))]));
  }

  vocab = vocab.slice(0, 8);

  const difficulty_tier = clamp(Number(adaptiveProfile.difficulty_tier ?? 3), 1, 5);
  const xp_curve_multiplier = clamp(Number(gamificationState.xp_multiplier ?? 1), 0.5, 2);

  return {
    hub,
    cefr_level: cefr || "",
    lesson_id: lessonId,
    title: resolvedTitle,
    image_style: resolvedImageStyle,
    vocabulary: vocab,
    grammar,
    phonics,
    difficulty_tier,
    xp_curve_multiplier,
    lesson_state: lessonState,
  };
}

const clamp = (n: number, lo: number, hi: number) =>
  Number.isFinite(n) ? Math.max(lo, Math.min(hi, n)) : (lo + hi) / 2;

// ───────────────────── activity validation ─────────────────────

interface ActivityValidationResult {
  ok: boolean;
  errors: string[];
}

function validateHomework(payload: any, vocab: string[]): ActivityValidationResult {
  const errors: string[] = [];
  if (!payload || typeof payload !== "object") {
    return { ok: false, errors: ["payload is not an object"] };
  }
  const a1 = payload.activity_1_recognition;
  const a2 = payload.activity_2_syntax;
  const a3 = payload.activity_3_production;

  if (!a1 || !Array.isArray(a1.items) || a1.items.length < 3) errors.push("activity_1_recognition.items < 3");
  if (!a2 || !Array.isArray(a2.items) || a2.items.length < 1) errors.push("activity_2_syntax.items < 1");
  if (!a3 || typeof a3.prompt !== "string" || !a3.prompt.trim()) errors.push("activity_3_production.prompt missing");

  // Token equality check for scramble items
  if (a2 && Array.isArray(a2.items)) {
    for (let i = 0; i < a2.items.length; i++) {
      const it = a2.items[i];
      if (!it || !Array.isArray(it.scrambled_words) || typeof it.correct_order !== "string") {
        errors.push(`activity_2_syntax.items[${i}] malformed`);
        continue;
      }
      const expected = it.correct_order.replace(/[.,!?;:]/g, "").split(/\s+/).filter(Boolean).sort().join("|");
      const got = it.scrambled_words.map((w: string) => String(w).replace(/[.,!?;:]/g, "")).filter(Boolean).sort().join("|");
      if (expected !== got) errors.push(`activity_2_syntax.items[${i}] token mismatch`);
    }
  }

  // Vocab reuse check (at least one target word used somewhere)
  const haystack = JSON.stringify(payload).toLowerCase();
  const reused = vocab.filter((w) => haystack.includes(w.toLowerCase())).length;
  if (vocab.length > 0 && reused === 0) errors.push("no vocabulary word reused in output");

  return { ok: errors.length === 0, errors };
}

// ───────────────────── handler ─────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const t0 = Date.now();

  try {
    if (!Deno.env.get("GEMINI_API_KEY")) {
      return fail("context", "No AI provider configured", { httpStatus: 500 });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // ── Stage: auth ───────────────────────────────────────────
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return fail("auth", "Missing authorization header", { httpStatus: 401 });
    const { data: { user }, error: authErr } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (authErr || !user) return fail("auth", "Unauthorized", { detail: authErr?.message, httpStatus: 401 });

    const body = await req.json().catch(() => ({}));
    const dueDateResult = resolveDueDate(body || {});
    if (!dueDateResult.ok) {
      return fail("persist", dueDateResult.error, { code: "INVALID_DUE_DATE", retryable: false });
    }
    const resolvedDueDate = dueDateResult.value;
    logStage("auth", { ok: true, user_id: user.id });

    // ── Stage 1: context ─────────────────────────────────────
    const ctxStart = Date.now();
    let ctx: UnifiedContext;
    try {
      ctx = await loadUnifiedContext(supabase, body || {});
    } catch (e) {
      return fail("context", "Failed to load Unified Lesson Context", { detail: (e as Error).message, retryable: true });
    }
    logStage("context", {
      ok: true,
      ms: Date.now() - ctxStart,
      hub: ctx.hub,
      lesson_id: ctx.lesson_id,
      cefr_level: ctx.cefr_level,
      vocab_count: ctx.vocabulary.length,
      has_grammar: !!ctx.grammar,
      has_phonics: !!ctx.phonics,
      difficulty_tier: ctx.difficulty_tier,
    });

    // ── Stage 2: blueprint ───────────────────────────────────
    if (ctx.vocabulary.length < 3) {
      return fail("blueprint", "Need at least 3 vocabulary items to generate homework", {
        code: "INSUFFICIENT_VOCABULARY",
        detail: `Got ${ctx.vocabulary.length} word(s). Add more vocabulary to the lesson or unit themes.`,
      });
    }
    logStage("blueprint", { ok: true, targets: { vocab: ctx.vocabulary.length, grammar: !!ctx.grammar, phonics: !!ctx.phonics } });

    // ── Stage 3: activities (AI) ─────────────────────────────
    const systemPrompt =
      `You are an expert ESL homework game designer for the ${ctx.hub.toUpperCase()} hub. ` +
      `${HUB_RULES[ctx.hub]} ` +
      `Reuse the EXACT lesson vocabulary and grammar pattern. Do NOT introduce new vocabulary. ` +
      `Adaptive difficulty tier: ${ctx.difficulty_tier}/5 (1=easiest, 5=hardest). ` +
      `\nCRITICAL OUTPUT FORMAT — return ONLY this raw JSON object, no markdown, no commentary:\n` +
      `{\n` +
      `  "activity_1_recognition": {\n` +
      `    "instructions": "string — short instructions",\n` +
      `    "items": [\n` +
      `      { "audio_text": "string — vocab word", "correct_answer": "string — same as audio_text", "wrong_options": ["string","string","string"] }\n` +
      `      // 4-5 items, each a different vocab word\n` +
      `    ]\n` +
      `  },\n` +
      `  "activity_2_syntax": {\n` +
      `    "instructions": "string",\n` +
      `    "items": [\n` +
      `      { "scrambled_words": ["tokens shuffled"], "correct_order": "full sentence with punctuation" }\n` +
      `      // EXACTLY 3. Each sentence MUST follow the target grammar pattern AND use at least one target vocabulary word.\n` +
      `    ]\n` +
      `  },\n` +
      `  "activity_3_production": {\n` +
      `    "instructions": "string",\n` +
      `    "prompt": "string — single short roleplay or contextual speaking prompt for the hub",\n` +
      `    "target_words_to_detect": ["string","string"],\n` +
      `    "example_response": "string"\n` +
      `  }\n` +
      `}\n` +
      `Rules: scrambled_words must contain the SAME tokens (case-sensitive, punctuation stripped) as correct_order split on spaces, just shuffled. target_words_to_detect must be 2-3 words drawn from the vocabulary list.`;

    const userPrompt =
      `Lesson title: ${ctx.title}\n` +
      `Hub: ${ctx.hub}\n` +
      `CEFR: ${ctx.cefr_level || "(unspecified)"}\n` +
      `Vocabulary (REUSE EXACTLY): ${JSON.stringify(ctx.vocabulary)}\n` +
      `Grammar focus: ${ctx.grammar || "(none — focus on vocabulary recognition)"}\n` +
      `Phonics / pronunciation focus: ${ctx.phonics || "(none)"}\n`;

    async function callAI(repairHint?: string): Promise<{ ok: true; content: string } | { ok: false; status?: number; detail: string; retryable: boolean }> {
      const messages: Array<{ role: string; content: string }> = [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ];
      if (repairHint) {
        messages.push({
          role: "user",
          content: `The previous response failed validation: ${repairHint}\nReturn a NEW JSON object that fixes those issues and conforms to the schema. JSON only.`,
        });
      }
      const aiRes = await aiFetch("https://ai-gateway.internal/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages,
          response_format: { type: "json_object" },
          max_tokens: 4000,
        }),
      }).catch((e) => {
        return new Response(JSON.stringify({ error: (e as Error).message }), { status: 502 });
      });

      if (!aiRes.ok) {
        const errText = await aiRes.text();
        return {
          ok: false,
          status: aiRes.status,
          detail: errText.slice(0, 600),
          retryable: aiRes.status === 429 || aiRes.status === 402 || aiRes.status >= 500,
        };
      }
      const ai = await aiRes.json().catch(() => null as any);
      const content = ai?.choices?.[0]?.message?.content;
      if (!content) {
        return { ok: false, detail: "empty AI response", retryable: true };
      }
      return { ok: true, content: typeof content === "string" ? content : String(content) };
    }

    const aiStart = Date.now();
    let aiResult = await callAI();
    if (!aiResult.ok) {
      return fail("activities", "AI request failed", {
        detail: `status=${aiResult.status} ${aiResult.detail}`,
        retryable: aiResult.retryable,
      });
    }
    logStage("activities", { ok: true, ms: Date.now() - aiStart });

    // ── Stage 5: validate (with one repair pass) ─────────────
    let parsed = safeJsonParse(aiResult.content);
    let validation: ActivityValidationResult = parsed.ok
      ? validateHomework(parsed.value, ctx.vocabulary)
      : { ok: false, errors: [`json parse failed: ${parsed.error}`] };

    if (!validation.ok) {
      logStage("validate", { ok: false, errors: validation.errors, pass: 1 });
      const repair = await callAI(validation.errors.join("; "));
      if (repair.ok) {
        const reparsed = safeJsonParse(repair.content);
        if (reparsed.ok) {
          parsed = reparsed;
          validation = validateHomework(reparsed.value, ctx.vocabulary);
        } else {
          validation = { ok: false, errors: [`repair json parse failed: ${reparsed.error}`] };
        }
      }
    }

    if (!validation.ok || !parsed.ok) {
      return fail("validate", "AI output failed schema validation after repair", {
        detail: validation.errors.join("; ").slice(0, 600),
        retryable: true,
      });
    }
    const homework = parsed.value;
    logStage("validate", { ok: true });

    // ── Stage 4 (post-AI): adaptive — clamp difficulty + xp_reward ──
    const baseXp = 50;
    const difficultyLabel = ctx.difficulty_tier <= 2 ? "easy" : ctx.difficulty_tier >= 4 ? "hard" : "medium";
    const xp_reward = Math.round(baseXp * ctx.xp_curve_multiplier * (0.8 + ctx.difficulty_tier * 0.1));
    logStage("adaptive", { ok: true, difficulty: difficultyLabel, xp_reward });

    // Enrich for the player
    homework.meta = {
      hub: ctx.hub,
      lesson_id: ctx.lesson_id,
      title: ctx.title,
      vocabulary: ctx.vocabulary,
      grammar: ctx.grammar,
      phonics: ctx.phonics,
      image_style: ctx.image_style,
      cefr_level: ctx.cefr_level,
    };

    // Build answer key
    const answer_key: Record<string, unknown> = {
      activity_1_recognition: (homework.activity_1_recognition?.items || []).map((i: any) => i.correct_answer),
      activity_2_syntax: (homework.activity_2_syntax?.items || []).map((i: any) => i.correct_order),
      activity_3_production: {
        target_words: homework.activity_3_production?.target_words_to_detect || [],
        example: homework.activity_3_production?.example_response || "",
      },
    };

    // Canonical homework payload (lives inside homework_assignments.content)
    const canonical = {
      homework_id: "", // filled after insert
      lesson_id: ctx.lesson_id,
      hub: ctx.hub,
      cefr_level: ctx.cefr_level,
      title: ctx.title,
      activities: [
        { id: "activity_1_recognition", ...(homework.activity_1_recognition || {}) },
        { id: "activity_2_syntax", ...(homework.activity_2_syntax || {}) },
        { id: "activity_3_production", ...(homework.activity_3_production || {}) },
      ],
      answer_key,
      xp_reward,
      estimated_time: HUB_TIME[ctx.hub],
      difficulty: difficultyLabel,
      published: true,
      // Keep the legacy keys so the existing <HomeworkPlayer /> keeps working unchanged.
      activity_1_recognition: homework.activity_1_recognition,
      activity_2_syntax: homework.activity_2_syntax,
      activity_3_production: homework.activity_3_production,
      meta: homework.meta,
    };

    // ── Stage 6: persist ─────────────────────────────────────
    const persistStart = Date.now();
    const insertRow: Record<string, unknown> = {
      teacher_id: user.id,
      lesson_id: ctx.lesson_id,
      assigned_student_id: body.assigned_student_id || null,
      title: `Homework: ${ctx.title}`,
      description: homework.activity_3_production?.prompt || "Auto-generated interactive homework",
      instructions:
        "Complete all three activities: Listen & Match, Sentence Scramble, and the Voice Challenge.",
      points: xp_reward,
      due_date: resolvedDueDate,
      status: "active",
      content: canonical,
      source: "ai-generated",
      image_style: ctx.image_style,
    };
    let saveRes = await supabase.from("homework_assignments").insert(insertRow).select().single();
    if (saveRes.error) {
      // Retry without optional columns for older schemas
      const retryRow: Record<string, unknown> = { ...insertRow };
      delete retryRow.assigned_student_id;
      delete retryRow.image_style;
      saveRes = await supabase.from("homework_assignments").insert(retryRow).select().single();
      if (saveRes.error) {
        return fail("persist", `Failed to save homework — ${saveRes.error.message}`, {
          detail: saveRes.error,
          retryable: true,
        });
      }
    }
    const assignment: any = saveRes.data;
    canonical.homework_id = assignment.id;

    // Update content with the resolved homework_id so the player has it inline.
    await supabase
      .from("homework_assignments")
      .update({ content: canonical })
      .eq("id", assignment.id);

    logStage("persist", { ok: true, ms: Date.now() - persistStart, homework_id: assignment.id });

    // ── Stage 7: assign (already done via assigned_student_id column) ──
    logStage("assign", { ok: true, assigned_student_id: assignment.assigned_student_id || null });

    return json({
      success: true,
      homework: canonical,
      assignment,
      timing_ms: Date.now() - t0,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return fail("context", message, { httpStatus: 500 });
  }
});
