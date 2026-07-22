/**
 * Single source of truth for mapping between studio "hub" labels
 * (playground/academy/success) and the canonical `target_system`
 * enum stored in `curriculum_lessons` (kids/teen/adult), plus the
 * CEFR ↔ difficulty_level enum mapping.
 */

export type StudioHub = 'playground' | 'academy' | 'success';
export type TargetSystem = 'kids' | 'teen' | 'adult';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export function hubToTargetSystem(hub: string | null | undefined): TargetSystem {
  const h = (hub || '').toLowerCase();
  if (h === 'playground' || h === 'kids') return 'kids';
  if (h === 'academy' || h === 'teen' || h === 'teens') return 'teen';
  return 'adult';
}

export function targetSystemToHub(ts: string | null | undefined): StudioHub {
  const t = (ts || '').toLowerCase();
  if (t === 'kids') return 'playground';
  if (t === 'teen') return 'academy';
  return 'success';
}

/** Normalise any incoming label into a canonical CEFR string ("Pre-A1" | "A1"..."C2") or null. */
export function normalizeCefr(value?: string | null): string | null {
  const raw = String(value ?? '').trim();
  if (!raw) return null;
  const compact = raw.toLowerCase().replace(/[\s_]+/g, '').replace(/-/g, '');
  // pre-a1 variants
  if (compact === 'prea1' || compact === 'prea' || compact === 'preliteracy' || compact === 'preliterate') {
    return 'Pre-A1';
  }
  const upper = raw.toUpperCase();
  if (['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(upper)) return upper;
  return null;
}

export function cefrToDifficulty(cefr?: string | null): DifficultyLevel {
  const canonical = normalizeCefr(cefr);
  if (canonical === 'Pre-A1' || canonical === 'A1' || canonical === 'A2') return 'beginner';
  if (canonical === 'B1' || canonical === 'B2') return 'intermediate';
  if (canonical === 'C1' || canonical === 'C2') return 'advanced';
  const lower = String(cefr ?? '').trim().toLowerCase();
  if (lower === 'beginner' || lower === 'intermediate' || lower === 'advanced') {
    return lower as DifficultyLevel;
  }
  return 'beginner';
}

export function isCefr(value?: string | null): boolean {
  return normalizeCefr(value) !== null;
}

