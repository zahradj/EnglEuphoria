import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Mail, Copy, Check, UserPlus } from 'lucide-react';
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

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Invite a Student
          </DialogTitle>
          <DialogDescription>
            Book a lesson for a student by email. They'll get a join link — no password needed on their end.
          </DialogDescription>
        </DialogHeader>

        {!joinLink ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {(studentsLoading || students.length > 0) && (
              <div className="space-y-2">
                <Label>Choose one of your students</Label>
                <Select value={pickedStudentId} onValueChange={pickStudent} disabled={studentsLoading}>
                  <SelectTrigger aria-label="Choose one of your students">
                    <SelectValue placeholder={studentsLoading ? 'Loading your students…' : 'Pick a student — or type a new email below'} />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name && s.name !== s.email ? `${s.name} — ${s.email}` : s.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="student-email">Student email</Label>
              <Input
                id="student-email"
                type="email"
                placeholder="student@example.com"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                required
              />
              {who?.kind === 'new' && (
                <p className="text-xs text-muted-foreground">
                  New student — an account is created for them. Their progress starts from this first lesson.
                </p>
              )}
              {who?.kind === 'student' && (
                <p className="text-xs text-muted-foreground">
                  Existing student{who.firstName ? ` (${who.firstName})` : ''} — the lesson appears on their dashboard next to their progress.
                </p>
              )}
              {parentWithoutChildren && (
                <p className="text-xs text-destructive">
                  This is a parent account with no children added yet. Ask them to add their child from the family dashboard first.
                </p>
              )}
              {who?.kind === 'parent' && who.children.length > 0 && (
                <div className="space-y-2 rounded-lg border bg-muted/30 p-3" role="radiogroup" aria-label="Which child is the lesson for?">
                  <p className="text-xs font-medium">Parent account — who is this lesson for?</p>
                  <div className="flex flex-wrap gap-2">
                    {who.children.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        role="radio"
                        aria-checked={childId === c.id}
                        onClick={() => setChildId(c.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${childId === c.id ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-foreground border-border hover:bg-muted'}`}
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
            <div className="space-y-2">
              <Label htmlFor="student-name">Student name (optional)</Label>
              <Input
                id="student-name"
                type="text"
                placeholder="Amina"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="lesson-date">Date</Label>
                <Input id="lesson-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lesson-time">Time</Label>
                <Input id="lesson-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Booking</Label>
              <div className="inline-flex rounded-lg bg-muted p-1" role="radiogroup" aria-label="One lesson or every week">
                {([
                  { id: 'single', label: 'One lesson' },
                  { id: 'weekly', label: 'Every week' },
                ] as const).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    role="radio"
                    aria-checked={weeklyOn ? opt.id === 'weekly' : opt.id === 'single'}
                    disabled={opt.id === 'weekly' && lessonType === 'trial'}
                    onClick={() => setMode(opt.id)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all disabled:opacity-50 ${(weeklyOn ? opt.id === 'weekly' : opt.id === 'single') ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {lessonType === 'trial' && (
                <p className="text-xs text-muted-foreground">A trial lesson is a single class. Book a regular lesson to repeat it weekly.</p>
              )}
              {weeklyOn && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">For</span>
                    {WEEK_CHOICES.map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setWeeks(n)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${weeks === n ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-foreground border-border hover:bg-muted'}`}
                      >
                        {n} weeks
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {weeks} lessons are booked now, one every {weeklyDayLabel} at {time || 'the chosen time'}, starting {date || 'on the chosen date'}.
                    Each one shows on the student's dashboard.
                  </p>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Lesson type</Label>
              <div className="inline-flex rounded-lg bg-muted p-1">
                {([
                  { id: 'regular', label: 'Regular lesson' },
                  { id: 'trial', label: 'Trial lesson' },
                ] as const).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setLessonType(opt.id)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${lessonType === opt.id ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {lessonType === 'trial' && (
                <p className="text-xs text-muted-foreground">
                  The student's first class: it opens Unit 1 Lesson 1, and you set their level and prior knowledge in class.
                  Saved to their profile and learning path.
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Hub</Label>
              {/* Explicit per-lesson choice — a teacher's profile can be
                  assigned to more than one hub, so it can't reliably stand
                  in for which hub *this* lesson is for. Duration follows
                  the pick (Playground 30 min, Academy/Success 60 min). */}
              <div className="inline-flex rounded-lg bg-muted p-1">
                {HUB_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedHub(opt.id)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${selectedHub === opt.id ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {selectedHub === 'playground' && lessonType !== 'trial' ? (
                <div className="flex items-center gap-2">
                  {([false, true] as const).map((hour) => (
                    <button
                      key={String(hour)}
                      type="button"
                      onClick={() => setPlaygroundHour(hour)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${playgroundHour === hour ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-foreground border-border hover:bg-muted'}`}
                    >
                      {hour ? '1 hour' : '30 minutes'}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">{duration}-minute lesson</p>
              )}
            </div>
            <DialogFooter>
              <Button type="submit" disabled={busy || needsChild || parentWithoutChildren} className="w-full">
                {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Mail className="h-4 w-4 mr-2" />}
                {lessonType === 'trial' ? 'Book Trial & Send Invite' : 'Book & Send Invite'}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="space-y-4">
            {weeklySummary && (
              <p className={`text-sm ${weeklySummary.known && weeklySummary.failed === 0 ? 'text-foreground' : 'text-destructive'}`}>
                {!weeklySummary.known
                  ? 'Only the first lesson was booked — the weekly booking is not available yet.'
                  : weeklySummary.failed === 0
                    ? `${weeklySummary.booked + 1} lessons booked, one every ${weeklyDayLabel} at ${time}. They all show on the student's dashboard.`
                    : `${weeklySummary.booked + 1} of ${weeklySummary.wanted + 1} lessons booked; ${weeklySummary.failed} could not be booked.`}
                {' '}The link below opens the first lesson.
              </p>
            )}
            <div className="rounded-lg border bg-muted/40 p-3 text-sm break-all">{joinLink}</div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1" onClick={handleCopy}>
                {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                {copied ? 'Copied' : 'Copy link'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() =>
                  window.open(`https://wa.me/?text=${encodeURIComponent(`Join your English lesson here: ${joinLink}`)}`, '_blank')
                }
              >
                Share via WhatsApp
              </Button>
            </div>
            <Button type="button" className="w-full" onClick={() => handleClose(false)}>
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
