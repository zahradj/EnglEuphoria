/**
 * Shared utilities to hydrate Hub Creators (Playground / Academy / Success)
 * from a curriculum_lessons row pulled by useCreatorLesson.
 */

export type CreatorHub = 'playground' | 'academy' | 'success';

const HUB_PATH: Record<CreatorHub, string> = {
  playground: '/playground-creator',
  academy: '/academy-creator',
  success: '/success-creator',
};

/** Map a lesson row's stored hub to one of the three creator hubs. */
export function detectLessonHub(lesson: any): CreatorHub | null {
  const raw =
    lesson?.content?.hub ??
    lesson?.ai_metadata?.hub ??
    lesson?.target_system ??
    null;
  if (!raw) return null;
  const v = String(raw).toLowerCase();
  if (v === 'playground' || v === 'kids') return 'playground';
  if (v === 'academy' || v === 'teens') return 'academy';
  if (v === 'success' || v === 'professional' || v === 'hub') return 'success';
  return null;
}

/** Get the route path for a given creator hub. */
export function creatorPathFor(hub: CreatorHub): string {
  return HUB_PATH[hub];
}

/**
 * Derive a CEFR level (A1, A2, B1, B2, C1, C2) from a lesson's metadata.
 * Falls back to a per-hub default when nothing is stored.
 */
export function deriveCefrLevel(lesson: any, hub: CreatorHub): string {
  const meta = (lesson?.ai_metadata ?? {}) as any;
  const stored = (meta.cefr_level ?? '').toString().toUpperCase();
  if (/^(A1|A2|B1|B2|C1|C2)$/.test(stored)) return stored;

  const diff = (lesson?.difficulty_level ?? '').toString().toLowerCase();
  if (/^(a1|a2|b1|b2|c1|c2)$/.test(diff)) return diff.toUpperCase();
  if (diff.includes('beginner')) return hub === 'playground' ? 'A1' : 'A2';
  if (diff.includes('intermediate')) return 'B1';
  if (diff.includes('advanced')) return 'C1';

  return hub === 'playground' ? 'A1' : hub === 'academy' ? 'A2' : 'B1';
}
