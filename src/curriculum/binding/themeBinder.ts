import type { CefrRoadmap, CefrBucket } from '../roadmap/types';
import type { World } from '../worlds/types';
import { rotateWorlds, type RoadmapBucket } from '../worlds/worldRotator';
import { getWorlds } from '../worlds/worldRegistry';

// A ThemedUnitSpec is the contract handed to the lesson generation pipeline.
// It marries pure CEFR pedagogy (`bucket`) with a thematic skin (`world`).
export interface ThemedUnitSpec {
  bucket: CefrBucket;
  world: World;
  themedTitle: string;       // unit title rebranded with the world identity
  fitReason: 'topic-fit' | 'rotation-fallback';
}

export function bindWorlds(roadmap: CefrRoadmap): ThemedUnitSpec[] {
  const worlds = getWorlds(roadmap.hub, roadmap.level);
  if (!worlds.length) return [];

  const rotatorBuckets: RoadmapBucket[] = roadmap.buckets.map((b) => ({
    index: b.index,
    topics: b.topics,
  }));

  const rotation = rotateWorlds(worlds, rotatorBuckets);

  return rotation.map((r) => {
    const bucket = roadmap.buckets[r.bucketIndex];
    return {
      bucket,
      world: r.world,
      themedTitle: `${r.world.name}: ${bucket.unitTitle}`,
      fitReason: r.reason,
    };
  });
}
