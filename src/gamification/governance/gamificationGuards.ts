import type { MissionNarrative, Hub } from '../types';
import { getHubProfile } from '../hubGamificationProfiles';
import { validateMission } from '../missions/missionValidator';

export interface GamificationGuardIssue {
  code: string;
  severity: 'error' | 'warning';
  message: string;
}

interface GuardInput {
  hub: Hub;
  mission: MissionNarrative;
  planObjective: string;
  expectedCelebrationCount: number;
}

/**
 * Hard governance for gamification. Runs INSIDE QA layer.
 * Mission distractions and reward overload are blocking errors.
 */
export function runGamificationGuards(input: GuardInput): GamificationGuardIssue[] {
  const issues: GamificationGuardIssue[] = [];
  const hub = getHubProfile(input.hub);

  // 1. Mission narrative governance
  for (const m of validateMission(input.mission, input.planObjective)) {
    issues.push({ code: m.code, severity: m.severity, message: m.message });
  }

  // 2. Reward overload guard
  const maxCelebrations =
    hub.rewardDensity === 'high' ? 6 : hub.rewardDensity === 'medium' ? 4 : 2;
  if (input.expectedCelebrationCount > maxCelebrations) {
    issues.push({
      code: 'reward_overload',
      severity: 'error',
      message: `Hub ${input.hub} allows max ${maxCelebrations} celebrations per lesson; got ${input.expectedCelebrationCount}.`,
    });
  }

  // 3. Playground must never have leaderboard rankings
  if (input.hub === 'playground' && /leaderboard|rank|beat/i.test(input.mission.hook + input.mission.objectiveCopy)) {
    issues.push({
      code: 'playground_competitive_framing',
      severity: 'error',
      message: 'Playground hub must not use ranking/competition framing.',
    });
  }

  return issues;
}

export function hasGuardErrors(issues: GamificationGuardIssue[]): boolean {
  return issues.some((i) => i.severity === 'error');
}
