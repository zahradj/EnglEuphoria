/**
 * Cycle 3 — Grit reward helper.
 *
 * Converts a machine skill_tag like `grammar_present_simple` or
 * `vocab_food_market` into a clean human-readable label
 * ("Present Simple", "Food Market") for the Mastery Unlocked notification.
 */
const PREFIXES = ['grammar', 'vocab', 'phonics', 'speaking', 'reading', 'listening', 'writing'];

export function formatSkillTag(tag?: string | null): string {
  if (!tag) return 'a tough skill';
  const lower = tag.trim().toLowerCase();
  const stripped = PREFIXES.reduce(
    (acc, p) => (acc.startsWith(`${p}_`) ? acc.slice(p.length + 1) : acc),
    lower,
  );
  return stripped
    .split(/[_\-\s]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
