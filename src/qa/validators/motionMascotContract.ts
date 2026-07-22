// Motion & Mascot Contract validator.
// Hard-blocks any slide missing the runtime animation metadata the lesson
// player needs to drive Rive (mascot.state) and Framer Motion (motion.entrance).
// See src/orchestrator/motionAnimationPrompt.ts for the generation contract.

import type { QAIssue, QALesson, QASlide } from '../types';

const VALID_STATES = new Set([
  'idle', 'blink', 'wave', 'point_left', 'point_right',
  'celebrate', 'thinking', 'listening', 'speaking', 'sad',
]);

const VALID_ENTRANCES = new Set([
  'fade_up', 'scale_in', 'slide_in_right', 'slide_in_left', 'pop',
]);

function getMascot(s: QASlide): any {
  return (s as any).mascot ?? (s as any).content?.mascot;
}

function getMotion(s: QASlide): any {
  return (s as any).motion ?? (s as any).content?.motion;
}

export function validateMotionMascotContract(lesson: QALesson): QAIssue[] {
  const issues: QAIssue[] = [];
  const slides = lesson.slides ?? [];

  let prevState: string | undefined;
  let prevEnv: string | undefined;

  for (const s of slides) {
    const mascot = getMascot(s);
    const motion = getMotion(s);
    const state = mascot?.state;
    const env = mascot?.environment;
    const entrance = motion?.entrance;

    if (!mascot || typeof state !== 'string' || !VALID_STATES.has(state)) {
      issues.push({
        code: 'MASCOT_STATE_MISSING',
        domain: 'structural',
        severity: 'block',
        message: `Slide ${s.id} is missing a valid mascot.state (one of: ${[...VALID_STATES].join(', ')}).`,
        locator: { slideId: s.id },
        auto_repairable: true,
      });
    } else if (prevState && prevState === state) {
      issues.push({
        code: 'MASCOT_STATE_REPEATED',
        domain: 'structural',
        severity: 'warn',
        message: `Slide ${s.id} repeats mascot.state="${state}" from the previous slide.`,
        locator: { slideId: s.id },
        auto_repairable: true,
      });
    }

    if (env && prevEnv && prevEnv === env) {
      issues.push({
        code: 'MASCOT_ENVIRONMENT_REPEATED',
        domain: 'structural',
        severity: 'warn',
        message: `Slide ${s.id} repeats mascot.environment="${env}" from the previous slide.`,
        locator: { slideId: s.id },
        auto_repairable: true,
      });
    }

    if (!motion || typeof entrance !== 'string' || !VALID_ENTRANCES.has(entrance)) {
      issues.push({
        code: 'MOTION_ENTRANCE_MISSING',
        domain: 'structural',
        severity: 'block',
        message: `Slide ${s.id} is missing a valid motion.entrance (one of: ${[...VALID_ENTRANCES].join(', ')}).`,
        locator: { slideId: s.id },
        auto_repairable: true,
      });
    } else {
      const dur = Number(motion?.duration_ms);
      if (!Number.isFinite(dur) || dur < 80 || dur > 1200) {
        issues.push({
          code: 'MOTION_DURATION_OUT_OF_RANGE',
          domain: 'structural',
          severity: 'warn',
          message: `Slide ${s.id} motion.duration_ms=${motion?.duration_ms} outside 80–1200ms band.`,
          locator: { slideId: s.id },
          auto_repairable: true,
        });
      }
    }

    if (state) prevState = state;
    if (env) prevEnv = env;
  }

  return issues;
}
