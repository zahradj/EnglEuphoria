import type { ErrorPattern } from '../types';
import { classifyMistake, type RawMistake } from './errorClassifier';

export function aggregateErrorPatterns(
  raw: RawMistake[],
  now: Date = new Date(),
): ErrorPattern[] {
  const map = new Map<string, ErrorPattern>();
  for (const r of raw) {
    const key = r.pattern_key;
    const existing = map.get(key);
    const days = Math.floor((now.getTime() - new Date(r.occurred_at).getTime()) / 86400000);
    if (existing) {
      existing.frequency += 1;
      existing.recency_days = Math.min(existing.recency_days, days);
    } else {
      const category = classifyMistake(r);
      map.set(key, {
        pattern_key: key,
        category,
        frequency: 1,
        recency_days: days,
        severity: 'low',
        recommended_support: defaultSupport(category),
      });
    }
  }
  for (const p of map.values()) {
    const score = p.frequency * 1.5 - p.recency_days * 0.2;
    p.severity = score >= 6 ? 'high' : score >= 3 ? 'medium' : 'low';
  }
  return [...map.values()].sort((a, b) => b.frequency - a.frequency);
}

function defaultSupport(category: ErrorPattern['category']): string[] {
  switch (category) {
    case 'omission':
      return ['guided speaking', 'visual timelines', 'sentence-building tasks'];
    case 'substitution':
      return ['contrastive examples', 'controlled practice', 'minimal pairs'];
    case 'overgeneralization':
      return ['rule contrast', 'targeted noticing', 'controlled output'];
    case 'l1_interference':
      return ['contrastive analysis', 'translation contrast', 'shadowing'];
    case 'pronunciation_substitution':
      return ['minimal pairs', 'phoneme drilling', 'shadowing'];
    case 'word_stress':
      return ['stress mapping', 'shadowing', 'rhythm drills'];
  }
}
