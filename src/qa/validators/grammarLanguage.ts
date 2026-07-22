import type { QAIssue, QALesson } from '../types';
import { AI_PHRASING_MARKERS, PLACEHOLDER_LEAK_MARKERS } from '../data/aiPhrasingMarkers';
import { slideText } from '../util/text';

export function validateGrammarLanguage(lesson: QALesson): QAIssue[] {
  const issues: QAIssue[] = [];

  for (const slide of lesson.slides) {
    const text = slideText(slide).join(' ');
    for (const re of AI_PHRASING_MARKERS) {
      if (re.test(text)) {
        issues.push({
          code: 'LANG_AI_PHRASING',
          domain: 'language',
          severity: 'block',
          message: `AI-phrasing artifact detected in slide "${slide.title ?? slide.id}".`,
          locator: { slideId: slide.id },
          suggestion: 'Rewrite naturally; remove meta-AI language.',
          auto_repairable: true,
        });
      }
    }
    for (const re of PLACEHOLDER_LEAK_MARKERS) {
      if (re.test(text)) {
        issues.push({
          code: 'LANG_PLACEHOLDER_LEAK',
          domain: 'language',
          severity: 'block',
          message: `Placeholder token leaked in slide "${slide.title ?? slide.id}".`,
          locator: { slideId: slide.id },
          auto_repairable: true,
        });
      }
    }

    // Answer-key consistency per activity
    for (const a of slide.activities ?? []) {
      if (!a.content || typeof a.content !== 'object') continue;
      const c = a.content as any;

      if (a.type === 'mcq' || a.type === 'multiple_choice' || Array.isArray(c.options)) {
        const opts: string[] = Array.isArray(c.options) ? c.options : [];
        const correct = c.correct ?? c.answer ?? c.correct_answer;
        if (correct !== undefined && opts.length > 0 && !opts.includes(correct)) {
          issues.push({
            code: 'LANG_MCQ_ANSWER_NOT_IN_OPTIONS',
            domain: 'language',
            severity: 'block',
            message: `MCQ correct answer "${String(correct)}" not present in options.`,
            locator: { slideId: slide.id, activityId: a.id },
            auto_repairable: true,
          });
        }
      }

      if (a.type === 'fill_blank' || c.blank) {
        const prompt: string | undefined = c.prompt ?? c.sentence;
        const answer: string | undefined = c.answer ?? c.correct;
        if (prompt && answer && !/[_]{2,}|\{blank\}|\.{3,}/.test(prompt)) {
          issues.push({
            code: 'LANG_FILL_BLANK_NO_GAP',
            domain: 'language',
            severity: 'warn',
            message: 'Fill-blank activity has no visible gap marker in prompt.',
            locator: { slideId: slide.id, activityId: a.id },
            auto_repairable: true,
          });
        }
      }
    }
  }

  return issues;
}
