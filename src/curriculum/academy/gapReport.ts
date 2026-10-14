// Teacher's gap report for one student (owner 2026-10-14: forgetting comes from lack of practice). Joins the practice signals, the Daily 10 item states and the
// speaking tally into one traffic-light view with the recommended next-lesson mode and plain actions. Pure; Academy-only. Saving the inputs is the caller's job.
import { DAILY_TEN_SIZE, statusOf, summary, type DailyItem } from './dailyTen';
import { decideForGap, nudgeFor, type GapDecision } from './practiceGap';
import { SPEAKING_TARGETS, sayItTarget } from './speaking';

export interface GapReportInput {
  level: keyof typeof SPEAKING_TARGETS;
  today: string;
  /** ISO date of the last finished lesson */
  lastLessonOn?: string;
  missedInRow?: number;
  /** Daily 10 sessions scheduled and finished over the last 14 days */
  daily10Scheduled?: number;
  daily10Done?: number;
  /** share of Remember? items right without a hint in the last lesson (0-1) */
  rememberAccuracy?: number;
  /** Daily 10 item states (dailyTen.ts) */
  items: DailyItem[];
  /** "Say it" taps in the last lesson (Deck stats.spoken) */
  spokenLastLesson?: number;
}
export type Risk = 'green' | 'amber' | 'red';
export interface GapReport {
  risk: Risk;
  decision: GapDecision;
  daysSinceLastLesson: number;
  daily10Rate: number | null;
  counts: ReturnType<typeof summary>;
  /** items that need attention: stuck (2+ misses) or fading, worst first */
  weak: { item: string; why: 'stuck' | 'fading'; misses: number }[];
  speaking: { spoken: number; target: number; share: number } | null;
  nudge: ReturnType<typeof nudgeFor>;
  actions: string[];
}

const day = (iso: string) => Math.floor(Date.parse(`${iso}T00:00:00Z`) / 86400000);

export function gapReport(i: GapReportInput): GapReport {
  const days = i.lastLessonOn ? Math.max(0, day(i.today) - day(i.lastLessonOn)) : 0;
  const rate = i.daily10Scheduled ? Math.min(1, (i.daily10Done ?? 0) / i.daily10Scheduled) : null;
  const decision = decideForGap({ daysSinceLastLesson: days, daily10Rate: rate ?? undefined, rememberAccuracy: i.rememberAccuracy, missedInRow: i.missedInRow }, i.level === 'Pre-A1');
  const counts = summary(i.items, i.today);
  const weak = i.items
    .map((s) => ({ item: s.item, misses: s.misses, fading: statusOf(s, i.today) === 'fading' }))
    .filter((s) => s.misses >= 2 || s.fading)
    .sort((a, b) => Number(b.fading) - Number(a.fading) || b.misses - a.misses)
    .slice(0, 8)
    .map((s) => ({ item: s.item, why: (s.fading ? 'fading' : 'stuck') as 'fading' | 'stuck', misses: s.misses }));
  const target = sayItTarget(i.level);
  const speaking = i.spokenLastLesson === undefined ? null : { spoken: i.spokenLastLesson, target, share: Math.min(1, i.spokenLastLesson / target) };
  const done14 = i.daily10Done ?? 0;
  const nudge = nudgeFor(Math.min(done14, 7));
  let risk: Risk = decision.mode === 'rewind' || decision.mode === 'restart' ? 'red' : decision.mode === 'refresh' || counts.fading >= 3 || (speaking !== null && speaking.share < 0.5) ? 'amber' : 'green';
  const actions: string[] = [];
  if (decision.mode !== 'on-track') actions.push(`Next lesson: ${decision.mode} (${decision.reasons.join('; ')}). New items at most ${decision.newItemCap}, Remember? ${decision.rememberMinutes} minutes${decision.replayLessons ? `, replay the last ${decision.replayLessons} lessons` : ''}${decision.recheck ? ', start with a 5-minute re-check' : ''}.`);
  if (weak.length) actions.push(`Start Remember? with: ${weak.slice(0, 5).map((w) => w.item).join(', ')}.`);
  if (counts.dueToday > DAILY_TEN_SIZE) actions.push(`${counts.dueToday} items are due today; the Daily 10 shows ten. Ask for a second short round.`);
  if (speaking && speaking.share < 0.5) actions.push(`Speaking: ${speaking.spoken} of ${speaking.target} spoken answers last lesson. Use shadowing and a voice note.`);
  if (rate !== null && rate < 0.5) actions.push(`Daily 10 done ${Math.round(rate * 100)} % of the time: ${nudge.message}`);
  if (actions.length === 0) actions.push('On track: no change needed.');
  if (risk === 'green' && SPEAKING_TARGETS[i.level].voiceNotesPerWeek > done14 / 2 && done14 === 0 && i.daily10Scheduled) risk = 'amber';
  return { risk, decision, daysSinceLastLesson: days, daily10Rate: rate, counts, weak, speaking, nudge, actions };
}
