import type {
  RunGamificationInput,
  RunGamificationResult,
  Mission,
  CelebrationTrigger,
} from './types';
import { getHubProfile } from './hubGamificationProfiles';
import { generateMissionSkeleton } from './missions/missionGenerator';
import { validateMission, hasErrors } from './missions/missionValidator';
import { scaleRewardDensity } from './motivation/adaptiveRewardScaler';
import { runGamificationGuards, hasGuardErrors } from './governance/gamificationGuards';

/**
 * Main entry point for the gamification layer.
 *
 * Position in pipeline:
 *   planner → governance → adaptive → pronunciation → GAMIFICATION → activities → QA
 *
 * Responsibilities:
 *  - Generate the mission narrative skeleton (AI can refine via missionPromptBuilder)
 *  - Validate it against governance + hub rules
 *  - Decide reward density for this lesson
 *  - Pre-declare which celebration triggers are expected (so QA can verify)
 *
 * This function is pure and synchronous. Persistence (writing to
 * student_missions, student_motivation_profile) is done by the caller
 * after the lesson generation completes successfully.
 */
export function runGamification(input: RunGamificationInput): RunGamificationResult {
  const hubProfile = getHubProfile(input.hub);

  // 1. Build mission skeleton
  const skeleton = generateMissionSkeleton({
    hub: input.hub,
    plan: input.plan,
    motivationProfile: input.motivationProfile,
  });

  // 2. Validate mission against governance
  const planObjective = String(input.plan.objective ?? '');
  const missionIssues = validateMission(skeleton, planObjective);
  if (hasErrors(missionIssues)) {
    throw new Error(
      `Gamification: mission validation failed: ${missionIssues
        .filter((i) => i.severity === 'error')
        .map((i) => i.code)
        .join(', ')}`,
    );
  }

  // 3. Decide reward density adaptively
  const densityApplied = scaleRewardDensity({
    profile: input.motivationProfile,
    recentEngagementScore: undefined,   // can be wired from adaptive engagementScorer
  });

  // 4. Pre-declare expected celebrations (QA will verify the lesson doesn't exceed)
  const expectedCelebrations: CelebrationTrigger[] = [
    ...(input.adaptiveContext?.masteryRising ? ['mastery_milestone' as CelebrationTrigger] : []),
    'mission_complete',
  ];

  // 5. Final governance pass
  const guardIssues = runGamificationGuards({
    hub: input.hub,
    mission: skeleton,
    planObjective,
    expectedCelebrationCount: expectedCelebrations.length + (hubProfile.rewardDensity === 'high' ? 1 : 0),
  });

  if (hasGuardErrors(guardIssues)) {
    throw new Error(
      `Gamification governance blocked: ${guardIssues
        .filter((i) => i.severity === 'error')
        .map((i) => i.code)
        .join(', ')}`,
    );
  }

  const mission: Mission = {
    id: crypto.randomUUID(),
    studentId: input.studentId,
    narrative: skeleton,
    status: 'active',
    startedAt: new Date().toISOString(),
  };

  return {
    mission,
    rewardPlan: {
      densityApplied,
      expectedCelebrations,
    },
    governanceFlags: [...missionIssues, ...guardIssues].map((i) => i.code),
  };
}
