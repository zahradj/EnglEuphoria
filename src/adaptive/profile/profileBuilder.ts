import type { LearnerProfile, Hub, CEFR } from '../types';

export interface BootstrapInput {
  student_id: string;
  hub: Hub;
  cefr_level: CEFR;
  placement_strengths?: string[];
  placement_weaknesses?: string[];
  onboarding_pacing?: 'slow' | 'moderate' | 'fast';
}

export function buildLearnerProfile(input: BootstrapInput): LearnerProfile {
  return {
    student_id: input.student_id,
    hub: input.hub,
    cefr_level: input.cefr_level,
    strengths: input.placement_strengths ?? [],
    weaknesses: input.placement_weaknesses ?? [],
    engagement_style: 'interactive',
    preferred_pacing: input.onboarding_pacing ?? 'moderate',
    anxiety_level: 'moderate',
    pronunciation_challenges: [],
  };
}
