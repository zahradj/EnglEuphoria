// Academy session plan — the teacher-facing plan for ONE 60-minute live session (schema from the academy-session-builder skill).
// Self-contained: imports nothing outside src/curriculum/academy/.
export interface SessionSegment {
  name: 'Check-in' | 'Remember?' | 'The Drop' | 'Notice & Build' | 'Energiser' | 'Mission' | 'Release' | 'Wrap';
  core: boolean;
  minutes: number;
  /** the science technique this segment implements (docs/academy-learning-science.md) */
  technique: string;
  mechanic?: string;
  why?: string;
  teacher: string[];
  student: string[];
  comfort: string[];
  fun?: string[];
}

export interface SessionPlan {
  id: string;
  seasonId: string;
  episode: number;
  minutes: 60;
  lastTimeCard: { did: string[]; bestLine?: string; remember: string };
  segments: SessionSegment[];
  mission: { dial: Record<'chill' | 'normal' | 'push', string>; planningSeconds?: number; take2: string; criteria: string[] };
  release: { spec: string; rubricId: string };
  wrap: { canDo: string[]; homework: string[]; dailyTenPackId: string; nextClue: string };
  chillTrack: string;
  planB: string;
  errorLogCategories: string[];
  teacherNotes: string[];
  /** the new items this session introduces (ids = the item words in src/curriculum/academy/items) */
  newItems: string[];
}
