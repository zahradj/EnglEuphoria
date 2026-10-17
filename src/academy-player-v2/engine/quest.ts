// The Quest Layer selectors (pure, no React): the lesson seen as a quest. Objectives = the success criteria, stages = the 8 parts,
// level / rank from XP, loot and streak DERIVED from the engine state (nothing is stored twice), and the Quest Complete recap.
import type { LessonScript, SceneBase } from '../types';
import { PART_COUNT } from '../types';
import type { EngineState } from './lessonReducer';

/** Scene kinds that score the student (they can pay a gem). Mirrors the reducer's "scored" idea: a game, not a story page. */
export const SCORED_KINDS = new Set(['sort', 'memory', 'match', 'build', 'forge', 'boss', 'rapport', 'choice', 'write', 'hunt']);
/** Scene kinds that are encounters (get a short stinger): the game is framed as a boss, a forge, a dialogue, a puzzle or a search. */
export const ENCOUNTER_KINDS = ['boss', 'forge', 'rapport', 'sort', 'hunt'] as const;
export type EncounterKind = (typeof ENCOUNTER_KINDS)[number];
export const isEncounter = (kind: string): kind is EncounterKind => (ENCOUNTER_KINDS as readonly string[]).includes(kind);

// ---------- levels and ranks ----------
export const RANKS = ['rookie', 'explorer', 'detective', 'expert', 'legend'] as const;
export type Rank = (typeof RANKS)[number];
/** cumulative XP at which each level starts (level 1 = 0). A full clean lesson is about 480 XP, so a lesson shows 3-4 level-ups. */
export const LEVEL_XP = [0, 70, 170, 300, 440] as const;

export interface LevelInfo {
  /** 1-5 */
  level: number;
  rank: Rank;
  /** XP inside this level and the size of this level (0 for the last) */
  into: number;
  span: number;
  /** 0-1 progress to the next level (1 at the top) */
  fill: number;
  /** XP still needed for the next level (0 at the top) */
  toNext: number;
  max: boolean;
}

export function levelOf(xp: number): LevelInfo {
  const x = Math.max(0, xp);
  let level = 1;
  for (let i = 1; i < LEVEL_XP.length; i++) if (x >= LEVEL_XP[i]) level = i + 1;
  const max = level === LEVEL_XP.length;
  const start = LEVEL_XP[level - 1];
  const span = max ? 0 : LEVEL_XP[level] - start;
  const into = x - start;
  return { level, rank: RANKS[level - 1], into, span, fill: max ? 1 : Math.min(1, into / span), toNext: max ? 0 : LEVEL_XP[level] - x, max };
}

// ---------- scenes helpers ----------
type Loose = SceneBase & Record<string, unknown>;
const loose = (s: SceneBase) => s as Loose;
const doneSet = (ids: string[]) => new Set(ids);

// ---------- objectives (the success criteria) ----------
export interface Objective {
  /** 1-based index into script.criteria */
  n: number;
  text: string;
  /** scenes that train it, and how many are done */
  total: number;
  done: number;
  /** ticks live: every scene that trains it is done */
  complete: boolean;
}

export function objectivesOf(script: LessonScript, doneIds: string[]): Objective[] {
  const done = doneSet(doneIds);
  return script.criteria.map((text, i) => {
    const mine = script.scenes.filter((s) => s.trains?.includes(i + 1));
    const d = mine.filter((s) => done.has(s.id)).length;
    return { n: i + 1, text, total: mine.length, done: d, complete: mine.length > 0 && d === mine.length };
  });
}

/** The objective to show in the tracker: the first unfinished one this scene trains, else the first unfinished one, else the last. */
export function currentObjective(script: LessonScript, objectives: Objective[], sceneId: string | undefined): Objective | undefined {
  const sc = script.scenes.find((s) => s.id === sceneId);
  const open = objectives.filter((o) => !o.complete);
  return open.find((o) => sc?.trains?.includes(o.n)) ?? open[0] ?? objectives[objectives.length - 1];
}

// ---------- loot ----------
export type LootKind = 'gem' | 'wordcard' | 'trophy' | 'clue';
export interface LootItem {
  id: string;
  kind: LootKind;
  label: string;
  /** sticker picture under public/academy-art, as 'cards/<id>' */
  art?: string;
  sceneId: string;
  part: number;
}

interface HuntTargetLike { id: string; label: string; word?: string; art?: string }
const huntTargets = (s: SceneBase): HuntTargetLike[] => (Array.isArray(loose(s).targets) ? (loose(s).targets as HuntTargetLike[]) : []);
const teachPages = (s: SceneBase): { word: string; art: string }[] => (Array.isArray(loose(s).pages) ? (loose(s).pages as { word: string; art: string }[]) : []);

/** Everything a scene can drop, in order (ids are stable). `earned` decides which of them the student holds. */
function dropsOf(s: SceneBase): LootItem[] {
  const out: LootItem[] = [];
  const base = { sceneId: s.id, part: s.part };
  if (SCORED_KINDS.has(s.kind)) out.push({ id: `gem:${s.id}`, kind: 'gem', label: String(loose(s).title ?? s.id), ...base });
  if (s.kind === 'teach') teachPages(s).forEach((p, i) => out.push({ id: `card:${s.id}:${i}`, kind: 'wordcard', label: p.word, art: `cards/${p.art}`, ...base }));
  if (s.kind === 'forge' || s.kind === 'boss') out.push({ id: `trophy:${s.id}`, kind: 'trophy', label: String(loose(s).title ?? s.id), ...base });
  if (s.kind === 'hunt') huntTargets(s).forEach((t) => out.push({ id: `find:${s.id}:${t.id}`, kind: t.art ? 'wordcard' : 'clue', label: t.word ?? t.label, art: t.art ? `cards/${t.art}` : undefined, ...base }));
  return out;
}

/** every slot of the bag for this lesson (the empty ones are silhouettes) */
export const potentialLoot = (script: LessonScript): LootItem[] => script.scenes.flatMap(dropsOf);

/** what the student holds now, derived from the state: gems of clean wins, Word Cards of finished teach scenes, trophies of won forge/boss scenes, hunt finds (live) */
export function lootOf(script: LessonScript, s: Pick<EngineState, 'doneIds' | 'results' | 'found'>): LootItem[] {
  const done = doneSet(s.doneIds);
  const found = s.found ?? {};
  const out: LootItem[] = [];
  for (const sc of script.scenes) {
    for (const d of dropsOf(sc)) {
      const r = s.results[sc.id];
      const have =
        d.kind === 'gem' ? !!r?.gem
        : d.kind === 'wordcard' && d.id.startsWith('card:') ? done.has(sc.id)
        : d.kind === 'trophy' ? done.has(sc.id) && r?.won !== false
        : (found[sc.id] ?? []).includes(d.id.split(':').slice(2).join(':'));
      if (have) out.push(d);
    }
  }
  return out;
}

// ---------- streak ----------
/** The streak across scenes: consecutive scored scenes won on the first try (a retry or a "not yet" resets it). Display only; it never changes XP. */
export function streakOf(script: LessonScript, s: Pick<EngineState, 'doneIds' | 'results'>): { streak: number; best: number } {
  const done = doneSet(s.doneIds);
  let streak = 0; let best = 0;
  for (const sc of script.scenes) {
    if (!SCORED_KINDS.has(sc.kind) || !done.has(sc.id)) continue;
    if (s.results[sc.id]?.gem) { streak++; best = Math.max(best, streak); } else streak = 0;
  }
  return { streak, best };
}
/** streak tiers for the meter: x1 below 3, x2 from 3, x3 from 6 */
export const streakTier = (streak: number): 1 | 2 | 3 => (streak >= 6 ? 3 : streak >= 3 ? 2 : 1);

// ---------- stages (the 8 parts) ----------
export interface StageInfo {
  part: number;
  sceneIds: string[];
  total: number;
  done: number;
  complete: boolean;
  minutes: number;
  /** criteria (1-based) trained inside this stage */
  criteria: number[];
  /** what the stage can drop */
  loot: { gems: number; cards: number; trophies: number; clues: number };
}

export function stagesOf(script: LessonScript, doneIds: string[]): StageInfo[] {
  const done = doneSet(doneIds);
  return Array.from({ length: PART_COUNT }, (_, part) => {
    const mine = script.scenes.filter((s) => s.part === part);
    const drops = mine.flatMap(dropsOf);
    const d = mine.filter((s) => done.has(s.id)).length;
    return {
      part,
      sceneIds: mine.map((s) => s.id),
      total: mine.length,
      done: d,
      complete: mine.length > 0 && d === mine.length,
      minutes: script.partMinutes[part] ?? 0,
      criteria: [...new Set(mine.flatMap((s) => s.trains ?? []))].sort((a, b) => a - b),
      loot: {
        gems: drops.filter((x) => x.kind === 'gem').length,
        cards: drops.filter((x) => x.kind === 'wordcard').length,
        trophies: drops.filter((x) => x.kind === 'trophy').length,
        clues: drops.filter((x) => x.kind === 'clue').length,
      },
    };
  });
}

/** the stage the student is in (the part of the current scene) and the next one that has scenes */
export const nextStagePart = (stages: StageInfo[], part: number): number | undefined => stages.find((s) => s.part > part && s.total > 0)?.part;

// ---------- the Quest Complete recap ----------
export interface QuestRecap {
  xp: number;
  gems: number;
  level: LevelInfo;
  /** 1-3 stars from first-try wins */
  stars: 1 | 2 | 3;
  clean: number;
  scored: number;
  loot: LootItem[];
  potential: LootItem[];
  objectives: Objective[];
  bestStreak: number;
  stagesCleared: number;
}

export function recapOf(script: LessonScript, s: EngineState): QuestRecap {
  const done = doneSet(s.doneIds);
  const scoredScenes = script.scenes.filter((x) => SCORED_KINDS.has(x.kind) && done.has(x.id));
  const clean = scoredScenes.filter((x) => s.results[x.id]?.gem).length;
  const ratio = scoredScenes.length ? clean / scoredScenes.length : 1;
  const stages = stagesOf(script, s.doneIds);
  const loot = lootOf(script, s);
  return {
    xp: s.xp,
    gems: loot.filter((l) => l.kind === 'gem').length,
    level: levelOf(s.xp),
    stars: ratio >= 0.85 ? 3 : ratio >= 0.5 ? 2 : 1,
    clean,
    scored: scoredScenes.length,
    loot,
    potential: potentialLoot(script),
    objectives: objectivesOf(script, s.doneIds),
    bestStreak: streakOf(script, s).best,
    stagesCleared: stages.filter((x) => x.complete).length,
  };
}
