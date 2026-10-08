// Academy roadmap v2 — validator. Pure functions, no repo imports beyond ./types.
// A roadmap fails if any 'error' is returned. 'warn' items are reported but allowed (e.g. unverified placements).
import { INTRODUCING_SESSIONS, MAX_ITEMS_PER_SESSION, SEASONS_PER_LEVEL, type AcademyLevel, type LevelPlan, type SeasonOutline } from './types';

export interface RoadmapIssue {
  severity: 'error' | 'warn';
  seasonId?: string;
  code: string;
  message: string;
}

export const LEVEL_ORDER: readonly AcademyLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1'] as const;
const rank = (l: AcademyLevel) => LEVEL_ORDER.indexOf(l);

/** New items per Season, per level. Hard cap = 6 introducing sessions (E1-E6) x 14 per session. */
export const ITEM_BUDGET_BAND: Record<AcademyLevel, [number, number]> = {
  A1: [70, 84],
  A2: [60, 75],
  B1: [65, 84],
  B2: [70, 84],
  C1: [80, 84],
};
export const MAX_ITEMS_PER_SEASON = INTRODUCING_SESSIONS * MAX_ITEMS_PER_SESSION;

/**
 * Cumulative taught items (words + chunks) at the end of each level. Tolerance +-8 %.
 * Calibrated 2026-10-08 against the public Oxford 3000/5000 lists by CEFR level (distinct headwords, cumulative):
 * A1 901 · A2 1,700 · B1 2,399 · B2 3,697 (3000 list 2,999 + 5000 list B2 698) · C1 4,979.
 * A1/A2 targets sit just under the Oxford counts (closed-class function words are taught through grammar, not counted);
 * B1+ sit above them because items also count chunks and collocations.
 */
export const CUMULATIVE_ITEM_TARGET: Record<AcademyLevel, number> = { A1: 800, A2: 1650, B1: 2750, B2: 4050, C1: 5400 };

/**
 * Earliest level at which a structure may be introduced for productive use, e.g. 'present-perfect-experience': 'A2'.
 * Supplied by the caller (see structureLevels.ts) so the verification status lives in one place.
 */
export type StructureFloor = Record<string, AcademyLevel>;

export function validateRoadmap(plans: LevelPlan[], structureFloor: StructureFloor = {}): RoadmapIssue[] {
  const issues: RoadmapIssue[] = [];
  const err = (code: string, message: string, s?: SeasonOutline) => issues.push({ severity: 'error', code, message, seasonId: s?.id });
  const warn = (code: string, message: string, s?: SeasonOutline) => issues.push({ severity: 'warn', code, message, seasonId: s?.id });

  const all: SeasonOutline[] = plans.flatMap((p) => p.seasons);
  const byId = new Map(all.map((s) => [s.id, s]));
  const order = new Map(all.map((s, i) => [s.id, i]));

  // Sizing per level.
  for (const lvl of LEVEL_ORDER) {
    const plan = plans.find((p) => p.level === lvl);
    if (!plan) {
      err('level_missing', `Level ${lvl} is missing.`);
      continue;
    }
    if (plan.seasons.length !== SEASONS_PER_LEVEL[lvl]) {
      err('season_count', `${lvl} has ${plan.seasons.length} Seasons; approved sizing is ${SEASONS_PER_LEVEL[lvl]}.`);
    }
  }

  // Uniqueness across the whole roadmap.
  const seen = { id: new Set<string>(), title: new Set<string>(), theme: new Set<string>() };
  const structureUseSeen = new Set<string>();

  plans.forEach((plan) => {
    plan.seasons.forEach((s, idx) => {
      const where = s;
      const expectedId = `${plan.level}-S${String(idx + 1).padStart(2, '0')}`;
      if (s.id !== expectedId) err('id_format', `Expected id ${expectedId}, got ${s.id}.`, where);
      if (s.level !== plan.level) err('level_mismatch', `Season level ${s.level} inside ${plan.level} plan.`, where);
      if (s.no !== idx + 1) err('no_sequence', `Season no ${s.no}, expected ${idx + 1}.`, where);
      if (seen.id.has(s.id)) err('dup_id', 'Duplicate Season id.', where);
      seen.id.add(s.id);
      const t = s.title.trim().toLowerCase();
      if (seen.title.has(t)) err('dup_title', `Duplicate title "${s.title}".`, where);
      seen.title.add(t);
      const th = s.theme.trim().toLowerCase();
      if (seen.theme.has(th)) err('dup_theme', `Theme "${s.theme}" repeats another Season.`, where);
      seen.theme.add(th);

      // Content completeness.
      if (!s.hook.trim()) err('no_hook', 'Story hook missing.', where);
      if (!s.release.trim()) err('no_release', 'Release missing.', where);
      if (s.canDo.length < 1 || s.canDo.length > 4) err('can_do_count', `canDo must have 1-4 entries (has ${s.canDo.length}).`, where);
      if (s.functions.length < 1) err('no_functions', 'At least one communicative function required.', where);
      if (s.lexicalFields.length < 2) err('lexical_fields', 'At least two lexical fields required.', where);
      if (s.skins.length < 3 || s.skins.length > 6) err('skin_count', `Skins must be 3-6 (has ${s.skins.length}).`, where);
      if (s.pronunciation.length < 1 || s.pronunciation.length > 2) err('pron_count', 'Pronunciation focus must have 1-2 entries.', where);
      if (!/^I can /i.test(s.canDo[0] ?? '')) warn('can_do_wording', 'canDo entries should start with "I can".', where);
      s.canDo.forEach((c) => {
        if (!/^I can /i.test(c)) warn('can_do_wording', `canDo "${c.slice(0, 40)}" should start with "I can".`, where);
      });

      // Language budget.
      const [lo, hi] = ITEM_BUDGET_BAND[plan.level];
      if (s.newItemBudget < lo || s.newItemBudget > hi) err('item_budget', `newItemBudget ${s.newItemBudget} outside ${plan.level} band ${lo}-${hi}.`, where);
      if (s.newItemBudget > MAX_ITEMS_PER_SEASON) err('item_cap', `newItemBudget ${s.newItemBudget} exceeds ${MAX_ITEMS_PER_SEASON} (6 sessions x 14).`, where);

      // Grammar: 1-2 structures, only E3/E6, at least one in E3.
      if (s.structures.length < 1 || s.structures.length > 2) err('structure_count', `Structures must be 1-2 (has ${s.structures.length}).`, where);
      if (!s.structures.some((x) => x.introducedIn === 'pattern-lab')) err('structure_e3', 'At least one structure must be introduced in the Pattern Lab (E3).', where);
      s.structures.forEach((x) => {
        const key = `${x.id}::${x.use ?? ''}`;
        if (structureUseSeen.has(key)) err('structure_repeat', `Structure "${x.id}" (${x.use ?? 'main use'}) is introduced twice; recycle it instead.`, where);
        structureUseSeen.add(key);
        const floor = structureFloor[x.id];
        if (floor && rank(plan.level) < rank(floor)) err('structure_too_early', `"${x.id}" is not for productive use before ${floor} (placed in ${plan.level}).`, where);
        if (!floor) warn('structure_unmapped', `"${x.id}" has no level floor in structureLevels.ts.`, where);
        if (x.confidence === 'unverified') warn('structure_unverified', `Placement of "${x.id}" is unverified [U].`, where);
      });

      // Mediation from B1.
      if (rank(plan.level) >= rank('B1') && !s.mediation) err('mediation', 'B1+ Seasons need a mediation task.', where);

      // Rhythm: Big Remix every 2nd Season; level check on the last one.
      const expectBig = (idx + 1) % 2 === 0;
      if (s.bigRemix !== expectBig) err('big_remix', `bigRemix should be ${expectBig} for Season ${idx + 1}.`, where);
      const expectCheck = idx === plan.seasons.length - 1;
      if (s.levelCheck !== expectCheck) err('level_check', `levelCheck should be ${expectCheck} for Season ${idx + 1}.`, where);

      // Recycling: <= 2 earlier Seasons; the first Season of the roadmap has none; all others have at least one.
      if (s.recycleFrom.length > 2) err('recycle_count', 'recycleFrom may list at most 2 Seasons.', where);
      if (order.get(s.id) === 0 && s.recycleFrom.length) err('recycle_first', 'The first Season cannot recycle.', where);
      if ((order.get(s.id) ?? 0) > 0 && s.recycleFrom.length === 0) err('recycle_missing', 'Every Season after the first must recycle from the previous one or two.', where);
      s.recycleFrom.forEach((rid) => {
        const r = byId.get(rid);
        if (!r) err('recycle_unknown', `recycleFrom "${rid}" does not exist.`, where);
        else if ((order.get(rid) ?? 0) >= (order.get(s.id) ?? 0)) err('recycle_forward', `recycleFrom "${rid}" is not earlier.`, where);
      });
      // Recycle must be the immediately preceding Seasons.
      const i = order.get(s.id) ?? 0;
      const expected = [all[i - 1]?.id, all[i - 2]?.id].filter(Boolean) as string[];
      const wantLen = Math.min(2, i);
      if (i > 0 && (s.recycleFrom.length !== wantLen || !expected.slice(0, wantLen).every((e) => s.recycleFrom.includes(e)))) {
        warn('recycle_not_previous', `recycleFrom should be the previous ${wantLen} Season(s): ${expected.slice(0, wantLen).join(', ')}.`, where);
      }
    });
  });

  // Cumulative items by level (+-8 %).
  let cum = 0;
  for (const lvl of LEVEL_ORDER) {
    const plan = plans.find((p) => p.level === lvl);
    if (!plan) continue;
    cum += plan.seasons.reduce((n, s) => n + s.newItemBudget, 0);
    const target = CUMULATIVE_ITEM_TARGET[lvl];
    if (Math.abs(cum - target) / target > 0.08) err('cumulative', `${lvl}: cumulative planned items ${cum} vs target ${target} (+-8 %).`);
    if (plan.cumulativeItemTarget !== target) warn('plan_target', `${lvl} plan.cumulativeItemTarget ${plan.cumulativeItemTarget} differs from ${target}.`);
  }

  // Consecutive Seasons must differ in release type and setting (approximate: release and theme text must not match).
  for (let i = 1; i < all.length; i++) {
    if (all[i].release.trim().toLowerCase() === all[i - 1].release.trim().toLowerCase()) {
      err('release_repeat', 'Same Release as the previous Season.', all[i]);
    }
  }

  return issues;
}

export function summarize(plans: LevelPlan[]) {
  const sessions = plans.reduce((n, p) => n + p.seasons.length * 8, 0);
  const seasons = plans.reduce((n, p) => n + p.seasons.length, 0);
  const items = plans.reduce((n, p) => n + p.seasons.reduce((m, s) => m + s.newItemBudget, 0), 0);
  return { seasons, sessions, items };
}
