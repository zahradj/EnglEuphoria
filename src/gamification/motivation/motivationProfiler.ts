import type { MotivationProfile, MotivationProfileType, EncouragementStyle, RewardDensity, Hub } from '../types';
import { getHubProfile } from '../hubGamificationProfiles';

export interface ProfilerSignals {
  completionRate?: number;          // 0–1
  speakingParticipation?: number;   // 0–1
  averageAccuracy?: number;         // 0–1
  quitRate?: number;                // 0–1 (high = anxious)
  sessionLengthAvg?: number;        // minutes
  streakRecoveries?: number;
  socialOptIn?: boolean;
}

/**
 * Classify a learner into a motivation profile from behavior signals.
 * Heuristic, not stochastic. Re-runs on each lesson generation.
 */
export function classifyMotivation(args: {
  studentId: string;
  hub: Hub;
  signals: ProfilerSignals;
}): MotivationProfile {
  const s = args.signals;
  const hubProfile = getHubProfile(args.hub);

  let profileType: MotivationProfileType = 'balanced';
  if ((s.quitRate ?? 0) > 0.35 || (s.averageAccuracy ?? 1) < 0.4) {
    profileType = 'anxious';
  } else if ((s.averageAccuracy ?? 0) > 0.85 && (s.speakingParticipation ?? 0) > 0.6) {
    profileType = 'challenge';
  } else if ((s.completionRate ?? 0) > 0.8 && (s.streakRecoveries ?? 0) >= 2) {
    profileType = 'achievement';
  } else if (s.socialOptIn) {
    profileType = 'social';
  } else if ((s.sessionLengthAvg ?? 0) > 18) {
    profileType = 'explorer';
  }

  const encouragementStyle: EncouragementStyle =
    profileType === 'anxious' ? 'calm'
    : profileType === 'challenge' ? 'enthusiastic'
    : profileType === 'achievement' ? 'supportive'
    : profileType === 'social' ? 'enthusiastic'
    : profileType === 'explorer' ? 'supportive'
    : hubProfile.encouragementDefault;

  // Reward density: anxious → low overwhelm; challenge → moderate; baseline = hub default
  let rewardDensity: RewardDensity = hubProfile.rewardDensity;
  if (profileType === 'anxious') rewardDensity = 'low';
  if (profileType === 'achievement' && hubProfile.rewardDensity === 'low') rewardDensity = 'medium';

  return {
    studentId: args.studentId,
    profileType,
    encouragementStyle,
    rewardDensity,
    signals: {
      completionRate: s.completionRate,
      speakingParticipation: s.speakingParticipation,
      averageAccuracy: s.averageAccuracy,
      quitRate: s.quitRate,
      sessionLengthAvg: s.sessionLengthAvg,
      streakRecoveries: s.streakRecoveries,
    },
    lastRecomputedAt: new Date().toISOString(),
  };
}
