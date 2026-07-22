import type { World } from './types';

// Deterministic rotator. Constraints:
//   1. Never schedule a world whose emotional tone matches the previous slot.
//   2. Never schedule a world whose gameplay identity matches the previous slot.
//   3. Prefer worlds whose topic affinity overlaps the bucket topic.
//   4. Across the full sequence, prefer maximum diversity of tones + gameplay.
//
// Pure, no randomness — same input always yields same output so curriculum
// generations are reproducible.

export interface RoadmapBucket {
  index: number;       // 0-based
  topics: string[];    // canonical topic slugs from CEFR roadmap
}

export interface RotationResult {
  bucketIndex: number;
  world: World;
  reason: 'topic-fit' | 'rotation-fallback';
}

function topicOverlap(world: World, topics: string[]): number {
  if (!topics.length) return 0;
  return topics.filter((t) => world.topicAffinity.includes(t)).length;
}

export function rotateWorlds(
  worlds: World[],
  buckets: RoadmapBucket[],
): RotationResult[] {
  if (!worlds.length) return [];
  const out: RotationResult[] = [];
  const usedCounts = new Map<string, number>();

  let prevTone: string | null = null;
  let prevGameplay: string | null = null;

  for (const bucket of buckets) {
    // Score every world. Higher is better.
    const scored = worlds.map((w) => {
      const used = usedCounts.get(w.slug) ?? 0;
      let score = topicOverlap(w, bucket.topics) * 10;
      score -= used * 4;                                    // diversity bias
      if (prevTone && w.emotionalTone === prevTone) score -= 100;
      if (prevGameplay && w.gameplayIdentity === prevGameplay) score -= 100;
      return { world: w, score };
    });

    scored.sort((a, b) => b.score - a.score);
    const pick = scored[0];

    out.push({
      bucketIndex: bucket.index,
      world: pick.world,
      reason: topicOverlap(pick.world, bucket.topics) > 0 ? 'topic-fit' : 'rotation-fallback',
    });

    usedCounts.set(pick.world.slug, (usedCounts.get(pick.world.slug) ?? 0) + 1);
    prevTone = pick.world.emotionalTone;
    prevGameplay = pick.world.gameplayIdentity;
  }

  return out;
}
