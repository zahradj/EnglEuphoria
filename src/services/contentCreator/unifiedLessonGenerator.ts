// Unified Lesson Generator
// ------------------------
// Single entry point for all three creators (Playground, Academy, Success).
// Wraps runLessonGeneration() with hub-specific config and emits the
// structured lesson object specified in the Creator Dashboard contract.

import { runLessonGeneration } from '@/orchestrator';
import type { OrchestrationInput, LessonContext } from '@/orchestrator/types';
import type { ActivityAIClient } from '@/activities/types';
import { supabase } from '@/integrations/supabase/client';
import { getHubConfig, type HubCreatorConfig } from './hubConfigurations';
import type { Hub, Cefr } from '@/governance/types';
import { buildCriticPrompt, type LessonCriticResult } from '@/qa/judges/lessonCritic';

/**
 * Stage filter — controls which engines downstream consumers persist.
 * The orchestrator pipeline always runs end-to-end (planner → governance →
 * adaptive → pronunciation → gamification → activities → QA → stabilization)
 * because every engine feeds the next. The stage filter only narrows what
 * the caller treats as the "primary deliverable" of this run:
 *
 *   - 'all'       — full lesson (default)
 *   - 'story'     — slide deck only, gamification suppressed in slide list
 *   - 'games'     — emits gamification_layer + reward slide, no narrative
 *   - 'homework'  — emits homework_missions, slides ignored
 *   - 'review'    — same as 'all' but flags lesson as a spiral review
 */
export type LessonStage = 'all' | 'story' | 'games' | 'homework' | 'review';

export interface UnifiedLessonInput {
  hub: Hub;
  cefr?: Cefr;
  unitId: string;
  lessonId: string;
  studentId?: string;
  ai: ActivityAIClient;
  /** Default 'all'. See LessonStage. */
  stage?: LessonStage;
  blueprint: {
    title: string;
    theme: string;
    grammarFocus: string[];
    targetVocab: string[];
    communicationGoal: string;
    reviewTargets?: string[];
  };
  /** Playground lesson kind L1–L7 — activates PLAYGROUND_LESSON_CONTRACT
   *  (required/forbidden activities, media recipe, homework recipe). */
  lessonKind?: import('@/planning/playgroundUnitTemplates').PlaygroundLessonKind;
  /** Unit theme used by storybook + media planner. Falls back to blueprint.theme. */
  unitTheme?: string;
  /** Optional per-student storybook art style override. */
  storybookStylePref?: import('@/storybook/artStyle').StorybookArtStyle | null;
  /** Expert Lesson Architect mode — when true, runs the tool-using AI
   *  agent (architect-lesson-plan edge fn) BEFORE the deterministic
   *  orchestrator, replacing the blueprint with an enriched, critiqued,
   *  hub-identity-locked variant. Falls back transparently on failure. */
  expertMode?: boolean;
  /** Optional callback fired with the architect's rationale + critic
   *  findings so the UI can show transparent reasoning. */
  onArchitectResult?: (r: import('@/architect').ArchitectResult) => void;
  /** Playground Creator — teacher-authored homework tasks. When supplied,
   *  the coherence engine pins these into the HomeworkPack instead of
   *  generating one. */
  authoredHomework?: import('@/coherence').AuthoredHomeworkInput;
  /** Playground Creator — teacher-authored game rounds. */
  authoredGames?: import('@/coherence').AuthoredGamePackInput;
}

export type SlideType =
  | 'hook_warmup'
  | 'context_intro'
  | 'input_vocab'
  | 'input_grammar'
  | 'input_reading'
  | 'guided_practice'
  | 'interactive_practice'
  | 'production'
  | 'review_reinforcement'
  | 'gamification_reward';

export interface UnifiedSlide {
  id: string;
  type: SlideType;
  content: Record<string, unknown>;
  teacher_notes?: string;
  interaction_type?: string;
}

export interface UnifiedLessonOutput {
  lesson_metadata: {
    lesson_id: string;
    unit_id: string;
    title: string;
    cefr: Cefr;
    hub: Hub;
    generated_at: string;
    orchestrator_version: string;
    state_hash: string;
    duration_minutes: number;
  };
  hub: Hub;
  hub_config: HubCreatorConfig;
  blueprint: UnifiedLessonInput['blueprint'];
  lesson_state: unknown;
  slides: UnifiedSlide[];
  pronunciation_layer: unknown;
  phonics_layer: unknown;
  adaptive_layer: unknown;
  gamification_layer: unknown;
  homework_pack: import('@/coherence/types').HomeworkPack | null;
  game_pack: import('@/coherence/types').GamePack | null;
  validation_report: {
    qa: unknown;
    stabilization: unknown;
    verdict: 'publish' | 'repair' | 'block';
    passed: boolean;
  };
  stage: LessonStage;
  architect: import('@/architect').ArchitectResult | null;
}


const STAGE_TO_SLIDE: Record<string, SlideType> = {
  warmup: 'hook_warmup',
  prime: 'context_intro',
  mimic: 'guided_practice',
  practice: 'interactive_practice',
  produce: 'production',
  cooloff: 'review_reinforcement',
};

function mapPurposeToSlide(stage: string, type: string): SlideType {
  const base = STAGE_TO_SLIDE[String(stage).toLowerCase()];
  if (base) return base;
  if (String(type).toLowerCase().includes('vocab')) return 'input_vocab';
  if (String(type).toLowerCase().includes('grammar')) return 'input_grammar';
  if (String(type).toLowerCase().includes('reading')) return 'input_reading';
  return 'interactive_practice';
}

function compileSlides(ctx: LessonContext): UnifiedSlide[] {
  const slides: UnifiedSlide[] = ctx.activities.map((a, idx) => ({
    id: `slide_${idx + 1}_${a.id}`,
    type: mapPurposeToSlide(String(a.stage), String(a.type)),
    content: {
      activity_type: a.type,
      stage: a.stage,
      modalities: a.modalities,
      target_vocab: a.target_vocab_used,
      grammar_targets: a.grammar_targets_used,
      payload: a.content,
    },
    teacher_notes: (a.content as Record<string, unknown> | undefined)?.teacher_notes as
      | string
      | undefined,
    interaction_type: (a.modalities ?? []).join('+') || undefined,
  }));

  // Append gamification/reward closing slide.
  if (ctx.gamification) {
    slides.push({
      id: `slide_${slides.length + 1}_reward`,
      type: 'gamification_reward',
      content: {
        xp: (ctx.gamification as any)?.xpAwards ?? [],
        missions: (ctx.gamification as any)?.missions ?? [],
        achievements: (ctx.gamification as any)?.achievements ?? [],
      },
      interaction_type: 'celebration',
    });
  }
  return slides;
}

async function persistReport(
  lessonId: string,
  studentId: string | undefined,
  ctx: LessonContext,
  finalVerdict: 'pass' | 'repair' | 'block',
) {
  const stab = (ctx.qa as any)?.stabilization;
  if (!stab) return;
  try {
    await supabase.from('pedagogical_quality_reports' as any).insert({
      lesson_id: lessonId,
      student_id: studentId ?? null,
      verdicts: stab.validators ?? [],
      metrics: stab.validators?.reduce(
        (acc: Record<string, unknown>, v: any) => ({ ...acc, [v.validator]: v.metrics }),
        {},
      ) ?? {},
      repairs_applied: stab.repairsApplied ?? [],
      final_verdict: finalVerdict,
    });
  } catch {
    // Non-fatal — telemetry only.
  }
}

export async function generateUnifiedLesson(
  input: UnifiedLessonInput,
): Promise<UnifiedLessonOutput> {
  const cfg = getHubConfig(input.hub);
  const cefr = input.cefr ?? cfg.defaultCefr;

  // ── Expert Lesson Architect (default ON per Curriculum Brain contract) ─
  // Runs the 8-brain pipeline (Curriculum → Pedagogy → Theme → Story → Game →
  // Image → Reviewer → JSON) before the deterministic orchestrator. Any
  // failure falls back transparently to the raw user blueprint. Callers may
  // still opt out by passing `expertMode: false` explicitly.
  let effectiveBlueprint = input.blueprint;
  let architectResultForQA: import('@/architect').ArchitectResult | undefined;
  const { ARCHITECT_DEFAULT_ENABLED } = await import('@/architect');
  const architectEnabled = input.expertMode ?? ARCHITECT_DEFAULT_ENABLED;

  if (architectEnabled) {
    try {
      const [{ runExpertArchitect, buildArchitectContext }] = await Promise.all([
        import('@/architect'),
      ]);
      const ctx = buildArchitectContext({ hub: input.hub, cefr });
      const architectResult = await runExpertArchitect({
        hub: input.hub,
        cefr,
        lessonRef: `${input.unitId}/${input.lessonId}`,
        studentId: input.studentId,
        seed: {
          title: input.blueprint.title,
          theme: input.blueprint.theme,
          grammarFocus: input.blueprint.grammarFocus,
          targetVocab: input.blueprint.targetVocab,
          communicationGoal: input.blueprint.communicationGoal,
          reviewTargets: input.blueprint.reviewTargets,
        },
        context: ctx,
      });
      if (architectResult && architectResult.status !== 'fallback') {
        const o = architectResult.overrides;
        effectiveBlueprint = {
          title: o.lesson_title || input.blueprint.title,
          theme: o.theme || input.blueprint.theme,
          grammarFocus: o.grammar_focus?.length ? o.grammar_focus : input.blueprint.grammarFocus,
          targetVocab: o.target_vocab?.length ? o.target_vocab : input.blueprint.targetVocab,
          communicationGoal: o.communication_goal || input.blueprint.communicationGoal,
          reviewTargets: o.review_targets?.length ? o.review_targets : input.blueprint.reviewTargets,
        };
        architectResultForQA = architectResult;
        input.onArchitectResult?.(architectResult);
      } else if (architectResult) {
        architectResultForQA = architectResult;
        input.onArchitectResult?.(architectResult);
      }

    } catch (e) {
      console.warn('[unifiedLessonGenerator] expertMode failed, using raw blueprint', e);
    }
  }

  const orchestratorInput: OrchestrationInput = {
    hub: input.hub,
    cefr,
    unitId: input.unitId,
    lessonId: input.lessonId,
    studentId: input.studentId,
    ai: input.ai,
    architect: architectResultForQA,
    blueprintOverrides: {

      lesson_title: effectiveBlueprint.title,
      theme: effectiveBlueprint.theme,
      grammar_focus: effectiveBlueprint.grammarFocus,
      target_vocab: effectiveBlueprint.targetVocab,
      communication_goal: effectiveBlueprint.communicationGoal,
      review_targets: effectiveBlueprint.reviewTargets ?? [],
    },
    lessonKind: input.lessonKind,
    unitTheme: input.unitTheme ?? effectiveBlueprint.theme,
    storybookStylePref: input.storybookStylePref ?? null,
    authoredHomework: input.authoredHomework,
    authoredGames: input.authoredGames,
    criticRunner: input.ai
      ? async (qaLesson) => {
          try {
            const raw = await input.ai!({
              systemPrompt: 'You are a strict CEFR-certified curriculum critic. Reply ONLY with valid JSON.',
              userPrompt: buildCriticPrompt(qaLesson),
            });
            const match = raw.match(/\{[\s\S]*\}/);
            if (!match) return undefined;
            const parsed = JSON.parse(match[0]);
            const scores = parsed.scores ?? {};
            const overall = Math.round(
              (scores.pedagogical_flow ?? 0) * 0.25 +
                (scores.vocab_recycling ?? 0) * 0.25 +
                (scores.speaking_authenticity ?? 0) * 0.2 +
                (scores.character_coherence ?? 0) * 0.15 +
                (scores.engagement_variety ?? 0) * 0.15,
            );
            return {
              scores,
              overall,
              verdict: parsed.verdict ?? 'publish',
              rationale: parsed.rationale ?? '',
              weak_axes: parsed.weak_axes ?? [],
              raw: parsed,
            } as LessonCriticResult;
          } catch (e) {
            console.warn('[unifiedLessonGenerator] criticRunner failed', e);
            return undefined;
          }
        }
      : undefined,
  };

  const result = await runLessonGeneration(orchestratorInput);
  const { context, verdict } = result;

  const stabVerdict =
    (context.qa as any)?.stabilization?.finalVerdict ?? (verdict === 'publish' ? 'pass' : verdict);
  await persistReport(input.lessonId, input.studentId, context, stabVerdict);

  const stage: LessonStage = input.stage ?? 'all';
  const allSlides = compileSlides(context);
  let slides = allSlides;
  if (stage === 'games') {
    slides = allSlides.filter((s) => s.type === 'gamification_reward');
  } else if (stage === 'homework') {
    slides = [];
  } else if (stage === 'story') {
    slides = allSlides.filter((s) => s.type !== 'gamification_reward');
  }

  // Hub-locked total duration: Playground=30, Academy/Success=60.
  const durationMinutes = input.hub === 'playground' ? 30 : 60;

  return {
    lesson_metadata: {
      lesson_id: input.lessonId,
      unit_id: input.unitId,
      title: input.blueprint.title,
      cefr,
      hub: input.hub,
      generated_at: context.meta.generatedAt,
      orchestrator_version: context.meta.orchestratorVersion,
      state_hash: context.meta.stateHash,
      duration_minutes: durationMinutes,
    },
    hub: input.hub,
    hub_config: cfg,
    blueprint: input.blueprint,
    lesson_state: context.lessonState,
    slides,
    pronunciation_layer: context.pronunciation,
    phonics_layer: (context.pronunciation as any)?.layers?.phonics ?? null,
    adaptive_layer: context.adaptive,
    gamification_layer: context.gamification,
    homework_pack: result.coherenceDecision?.homework ?? null,
    game_pack: result.coherenceDecision?.game ?? null,
    validation_report: {
      qa: context.qa,
      stabilization: (context.qa as any)?.stabilization ?? null,
      verdict,
      passed: result.passed,
    },
    architect: architectResultForQA ?? null,
    stage,
  };

}

// ─── Persistence ──────────────────────────────────────────────────────────
// Upserts the unified lesson output into curriculum_lessons using the same
// unique slot key (created_by, target_system, slot_cefr_level,
// slot_unit_number, slot_lesson_number) that the Blueprint Engine writes,
// so a single lesson row is reused across blueprint draft → unified gen →
// publish. No duplicates by construction.

const hubToTargetSystem = (hub: Hub): string => {
  if (hub === 'playground') return 'kids';
  if (hub === 'academy') return 'teen';
  return 'adult';
};

const cefrToDifficulty = (cefr: string): 'beginner' | 'intermediate' | 'advanced' => {
  const c = cefr.toUpperCase();
  if (['PRE-A1', 'A1', 'A2'].includes(c)) return 'beginner';
  if (['B1', 'B2'].includes(c)) return 'intermediate';
  return 'advanced';
};

export interface SaveUnifiedLessonArgs {
  output: UnifiedLessonOutput;
  /** Blueprint coordinates — drive the upsert slot key. */
  unitNumber: number;
  lessonNumber: number;
  unitTitle?: string;
  curriculumTitle?: string;
  themeHint?: string;
}

export interface SaveUnifiedLessonResult {
  ok: boolean;
  lessonId?: string;
  error?: string;
}

export async function saveUnifiedLessonToLibrary(
  args: SaveUnifiedLessonArgs,
): Promise<SaveUnifiedLessonResult> {
  const { output } = args;

  if (output.validation_report.verdict === 'block') {
    return { ok: false, error: 'Lesson is blocked by validation — cannot save.' };
  }

  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData.user) {
    return { ok: false, error: 'You must be signed in.' };
  }
  const uid = userData.user.id;

  const cefr = output.lesson_metadata.cefr.toUpperCase();
  const targetSystem = hubToTargetSystem(output.hub);
  const difficulty = cefrToDifficulty(cefr);
  const globalOrder = args.unitNumber * 100 + args.lessonNumber;

  const row = {
    title: output.lesson_metadata.title,
    description: output.blueprint.communicationGoal || null,
    target_system: targetSystem,
    difficulty_level: difficulty,
    duration_minutes: output.lesson_metadata.duration_minutes,
    is_published: output.validation_report.verdict === 'publish',
    created_by: uid,
    sequence_order: globalOrder,
    skills_focus: output.blueprint.grammarFocus ?? [],
    content: {
      slides: output.slides,
      homework_missions: [],
      // Persisted so the lesson player can render the Homework panel + CTA.
      homework_pack: output.homework_pack,
      game_pack: output.game_pack,
      hub: output.hub,
    },
    // Slot keys MUST match the unique index used by onConflict.
    slot_cefr_level: cefr,
    slot_unit_number: String(args.unitNumber),
    slot_lesson_number: String(args.lessonNumber),
    ai_metadata: {
      cefr_level: cefr,
      hub: output.hub,
      duration_minutes: output.lesson_metadata.duration_minutes,
      unit_title: args.unitTitle ?? null,
      unit_number: args.unitNumber,
      lesson_number: args.lessonNumber,
      curriculum_title: args.curriculumTitle ?? null,
      theme_hint: args.themeHint ?? null,
      unified_output: {
        lesson_state: output.lesson_state,
        pronunciation_layer: output.pronunciation_layer,
        phonics_layer: output.phonics_layer,
        adaptive_layer: output.adaptive_layer,
        gamification_layer: output.gamification_layer,
        homework_pack: output.homework_pack,
        game_pack: output.game_pack,
        validation_report: output.validation_report,
        orchestrator_version: output.lesson_metadata.orchestrator_version,
        state_hash: output.lesson_metadata.state_hash,
        blueprint_hash: output.lesson_metadata.state_hash,
        generated_at: output.lesson_metadata.generated_at,
      },
    },
  };

  try {
    const { data, error } = await supabase
      .from('curriculum_lessons')
      .upsert([row] as any, {
        onConflict: 'created_by,target_system,slot_cefr_level,slot_unit_number,slot_lesson_number',
        ignoreDuplicates: false,
      })
      .select('id')
      .single();
    if (error) throw error;
    return { ok: true, lessonId: (data as any)?.id };
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Unknown DB error' };
  }
}
