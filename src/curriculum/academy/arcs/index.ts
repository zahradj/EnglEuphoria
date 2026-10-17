import { A1_ARCS } from './a1';
import { A2_ARCS } from './a2';
import { B1_ARCS } from './b1';
import { B2_ARCS } from './b2';
import { PRE_A1_ARCS } from './preA1';
import { C1_ARCS } from './c1';
import type { SeasonArc } from './types';

export type { SeasonArc } from './types';
export { PRE_A1_ARCS };
/** Hand-written Season arcs by Season id; a Season without one falls back to the derived default in ../seasonArc.ts. */
export const SEASON_ARCS: Record<string, SeasonArc> = { ...A1_ARCS, ...A2_ARCS, ...B1_ARCS, ...B2_ARCS, ...C1_ARCS };

/** The chapter of a lesson (blueprint id such as 'B1-S01-E3' or 'PA1-S02-E1'): A1-C1 from the Season's chapters, Pre-A1 from PRE_A1_ARCS. */
export function chapterOfLesson(lessonId: string, seasonChapters?: (id: string) => SeasonArc | undefined): { no: number; title: string; question: string; step: string; essentialQuestion: string } | undefined {
  const m = /^(.+-S\d+)-E(\d)$/.exec(lessonId);
  if (!m) return undefined;
  const arc = SEASON_ARCS[m[1]] ?? PRE_A1_ARCS[m[1]] ?? seasonChapters?.(m[1]);
  const c = arc?.chapters[Number(m[2]) - 1];
  return arc && c ? { no: Number(m[2]), ...c, essentialQuestion: arc.essentialQuestion } : undefined;
}
