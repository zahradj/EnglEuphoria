// Stage vocabulary normalizer.
// Bridge between the planner canon (hook/context/input/discovery/controlled/
// communicative/production/reflection) and the legacy stabilization canon
// (warmup/prime/mimic/practice/produce/cooloff). Everything downstream of
// planning uses the planner canon; this module makes stabilization speak it.

export type CanonicalStage =
  | 'hook'
  | 'context'
  | 'input'
  | 'discovery'
  | 'controlled'
  | 'communicative'
  | 'production'
  | 'reflection';

export const CANONICAL_ORDER: readonly CanonicalStage[] = [
  'hook',
  'context',
  'input',
  'discovery',
  'controlled',
  'communicative',
  'production',
  'reflection',
] as const;

const ALIAS: Record<string, CanonicalStage> = {
  // legacy stabilization vocab
  warmup: 'hook',
  warm_up: 'hook',
  'warm-up': 'hook',
  prime: 'input',
  mimic: 'controlled',
  practice: 'communicative',
  produce: 'production',
  cooloff: 'reflection',
  cool_off: 'reflection',
  'cool-off': 'reflection',
  // common synonyms seen in AI output
  intro: 'hook',
  presentation: 'input',
  modeling: 'input',
  semi: 'communicative',
  semi_controlled: 'communicative',
  free: 'production',
  free_practice: 'production',
  wrap_up: 'reflection',
  wrapup: 'reflection',
  review: 'reflection',
};

export function normalizeStage(raw: string | null | undefined): CanonicalStage | null {
  if (!raw) return null;
  const key = String(raw).toLowerCase().trim();
  if ((CANONICAL_ORDER as readonly string[]).includes(key)) return key as CanonicalStage;
  return ALIAS[key] ?? null;
}

export function stageRank(raw: string | null | undefined): number {
  const s = normalizeStage(raw);
  return s ? CANONICAL_ORDER.indexOf(s) : -1;
}
