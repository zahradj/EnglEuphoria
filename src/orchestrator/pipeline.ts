// Master Curriculum Orchestration Engine — pipeline.
// Single entry point for end-to-end lesson generation.

import { generateLessonPlan } from '@/planning/lessonPlanner';
import { topicToVocabScene } from './topicToEnvironment';
import { runAdaptation } from '@/adaptive';
import { runPronunciation } from '@/pronunciation/pronunciationRunner';
import { runGamification } from '@/gamification/orchestrator';
import { classifyMotivation } from '@/gamification/motivation/motivationProfiler';
import { buildLearnerProfile } from '@/adaptive/profile/profileBuilder';
import { generateActivities } from '@/activities/generation/activityGenerator';
import { runQualityControl } from '@/qa';
import type { QALesson } from '@/qa/types';
import { runStabilization } from '@/stabilization';
import { runGrammar, type GrammarPackage } from '@/grammar';
import { runMemoryOptimization, buildMemorySystemPrompt, validateMemory, type MemoryDecision } from '@/memory';
import {
  runSpeakingOptimization,
  buildSpeakingSystemPrompt,
  validateSpeaking,
  type SpeakingDecision,
} from '@/speaking';
import { runCoherence, buildCoherenceSystemPrompt, type CoherenceDecision } from '@/coherence';
import { runArcade, buildArcadeSystemPrompt, validateArcade, type ArcadeDecision } from '@/arcade';
import { buildPhonicsGatePromptAddendum } from '@/pronunciation/earlyReaderTrack';
import { applyPhonicsIntelligibilitySwap } from '@/qa/repairs/phonicsIntelligibilitySwap';
import { runDeterministicQA } from '@/qa';
import { validateVocabModalitySequencing } from '@/qa/validators/vocabModalitySequencing';
import { mapCriticResultToIssues, type LessonCriticResult } from '@/qa/judges/lessonCritic';
import { logRepairEvents } from '@/qa/telemetry/repairEvents';
import { logBlueprintQAOutcome } from '@/qa/telemetry/blueprintOutcome';


import { runStage } from './stageRunner';
import { composePromptChain } from './promptChain';
import {
  ORCHESTRATOR_VERSION,
  type LessonContext,
  type OrchestrationInput,
  type OrchestrationResult,
  type StageReport,
} from './types';

function stateHash(s: unknown): string {
  const str = JSON.stringify(s);
  let h = 0;
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  return `ctx_${(h >>> 0).toString(16)}`;
}

/** Adapter: planning/governance use lowercase hub; adaptive/qa use Capitalized. */
function capitalizeHub(h: 'playground' | 'academy' | 'success') {
  return (h.charAt(0).toUpperCase() + h.slice(1)) as 'Playground' | 'Academy' | 'Success';
}

/**
 * runLessonGeneration — THE single pipeline for lesson generation.
 *
 *   1. Curriculum selection (caller supplies unit + lesson)
 *   2. Blueprint creation
 *   3. LessonState (governance contract)
 *   4. Pedagogical flow planning (+ hard-gate validation)
 *   5. Adaptive personalization
 *   6. Pronunciation injection
 *   7. Gamification layering
 *   8. Activity generation (with composed prompt chain)
 *   9. Quality validation
 *  10. Publish gate
 *
 * No engine outside this pipeline is allowed to be called directly during
 * lesson generation. See mem://index.md > Orchestration.
 */
export async function runLessonGeneration(
  input: OrchestrationInput,
): Promise<OrchestrationResult> {
  const reports: StageReport[] = [];
  const collect = <T,>(r: { value: T; report: StageReport }) => {
    reports.push(r.report);
    return r.value;
  };

  // 1 + 2 — Curriculum + Blueprint
  // We assume the caller resolved the unit/lesson identity; we pass overrides into planner.
  const overrides = input.blueprintOverrides ?? {};
  // Cycle 5 — hub lock hard-overrides the hub for the rest of the pipeline.
  // The 3-Brain edge functions set this so context cannot leak between hubs.
  const effectiveHub = input.hubLock ?? input.hub;
  const blueprintInput = {
    hub: effectiveHub,
    cefr_level: input.cefr,
    lesson_title: overrides.lesson_title ?? `Lesson ${input.lessonId}`,
    theme: overrides.theme ?? 'everyday english',
    grammar_focus: overrides.grammar_focus ?? [],
    target_vocab: overrides.target_vocab ?? [],
    communication_goal:
      overrides.communication_goal ?? 'communicate clearly in a short real-world exchange',
    review_targets: overrides.review_targets ?? [],
    unit_theme: input.unitTheme,
    scene_phrase: input.unitTheme ? topicToVocabScene(input.unitTheme) : undefined,
  };

  // 3 + 4 — LessonState + Plan (hard gate)
  const planResult = collect(
    await runStage('flow_planning', () => generateLessonPlan(blueprintInput), {
      warnIf: (r) => r.validation.warnings.map((w) => `${w.code}: ${w.message}`),
    }),
  );
  if (!planResult.validation.passed) {
    throw new Error(
      `Pipeline aborted at flow_planning: ${planResult.validation.errors
        .map((e) => e.code)
        .join(', ')}`,
    );
  }
  const plan = planResult.plan;
  const lessonState = plan.lesson_state;

  // 5 — Adaptive personalization. If the Educational Intelligence Layer
  // supplied a brain, use its slices instead of the empty defaults.
  const intel = input.intelligence;
  const adaptiveResult = collect(
    await runStage('adaptive_personalization', () => {
      const profile =
        input.learnerProfile ??
        buildLearnerProfile({
          student_id: input.studentId ?? intel?.learner_profile.studentId ?? 'anonymous',
          hub: capitalizeHub(input.hub),
          cefr_level: input.cefr,
        });
      return runAdaptation({
        profile,
        mastery: input.mastery ?? (intel ? Object.values(intel.mastery_map) : []),
        errors: input.errors ?? (intel?.error_patterns ?? []),
        engagement:
          input.engagement ?? (intel
            ? {
                confidence: intel.speaking_confidence.tier === 'fluent' ? 90
                  : intel.speaking_confidence.tier === 'confident' ? 75
                  : intel.speaking_confidence.tier === 'emerging' ? 55 : 40,
                motivation: intel.engagement_state.attention_score,
                frustration_risk: 100 - intel.engagement_state.attention_score,
                speaking_turn_ratio: Math.min(1, intel.speaking_confidence.voluntary_attempts_7d / 14),
                completion_rate: 0.7,
                hesitation_latency_ms: intel.speaking_confidence.hesitation_avg_ms || 800,
              }
            : {
                confidence: 60,
                motivation: 70,
                frustration_risk: 20,
                speaking_turn_ratio: 0.5,
                completion_rate: 0.7,
                hesitation_latency_ms: 800,
              }),
      });
    }),
  );

  // 5.5 — Grammar Acquisition Engine (between adaptive and pronunciation)
  const primaryGrammar = (plan.blueprint.grammar_focus?.[0] ?? '').toString();
  let grammarPackage: GrammarPackage | null = null;
  if (primaryGrammar) {
    grammarPackage = collect(
      await runStage('adaptive_personalization', () =>
        Promise.resolve(
          runGrammar({
            hub: input.hub,
            cefr: input.cefr,
            target: {
              id: `grammar_${input.lessonId}`,
              label: primaryGrammar,
              scopeTokens: [primaryGrammar],
              appliesTo: 'structure',
            },
            planObjective: plan.communication.goal,
          }),
        ),
      ),
    );
  }

  // 6 — Pronunciation injection
  const pronunciation = collect(
    await runStage('pronunciation_injection', () =>
      runPronunciation({ plan, lessonKind: 'normal' }),
    ),
  );


  // 7 — Gamification layering
  const gamification = collect(
    await runStage('gamification_layering', () => {
      const motivationProfile =
        input.motivationProfile ??
        classifyMotivation({
          studentId: input.studentId ?? 'anonymous',
          hub: input.hub,
          signals: {},
        });
      return runGamification({
        studentId: input.studentId ?? 'anonymous',
        hub: input.hub,
        plan: {
          objective: plan.communication.goal,
          targetVocab: plan.blueprint.target_vocab,
          grammarFocus: plan.blueprint.grammar_focus,
        },
        motivationProfile,
        adaptiveContext: {
          masteryRising: adaptiveResult.context.engagement.confidence > 65,
          difficultyTier: adaptiveResult.context.difficulty.challenge_tier,
        },
      });
    }),
  );

  // Explicit Grammar Selection — decision happens BEFORE the generator
  // sees anything. Generator must obey `target_grammar` only.
  const { selectGrammar } = await import('@/planning/grammarPlanner');
  const grammarPlan = selectGrammar({
    cefr: input.cefr as any,
    hub: input.hub,
    topic: plan.blueprint.theme ?? blueprintInput.theme ?? 'General',
    communication_objective: plan.communication.goal,
    vocab: plan.blueprint.target_vocab ?? [],
    prior_grammar: (input as any).priorGrammar ?? [],
  });

  // Compose unified prompt chain
  const partialCtx: Omit<LessonContext, 'meta' | 'activities' | 'qa'> = {
    hub: effectiveHub,
    cefr: input.cefr,
    lessonState,
    plan,
    grammarPlan,
    adaptive: adaptiveResult.context,
    pronunciation,
    gamification,
  };
  const { systemPrompt: baseChainPrompt, hash: promptChainHash } = composePromptChain(
    partialCtx,
    { prependPrompts: input.prependPrompts },
  );
  // Narrative Continuity (Educational Intelligence Layer) — carries
  // recurring characters / arcs / last beat into every downstream prompt.
  const narrativeHint = intel
    ? (await import('@/intelligence').then(m => m.buildNarrativeContinuityHint(intel.narrative_state))).trim()
    : '';

  // Review & Memory Optimization System — runs after intelligence assembly,
  // before activity generation. Decision is also persisted post-publish.
  let memoryDecision: MemoryDecision | null = null;
  if (intel && input.memoryItems && input.memoryItems.length > 0) {
    memoryDecision = runMemoryOptimization({
      studentId: input.studentId ?? intel.learner_profile.studentId,
      hub: input.hub,
      cefr: input.cefr,
      intelligence: intel,
      items: input.memoryItems,
    });
  }
  const memoryPrompt = memoryDecision ? buildMemorySystemPrompt(memoryDecision) : '';

  // 7.5 — Speaking & Fluency Optimization (after memory, before gamification)
  const speakingDecision: SpeakingDecision = runSpeakingOptimization({
    hub: input.hub,
    cefr: input.cefr,
    intelligence: intel,
    plan: {
      targetVocab: plan.blueprint.target_vocab ?? [],
      grammarFocus: plan.blueprint.grammar_focus ?? [],
      communicationGoal: plan.communication.goal,
      modelLines: undefined,
    },
    totalPlannedActivities: Math.max(6, plan.flow_map?.length ?? 8),
    pronunciationFocus: pronunciation?.focus?.target_sounds ?? [],
    priorState: undefined,
  });
  const speakingPrompt = buildSpeakingSystemPrompt(speakingDecision);

  // 9.7 — Game & Homework Coherence Engine (after gamification + speaking, before activities)
  const coherenceDecision: CoherenceDecision = runCoherence({
    hub: input.hub,
    cefr: input.cefr,
    studentId: input.studentId ?? intel?.learner_profile.studentId ?? 'anonymous',
    lessonId: input.lessonId,
    lessonVocab: plan.blueprint.target_vocab ?? [],
    lessonGrammar: plan.blueprint.grammar_focus ?? [],
    pronunciationTargets: pronunciation?.focus?.target_sounds ?? [],
    intelligence: intel,
    memory: memoryDecision,
    speaking: speakingDecision,
    grammar: grammarPackage,
    adaptive: adaptiveResult.context,
    hubDrift: input.priorHubDrift === true,
    authoredHomework: input.authoredHomework,
    authoredGames: input.authoredGames,
    unitTheme: input.unitTheme,
    scenePhrase: input.unitTheme ? topicToVocabScene(input.unitTheme) : undefined,
  });
  const coherencePrompt = buildCoherenceSystemPrompt(coherenceDecision);

  // 9.8 — Gamer Arcade (after coherence, before activities). Tier 6 soft.
  const arcadeDecision: ArcadeDecision = runArcade({
    hub: input.hub,
    cefr: input.cefr,
    studentId: input.studentId ?? intel?.learner_profile.studentId ?? 'anonymous',
    lessonId: input.lessonId,
    intelligence: intel,
    coherence: coherenceDecision,
    lessonVocab: plan.blueprint.target_vocab ?? [],
    lessonGrammar: plan.blueprint.grammar_focus ?? [],
    memoryDueCount: memoryDecision?.review_queue?.length ?? 0,
  });
  const arcadePrompt = buildArcadeSystemPrompt(arcadeDecision);

  // 8.5 — Video Lesson track (opt-in per lesson via input.videoLessonEnabled).
  // Feature-flag off by default; when on, composes the deterministic spec.
  // Actual video/frame rendering is delegated to the edge function; here we
  // only produce the directive + comprehension question shape.
  let videoLessonSpec: import('@/video').VideoLessonSpec | null = null;
  if (input.videoLessonEnabled) {
    const { runVideoLesson } = await import('@/video');
    const targets =
      input.videoLessonInput?.targets ??
      coherenceDecision.homework.tasks
        .map((t) => coherenceDecision.targets.find((rt) => rt.id === t.reinforcement_target_id))
        .filter((x): x is NonNullable<typeof x> => Boolean(x));
    const vlResult = runVideoLesson({
      cefr: input.cefr,
      hub: input.hub,
      topic: input.videoLessonInput?.topic ?? plan.blueprint.theme ?? 'lesson',
      characters: input.videoLessonInput?.characters ?? [],
      vocab: input.videoLessonInput?.vocab ?? plan.blueprint.target_vocab ?? [],
      targets,
      lessonId: input.lessonId,
    });
    if (vlResult.verdict !== 'blocked') videoLessonSpec = vlResult.spec;
  }


  // Tier-6 analytics hint (soft, advisory). Chained AFTER arcade, BEFORE activity.
  const { buildAnalyticsHintPrompt } = await import('@/analytics');
  const analyticsHint = buildAnalyticsHintPrompt(input.analyticsSignals ?? []);

  // Phonics early-reader gate addendum — at generation time, not only QA.
  const phonicsGatePrompt = buildPhonicsGatePromptAddendum(effectiveHub, input.cefr);

  const chainPrompt = [
    baseChainPrompt,
    grammarPackage ? grammarPackage.systemPrompt : '',
    narrativeHint,
    memoryPrompt,
    speakingPrompt,
    coherencePrompt,
    arcadePrompt,
    analyticsHint,
    phonicsGatePrompt,
  ].filter(Boolean).join('\n\n');

  // 8 — Activity generation
  // We wrap the caller's AI client so every call carries the full prompt chain.
  const wrappedAi = async (args: { systemPrompt: string; userPrompt: string }) =>
    input.ai({
      systemPrompt: `${chainPrompt}\n\n${args.systemPrompt}`,
      userPrompt: args.userPrompt,
    });

  // Build intelligence hint for fitScorer's tier-6 boosts (vocab_match_board,
  // low-confidence speaking rungs, low-engagement playful types, etc.).
  const intelligenceHint = intel ? {
    speaking_confidence:
      intel.speaking_confidence?.tier === 'fluent' ? 0.95 :
      intel.speaking_confidence?.tier === 'confident' ? 0.75 :
      intel.speaking_confidence?.tier === 'emerging' ? 0.45 : 0.2,
    memory_due_count: intel.review_priority?.length ?? 0,
    engagement: Math.max(0, Math.min(1, (intel.engagement_state?.attention_score ?? 70) / 100)),
    recent_error_tags: (intel.error_patterns ?? [])
      .slice(0, 5)
      .map((e) => `grammar:${e.category}`),
  } : undefined;

  const activityResult = collect(
    await runStage('activity_generation', () => generateActivities({ plan, ai: wrappedAi, intelligence: intelligenceHint })),
  );

  // 6.5 — Media planner (Playground only). Emits the canonical asset
  // recipe (vocab/scene images, audio clips, warmup song, storybook pages
  // + storybook art style) per L1–L7 contract. Persisted post-generation.
  const { runMediaPlan } = await import('@/media');
  const mediaPlan = runMediaPlan({
    plan,
    lessonKind: input.lessonKind,
    unitTheme: input.unitTheme,
    learnerStylePref: input.storybookStylePref ?? null,
  });

  // 9 — Quality validation
  // Lift ESA + chunk metadata from the planner so QA sees a fully-declared
  // Playground artifact (Wave 2 hard gates: PG_ESA_SHAPE_UNDECLARED / PG_CHUNKS_UNDECLARED).
  const planAny = plan as unknown as {
    esa?: { shape?: 'straight_arrow' | 'boomerang' | 'patchwork' };
    chunks?: unknown[];
    blueprint?: { esa_shape?: 'straight_arrow' | 'boomerang' | 'patchwork'; chunk_targets?: number };
  };
  const esaShape = planAny.esa?.shape ?? planAny.blueprint?.esa_shape;
  const chunkTargets =
    typeof planAny.blueprint?.chunk_targets === 'number'
      ? planAny.blueprint!.chunk_targets
      : Array.isArray(planAny.chunks)
        ? planAny.chunks.length
        : undefined;

  const qaLesson: QALesson = {
    id: input.lessonId,
    hub: capitalizeHub(input.hub),
    cefr: input.cefr,
    unit_id: input.unitId,
    title: plan.blueprint.lesson_title,
    communication_objective: plan.communication.goal,
    lesson_kind: input.lessonKind,
    media_plan: mediaPlan ? (mediaPlan as unknown as QALesson['media_plan']) : undefined,
    meta: {
      ...(esaShape ? { esa_shape: esaShape } : {}),
      ...(chunkTargets !== undefined ? { chunk_targets: chunkTargets } : {}),
      ...(input.architect ? { architect: input.architect } : {}),
    } as QALesson['meta'],

    slides: activityResult.activities.map((a, i) => ({
      id: `slide_${i + 1}`,
      kind: a.purpose,
      title: `${a.type} — ${a.stage}`,
      activities: [
        {
          id: a.id,
          type: a.type,
          purpose: a.purpose,
          stage: a.stage,
          modalities: a.modalities,
          target_vocab_used: a.target_vocab_used,
          grammar_targets_used: a.grammar_targets_used,
          narrative_anchor: a.narrative_anchor,
          content: a.content,
        },
      ],
    })),
  };

  let qaOutcome = collect(
    await runStage('quality_validation', () => runQualityControl({ lesson: qaLesson })),
  );

  // Fire-and-forget telemetry: which repair buckets/codes fired this pass.
  void logRepairEvents(
    {
      lessonId: input.lessonId,
      hub: qaLesson.hub,
      cefr: input.cefr,
      lessonKind: input.lessonKind,
      passNo: 1,
      verdict: qaOutcome.report.verdict,
    },
    qaOutcome.repairs,
  );

  // Fire-and-forget telemetry: A1 / Pre-A1 / ESA-chunks blueprint outcomes.
  void logBlueprintQAOutcome(
    {
      lessonId: input.lessonId,
      studentId: input.studentId ?? 'anonymous',
      hub: qaLesson.hub,
      cefr: input.cefr,
      lessonNumber: (plan.blueprint as unknown as { lesson_number?: number })?.lesson_number,
      passNo: 1,
    },
    qaOutcome.report,
  );

  // Execute auto-repairs dispatched by QA. Currently wired: phonics swap.
  const wantsPhonicsSwap = qaOutcome.repairs.some(
    (r) => r.target === 'phonics_intelligibility_swap',
  );
  if (wantsPhonicsSwap) {
    const { lesson: repairedLesson, swaps } = applyPhonicsIntelligibilitySwap(qaLesson);
    // Mirror the swap into activityResult.activities so downstream
    // stabilization/memory/speaking/coherence see the corrected types.
    const swapByActivity = new Map(swaps.filter((s) => s.activityId).map((s) => [s.activityId!, s]));
    activityResult.activities = activityResult.activities.map((a) => {
      const swap = swapByActivity.get(a.id);
      if (!swap) return a;
      const repairedSlide = repairedLesson.slides.find((s) =>
        s.activities?.some((ra) => ra.id === a.id),
      );
      const repairedAct = repairedSlide?.activities?.find((ra) => ra.id === a.id);
      if (!repairedAct) return a;
      return { ...a, type: repairedAct.type as typeof a.type, content: repairedAct.content };
    });
    // Re-run deterministic QA on the swapped lesson for an accurate verdict.
    const refreshedReport = runDeterministicQA(repairedLesson);
    qaOutcome = {
      ...qaOutcome,
      report: refreshedReport,
      repairs: qaOutcome.repairs.filter((r) => r.target !== 'phonics_intelligibility_swap'),
    };
    reports.push({
      stage: 'quality_validation',
      status: refreshedReport.verdict === 'publish' ? 'ok' : 'warning',
      durationMs: 0,
      notes: [`phonics_swap_applied=${swaps.length}`, `post_swap_verdict=${refreshedReport.verdict}`],
    });
  }

  // 9.5 — Educational Stabilization (pedagogical quality layer)
  const preStabContext: LessonContext = {
    ...partialCtx,
    activities: activityResult.activities,
    qa: qaOutcome.report,
    meta: {
      stateHash: stateHash({ plan, lessonState, adaptive: adaptiveResult.context }),
      generatedAt: new Date().toISOString(),
      orchestratorVersion: ORCHESTRATOR_VERSION,
      promptChainHash,
    },
  };
  const stab = runStabilization({ ctx: preStabContext });
  // Surface per-validator verdicts + issue codes so Flow=30 / Speaking=55
  // failures are diagnosable without re-running with a debugger attached.
  const stabValidatorNotes = stab.report.validators.map(
    (v) => `${v.validator}=${v.verdict}`,
  );
  const stabIssueCodes = stab.report.validators
    .flatMap((v) => v.issues.map((i) => `${v.validator}:${i.code}`))
    .slice(0, 12); // cap noise
  reports.push({
    stage: 'quality_validation',
    status:
      stab.report.finalVerdict === 'pass'
        ? 'ok'
        : stab.report.finalVerdict === 'repair'
          ? 'warning'
          : 'error',
    durationMs: 0,
    notes: [
      `stabilization=${stab.report.finalVerdict}`,
      `repairs=${stab.report.repairsApplied.length}`,
      ...stabValidatorNotes,
      ...stabIssueCodes,
    ],
  });

  // 9.55 — Vocab modality sequencing (soft: word heard before quizzed)
  const modalityIssues = validateVocabModalitySequencing(qaLesson);
  if (modalityIssues.length > 0) {
    reports.push({
      stage: 'quality_validation',
      status: 'warning',
      durationMs: 0,
      notes: [`vocab_modality_warnings=${modalityIssues.length}`],
    });
  }

  // 9.57 — Holistic Lesson Critic (LLM-as-judge, optional)
  let criticVerdict: 'pass' | 'repair' | 'block' = 'pass';
  let criticResult: LessonCriticResult | undefined;
  if (input.criticRunner) {
    try {
      criticResult = await input.criticRunner(qaLesson);
      if (criticResult) {
        const issues = mapCriticResultToIssues(criticResult);
        const blocked = issues.some((i) => i.severity === 'block');
        const warned = issues.some((i) => i.severity === 'warn');
        criticVerdict = blocked ? 'block' : warned ? 'repair' : 'pass';
        reports.push({
          stage: 'quality_validation',
          status: blocked ? 'error' : warned ? 'warning' : 'ok',
          durationMs: 0,
          notes: [
            `critic=${criticVerdict}`,
            `overall=${criticResult.overall ?? '?'}`,
            ...(criticResult.weak_axes ?? []).map((a) => `weak:${a}`),
          ],
        });

        // 9.58 — Critic-driven repair pass (single retry).
        // When critic scores are low, feed weak_axes back as intelligence hints
        // and regenerate activities once. Prevents Flow=30 / Speaking=55 from
        // being observability-only signals.
        const overall = criticResult.overall ?? 100;
        const weak = new Set(criticResult.weak_axes ?? []);
        if (overall < 70 && weak.size > 0) {
          const repairHint = {
            ...(intelligenceHint ?? {}),
            speaking_confidence: weak.has('speaking_authenticity')
              ? 0.2
              : intelligenceHint?.speaking_confidence,
            engagement: weak.has('engagement_variety')
              ? 0.3
              : intelligenceHint?.engagement,
            recent_error_tags: [
              ...(intelligenceHint?.recent_error_tags ?? []),
              ...Array.from(weak).map((a) => `critic:${a}`),
            ],
          };
          try {
            const retry = await generateActivities({ plan, ai: wrappedAi, intelligence: repairHint });
            activityResult.activities = retry.activities;
            const appliedNotes: string[] = [`critic_repair=applied`, ...Array.from(weak).map((a) => `hint:${a}`)];
            // Re-run stabilization when the critic flags any axis stabilization can
            // deterministically repair: pedagogical_flow (GRR resequencer),
            // speaking_authenticity (speaking backfill), engagement_variety
            // (activity balance / reflection injection). The critic-repair pass
            // alone can't reorder stages or inject reflection slots.
            const RESTAB_AXES = ['pedagogical_flow', 'speaking_authenticity', 'engagement_variety'] as const;
            const restabTriggers = RESTAB_AXES.filter((a) => weak.has(a));
            if (restabTriggers.length > 0) {
              const restabCtx: LessonContext = { ...preStabContext, activities: retry.activities };
              const restab = runStabilization({ ctx: restabCtx });
              activityResult.activities = restab.ctx.activities;
              appliedNotes.push(
                `restabilization=${restab.report.finalVerdict}`,
                `restab_trigger=${restabTriggers.join('+')}`,
                `restab_repairs=${restab.report.repairsApplied.map((r) => r.kind).join(',') || 'none'}`,
              );
            }
            reports.push({
              stage: 'activity_generation',
              status: 'warning',
              durationMs: 0,
              notes: appliedNotes,
            });
          } catch (e) {
            reports.push({
              stage: 'activity_generation',
              status: 'warning',
              durationMs: 0,
              notes: [`critic_repair_failed=${e instanceof Error ? e.message : String(e)}`],
            });
          }
        }
      }
    } catch (e) {
      reports.push({
        stage: 'quality_validation',
        status: 'warning',
        durationMs: 0,
        notes: [`critic_error=${e instanceof Error ? e.message : String(e)}`],
      });
    }
  }


  let memoryVerdict: 'pass' | 'repair' | 'block' = 'pass';
  if (memoryDecision) {
    // crude speaking-density estimate from generated activities
    const speakingDensity =
      activityResult.activities.filter((a) => a.modalities?.includes?.('speaking')).length /
      Math.max(1, activityResult.activities.length);
    const memReport = validateMemory({
      decision: memoryDecision,
      hub: input.hub,
      speakingDensity,
    });
    memoryVerdict = memReport.verdict;
    reports.push({
      stage: 'quality_validation',
      status: memReport.verdict === 'pass' ? 'ok' : memReport.verdict === 'repair' ? 'warning' : 'error',
      durationMs: 0,
      notes: [`memory=${memReport.verdict}`, ...memReport.issues.map((i) => `${i.severity}:${i.code}`)],
    });
  }

  // 10.5 — Speaking & Fluency validator (hub density floor + spontaneous gate)
  const speakingActivityCount = activityResult.activities.filter(
    (a) => a.modalities?.includes?.('speaking'),
  ).length;
  const observedRungs = speakingDecision.required_tasks.map((t) => t.rung);
  const speakingReport = validateSpeaking({
    hub: input.hub,
    decision: speakingDecision,
    observedSpeakingActivityCount: speakingActivityCount,
    observedTotalActivityCount: activityResult.activities.length,
    observedRungs,
  });
  reports.push({
    stage: 'quality_validation',
    status: speakingReport.verdict === 'pass' ? 'ok' : speakingReport.verdict === 'repair' ? 'warning' : 'error',
    durationMs: 0,
    notes: [
      `speaking=${speakingReport.verdict}`,
      `density=${(speakingReport.speaking_density_observed * 100).toFixed(0)}%`,
      ...speakingReport.issues.map((i) => `${i.severity}:${i.code}`),
    ],
  });
  const speakingVerdict = speakingReport.verdict;

  // 10.6 — Coherence validator (re-validate post-activities for visibility)
  reports.push({
    stage: 'quality_validation',
    status: coherenceDecision.verdict === 'pass' ? 'ok' : coherenceDecision.verdict === 'repair' ? 'warning' : 'error',
    durationMs: 0,
    notes: [
      `coherence=${coherenceDecision.verdict}`,
      `homework=${coherenceDecision.homework.tasks.length}/${coherenceDecision.homework.total_minutes}min`,
      `game=${coherenceDecision.game.rounds.length}rounds avg=${coherenceDecision.game.educational_value_avg.toFixed(2)}`,
      ...coherenceDecision.issues.map(i => `${i.severity}:${i.code}`),
    ],
  });
  const coherenceVerdict = coherenceDecision.verdict;

  // 10.7 — Arcade validator (re-validate post-activities for visibility)
  reports.push({
    stage: 'quality_validation',
    status: arcadeDecision.report.verdict === 'pass' ? 'ok' : arcadeDecision.report.verdict === 'repair' ? 'warning' : 'error',
    durationMs: 0,
    notes: [
      `arcade=${arcadeDecision.report.verdict}`,
      `games=${arcadeDecision.report.game_count} speaking=${arcadeDecision.report.speaking_count} ${Math.round(arcadeDecision.report.total_seconds/60)}min`,
      ...arcadeDecision.report.issues.map(i => `${i.severity}:${i.code}`),
    ],
  });
  const arcadeVerdict = arcadeDecision.report.verdict;

  // 11 — Publish gate (QA ∧ stabilization ∧ memory ∧ speaking ∧ coherence ∧ arcade)
  const qaVerdict = qaOutcome.report.verdict;
  const verdict =
    stab.report.finalVerdict === 'block' || qaVerdict === 'block' || memoryVerdict === 'block' || speakingVerdict === 'block' || coherenceVerdict === 'block' || arcadeVerdict === 'block' || criticVerdict === 'block'
      ? 'block'
      : stab.report.finalVerdict === 'repair' || qaVerdict === 'repair' || memoryVerdict === 'repair' || speakingVerdict === 'repair' || coherenceVerdict === 'repair' || arcadeVerdict === 'repair' || criticVerdict === 'repair'
        ? 'repair'
        : 'publish';
  reports.push({
    stage: 'publish_gate',
    status: verdict === 'publish' ? 'ok' : verdict === 'repair' ? 'warning' : 'error',
    durationMs: 0,
    notes: [`verdict=${verdict}`],
  });

  const context: LessonContext = {
    ...stab.ctx,
    qa: { ...qaOutcome.report, stabilization: stab.report },
  };

  return {
    context,
    stageReports: reports,
    verdict,
    passed: verdict === 'publish',
    conflicts: [],
    grammarPackage,
    memoryDecision,
    speakingDecision,
    coherenceDecision,
    arcadeDecision,
    videoLessonSpec,
  };

}
