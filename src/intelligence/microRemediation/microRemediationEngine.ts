// Micro-Remediation Engine — decides tiny in-lesson repair injections.
// Lightweight, fast, non-punitive. Triggered by intelligence signals.

import type { LearnerIntelligence, MicroRepair } from '../types';

export interface CurrentSlideHint {
  skillFocus?: string;
  hasSpeakingTask?: boolean;
}

/**
 * Returns 0..2 micro-repair specs based on the intelligence signals.
 * The player consumes these between regular slides.
 */
export function decideMicroRepairs(
  intel: LearnerIntelligence,
  current: CurrentSlideHint = {},
): MicroRepair[] {
  const out: MicroRepair[] = [];

  // 1. Repeated developmental errors (≥3 occurrences in same target)
  const recurring = intel.error_patterns
    .filter(e => e.frequency >= 3 && e.classification !== 'careless')
    .slice(0, 1);
  for (const err of recurring) {
    out.push({
      kind: err.category === 'pronunciation' ? 'pronunciation_replay' : 'mini_grammar_fix',
      target: err.target || err.surface,
      duration_s: err.category === 'pronunciation' ? 15 : 30,
      prompt:
        err.category === 'pronunciation'
          ? `Quick replay: say "${err.target}".`
          : `Fix it fast — change "${err.surface}" to the correct form.`,
      reason: `recurring ${err.category} (${err.frequency}×)`,
    });
  }

  // 2. Pronunciation focus targets below 65%
  if (out.length < 2 && intel.pronunciation_state.focus_targets.length > 0) {
    const ph = intel.pronunciation_state.focus_targets[0];
    out.push({
      kind: 'pronunciation_replay',
      target: ph,
      duration_s: 15,
      prompt: `Listen and repeat: ${ph}`,
      reason: `phoneme accuracy below 65%`,
    });
  }

  // 3. Speaking confidence downgrade → quick low-stakes speaking repair
  if (
    out.length < 2 &&
    current.hasSpeakingTask &&
    (intel.speaking_confidence.tier === 'shy' || intel.speaking_confidence.growth_trend === 'down')
  ) {
    out.push({
      kind: 'quick_speaking_repair',
      target: 'one sentence',
      duration_s: 20,
      prompt: `Try one short sentence — no pressure, just one go.`,
      reason: `speaking confidence ${intel.speaking_confidence.tier}/${intel.speaking_confidence.growth_trend}`,
    });
  }

  // 4. Irregular verb mastery gap
  if (out.length < 2) {
    const irregularGap = Object.values(intel.mastery_map).find(
      m => /irregular|past simple|verb/i.test(m.skill) && m.recall < 55,
    );
    if (irregularGap) {
      out.push({
        kind: 'irregular_verb_flash',
        target: irregularGap.skill,
        duration_s: 20,
        prompt: `Flash review: ${irregularGap.skill}.`,
        reason: `recall ${irregularGap.recall}% < 55%`,
      });
    }
  }

  return out.slice(0, 2);
}
