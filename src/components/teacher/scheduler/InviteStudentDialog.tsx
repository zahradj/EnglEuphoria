import React, { useEffect, useRef, useState } from 'react';
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
import { format } from 'date-fns';
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

/** An upcoming open slot of this teacher, offered as a one-tap way to fill the date and time. */
interface OpenSlotChoice {
  id: string;
  start: Date;
  duration: 30 | 60;
  hub: HubChoice;
}

const MAX_SLOT_CHOICES = 12;

const hubFromRow = (raw: string | null, duration: 30 | 60): HubChoice => {
  const v = String(raw ?? '').toLowerCase();
  if (v.includes('playground')) return 'playground';
  if (v.includes('success') || v.includes('professional')) return 'success';
  if (v.includes('academy')) return 'academy';
  return duration === 30 ? 'playground' : 'academy';
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
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [selectedHub, setSelectedHub] = useState<HubChoice>(hub);
  const [lessonType, setLessonType] = useState<'regular' | 'trial'>('regular');
  const [busy, setBusy] = useState(false);
  const [joinLink, setJoinLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
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

  // ── One-tap pickers: the teacher's own students, and their open slots ──
  const { students, loading: studentsLoading } = useTeacherStudents();
  const [openSlots, setOpenSlots] = useState<OpenSlotChoice[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const autoFilled = useRef(false);

  const applySlot = (slot: OpenSlotChoice) => {
    setDate(format(slot.start, 'yyyy-MM-dd'));
    setTime(format(slot.start, 'HH:mm'));
    setSelectedHub(slot.hub);
    setPlaygroundHour(slot.hub === 'playground' && slot.duration === 60);
  };

  useEffect(() => {
    if (!open || !teacherId) return;
    autoFilled.current = false;
    let cancelled = false;
    setSlotsLoading(true);
    (async () => {
      const { data, error } = await supabase
        .from('teacher_availability')
        .select('id, start_time, duration, hub_specialty')
        .eq('teacher_id', teacherId)
        .eq('is_booked', false)
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })
        .limit(MAX_SLOT_CHOICES);
      if (cancelled) return;
      setSlotsLoading(false);
      if (error || !data) return; // the pickers are a convenience - typing a date and time still works
      setOpenSlots(
        data.map((r) => {
          const dur: 30 | 60 = (r.duration ?? 30) >= 55 ? 60 : 30;
          return { id: r.id, start: new Date(r.start_time), duration: dur, hub: hubFromRow(r.hub_specialty, dur) };
        }),
      );
    })();
    return () => { cancelled = true; };
  }, [open, teacherId]);

  // Fill the date and time automatically with the next open slot, unless the teacher already typed one.
  useEffect(() => {
    if (!open || autoFilled.current || openSlots.length === 0) return;
    autoFilled.current = true;
    if (date || time) return;
    applySlot(openSlots[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, openSlots]);

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
    setDate('');
    setTime('');
    setSelectedHub(hub);
    setLessonType('regular');
    setPlaygroundHour(false);
    setWho(null);
    setChildId(null);
    setJoinLink(null);
    setCopied(false);
  };

  const handleClose = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

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
      toast({
        title: lessonType === 'trial' ? 'Trial lesson booked ✅' : 'Lesson booked ✅',
        description: data.emailSent
          ? `An invite email was sent to ${studentEmail}.`
          : `Booked, but the invite email could not be sent — share the link below manually.`,
      });
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
            {(slotsLoading || openSlots.length > 0) && (
              <div className="space-y-2">
                <Label>Your open slots — tap one to fill the date and time</Label>
                {slotsLoading && openSlots.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Loading your open slots…</p>
                ) : (
                  <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Open slots">
                    {openSlots.map((slot) => {
                      const active = date === format(slot.start, 'yyyy-MM-dd') && time === format(slot.start, 'HH:mm');
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          onClick={() => applySlot(slot)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${active ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-foreground border-border hover:bg-muted'}`}
                        >
                          {format(slot.start, 'EEE d MMM · HH:mm')} · {slot.duration} min
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
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
