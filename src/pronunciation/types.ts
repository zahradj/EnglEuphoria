// Phonics & Pronunciation Integration — shared types.
// Pure TS. Consumes LessonState (governance) + LessonPlan (planner).
// Output feeds activity generation as micro-supports, full standalone phonics
// lessons, and booster fluency lessons.

import type { Cefr, Hub } from '@/governance/types';

export type ReadingStage =
  | 'pre_reader'      // no decoding yet
  | 'early_decoder'   // CVC, simple blends
  | 'developing_decoder'
  | 'fluent_decoder'
  | 'advanced_reader';

export type PronunciationLayer =
  | 'integrated'      // embedded inside a normal lesson (Layer 1)
  | 'standalone'      // dedicated phonics lesson (Layer 2)
  | 'booster'         // pronunciation/fluency workshop (Layer 3)
  | 'micro';          // tiny inline reinforcement (Layer 4)

export type PronunciationActivityType =
  | 'repeat_after_audio'
  | 'sound_discrimination'
  | 'blending'
  | 'syllable_counting'
  | 'stress_identification'
  | 'pronunciation_sorting'
  | 'shadowing'
  | 'rhythm_drill'
  | 'intonation_practice'
  | 'minimal_pairs'
  | 'connected_speech_training'
  | 'pronunciation_game'
  | 'fluency_repetition'
  | 'speaking_mission_pron';

export interface PronunciationFocus {
  pronunciation_focus: string;
  target_sounds: string[];            // IPA tokens, e.g. ['/t/','/d/','/ɪd/']
  stress_patterns: string[];          // e.g. ['inVEStigate','SUSpicious']
  intonation_patterns: string[];      // e.g. ['rising-question','falling-statement']
  connected_speech_targets: string[]; // e.g. ['linking /t/+/j/','schwa reduction']
  common_pronunciation_errors: string[];
}

export type PhonicsPhase =
  | 'sounds'      // Phase 1 — letter↔sound, phonemic awareness
  | 'cvc'         // Phase 2 — CVC blending/segmenting
  | 'digraphs'    // Phase 3 — sh/ch/th/ng/qu, simple vowel digraphs
  | 'blends'      // Phase 4 — consonant clusters (str, bl, fr)
  | 'advanced';   // Phase 5 — silent letters, schwa, complex graphemes

export interface PhonicsUnit {
  id: string;
  order: number;
  phase: PhonicsPhase;
  graphemes: string[];                // e.g. ['s','a','t','p']
  phonemes: string[];                 // matching IPA
  skill: 'phonemic_awareness' | 'decoding' | 'blending' | 'segmenting' | 'high_frequency' | 'digraphs' | 'blends' | 'advanced';
  blend_targets?: string[];           // e.g. ['sat','pat','tap']
  sight_words?: string[];
  reading_stage: ReadingStage;
}

export interface PronunciationMicroMoment {
  id: string;
  type: 'stress' | 'syllable' | 'sound_highlight' | 'connected_speech' | 'rhythm';
  trigger_word_or_phrase: string;
  hint: string;                       // short, learner-facing
  attached_to_slide_index?: number;
}

export interface BoosterLesson {
  id: string;
  title: string;
  hub: Exclude<Hub, 'playground'>;    // Academy / Success only
  topic:
    | 'shadowing'
    | 'connected_speech'
    | 'rhythm_stress'
    | 'public_speaking'
    | 'fast_speech_comprehension'
    | 'presentation_fluency'
    | 'accent_clarity';
  cefr_min: Cefr;
  cefr_max: Cefr;
  focus: PronunciationFocus;
}

export type PronunciationIssueSeverity = 'error' | 'warning';

export interface PronunciationIssue {
  code: string;
  severity: PronunciationIssueSeverity;
  message: string;
  field?: string;
}

export interface PronunciationValidationReport {
  passed: boolean;
  errors: PronunciationIssue[];
  warnings: PronunciationIssue[];
}
