// Aggregator: combine QA + Stabilization + custom detector failures into
// a single overall TestVerdictLevel.
import type { DetectorFailure, TestVerdictLevel } from './types';

export function aggregateVerdict(args: {
  qaVerdict?: 'publish' | 'repair' | 'block' | null;
  stabVerdict?: 'publish' | 'repair' | 'block' | null;
  failures: DetectorFailure[];
}): TestVerdictLevel {
  const { qaVerdict, stabVerdict, failures } = args;
  if (qaVerdict === 'block' || stabVerdict === 'block') return 'fail';
  if (failures.some((f) => f.severity === 'error')) return 'fail';
  if (qaVerdict === 'repair' || stabVerdict === 'repair') return 'warn';
  if (failures.some((f) => f.severity === 'warn')) return 'warn';
  return 'pass';
}
