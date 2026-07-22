import type { CefrLevel, CefrRoadmap } from './types';
import { A1_PLAYGROUND_BUCKETS } from './a1Roadmap';

// Generate a pure CEFR roadmap. NO themes. NO mascots. Pedagogy only.
// Future passes will add A2/B1/B2/C1 + academy/success variants.
export function generateCefrRoadmap(
  hub: 'playground' | 'academy' | 'success',
  level: CefrLevel,
): CefrRoadmap {
  if (hub === 'playground' && level === 'A1') {
    return {
      hub, level,
      buckets: A1_PLAYGROUND_BUCKETS,
      vocabularyArc: A1_PLAYGROUND_BUCKETS.flatMap((b) => b.vocabularyFocus),
      grammarArc: A1_PLAYGROUND_BUCKETS.flatMap((b) => b.grammarFocus),
    };
  }
  // Fallback: return an empty scaffold so callers don't crash while the
  // remaining libraries are being built.
  return {
    hub, level,
    buckets: [],
    vocabularyArc: [],
    grammarArc: [],
  };
}
