// Shared incident-flag vocabulary for end-of-lesson reports.
// Used by the teacher Wrap-Up dialog, the student outcome dialog,
// and the Post-Lesson Summary panel.

export type IncidentFlag =
  | 'student_late'
  | 'student_left_early'
  | 'teacher_late'
  | 'teacher_left_early'
  | 'student_tech_issue'
  | 'teacher_tech_issue'
  | 'connection_issue'
  | 'audio_video_issue'
  | 'audio_issue'
  | 'video_issue'
  | 'cut_short'
  | 'non_tech_issue'
  | 'other';

export const FLAG_META: Record<IncidentFlag, { label: string; emoji: string; tone: 'red' | 'amber' | 'slate' }> = {
  student_late:        { label: 'Student arrived late',  emoji: '⏰', tone: 'amber' },
  student_left_early:  { label: 'Student left early',    emoji: '🚪', tone: 'amber' },
  teacher_late:        { label: 'Teacher arrived late',  emoji: '⏰', tone: 'amber' },
  teacher_left_early:  { label: 'Teacher left early',    emoji: '🚪', tone: 'amber' },
  student_tech_issue:  { label: 'Student tech issue',    emoji: '🛠', tone: 'red' },
  teacher_tech_issue:  { label: 'Teacher tech issue',    emoji: '🛠', tone: 'red' },
  connection_issue:    { label: 'Connection dropped',    emoji: '📶', tone: 'red' },
  audio_video_issue:   { label: 'Audio / video problem', emoji: '🎧', tone: 'red' },
  audio_issue:         { label: 'Audio issue',           emoji: '🔊', tone: 'red' },
  video_issue:         { label: 'Video issue',           emoji: '📹', tone: 'red' },
  cut_short:           { label: 'Lesson cut short',      emoji: '✂️', tone: 'amber' },
  non_tech_issue:      { label: 'Non-tech issue',        emoji: '⚠️', tone: 'amber' },
  other:               { label: 'Other',                 emoji: '✏️', tone: 'slate' },
};

export const TEACHER_FLAG_OPTIONS: IncidentFlag[] = [
  'student_late',
  'student_left_early',
  'student_tech_issue',
  'teacher_tech_issue',
  'connection_issue',
  'audio_issue',
  'video_issue',
  'cut_short',
  'non_tech_issue',
  'other',
];

export const STUDENT_FLAG_OPTIONS: IncidentFlag[] = [
  'teacher_late',
  'teacher_left_early',
  'teacher_tech_issue',
  'student_tech_issue',
  'connection_issue',
  'audio_issue',
  'video_issue',
  'other',
];


export const toneClasses = (tone: 'red' | 'amber' | 'slate') =>
  tone === 'red'
    ? 'bg-rose-50 text-rose-700 border-rose-200'
    : tone === 'amber'
      ? 'bg-amber-50 text-amber-800 border-amber-200'
      : 'bg-slate-50 text-slate-700 border-slate-200';
