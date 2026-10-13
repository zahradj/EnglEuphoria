import type { HomeworkQuest, QuestLevel } from './types';

/* =============================================================================
 * "Practise again" packs (owner-approved assessment plan 2026-10-12, docs/assessment/prea1-assessment-plan.md §4).
 *
 * After a Boss Test, Checkpoint or the Final Test, the teacher sends one pack for every weak part (words,
 * sentences, sounds, speaking). A pack is a short Homework Quest built ONLY from levels the child already met in
 * that unit's lesson quests (same pictures, same recorded lines — no new voice clips, no new art), picked for the
 * skill, one level per lesson where possible and never the same game twice in a row, ending on the unit's treasure.
 *
 * Ids: practise-<scope>-<skill>; scope = u1 … u10 (Boss Tests), checkpoint-1 (Units 1–5), prea1 (Units 1–10).
 * ========================================================================== */

export type PractiseSkill = 'words' | 'sentences' | 'sounds' | 'speaking';
export const PRACTISE_SKILLS: readonly PractiseSkill[] = ['words', 'sentences', 'sounds', 'speaking'];

/** Which quest games train each tested part (in order of preference). */
const SKILL_KINDS: Record<PractiseSkill, QuestLevel['kind'][]> = {
  words: ['picture-choice', 'tap-hotspot', 'sticker-drop', 'scene-puzzle'],
  sentences: ['true-false', 'sentence-builder', 'dress-up', 'tap-hotspot'],
  sounds: ['sound-blend', 'sound-choice', 'twister'],
  // at home the child hears the line, builds it and says it aloud (twister: says it at three speeds)
  speaking: ['sentence-builder', 'twister', 'true-false'],
};

const SKILL_TITLE: Record<PractiseSkill, string> = {
  words: 'Word Practice', sentences: 'Sentence Practice', sounds: 'Sound Practice', speaking: 'Talk Practice',
};

const SCOPES: { scope: string; units: number[]; label: string; levels: number }[] = [
  ...Array.from({ length: 10 }, (_, i) => ({ scope: `u${i + 1}`, units: [i + 1], label: `Unit ${i + 1}`, levels: 4 })),
  { scope: 'checkpoint-1', units: [1, 2, 3, 4, 5], label: 'Units 1–5', levels: 5 },
  { scope: 'prea1', units: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], label: 'Pre-A1, Units 1–10', levels: 5 },
];

export const practisePackId = (scope: string, skill: string) => `practise-${scope}-${skill}`;

/** The pack scope for a level test: 'prea1-u3-boss' → 'u3', 'prea1-checkpoint-1' → 'checkpoint-1', 'prea1-final' → 'prea1'. */
export function practiseScopeForTest(testKey: string): string | null {
  const boss = /^prea1-u(\d+)-boss$/.exec(testKey);
  if (boss) return `u${boss[1]}`;
  if (testKey === 'prea1-checkpoint-1') return 'checkpoint-1';
  if (testKey === 'prea1-final') return 'prea1';
  return null;
}

const lessonOf = (q: HomeworkQuest) => /^lep1-rich-(\d+)-(\d+)$/.exec(q.lessonKey);

/** Builds every pack from the Pre-A1 lesson quests. Pure: the same quests always give the same packs. */
export function buildPractisePacks(quests: HomeworkQuest[]): Record<string, HomeworkQuest> {
  const lessonQuests = quests
    .map((q) => ({ q, m: lessonOf(q) }))
    .filter((x): x is { q: HomeworkQuest; m: RegExpExecArray } => !!x.m && x.q.level === 'Pre-A1')
    .map(({ q, m }) => ({ q, unit: Number(m[1]), lesson: Number(m[2]) }))
    .sort((a, b) => a.unit - b.unit || a.lesson - b.lesson);

  const out: Record<string, HomeworkQuest> = {};
  for (const sc of SCOPES) {
    const inScope = lessonQuests.filter((x) => sc.units.includes(x.unit));
    if (!inScope.length) continue;
    // multi-unit packs: one quest per unit (its review lesson = the last one), so every unit gets a turn
    const sources = sc.units.length > 1
      ? sc.units.map((u) => inScope.filter((x) => x.unit === u)).filter((l) => l.length).map((l) => l[l.length - 1])
      : inScope;
    const home = inScope[inScope.length - 1].q;
    const treasureSrc = [...inScope].reverse().find((x) => x.q.levels.some((l) => l.kind === 'treasure'))?.q;
    const treasure = treasureSrc?.levels.find((l) => l.kind === 'treasure');

    for (const skill of PRACTISE_SKILLS) {
      const kinds = SKILL_KINDS[skill];
      // each source quest's levels that train this skill, best kind first; voice made explicit so every line keeps its recorded clip
      const pools = sources.map(({ q }) => q.levels
        .filter((l) => kinds.includes(l.kind))
        .sort((a, b) => kinds.indexOf(a.kind) - kinds.indexOf(b.kind))
        .map((l) => ({ ...l, voice: l.voice ?? q.voice }) as QuestLevel));
      const cands = pools.flatMap((pool, li) => pool.map((l, rank) => ({ l, li, rank })));
      const picked: QuestLevel[] = [];
      const kindUse = new Map<string, number>();
      const lessonUse = new Map<number, number>();
      while (picked.length < sc.levels && cands.length) {
        // greedy: a different game from the last one, then the least-used game, the least-used lesson, the best fit
        const prev = picked[picked.length - 1]?.kind;
        const score = (c: (typeof cands)[number]) => [c.l.kind === prev ? 1 : 0, kindUse.get(c.l.kind) ?? 0, lessonUse.get(c.li) ?? 0, c.rank, c.li];
        const best = cands.reduce((a, b) => { const x = score(a), y = score(b); for (let k = 0; k < x.length; k++) if (x[k] !== y[k]) return x[k] < y[k] ? a : b; return a; });
        cands.splice(cands.indexOf(best), 1);
        picked.push(best.l);
        kindUse.set(best.l.kind, (kindUse.get(best.l.kind) ?? 0) + 1);
        lessonUse.set(best.li, (lessonUse.get(best.li) ?? 0) + 1);
      }
      if (!picked.length) continue;
      // unique level names (results are stored per level name)
      const seen = new Map<string, number>();
      const levels = [...picked, ...(treasure ? [{ ...treasure, voice: treasure.voice ?? treasureSrc!.voice } as QuestLevel] : [])].map((l) => {
        const n = (seen.get(l.name) ?? 0) + 1; seen.set(l.name, n);
        return n > 1 ? { ...l, name: `${l.name} ${n}` } : l;
      });
      const id = practisePackId(sc.scope, skill);
      out[id] = {
        id,
        title: `Practise again: ${SKILL_TITLE[skill]}`,
        subtitle: sc.label,
        level: 'Pre-A1',
        lessonKey: id,
        theme: home.theme,
        voice: home.voice,
        praise: home.praise,
        levels,
      };
    }
  }
  return out;
}
