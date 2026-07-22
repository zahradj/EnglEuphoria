// Hub profiles for the pronunciation system. Drives layer selection,
// activity bans, and the tone of phonics content.
//
// NOTE on early readers (Pre-A1 / A1):
//   Academy and Success now ALLOW the 'standalone' layer, but ONLY when
//   `isEarlyReader({hub, cefr})` returns true. The layer selector is the
//   single source of truth for that gating — this file just declares the
//   capability so the selector can use it.

import type { Hub } from '@/governance/types';
import type { PronunciationActivityType, PronunciationLayer } from './types';

export interface PronunciationHubProfile {
  allowed_layers: PronunciationLayer[];
  /** Layers that require the early-reader gate (Pre-A1 / A1) to unlock. */
  early_reader_unlocks: PronunciationLayer[];
  preferred_activities: PronunciationActivityType[];
  banned_activities: PronunciationActivityType[];
  tone: 'playful' | 'modern' | 'professional';
  use_ipa: 'minimal' | 'optional' | 'expected';
  /** Visual identity of the PhonicsCard for this hub. */
  card_skin: 'playground' | 'academy' | 'success';
  notes: string[];
}

export const PRONUNCIATION_HUB_PROFILES: Record<Hub, PronunciationHubProfile> = {
  playground: {
    allowed_layers: ['integrated', 'standalone', 'micro'],
    early_reader_unlocks: [],
    preferred_activities: [
      'blending', 'syllable_counting', 'pronunciation_game',
      'sound_discrimination', 'repeat_after_audio', 'rhythm_drill',
    ],
    banned_activities: [
      'shadowing', 'connected_speech_training', 'intonation_practice',
    ],
    tone: 'playful',
    use_ipa: 'minimal',
    card_skin: 'playground',
    notes: [
      'Visual, movement, chant-driven.',
      'Standalone phonics lessons are the spine of the hub.',
      'Avoid technical phonetic terminology.',
    ],
  },
  academy: {
    // Standalone unlocked ONLY for Pre-A1 / A1 teens who never learned to decode.
    allowed_layers: ['integrated', 'standalone', 'booster', 'micro'],
    early_reader_unlocks: ['standalone'],
    preferred_activities: [
      'stress_identification', 'rhythm_drill', 'minimal_pairs',
      'shadowing', 'fluency_repetition', 'speaking_mission_pron',
      'sound_discrimination', 'pronunciation_sorting',
    ],
    // Childish framings stay banned; the standalone PhonicsCard for Academy
    // uses a "code-breaker" identity-driven skin, not nursery framing.
    banned_activities: ['pronunciation_game'],
    tone: 'modern',
    use_ipa: 'optional',
    card_skin: 'academy',
    notes: [
      'Standalone phonics is allowed ONLY for early-reader teens (Pre-A1/A1).',
      'When present, frame as "decode like a code-breaker" — never nursery chants.',
      'Above A1, pronunciation = confidence and intelligibility, not decoding.',
    ],
  },
  success: {
    // Standalone unlocked ONLY for Pre-A1 / A1 adults who can't read Latin script.
    allowed_layers: ['integrated', 'standalone', 'booster', 'micro'],
    early_reader_unlocks: ['standalone'],
    preferred_activities: [
      'shadowing', 'connected_speech_training', 'intonation_practice',
      'stress_identification', 'fluency_repetition', 'speaking_mission_pron',
      'sound_discrimination', 'minimal_pairs',
    ],
    banned_activities: ['pronunciation_game', 'syllable_counting'],
    tone: 'professional',
    use_ipa: 'expected',
    card_skin: 'success',
    notes: [
      'Standalone phonics is allowed ONLY for early-reader adults (Pre-A1/A1).',
      'Frame as "professional clarity" — names, addresses, signs, emails.',
      'Never juvenile chants; IPA is shown by default and respected.',
    ],
  },
};
