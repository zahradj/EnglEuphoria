import type { QAIssue, QALesson } from '../types';
import { CEFR_COMPLEXITY_CAPS } from '../data/cefrComplexityCaps';
import { allText, countClauses, fleschKincaidGrade, sentences, words } from '../util/text';

export function validateCefrAccuracy(lesson: QALesson): QAIssue[] {
  const issues: QAIssue[] = [];
  const caps = CEFR_COMPLEXITY_CAPS[lesson.cefr];
  const text = allText(lesson);
  const sents = sentences(text);

  let overLong = 0;
  let overClauses = 0;
  for (const s of sents) {
    const ws = words(s);
    if (ws.length > caps.max_sentence_words) overLong++;
    if (countClauses(s) > caps.max_clauses_per_sentence) overClauses++;
  }

  if (sents.length > 0 && overLong / sents.length > 0.15) {
    issues.push({
      code: 'CEFR_SENTENCE_OVER_CAP',
      domain: 'cefr',
      severity: 'block',
      message: `${overLong}/${sents.length} sentences exceed ${caps.max_sentence_words}-word cap for ${lesson.cefr}.`,
      suggestion: 'Shorten sentences or split into simpler clauses.',
      auto_repairable: true,
    });
  } else if (overLong > 0) {
    issues.push({
      code: 'CEFR_SENTENCE_OVER_CAP_SOFT',
      domain: 'cefr',
      severity: 'warn',
      message: `${overLong} sentence(s) exceed the ${lesson.cefr} word cap.`,
      auto_repairable: true,
    });
  }

  if (overClauses > 0) {
    issues.push({
      code: 'CEFR_CLAUSE_DEPTH_OVER_CAP',
      domain: 'cefr',
      severity: overClauses > 3 ? 'block' : 'warn',
      message: `${overClauses} sentence(s) exceed clause-depth cap (${caps.max_clauses_per_sentence}) for ${lesson.cefr}.`,
      auto_repairable: true,
    });
  }

  const fk = fleschKincaidGrade(text);
  if (fk > caps.flesch_kincaid_max + 2) {
    issues.push({
      code: 'CEFR_READING_GRADE_OVER_CAP',
      domain: 'cefr',
      severity: 'warn',
      message: `Flesch-Kincaid grade ${fk.toFixed(1)} exceeds ${lesson.cefr} target (~${caps.flesch_kincaid_max}).`,
      auto_repairable: true,
    });
  }

  for (const banned of caps.forbidden_tense_keywords) {
    if (new RegExp(`\\b${banned}\\b`, 'i').test(text)) {
      issues.push({
        code: 'CEFR_FORBIDDEN_TENSE_KEYWORD',
        domain: 'cefr',
        severity: 'block',
        message: `Above-level tense surface marker detected: "${banned}".`,
        auto_repairable: true,
      });
    }
  }

  return issues;
}
