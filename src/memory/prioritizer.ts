// Smart review prioritization.
// Composite score over: low mastery, errors, weak production, low speaking
// confidence, pronunciation difficulty, inactivity, failed recalls, latency.

import type { LearnerIntelligence } from '@/intelligence/types';
import { computeForgettingRisk } from './forgettingCurve';
import type { MemoryItem, ReviewQueueEntry } from './types';

export function prioritize(
  items: MemoryItem[],
  intel: LearnerIntelligence,
  now = new Date(),
): ReviewQueueEntry[] {
  const errorByTarget = new Map<string, number>();
  for (const ep of intel.error_patterns) {
    errorByTarget.set(ep.target.toLowerCase(), (errorByTarget.get(ep.target.toLowerCase()) ?? 0) + ep.frequency);
  }

  const ranked = items.map((item) => {
    const rationale: string[] = [];
    const risk = computeForgettingRisk(item, now);
    let score = risk * 0.45;
    if (risk > 0.5) rationale.push(`high forgetting risk (${risk.toFixed(2)})`);

    const masteryGap = 1 - (item.active_mastery || 0);
    score += masteryGap * 0.2;
    if (masteryGap > 0.5) rationale.push('weak active mastery');

    const speakingGap = 1 - (item.speaking_retention || 0);
    if (item.skill_kind === 'speaking_pattern' || item.skill_kind === 'communication_function') {
      score += speakingGap * 0.2;
      if (speakingGap > 0.5) rationale.push('low speaking retention');
    } else {
      score += speakingGap * 0.05;
    }

    const errorBoost = (errorByTarget.get(item.skill_key.toLowerCase()) ?? 0) * 0.05;
    score += Math.min(0.15, errorBoost);
    if (errorBoost > 0) rationale.push('recurring error pattern');

    // Inactivity boost
    if (item.last_seen_at) {
      const days = (now.getTime() - new Date(item.last_seen_at).getTime()) / 86400000;
      if (days > 7) {
        score += Math.min(0.1, days / 100);
        rationale.push(`inactive ${Math.round(days)}d`);
      }
    } else {
      score += 0.05;
      rationale.push('never reviewed');
    }

    // Speaking-confidence floor
    if (intel.speaking_confidence.tier === 'shy' && item.skill_kind === 'speaking_pattern') {
      score += 0.05;
      rationale.push('learner is shy — speaking pattern needs reinforcement');
    }

    const priority = Math.max(0, Math.min(1, score));
    const must_be_spoken =
      item.skill_kind === 'speaking_pattern' ||
      item.skill_kind === 'communication_function' ||
      (item.skill_kind === 'pronunciation' && speakingGap > 0.3);

    return {
      item,
      priority,
      rationale,
      must_be_spoken,
      target_recall_level: 1, // recallLadder will refine
    } as ReviewQueueEntry;
  });

  return ranked.sort((a, b) => b.priority - a.priority);
}
