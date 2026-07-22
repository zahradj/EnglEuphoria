// Hub DNA for the Speaking & Fluency Engine.
// Defines per-hub density floors, allowed task catalog, register, and ceilings.

import type { Hub } from '@/governance/types';
import type { SpeakingTaskType, SpeakingRung } from './types';

export interface HubSpeakingProfile {
  min_speaking_tasks: number;           // absolute floor per lesson
  min_density: number;                  // ratio of speaking activities
  allowed_tasks: SpeakingTaskType[];
  max_rung: SpeakingRung;               // ladder ceiling for this hub
  pressure: 'none' | 'gentle' | 'professional';
  register: 'playful' | 'social' | 'professional';
  reward_bravery: boolean;
  forbid_timed_speaking: boolean;
}

export const SPEAKING_HUB_PROFILES: Record<Hub, HubSpeakingProfile> = {
  playground: {
    min_speaking_tasks: 4,
    min_density: 0.4,
    allowed_tasks: [
      'chant', 'repetition_drill', 'shadowing', 'sentence_completion',
      'picture_talk', 'roleplay',
      'echo_repetition', 'self_record', 'pronunciation_attempt', 'storytelling_chain',
    ],
    max_rung: 'guided',
    pressure: 'none',
    register: 'playful',
    reward_bravery: true,
    forbid_timed_speaking: true,
  },
  academy: {
    min_speaking_tasks: 3,
    min_density: 0.35,
    allowed_tasks: [
      'shadowing', 'sentence_completion', 'roleplay', 'opinion_exchange',
      'storytelling', 'discussion', 'picture_talk',
      'echo_repetition', 'self_record', 'pronunciation_attempt',
      'timed_fluency_round', 'storytelling_chain', 'interview_mode', 'debate_battle',
    ],
    max_rung: 'spontaneous',
    pressure: 'gentle',
    register: 'social',
    reward_bravery: true,
    forbid_timed_speaking: false,
  },
  success: {
    min_speaking_tasks: 3,
    min_density: 0.35,
    allowed_tasks: [
      'roleplay', 'meeting_sim', 'presentation_chunk', 'professional_smalltalk',
      'opinion_exchange', 'discussion', 'shadowing',
      'self_record', 'pronunciation_attempt', 'timed_fluency_round',
      'interview_mode', 'debate_battle',
    ],
    max_rung: 'spontaneous',
    pressure: 'professional',
    register: 'professional',
    reward_bravery: true,
    forbid_timed_speaking: false,
  },
};

export function profileFor(hub: Hub): HubSpeakingProfile {
  return SPEAKING_HUB_PROFILES[hub];
}
