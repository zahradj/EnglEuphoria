import React, { useState } from 'react';
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

interface InviteStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacherId: string;
  hub: 'playground' | 'academy' | 'success';
  defaultDuration?: number;
  onInvited?: () => void;
}

export const InviteStudentDialog: React.FC<InviteStudentDialogProps> = ({
  open,
  onOpenChange,
  teacherId,
  hub,
  defaultDuration = 60,
  onInvited,
}) => {
  const { toast } = useToast();
  const [studentEmail, setStudentEmail] = useState('');
  const [studentName, setStudentName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState(defaultDuration);
  const [busy, setBusy] = useState(false);
  const [joinLink, setJoinLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const reset = () => {
    setStudentEmail('');
    setStudentName('');
    setDate('');
    setTime('');
    setDuration(defaultDuration);
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
          duration,
          hub,
        },
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setJoinLink(data.joinLink);
      toast({
        title: 'Lesson booked ✅',
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
              <Label>Duration</Label>
              {/* 30/60 only — matches the calendar grid's own slot durations
                  (teacher_availability has a CHECK constraint enforcing this). */}
              <div className="inline-flex rounded-lg bg-muted p-1">
                <button
                  type="button"
                  onClick={() => setDuration(30)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${duration === 30 ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  30 min
                </button>
                <button
                  type="button"
                  onClick={() => setDuration(60)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${duration === 60 ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  60 min
                </button>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={busy} className="w-full">
                {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Mail className="h-4 w-4 mr-2" />}
                Book & Send Invite
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
