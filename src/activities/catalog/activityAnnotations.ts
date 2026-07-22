// Cycle 4 — pedagogical metadata layer over the activity catalog.
// Side-table so we don't have to edit every entry in activityCatalog.ts.
//
// Every ActivityType gets:
//   - cognitive_class: input_based | guided_output | output_based | analytical
//   - esa_phases:      which Engage/Study/Activate slots accept it
//   - target_skills:   skill tags used by SRS / coherence engines
//   - pedagogy_rule:   short rule tag (here_and_now, ssp, substitution_table, ...)
//
// Used by:
//   - fitScorer (hard-lockout of analytical types at Pre-A1 / A1)
//   - flows/selectFlow (Engage/Study/Activate slot matching)
//   - activityPromptBuilder (metadata block injected into the per-activity prompt)
//   - qa/validators/activityMetadata (defense-in-depth publish gate)

import type { ActivityType } from '../types';

export type CognitiveClass =
  | 'input_based'      // here-and-now comprehension, no forced speech
  | 'guided_output'    // language produced within a tight scaffold (substitution tables, chunk frames)
  | 'output_based'     // free or semi-free production (speaking missions, roleplay, debate)
  | 'analytical';      // metalinguistic manipulation (fill-blank, tense transform, explicit MCQ)

export type EsaPhase = 'engage' | 'study' | 'activate';

export type TargetSkill =
  | 'phonics'
  | 'vocabulary'
  | 'syntax'
  | 'grammar'
  | 'listening'
  | 'speaking'
  | 'reading'
  | 'writing'
  | 'pragmatics'
  | 'discourse';

export interface ActivityAnnotation {
  cognitive_class: CognitiveClass;
  esa_phases: EsaPhase[];
  target_skills: TargetSkill[];
  pedagogy_rule: string;
  ai_triggers?: string[];
}

const A = (
  cognitive_class: CognitiveClass,
  esa_phases: EsaPhase[],
  target_skills: TargetSkill[],
  pedagogy_rule: string,
  ai_triggers?: string[],
): ActivityAnnotation => ({ cognitive_class, esa_phases, target_skills, pedagogy_rule, ai_triggers });

export const ACTIVITY_ANNOTATIONS: Record<ActivityType, ActivityAnnotation> = {
  // ── Engage / hook
  warmup:        A('input_based',   ['engage'],            ['listening'],                'hook'),
  poll:          A('output_based',  ['engage', 'activate'],['discourse'],                'communicative'),
  opinion:       A('output_based',  ['activate'],          ['speaking', 'discourse'],    'communicative'),

  // ── Input-based (here-and-now)
  matching:              A('input_based', ['engage', 'study'],   ['vocabulary', 'reading'],   'here_and_now'),
  drag_drop:             A('input_based', ['engage', 'activate'],['vocabulary', 'listening'], 'here_and_now'),
  listen_and_match:      A('input_based', ['engage', 'activate'],['listening', 'vocabulary'], 'here_and_now'),
  audio_to_image_match:  A('input_based', ['engage', 'activate'],['listening', 'vocabulary'], 'here_and_now', ['high_speaking_anxiety']),
  sound_discrimination:  A('input_based', ['study'],             ['listening', 'phonics'],    'here_and_now'),
  listening_hunt:        A('input_based', ['activate'],          ['listening', 'vocabulary'], 'here_and_now'),
  audio_sequence:        A('input_based', ['study', 'activate'], ['listening', 'discourse'],  'here_and_now'),
  minimal_pairs:         A('input_based', ['study'],             ['listening', 'phonics'],    'here_and_now'),
  hotspot:               A('input_based', ['engage', 'study'],   ['vocabulary'],              'here_and_now'),

  // ── Multi-sensory phonics (SSP)
  trace_letter:       A('input_based', ['study'], ['phonics', 'writing'], 'ssp'),
  trace_word:         A('input_based', ['study'], ['phonics', 'writing'], 'ssp'),
  phoneme_tap:        A('input_based', ['study'], ['phonics', 'listening'], 'ssp'),
  blend_builder:      A('input_based', ['study'], ['phonics'],            'ssp'),
  rhyme_match:        A('input_based', ['study'], ['phonics', 'listening'], 'ssp'),
  cvc_builder:        A('guided_output', ['study'], ['phonics', 'writing'], 'ssp'),
  sound_hunt:         A('input_based', ['study'], ['phonics', 'listening'], 'ssp'),
  decode_the_word:    A('guided_output', ['study'], ['phonics', 'reading'], 'ssp'),
  syllable_clap:      A('input_based', ['study'], ['phonics', 'speaking'], 'ssp'),
  onset_rime_builder: A('input_based', ['study'], ['phonics'], 'ssp'),
  drag_the_letters:   A('input_based', ['study'], ['phonics'], 'ssp'),
  missing_sound:      A('input_based', ['study'], ['phonics', 'listening'], 'ssp'),
  phonics_bingo:      A('input_based', ['study'], ['phonics', 'listening'], 'ssp'),
  tap_the_grapheme:   A('input_based', ['study'], ['phonics'], 'ssp'),
  sound_sorting:      A('input_based', ['study'], ['phonics', 'listening'], 'ssp'),
  beginning_sound:    A('input_based', ['study'], ['phonics', 'listening'], 'ssp'),
  ending_sound:       A('input_based', ['study'], ['phonics', 'listening'], 'ssp'),

  // ── Guided output (substitution tables, chunk frames)
  sentence_builder:    A('guided_output', ['study', 'activate'], ['syntax', 'vocabulary'], 'substitution_table'),
  chunk_builder:       A('guided_output', ['study', 'activate'], ['syntax', 'vocabulary'], 'substitution_table'),
  substitution_drill:  A('guided_output', ['study'],             ['syntax', 'speaking'],   'substitution_table'),
  sentence_expansion:  A('guided_output', ['activate'],          ['syntax', 'writing'],    'substitution_table'),
  pronunciation:       A('guided_output', ['study', 'activate'], ['speaking', 'phonics'],  'output_practice'),
  pronunciation_tap:   A('guided_output', ['study'],             ['phonics', 'listening'], 'ssp'),
  echo_repetition:     A('guided_output', ['study', 'activate'], ['speaking'],             'output_practice'),
  dictation_builder:   A('guided_output', ['study'],             ['listening', 'writing'], 'output_practice'),

  // ── Output-based (free production)
  speaking_mission:     A('output_based', ['activate'], ['speaking'],            'output_practice', ['boomerang_activate']),
  roleplay:             A('output_based', ['activate'], ['speaking', 'discourse'],'output_practice'),
  storytelling:         A('output_based', ['activate'], ['speaking', 'discourse'],'output_practice'),
  collaborative:        A('output_based', ['activate'], ['speaking', 'pragmatics'], 'communicative'),
  debate:               A('output_based', ['activate'], ['speaking', 'discourse'], 'communicative'),
  dialogue_completion:  A('output_based', ['activate'], ['speaking', 'pragmatics'], 'communicative'),
  story_reconstruction: A('output_based', ['activate'], ['speaking', 'discourse'], 'output_practice'),
  branching_choice:     A('output_based', ['activate'], ['speaking', 'discourse'], 'communicative'),
  interactive_story:    A('input_based',  ['engage', 'activate'], ['listening', 'reading'], 'here_and_now'),
  vocab_match_board:    A('input_based',  ['study', 'activate'], ['listening', 'reading'], 'communicative'),

  // ── Unified Phonics System
  phonics_card:         A('input_based',  ['engage', 'study'],  ['listening', 'reading', 'speaking'], 'here_and_now'),
  phoneme_isolation:    A('input_based',  ['study'],            ['listening'], 'here_and_now'),
  blending_animation:   A('input_based',  ['study'],            ['listening', 'reading'], 'here_and_now'),
  minimal_pair_tap:     A('input_based',  ['study'],            ['listening'], 'here_and_now'),
  grapheme_hunt:        A('input_based',  ['study'],            ['reading'], 'here_and_now'),
  decoding_probe:       A('output_based', ['study', 'activate'], ['reading', 'speaking'], 'output_practice'),

  // ── Reading / listening receptive
  reading:              A('input_based', ['study'], ['reading'], 'here_and_now'),
  listening:            A('input_based', ['study'], ['listening'], 'here_and_now'),

  // ── Analytical (≥A2)
  fill_blank:           A('analytical', ['study'], ['grammar'], 'explicit_rule'),
  tense_transform:      A('analytical', ['study'], ['grammar'], 'explicit_rule', ['boomerang_study']),
  grammar_sort:         A('analytical', ['study'], ['grammar'], 'explicit_rule'),
  grammar_color_builder:A('analytical', ['study'], ['grammar', 'syntax'], 'explicit_rule'),
  timeline_drag:        A('analytical', ['study'], ['grammar'], 'explicit_rule'),
  rapid_fire_drill:     A('analytical', ['study'], ['grammar', 'speaking'], 'explicit_rule'),
  evidence_hunt:        A('analytical', ['study'], ['reading'], 'explicit_rule'),
  sequencing:           A('analytical', ['study'], ['discourse', 'reading'], 'explicit_rule'),

  // ── Reflection / retrieval
  reflection:           A('output_based', ['activate'], ['discourse'],  'reflective_practice'),
  retrieval:            A('analytical',   ['study'],    ['vocabulary'], 'spaced_retrieval', ['srs_overdue']),
  review_challenge:     A('output_based', ['activate'], ['speaking', 'vocabulary'], 'spaced_retrieval', ['srs_overdue']),
};

export function getAnnotation(type: ActivityType): ActivityAnnotation {
  return ACTIVITY_ANNOTATIONS[type];
}

/** Hard rule: analytical activities are locked at Pre-A1 / A1. */
export function isAnalyticalLocked(type: ActivityType, cefr: string): boolean {
  const ann = ACTIVITY_ANNOTATIONS[type];
  if (!ann) return false;
  if (ann.cognitive_class !== 'analytical') return false;
  return cefr === 'Pre-A1' || cefr === 'A1';
}
