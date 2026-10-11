// Academy roadmap v2 (A1 -> C1). Brand-new, Academy-only; does not read or change the Playground curriculum files.
// Approved sizing (owner, 2026-10-08): A1 10, A2 12, B1 16, B2 16, C1 16 Seasons = 70 Seasons = 560 sessions of 60 minutes.
import type { RawSeason, RawStructure } from './authoring';
import { A1_SEASONS } from './levels/a1';
import { A2_SEASONS } from './levels/a2';
import { B1_SEASONS } from './levels/b1';
import { B2_SEASONS } from './levels/b2';
import { C1_SEASONS } from './levels/c1';
import { SKIN_LIBRARY } from './skins';
import { buildAllLessonBlueprints } from './lessonBlueprint';
import { ACADEMY_ITEMS } from './items';
import { castIn } from './cast';
import { validateItems } from './validateItems';
import { STRUCTURES, STRUCTURE_FLOOR } from './structureLevels';
import { CUMULATIVE_ITEM_TARGET, LEVEL_ORDER, summarize, validateRoadmap } from './validateRoadmap';
import type { AcademyLevel, LevelPlan, SeasonOutline, StructureRef } from './types';

const RAW: Record<AcademyLevel, RawSeason[]> = { A1: A1_SEASONS, A2: A2_SEASONS, B1: B1_SEASONS, B2: B2_SEASONS, C1: C1_SEASONS };
const HOURS: Partial<Record<AcademyLevel, string>> = {
  A1: '~90-100 (not confirmed)',
  A2: '180-200',
  B1: '350-400',
  B2: '500-600',
  C1: '700-800',
};

function expandStructure(entry: string | RawStructure, index: number): StructureRef {
  const raw: RawStructure = typeof entry === 'string' ? { id: entry } : entry;
  const info = STRUCTURES[raw.id];
  return {
    id: raw.id,
    label: info?.label ?? raw.id,
    use: raw.use,
    introducedIn: index === 0 ? 'pattern-lab' : 'side-quest',
    confidence: info?.confidence ?? 'unverified',
  };
}

function build(): LevelPlan[] {
  const flatIds: string[] = [];
  LEVEL_ORDER.forEach((lvl) => RAW[lvl].forEach((_, i) => flatIds.push(`${lvl}-S${String(i + 1).padStart(2, '0')}`)));

  let g = 0;
  return LEVEL_ORDER.map((lvl) => {
    const seasons: SeasonOutline[] = RAW[lvl].map((r, i) => {
      const id = flatIds[g];
      const recycleFrom = [flatIds[g - 1], flatIds[g - 2]].filter(Boolean) as string[];
      g += 1;
      return {
        id,
        level: lvl,
        no: i + 1,
        title: r.title,
        theme: r.theme,
        hook: r.hook,
        cast: castIn(r.hook),
        release: r.release,
        canDo: r.canDo,
        functions: r.functions,
        structures: r.structures.map(expandStructure),
        lexicalFields: r.lexicalFields,
        newItemBudget: r.items,
        pronunciation: r.pron,
        mediation: r.mediation,
        recycleFrom,
        skins: r.skins.map((s) => ({ id: s, swaps: `nouns, scenarios and pictures from ${SKIN_LIBRARY[s] ?? s}; language spine unchanged` })),
        bigRemix: (i + 1) % 2 === 0,
        levelCheck: i === RAW[lvl].length - 1,
        notes: r.notes,
      };
    });
    return { level: lvl, seasons, cumulativeItemTarget: CUMULATIVE_ITEM_TARGET[lvl], cambridgeCumulativeHours: HOURS[lvl] };
  });
}

export const ACADEMY_ROADMAP: LevelPlan[] = build();
export const ACADEMY_SEASONS: SeasonOutline[] = ACADEMY_ROADMAP.flatMap((p) => p.seasons);
/** One blueprint per Live Session, in roadmap order (560). Academy-owned; independent of the Playground and Success blueprints. */
export const ACADEMY_LESSON_BLUEPRINTS = buildAllLessonBlueprints(ACADEMY_ROADMAP);
export const ACADEMY_ROADMAP_ISSUES = validateRoadmap(ACADEMY_ROADMAP, STRUCTURE_FLOOR);
export const ACADEMY_ROADMAP_SUMMARY = summarize(ACADEMY_ROADMAP);
export { ACADEMY_ITEMS };
/** The items a lesson introduces, joined to its blueprint (E1-E6 only; E7/E8 introduce nothing). */
export function lessonItems(lessonId: string) {
  const bp = ACADEMY_LESSON_BLUEPRINTS.find((b) => b.id === lessonId);
  if (!bp || bp.episode.no > 6) return [];
  return ACADEMY_ITEMS[bp.seasonId]?.[`E${bp.episode.no}` as 'E1'] ?? [];
}
export const ACADEMY_ITEM_ISSUES = validateItems(ACADEMY_SEASONS, ACADEMY_ITEMS);

export function getSeason(id: string): SeasonOutline | undefined {
  return ACADEMY_SEASONS.find((s) => s.id === id);
}

export * from './types';
export * from './lessonBlueprint';
export * from './itemTypes';
export * from './cast';
export { validateItems, expectedCounts, coverageByLevel, normalizeItem } from './validateItems';
export { STRUCTURES, STRUCTURE_FLOOR } from './structureLevels';
export { validateRoadmap, summarize, ITEM_BUDGET_BAND, CUMULATIVE_ITEM_TARGET, MAX_ITEMS_PER_SEASON } from './validateRoadmap';
