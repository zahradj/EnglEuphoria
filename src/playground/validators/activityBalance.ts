// Playground Activity Balancer — Phase 6 cross-phase consolidation.
// Hard-blocks unbalanced Playground lessons at QA time:
//   - max 2 MCQ activities
//   - max 1 error_correction activity
//   - ≥1 listening, ≥1 speaking, ≥1 drill, ≥1 communicative output, ≥1 interactive game
//
// Lives in src/playground/validators/ but is registered alongside the
// existing PG validators in src/qa/orchestrator.ts.

import type { QAIssue, QALesson } from '@/qa/types';

const MCQ_TYPES = new Set(['poll', 'opinion', 'fill_blank', 'sound_discrimination', 'minimal_pairs']);
const LISTENING_TYPES = new Set([
  'listening', 'listen_and_match', 'audio_to_image_match', 'sound_discrimination',
  'listening_hunt', 'audio_sequence', 'minimal_pairs', 'dictation_builder', 'pronunciation_tap',
]);
const SPEAKING_TYPES = new Set([
  'pronunciation', 'speaking_mission', 'storytelling', 'echo_repetition',
  'roleplay', 'rapid_fire_drill', 'substitution_drill',
]);
const DRILL_TYPES = new Set([
  'substitution_drill', 'rapid_fire_drill', 'tense_transform', 'sentence_builder',
  'chunk_builder', 'grammar_color_builder', 'grammar_sort', 'timeline_drag',
]);
const COMMUNICATIVE_TYPES = new Set([
  'roleplay', 'storytelling', 'speaking_mission', 'sentence_expansion', 'collaborative',
]);
const GAME_TYPES = new Set([
  'matching', 'drag_drop', 'rhyme_match', 'cvc_builder', 'blend_builder',
  'sound_hunt', 'phoneme_tap', 'decode_the_word', 'grammar_sort', 'timeline_drag',
]);
const ERROR_CORRECTION = new Set(['error_correction']);

export function validatePlaygroundActivityBalance(lesson: QALesson): QAIssue[] {
  if (lesson.hub !== 'Playground') return [];

  const issues: QAIssue[] = [];
  const counts = {
    mcq: 0,
    error_correction: 0,
    listening: 0,
    speaking: 0,
    drill: 0,
    communicative: 0,
    game: 0,
  };

  for (const slide of lesson.slides ?? []) {
    for (const a of slide.activities ?? []) {
      const t = typeof a.type === 'string' ? a.type : '';
      if (!t) continue;
      if (MCQ_TYPES.has(t)) counts.mcq++;
      if (ERROR_CORRECTION.has(t)) counts.error_correction++;
      if (LISTENING_TYPES.has(t)) counts.listening++;
      if (SPEAKING_TYPES.has(t)) counts.speaking++;
      if (DRILL_TYPES.has(t)) counts.drill++;
      if (COMMUNICATIVE_TYPES.has(t)) counts.communicative++;
      if (GAME_TYPES.has(t)) counts.game++;
    }
  }

  // Cycle 4: Pre-A1 hard-zeroes MCQ-style activities (handled granularly
  // in prea1Sequence validator too). Other Playground bands keep cap of 2.
  const mcqCap = lesson.cefr === 'Pre-A1' ? 0 : 2;
  if (counts.mcq > mcqCap) {
    issues.push({
      code: 'PG_BALANCE_MCQ_OVERLOAD',
      domain: 'activity',
      severity: 'block',
      message: `Playground lesson has ${counts.mcq} MCQ-style activities; max for ${lesson.cefr} is ${mcqCap}.`,
      suggestion: 'Replace extra MCQs with matching, drag_drop, trace, or speaking tasks.',
      auto_repairable: true,
    });
  }
  if (counts.error_correction > 1) {
    issues.push({
      code: 'PG_BALANCE_ERROR_CORRECTION_OVERLOAD',
      domain: 'activity',
      severity: 'block',
      message: `Playground lesson has ${counts.error_correction} error_correction activities; max is 1.`,
      suggestion: 'Replace with a positive-frame drill or game.',
      auto_repairable: true,
    });
  }

  const floors: Array<[keyof typeof counts, string, string]> = [
    ['listening', 'PG_BALANCE_NO_LISTENING', 'Add a listening activity (listen_and_match, audio_to_image_match, etc.).'],
    ['speaking', 'PG_BALANCE_NO_SPEAKING', 'Add a speaking activity (echo_repetition, pronunciation, storytelling).'],
    ['drill', 'PG_BALANCE_NO_DRILL', 'Add at least one drill (substitution_drill, chunk_builder, grammar_sort).'],
    ['communicative', 'PG_BALANCE_NO_COMMUNICATIVE_OUTPUT', 'Add a communicative output (roleplay, storytelling, sentence_expansion).'],
    ['game', 'PG_BALANCE_NO_INTERACTIVE_GAME', 'Add an interactive game (matching, drag_drop, rhyme_match, sound_hunt).'],
  ];
  for (const [key, code, suggestion] of floors) {
    if ((counts[key] as number) < 1) {
      issues.push({
        code,
        domain: 'activity',
        severity: 'block',
        message: `Playground lesson missing required category: ${key}.`,
        suggestion,
        auto_repairable: true,
      });
    }
  }

  return issues;
}
