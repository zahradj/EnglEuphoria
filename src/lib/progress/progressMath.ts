/**
 * Small, pure helpers behind the student's "My Progress" page. No data access here.
 *
 * Design rules (from the progress-monitoring research): a student is only ever compared with their own
 * past, mastery is shown as a level (not just a number), and the weekly goal counts finished lessons.
 */

export type MasteryLevel = 'not_started' | 'learning' | 'familiar' | 'proficient' | 'mastered';

/** Khan-style levels. `hasItems` is false when the student has not met any item of that skill yet. */
export function masteryLevel(pct: number, hasItems: boolean): MasteryLevel {
  if (!hasItems) return 'not_started';
  const p = Number.isFinite(pct) ? pct : 0;
  if (p >= 85) return 'mastered';
  if (p >= 70) return 'proficient';
  if (p >= 40) return 'familiar';
  return 'learning';
}

/** 0–5 stars for the picture-based view (Playground). A skill that has been met earns at least one star. */
export function skillStars(pct: number, hasItems: boolean): number {
  if (!hasItems) return 0;
  const p = Math.max(0, Math.min(100, Number.isFinite(pct) ? pct : 0));
  return Math.max(1, Math.min(5, Math.ceil(p / 20)));
}

export const DEFAULT_WEEKLY_LESSONS = 2;

/**
 * The weekly goal is free text the student chose ("Complete 3 lessons 🎯"). If it names a number of
 * lessons/classes we use it; otherwise we fall back to a gentle default so the ring still means something.
 */
export function weeklyLessonTarget(goalText: string | null | undefined): number {
  const m = (goalText ?? '').match(/(\d{1,2})\s*(?:lessons?|classes|class|sessions?)/i);
  const n = m ? parseInt(m[1], 10) : NaN;
  if (!Number.isFinite(n) || n < 1) return DEFAULT_WEEKLY_LESSONS;
  return Math.min(n, 14);
}

/** Monday 00:00 (local time) of the week containing `now`. */
export function startOfWeek(now: Date): Date {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sinceMonday = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - sinceMonday);
  return d;
}

/** Ring fill, 0–100, never above 100. */
export function ringPercent(done: number, target: number): number {
  if (target <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((done / target) * 100)));
}

export interface SkillPoint { domain: string; pct: number; hasItems: boolean }

export const SKILL_ORDER = ['vocabulary', 'grammar', 'pronunciation', 'fluency', 'reading'] as const;

/** Always returns the five skills in a fixed order, so the radar keeps its shape. */
export function normalizeSkills(roots: Array<{ domain: string; masteryPct: number; children?: unknown[] }> | undefined | null): SkillPoint[] {
  const byDomain = new Map((roots ?? []).map((r) => [r.domain, r]));
  return SKILL_ORDER.map((domain) => {
    const r = byDomain.get(domain);
    const hasItems = !!r && ((r.children?.length ?? 0) > 0 || r.masteryPct > 0);
    return { domain, pct: r ? Math.max(0, Math.min(100, Math.round(r.masteryPct))) : 0, hasItems };
  });
}

/** The skill to suggest next: the weakest one the student has actually met; nothing if none yet. */
export function focusSkill(skills: SkillPoint[]): SkillPoint | null {
  const met = skills.filter((s) => s.hasItems);
  if (met.length === 0) return null;
  return [...met].sort((a, b) => a.pct - b.pct)[0];
}

/** Which dashboard tab lets the student practise a skill. */
export const SKILL_TAB: Record<string, string> = {
  vocabulary: 'vocabulary',
  grammar: 'grammar',
  pronunciation: 'speaking',
  fluency: 'speaking',
  reading: 'learning-path',
};
