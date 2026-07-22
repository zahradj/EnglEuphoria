// Mandatory intro-slide gate (Phase 7).
// Every lesson MUST start with exactly one cinematic intro slide that frames
// the story/world before any task. Hard-blocks violations.

import type { QAIssue, QALesson, QASlide } from '../types';

const EXERCISE_RX = /^(quiz|mcq|fill_blank|sentence_builder|matching|drag_drop|listening|reading|pronunciation|speaking_mission|roleplay|debate|grammar|drill|practice|trace_|phoneme_|cvc_|sound_|listen_and_|audio_to_|sound_discrimination|echo_|listening_|audio_sequence|dictation_|pronunciation_tap|minimal_pairs|tense_transform|substitution_|rapid_fire_|grammar_sort|sentence_expansion|chunk_builder|sequencing|evidence_hunt|dialogue_completion|story_reconstruction|hotspot|branching_choice|opinion|poll|retrieval|review_challenge|syllable_clap|onset_rime_builder|drag_the_letters|missing_sound|phonics_bingo|tap_the_grapheme|sound_sorting|beginning_sound|ending_sound)/i;

function isIntroSlide(s: QASlide | undefined): boolean {
  if (!s) return false;
  const kind = (s.kind ?? '').toLowerCase();
  return kind === 'intro' || kind === 'lesson_intro' || kind === 'opening';
}

function hasExerciseLikeActivity(s: QASlide): boolean {
  for (const a of s.activities ?? []) {
    const t = String((a as any)?.type ?? '').toLowerCase();
    if (!t) continue;
    if (EXERCISE_RX.test(t)) return true;
    const content: any = (a as any).content ?? {};
    if (Array.isArray(content?.options) && content.options.length > 0) return true;
    if (Array.isArray(content?.questions) && content.questions.length > 0) return true;
    if (Array.isArray(content?.items) && content.items.length > 0) return true;
  }
  return false;
}

export function validateIntroSlide(lesson: QALesson): QAIssue[] {
  const issues: QAIssue[] = [];
  const slides = lesson.slides ?? [];
  if (slides.length === 0) return issues; // structural validator handles empty

  const first = slides[0];
  if (!isIntroSlide(first)) {
    issues.push({
      code: 'INTRO_SLIDE_MISSING',
      domain: 'structural',
      severity: 'block',
      message: `Lesson must begin with an intro slide. Got "${first?.kind ?? '(unknown)'}" instead.`,
      locator: { slideId: first?.id },
      auto_repairable: true,
    });
  }

  const introCount = slides.filter(isIntroSlide).length;
  if (introCount > 1) {
    issues.push({
      code: 'INTRO_SLIDE_DUPLICATE',
      domain: 'structural',
      severity: 'block',
      message: `Only one intro slide is allowed; found ${introCount}.`,
      auto_repairable: true,
    });
  }

  for (const s of slides) {
    if (!isIntroSlide(s)) continue;
    if (hasExerciseLikeActivity(s)) {
      issues.push({
        code: 'INTRO_SLIDE_HAS_EXERCISE',
        domain: 'structural',
        severity: 'block',
        message: `Intro slide ${s.id} must not contain quizzes, options, or tasks.`,
        locator: { slideId: s.id },
        auto_repairable: true,
      });
    }
    const content: any = (s as any).content ?? {};
    const hasImage =
      typeof (s as any).image_prompt === 'string' ||
      typeof content.image_prompt === 'string';
    if (!hasImage) {
      issues.push({
        code: 'INTRO_SLIDE_NO_IMAGE_PROMPT',
        domain: 'structural',
        severity: 'warn',
        message: `Intro slide ${s.id} should declare image_prompt for the cinematic opener.`,
        locator: { slideId: s.id },
        auto_repairable: true,
      });
    }
  }

  return issues;
}
