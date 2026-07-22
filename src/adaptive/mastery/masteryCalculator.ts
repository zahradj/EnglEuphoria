import type { SkillMasteryRecord, Trend, ReviewPriority } from '../types';

export interface MasteryUpdateInput {
  accuracy: number;            // 0-1 on the latest exposure
  delayed_recall?: number;     // 0-1 if applicable
  communicative_use: boolean;
  now?: Date;
}

const W = { recency: 0.2, accuracy: 0.5, delayed: 0.2, communicative: 0.1 };

export function recomputeMastery(
  current: SkillMasteryRecord,
  input: MasteryUpdateInput,
): SkillMasteryRecord {
  const now = input.now ?? new Date();
  const acc = clamp(input.accuracy, 0, 1) * 100;
  const delayed = clamp(input.delayed_recall ?? input.accuracy, 0, 1) * 100;
  const recency = current.last_seen
    ? Math.max(0, 100 - daysBetween(new Date(current.last_seen), now) * 5)
    : 60;
  const communicative = input.communicative_use ? 100 : 40;

  const next =
    W.recency * recency +
    W.accuracy * acc +
    W.delayed * delayed +
    W.communicative * communicative;

  const smoothed = 0.6 * current.mastery + 0.4 * next;
  const trend: Trend =
    smoothed > current.mastery + 3 ? 'rising'
    : smoothed < current.mastery - 3 ? 'declining'
    : 'stable';

  const exposures = current.exposures + 1;
  const communicative_uses = current.communicative_uses + (input.communicative_use ? 1 : 0);

  return {
    ...current,
    mastery: round(smoothed),
    confidence: round(0.7 * current.confidence + 0.3 * acc),
    trend,
    review_priority: derivePriority(smoothed, current.confidence),
    exposures,
    communicative_uses,
    last_seen: now.toISOString(),
  };
}

export function isMastered(r: SkillMasteryRecord): boolean {
  return r.mastery >= 85 && r.exposures >= 3 && r.communicative_uses >= 1;
}

function derivePriority(mastery: number, confidence: number): ReviewPriority {
  if (mastery < 40) return 'critical';
  if (mastery < 60 || confidence < 50) return 'high';
  if (mastery < 80) return 'medium';
  return 'low';
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}
function round(n: number) {
  return Math.round(n * 10) / 10;
}
function daysBetween(a: Date, b: Date) {
  return Math.abs(b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24);
}
