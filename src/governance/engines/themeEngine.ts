import type { LessonState, GovernanceIssue, Slide } from '../types';
import { extractSlideText } from '../util/extractText';

/**
 * Verifies the slide stays inside the declared theme/character/setting envelope.
 * Soft: a single themed signal anywhere in the slide is enough to pass.
 * Names are case-insensitive whole-word matches.
 */
export function validateTheme(slide: Slide, state: LessonState, slideIndex?: number): GovernanceIssue[] {
  const text = extractSlideText(slide).toLowerCase();
  if (!text) return [];

  const signals: string[] = [];
  if (state.theme.theme) signals.push(...state.theme.theme.toLowerCase().split(/\s+/));
  if (state.theme.setting) signals.push(...state.theme.setting.toLowerCase().split(/\s+/));
  for (const c of state.theme.characters || []) signals.push(c.toLowerCase());

  const meaningful = signals
    .map((s) => s.replace(/[^a-z0-9-]/g, ''))
    .filter((s) => s.length > 2);

  if (meaningful.length === 0) return [];

  const hit = meaningful.some((s) => new RegExp(`\\b${s}\\b`).test(text));

  // Only warn — themes for short instructional slides may legitimately not name anything.
  if (!hit && text.length > 80) {
    return [{
      engine: 'theme',
      severity: 'warning',
      code: 'THEME_DRIFT',
      message: `Slide text does not reference the lesson theme, characters, or setting.`,
      slideIndex,
      detail: { expectedAnyOf: meaningful.slice(0, 6) },
    }];
  }
  return [];
}
