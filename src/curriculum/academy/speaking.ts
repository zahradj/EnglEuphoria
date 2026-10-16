// Speaking practice (owner 2026-10-14: "speaking practice is very, very important"). Targets every lesson plan must meet, and the speaking ladder.
// One-to-one is the Academy's advantage: the student can talk for a large part of the hour. Pure constants and a checker; Academy-only. Numbers are design targets [target].

/** The speaking ladder: every new language climbs it inside the lesson, from safe to free. */
export const SPEAKING_LADDER = [
  { step: 'shadow', job: 'say it together with the recording or the teacher', support: 'full model, text visible' },
  { step: 'repeat', job: 'say it alone after the model', support: 'model first, text visible' },
  { step: 'controlled', job: 'say a sentence with a given pattern and new words', support: 'frame and picture cue' },
  { step: 'guided', job: 'answer or take a turn in a short exchange', support: 'first words of a frame, hints on request' },
  { step: 'free', job: 'say what you think or did, in your own words', support: 'none by default; hints on request' },
] as const;

export interface SpeakingTargets {
  /** share of the 60 minutes in which the student, not the teacher, is talking */
  studentTalkShare: number;
  /** minutes of explicit speaking practice (the ladder, Mission, roles), not counting answers to games */
  speakingMinutes: number;
  /** distinct speaking tasks per lesson */
  speakingTasks: number;
  /** ladder steps a lesson must reach */
  reachesStep: (typeof SPEAKING_LADDER)[number]['step'];
  /** voice notes per week outside the lesson (Daily 10) */
  voiceNotesPerWeek: number;
}

export const SPEAKING_TARGETS: Record<'Pre-A1' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1', SpeakingTargets> = {
  'Pre-A1': { studentTalkShare: 0.4, speakingMinutes: 12, speakingTasks: 4, reachesStep: 'controlled', voiceNotesPerWeek: 2 },
  A1: { studentTalkShare: 0.45, speakingMinutes: 15, speakingTasks: 5, reachesStep: 'guided', voiceNotesPerWeek: 2 },
  A2: { studentTalkShare: 0.5, speakingMinutes: 18, speakingTasks: 5, reachesStep: 'guided', voiceNotesPerWeek: 2 },
  B1: { studentTalkShare: 0.55, speakingMinutes: 20, speakingTasks: 5, reachesStep: 'free', voiceNotesPerWeek: 3 },
  B2: { studentTalkShare: 0.6, speakingMinutes: 22, speakingTasks: 5, reachesStep: 'free', voiceNotesPerWeek: 3 },
  C1: { studentTalkShare: 0.65, speakingMinutes: 25, speakingTasks: 5, reachesStep: 'free', voiceNotesPerWeek: 3 },
};

export interface SpeakingPlan {
  level: keyof typeof SPEAKING_TARGETS;
  studentTalkShare: number;
  speakingMinutes: number;
  tasks: { step: (typeof SPEAKING_LADDER)[number]['step']; minutes: number }[];
}

/** Problems with a lesson plan's speaking: empty means it meets the targets for its level. */
export function speakingProblems(plan: SpeakingPlan): string[] {
  const t = SPEAKING_TARGETS[plan.level];
  const order = SPEAKING_LADDER.map((s) => s.step);
  const reached = Math.max(-1, ...plan.tasks.map((x) => order.indexOf(x.step)));
  const out: string[] = [];
  if (plan.studentTalkShare < t.studentTalkShare) out.push(`student talk ${Math.round(plan.studentTalkShare * 100)} % is under ${Math.round(t.studentTalkShare * 100)} %`);
  if (plan.speakingMinutes < t.speakingMinutes) out.push(`${plan.speakingMinutes} speaking minutes is under ${t.speakingMinutes}`);
  if (plan.tasks.length < t.speakingTasks) out.push(`${plan.tasks.length} speaking tasks is under ${t.speakingTasks}`);
  if (reached < order.indexOf(t.reachesStep)) out.push(`the lesson never reaches the "${t.reachesStep}" step`);
  return out;
}

/** How many "Say it ✓" taps a lesson should collect (about one spoken answer every 40 seconds of the speaking minutes ×1.5) [target]. */
export const sayItTarget = (level: keyof typeof SPEAKING_TARGETS): number => Math.round(SPEAKING_TARGETS[level].speakingMinutes * 1.5);
