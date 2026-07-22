import type { LearnerProfile, SkillMasteryRecord, EngagementState } from '../types';

export interface ProfileUpdateInput {
  mastery: SkillMasteryRecord[];
  engagement?: EngagementState;
}

export function updateLearnerProfile(
  profile: LearnerProfile,
  input: ProfileUpdateInput,
): LearnerProfile {
  const next: LearnerProfile = { ...profile };

  const strong = input.mastery.filter((m) => m.mastery >= 80).map((m) => m.skill_key);
  const weak = input.mastery.filter((m) => m.mastery < 50).map((m) => m.skill_key);

  next.strengths = Array.from(new Set([...profile.strengths, ...strong])).slice(0, 12);
  next.weaknesses = Array.from(new Set([...profile.weaknesses, ...weak])).slice(0, 12);

  next.pronunciation_challenges = Array.from(
    new Set([
      ...profile.pronunciation_challenges,
      ...input.mastery
        .filter((m) => m.skill_domain === 'pronunciation' && m.mastery < 60)
        .map((m) => m.skill_key),
    ]),
  ).slice(0, 10);

  if (input.engagement) {
    if (input.engagement.frustration_risk > 70) next.anxiety_level = 'high';
    else if (input.engagement.frustration_risk < 25) next.anxiety_level = 'low';

    if (input.engagement.completion_rate > 0.9 && input.engagement.confidence > 75) {
      next.preferred_pacing = 'fast';
    } else if (input.engagement.frustration_risk > 60) {
      next.preferred_pacing = 'slow';
    }
  }

  return next;
}
