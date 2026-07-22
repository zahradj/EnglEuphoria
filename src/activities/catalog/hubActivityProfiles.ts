// Hub-level bans and preferences. Selection hard-rejects banned types.

import type { Hub } from '@/governance/types';
import type { ActivityType } from '../types';

export interface HubActivityProfile {
  banned: ActivityType[];
  preferred: ActivityType[];
  max_consecutive_high_load: number;
  notes: string[];
}

export const HUB_ACTIVITY_PROFILES: Record<Hub, HubActivityProfile> = {
  playground: {
    banned: ['debate', 'evidence_hunt'],
    preferred: [
      'drag_drop', 'matching', 'vocab_match_board', 'listen_and_match', 'audio_to_image_match',
      'storytelling', 'pronunciation', 'warmup', 'tap_the_grapheme', 'phonics_bingo',
      'trace_letter', 'trace_word', 'echo_repetition', 'hotspot',
      // Unified phonics system — the spine of the hub.
      'phonics_card', 'phoneme_isolation', 'blending_animation',
      'minimal_pair_tap', 'grapheme_hunt', 'decoding_probe',
    ],
    max_consecutive_high_load: 1,
    notes: [
      'Short, visual, movement-oriented cycles.',
      'Avoid explicit grammar drills — implicit only.',
      'Tone: playful, positive, encouraging.',
      'Prefer audio+image pairing over text-only matching.',
      'Phonics card uses the claymorphic Playground skin (Pip mouth-shape, chant rhythm).',
    ],
  },
  academy: {
    banned: [],
    preferred: [
      'roleplay', 'opinion', 'collaborative', 'speaking_mission', 'poll',
      'vocab_match_board', 'sentence_builder', 'fill_blank', 'dialogue_completion',
      'sequencing', 'chunk_builder', 'tense_transform',
      // Phonics available for early-reader teens only; selector enforces the gate.
      'phonics_card', 'minimal_pair_tap', 'grapheme_hunt', 'decoding_probe',
    ],
    max_consecutive_high_load: 2,
    notes: [
      'Identity-driven and socially interactive.',
      'Modern tone, communication-heavy.',
      'Challenge framing, not childish framing.',
      'Phonics card uses the Academy "code-breaker" skin and is reserved for Pre-A1/A1 learners.',
    ],
  },
  success: {
    banned: ['trace_letter', 'trace_word', 'phonics_bingo', 'syllable_clap', 'onset_rime_builder'],
    preferred: [
      'roleplay', 'debate', 'speaking_mission', 'review_challenge', 'reflection',
      'evidence_hunt', 'branching_choice', 'opinion', 'vocab_match_board',
      'dialogue_completion', 'story_reconstruction',
      // Adult early-reader phonics — professional clarity framing only.
      'phonics_card', 'minimal_pair_tap', 'decoding_probe',
    ],
    max_consecutive_high_load: 2,
    notes: [
      'Realistic, workplace/life relevant scenarios.',
      'Premium, confidence-focused tone.',
      'Fluency over accuracy obsession.',
      'Phonics card uses the Success "professional clarity" skin and is reserved for Pre-A1/A1 adults.',
    ],
  },
};
