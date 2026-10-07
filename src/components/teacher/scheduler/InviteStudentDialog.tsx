import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarDays, Check, CheckCircle2, Clock, Copy, GraduationCap, Loader2, Mail, MessageCircle, Repeat, UserPlus, UserRound } from 'lucide-react';
import { addDays, addMinutes, format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useTeacherStudents } from '@/hooks/useTeacherStudents';
import { supabase } from '@/integrations/supabase/client';

type HubChoice = 'playground' | 'academy' | 'success';

type EmailLookup =
  | { kind: 'new' }
  | { kind: 'student'; firstName: string | null }
  | { kind: 'parent'; children: { id: string; firstName: string; hub: string | null }[] };

interface InviteStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacherId: string;
  /** Best-guess default from the teacher's own profile — the picker below
   * lets them override it per lesson, since a combined academy+success
   * mentor's profile can't express "this specific lesson is Success." */
  hub: HubChoice;
  onInvited?: () => void;
}

const HUB_OPTIONS: { id: HubChoice; label: string; duration: 30 | 60 }[] = [
  { id: 'playground', label: 'Playground', duration: 30 },
  { id: 'academy', label: 'Academy', duration: 60 },
  { id: 'success', label: 'Success', duration: 60 },
];

/** Each hub keeps its own colour, so the card tells the teacher at a glance which hub the lesson is for. */
const HUB_THEME: Record<HubChoice, { emoji: string; header: string; tile: string; button: string; active: string }> = {
  playground: {
    emoji: '🎈',
    header: 'from-amber-100 via-orange-50 to-rose-50',
    tile: 'from-amber-400 to-orange-500',
    button: 'from-amber-500 to-orange-500',
    active: 'border-orange-400 bg-orange-50 text-orange-700 ring-2 ring-orange-200',
  },
  academy: {
    emoji: '🎓',
    header: 'from-violet-100 via-purple-50 to-fuchsia-50',
    tile: 'from-violet-500 to-fuchsia-500',
    button: 'from-violet-500 to-fuchsia-500',
    active: 'border-violet-400 bg-violet-50 text-violet-700 ring-2 ring-violet-200',
  },
  success: {
    emoji: '🚀',
    header: 'from-emerald-100 via-teal-50 to-cyan-50',
    tile: 'from-emerald-500 to-teal-500',
    button: 'from-emerald-500 to-teal-500',
    active: 'border-emerald-400 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-200',
  },
};

/** A titled block of the form, drawn as a soft card. */
const FormSection: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
    <h3 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
      {icon}
      {title}
    </h3>
    {children}
  </section>
);

/** One lesson, or the same lesson every week (booked up front, so each one shows on the student's dashboard). */
type BookingMode = 'single' | 'weekly';
const WEEK_CHOICES = [4, 8, 12] as const;

/** Today's date, and the next half hour, in the teacher's own clock - what a new invite starts from. */
const startingPoint = () => {
  const now = new Date();
  const next = addMinutes(now, 30 - (now.getMinutes() % 30));
  next.setSeconds(0, 0);
  return { date: format(now, 'yyyy-MM-dd'), time: format(next, 'HH:mm') };
};

export const InviteStudentDialog: React.FC<InviteStudentDialogProps> = ({
  open,
  onOpenChange,
  teacherId,
  hub,
  onInvited,
}) => {
  const { toast } = useToast();
  const [studentEmail, setStudentEmail] = useState('');
  const [studentName, setStudentName] = useState('');
  const [date, setDate] = useState(() => startingPoint().date);
  const [time, setTime] = useState(() => startingPoint().time);
  const [mode, setMode] = useState<BookingMode>('single');
  const [weeks, setWeeks] = useState<(typeof WEEK_CHOICES)[number]>(12);
  const [selectedHub, setSelectedHub] = useState<HubChoice>(hub);
  const [lessonType, setLessonType] = useState<'regular' | 'trial'>('regular');
  const [busy, setBusy] = useState(false);
  const [joinLink, setJoinLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  // What the server says about the later weekly lessons (shown on the confirmation screen).
  const [weeklySummary, setWeeklySummary] = useState<{ wanted: number; booked: number; failed: number; known: boolean } | null>(null);
  // What this email belongs to (asked of the server once the address looks complete).
  const [who, setWho] = useState<EmailLookup | null>(null);
  const [childId, setChildId] = useState<string | null>(null);

  useEffect(() => {
    const email = studentEmail.trim().toLowerCase();
    setWho(null);
    setChildId(null);
    if (!open || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const { data } = await supabase.functions.invoke('classroom-invite', {
          body: { action: 'lookup', studentEmail: email },
        });
        if (cancelled || !data?.kind) return;
        setWho(data as EmailLookup);
        // One child: no choice to make.
        if (data.kind === 'parent' && data.children?.length === 1) setChildId(data.children[0].id);
      } catch {
        /* the hint is optional - booking still works and the server re-checks everything */
      }
    }, 450);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [studentEmail, open]);

  const needsChild = who?.kind === 'parent' && who.children.length > 0 && !childId;
  const parentWithoutChildren = who?.kind === 'parent' && who.children.length === 0;

  // Duration follows the hub, matching the app-wide rule (Playground = 30
  // min, Academy/Success = 60 min) rather than a separately pickable value.
  // Playground defaults to 30 minutes but a teacher can invite for a full hour
  // (two back-to-back 30-minute slots).
  const [playgroundHour, setPlaygroundHour] = useState(false);
  const duration =
    selectedHub === 'playground' && playgroundHour && lessonType !== 'trial'
      ? 60
      : (HUB_OPTIONS.find((h) => h.id === selectedHub)?.duration ?? 60);

  // Re-sync the default each time the dialog opens — `hub` can still be
  // loading (or change) at the moment this component first mounts, before
  // the teacher has touched anything.
  useEffect(() => {
    if (open) setSelectedHub(hub);
  }, [open, hub]);

  // ── One-tap picker: the teacher's own students ──
  const { students, loading: studentsLoading } = useTeacherStudents();

  // Each time the dialog opens, start from today and the next half hour (the teacher can change both).
  useEffect(() => {
    if (!open) return;
    const start = startingPoint();
    setDate(start.date);
    setTime(start.time);
  }, [open]);

  const pickedStudentId =
    students.find((s) => s.email.toLowerCase() === studentEmail.trim().toLowerCase())?.id ?? '';
  const pickStudent = (id: string) => {
    const s = students.find((x) => x.id === id);
    if (!s) return;
    setStudentEmail(s.email);
    setStudentName(s.name && s.name !== s.email ? s.name : '');
  };

  const reset = () => {
    setStudentEmail('');
    setStudentName('');
    const start = startingPoint();
    setDate(start.date);
    setTime(start.time);
    setMode('single');
    setWeeks(12);
    setSelectedHub(hub);
    setLessonType('regular');
    setPlaygroundHour(false);
    setWho(null);
    setChildId(null);
    setJoinLink(null);
    setCopied(false);
    setWeeklySummary(null);
  };

  const handleClose = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  // Weekly only applies to a regular lesson; a trial is always a single class.
  const weeklyOn = mode === 'weekly' && lessonType !== 'trial';
  const weeklyDayLabel = (() => {
    const d = new Date(`${date}T12:00`);
    return Number.isNaN(d.getTime()) ? 'week' : format(d, 'EEEE');
  })();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentEmail || !date || !time) {
      toast({ title: 'Missing details', description: 'Student email, date, and time are required.', variant: 'destructive' });
      return;
    }
    if (needsChild || parentWithoutChildren) {
      toast({ title: 'Choose a child', description: 'This email is a parent account. Pick which child the lesson is for.', variant: 'destructive' });
      return;
    }
    const scheduledAt = new Date(`${date}T${time}`);
    if (Number.isNaN(scheduledAt.getTime())) {
      toast({ title: 'Invalid date/time', variant: 'destructive' });
      return;
    }
    if (scheduledAt.getTime() < Date.now()) {
      toast({ title: 'That time has already passed', description: 'Pick a time later today, or another day.', variant: 'destructive' });
      return;
    }
    // Every later lesson of a weekly booking, exactly one week apart on the teacher's own clock
    // (addDays keeps the local hour across a clock change).
    const laterLessons = weeklyOn
      ? Array.from({ length: weeks - 1 }, (_, i) => addDays(scheduledAt, 7 * (i + 1)).toISOString())
      : [];

    setBusy(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) throw new Error('Your session expired — please sign in again.');

      const { data, error } = await supabase.functions.invoke('classroom-invite', {
        body: {
          action: 'create_booking_and_invite',
          studentEmail: studentEmail.trim(),
          studentName: studentName.trim() || undefined,
          scheduledAt: scheduledAt.toISOString(),
          // The edge function runs on Deno (defaults to UTC) and has no
          // other way to know what "9pm" meant to this teacher — without
          // this, the confirmation email showed the UTC hour instead of
          // the local time actually picked above.
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          duration,
          hub: selectedHub,
          lessonType,
          childId: childId ?? undefined,
          weeklyScheduledAt: laterLessons.length > 0 ? laterLessons : undefined,
        },
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (error) {
        // supabase-js hides the function's JSON body behind a generic
        // "non-2xx status code" message — pull out the real reason.
        let detail = '';
        try {
          const body = await (error as any).context?.json?.();
          detail = typeof body?.error === 'string' ? body.error : '';
        } catch { /* body wasn't JSON — fall through to generic message */ }
        throw new Error(detail || error.message);
      }
      if (data?.error) throw new Error(data.error);

      setJoinLink(data.joinLink);
      const emailNote = data.emailSent
        ? `An invite email was sent to ${studentEmail}.`
        : `The invite email could not be sent — share the link below manually.`;
      if (laterLessons.length > 0) {
        // An older server ignores the weekly dates and books just the first lesson - say so rather
        // than let the teacher believe the whole series is booked.
        const known = typeof data.weeklyBooked === 'number';
        const booked = known ? data.weeklyBooked : 0;
        const failed = known && typeof data.weeklyFailed === 'number' ? data.weeklyFailed : 0;
        setWeeklySummary({ wanted: laterLessons.length, booked, failed, known });
        if (!known) {
          toast({
            title: 'Only the first lesson was booked',
            description: 'The booking service has not been updated for weekly lessons yet. ' + emailNote,
            variant: 'destructive',
          });
        } else if (booked === laterLessons.length) {
          toast({ title: `${booked + 1} weekly lessons booked ✅`, description: emailNote });
        } else {
          toast({
            title: `${booked + 1} of ${laterLessons.length + 1} weekly lessons booked`,
            description: `${failed} could not be booked. ${emailNote}`,
            variant: 'destructive',
          });
        }
      } else {
        toast({
          title: lessonType === 'trial' ? 'Trial lesson booked ✅' : 'Lesson booked ✅',
          description: emailNote,
        });
      }
      onInvited?.();
    } catch (err: any) {
      toast({ title: 'Could not create invite', description: err?.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  const handleCopy = async () => {
    if (!joinLink) return;
    try {
      await navigator.clipboard.writeText(joinLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: 'Could not copy link', variant: 'destructive' });
    }
  };

  const theme = HUB_THEME[selectedHub];
  const segment = (active: boolean) =>
    `flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all disabled:opacity-50 ${active ? 'bg-background text-foreground shadow-sm ring-1 ring-border' : 'text-muted-foreground hover:text-foreground'}`;
  const summaryDay = (() => {
    const d = new Date(`${date}T12:00`);
    return Number.isNaN(d.getTime()) ? 'Pick a date' : format(d, 'EEE d MMM');
  })();
  const summary = [
    summaryDay,
    time || 'pick a time',
    `${duration} min`,
    HUB_OPTIONS.find((h) => h.id === selectedHub)?.label,
    weeklyOn ? `every week for ${weeks} weeks` : null,
  ].filter(Boolean).join(' · ');

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="flex max-h-[92vh] flex-col gap-0 overflow-hidden rounded-3xl p-0 sm:max-w-lg">
        <div className={`bg-gradient-to-br ${theme.header} px-6 pb-5 pt-6`}>
          <DialogHeader className="space-y-1.5 text-left">
            <DialogTitle className="flex items-center gap-3 text-xl font-extrabold tracking-tight">
              <span className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${theme.tile} text-white shadow-md`}>
                <UserPlus className="h-5 w-5" />
              </span>
              Invite a student
            </DialogTitle>
            <DialogDescription className="text-[13px] leading-relaxed">
              Book a lesson by email. They get a join link — no password needed on their end.
            </DialogDescription>
          </DialogHeader>
        </div>

        {!joinLink ? (
          <>
            <form id="invite-student-form" onSubmit={handleSubmit} className="flex-1 space-y-3 overflow-y-auto px-6 py-5">
              <FormSection icon={<UserRound className="h-3.5 w-3.5" />} title="Student">
                {(studentsLoading || students.length > 0) && (
                  <Select value={pickedStudentId} onValueChange={pickStudent} disabled={studentsLoading}>
                    <SelectTrigger aria-label="Choose one of your students" className="h-11 rounded-xl">
                      <SelectValue placeholder={studentsLoading ? 'Loading your students…' : 'Pick one of your students — or type a new email'} />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((st) => (
                        <SelectItem key={st.id} value={st.id}>
                          {st.name && st.name !== st.email ? `${st.name} — ${st.email}` : st.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <div className="space-y-1.5">
                  <Label htmlFor="student-email" className="flex items-center gap-1.5 text-xs">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" /> Student email
                  </Label>
                  <Input
                    id="student-email"
                    type="email"
                    placeholder="student@example.com"
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    className="h-11 rounded-xl"
                    required
                  />
                  {who?.kind === 'new' && (
                    <p className="rounded-lg bg-sky-50 px-3 py-2 text-xs text-sky-700">
                      New student — an account is created for them. Their progress starts from this first lesson.
                    </p>
                  )}
                  {who?.kind === 'student' && (
                    <p className="rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                      Existing student{who.firstName ? ` (${who.firstName})` : ''} — the lesson appears on their dashboard next to their progress.
                    </p>
                  )}
                  {parentWithoutChildren && (
                    <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
                      This is a parent account with no children added yet. Ask them to add their child from the family dashboard first.
                    </p>
                  )}
                  {who?.kind === 'parent' && who.children.length > 0 && (
                    <div className="space-y-2 rounded-xl border bg-muted/30 p-3" role="radiogroup" aria-label="Which child is the lesson for?">
                      <p className="text-xs font-semibold">Parent account — who is this lesson for?</p>
                      <div className="flex flex-wrap gap-2">
                        {who.children.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            role="radio"
                            aria-checked={childId === c.id}
                            onClick={() => setChildId(c.id)}
                            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${childId === c.id ? theme.active : 'border-border bg-background text-foreground hover:bg-muted'}`}
                          >
                            {c.firstName}
                          </button>
                        ))}
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        The invite email goes to the parent; the link opens the child's own classroom.
                      </p>
                    </div>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="student-name" className="text-xs">Student name <span className="font-normal text-muted-foreground">(optional)</span></Label>
                  <Input
                    id="student-name"
                    type="text"
                    placeholder="Amina"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="h-11 rounded-xl"
                  />
                </div>
              </FormSection>

              <FormSection icon={<CalendarDays className="h-3.5 w-3.5" />} title="When">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="lesson-date" className="flex items-center gap-1.5 text-xs">
                      <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" /> Date
                    </Label>
                    <Input id="lesson-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-11 rounded-xl" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="lesson-time" className="flex items-center gap-1.5 text-xs">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" /> Time
                    </Label>
                    <Input id="lesson-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} className="h-11 rounded-xl" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex gap-1 rounded-xl bg-muted p-1" role="radiogroup" aria-label="One lesson or every week">
                    {([
                      { id: 'single', label: 'One lesson', icon: <CalendarDays className="h-3.5 w-3.5" /> },
                      { id: 'weekly', label: 'Every week', icon: <Repeat className="h-3.5 w-3.5" /> },
                    ] as const).map((opt) => {
                      const active = weeklyOn ? opt.id === 'weekly' : opt.id === 'single';
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          disabled={opt.id === 'weekly' && lessonType === 'trial'}
                          onClick={() => setMode(opt.id)}
                          className={segment(active)}
                        >
                          {opt.icon}
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                  {lessonType === 'trial' && (
                    <p className="text-xs text-muted-foreground">A trial lesson is a single class. Book a regular lesson to repeat it weekly.</p>
                  )}
                  {weeklyOn && (
                    <div className="space-y-2 rounded-xl bg-muted/40 p-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground">For</span>
                        {WEEK_CHOICES.map((n) => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setWeeks(n)}
                            className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${weeks === n ? theme.active : 'border-border bg-background text-foreground hover:bg-muted'}`}
                          >
                            {n} weeks
                          </button>
                        ))}
                      </div>
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        {weeks} lessons are booked now, one every {weeklyDayLabel} at {time || 'the chosen time'}, starting {date || 'on the chosen date'}.
                        Each one shows on the student's dashboard.
                      </p>
                    </div>
                  )}
                </div>
              </FormSection>

              <FormSection icon={<GraduationCap className="h-3.5 w-3.5" />} title="Lesson">
                <div className="flex gap-1 rounded-xl bg-muted p-1" role="radiogroup" aria-label="Lesson type">
                  {([
                    { id: 'regular', label: 'Regular lesson' },
                    { id: 'trial', label: 'Trial lesson' },
                  ] as const).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      role="radio"
                      aria-checked={lessonType === opt.id}
                      onClick={() => setLessonType(opt.id)}
                      className={segment(lessonType === opt.id)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                {lessonType === 'trial' && (
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    The student's first class: it opens Unit 1 Lesson 1, and you set their level and prior knowledge in class.
                    Saved to their profile and learning path.
                  </p>
                )}
                {/* Explicit per-lesson choice — a teacher's profile can be assigned to more than one hub, so it
                    can't reliably stand in for which hub *this* lesson is for. Duration follows the pick
                    (Playground 30 min, Academy/Success 60 min). */}
                <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Hub">
                  {HUB_OPTIONS.map((opt) => {
                    const active = selectedHub === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => setSelectedHub(opt.id)}
                        className={`flex flex-col items-center gap-0.5 rounded-xl border px-2 py-2.5 text-xs font-semibold transition-all ${active ? HUB_THEME[opt.id].active : 'border-border bg-background text-muted-foreground hover:bg-muted'}`}
                      >
                        <span className="text-lg leading-none">{HUB_THEME[opt.id].emoji}</span>
                        {opt.label}
                        <span className="text-[10px] font-medium opacity-70">{opt.duration} min</span>
                      </button>
                    );
                  })}
                </div>
                {selectedHub === 'playground' && lessonType !== 'trial' ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground">Length</span>
                    {([false, true] as const).map((hour) => (
                      <button
                        key={String(hour)}
                        type="button"
                        onClick={() => setPlaygroundHour(hour)}
                        className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${playgroundHour === hour ? theme.active : 'border-border bg-background text-foreground hover:bg-muted'}`}
                      >
                        {hour ? '1 hour' : '30 minutes'}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">{duration}-minute lesson</p>
                )}
              </FormSection>
            </form>

            <div className="space-y-3 border-t bg-background px-6 py-4">
              <p className="flex items-center justify-center gap-2 rounded-full bg-muted/60 px-4 py-2 text-xs font-semibold text-foreground">
                <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                {summary}
              </p>
              <Button
                type="submit"
                form="invite-student-form"
                disabled={busy || needsChild || parentWithoutChildren}
                className={`h-12 w-full rounded-xl bg-gradient-to-r ${theme.button} text-sm font-bold text-white shadow-md transition hover:opacity-95`}
              >
                {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                {lessonType === 'trial' ? 'Book trial & send invite' : weeklyOn ? `Book ${weeks} weekly lessons & send invite` : 'Book & send invite'}
              </Button>
            </div>
          </>
        ) : (
          <div className="space-y-4 px-6 py-6">
            <div className="flex flex-col items-center gap-2 text-center">
              <span className={`flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br ${theme.tile} text-white shadow-lg`}>
                <CheckCircle2 className="h-7 w-7" />
              </span>
              <p className="text-lg font-extrabold tracking-tight">
                {lessonType === 'trial' ? 'Trial lesson booked' : weeklySummary?.known ? `${weeklySummary.booked + 1} lessons booked` : 'Lesson booked'}
              </p>
              {weeklySummary && (
                <p className={`text-sm ${weeklySummary.known && weeklySummary.failed === 0 ? 'text-muted-foreground' : 'text-destructive'}`}>
                  {!weeklySummary.known
                    ? 'Only the first lesson was booked — the weekly booking is not available yet.'
                    : weeklySummary.failed === 0
                      ? `One every ${weeklyDayLabel} at ${time}. They all show on the student's dashboard.`
                      : `${weeklySummary.booked + 1} of ${weeklySummary.wanted + 1} booked; ${weeklySummary.failed} could not be booked.`}
                </p>
              )}
              <p className="text-xs text-muted-foreground">The link below opens the first lesson.</p>
            </div>
            <div className="break-all rounded-xl border bg-muted/40 p-3 text-sm">{joinLink}</div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" className="h-11 flex-1 rounded-xl" onClick={handleCopy}>
                {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                {copied ? 'Copied' : 'Copy link'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-11 flex-1 rounded-xl"
                onClick={() =>
                  window.open(`https://wa.me/?text=${encodeURIComponent(`Join your English lesson here: ${joinLink}`)}`, '_blank')
                }
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                WhatsApp
              </Button>
            </div>
            <Button type="button" className={`h-11 w-full rounded-xl bg-gradient-to-r ${theme.button} font-bold text-white`} onClick={() => handleClose(false)}>
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
