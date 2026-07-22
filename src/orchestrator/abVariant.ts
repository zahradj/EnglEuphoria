/**
 * A/B Variant Generation — generates 2 versions of L1 of each unit and picks the
 * higher-scoring one. Scoring uses the Lesson Critic overall score (when available)
 * and falls back to a deterministic structural score.
 *
 * Caller wires this in `runLessonGeneration` for `lesson.index === 1` only.
 */

import type { QALesson } from '../qa/types';
import type { LessonCriticResult } from '../qa/judges/lessonCritic';

export interface VariantCandidate {
  lesson: QALesson;
  criticScore?: number;
  structuralScore: number;
}

export interface VariantPick {
  winner: VariantCandidate;
  loser: VariantCandidate;
  reason: string;
}

/** Deterministic structural scoring fallback (no LLM call). */
export function structuralScore(lesson: QALesson): number {
  const slides = lesson.slides ?? [];
  if (slides.length === 0) return 0;
  const kinds = slides.map((s) => ((s as any).type ?? (s as any).kind ?? '').toLowerCase());
  const unique = new Set(kinds).size;
  const variety = (unique / Math.max(slides.length, 1)) * 40; // 0–40
  const hasSpeaking = kinds.some((k) => k.includes('speak')) ? 20 : 0;
  const hasAudio = kinds.some((k) => k.includes('audio') || k.includes('chant') || k.includes('song')) ? 15 : 0;
  const hasReview = kinds.some((k) => k.includes('review') || k.includes('memory')) ? 10 : 0;
  const lengthFit = slides.length >= 8 && slides.length <= 16 ? 15 : 5;
  return Math.round(variety + hasSpeaking + hasAudio + hasReview + lengthFit);
}

export function scoreCandidate(lesson: QALesson, critic?: LessonCriticResult): VariantCandidate {
  return {
    lesson,
    criticScore: critic ? Math.round(
      critic.scores.pedagogical_flow * 0.25 +
      critic.scores.vocab_recycling * 0.25 +
      critic.scores.speaking_authenticity * 0.2 +
      critic.scores.character_coherence * 0.15 +
      critic.scores.engagement_variety * 0.15,
    ) : undefined,
    structuralScore: structuralScore(lesson),
  };
}

export function pickVariant(a: VariantCandidate, b: VariantCandidate): VariantPick {
  const sa = a.criticScore ?? a.structuralScore;
  const sb = b.criticScore ?? b.structuralScore;
  if (sa >= sb) {
    return { winner: a, loser: b, reason: `A wins ${sa} vs ${sb} (${a.criticScore !== undefined ? 'critic' : 'structural'}).` };
  }
  return { winner: b, loser: a, reason: `B wins ${sb} vs ${sa} (${b.criticScore !== undefined ? 'critic' : 'structural'}).` };
}

/** Convenience: run two generations in parallel and pick the best. */
export async function runABVariant(opts: {
  generate: () => Promise<QALesson>;
  critic?: (lesson: QALesson) => Promise<LessonCriticResult | undefined>;
}): Promise<VariantPick> {
  const [aLesson, bLesson] = await Promise.all([opts.generate(), opts.generate()]);
  const [aCritic, bCritic] = opts.critic
    ? await Promise.all([opts.critic(aLesson), opts.critic(bLesson)])
    : [undefined, undefined];
  return pickVariant(scoreCandidate(aLesson, aCritic), scoreCandidate(bLesson, bCritic));
}
