// Academy item bank — validator. Pure; imports only from inside src/curriculum/academy/.
// `oxford` is an optional private reference map (headword -> CEFR level) built locally from the public Oxford 3000/5000 lists.
// It is NOT stored in the repo; when absent, only the structural checks run.
import { EPISODES, allocateItems } from './lessonBlueprint';
import { EPISODE_ORDER, type AcademyLevel, type SeasonOutline } from './types';
import { INTRODUCING_EPISODE_KEYS, type IntroducingEpisodeKey, type ItemSeed, type SeasonItems } from './itemTypes';

export interface ItemIssue {
  severity: 'error' | 'warn';
  seasonId?: string;
  code: string;
  message: string;
}

const RANK: Record<AcademyLevel, number> = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5 };
const EPISODE_BY_KEY: Record<IntroducingEpisodeKey, number> = { E1: 0, E2: 1, E3: 2, E4: 3, E5: 4, E6: 5 };
/** episodes whose items are receptive / productive by design */
const RECEPTIVE: IntroducingEpisodeKey[] = ['E1', 'E5'];
const PRODUCTIVE: IntroducingEpisodeKey[] = ['E2', 'E6'];

export const normalizeItem = (t: string) => t.toLowerCase().replace(/[’']/g, "'").replace(/[^a-z0-9' -]/g, '').replace(/\s+/g, ' ').trim();

/** expected number of new items per episode key for a Season */
export function expectedCounts(season: SeasonOutline): Record<IntroducingEpisodeKey, number> {
  const alloc = allocateItems(
    season.newItemBudget,
    EPISODE_ORDER.map((t) => EPISODES[t].weight),
  );
  return Object.fromEntries(INTRODUCING_EPISODE_KEYS.map((k) => [k, alloc[EPISODE_BY_KEY[k]]])) as Record<IntroducingEpisodeKey, number>;
}

export function validateItems(seasons: SeasonOutline[], bank: Record<string, SeasonItems>, oxford?: Record<string, AcademyLevel>): ItemIssue[] {
  const issues: ItemIssue[] = [];
  const err = (code: string, message: string, seasonId?: string) => issues.push({ severity: 'error', seasonId, code, message });
  const warn = (code: string, message: string, seasonId?: string) => issues.push({ severity: 'warn', seasonId, code, message });
  const seen = new Map<string, string>();

  for (const s of seasons) {
    const si = bank[s.id];
    if (!si) {
      err('items_missing', 'No item list for this Season.', s.id);
      continue;
    }
    const want = expectedCounts(s);
    let words = 0;
    let notInOxford = 0;
    let tooEasy = 0;
    let total = 0;

    for (const key of INTRODUCING_EPISODE_KEYS) {
      const list: ItemSeed[] = si[key] ?? [];
      if (list.length !== want[key]) err('items_count', `${key}: ${list.length} items, expected ${want[key]}.`, s.id);
      let chunkCount = 0;
      for (const [text, level, mode, kind] of list) {
        total += 1;
        const norm = normalizeItem(text);
        if (!norm) err('item_empty', `${key}: empty item.`, s.id);
        if (!(level in RANK)) err('item_level', `${key}: "${text}" has invalid level ${level}.`, s.id);
        else if (RANK[level] > RANK[s.level]) err('item_above_level', `${key}: "${text}" is ${level}, above this ${s.level} Season.`, s.id);
        if (kind === 'w' && /\s/.test(text.trim())) err('item_kind', `${key}: "${text}" is marked a word but has spaces.`, s.id);
        if (kind === 'c' && !/\s/.test(text.trim()) && !text.includes("'")) err('item_kind', `${key}: "${text}" is marked a chunk but is a single word.`, s.id);
        if (kind === 'c') chunkCount += 1;
        if (kind === 'w') words += 1;
        if (RECEPTIVE.includes(key) && mode !== 'r') err('item_mode', `${key}: "${text}" must be receptive in this episode.`, s.id);
        if (PRODUCTIVE.includes(key) && mode !== 'p') err('item_mode', `${key}: "${text}" must be productive in this episode.`, s.id);
        const prev = seen.get(norm);
        if (prev) err('item_duplicate', `"${text}" already introduced in ${prev}.`, s.id);
        else seen.set(norm, `${s.id} ${key}`);

        if (oxford && kind === 'w') {
          const ox = oxford[norm];
          if (!ox) notInOxford += 1;
          else {
            if (RANK[ox] > RANK[s.level]) err('item_above_level_oxford', `${key}: "${text}" is ${ox} in the Oxford lists, above this ${s.level} Season.`, s.id);
            if (ox !== level) err('item_level_mismatch', `${key}: "${text}" declared ${level} but the Oxford lists say ${ox}.`, s.id);
            if (RANK[ox] < RANK[s.level] - 1) tooEasy += 1;
          }
        }
      }
      if ((key === 'E3' || key === 'E4') && list.length > 0 && chunkCount / list.length < 0.7) {
        err('item_chunk_share', `${key}: at least 70 % of items must be chunks (has ${chunkCount}/${list.length}).`, s.id);
      }
    }
    if (oxford) {
      if (words && notInOxford / words > 0.15) err('items_not_in_oxford', `${notInOxford}/${words} single words are not in the Oxford lists (max 15 %): check level or spelling.`, s.id);
      if (words && tooEasy / words > 0.2) warn('items_too_easy', `${tooEasy}/${words} single words are two or more levels below this Season.`, s.id);
    }
    if (total > 0 && (total - words) / total > 0.45) warn('items_chunk_heavy', 'More than 45 % chunks: check balance with single words.', s.id);
  }
  return issues;
}

/** For reporting: how much of a reference list each level's Seasons cover (info only). */
export function coverageByLevel(seasons: SeasonOutline[], bank: Record<string, SeasonItems>, oxford: Record<string, AcademyLevel>) {
  const taught = new Set<string>();
  for (const s of seasons) {
    const si = bank[s.id];
    if (!si) continue;
    for (const k of INTRODUCING_EPISODE_KEYS) for (const [t, , , kind] of si[k] ?? []) if (kind === 'w') taught.add(normalizeItem(t));
  }
  const byLevel: Record<string, { total: number; taught: number }> = {};
  for (const [w, l] of Object.entries(oxford)) {
    byLevel[l] ??= { total: 0, taught: 0 };
    byLevel[l].total += 1;
    if (taught.has(w)) byLevel[l].taught += 1;
  }
  return byLevel;
}
