// The Academy library is organised like the Playground library: level (A1 A2 B1 B2 C1) → season (= unit, from the Academy roadmap) → lessons.
// Seasons come from the roadmap (src/curriculum/academy); a season with no built lesson yet is listed as "coming soon".
import { ACADEMY_LESSON_BLUEPRINTS, ACADEMY_SEASONS, PA1_S01, ladderSteps, type LadderStep } from '../../curriculum/academy';
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
export interface LessonSlot { episode: number; name: string; built: boolean }
export interface LibrarySeason {
  key: string;
  /** number shown as "Season N"; null for a planned Pre-A1 season (shown by its title only) */
  no: number | null;
  title: string;
  lessons: AcademyDeckLesson[];
  slots: LessonSlot[];
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

/** Lesson slots of Pre-A1 Season P1 (the Season spec lives in src/curriculum/academy/preA1.ts). */
function preA1Slots(lessons: AcademyDeckLesson[]): LessonSlot[] {
  const built = new Set(lessons.map((l) => ACADEMY_DECK_BLUEPRINT_IDS[l.id]).filter(Boolean));
  return PA1_S01.episodes.map((e) => ({ episode: e.no, name: e.name, built: built.has(`${PA1_S01.id}-E${e.no}`) }));
}

function slotsOf(level: AcademyLevel, no: number, lessons: AcademyDeckLesson[]): LessonSlot[] {
  const built = new Set(lessons.map((l) => ACADEMY_DECK_BLUEPRINT_IDS[l.id]).filter(Boolean));
  return ACADEMY_LESSON_BLUEPRINTS.filter((b) => b.level === level && b.seasonNo === no).map((b) => ({ episode: b.episode.no, name: b.episode.name, built: built.has(b.id) }));
}

/**
 * Library groups: with `showSteps` one group per ladder step (Pre-A1, A1, A1 Upper, A2 …); without, one group per level (students).
 * Every season lists its lesson slots (the 8 episodes), so the library is ready for lessons that are not built yet.
 */
export function groupAcademyLibrary(lessons: AcademyDeckLesson[], showSteps: boolean): LibraryGroup[] {
  const seasonOf = (level: AcademyLevel, no: number, title: string): LibrarySeason => {
    const ls = lessons.filter((l) => l.level === level && l.season === no).sort((a, b) => a.lesson - b.lesson);
    return { key: `${level}-${no}`, no, title, lessons: ls, slots: slotsOf(level, no, ls), planned: false };
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
          return { key: `${st.id}-p${i + 1}`, no: null, title, lessons: ls, slots: i === 0 ? preA1Slots(ls) : [], planned: ls.length === 0 };
        });
    return { id: st.id, label: st.label, stage: st.stage, cefr: st.cefr, seasons, count: seasons.reduce((n, s) => n + s.lessons.length, 0) };
  });
}
