import type { QAIssue, QALesson } from '../types';
import { HUB_THEME_BANS } from '../data/ageInappropriateThemes';
import { allText, slideText } from '../util/text';

export function validateAgeAppropriateness(lesson: QALesson): QAIssue[] {
  const issues: QAIssue[] = [];
  const bans = HUB_THEME_BANS[lesson.hub];
  const fullText = allText(lesson);

  for (const re of bans) {
    if (re.test(fullText)) {
      issues.push({
        code: 'AGE_HUB_THEME_BAN',
        domain: 'age',
        severity: lesson.hub === 'Playground' ? 'block' : 'warn',
        message: `Content matches a ${lesson.hub}-banned theme pattern: ${re}.`,
        suggestion: 'Remove or replace the offending theme with hub-appropriate content.',
        auto_repairable: true,
      });
    }
  }

  // Per-slide check for repeated offenders
  for (const slide of lesson.slides) {
    const text = slideText(slide).join(' ');
    for (const re of bans) {
      if (re.test(text)) {
        issues.push({
          code: 'AGE_HUB_THEME_BAN_SLIDE',
          domain: 'age',
          severity: 'warn',
          message: `Slide "${slide.title ?? slide.id}" contains hub-banned theme.`,
          locator: { slideId: slide.id },
          auto_repairable: true,
        });
        break;
      }
    }
  }

  return issues;
}
