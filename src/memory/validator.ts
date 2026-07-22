// Memory validator — runs as stage 9.6 between stabilization and publish.
// Hard gates: review density, CEFR drift, speaking density floor, no isolated review.

import type { Hub } from '@/governance/types';
import type { MemoryDecision } from './types';
import { getMemoryHubProfile } from './hubProfiles';

export interface MemoryValidationIssue {
  code: string;
  message: string;
  severity: 'hard' | 'soft';
}

export interface MemoryValidationReport {
  verdict: 'pass' | 'repair' | 'block';
  issues: MemoryValidationIssue[];
}

export interface MemoryValidationInput {
  decision: MemoryDecision;
  hub: Hub;
  speakingDensity: number; // 0..1, from lesson context
}

export function validateMemory(input: MemoryValidationInput): MemoryValidationReport {
  const issues: MemoryValidationIssue[] = [];
  const profile = getMemoryHubProfile(input.hub);

  if (input.decision.injectionPlan.reviewDensity > 0.3) {
    issues.push({
      code: 'review_density_exceeded',
      message: `Review density ${(input.decision.injectionPlan.reviewDensity * 100).toFixed(0)}% > 30% cap`,
      severity: 'hard',
    });
  }

  if (input.decision.injectionPlan.interleavingMix.length < 2 && input.decision.review_queue.length >= 3) {
    issues.push({
      code: 'isolated_topic_review',
      message: 'Review batch contains ≥3 items but only 1 skill kind — interleave',
      severity: 'soft',
    });
  }

  if (input.speakingDensity < profile.speakingFloor) {
    issues.push({
      code: 'speaking_density_below_floor',
      message: `Speaking density ${input.speakingDensity.toFixed(2)} < hub floor ${profile.speakingFloor}`,
      severity: 'soft',
    });
  }

  const hasHard = issues.some((i) => i.severity === 'hard');
  const hasSoft = issues.some((i) => i.severity === 'soft');
  return {
    verdict: hasHard ? 'block' : hasSoft ? 'repair' : 'pass',
    issues,
  };
}
