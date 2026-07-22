// Memory heatmap builder.
// Strong / fragile / forgotten / speaking-weak / pronunciation-unstable / inactive-vocab.

import type { MemoryHeatmap, MemoryItem } from './types';
import { computeForgettingRisk } from './forgettingCurve';

export function buildHeatmap(items: MemoryItem[], now = new Date()): MemoryHeatmap {
  const strong: string[] = [];
  const fragile: string[] = [];
  const forgotten: string[] = [];
  const speaking_weak: string[] = [];
  const pronunciation_unstable: string[] = [];
  const inactive_vocab: string[] = [];

  for (const it of items) {
    const risk = computeForgettingRisk(it, now);
    if ((it.active_mastery ?? 0) >= 0.85 && risk < 0.2) strong.push(it.skill_key);
    else if (risk >= 0.7) forgotten.push(it.skill_key);
    else if (risk >= 0.35) fragile.push(it.skill_key);

    if (
      (it.skill_kind === 'speaking_pattern' || it.skill_kind === 'communication_function') &&
      (it.speaking_retention ?? 0) < 0.5
    ) speaking_weak.push(it.skill_key);

    if (it.skill_kind === 'pronunciation' && (it.pronunciation_retention ?? 0) < 0.6)
      pronunciation_unstable.push(it.skill_key);

    if (it.skill_kind === 'vocab') {
      const days = it.last_seen_at
        ? (now.getTime() - new Date(it.last_seen_at).getTime()) / 86400000
        : Infinity;
      if (days > 14) inactive_vocab.push(it.skill_key);
    }
  }

  return {
    strong,
    fragile,
    forgotten,
    speaking_weak,
    pronunciation_unstable,
    inactive_vocab,
    generatedAt: now.toISOString(),
  };
}
