import React from 'react';
import { CheckCircle2, Clock, FileText, Info, Mic, Smile } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useTeacherScorecard, type Scorecard } from '@/hooks/useTeacherScorecard';
import { TALK_TARGET_PCT, talkStatus } from '@/lib/talkTime';

/** A figure needs this many data points before we judge it; before that we say "collecting data". */
const MIN_N = 5;

export type Status = 'good' | 'almost' | 'attention' | 'collecting';

export const STATUS_STYLE: Record<Status, { chip: string; bar: string; label: string }> = {
  good: { chip: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300', bar: 'bg-emerald-500', label: 'On track' },
  almost: { chip: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300', bar: 'bg-amber-500', label: 'Almost there' },
  attention: { chip: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300', bar: 'bg-rose-500', label: 'Needs attention' },
  collecting: { chip: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300', bar: 'bg-slate-300 dark:bg-slate-600', label: 'Collecting data' },
};

function judge(pct: number | null, n: number, target: number): Status {
  if (pct === null || n < MIN_N) return 'collecting';
  if (pct >= target) return 'good';
  if (pct >= target - 10) return 'almost';
  return 'attention';
}

export interface Goal {
  id: 'on_time' | 'delivered' | 'reports' | 'talk' | 'feedback';
  title: string;
  plain: string;
  pct: number | null;
  n: number;
  target: number;
  status: Status;
  tip: string;
}

export function buildGoals(s: Scorecard): Goal[] {
  const talkPct = s.talk.student_pct;
  const talkStat = talkPct === null || s.talk.n < 3 ? 'collecting'
    : ({ great: 'good', good: 'good', watch: 'almost', low: 'attention' } as const)[talkStatus(talkPct)];
  const happy = s.feedback.confident_pct;

  return [
    { id: 'on_time', title: 'On time', plain: 'You joined within 2 minutes of the start', pct: s.on_time.pct, n: s.on_time.n, target: 90,
      status: judge(s.on_time.pct, s.on_time.n, 90), tip: 'Open the classroom 5 minutes early so you are never the one being waited for.' },
    { id: 'delivered', title: 'Lessons delivered', plain: 'Booked lessons that took place', pct: s.delivered.pct, n: s.delivered.n, target: 95,
      status: judge(s.delivered.pct, s.delivered.n, 95), tip: 'Cancel as early as you can, and at least 48 hours ahead when you must.' },
    { id: 'reports', title: 'Report within 24h', plain: 'Lesson report sent the same day', pct: s.reports.pct, n: s.reports.n, target: 90,
      status: judge(s.reports.pct, s.reports.n, 90), tip: 'Write the report right after class: two good things, one thing to practise.' },
    { id: 'talk', title: 'Student talking time', plain: 'How much of the lesson your student speaks', pct: talkPct, n: s.talk.n, target: TALK_TARGET_PCT,
      status: talkStat, tip: 'Ask, then wait. Try a 5-second pause after every question.' },
    { id: 'feedback', title: 'Student confidence', plain: 'Students who said they feel more confident', pct: happy, n: s.feedback.n, target: 80,
      status: judge(happy, s.feedback.n, 80), tip: 'Ask students to tap their feedback at the end of every lesson.' },
  ];
}

function KeyCard({ goal, icon }: { goal: Goal; icon: React.ReactNode }) {
  const st = STATUS_STYLE[goal.status];
  const has = goal.pct !== null && goal.status !== 'collecting';
  return (
    <section className="rounded-2xl border bg-card p-4 shadow-sm" aria-label={goal.title}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <span className="text-muted-foreground" aria-hidden>{icon}</span>
          {goal.title}
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${st.chip}`}>{st.label}</span>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-4xl font-bold tabular-nums leading-none">{has ? `${goal.pct}%` : '–'}</span>
        <span className="text-xs text-muted-foreground">goal: {goal.target}% or more</span>
      </div>

      <div
        className="relative mt-3 h-2.5 rounded-full bg-muted"
        role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={has ? goal.pct ?? 0 : 0}
        aria-label={`${goal.title}: ${has ? goal.pct : 'no data yet'}%`}
      >
        <div className={`h-full rounded-full ${st.bar}`} style={{ width: `${has ? Math.min(100, goal.pct ?? 0) : 0}%` }} />
        <span className="absolute -top-1 h-4.5 w-0.5 bg-foreground/60" style={{ left: `${goal.target}%`, height: '1.1rem' }} aria-hidden />
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        {goal.status === 'collecting'
          ? goal.n > 0 ? `${goal.n} so far. We show this after ${goal.id === 'talk' ? 3 : MIN_N} lessons.` : 'Will appear after your next lessons.'
          : `${goal.plain} · ${goal.n} ${goal.id === 'feedback' ? 'responses' : 'lessons'}`}
      </p>
    </section>
  );
}

const ICONS: Record<Goal['id'], React.ReactNode> = {
  on_time: <Clock className="h-4 w-4" />,
  delivered: <CheckCircle2 className="h-4 w-4" />,
  reports: <FileText className="h-4 w-4" />,
  talk: <Mic className="h-4 w-4" />,
  feedback: <Smile className="h-4 w-4" />,
};

/** The one diagram: who spoke in each recent lesson, with the "student talks more" line. */
function TalkTimeCard({ goal, recent }: { goal: Goal; recent: Scorecard['talk']['recent'] }) {
  const st = STATUS_STYLE[goal.status];
  const student = goal.pct;
  const hasData = student !== null && goal.status !== 'collecting';

  return (
    <section className="rounded-2xl border bg-card p-4 shadow-sm md:p-6" aria-label="Student talking time">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Mic className="h-4 w-4 text-muted-foreground" aria-hidden /> Student talking time
          </div>
          <p className="mt-1 text-xs text-muted-foreground">The student should speak more than you do. Aim for 50% or more.</p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${st.chip}`}>{st.label}</span>
      </div>

      {hasData ? (
        <>
          <div className="mt-4 flex items-baseline gap-6">
            <div>
              <div className="text-4xl font-bold tabular-nums leading-none text-sky-600 dark:text-sky-400">{student}%</div>
              <div className="mt-1 text-xs text-muted-foreground">Student</div>
            </div>
            <div>
              <div className="text-4xl font-bold tabular-nums leading-none text-violet-600 dark:text-violet-400">{100 - (student ?? 0)}%</div>
              <div className="mt-1 text-xs text-muted-foreground">You</div>
            </div>
          </div>

          {/* Overall split */}
          <div className="relative mt-4 flex h-5 overflow-hidden rounded-full" role="img" aria-label={`Student ${student}%, you ${100 - (student ?? 0)}%`}>
            <div className="bg-sky-500" style={{ width: `${student}%` }} />
            <div className="bg-violet-500" style={{ width: `${100 - (student ?? 0)}%` }} />
            <span className="absolute inset-y-0 w-0.5 bg-white" style={{ left: `${TALK_TARGET_PCT}%` }} aria-hidden />
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-sky-500" aria-hidden />Student</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-violet-500" aria-hidden />You</span>
            <span>White line = 50%, where you speak equally</span>
          </div>

          {/* Last lessons */}
          {recent.length > 1 && (
            <div className="mt-5">
              <div className="mb-2 text-xs font-semibold text-muted-foreground">Your last {recent.length} lessons</div>
              <div className="relative flex h-24 items-end gap-1.5" role="img" aria-label="Student talking share for each recent lesson">
                <span className="pointer-events-none absolute inset-x-0 top-1/2 z-10 border-t-2 border-dashed border-foreground/50" aria-hidden />
                {recent.map((r, i) => {
                  const total = r.student_seconds + r.teacher_seconds || 1;
                  const pct = Math.round((100 * r.student_seconds) / total);
                  return (
                    <div key={i} className="relative flex h-full flex-1 flex-col-reverse overflow-hidden rounded-md bg-violet-200 dark:bg-violet-900" title={`${new Date(r.date).toLocaleDateString()}: student ${pct}%`}>
                      <div className="bg-sky-500" style={{ height: `${pct}%` }} />
                    </div>
                  );
                })}
              </div>
              <div className="mt-1 flex justify-between text-[11px] text-muted-foreground"><span>older</span><span>latest</span></div>
            </div>
          )}
        </>
      ) : (
        <p className="mt-4 rounded-xl bg-muted/50 p-3 text-sm text-muted-foreground">
          Talking time will appear here after a few lessons. It is measured from microphone activity only. No audio is ever recorded.
        </p>
      )}
    </section>
  );
}

/** Loads the scorecard (own, or a teacher's when an admin passes `teacherId`) and shows it. */
export function TeachingScorecard({ teacherId }: { teacherId?: string | null }) {
  const { data, isLoading, error } = useTeacherScorecard(teacherId);

  if (isLoading) {
    return (
      <div className="space-y-4" aria-busy="true">
        <Skeleton className="h-28 rounded-2xl" />
        <div className="grid gap-4 sm:grid-cols-2">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}</div>
      </div>
    );
  }
  if (error || !data) {
    return (
      <div className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground">
        Your scorecard isn't available yet. Please check back soon.
      </div>
    );
  }
  return <ScorecardView data={data} />;
}

/** Pure display of a scorecard; no data fetching. */
export function ScorecardView({ data }: { data: Scorecard }) {
  const goals = buildGoals(data);
  const judged = goals.filter((g) => g.status !== 'collecting');
  const onTrack = judged.filter((g) => g.status === 'good').length;
  // The goal furthest below its target is the one thing to work on this week.
  const focus = [...judged]
    .filter((g) => g.status !== 'good' && g.pct !== null)
    .sort((a, b) => (a.pct! / a.target) - (b.pct! / b.target))[0];

  const talkGoal = goals.find((g) => g.id === 'talk')!;
  const rest = goals.filter((g) => g.id !== 'talk');

  return (
    <div className="space-y-5">
      {/* One headline */}
      <section className="rounded-2xl border bg-gradient-to-br from-primary/10 to-transparent p-5 md:p-6" aria-live="polite">
        {judged.length === 0 ? (
          <>
            <h2 className="text-xl font-bold md:text-2xl">We're getting to know your lessons</h2>
            <p className="mt-1 text-sm text-muted-foreground">Your goals appear after your first few lessons. Nothing to do now but teach.</p>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold md:text-2xl">
              <span className="tabular-nums">{onTrack}</span> of <span className="tabular-nums">{judged.length}</span> goals on track
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {focus ? <><strong className="text-foreground">Your next win: {focus.title.toLowerCase()}.</strong> {focus.tip}</>
                : 'Everything is on track. Keep doing what you are doing.'}
            </p>
          </>
        )}
        <p className="mt-3 text-xs text-muted-foreground">
          Last {data.window_days} days. This page exists to help you grow, not to catch you out.
        </p>
      </section>

      <TalkTimeCard goal={talkGoal} recent={data.talk.recent} />

      <div className="grid gap-4 sm:grid-cols-2">
        {rest.map((g) => <KeyCard key={g.id} goal={g} icon={ICONS[g.id]} />)}
      </div>

      <details className="group rounded-2xl border bg-card p-4 text-sm">
        <summary className="flex cursor-pointer list-none items-center gap-2 font-semibold">
          <Info className="h-4 w-4 text-muted-foreground" aria-hidden /> How this works
        </summary>
        <ul className="mt-3 list-disc space-y-1.5 ps-5 text-muted-foreground">
          <li>Five simple goals, from your real lessons over the last {data.window_days} days.</li>
          <li>A goal only gets a colour once there are at least {MIN_N} lessons behind it. Until then it says "collecting data".</li>
          <li>
            Platform problems and lessons a student cancelled or missed never count against you
            {data.excluded.platform_faults + data.excluded.student_side > 0
              ? ` (${data.excluded.platform_faults + data.excluded.student_side} lessons were left out for that reason)`
              : ''}.
          </li>
          <li>Talking time is counted from microphone activity on each person's own device. No audio is recorded or stored.</li>
        </ul>
      </details>
    </div>
  );
}

export default TeachingScorecard;
