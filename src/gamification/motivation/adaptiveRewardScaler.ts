import type { RewardDensity, MotivationProfile } from '../types';

/**
 * Adjusts the effective reward density based on real-time engagement signals
 * coming back from the adaptive layer. Prevents overload (anxious learners),
 * boredom (challenge learners), and reward fatigue.
 */
export function scaleRewardDensity(args: {
  profile: MotivationProfile;
  recentEngagementScore?: number;          // 0–1 from adaptive engagementScorer
  recentBoredomSignal?: boolean;
}): RewardDensity {
  let density = args.profile.rewardDensity;
  const engagement = args.recentEngagementScore ?? 0.5;

  if (engagement < 0.3 && args.profile.profileType !== 'anxious') {
    // Disengaged → bump up density to re-engage (except for anxious profiles)
    density = density === 'low' ? 'medium' : 'high';
  }
  if (args.recentBoredomSignal && density !== 'high') {
    density = density === 'low' ? 'medium' : 'high';
  }
  if (engagement > 0.8 && density === 'high') {
    // Already engaged at high density → step down to protect intrinsic motivation
    density = 'medium';
  }
  return density;
}
