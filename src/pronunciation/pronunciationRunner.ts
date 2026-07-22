// Pronunciation runner — single entry point for normal lessons.
// 1. Decide which layers are active for the lesson.
// 2. Derive the PronunciationFocus from planner+governance state.
// 3. Validate focus (CEFR + communicative value).
// 4. Produce micro-moments to inject into slides.
// 5. Build the prompt prefix to chain into Gemini calls.

import type { LessonPlan } from '@/planning/types';
import { decideLayers } from './layerSelector';
import { derivePronunciationFocus } from './focusDeriver';
import {
  validateCommunicativeValue,
  validatePronunciationFocus,
} from './pronValidator';
import { generateMicroMoments } from './microMomentGenerator';
import { buildPronunciationSystemPrompt } from './promptInjector';
import type {
  PronunciationFocus,
  PronunciationLayer,
  PronunciationMicroMoment,
  PronunciationValidationReport,
} from './types';

export interface PronunciationRunResult {
  active_layers: PronunciationLayer[];
  focus: PronunciationFocus;
  micro_moments: PronunciationMicroMoment[];
  system_prompt: string;
  validation: PronunciationValidationReport;
}

export interface PronunciationRunOptions {
  plan: LessonPlan;
  lessonKind?: 'normal' | 'standalone_phonics' | 'booster';
}

export function runPronunciation(opts: PronunciationRunOptions): PronunciationRunResult {
  const { plan, lessonKind = 'normal' } = opts;
  const decision = decideLayers(plan, lessonKind);
  const focus = derivePronunciationFocus(plan);

  const focusReport = validatePronunciationFocus({
    focus,
    hub: plan.lesson_state.hub,
    cefr: plan.lesson_state.cefr,
  });
  const commReport = validateCommunicativeValue(plan, focus);

  const validation: PronunciationValidationReport = {
    passed: focusReport.passed && commReport.passed,
    errors: [...focusReport.errors, ...commReport.errors],
    warnings: [...focusReport.warnings, ...commReport.warnings],
  };

  const micro_moments = decision.active_layers.includes('micro')
    ? generateMicroMoments({ plan, focus })
    : [];

  const system_prompt = decision.active_layers.length
    ? buildPronunciationSystemPrompt({ plan, focus, activeLayers: decision.active_layers })
    : '';

  return {
    active_layers: decision.active_layers,
    focus,
    micro_moments,
    system_prompt,
    validation,
  };
}
