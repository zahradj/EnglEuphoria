import type { SkillTreeNode } from '../types';

export interface MasteryItem {
  itemKey: string;
  itemType: 'vocabulary' | 'grammar' | 'pronunciation' | 'fluency' | 'reading';
  masteryPct: number;
  exposures: number;
}

/**
 * Project raw mastery items (from src/adaptive/mastery/) into
 * UI-ready skill tree nodes. Mastery rule (≥85% over ≥3 exposures with
 * ≥1 communicative use) is owned by the adaptive layer — we only display.
 */
export function projectMasteryToNodes(items: MasteryItem[]): SkillTreeNode[] {
  return items.map((m) => ({
    id: `${m.itemType}:${m.itemKey}`,
    label: m.itemKey,
    domain: m.itemType,
    masteryPct: Math.max(0, Math.min(100, m.masteryPct)),
    exposures: m.exposures,
    status:
      m.masteryPct >= 85 && m.exposures >= 3
        ? 'mastered'
        : m.exposures > 0
          ? 'in_progress'
          : 'locked',
  }));
}
