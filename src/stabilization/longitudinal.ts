// Longitudinal stabilization analyzers.
// Run inside feedbackLoop after each completed lesson.
// Emit CurriculumStabilizationSignal[] consumed by the next runLessonGeneration.

import type { LessonContext, LessonContextPatch } from '@/orchestrator/types';
import type { CurriculumStabilizationSignal } from './types';

export interface LongitudinalInput {
  studentId: string;
  recentLessons: Array<{
    lessonId: string;
    completedAt: string;
    hub: string;
    cefr: string;
    activityTypes: string[];
    skillsTouched: string[]; // 'reading'|'writing'|'listening'|'speaking'|'vocabulary'|'grammar'
    engagement?: { accuracy?: number; completion?: number };
  }>;
}

const SKILLS = ['reading', 'writing', 'listening', 'speaking', 'vocabulary', 'grammar'] as const;

export function runLongitudinalAnalysis(input: LongitudinalInput): CurriculumStabilizationSignal[] {
  const now = new Date().toISOString();
  const signals: CurriculumStabilizationSignal[] = [];
  const lessons = input.recentLessons.slice(-10);
  if (lessons.length === 0) return signals;

  // skill_imbalance
  const counts = Object.fromEntries(SKILLS.map((s) => [s, 0])) as Record<string, number>;
  lessons.forEach((l) => l.skillsTouched.forEach((s) => (counts[s] = (counts[s] ?? 0) + 1)));
  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
  const underServed = SKILLS.filter((s) => counts[s] / total < 0.08);
  if (underServed.length > 0) {
    signals.push({
      studentId: input.studentId,
      signalType: 'skill_imbalance',
      payload: { underServed, counts },
      createdAt: now,
    });
  }

  // activity_fatigue
  const typeCounts: Record<string, number> = {};
  lessons.slice(-5).forEach((l) =>
    l.activityTypes.forEach((t) => (typeCounts[t] = (typeCounts[t] ?? 0) + 1)),
  );
  const fatigued = Object.entries(typeCounts).filter(([, n]) => n >= 5).map(([t]) => t);
  if (fatigued.length > 0) {
    signals.push({
      studentId: input.studentId,
      signalType: 'activity_fatigue',
      payload: { types: fatigued },
      createdAt: now,
    });
  }

  // learner_fatigue (accuracy / completion decay)
  const last5 = lessons.slice(-5);
  if (last5.length >= 3) {
    const accs = last5.map((l) => l.engagement?.accuracy ?? 1);
    const slope = accs[accs.length - 1] - accs[0];
    if (slope < -0.15) {
      signals.push({
        studentId: input.studentId,
        signalType: 'learner_fatigue',
        payload: { accuracySlope: Number(slope.toFixed(3)) },
        createdAt: now,
      });
    }
  }

  // hub_drift: same CEFR across hubs without divergence is not measurable here;
  // we emit a heads-up if hub changed in window.
  const hubs = new Set(lessons.map((l) => l.hub));
  if (hubs.size > 1) {
    signals.push({
      studentId: input.studentId,
      signalType: 'hub_drift',
      payload: { hubs: [...hubs] },
      createdAt: now,
    });
  }

  return signals;
}

/**
 * Translate unread stabilization signals into a LessonContextPatch.
 * Tier 6 (adaptive) — soft, never overrides CEFR / curriculum / age.
 */
export function applyStabilizationSignals(
  _ctx: LessonContext,
  signals: CurriculumStabilizationSignal[],
): LessonContextPatch {
  const patch: LessonContextPatch = { notes: [] };
  for (const s of signals) {
    switch (s.signalType) {
      case 'learner_fatigue':
        patch.pacingHint = 'slow_down';
        patch.scaffoldingBoost = Math.max(patch.scaffoldingBoost ?? 0, 1);
        patch.notes!.push('stabilization: learner_fatigue → slow_down + scaffold+1');
        break;
      case 'activity_fatigue':
        patch.notes!.push(`stabilization: activity_fatigue → vary types (${JSON.stringify(s.payload)})`);
        break;
      case 'skill_imbalance':
        patch.notes!.push(`stabilization: skill_imbalance → bias toward ${JSON.stringify(s.payload)}`);
        break;
      case 'hub_drift':
        patch.notes!.push('stabilization: hub_drift → enforce hub-identity divergence');
        break;
    }
  }
  return patch;
}
