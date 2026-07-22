// Choose framing (never changes pedagogy).
import type { Hub } from '@/governance/types';
import type { LearnerIntelligence } from '@/intelligence/types';
import { COHERENCE_HUB_PROFILES } from './hubProfiles';

export function pickFraming(hub: Hub, intel?: LearnerIntelligence): 'story_quest' | 'social_challenge' | 'achievement_track' {
  const base = COHERENCE_HUB_PROFILES[hub].framing;
  // Hub framing is canonical; engagement only nudges tone, never overrides hub.
  if (!intel) return base;
  return base;
}

export function toneHint(hub: Hub, intel?: LearnerIntelligence): string {
  if (!intel) return 'neutral';
  const att = intel.engagement_state.attention_score;
  if (att < 50) return 'compact_and_warm';
  if (att > 80) return 'energetic';
  return 'neutral';
}
