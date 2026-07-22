// Detector: weak speaking integration — too few speaking prompts and/or
// speaking confined to a single slide.
import type { DetectorFailure } from '../types';
import { normalizeLesson, fail } from './_shared';

const SPEAKING_TYPES = new Set([
  'speaking', 'speak', 'shadowing', 'mimic', 'role_play', 'real_world_task',
  'produce', 'pronunciation', 'phonetic_mimic',
]);

export function detectWeakSpeaking(lesson: any): DetectorFailure[] {
  const { slides } = normalizeLesson(lesson);
  const total = slides.length || 1;
  const speakingSlides = slides.filter(
    (s) =>
      !!s.speakingPrompt ||
      (s.activityType && SPEAKING_TYPES.has(String(s.activityType).toLowerCase())) ||
      (s.type && SPEAKING_TYPES.has(String(s.type).toLowerCase())),
  );
  const ratio = speakingSlides.length / total;
  const failures: DetectorFailure[] = [];
  if (ratio < 0.15) {
    failures.push(
      fail('weakSpeaking', 'weak_speaking', `Speaking activities = ${(ratio * 100).toFixed(0)}% of slides (<15%)`, {
        severity: 'warn',
        evidence: { speakingSlides: speakingSlides.length, total },
      }),
    );
  }
  if (speakingSlides.length === 1 && total >= 6) {
    failures.push(
      fail('weakSpeaking', 'weak_speaking', 'Speaking confined to a single slide — no scaffolded progression', {
        severity: 'warn',
        slideIndex: speakingSlides[0].index,
        evidence: { speakingSlideIndex: speakingSlides[0].index },
      }),
    );
  }
  return failures;
}
