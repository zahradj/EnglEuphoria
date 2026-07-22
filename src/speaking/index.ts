// Speaking & Fluency Optimization Engine — entry point.
// Orchestrator must call runSpeakingOptimization() AFTER memory, BEFORE gamification.

import type { Hub, Cefr } from '@/governance/types';
import type { LearnerIntelligence } from '@/intelligence/types';
import { profileFor } from './hubProfiles';
import { computeFluency } from './fluencyModel';
import { computeConfidence } from './confidenceModel';
import { selectNextRung } from './scaffoldLadder';
import { connectedSpeechTargetsFor } from './connectedSpeech';
import { planDensity } from './densityPlanner';
import { selectSpeakingTasks, type PlanLikeForSpeaking } from './taskSelector';
import type {
  SpeakingDecision,
  SpeakingRung,
  SpeakingState,
  FluencyMetrics,
} from './types';

export * from './types';
export { profileFor } from './hubProfiles';
export { buildSpeakingSystemPrompt } from './promptInjector';
export { validateSpeaking } from './validator';
export { SPEAKING_VERSION } from './types';

export interface RunSpeakingInput {
  hub: Hub;
  cefr: Cefr;
  intelligence?: LearnerIntelligence;
  plan: PlanLikeForSpeaking;
  totalPlannedActivities: number;
  pronunciationFocus?: string[];
  priorState?: Partial<SpeakingState>;
}

export function runSpeakingOptimization(input: RunSpeakingInput): SpeakingDecision {
  const profile = profileFor(input.hub);
  const intel = input.intelligence;

  const prior: FluencyMetrics = {
    fluency_score: 0,
    confidence_score: 0,
    mean_length_utterance: intel?.speaking_confidence.avg_sentence_words ?? 0,
    hesitation_ratio: clampHesitation(intel?.speaking_confidence.hesitation_avg_ms),
    connected_speech_score: 0,
    rung: (input.priorState?.metrics?.rung ?? 'repetition') as SpeakingRung,
    trend: intel?.speaking_confidence.growth_trend ?? 'flat',
  };

  const fluency = computeFluency({
    wpm_avg: undefined,
    hesitation_ratio: prior.hesitation_ratio,
    mean_length_utterance: prior.mean_length_utterance,
    voluntary_attempts_7d: intel?.speaking_confidence.voluntary_attempts_7d ?? 0,
    growth_trend: prior.trend,
    prior_rung: prior.rung,
  });

  const confidence = computeConfidence({
    voluntary_attempts_7d: intel?.speaking_confidence.voluntary_attempts_7d ?? 0,
    retry_rate: intel?.speaking_confidence.retry_rate ?? 0,
    bravery_count_7d: input.priorState?.bravery_count_7d ?? 0,
    silence_ratio: intel?.speaking_confidence.silence_ratio ?? 0,
    current_rung: prior.rung,
  });

  const metrics: FluencyMetrics = { ...fluency, confidence_score: confidence };

  const nextRung = selectNextRung({
    current_rung: prior.rung,
    fluency: metrics.fluency_score,
    confidence: metrics.confidence_score,
    growth_trend: metrics.trend,
    bravery_count_7d: input.priorState?.bravery_count_7d ?? 0,
    profile,
  });

  const connectedTargets = connectedSpeechTargetsFor(input.cefr, input.pronunciationFocus);

  const { task_count, density_floor } = planDensity({
    totalActivityCount: input.totalPlannedActivities,
    profile,
  });

  const state: SpeakingState = {
    hub: input.hub,
    cefr: input.cefr,
    metrics,
    recent_task_types: input.priorState?.recent_task_types ?? [],
    recent_scenarios: input.priorState?.recent_scenarios ?? [],
    bravery_count_7d: input.priorState?.bravery_count_7d ?? 0,
  };

  const tasks = selectSpeakingTasks({
    hub: input.hub,
    state,
    profile,
    taskCount: task_count,
    nextRung,
    plan: input.plan,
    pronFocus: input.pronunciationFocus,
    connectedTargets,
  });

  const notes: string[] = [];
  if (metrics.trend === 'down') notes.push('Confidence trending down — keep early tasks low-stakes.');
  if (profile.forbid_timed_speaking) notes.push('Playground: no timed pressure on speaking.');
  if (input.hub === 'success') notes.push('Use professional register; avoid childish framing.');

  return {
    required_tasks: tasks,
    density_floor,
    next_rung: nextRung,
    bravery_policy: 'reward_attempt',
    notes,
  };
}

function clampHesitation(ms?: number): number {
  if (!ms || ms <= 0) return 0.4;
  // map 200ms..2000ms → 0..1
  return Math.max(0, Math.min(1, (ms - 200) / 1800));
}
