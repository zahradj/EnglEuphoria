// SVG stroke-path trace scoring.
// Pure helper — accepts an SVGPathElement (or a path length + getPointAtLength fn)
// and a sequence of (x,y) sample points the learner drew. Returns an accuracy
// score 0..100 = average proximity of each sample to the nearest point on the
// path, normalized by a tolerance band.
//
// Used by the Playground TraceCanvas component (trace_letter / trace_word).

export interface TracePoint { x: number; y: number; t?: number }

export interface TraceScoreOptions {
  toleranceBand: number;     // px — drawings within this band count as perfect
  maxDeviation: number;      // px — drawings beyond this band count as 0
  pathSamples?: number;      // how many points to sample along the SVG path (default 200)
}

export interface TraceScoreResult {
  score: number;             // 0..100
  averageDeviationPx: number;
  worstDeviationPx: number;
  passed: boolean;           // score >= 70
  coverage: number;          // 0..1, fraction of path that received at least one nearby sample
}

export interface PathLike {
  getTotalLength(): number;
  getPointAtLength(len: number): { x: number; y: number };
}

const DEFAULTS: Required<TraceScoreOptions> = {
  toleranceBand: 8,
  maxDeviation: 36,
  pathSamples: 200,
};

export function scoreTrace(
  path: PathLike,
  samples: TracePoint[],
  opts: Partial<TraceScoreOptions> = {},
): TraceScoreResult {
  const o = { ...DEFAULTS, ...opts };
  if (!samples.length) {
    return { score: 0, averageDeviationPx: o.maxDeviation, worstDeviationPx: o.maxDeviation, passed: false, coverage: 0 };
  }

  const total = path.getTotalLength();
  const refPoints: Array<{ x: number; y: number }> = [];
  for (let i = 0; i < o.pathSamples; i++) {
    refPoints.push(path.getPointAtLength((i / (o.pathSamples - 1)) * total));
  }

  const visited = new Array<boolean>(refPoints.length).fill(false);
  let sumDev = 0;
  let worst = 0;

  for (const s of samples) {
    let bestDist = Infinity;
    let bestIdx = -1;
    for (let i = 0; i < refPoints.length; i++) {
      const p = refPoints[i];
      const dx = s.x - p.x;
      const dy = s.y - p.y;
      const d = Math.hypot(dx, dy);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    }
    if (bestIdx >= 0) visited[bestIdx] = true;
    sumDev += bestDist;
    if (bestDist > worst) worst = bestDist;
  }

  const avg = sumDev / samples.length;
  // Map: avg <= toleranceBand → 100; avg >= maxDeviation → 0; linear between.
  const span = Math.max(1, o.maxDeviation - o.toleranceBand);
  const raw = 1 - Math.max(0, avg - o.toleranceBand) / span;
  const score = Math.round(Math.max(0, Math.min(1, raw)) * 100);
  const coverage = visited.filter(Boolean).length / visited.length;

  return {
    score,
    averageDeviationPx: avg,
    worstDeviationPx: worst,
    passed: score >= 70 && coverage >= 0.6,
    coverage,
  };
}
