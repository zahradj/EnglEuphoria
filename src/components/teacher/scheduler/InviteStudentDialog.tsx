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
import { Loader2, Mail, Copy, Check, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

type HubChoice = 'playground' | 'academy' | 'success';

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

  const reset = () => {
    setStudentEmail('');
    setStudentName('');
    setDate('');
    setTime('');
    setSelectedHub(hub);
    setLessonType('regular');
    setPlaygroundHour(false);
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
              <Button type="submit" disabled={busy} className="w-full">
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
