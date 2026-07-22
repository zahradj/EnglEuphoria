// Dedicated Playground Pedagogy Engine — shared types.
// Sibling to src/activities, src/grammar, src/speaking.
// Only applies when hub === 'playground'.

export interface PlaygroundRegister {
  maxDefinitionWords: number;       // ≤ 6
  maxSentenceWords: number;          // ≤ 6
  maxSyllablesPerWord: number;       // ≤ 2
  forbiddenAbstractWords: string[];
}

export interface PlaygroundPacing {
  targetSlideCount: [number, number]; // [min, max]
  maxConsecutiveHighLoad: number;     // 1
  celebrationEveryNSlides: number;    // 3
  speakingEveryNSlides: number;       // 3
  maxTextLengthChars: number;         // hard ceiling per slide body
}

export interface PlaygroundActivityProfile {
  banned: string[];          // semantic types never allowed
  required: string[];        // semantic types that MUST appear at least once
  preferred: string[];       // selection bias
}

export const PLAYGROUND_REGISTER: PlaygroundRegister = {
  maxDefinitionWords: 6,
  maxSentenceWords: 6,
  maxSyllablesPerWord: 2,
  forbiddenAbstractWords: [
    'concept', 'signify', 'essentially', 'represent', 'denote',
    'pertaining', 'phenomenon', 'rationalize', 'theoretical',
    'abstract', 'metaphorical', 'conceptual', 'paradigm',
    'hypothesis', 'underlying', 'fundamentally', 'constitute',
    'demonstrate', 'utilize', 'facilitate', 'comprise',
  ],
};

export const PLAYGROUND_PACING: PlaygroundPacing = {
  targetSlideCount: [20, 25],
  maxConsecutiveHighLoad: 1,
  celebrationEveryNSlides: 3,
  speakingEveryNSlides: 3,
  maxTextLengthChars: 140,
};

export const PLAYGROUND_ACTIVITY_PROFILE: PlaygroundActivityProfile = {
  banned: [
    'debate', 'opinion', 'reflection', 'reflection_essay',
    'analytical_writing', 'argument', 'discursive',
  ],
  required: [
    // any-of: at least one phonics/trace, one listening, one speaking
    'trace_letter|trace_word|phoneme_tap|phonics|rhyme_match',
    'listen_and_match|listening|audio_to_image_match|sound_discrimination',
    'pronunciation|speaking_mission|storytelling|echo_repetition',
  ],
  preferred: [
    'matching', 'drag_drop', 'warmup', 'pronunciation', 'storytelling',
    'sentence_builder', 'trace_word', 'rhyme_match',
  ],
};

/**
 * Cycle 4 — Pre-A1 ONLY hard ban list.
 * These analytical text-based activity types are forbidden for Pre-A1
 * Playground lessons. A1+ Playground lessons keep current freedom.
 */
export const PLAYGROUND_PREA1_BANNED: readonly string[] = [
  'fill_blank',
  'multiple_choice',
  'mcq',
  'tense_transform',
  'dictation',
  'dictation_builder',
  'error_correction',
];

/**
 * Cycle 4 — function/structure words that must never appear as
 * isolated vocab headwords in Pre-A1 Playground lessons.
 * Vocabulary is taught only inside lexical chunks.
 */
export const PLAYGROUND_PREA1_FUNCTION_WORDS: readonly string[] = [
  'is', 'am', 'are', 'was', 'were', 'be',
  'a', 'an', 'the',
  'my', 'your', 'his', 'her', 'its', 'our', 'their',
  'it', 'this', 'that', 'these', 'those',
  'i', 'you', 'he', 'she', 'we', 'they',
  'and', 'or', 'but',
  'can', 'do', 'does',
];
