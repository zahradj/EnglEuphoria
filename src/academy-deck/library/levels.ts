// The Academy library is organised like the Playground library: level (A1 A2 B1 B2 C1) → season (= unit, from the Academy roadmap) → lessons.
// Seasons come from the roadmap (src/curriculum/academy); a season with no built lesson yet is listed as "coming soon".
import { ACADEMY_SEASONS } from '../../curriculum/academy';
import type { AcademyDeckLesson } from '../lessonRegistry';

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
