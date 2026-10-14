// The Academy library is organised like the Playground library: level (A1 A2 B1 B2 C1) → season (= unit, from the Academy roadmap) → lessons.
// Seasons come from the roadmap (src/curriculum/academy); a season with no built lesson yet is listed as "coming soon".
import { ACADEMY_LESSON_BLUEPRINTS, ACADEMY_RECALL_NODES, ACADEMY_SEASONS, PA1_SEASONS, PRE_A1_RECALL_NODES, MAX_REMEMBER_ITEMS_PRE_A1, ladderSteps, recallPlan, type LadderStep, type RecallNode, type RecallPlan } from '../../curriculum/academy';
import { ACADEMY_DECK_BLUEPRINT_IDS, type AcademyDeckLesson } from '../lessonRegistry';

export const ACADEMY_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'] as const;
export type AcademyLevel = (typeof ACADEMY_LEVELS)[number];

export interface SeasonGroup {
  no: number;
  title: string;
  /** built lessons of this season, in lesson order (empty = coming soon) */
  lessons: AcademyDeckLesson[];
}
export interface LevelGroup {
  level: AcademyLevel;
  seasons: SeasonGroup[];
  /** number of built lessons in this level */
  count: number;
}

/** Every level with every roadmap season; the given lessons are placed in their season. */
export function groupAcademyLessons(lessons: AcademyDeckLesson[]): LevelGroup[] {
  return ACADEMY_LEVELS.map((level) => {
    const seasons = ACADEMY_SEASONS.filter((s) => s.level === level)
      .map((s) => ({
        no: s.no,
        title: s.title,
        lessons: lessons.filter((l) => l.level === level && l.season === s.no).sort((a, b) => a.lesson - b.lesson),
      }));
    return { level, seasons, count: seasons.reduce((n, s) => n + s.lessons.length, 0) };
  });
}


// ---------- the ladder view (owner 2026-10-12: lean ladder; teachers and creators see the steps, students see the levels) ----------
/** One planned or built lesson slot of a season (one per episode of the roadmap). */
export interface LessonSlot {
  episode: number; name: string; built: boolean;
  /** the lesson blueprint's plan (A1 and above), shown to teachers and creators */
  plan?: { id: string; objective: string; newItems: number; focus: string; structures: string[]; mission: string; release: string; clue: string; /** spaced "Remember?" plan: what returns from earlier lessons, and when */ remember?: string[] };
}
/** What a season is about, for the creator's and teacher's library. */
export interface SeasonOverview {
  theme: string; hook?: string; canDo: string[]; structures: string[]; release: string; newItems: number;
  /** Pre-A1: the sounds taught and the video-game mechanic borrowed */
  sounds?: string[]; mechanic?: string;
}
export interface LibrarySeason {
  key: string;
  /** number shown as "Season N"; null for a planned Pre-A1 season (shown by its title only) */
  no: number | null;
  title: string;
  lessons: AcademyDeckLesson[];
  slots: LessonSlot[];
  /** the season's plan (A1 and above, and Pre-A1), shown to teachers and creators above the lessons */
  overview?: SeasonOverview;
  /** true for a season that is not in the roadmap data yet (Pre-A1) */
  planned: boolean;
}
export interface LibraryGroup {
  id: string;
  /** English label ("A1", "A1 Upper", "Pre-A1") */
  label: string;
  stage: LadderStep['stage'];
  /** level for the label translation of an Upper step */
  cefr: LadderStep['cefr'];
  seasons: LibrarySeason[];
  count: number;
}

/** One line per earlier lesson whose items return in this lesson's Remember? (expanding gaps), plus patterns and the big review. */
export function rememberLines(nodes: readonly RecallNode[], id: string, cap?: number): string[] {
  const plan: RecallPlan | null = recallPlan(nodes, id, cap);
  if (!plan) return [];
  const lines = plan.due.map((d) => `${d.fromLessonId} (${d.gap === 1 ? 'last lesson' : `${d.gap} lessons ago`}): ${d.items.join(', ')}`);
  plan.patterns.slice(0, 3).forEach((p) => lines.push(`pattern from ${p.fromLessonId}: ${p.pattern}`));
  if (plan.bigReview) lines.push(`Big review: the whole of ${plan.bigReview.seasons.join(' and ')}`);
  return lines;
}

/** Lesson slots of a Pre-A1 Season (the Season specs live in src/curriculum/academy/preA1.ts). */
function preA1Slots(seasonIdx: number, lessons: AcademyDeckLesson[]): LessonSlot[] {
  const sp = PA1_SEASONS[seasonIdx];
  if (!sp) return [];
  const built = new Set(lessons.map((l) => ACADEMY_DECK_BLUEPRINT_IDS[l.id]).filter(Boolean));
  return sp.episodes.map((e) => ({
    episode: e.no, name: e.name, built: built.has(`${sp.id}-E${e.no}`),
    plan: { id: `${sp.id}-E${e.no}`, objective: e.objective, newItems: e.newItems.length, focus: [...e.letters.map((l) => `letter ${l}`), ...e.sounds.map((x) => `sound /${x}/`), ...e.newItems].join(', '), structures: e.no === 3 ? [sp.chunk] : [], mission: e.mission ?? e.objective, release: sp.release, clue: e.clue, remember: rememberLines(PRE_A1_RECALL_NODES, `${sp.id}-E${e.no}`, MAX_REMEMBER_ITEMS_PRE_A1) },
  }));
}
function preA1Overview(seasonIdx: number): SeasonOverview | undefined {
  const sp = PA1_SEASONS[seasonIdx];
  return sp && { theme: sp.theme, canDo: [...sp.canDo], structures: [sp.chunk], release: sp.release, newItems: sp.episodes.reduce((n, e) => n + e.newItems.length, 0), sounds: [...sp.sounds], mechanic: 'videoGameMechanic' in sp ? sp.videoGameMechanic : undefined };
}

function slotsOf(level: AcademyLevel, no: number, lessons: AcademyDeckLesson[]): LessonSlot[] {
  const built = new Set(lessons.map((l) => ACADEMY_DECK_BLUEPRINT_IDS[l.id]).filter(Boolean));
  return ACADEMY_LESSON_BLUEPRINTS.filter((b) => b.level === level && b.seasonNo === no).map((b) => ({
    episode: b.episode.no, name: b.episode.name, built: built.has(b.id),
    plan: { id: b.id, objective: b.objective, newItems: b.newItems.count, focus: b.itemFocus, structures: b.structures.map((x) => x.label), mission: b.mission.job, release: b.release.job, clue: b.clue.unlockedBy, remember: rememberLines(ACADEMY_RECALL_NODES, b.id) },
  }));
}

/**
 * Library groups: with `showSteps` one group per ladder step (Pre-A1, A1, A1 Upper, A2 …); without, one group per level (students).
 * Every season lists its lesson slots (the 8 episodes), so the library is ready for lessons that are not built yet.
 */
export function groupAcademyLibrary(lessons: AcademyDeckLesson[], showSteps: boolean): LibraryGroup[] {
  const seasonOf = (level: AcademyLevel, no: number, title: string): LibrarySeason => {
    const ls = lessons.filter((l) => l.level === level && l.season === no).sort((a, b) => a.lesson - b.lesson);
    const sp = ACADEMY_SEASONS.find((x) => x.level === level && x.no === no);
    const overview = sp && { theme: sp.theme, hook: sp.hook, canDo: sp.canDo, structures: sp.structures.map((x) => x.label), release: sp.release, newItems: sp.newItemBudget };
    return { key: `${level}-${no}`, no, title, lessons: ls, slots: slotsOf(level, no, ls), overview, planned: false };
  };
  if (!showSteps) {
    return ACADEMY_LEVELS.map((level) => {
      const seasons = ACADEMY_SEASONS.filter((s) => s.level === level).map((s) => seasonOf(level, s.no, s.title));
      return { id: level.toLowerCase(), label: level, stage: 'core' as const, cefr: level, seasons, count: seasons.reduce((n, s) => n + s.lessons.length, 0) };
    });
  }
  return ladderSteps().map((st) => {
    const seasons: LibrarySeason[] = st.level && st.seasons
      ? ACADEMY_SEASONS.filter((s) => s.level === st.level && s.no >= st.seasons![0] && s.no <= st.seasons![1]).map((s) => seasonOf(st.level!, s.no, s.title))
      : st.plannedTitles.map((title, i) => {
          const ls = lessons.filter((l) => l.level === 'Pre-A1' && l.season === i + 1).sort((a, b) => a.lesson - b.lesson);
          return { key: `${st.id}-p${i + 1}`, no: null, title, lessons: ls, slots: preA1Slots(i, ls), overview: preA1Overview(i), planned: ls.length === 0 };
        });
    return { id: st.id, label: st.label, stage: st.stage, cefr: st.cefr, seasons, count: seasons.reduce((n, s) => n + s.lessons.length, 0) };
  });
}
