import type { Hub, DifficultyProfile, SpeakingTier } from './types';

export interface HubAdaptationProfile {
  max_cycle_seconds: number;
  visual_scaffold_required: boolean;
  repetition_weight: number;
  failure_states_allowed: boolean;
  default_speaking_tier: SpeakingTier;
  confidence_shield: boolean;       // never publicly correct
  fluency_over_accuracy: boolean;
  default_difficulty: DifficultyProfile;
  copy_register: 'playful' | 'identity_safe' | 'professional';
}

export const HUB_ADAPTATION_PROFILES: Record<Hub, HubAdaptationProfile> = {
  Playground: {
    max_cycle_seconds: 90,
    visual_scaffold_required: true,
    repetition_weight: 1.5,
    failure_states_allowed: false,
    default_speaking_tier: 'sentence_starters',
    confidence_shield: true,
    fluency_over_accuracy: false,
    default_difficulty: {
      sentence_length_cap: 8,
      scaffolding_level: 'heavy',
      support_density: 0.9,
      challenge_tier: 1,
      reading_complexity: 'simplified',
    },
    copy_register: 'playful',
  },
  Academy: {
    max_cycle_seconds: 180,
    visual_scaffold_required: false,
    repetition_weight: 1.0,
    failure_states_allowed: true,
    default_speaking_tier: 'guided_frames',
    confidence_shield: true,
    fluency_over_accuracy: false,
    default_difficulty: {
      sentence_length_cap: 16,
      scaffolding_level: 'guided',
      support_density: 0.6,
      challenge_tier: 2,
      reading_complexity: 'standard',
    },
    copy_register: 'identity_safe',
  },
  Success: {
    max_cycle_seconds: 240,
    visual_scaffold_required: false,
    repetition_weight: 0.8,
    failure_states_allowed: true,
    default_speaking_tier: 'open_communication',
    confidence_shield: false,
    fluency_over_accuracy: true,
    default_difficulty: {
      sentence_length_cap: 24,
      scaffolding_level: 'minimal',
      support_density: 0.4,
      challenge_tier: 3,
      reading_complexity: 'enriched',
    },
    copy_register: 'professional',
  },
};

export function getHubAdaptationProfile(hub: Hub): HubAdaptationProfile {
  return HUB_ADAPTATION_PROFILES[hub];
}
