import type { QAIssue, QALesson } from '../types';
import { SPEAKING_TASK_RED_FLAGS, UNSAFE_PHRASES } from '../data/unsafeThemeLexicon';
import { slideText } from '../util/text';

export function validateEmotionalSafety(lesson: QALesson): QAIssue[] {
  const issues: QAIssue[] = [];

  for (const slide of lesson.slides) {
    const text = slideText(slide).join(' ');
    for (const { phrase, reason } of UNSAFE_PHRASES) {
      if (phrase.test(text)) {
        issues.push({
          code: 'SAFETY_UNSAFE_PHRASE',
          domain: 'safety',
          severity: 'block',
          message: `Emotional-safety violation in slide "${slide.title ?? slide.id}": ${reason}.`,
          locator: { slideId: slide.id },
          suggestion: 'Rewrite the prompt with a supportive, low-pressure framing.',
          auto_repairable: false,
        });
      }
    }

    const isSpeaking = (slide.activities ?? []).some((a) =>
      ['speaking_mission', 'roleplay', 'debate', 'pronunciation', 'shadowing'].includes(a.type),
    );
    if (isSpeaking) {
      for (const { phrase, reason } of SPEAKING_TASK_RED_FLAGS) {
        if (phrase.test(text)) {
          issues.push({
            code: 'SAFETY_SPEAKING_TASK_RED_FLAG',
            domain: 'safety',
            severity: 'block',
            message: `Unsafe speaking-task framing in slide "${slide.title ?? slide.id}": ${reason}.`,
            locator: { slideId: slide.id },
            suggestion: 'Add private-rehearsal scaffold and an opt-out path.',
            auto_repairable: false,
          });
        }
      }
    }
  }

  return issues;
}
