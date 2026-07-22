// Cohort aggregator — computes p50/p90 over a metric set.

export function percentile(sorted: number[], p: number): number {
  if (!sorted.length) return 0;
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.floor(p * (sorted.length - 1))));
  return sorted[idx];
}

export interface MetricStat {
  metric: string;
  p50: number;
  p90: number;
  sample_size: number;
}

export function summarize(metric: string, values: number[]): MetricStat {
  const sorted = [...values].sort((a, b) => a - b);
  return {
    metric,
    p50: percentile(sorted, 0.5),
    p90: percentile(sorted, 0.9),
    sample_size: sorted.length,
  };
}
