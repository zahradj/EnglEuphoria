/**
 * generate-ace-lesson  (v2 — redeploy trigger)
 * ───────────────────
 * One-click "Ace Lesson" orchestrator.
 *
 * Wraps the existing Playground brain (`generate-playground`) with:
 *   • Expert teacher contract preamble (already inside generate-playground)
 *   • GamePack + HomeworkPack + ChatQuestSeed enrichment
 *   • Publish-gate validation
 *   • Bounded auto-repair (≤2 retries on hard failures)
 *   • Phase report (8 phases) returned to the client modal
 *
 * The lesson JSON itself is produced by the brain — we do NOT re-implement
 * pedagogy here. This function is the "wire everything together" layer.
 */

import { corsHeaders } from "../_shared/hub-brain.ts";
import {
  decideEnrichmentPublish,
  enrichLesson,
  type EnrichmentInput,
  type EnrichmentResult,
  type Hub,
} from "../_shared/lessonEnrichment.ts";
import {
  validateUnitServer,
  computeQualityScore,
  type ServerIssue,
} from "../_shared/qa/serverValidators.ts";

type Phase =
  | "plan"
  | "vocab"
  | "grammar"
  | "reading"
  | "speaking"
  | "game"
  | "homework"
  | "validate";

interface PhaseReport {
  phase: Phase;
  ok: boolean;
  detail?: string;
}

class AceGenerationError extends Error {
  phases: PhaseReport[];
  constructor(message: string, phases: PhaseReport[]) {
    super(message);
    this.name = "AceGenerationError";
    this.phases = phases;
  }
}

interface AceLessonRequest {
  hub?: Hub;                    // currently only "playground" wired end-to-end
  scope?: "lesson" | "unit";    // "unit" enriches ALL 7 lessons; "lesson" only the target
  cefr: string;
  topic: string;
  /** Backdrop / world the unit is set in (kitchen, forest, space…). Optional. */
  unit_theme?: string;
  /** Human-readable scene phrase derived from the theme. Optional. */
  scene_phrase?: string;
  target_lesson_number?: number;
  learner_profile?: unknown;
  review_targets?: string[];
  cast?: { id: string; name: string; role?: string }[];
}

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

function lessonKindFor(n?: number): string {
  switch (n) {
    case 1: return "discover_warmup_vocab_modeling_phonics_sentence_spelling";
    case 2: return "build_recycle_modeling_phonics_practice_listening_spelling";
    case 3: return "apply_communicative_modeling_roleplay_game_spelling";
    case 4: return "storybook_story_vocab_phonics_video_retell_review";
    case 5: return "unit_review_all_lessons";
    case 6: return "mastery_quiz_80_percent_gate";
    case 7: return "stretch_remediation_after_failed_quiz";
    default: return "full_ace_unit";
  }
}

async function callPlaygroundBrain(body: AceLessonRequest, attempt: number, authHeader: string | null): Promise<any> {
  const url = `${SUPABASE_URL}/functions/v1/generate-playground`;
  // Prefer the caller's user JWT so the brain authorizes as the real user.
  // Fall back to service-role only when no caller token is present (e.g. server-to-server).
  const auth = authHeader && authHeader.startsWith("Bearer ")
    ? authHeader
    : `Bearer ${SERVICE_KEY}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: auth,
      apikey: SERVICE_KEY,
    },
    body: JSON.stringify({
      cefr: body.cefr,
      topic: body.topic,
      // Backdrop world hint — the Playground brain uses this to bind story
      // setting, scene descriptions, and image prompts to the chosen theme
      // (e.g. Family → cozy living room, Space → deep-space scene).
      unit_theme: body.unit_theme ?? undefined,
      scene_phrase: body.scene_phrase ?? undefined,
      lesson_kind: lessonKindFor(body.target_lesson_number),
      target_lesson_number: body.target_lesson_number,
      review_targets: body.review_targets,
      learner_profile: body.learner_profile ?? {
        interests: [],
        specific_needs: [],
        target_vocabulary: [],
      },
      _ace_attempt: attempt,
    }),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`brain ${res.status}: ${txt.slice(0, 320)}`);
  }
  return res.json();
}


function findUnit(node: any, d = 0): any {
  if (!node || typeof node !== "object" || d > 6) return null;
  if (Array.isArray(node.lessons)) return node;
  for (const v of Object.values(node)) {
    const h = findUnit(v, d + 1);
    if (h) return h;
  }
  return null;
}

function buildEnrichmentInput(
  hub: Hub,
  unit: any,
  targetLesson: number | undefined,
  cast?: AceLessonRequest["cast"],
): EnrichmentInput {
  const lessons: any[] = Array.isArray(unit?.lessons) ? unit.lessons : [];
  const lesson =
    (targetLesson && lessons.find((l) => l.lesson_number === targetLesson)) ||
    lessons[0] ||
    {};
  const vocab: string[] = Array.isArray(lesson.vocab) ? lesson.vocab.filter(Boolean) : [];
  const grammar: string[] = [lesson.grammar_target].filter(Boolean);
  return {
    hub,
    cefr: unit?.cefr ?? "Pre-A1",
    lessonIndex: lesson.lesson_number ?? 1,
    unitTheme: unit?.unit_theme ?? unit?.unit_topic ?? "",
    vocabulary: vocab,
    grammar,
    cast,
    slides: lesson.pages ?? lesson.slides ?? [],
  };
}

async function runOnce(body: AceLessonRequest, attempt: number, authHeader: string | null): Promise<{
  unit: any;
  enrichment: EnrichmentResult;
  enrichments?: EnrichmentResult[];
  phases: PhaseReport[];
}> {
  const phases: PhaseReport[] = [];
  const mark = (phase: Phase, ok: boolean, detail?: string) => phases.push({ phase, ok, detail });
  const scope = body.scope ?? "lesson";

  const brain = await callPlaygroundBrain(body, attempt, authHeader);

  if ((brain as any)?.error) throw new Error((brain as any).message || "brain error");

  const unit = findUnit((brain as any)?.lesson) || findUnit(brain);
  if (!unit) throw new Error("brain returned no unit");

  const lessons: any[] = Array.isArray(unit.lessons) ? unit.lessons : [];
  mark("plan", true, `unit "${unit.unit_topic}" / ${lessons.length} lessons`);
  mark("vocab", true);
  mark("grammar", true);
  mark("reading", true);
  mark("speaking", true);

  const hub: Hub = body.hub ?? "playground";

  if (scope === "unit") {
    // Enrich every lesson in the unit.
    const enrichments: EnrichmentResult[] = [];
    const issues: string[] = [];
    for (const lesson of lessons) {
      const eInput = buildEnrichmentInput(hub, unit, lesson.lesson_number, body.cast);
      const e = enrichLesson(eInput);
      enrichments.push(e);
      const v = decideEnrichmentPublish(e);
      if (!v.ok) {
        issues.push(`L${lesson.lesson_number}: ${v.issues.filter(i => i.severity === "hard").map(i => i.message).join("; ")}`);
      }
      lesson.gamified_elements = {
        ...(lesson.gamified_elements ?? {}),
        game_pack: e.game_pack,
        homework_pack: e.homework_pack,
        chat_quest_seed: e.chat_quest_seed,
      };
      if (body.cast?.length) lesson.cast = body.cast;
    }
    if (body.cast?.length) (unit as any).cast = body.cast;
    const totalGames = enrichments.reduce((s, e) => s + e.game_pack.rounds.length, 0);
    const totalHw = enrichments.reduce((s, e) => s + e.homework_pack.tasks.length, 0);
    mark("game", totalGames > 0, `${totalGames} rounds across ${enrichments.length} lessons`);
    mark("homework", totalHw > 0, `${totalHw} tasks across ${enrichments.length} lessons`);
    const serverIssues = validateUnitServer(unit);
    const hardServer = serverIssues.filter((i) => i.severity === "hard");
    if (hardServer.length > 0) {
      issues.push(...hardServer.map((i) => `L${i.lessonNumber ?? "?"}: ${i.code}`));
    }
    mark("validate", issues.length === 0, issues.join(" | ") || "clean");
    if (issues.length > 0) throw new AceGenerationError(`publish gate: ${issues.join(" | ")}`, phases);
    (unit as any).quality_score = computeQualityScore(serverIssues);
    (unit as any).server_issues = serverIssues;
    return { unit, enrichment: enrichments[0], enrichments, phases };
  }

  // scope === "lesson"
  const eInput = buildEnrichmentInput(hub, unit, body.target_lesson_number, body.cast);
  const enrichment = enrichLesson(eInput);
  mark("game", enrichment.game_pack.rounds.length > 0, `${enrichment.game_pack.rounds.length} rounds`);
  mark("homework", enrichment.homework_pack.tasks.length > 0, `${enrichment.homework_pack.tasks.length} tasks`);

  const verdict = decideEnrichmentPublish(enrichment);
  // Server-side pedagogy validators (image leaks, vocab schema, sequencing, matching dupes).
  const serverIssues: ServerIssue[] = validateUnitServer(unit);
  const hardServer = serverIssues.filter((i) => i.severity === "hard");
  const allOk = verdict.ok && hardServer.length === 0;
  const detail = [
    ...verdict.issues.map((i) => `${i.severity}:${i.code}`),
    ...serverIssues.map((i) => `${i.severity}:${i.code}`),
  ].join(", ") || "clean";
  mark("validate", allOk, detail);
  if (!allOk) {
    const msg = [
      ...verdict.issues.filter((i) => i.severity === "hard").map((i) => i.message),
      ...hardServer.map((i) => i.message),
    ].join("; ");
    throw new AceGenerationError(`publish gate: ${msg}`, phases);
  }
  (unit as any).quality_score = computeQualityScore(serverIssues);
  (unit as any).server_issues = serverIssues;

  const targetIdx = body.target_lesson_number
    ? lessons.findIndex((l) => l.lesson_number === body.target_lesson_number)
    : 0;
  if (targetIdx >= 0 && lessons[targetIdx]) {
    lessons[targetIdx] = {
      ...lessons[targetIdx],
      gamified_elements: {
        ...(lessons[targetIdx].gamified_elements ?? {}),
        game_pack: enrichment.game_pack,
        homework_pack: enrichment.homework_pack,
        chat_quest_seed: enrichment.chat_quest_seed,
      },
      ...(body.cast?.length ? { cast: body.cast } : {}),
    };
  }
  if (body.cast?.length) (unit as any).cast = body.cast;

  return { unit, enrichment, phases };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = (await req.json()) as AceLessonRequest;
    if (!body?.topic || !body?.cefr) {
      return new Response(
        JSON.stringify({ error: "topic and cefr are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let lastError: string | null = null;
    let lastPhases: PhaseReport[] = [];
    const authHeader = req.headers.get("Authorization");
    // The brain (generate-playground) already runs its own repair pass for
    // structural/whitelist issues. A second outer retry here would mean another
    // full 7-lesson Gemini generation (~30-60s each) for marginal gain, so we
    // attempt once and surface the gate error to the client instead.
    // Unit scope is especially expensive — never retry it.
    const MAX_ATTEMPTS = (body.scope ?? "lesson") === "unit" ? 1 : 2;
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
      try {
        const out = await runOnce(body, attempt, authHeader);

        return new Response(
          JSON.stringify({
            ok: true,
            attempt,
            scope: body.scope ?? "lesson",
            unit: out.unit,
            enrichment: out.enrichment,
            enrichments: out.enrichments,
            phases: out.phases,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      } catch (e) {
        lastError = e instanceof Error ? e.message : String(e);
        if (e instanceof AceGenerationError) lastPhases = e.phases;
        // Only retry on transient AI overload — re-running a 30-60s brain call
        // on a parse / schema failure will exhaust the edge function wall-clock
        // and leave the client modal stuck on "working".
        const retryable = /\b(429|503|502|504)\b|overload|unavailable|temporar|rate limit/i.test(lastError);
        if (!retryable || attempt === MAX_ATTEMPTS) break;
      }
    }

    // Return 200 so supabase.functions.invoke surfaces our `error` field
    // instead of throwing the generic "Failed to send a request" client error.
    return new Response(
      JSON.stringify({ ok: false, error: lastError ?? "ace lesson generation failed", phases: lastPhases }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ ok: false, error: e instanceof Error ? e.message : String(e) }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
