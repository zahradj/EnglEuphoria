import type { DifficultyProfile, EngagementState, LearnerProfile, SkillMasteryRecord } from '../types';
import { getHubAdaptationProfile } from '../hubAdaptationProfiles';

export interface DifficultyInput {
  profile: LearnerProfile;
  mastery: SkillMasteryRecord[];
  engagement: EngagementState;
}

export function resolveDifficulty(input: DifficultyInput): DifficultyProfile {
  const hub = getHubAdaptationProfile(input.profile.hub);
  const base = { ...hub.default_difficulty };

  const avgMastery =
    input.mastery.length === 0
      ? 50
      : input.mastery.reduce((s, m) => s + m.mastery, 0) / input.mastery.length;

  // Struggling → simplify
  if (avgMastery < 50 || input.engagement.frustration_risk > 65) {
    base.scaffolding_level = 'heavy';
    base.support_density = Math.min(1, base.support_density + 0.2);
    base.challenge_tier = Math.max(1, base.challenge_tier - 1) as DifficultyProfile['challenge_tier'];
    base.sentence_length_cap = Math.max(6, base.sentence_length_cap - 4);
    base.reading_complexity = 'simplified';
  }

  // Advancing → extend
  if (avgMastery > 80 && input.engagement.confidence > 70 && input.engagement.frustration_risk < 30) {
    base.scaffolding_level = hub.default_difficulty.scaffolding_level === 'heavy' ? 'guided' : 'minimal';
    base.support_density = Math.max(0.2, base.support_density - 0.2);
    base.challenge_tier = Math.min(4, base.challenge_tier + 1) as DifficultyProfile['challenge_tier'];
    base.sentence_length_cap += 4;
    if (input.profile.hub !== 'Playground') base.reading_complexity = 'enriched';
  }

  // Anxiety override → never crank challenge
  if (input.profile.anxiety_level === 'high') {
    base.challenge_tier = Math.min(base.challenge_tier, 2) as DifficultyProfile['challenge_tier'];
    base.support_density = Math.max(base.support_density, 0.7);
  }

  return base;
}
