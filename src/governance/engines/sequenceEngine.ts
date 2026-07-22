import type { GovernanceIssue, Slide } from '../types';

// Canonical pedagogical arc: Hook → Context → Input → Discovery → Controlled
//                            → Communicative → Reflection.
// We score the actual slide sequence against this rhythm.

const MODALITY: Record<string, 'receptive' | 'productive' | 'meta'> = {
  hook: 'meta', warmup: 'meta', warm_up: 'meta', cool_off: 'meta', reflection: 'meta',
  context: 'receptive', input: 'receptive', vocab_list: 'receptive', grammar_explanation: 'receptive',
  reading_passage: 'receptive', audio_listening: 'receptive', story: 'receptive', prime: 'receptive',
  mimic: 'productive', practice: 'productive', controlled: 'productive', discovery: 'productive',
  produce: 'productive', communicative: 'productive', dialogue: 'productive', shadowing: 'productive',
  quiz_mcq: 'productive', fill_in_blanks: 'productive', sentence_builder: 'productive',
  match_words: 'productive', sorting_game: 'productive', interview: 'productive',
};

function typeOf(s: Slide): string {
  return (s.slide_type || s.type || s.kind || '').toString().toLowerCase();
}

export function validateSequence(slides: Slide[]): GovernanceIssue[] {
  if (!slides || slides.length === 0) return [];
  const issues: GovernanceIssue[] = [];

  // 1. No more than 2 consecutive slides of the same modality.
  let run = 1;
  for (let i = 1; i < slides.length; i++) {
    const a = MODALITY[typeOf(slides[i - 1])] || 'meta';
    const b = MODALITY[typeOf(slides[i])] || 'meta';
    if (a === b) {
      run++;
      if (run > 2 && a !== 'meta') {
        issues.push({
          engine: 'sequence',
          severity: 'warning',
          code: 'MODALITY_FATIGUE',
          message: `Three or more consecutive ${a} slides — alternate receptive and productive activities.`,
          slideIndex: i,
        });
        run = 1;
      }
    } else {
      run = 1;
    }
  }

  // 2. Must include at least one productive/communicative slide.
  const hasProductive = slides.some((s) => MODALITY[typeOf(s)] === 'productive');
  if (!hasProductive) {
    issues.push({
      engine: 'sequence',
      severity: 'error',
      code: 'NO_PRODUCTIVE_SLIDE',
      message: 'Lesson has no productive/communicative activity — pedagogy requires output.',
    });
  }

  // 3. Should open with a meta/receptive hook, not straight into production.
  const firstMod = MODALITY[typeOf(slides[0])];
  if (firstMod === 'productive') {
    issues.push({
      engine: 'sequence',
      severity: 'warning',
      code: 'MISSING_HOOK',
      message: 'Lesson opens with a production activity — add a warm-up or hook first.',
      slideIndex: 0,
    });
  }

  return issues;
}
