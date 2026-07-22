import type { MotivationProfile } from '../types';
import { styleEncouragement } from '../motivation/encouragementStyler';

export interface FeedbackInput {
  kind: 'improvement' | 'effort' | 'mastery_growth' | 'speaking_bravery' | 'consistency' | 'communication_success';
  profile: MotivationProfile;
  detail?: string;       // e.g. "you used 4 new words"
}

const BASES: Record<FeedbackInput['kind'], string> = {
  improvement: 'You\'re improving.',
  effort: 'Strong effort.',
  mastery_growth: 'Your mastery is growing.',
  speaking_bravery: 'Brave speaking.',
  consistency: 'Consistency pays off.',
  communication_success: 'You communicated successfully.',
};

/**
 * Compose personalized feedback copy. Always supportive, never robotic.
 * The motivation profile shapes the tone wrapper.
 */
export function composeFeedback(input: FeedbackInput): string {
  const base = BASES[input.kind];
  const detail = input.detail ? ` ${input.detail.trim()}` : '';
  return styleEncouragement(`${base}${detail}`, input.profile);
}
