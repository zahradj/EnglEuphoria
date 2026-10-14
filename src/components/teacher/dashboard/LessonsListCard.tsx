import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, User, MessageSquare, ChevronRight, History, CheckCircle2, Loader2 } from 'lucide-react';
import { format, isToday } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { EmptyState } from '@/components/ui/empty-state';
import { FeedbackReportDialog } from '@/components/classroom/FeedbackReportDialog';
import { LessonWrapUpDialog } from '@/components/classroom/LessonWrapUpDialog';
import { cn } from '@/lib/utils';
import { resolveCalendarColor } from '@/lib/calendarColors';
import { formatTimeRange } from '@/lib/timeRange';

/** Raw class_bookings.status values this card cares about. */
type BookingStatus = 'scheduled' | 'confirmed' | 'completed' | 'failed_technical' | 'ended_early' | 'cancelled' | 'student_absent' | 'teacher_absent' | string;

interface Lesson {
  id: string;
  scheduledAt: Date;
  title: string;
  studentName: string;
  studentAge: number | null;
  /** Tab bucket this lesson belongs in. */
  status: 'upcoming' | 'completed' | 'needs-feedback';
  /** The real class_bookings.status, kept for the outcome badge. */
  rawStatus: BookingStatus;
  /** class_bookings.technical_fault_party — set when rawStatus is 'failed_technical'. */
  faultParty: 'teacher' | 'student' | 'both' | null;
  classroomId: string | null;
  studentId: string | null;
  hubType: string | null;
  /** The student's own post-class 👍/👎 (post_class_feedback), if given. */
  studentFeedback: { thumbsUp: boolean; suggestion: string | null } | null;
  /** Slot length in minutes (class_bookings.duration). */
  durationMin: number;
  /** The student's first-ever (free trial) lesson: its report is always required. */
  isTrial: boolean;
  /** The teacher reported a technical problem for this lesson, so no feedback report is needed. */
  techProblem: boolean;
  /** The teacher's own session report for this lesson, if submitted. */
  report: { rating: number | null; notes: string | null; outcome: string | null } | null;
}

/** Outcome badge for a lesson that has actually ended (Past / No Feedback
 *  tabs) — separate from the "Needs Feedback" flag, which is about whether a
 *  wrap-up report exists, not whether the lesson itself succeeded. */
const OutcomeBadge: React.FC<{ rawStatus: BookingStatus; faultParty: Lesson['faultParty']; techProblem?: boolean }> = ({ rawStatus, faultParty, techProblem }) => {
  if (rawStatus !== 'failed_technical' && techProblem) {
    return (
      <Badge className="text-xs bg-rose-100 text-rose-700 hover:bg-rose-100 border-rose-200">
        Technical issue — no report needed
      </Badge>
    );
  }
  if (rawStatus === 'failed_technical') {
    const who =
      faultParty === 'teacher' ? 'your side' : faultParty === 'student' ? "student's side" : faultParty === 'both' ? 'both sides' : 'unknown side';
    return (
      <Badge className="text-xs bg-rose-100 text-rose-700 hover:bg-rose-100 border-rose-200">
        Technical issue — {who}
      </Badge>
    );
  }
  if (rawStatus === 'student_absent') {
    return <Badge className="text-xs bg-orange-100 text-orange-700 hover:bg-orange-100 border-orange-200">Student no-show</Badge>;
  }
  if (rawStatus === 'teacher_absent') {
    return <Badge className="text-xs bg-purple-100 text-purple-700 hover:bg-purple-100 border-purple-200">Teacher no-show</Badge>;
  }
  if (rawStatus === 'scheduled' || rawStatus === 'confirmed') {
    // Slot is over but no session report yet — end_lesson hasn't run.
    return <Badge className="text-xs bg-sky-100 text-sky-700 hover:bg-sky-100 border-sky-200">Awaiting report</Badge>;
  }
  if (rawStatus === 'ended_early') {
    return <Badge className="text-xs bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200">Ended early</Badge>;
  }
  return <Badge className="text-xs bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200">Completed</Badge>;
};

interface LessonItemProps {
  lesson: Lesson;
  onOpenFeedback?: (lesson: Lesson) => void;
  onWriteFeedback?: (lesson: Lesson) => void;
  /** Upcoming lessons: open the classroom (only shown close to start). */
  onEnter?: (lesson: Lesson) => void;
}

/** Bookings that were called off — never shown as upcoming or needing a report. */
const NEVER_HAPPENED_STATUSES = new Set(['cancelled', 'canceled', 'rescheduled', 'refunded']);

/** First letter of the student's name, for the row avatar. */
const initial = (name: string) => (name.trim()[0] || '?').toUpperCase();

const LessonItem: React.FC<LessonItemProps> = ({ lesson, onOpenFeedback, onWriteFeedback, onEnter }) => {
  const handleRowClick = () => {
    if (lesson.status === 'completed') onOpenFeedback?.(lesson);
    else if (lesson.status === 'needs-feedback') onWriteFeedback?.(lesson);
  };
  const clickable = lesson.status === 'completed' || lesson.status === 'needs-feedback';
  // The lesson's hub colour (Playground orange, Academy violet, Success green).
  const hubColor = resolveCalendarColor(lesson.hubType);
  const end = new Date(lesson.scheduledAt.getTime() + lesson.durationMin * 60_000);
  const minsToStart = Math.round((lesson.scheduledAt.getTime() - Date.now()) / 60_000);
  const startingSoon = lesson.status === 'upcoming' && minsToStart <= 60 && minsToStart > -lesson.durationMin;
  const soonLabel = minsToStart <= 0 ? 'Happening now' : minsToStart < 60 ? `Starts in ${minsToStart} min` : 'Starts in 1 h';

  return (
    <div
      className={cn(
        'group relative flex items-center gap-3.5 overflow-hidden rounded-2xl border border-border/60 bg-card p-3.5 pl-5 shadow-sm transition-all duration-150 hover:-translate-y-px hover:shadow-md',
        clickable && 'cursor-pointer',
      )}
      onClick={handleRowClick}
    >
      {/* Hub-colour accent down the left edge */}
      <span className={cn('absolute inset-y-0 left-0 w-1.5', hubColor.card)} aria-hidden />

      <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-base font-extrabold text-white shadow-md', hubColor.card)}>
        {initial(lesson.studentName)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-bold text-foreground truncate">
            {lesson.studentName}{lesson.studentAge ? ` (${lesson.studentAge}y)` : ''}
          </p>
          {startingSoon && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white shadow-sm">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
              {soonLabel}
            </span>
          )}
          {lesson.isTrial && (
            <Badge className="text-xs bg-violet-100 text-violet-700 hover:bg-violet-100 border-violet-200">Trial</Badge>
          )}
          {(lesson.status === 'completed' || lesson.status === 'needs-feedback') && (
            <OutcomeBadge rawStatus={lesson.rawStatus} faultParty={lesson.faultParty} techProblem={lesson.techProblem} />
          )}
        </div>
        <p className="text-xs font-medium text-muted-foreground truncate">{lesson.title}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px] font-semibold">
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-foreground/80">
            <Calendar className="w-3 h-3" />
            {isToday(lesson.scheduledAt) ? 'Today' : format(lesson.scheduledAt, 'EEE, MMM d')}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-foreground/80">
            <Clock className="w-3 h-3" />
            {formatTimeRange(lesson.scheduledAt, end)}
          </span>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary">{lesson.durationMin} min</span>
        </div>

        {/* Feedback, both ways: the teacher's report and the student's 👍/👎. */}
        {(lesson.report || lesson.studentFeedback) && (
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            {lesson.report && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-amber-800 ring-1 ring-amber-200">
                <MessageSquare className="w-3 h-3" />
                Your report
                {lesson.report.rating ? <span aria-label={`${lesson.report.rating} of 5`}> · {'★'.repeat(lesson.report.rating)}{'☆'.repeat(5 - lesson.report.rating)}</span> : null}
              </span>
            )}
            {lesson.studentFeedback && (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 ring-1 ${lesson.studentFeedback.thumbsUp ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-rose-50 text-rose-700 ring-rose-200'}`}
                title={lesson.studentFeedback.suggestion ?? undefined}
              >
                Student: {lesson.studentFeedback.thumbsUp ? '👍' : '👎'}
              </span>
            )}
          </div>
        )}
        {lesson.report?.notes && (
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">📝 {lesson.report.notes}</p>
        )}
        {lesson.studentFeedback?.suggestion && (
          <p className="mt-1 text-xs italic text-rose-700 line-clamp-2">“{lesson.studentFeedback.suggestion}”</p>
        )}
      </div>

      {lesson.status === 'needs-feedback' && (
        <Button
          size="sm"
          className="gap-1.5 shrink-0 rounded-full bg-gradient-to-r from-primary to-violet-500 shadow-md shadow-primary/25 hover:brightness-110"
          onClick={(e) => { e.stopPropagation(); onWriteFeedback?.(lesson); }}
        >
          <MessageSquare className="w-4 h-4" />
          {lesson.isTrial ? 'Write trial report' : 'Write feedback'}
        </Button>
      )}

      {lesson.status === 'completed' && (
        <Button
          size="sm"
          variant="outline"
          className="gap-1 shrink-0 rounded-full"
          onClick={(e) => { e.stopPropagation(); onOpenFeedback?.(lesson); }}
        >
          View feedback
          <ChevronRight className="w-4 h-4" />
        </Button>
      )}

      {lesson.status === 'upcoming' && onEnter && (
        <Button
          size="sm"
          className="gap-1 shrink-0 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 px-5 shadow-md shadow-emerald-500/25 hover:brightness-110"
          onClick={(e) => { e.stopPropagation(); onEnter(lesson); }}
        >
          Enter
          <ChevronRight className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};

export const LessonsListCard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackLesson, setFeedbackLesson] = useState<Lesson | null>(null);
  const [wrapUpOpen, setWrapUpOpen] = useState(false);
  const [wrapUpLesson, setWrapUpLesson] = useState<Lesson | null>(null);
  const { user } = useAuth();

  const loadLessonsRef = React.useRef<() => Promise<void>>(async () => {});

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    // A lesson has genuinely ended once end_lesson()/end_lesson_service()/
    // mark_booking_ended_status() (or the classroom-incident-verdict edge
    // function) has stamped one of these terminal statuses — see the
    // classroom-lifecycle-status migration. 'ended_early' never needs a
    // wrap-up report (LessonWrapUpDialog.tsx is skipped for those sessions),
    // so it's excluded from the ENDED_NEEDING_REPORT set below.
    const ENDED_STATUSES = new Set(['completed', 'failed_technical', 'ended_early', 'student_absent', 'teacher_absent']);
    // A technical failure (either side) needs no feedback report — the lesson didn't happen. A trial
    // lesson that did happen always needs one, even if it ended early.
    const ENDED_NEEDING_REPORT = new Set(['completed']);
    const TECH_FLAGS = new Set(['teacher_tech_issue', 'student_tech_issue']);
    const NEVER_HAPPENED = NEVER_HAPPENED_STATUSES;

    const loadLessons = async () => {
      try {
        const { data, error } = await supabase
          .from('class_bookings')
          .select('id, classroom_id, scheduled_at, duration, ended_at, status, technical_fault_party, hub_type, notes, student_id, booking_type')
          .eq('teacher_id', user.id)
          .order('scheduled_at', { ascending: true });

        if (error) throw error;
        if (cancelled) return;

        const studentIds = Array.from(new Set((data ?? []).map((r: any) => r.student_id).filter(Boolean)));
        let studentMap: Record<string, { name: string }> = {};
        if (studentIds.length) {
          const { data: profiles } = await supabase
            .from('users')
            .select('id, full_name')
            .in('id', studentIds);
          studentMap = (profiles ?? []).reduce((acc: any, p: any) => {
            acc[p.id] = { name: p.full_name || 'Student' };
            return acc;
          }, {});
        }

        // Whether a wrap-up report already exists — the real signal for the
        // "No Feedback" tab, replacing the old 1-hour-past-scheduled-time
        // guess (which had nothing to do with whether the lesson actually
        // happened or how it ended).
        const bookingIds = (data ?? []).map((r: any) => r.id);
        let feedbackSet = new Set<string>();
        const reportMap = new Map<string, NonNullable<Lesson['report']>>();
        if (bookingIds.length) {
          const { data: fbs } = await supabase
            .from('lesson_feedback_submissions')
            .select('lesson_id, student_performance_rating, feedback_content, submitted_at')
            .in('lesson_id', bookingIds)
            .order('submitted_at', { ascending: true });
          feedbackSet = new Set((fbs ?? []).map((f: any) => f.lesson_id));
          for (const f of (fbs ?? []) as any[]) {
            let content: any = f.feedback_content;
            if (typeof content === 'string') { try { content = JSON.parse(content); } catch { content = null; } }
            reportMap.set(f.lesson_id, {
              rating: typeof f.student_performance_rating === 'number' && f.student_performance_rating > 0 ? f.student_performance_rating : null,
              notes: (content?.quick_notes && String(content.quick_notes).trim()) || null,
              outcome: content?.outcome ?? null,
            });
          }
        }

        // Lessons where the teacher said "a technical problem stopped it": no report is needed for those.
        const techSet = new Set<string>();
        if (bookingIds.length) {
          const { data: incidents } = await supabase
            .from('lesson_incident_reports')
            .select('room_id, flags, outcome')
            .in('room_id', bookingIds)
            .eq('reporter_id', user.id);
          for (const inc of (incidents ?? []) as { room_id: string; flags: string[] | null; outcome: string | null }[]) {
            if (inc.outcome === 'not_completed' && Array.isArray(inc.flags) && inc.flags.some((f) => TECH_FLAGS.has(f))) {
              techSet.add(inc.room_id);
            }
          }
        }

        // The student's 👍/👎 about each lesson (keyed by booking id).
        const studentFeedbackMap = new Map<string, Lesson['studentFeedback']>();
        if (bookingIds.length) {
          const { data: sfb } = await supabase
            .from('post_class_feedback')
            .select('lesson_id, thumbs_up, improvement_suggestion, submitted_by_role')
            .in('lesson_id', bookingIds)
            .eq('submitted_by_role', 'student');
          for (const f of (sfb ?? []) as any[]) {
            if (f.lesson_id && f.thumbs_up !== null) {
              studentFeedbackMap.set(f.lesson_id, { thumbsUp: !!f.thumbs_up, suggestion: f.improvement_suggestion ?? null });
            }
          }
        }

        const mapped: Lesson[] = (data ?? []).map((row: any) => {
          const scheduledAt = new Date(row.scheduled_at);
          const rawStatus: BookingStatus = row.status;
          let status: Lesson['status'] = 'upcoming';
          const isTrial = String(row.booking_type ?? '').toLowerCase() === 'trial';
          const techProblem = rawStatus === 'failed_technical' || techSet.has(row.id);
          if (ENDED_STATUSES.has(rawStatus)) {
            const needsReport = (ENDED_NEEDING_REPORT.has(rawStatus) || (isTrial && rawStatus === 'ended_early'))
              && !feedbackSet.has(row.id) && !techProblem;
            status = needsReport ? 'needs-feedback' : 'completed';
          } else if (!NEVER_HAPPENED.has(rawStatus)) {
            // Still 'scheduled'/'confirmed' but the teacher ended it (ended_at
            // stamped by End Class) or its slot is over: the booking only
            // flips to 'completed' when the session report is submitted
            // (end_lesson), so until then it belongs in "No Feedback" —
            // previously it vanished from every tab.
            const durationMin = Number(row.duration) > 0 ? Number(row.duration) : 30;
            const slotOver = scheduledAt.getTime() + (durationMin + 5) * 60_000 < Date.now();
            if (row.ended_at || slotOver) {
              status = feedbackSet.has(row.id) || techProblem ? 'completed' : 'needs-feedback';
            }
          }
          return {
            id: row.id,
            scheduledAt,
            title: row.notes || `${row.hub_type ? row.hub_type[0].toUpperCase() + row.hub_type.slice(1) + ' ' : ''}Lesson`,
            studentName: studentMap[row.student_id]?.name || 'Student',
            studentAge: null,
            status,
            rawStatus,
            faultParty: (row.technical_fault_party ?? null) as Lesson['faultParty'],
            classroomId: row.classroom_id ?? null,
            studentId: row.student_id ?? null,
            hubType: row.hub_type ?? null,
            studentFeedback: studentFeedbackMap.get(row.id) ?? null,
            isTrial,
            techProblem,
            report: reportMap.get(row.id) ?? null,
            durationMin: Number(row.duration) > 0 ? Number(row.duration) : 30,
          };
        });
        setLessons(mapped);
      } catch (err) {
        console.error('Failed to load lessons:', err);
        if (!cancelled) setLessons([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadLessonsRef.current = loadLessons;
    loadLessons();

    // Realtime: refetch when this teacher's bookings change so newly booked
    // lessons appear in "Next lesson" without a manual refresh.
    const channel = supabase
      .channel(`teacher-bookings-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'class_bookings',
          filter: `teacher_id=eq.${user.id}`,
        },
        () => {
          if (!cancelled) loadLessons();
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  // Most recent first.
  const byNewest = (a: Lesson, b: Lesson) => b.scheduledAt.getTime() - a.scheduledAt.getTime();
  // Upcoming: not cancelled and not over yet, soonest first.
  const nowMs = Date.now();
  const upcomingLessons = lessons
    .filter(l => l.status === 'upcoming' && !NEVER_HAPPENED_STATUSES.has(l.rawStatus)
      && l.scheduledAt.getTime() + l.durationMin * 60_000 > nowMs)
    .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime());
  const pastLessons = lessons.filter(l => l.status === 'completed').sort(byNewest);
  const needsFeedback = lessons.filter(l => l.status === 'needs-feedback').sort(byNewest);

  const handleOpenFeedback = (lesson: Lesson) => {
    setFeedbackLesson(lesson);
    setFeedbackOpen(true);
  };

  const handleWriteFeedback = (lesson: Lesson) => {
    // Open the wrap-up dialog directly from the dashboard
    setWrapUpLesson(lesson);
    setWrapUpOpen(true);
  };

  const handleWrapUpChange = (open: boolean) => {
    setWrapUpOpen(open);
    if (!open) {
      // Refresh after submission so the row moves from "No Feedback" to
      // "Past" — a full reload (same loadLessons the mount effect uses, via
      // loadLessonsRef) so the "does lesson_feedback_submissions exist yet"
      // check re-runs too, not just status.
      setWrapUpLesson(null);
      void loadLessonsRef.current();
    }
  };

  return (
    <Card className="overflow-hidden rounded-3xl border-border/60 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-violet-500 shadow-md shadow-primary/25">
              <History className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-base leading-tight">Lessons Details</CardTitle>
              <CardDescription className="text-xs mt-0.5">Your lesson history & feedback status</CardDescription>
            </div>
          </div>
          {needsFeedback.length > 0 && (
            <Badge variant="destructive" className="text-xs shrink-0">
              {needsFeedback.length} pending
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4 grid h-auto w-full grid-cols-3 rounded-2xl bg-muted/60 p-1">
            <TabsTrigger value="upcoming" className="gap-1.5 rounded-xl py-2 text-xs sm:text-sm data-[state=active]:bg-card data-[state=active]:font-bold data-[state=active]:shadow-sm">
              <Calendar className="w-3.5 h-3.5" />
              Upcoming ({upcomingLessons.length})
            </TabsTrigger>
            <TabsTrigger value="past" className="gap-1.5 rounded-xl py-2 text-xs sm:text-sm data-[state=active]:bg-card data-[state=active]:font-bold data-[state=active]:shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Past ({pastLessons.length})
            </TabsTrigger>
            <TabsTrigger value="feedback" className="gap-1.5 rounded-xl py-2 text-xs sm:text-sm data-[state=active]:bg-card data-[state=active]:font-bold data-[state=active]:shadow-sm">
              <MessageSquare className="w-3.5 h-3.5" />
              No Feedback ({needsFeedback.length})
            </TabsTrigger>
          </TabsList>

          {loading ? (
            <div className="flex items-center justify-center py-10 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              <span className="text-sm">Loading lessons…</span>
            </div>
          ) : (
            <>
              <TabsContent value="upcoming" className="space-y-2">
                {upcomingLessons.length > 0 ? (
                  upcomingLessons.map(lesson => (
                    <LessonItem
                      key={lesson.id}
                      lesson={lesson}
                      // Classroom opens from 15 min before the start.
                      onEnter={lesson.scheduledAt.getTime() - nowMs <= 15 * 60_000
                        ? (l) => navigate(`/classroom/${l.id}`)
                        : undefined}
                    />
                  ))
                ) : (
                  <EmptyState
                    icon={Calendar}
                    title="No upcoming classes"
                    description="New bookings will appear here as soon as a student books one of your slots."
                    compact
                  />
                )}
              </TabsContent>

              <TabsContent value="past" className="space-y-2">
                {pastLessons.length > 0 ? (
                  pastLessons.map(lesson => (
                    <LessonItem
                      key={lesson.id}
                      lesson={lesson}
                      onOpenFeedback={handleOpenFeedback}
                    />
                  ))
                ) : (
                  <EmptyState
                    icon={Clock}
                    title="No past lessons yet"
                    description="Completed lessons will be archived here for your records."
                    compact
                  />
                )}
              </TabsContent>

              <TabsContent value="feedback" className="space-y-2">
                {needsFeedback.length > 0 ? (
                  needsFeedback.map(lesson => (
                    <LessonItem
                      key={lesson.id}
                      lesson={lesson}
                      onWriteFeedback={handleWriteFeedback}
                    />
                  ))
                ) : (
                  <EmptyState
                    icon={MessageSquare}
                    title="All caught up!"
                    description="Every lesson has feedback. Great work mentoring your students."
                    compact
                  />
                )}
              </TabsContent>
            </>
          )}
        </Tabs>
      </CardContent>

      <FeedbackReportDialog
        open={feedbackOpen}
        onOpenChange={setFeedbackOpen}
        lessonId={feedbackLesson?.id ?? null}
        lessonTitle={feedbackLesson?.title}
        studentId={feedbackLesson?.studentId ?? null}
        viewerRole="teacher"
        hubType={feedbackLesson?.hubType}
      />

      <LessonWrapUpDialog
        open={wrapUpOpen}
        onOpenChange={handleWrapUpChange}
        lessonId={wrapUpLesson?.id}
        bookingId={wrapUpLesson?.id}
        studentId={wrapUpLesson?.studentId ?? undefined}
        teacherId={user?.id}
        hubType={wrapUpLesson?.hubType ?? undefined}
      />
    </Card>
  );
};
