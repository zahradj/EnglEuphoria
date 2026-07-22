// Stabilization policy — thresholds keyed by hub × CEFR × age band.
// Single source of truth for validator tolerances.

import type { Cefr, Hub } from '@/governance/types';

export type AgeBand = 'kids' | 'teens' | 'adults';

export interface CognitivePolicy {
  maxTokensPerSlide: number;
  maxNewVocabPerSlide: number;
  maxGrammarConstructsPerSlide: number;
  maxInstructionTokens: number;
  /** Acceptable fatigue curve: difficulty index allowed in last third of lesson. */
  endFatigueCeiling: number; // 0..1
}

export interface CoherencePolicy {
  minBinderTokenReuse: number;
  minVocabRecyclingPerWord: number;
  maxTopicDrift: number; // 0..1
}

export interface FlowPolicy {
  requiredStages: Array<'hook' | 'input' | 'controlled' | 'communicative' | 'production' | 'reflection'>;
  requireReflection: boolean;
  requireClosure: boolean;
}

export interface ActivityBalancePolicy {
  maxConsecutiveSameType: number;
  minProductiveRatio: number; // 0..1 productive vs receptive
  minSpeakingOpportunities: number;
}

export interface SpeakingPolicy {
  requireShadowingAtOrAbove: Cefr | null; // null = never required
  requireProduceStage: boolean;
}

export interface RetentionPolicy {
  minPreviousUnitCallbacks: number;
  minMistakeRecyclings: number;
  surfaceSrsTargets: boolean;
}

export interface StabilizationPolicy {
  cognitive: CognitivePolicy;
  coherence: CoherencePolicy;
  flow: FlowPolicy;
  activityBalance: ActivityBalancePolicy;
  speaking: SpeakingPolicy;
  retention: RetentionPolicy;
}

const BASE_FLOW: FlowPolicy = {
  requiredStages: ['hook', 'input', 'controlled', 'communicative', 'production', 'reflection'],
  requireReflection: true,
  requireClosure: true,
};

const CEFR_RANK: Record<Cefr, number> = {
  'Pre-A1': 0,
  A1: 1,
  A2: 2,
  B1: 3,
  B2: 4,
  C1: 5,
};

export function ageBandForHub(hub: Hub): AgeBand {
  if (hub === 'playground') return 'kids';
  if (hub === 'academy') return 'teens';
  return 'adults';
}

export function resolvePolicy(hub: Hub, cefr: Cefr): StabilizationPolicy {
  const band = ageBandForHub(hub);
  const rank = CEFR_RANK[cefr] ?? 1;

  const cognitive: CognitivePolicy = {
    maxTokensPerSlide: band === 'kids' ? 60 : band === 'teens' ? 110 : 160,
    maxNewVocabPerSlide: band === 'kids' ? 2 : 3,
    maxGrammarConstructsPerSlide: 1,
    maxInstructionTokens: band === 'kids' ? 24 : band === 'teens' ? 40 : 56,
    endFatigueCeiling: band === 'kids' ? 0.55 : 0.7,
  };

  const coherence: CoherencePolicy = {
    minBinderTokenReuse: hub === 'success' ? 4 : 3,
    minVocabRecyclingPerWord: 3,
    maxTopicDrift: hub === 'success' ? 0.25 : 0.4,
  };

  const activityBalance: ActivityBalancePolicy = {
    maxConsecutiveSameType: 2,
    minProductiveRatio: band === 'kids' ? 0.3 : 0.4,
    minSpeakingOpportunities: band === 'kids' ? 2 : 3,
  };

  const speaking: SpeakingPolicy = {
    requireShadowingAtOrAbove: rank >= CEFR_RANK.A2 ? 'A2' : null,
    requireProduceStage: true,
  };

  const retention: RetentionPolicy = {
    minPreviousUnitCallbacks: 1,
    minMistakeRecyclings: 1,
    surfaceSrsTargets: true,
  };

  return { cognitive, coherence, flow: BASE_FLOW, activityBalance, speaking, retention };
}
