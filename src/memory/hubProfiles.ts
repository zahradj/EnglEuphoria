// Hub-specific memory behavior.

import type { Hub } from '@/governance/types';
import type { InjectionSlot } from './types';

export interface MemoryHubProfile {
  hub: Hub;
  maxItemsPerLesson: number;
  lessonItemBudget: number;        // denominator for review density
  preferredSlots: InjectionSlot[]; // ordered rotation
  registerHint: string;
  tone: 'playful' | 'energetic' | 'professional';
  speakingFloor: number;           // min portion of review that must be spoken
}

const PROFILES: Record<Hub, MemoryHubProfile> = {
  playground: {
    hub: 'playground',
    maxItemsPerLesson: 5,
    lessonItemBudget: 12,
    preferredSlots: ['warmup', 'game', 'story_callback', 'speaking_task'],
    registerHint: 'playful, song/chant/character-driven; no explicit "review" labels',
    tone: 'playful',
    speakingFloor: 0.4,
  },
  academy: {
    hub: 'academy',
    maxItemsPerLesson: 7,
    lessonItemBudget: 18,
    preferredSlots: ['warmup', 'micro_drill', 'challenge_mission', 'speaking_task', 'exit_ticket'],
    registerHint: 'mission/challenge framing, narrative continuity, debate-friendly',
    tone: 'energetic',
    speakingFloor: 0.5,
  },
  success: {
    hub: 'success',
    maxItemsPerLesson: 8,
    lessonItemBudget: 18,
    preferredSlots: ['warmup', 'speaking_task', 'micro_drill', 'exit_ticket', 'homework'],
    registerHint: 'professional workplace scenarios, fluency recycling, zero childish copy',
    tone: 'professional',
    speakingFloor: 0.55,
  },
};

export function getMemoryHubProfile(hub: Hub): MemoryHubProfile {
  return PROFILES[hub];
}
