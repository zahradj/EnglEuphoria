// ============================================================
// Expert Lesson Architect — Edge Function
// ------------------------------------------------------------
// A tool-using AI agent that produces an enriched LessonPlan
// blueprint BEFORE the deterministic orchestrator runs.
//
// Flow per invocation:
//   1. PLAN     — Gemini 2.5 Pro drafts BlueprintOverrides given
//                 hub × cefr × prior context + intelligence summary
//   2. CRITIQUE — single Gemini call with 3 lenses
//                 (pedagogy / hub-identity / adaptive)
//   3. REPAIR   — up to 2 passes when critic returns blockers
//   4. EMIT     — { overrides, rationale, criticFindings, passes, status }
//
// Persists every run to public.architect_runs for transparency
// and A/B vs the deterministic planner baseline.
//
// Runtime AI rule: Gemini DIRECT — never Lovable AI Gateway.
// ============================================================

import { createClient } from "npm:@supabase/supabase-js@2.45.0";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const PLAN_MODEL = "gemini-2.5-pro";
const FAST_MODEL = "gemini-2.5-flash";
const HARD_CAP_MS = 60_000;
const MAX_REPAIR_PASSES = 2;

type Hub = "playground" | "academy" | "success";
type Cefr = "Pre-A1" | "A1" | "A2" | "B1" | "B2" | "C1";

interface ArchitectRequest {
  hub: Hub;
  cefr: Cefr;
  lessonRef: string;
  studentId?: string;
  seed: {
    title?: string;
    theme?: string;
    grammarFocus?: string[];
    targetVocab?: string[];
    communicationGoal?: string;
    reviewTargets?: string[];
  };
  context?: {
    hubProfile?: any;
    priorLessons?: Array<{ title: string; grammar?: string[]; vocab?: string[]; theme?: string }>;
    intelligenceSummary?: string;
    governanceConstraints?: { blockedGrammar?: string[]; forbiddenVocab?: string[]; cefrCeiling?: string };
    activityCatalog?: string[];
    memoryDue?: string[];
    analyticsHints?: string[];
  };
  /** Pre-composed expert curriculum brain prompt (hub × cefr aware). */
  brainPrompt?: string;
  completedUnits?: number;
}

interface CriticFinding {
  lens: "pedagogy" | "hub_identity" | "adaptive" | "cognitive_alignment" | "interface_design";
  severity: "block" | "warn";
  code: string;
  message: string;
  suggestion?: string;
}

interface PlanDraft {
  lesson_title: string;
  theme: string;
  framework: "PPP" | "ESA" | "TBLT" | "TTT";
  age_band: string;
  grammar_focus: string[];
  target_vocab: string[];
  communication_goal: string;
  review_targets: string[];
  support_branch: string;
  stretch_branch: string;
  warmup_engage: string;
  spaced_recall_hook: string;
  // Cognitive Alignment Engine (Bloom + Sweller, §8)
  objective_verb: string;
  bloom_level: "Remember" | "Understand" | "Apply" | "Analyze" | "Evaluate" | "Create";
  activity_verb: string;
  assessment_verb: string;
  assessment_rubric: string[];
  cognitive_load_note: string;
  // Classroom Interface & Activity Engine (§10)
  selected_activity: string;       // chosen from §10.3 catalog
  interaction_band_fit: string;    // why this activity fits §10.2 band input/density
  screen_layout_note: string;      // one-new-idea-per-screen + Mayer signalling note
  rationale: string;
  hub_identity_signature: string;
  // ── 8-brain pipeline outputs (curriculum brain contract) ──
  pipeline_trace?: Array<{ stage: string; decision: string; evidence?: string; signed_by?: string }>;
  personas_trace?: Array<{ persona: string; decision: string; evidence?: string }>;
  design_workflow?: {
    topic?: string;
    communication_goal?: string;
    grammar_frame?: string;
    mission?: string;
    story?: Record<string, unknown>;
    games?: string[];
    step_bindings?: Record<string, unknown>;
    notes?: string;
  };
  learning_journey_map?: Record<string, string[]>;
  emotional_beats?: Record<string, { slide_index: number; description: string }>;
  hall_of_fame?: {
    scores: Array<{ id: string; score_0_to_5: number; evidence: string }>;
    total: number;
    verdict: "hall_of_fame" | "improve";
    improve_target?: string;
  };
  review?: {
    pass: boolean;
    checks: Array<{ id: string; pass: boolean; evidence: string }>;
    blocker?: string;
  };
}

// Fallback constitution injected when the client doesn't supply brainPrompt.
const FALLBACK_CONSTITUTION = `# ENGLEUPHORIA CURRICULUM ARCHITECT — CONSTITUTION (fallback)
You are the ENGLEUPHORIA Curriculum Architect. Apply Krashen i+1, Vygotsky ZPD,
Dörnyei L2 Self, CLT/CLIL, spiral repetition (≥3 future touchpoints), TPR for
young/beginner learners, Biggs constructive alignment (objective verb ≡
activity verb ≡ assessment verb), Sweller cognitive load (cap intrinsic, strip
extraneous, maximize germane, one new variable at a time below B1), and
Bloom's revised taxonomy as the activity/assessment bank — invisibly, never
naming the theory.
Choose framework deliberately: PPP (Pre-A1–A2 new structure), ESA (A2–C2),
TBLT (B1+ Academy/Success), TTT (Success placement-sensitive).
Hubs: Playground 4–12 Pre-A1→low B1 (PPP+TPR, Pip-led, dual-pane, 20–25 min,
judicious AR/FR L1 toggle); Academy 10–17 A1→B2/C1 (identity & future-self,
debate/role-play, never childish); Success 18+ A1→C2 (andragogy, real scenario
first, TTT diagnostic, sub-tracks General/Academic/Business/Conversation).
Cognitive ceilings: Playground 4–6 Remember/Understand + simple Apply; 7–12
Remember→Apply daily + light Analyze upper band; Academy 10–15
Understand→Analyze + emerging Evaluate; Academy 16–17 & Success full range
once B1+. Express the same operation through age-appropriate content rather
than dropping the cognitive level.
Every blueprint MUST: lower affective filter before raising challenge; present
language in context BEFORE any rule; recycle ≥1 prior-unit item; ship Support
and Stretch branches that BOTH reach the same Bloom level as core; end with
an explicit spaced-recall hook for next lesson + unit milestone; cap intrinsic
load (≤7 new items Playground; vary vocab OR grammar, not both, below B1);
pair the assessment with a 3–4 point can-do rubric; and contain ZERO placeholders.`;


// ── Prompts ─────────────────────────────────────────────────

function architectSystemPrompt(req: ArchitectRequest): string {
  const brain = req.brainPrompt ? `${req.brainPrompt}\n\n---\n\n` : `${FALLBACK_CONSTITUTION}\n\n---\n\n`;
  return [
    brain +
      'You are the Expert Lesson Architect — a master ESL pedagogy agent operating under the ENGLEUPHORIA Curriculum Architect Constitution above.',
    'Your job: produce a single, airtight LessonPlan blueprint that the deterministic generation pipeline will then execute.',
    '',
    'ABSOLUTE RULES:',
    '1. CEFR cap is HARD — never propose grammar or vocab above the target CEFR.',
    '2. Hub identity is HARD — same CEFR MUST diverge by hub. Your blueprint must be visibly different for B1 Playground vs B1 Academy vs B1 Success. Encode the divergence in hub_identity_signature with the register, topic lens, and an example phrase that could ONLY belong to this hub at this CEFR.',
    '3. Cambridge pedagogy — topic locking, vocab introduced BEFORE used, reading consistency, real-life context.',
    '4. Vocab recycling — every target word must be designed for ≥3 exposures across the lesson, plus the structure must seed ≥3 future touchpoints (next lesson, unit milestone, next level intro).',
    '5. Communication goal must be a concrete real-world micro-exchange (not a meta description).',
    '6. Framework choice (PPP/ESA/TBLT/TTT) is DELIBERATE and must be matched to hub × CEFR per the constitution — explain the choice in rationale.',
    '7. Warm-up/Engage is NEVER skipped: warmup_engage must lower the affective filter before any new language is introduced.',
    '8. Differentiation is built-in, not bolted on: support_branch and stretch_branch are MANDATORY, and BOTH must reach the same Bloom level as the core path — different scaffolding, same cognitive operation.',
    '9. Spaced recall: spaced_recall_hook names exactly what gets revisited next lesson AND at the unit milestone.',
    '10. Anti-repetition — your blueprint must NOT repeat the topic/grammar of the supplied prior lessons.',
    '11. When the EMBEDDED CURRICULUM BRAIN proposes a next unit or recycle pool, anchor your blueprint to it — do not freely invent off-map content.',
    '12. Hub register quick reference: playground = concrete/sensory/song-movement/Pip-led/≤6-word definitions; academy = analytical/peer-collaborative/identity-relevant/no childish mechanics; success = high-ROI professional simulation/scenario-first/efficient/never patronizing.',
    '13. COGNITIVE ALIGNMENT (Biggs, §8.1) — objective_verb, activity_verb and assessment_verb MUST all sit at the same Bloom level (bloom_level). Mismatch is a HARD violation: redesign rather than ship.',
    '14. COGNITIVE CEILING (§8.3) — choose bloom_level appropriate to hub × age. Do NOT under-challenge older learners by sitting in Remember/Understand; do NOT force abstract Evaluate/Create on Playground 4–6 in adult form — express the same operation through age-appropriate content.',
    '15. COGNITIVE LOAD (Sweller, §8.4) — cap intrinsic load (~5–7 new items Playground; scale up by CEFR). BELOW B1, never introduce new vocab AND new grammar in the same activity — vary ONE element at a time. Confirm both in cognitive_load_note.',
    '16. ASSESSMENT DESIGN (§8.6) — assessment format must match the objective verb, NOT ease of grading. Never default to MCQ for Apply/Analyze/Evaluate/Create. assessment_rubric MUST be 3–4 plain-language can-do bullets, not a numeric score. Playground assessment is disguised as play below ~age 9 — NEVER a formal test.',
    '17. INTERFACE DESIGN (§10) — selected_activity MUST come from the §10.3 catalog and match BOTH the bloom_level (§8.2) and the band\'s input ability / visual-complexity tier (§10.2). interaction_band_fit must justify it in one sentence ("PG 4–6: tap-only, 1 visual + 1 interaction per screen"). screen_layout_note must apply Mayer principles — ONE new idea per screen, signalling on the target item, no decorative clutter, dual-pane separation maintained.',
    '18. ZERO placeholders — every field must be fully written content a teacher could run immediately.',
    '19. Before emitting, silently run the §12 Quality Self-Check. If any item fails, revise.',
    '',
    `TARGET: hub=${req.hub} · cefr=${req.cefr} · lessonRef=${req.lessonRef}`,
    '',
    'OUTPUT: STRICT JSON matching this shape (no prose, no markdown):',
    `{
  "lesson_title": string,
  "theme": string,
  "framework": "PPP" | "ESA" | "TBLT" | "TTT",
  "age_band": string,
  "grammar_focus": string[],
  "target_vocab": string[],
  "communication_goal": string,
  "review_targets": string[],
  "warmup_engage": string,
  "support_branch": string,
  "stretch_branch": string,
  "spaced_recall_hook": string,
  "objective_verb": string,
  "bloom_level": "Remember" | "Understand" | "Apply" | "Analyze" | "Evaluate" | "Create",
  "activity_verb": string,
  "assessment_verb": string,
  "assessment_rubric": string[],
  "cognitive_load_note": string,
  "selected_activity": string,
  "interaction_band_fit": string,
  "screen_layout_note": string,
  "rationale": string,
  "hub_identity_signature": string,
  "pipeline_trace": [{ "stage": "curriculum"|"pedagogy"|"theme"|"story"|"game"|"image"|"reviewer"|"json_generator", "decision": string, "evidence": string, "signed_by": string }],
  "personas_trace": [{ "persona": string, "decision": string, "evidence": string }],
  "design_workflow": { "topic": string, "communication_goal": string, "grammar_frame": string, "mission": string, "story": object, "games": string[], "step_bindings": object, "notes": string },
  "learning_journey_map": { "<target_word>": ["see","hear","touch","move","say","use","repeat"] },
  "emotional_beats": { "surprise": {"slide_index": number, "description": string}, "funny": {...}, "challenge": {...}, "celebration": {...}, "reward": {...}, "emotional": {...}, "memorable_scene": {...} },
  "hall_of_fame": { "scores": [{"id": string, "score_0_to_5": number, "evidence": string}], "total": number, "verdict": "hall_of_fame"|"improve", "improve_target": string },
  "review": { "pass": boolean, "checks": [{"id": string, "pass": boolean, "evidence": string}], "blocker": string }
}`,
  ].join('\n');
}

function architectUserPrompt(req: ArchitectRequest, criticFeedback?: CriticFinding[]): string {
  const ctx = req.context ?? {};
  const lines: string[] = [];
  lines.push("=== SEED (creator input — refine, do not blindly copy) ===");
  lines.push(JSON.stringify(req.seed, null, 2));
  if (ctx.hubProfile) {
    lines.push("\n=== HUB PROFILE ===");
    lines.push(JSON.stringify(ctx.hubProfile, null, 2));
  }
  if (ctx.priorLessons?.length) {
    lines.push("\n=== PRIOR LESSONS (do NOT repeat topic/grammar) ===");
    lines.push(JSON.stringify(ctx.priorLessons.slice(0, 3), null, 2));
  }
  if (ctx.intelligenceSummary) {
    lines.push("\n=== LEARNER INTELLIGENCE SUMMARY ===");
    lines.push(ctx.intelligenceSummary);
  }
  if (ctx.governanceConstraints) {
    lines.push("\n=== GOVERNANCE CONSTRAINTS (HARD) ===");
    lines.push(JSON.stringify(ctx.governanceConstraints, null, 2));
  }
  if (ctx.memoryDue?.length) {
    lines.push("\n=== MEMORY ITEMS DUE FOR REVIEW (weave into review_targets) ===");
    lines.push(ctx.memoryDue.slice(0, 12).join(", "));
  }
  if (ctx.analyticsHints?.length) {
    lines.push("\n=== ANALYTICS HINTS (soft adaptive signals) ===");
    lines.push(ctx.analyticsHints.join(" · "));
  }
  if (criticFeedback?.length) {
    lines.push("\n=== CRITIC FINDINGS TO REPAIR ===");
    for (const f of criticFeedback) {
      lines.push(`- [${f.severity.toUpperCase()}][${f.lens}] ${f.code}: ${f.message}${f.suggestion ? " → " + f.suggestion : ""}`);
    }
    lines.push("\nProduce a REVISED blueprint that resolves every block-level finding. Keep the same hub_identity_signature direction unless a finding says otherwise.");
  }
  lines.push("\nReturn the JSON now.");
  return lines.join("\n");
}

function criticSystemPrompt(req: ArchitectRequest): string {
  return [
    "You are an ESL Curriculum Critic Council — a single reviewer evaluating a candidate LessonPlan blueprint through FIVE lenses, returning structured findings.",
    "",
    "LENSES:",
    "1. pedagogy — ESA flow viability, vocab recycling ≥3 per word feasibility, grammar acquisition sequencing (exposure→noticing→form→controlled→free), Cambridge pedagogy compliance, warm-up actually lowers affective filter.",
    "2. hub_identity — Same CEFR MUST diverge by hub. If this blueprint could plausibly fit ANY hub at this CEFR with only cosmetic edits → BLOCK with code HUB_IDENTITY_DRIFT.",
    "3. adaptive — Does the blueprint act on supplied learner intelligence, memory-due items, prior lessons, analytics hints? Ignored signals → WARN. Contradicted (introduces already-mastered grammar while ignoring weak areas) → BLOCK.",
    "4. cognitive_alignment — Biggs + Sweller + Bloom (§8):",
    "   • objective_verb, activity_verb, assessment_verb MUST all sit at the SAME bloom_level — mismatch → BLOCK COGNITIVE_VERB_MISMATCH.",
    "   • bloom_level must respect hub × age ceiling (§8.3): under-challenge of older/B1+ with Remember/Understand only → WARN COGNITIVE_UNDERCHALLENGE. Forcing abstract Evaluate/Create on PG 4–6 in adult form → BLOCK COGNITIVE_CEILING_BREACH.",
    "   • Intrinsic load: ≤7 new items at Playground; below B1 vary ONLY vocab OR grammar (not both) in same activity — violation → BLOCK COGNITIVE_LOAD_OVERLOAD.",
    "   • Assessment: assessment_verb matches objective_verb's Bloom; never default to MCQ for Apply/Analyze/Evaluate/Create → BLOCK ASSESSMENT_FORMAT_MISMATCH. assessment_rubric must be 3–4 plain-language can-do bullets → WARN RUBRIC_MISSING_OR_NUMERIC if missing.",
    "   • Support and stretch branches MUST reach the SAME Bloom level as core (different scaffolding, same operation) → BLOCK BRANCH_BLOOM_MISMATCH if they drop the level.",
    "5. interface_design — Mayer multimedia + dual-pane + age-band fit (§10):",
    "   • selected_activity MUST come from the §10.3 catalog and fit BOTH the bloom_level AND the band's input ability / visual-complexity tier (§10.2) — mismatch (e.g. drag-and-drop for PG 4–6, debate builder for PG 7–9, childish chimes for AC 13–17, gamified-patronising for SU) → BLOCK INTERFACE_BAND_MISMATCH.",
    "   • screen_layout_note must enforce ONE new idea per screen (segmenting), signal the target item, and contain nothing purely decorative (coherence). Multiple new concepts on one screen, or decorative-only elements → BLOCK MAYER_PRINCIPLE_VIOLATION.",
    "   • Dual-pane separation: any leak of teacher-pane content (pacing cues, branch switches, L1 toggle) into the learner view → BLOCK DUAL_PANE_LEAK.",
    "   • Below A2 with stacked on-screen text + identical audio + image → WARN REDUNDANCY_OVERLOAD.",
    "",
    "SEVERITY:",
    "- block — must be repaired before publish.",
    "- warn  — non-blocking, surface in rationale.",
    "",
    `TARGET: hub=${req.hub} · cefr=${req.cefr}`,
    "",
    "OUTPUT: STRICT JSON, no prose:",
    `{ "findings": [ { "lens": "pedagogy"|"hub_identity"|"adaptive"|"cognitive_alignment"|"interface_design", "severity": "block"|"warn", "code": string, "message": string, "suggestion": string } ] }`,
    "Return { \"findings\": [] } if the blueprint is publish-ready.",
  ].join("\n");
}

// ── Gemini call (direct, with transient retry) ──────────────

const TRANSIENT = new Set([429, 500, 502, 503, 504]);

async function callGemini(
  apiKey: string,
  model: string,
  systemPrompt: string,
  userPrompt: string,
  expectJson: boolean,
): Promise<{ ok: true; text: string; modelUsed: string } | { ok: false; status: number; text: string }> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const body = JSON.stringify({
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    generationConfig: {
      temperature: 0.6,
      topP: 0.9,
      maxOutputTokens: 4096,
      ...(expectJson ? { responseMimeType: "application/json" } : {}),
    },
  });
  const delays = [1200, 2500];
  let lastStatus = 0;
  let lastText = "";
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });
      if (r.ok) {
        const data = await r.json();
        const text =
          data?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text ?? "").join("") ?? "";
        return { ok: true, text, modelUsed: model };
      }
      lastStatus = r.status;
      lastText = await r.text();
      console.error(`[architect] ${model} attempt ${attempt + 1} → ${r.status}`, lastText.slice(0, 200));
      if (!TRANSIENT.has(r.status)) return { ok: false, status: r.status, text: lastText };
    } catch (e) {
      lastText = String(e);
      console.error(`[architect] ${model} attempt ${attempt + 1} threw`, e);
    }
    if (attempt < 2) await new Promise((r) => setTimeout(r, delays[attempt]));
  }
  return { ok: false, status: lastStatus, text: lastText };
}

function safeParseJson<T = any>(raw: string): T | null {
  if (!raw) return null;
  const trimmed = raw.trim().replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  try {
    return JSON.parse(trimmed) as T;
  } catch {
    // best-effort extraction of first JSON object/array
    const m = trimmed.match(/[\[{][\s\S]*[\]}]/);
    if (!m) return null;
    try {
      return JSON.parse(m[0]) as T;
    } catch {
      return null;
    }
  }
}

function validateDraft(d: any): { ok: boolean; reason?: string } {
  if (!d || typeof d !== "object") return { ok: false, reason: "not an object" };
  for (const k of ["lesson_title", "theme", "communication_goal", "hub_identity_signature"]) {
    if (!d[k] || typeof d[k] !== "string") return { ok: false, reason: `missing ${k}` };
  }
  if (!Array.isArray(d.grammar_focus)) return { ok: false, reason: "grammar_focus not array" };
  if (!Array.isArray(d.target_vocab)) return { ok: false, reason: "target_vocab not array" };
  return { ok: true };
}

// ── Main handler ────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  const startedAt = Date.now();

  try {
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "GEMINI_API_KEY not configured" }), {
        status: 500,
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json()) as ArchitectRequest;
    if (!body?.hub || !body?.cefr || !body?.lessonRef) {
      return new Response(JSON.stringify({ error: "hub, cefr and lessonRef are required" }), {
        status: 400,
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // identify creator (best-effort)
    let createdBy: string | null = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const { data: userData } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
        createdBy = userData?.user?.id ?? null;
      } catch {
        /* anon */
      }
    }

    const modelCalls: Array<{ phase: string; model: string; ms: number; ok: boolean }> = [];

    // ── 1. PLAN ────────────────────────────────────────────
    let draft: PlanDraft | null = null;
    let modelUsed = PLAN_MODEL;
    {
      const t0 = Date.now();
      const r = await callGemini(apiKey, PLAN_MODEL, architectSystemPrompt(body), architectUserPrompt(body), true);
      modelCalls.push({ phase: "plan", model: PLAN_MODEL, ms: Date.now() - t0, ok: r.ok });
      if (!r.ok) {
        // fallback to flash for plan
        const t1 = Date.now();
        const r2 = await callGemini(apiKey, FAST_MODEL, architectSystemPrompt(body), architectUserPrompt(body), true);
        modelCalls.push({ phase: "plan-fallback", model: FAST_MODEL, ms: Date.now() - t1, ok: r2.ok });
        if (!r2.ok) {
          return new Response(
            JSON.stringify({ error: "architect_plan_failed", status: r2.status, details: r2.text.slice(0, 400) }),
            { status: 502, headers: { ...CORS, "Content-Type": "application/json" } },
          );
        }
        const parsed = safeParseJson<PlanDraft>(r2.text);
        const v = validateDraft(parsed);
        if (!v.ok) {
          return new Response(JSON.stringify({ error: "architect_plan_invalid", reason: v.reason }), {
            status: 502,
            headers: { ...CORS, "Content-Type": "application/json" },
          });
        }
        draft = parsed!;
        modelUsed = FAST_MODEL;
      } else {
        const parsed = safeParseJson<PlanDraft>(r.text);
        const v = validateDraft(parsed);
        if (!v.ok) {
          return new Response(JSON.stringify({ error: "architect_plan_invalid", reason: v.reason }), {
            status: 502,
            headers: { ...CORS, "Content-Type": "application/json" },
          });
        }
        draft = parsed!;
      }
    }

    // ── 2 + 3. CRITIQUE → REPAIR LOOP ──────────────────────
    let passes = 1;
    let lastFindings: CriticFinding[] = [];
    let status: "ok" | "repaired" | "fallback" = "ok";

    for (let pass = 0; pass <= MAX_REPAIR_PASSES; pass++) {
      if (Date.now() - startedAt > HARD_CAP_MS) {
        status = "fallback";
        break;
      }
      const t0 = Date.now();
      const r = await callGemini(
        apiKey,
        FAST_MODEL,
        criticSystemPrompt(body),
        `CANDIDATE BLUEPRINT:\n${JSON.stringify(draft, null, 2)}\n\nReturn the findings JSON now.`,
        true,
      );
      modelCalls.push({ phase: `critic-${pass}`, model: FAST_MODEL, ms: Date.now() - t0, ok: r.ok });
      if (!r.ok) break; // accept draft if critic itself is down
      const parsed = safeParseJson<{ findings: CriticFinding[] }>(r.text);
      lastFindings = parsed?.findings ?? [];
      const blockers = lastFindings.filter((f) => f.severity === "block");
      if (blockers.length === 0) break;
      if (pass === MAX_REPAIR_PASSES) {
        status = "fallback";
        break;
      }
      // ── REPAIR ──
      passes++;
      const t1 = Date.now();
      const rep = await callGemini(
        apiKey,
        PLAN_MODEL,
        architectSystemPrompt(body),
        architectUserPrompt(body, blockers),
        true,
      );
      modelCalls.push({ phase: `repair-${pass}`, model: PLAN_MODEL, ms: Date.now() - t1, ok: rep.ok });
      if (!rep.ok) {
        status = "fallback";
        break;
      }
      const repParsed = safeParseJson<PlanDraft>(rep.text);
      const v = validateDraft(repParsed);
      if (!v.ok) {
        status = "fallback";
        break;
      }
      draft = repParsed!;
      status = "repaired";
    }

    const durationMs = Date.now() - startedAt;

    // ── 4. PERSIST ─────────────────────────────────────────
    try {
      await supabase.from("architect_runs").insert({
        lesson_ref: body.lessonRef,
        hub: body.hub,
        cefr: body.cefr,
        student_id: body.studentId ?? null,
        status,
        passes,
        tool_calls: modelCalls,
        critic_findings: lastFindings,
        overrides: draft,
        rationale: draft?.rationale ?? null,
        model: modelUsed,
        duration_ms: durationMs,
        created_by: createdBy,
      });
    } catch (e) {
      console.warn("[architect] failed to persist run", e);
    }

    return new Response(
      JSON.stringify({
        status,
        passes,
        overrides: {
          lesson_title: draft!.lesson_title,
          theme: draft!.theme,
          framework: (draft as any).framework ?? null,
          age_band: (draft as any).age_band ?? null,
          grammar_focus: draft!.grammar_focus,
          target_vocab: draft!.target_vocab,
          communication_goal: draft!.communication_goal,
          review_targets: draft!.review_targets ?? [],
          warmup_engage: (draft as any).warmup_engage ?? null,
          support_branch: (draft as any).support_branch ?? null,
          stretch_branch: (draft as any).stretch_branch ?? null,
          spaced_recall_hook: (draft as any).spaced_recall_hook ?? null,
          objective_verb: (draft as any).objective_verb ?? null,
          bloom_level: (draft as any).bloom_level ?? null,
          activity_verb: (draft as any).activity_verb ?? null,
          assessment_verb: (draft as any).assessment_verb ?? null,
          assessment_rubric: (draft as any).assessment_rubric ?? [],
          cognitive_load_note: (draft as any).cognitive_load_note ?? null,
        },
        rationale: draft!.rationale,
        hub_identity_signature: draft!.hub_identity_signature,
        pipeline_trace: (draft as any).pipeline_trace ?? [],
        personas_trace: (draft as any).personas_trace ?? [],
        design_workflow: (draft as any).design_workflow ?? null,
        learning_journey_map: (draft as any).learning_journey_map ?? null,
        emotional_beats: (draft as any).emotional_beats ?? null,
        hall_of_fame: (draft as any).hall_of_fame ?? null,
        review: (draft as any).review ?? null,
        critic_findings: lastFindings,
        model_calls: modelCalls,
        duration_ms: durationMs,
      }),
      { status: 200, headers: { ...CORS, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("[architect] fatal", e);
    return new Response(JSON.stringify({ error: "architect_fatal", message: String(e) }), {
      status: 500,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});
