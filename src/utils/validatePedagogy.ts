/**
 * Rule 9: Teach → Practice Sequence Validator
 * Checks that teaching slides are followed by appropriate practice slides.
 */

const TEACH_PRACTICE_RULES: Record<string, string[]> = {
  vocab_list: ['match_words', 'image_match', 'match_halves', 'sorting_game'],
  grammar_explanation: ['fill_in_blanks', 'sentence_builder', 'fill_in_the_gaps'],
  reading_passage: ['reading_quiz', 'true_false', 'quiz_mcq'],
  audio_listening: ['listening_comprehension', 'shadowing_drill', 'quiz_mcq'],
};

export interface PedagogyWarning {
  index: number;
  teachType: string;
  nextType: string;
  expectedTypes: string[];
}

export function validatePedagogy(slides: any[]): PedagogyWarning[] {
  const warnings: PedagogyWarning[] = [];

  for (let i = 0; i < slides.length - 1; i++) {
    const slideType = slides[i]?.slide_type || slides[i]?.type || '';
    const allowedNext = TEACH_PRACTICE_RULES[slideType];

    if (allowedNext) {
      const nextType = slides[i + 1]?.slide_type || slides[i + 1]?.type || '';
      if (!allowedNext.includes(nextType)) {
        warnings.push({
          index: i,
          teachType: slideType,
          nextType,
          expectedTypes: allowedNext,
        });
        console.warn(
          `⚠️ Sequence Warning: "${slideType}" at index [${i}] is not followed by a valid practice slide. Found "${nextType}", expected one of: ${allowedNext.join(', ')}`
        );
      }
    }
  }

  return warnings;
}
