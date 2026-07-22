// Targeted single-slide repair prompt builder.
// The actual Gemini call lives in the existing generation pipeline; this just
// formats the corrective instruction so the caller can re-prompt one slide.

import type { GovernanceIssue, LessonState, Slide } from './types';
import { buildGovernanceSystemPrompt } from './promptInjector';

export interface RepairRequest {
  systemPrompt: string;
  userPrompt: string;
  slideIndex: number;
  originalSlide: Slide;
}

export function buildSlideRepair(
  state: LessonState,
  slide: Slide,
  issues: GovernanceIssue[],
): RepairRequest {
  const issueList = issues
    .filter((i) => i.slideIndex !== undefined)
    .map((i) => `- [${i.severity.toUpperCase()} · ${i.code}] ${i.message}`)
    .join('\n');

  const userPrompt = [
    'The following slide FAILED curriculum governance.',
    'Rewrite ONLY this slide so it passes ALL rules in the contract above.',
    'Keep the same slide_type and pedagogical intent.',
    'Return only the corrected slide JSON — no commentary.',
    '',
    '### Failures',
    issueList || '(no specific issues — improve clarity and contract compliance)',
    '',
    '### Original slide JSON',
    '```json',
    JSON.stringify(slide, null, 2),
    '```',
  ].join('\n');

  return {
    systemPrompt: buildGovernanceSystemPrompt(state),
    userPrompt,
    slideIndex: issues.find((i) => i.slideIndex !== undefined)?.slideIndex ?? 0,
    originalSlide: slide,
  };
}
