/**
 * Shared hub/student-level resolver.
 *
 * Resolves the canonical student level from any combination of:
 *   1) auth user metadata (`hub_type` / `preferred_hub`)
 *   2) `student_profiles.student_level`
 *   3) fallback `'playground'`
 *
 * All inputs are normalized case-insensitively and aliased so that
 * `success` -> `professional`, `kids` -> `playground`, etc.
 */

export type HubLevel = 'playground' | 'academy' | 'professional';

const HUB_ROUTES: Record<HubLevel, string> = {
  playground: '/dashboard/playground',
  academy: '/dashboard/academy',
  professional: '/dashboard/hub',
};

/** Normalize any hub-ish string to a canonical HubLevel. Returns null if unmappable. */
export function normalizeHub(raw?: string | null): HubLevel | null {
  if (!raw) return null;
  const v = String(raw).trim().toLowerCase();
  switch (v) {
    case 'playground':
    case 'kids':
    case 'kid':
    case 'play':
      return 'playground';
    case 'academy':
    case 'teen':
    case 'teens':
      return 'academy';
    case 'professional':
    case 'success':
    case 'adult':
    case 'hub':
      return 'professional';
    default:
      return null;
  }
}

export interface ResolveHubArgs {
  metadata?: Record<string, any> | null;
  dbStudentLevel?: string | null;
}

export interface ResolvedHub {
  level: HubLevel;
  source: 'metadata' | 'db' | 'fallback';
}

/** Resolve the active hub level with the documented priority order. */
export function resolveHub({ metadata, dbStudentLevel }: ResolveHubArgs): ResolvedHub {
  const fromMetaHubType = normalizeHub(metadata?.hub_type);
  if (fromMetaHubType) return { level: fromMetaHubType, source: 'metadata' };

  const fromMetaPreferred = normalizeHub(metadata?.preferred_hub);
  if (fromMetaPreferred) return { level: fromMetaPreferred, source: 'metadata' };

  const fromDb = normalizeHub(dbStudentLevel);
  if (fromDb) return { level: fromDb, source: 'db' };

  return { level: 'playground', source: 'fallback' };
}

/** Map a hub level to its dashboard route. */
export function getHubRoute(level: HubLevel): string {
  return HUB_ROUTES[level] ?? HUB_ROUTES.playground;
}

/** One-shot helper: resolve + route. */
export function resolveHubRoute(args: ResolveHubArgs): { level: HubLevel; route: string; source: ResolvedHub['source'] } {
  const { level, source } = resolveHub(args);
  return { level, route: getHubRoute(level), source };
}

/**
 * Age-based hub routing — mirrors the Novakid age bands exactly.
 *   4–10  → Playground   (Levels 0–2)
 *   11+   → Academy      (Levels 3–4 + Speaking)
 *
 * Speaking courses (9+) are intentionally placed in Academy as an add-on
 * surfaced after the student finishes Playground Level 2.
 */
export function resolveHubByAge(age: number | null | undefined): HubLevel {
  if (age == null || Number.isNaN(age)) return 'playground';
  if (age <= 10) return 'playground';
  return 'academy';
}

