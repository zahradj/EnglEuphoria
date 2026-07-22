// Cambridge Young Learners English (YLE) alignment overlay.
// Maps CEFR + Playground unit slug → Starters / Movers / Flyers skill bands.
//
// This is a READ-ONLY overlay — it never mutates the locked curriculum engine.
// Used by the parent report + YleShieldBadge component.

export type YleExam = 'Starters' | 'Movers' | 'Flyers';
export type YleSkill = 'Listening' | 'ReadingWriting' | 'Speaking';

export interface YleAlignment {
  exam: YleExam;
  skill: YleSkill;
  canDo: string;
  shieldsTarget: 1 | 2 | 3 | 4 | 5;
}

export interface YleUnitAlignment {
  unitSlug: string;
  alignments: YleAlignment[];
}

const STARTERS_CAN_DO: YleAlignment[] = [
  { exam: 'Starters', skill: 'Listening', canDo: 'Understand short, simple instructions.', shieldsTarget: 3 },
  { exam: 'Starters', skill: 'Speaking', canDo: 'Answer simple questions about themselves.', shieldsTarget: 3 },
  { exam: 'Starters', skill: 'ReadingWriting', canDo: 'Read and write basic words and names.', shieldsTarget: 3 },
];

const MOVERS_CAN_DO: YleAlignment[] = [
  { exam: 'Movers', skill: 'Listening', canDo: 'Follow a short conversation with familiar topics.', shieldsTarget: 4 },
  { exam: 'Movers', skill: 'Speaking', canDo: 'Talk about pictures and tell simple stories.', shieldsTarget: 4 },
  { exam: 'Movers', skill: 'ReadingWriting', canDo: 'Read and write short messages of 25+ words.', shieldsTarget: 4 },
];

const FLYERS_CAN_DO: YleAlignment[] = [
  { exam: 'Flyers', skill: 'Listening', canDo: 'Understand basic information on familiar topics.', shieldsTarget: 5 },
  { exam: 'Flyers', skill: 'Speaking', canDo: 'Tell short stories about past events.', shieldsTarget: 5 },
  { exam: 'Flyers', skill: 'ReadingWriting', canDo: 'Read and write 25–50 word descriptions.', shieldsTarget: 5 },
];

export function getYleExamForCefr(cefr: string): YleExam | null {
  const c = cefr.toUpperCase();
  if (c === 'PRE-A1') return 'Starters';
  if (c === 'A1') return 'Movers';
  if (c === 'A2') return 'Flyers';
  return null;
}

export function getYleAlignmentForCefr(cefr: string): YleAlignment[] {
  const exam = getYleExamForCefr(cefr);
  if (!exam) return [];
  if (exam === 'Starters') return STARTERS_CAN_DO;
  if (exam === 'Movers') return MOVERS_CAN_DO;
  return FLYERS_CAN_DO;
}

/** Convert 0..100 mastery → 1..5 shields (Cambridge-style). */
export function masteryToShields(mastery: number): 0 | 1 | 2 | 3 | 4 | 5 {
  if (mastery >= 90) return 5;
  if (mastery >= 75) return 4;
  if (mastery >= 60) return 3;
  if (mastery >= 40) return 2;
  if (mastery >= 20) return 1;
  return 0;
}
