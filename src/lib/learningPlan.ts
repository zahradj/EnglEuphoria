/**
 * The learning plan a family receives after the free trial lesson.
 *
 * Drafted from what the teacher already enters (level, start unit, lessons per week) and the level's
 * unit titles from the curriculum blueprint; the teacher previews it and can change the start unit or
 * the pace before sending. Pure functions only, so it is easy to test and the saved shape is stable:
 * it is stored in `lesson_feedback_submissions.feedback_content.trial.plan`, emailed, and shown on
 * the student / parent dashboard.
 */

/** A blueprint unit is about this many lessons when the blueprint doesn't list them. */
export const DEFAULT_LESSONS_PER_UNIT = 4;
/** Weeks written out one by one; the rest is a one-line overview. */
export const DETAILED_WEEKS = 4;
export const UNITS_PER_LEVEL = 10;

export interface PlanUnitInfo {
  unitNumber: number;
  unitTitle: string | null;
  /** Lessons listed for this unit in the blueprint (0 when unknown). */
  lessonCount: number;
}

export interface PlanWeek {
  week: number;
  unit: number;
  title: string;
}

export interface LearningPlan {
  level: string;
  startUnit: number;
  lessonsPerWeek: number;
  /** The first weeks, one line each. */
  weeks: PlanWeek[];
  /** Weeks to finish the level from the start unit at this pace. */
  totalWeeks: number;
  /** Units left in the level after the detailed weeks. */
  unitsAfter: number;
  lastUnit: number;
}

const unitLabel = (u: PlanUnitInfo | undefined, n: number) => (u?.unitTitle?.trim() ? u.unitTitle.trim() : `Unit ${n}`);

/**
 * Walks the lessons in order from `startUnit`; week w covers lessons
 * (w-1)*lessonsPerWeek+1 .. w*lessonsPerWeek and is named after the unit its first lesson is in.
 */
export function buildLearningPlan(input: {
  level: string;
  startUnit: number;
  lessonsPerWeek: number;
  units: PlanUnitInfo[];
}): LearningPlan | null {
  const lessonsPerWeek = Math.round(input.lessonsPerWeek);
  if (!input.level || !(lessonsPerWeek >= 1 && lessonsPerWeek <= 5)) return null;
  const startUnit = Math.min(Math.max(Math.round(input.startUnit) || 1, 1), UNITS_PER_LEVEL);

  const byNumber = new Map(input.units.map((u) => [u.unitNumber, u]));
  const size = (n: number) => byNumber.get(n)?.lessonCount || DEFAULT_LESSONS_PER_UNIT;

  // lessonStart[i] = index (0-based, counted from the start unit) of the first lesson of unit startUnit+i.
  const lessonStart: number[] = [];
  let total = 0;
  for (let n = startUnit; n <= UNITS_PER_LEVEL; n++) {
    lessonStart.push(total);
    total += size(n);
  }
  const unitAtLesson = (idx: number) => {
    let i = 0;
    while (i + 1 < lessonStart.length && lessonStart[i + 1] <= idx) i++;
    return startUnit + i;
  };

  const totalWeeks = Math.max(1, Math.ceil(total / lessonsPerWeek));
  const weeks: PlanWeek[] = [];
  for (let w = 1; w <= Math.min(DETAILED_WEEKS, totalWeeks); w++) {
    const unit = unitAtLesson((w - 1) * lessonsPerWeek);
    weeks.push({ week: w, unit, title: unitLabel(byNumber.get(unit), unit) });
  }
  const lastShown = weeks[weeks.length - 1]?.unit ?? startUnit;
  return {
    level: input.level,
    startUnit,
    lessonsPerWeek,
    weeks,
    totalWeeks,
    unitsAfter: Math.max(0, UNITS_PER_LEVEL - lastShown),
    lastUnit: UNITS_PER_LEVEL,
  };
}

/** Reads a saved plan back, tolerating missing or older shapes. */
export function readLearningPlan(raw: unknown): LearningPlan | null {
  const p = raw as Partial<LearningPlan> | null | undefined;
  if (!p || typeof p !== 'object' || !Array.isArray(p.weeks) || !p.weeks.length) return null;
  const weeks = p.weeks
    .filter((w) => w && Number.isFinite(w.week) && Number.isFinite(w.unit) && typeof w.title === 'string')
    .map((w) => ({ week: Number(w.week), unit: Number(w.unit), title: String(w.title) }));
  if (!weeks.length || !p.level) return null;
  return {
    level: String(p.level),
    startUnit: Number(p.startUnit) || weeks[0].unit,
    lessonsPerWeek: Number(p.lessonsPerWeek) || 1,
    weeks,
    totalWeeks: Number(p.totalWeeks) || weeks.length,
    unitsAfter: Number(p.unitsAfter) || 0,
    lastUnit: Number(p.lastUnit) || UNITS_PER_LEVEL,
  };
}
