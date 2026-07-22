// Tier-6 prompt hint built from active learner signals.
// Chained AFTER coherence, BEFORE activity prompts.
// NEVER overrides CEFR / curriculum / age / safety / communication.

import type { LearnerSignal } from './types';

export function buildAnalyticsHintPrompt(signals: LearnerSignal[]): string {
  if (!signals.length) return '';
  const lines = signals
    .filter((s) => s.severity >= 0.4)
    .map((s) => `- ${s.type} (severity=${s.severity.toFixed(2)})`);
  if (!lines.length) return '';
  return [
    '### LEARNER ANALYTICS HINT (tier 6 — soft, advisory only)',
    'Recent telemetry suggests the following learner state. Adapt pacing, encouragement, and scaffolding accordingly.',
    'You MUST NOT override CEFR ceiling, curriculum sequence, age-appropriateness, safety, or communication objectives.',
    ...lines,
    'Guidance:',
    '- frustration/overload → slow down, restate, offer a confidence-boost task next.',
    '- boredom/too_easy → raise stakes within CEFR ceiling, add a spontaneous production opportunity.',
    '- disengagement → open with a high-engagement speaking or game beat.',
    '- too_hard → reduce micro-task complexity, add a worked example, keep target intact.',
  ].join('\n');
}
