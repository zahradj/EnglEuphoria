import type { CefrRoadmap } from '../roadmap/types';
import type { ThemedUnitSpec } from '../binding/themeBinder';

// 13-score curriculum metrics. Pure functions; deterministic; 0–100 scale.

export interface CurriculumMetrics {
  curriculum: {
    cefrAlignment: number;
    vocabDiversity: number;
    gameplayDiversity: number;
    thematicDiversity: number;
    emotionalVariety: number;
  };
  engagement: {
    replayability: number;
    engagementPrediction: number;
    boredomRisk: number;
    novelty: number;
  };
  structure: {
    progressionConsistency: number;
    adaptiveReadiness: number;
    modularity: number;
    scalability: number;
  };
  finalScore: number;
}

function uniqueRatio<T>(arr: T[]): number {
  if (!arr.length) return 0;
  return new Set(arr).size / arr.length;
}

export function computeMetrics(
  roadmap: CefrRoadmap,
  themed: ThemedUnitSpec[],
): CurriculumMetrics {
  const tones = themed.map((t) => t.world.emotionalTone);
  const gameplay = themed.map((t) => t.world.gameplayIdentity);
  const settings = themed.map((t) => t.world.visualStyle.setting);
  const palettes = themed.map((t) => t.world.palette.join(','));

  // Curriculum scores
  const cefrAlignment = roadmap.buckets.length > 0
    ? Math.round(100 * roadmap.buckets.filter((b) => b.grammarFocus.length && b.vocabularyFocus.length && b.communicativeGoal).length / roadmap.buckets.length)
    : 0;
  const vocabDiversity = Math.round(uniqueRatio(roadmap.vocabularyArc) * 100);
  const gameplayDiversity = Math.round(uniqueRatio(gameplay) * 100);
  const thematicDiversity = Math.round(((uniqueRatio(settings) + uniqueRatio(palettes)) / 2) * 100);
  const emotionalVariety = Math.round(uniqueRatio(tones) * 100);

  // Engagement scores
  let adjacentRepeat = 0;
  for (let i = 1; i < themed.length; i++) {
    if (tones[i] === tones[i - 1]) adjacentRepeat++;
    if (gameplay[i] === gameplay[i - 1]) adjacentRepeat++;
  }
  const boredomRisk = themed.length > 1
    ? Math.round((adjacentRepeat / ((themed.length - 1) * 2)) * 100)
    : 0;
  const novelty = Math.max(0, 100 - boredomRisk);
  const replayability = Math.round((gameplayDiversity + thematicDiversity) / 2);
  const engagementPrediction = Math.round((novelty * 0.4 + emotionalVariety * 0.3 + gameplayDiversity * 0.3));

  // Structure scores
  const progressionConsistency = roadmap.buckets.length > 0
    ? Math.round(100 * roadmap.buckets.filter((b, i) => i === 0 || b.reviewTargets.length > 0).length / roadmap.buckets.length)
    : 0;
  const topicFitRatio = themed.length > 0
    ? themed.filter((t) => t.fitReason === 'topic-fit').length / themed.length
    : 0;
  const adaptiveReadiness = Math.round(topicFitRatio * 100);
  const modularity = themed.length > 0 ? 100 : 0; // worlds are fully swappable
  const scalability = Math.min(100, 40 + themed.length * 6); // grows with library

  const finalScore = Math.round(
    (cefrAlignment * 0.20 +
     vocabDiversity * 0.08 +
     gameplayDiversity * 0.08 +
     thematicDiversity * 0.08 +
     emotionalVariety * 0.08 +
     engagementPrediction * 0.15 +
     novelty * 0.08 +
     replayability * 0.05 +
     progressionConsistency * 0.10 +
     adaptiveReadiness * 0.05 +
     modularity * 0.03 +
     scalability * 0.02),
  );

  return {
    curriculum: { cefrAlignment, vocabDiversity, gameplayDiversity, thematicDiversity, emotionalVariety },
    engagement: { replayability, engagementPrediction, boredomRisk, novelty },
    structure: { progressionConsistency, adaptiveReadiness, modularity, scalability },
    finalScore,
  };
}
