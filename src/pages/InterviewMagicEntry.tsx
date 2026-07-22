/**
 * InterviewMagicEntry — magic-link entry for `/interview/:token`.
 *
 * Flow:
 *  1. Validate token via `interview-token-auth` (service role).
 *  2. If `scheduled_at` is null → render the Calendly-style slot picker.
 *  3. Otherwise → show a "booked" confirmation screen with two actions:
 *       • "Enter classroom" — bootstraps the room and navigates in.
 *       • "Cancel & reschedule" — releases the slot, returns to picker
 *         (capped at 2 reschedules per invitation).
 *
 * The token IS the credential. No password screen.
 */
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, ShieldAlert, CalendarCheck, DoorOpen, RotateCcw, Sparkles, GraduationCap, Briefcase } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import InterviewSlotPicker from '@/pages/interview/InterviewSlotPicker';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

interface InterviewMeta {
  id: string;
  application_id: string;
  admin_id: string | null;
  applicant_user_id: string | null;
  teacher_email: string | null;
  teacher_name: string | null;
  mock_lesson_key: string | null;
  hub_type: string | null;
  status: string;
  classroom_session_id: string | null;
  scheduled_at: string | null;
  duration_minutes: number | null;
  reschedule_count?: number;
  remaining_reschedules?: number;
}

async function callTokenAuth(
  token: string,
  action: 'lookup' | 'bind_session' | 'bootstrap_room' | 'create_guest_session' | 'set_hub',
  sessionId?: string,
  participantUserId?: string,
  hubType?: string | null,
) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/interview-token-auth`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ token, action, session_id: sessionId, participant_user_id: participantUserId, hub_type: hubType }),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

async function cancelBooking(token: string) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/interview-cancel-slot`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ token }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error ?? 'cancel_failed');
  return data as { ok: true; remaining_reschedules: number; reschedule_count: number };
}

async function ensureInterviewGuestSession(token: string, interview: InterviewMeta) {
  const { data: current } = await supabase.auth.getSession();
  const currentUser = current.session?.user;
  const currentEmail = currentUser?.email?.toLowerCase?.() ?? '';
  const applicantEmail = interview.teacher_email?.toLowerCase?.() ?? '';
  const isIntendedParticipant =
    !!currentUser &&
    (currentUser.id === interview.admin_id ||
      currentUser.id === interview.applicant_user_id ||
      (!!currentEmail && currentEmail === applicantEmail));
  if (currentUser && isIntendedParticipant) return currentUser.id;

  const guest = await callTokenAuth(token, 'create_guest_session');
  if (!guest.ok) {
    console.error('[InterviewMagicEntry] guest session failed', guest.data);
    throw new Error('Could not create the secure interview guest session.');
  }

  const credentials = guest.data?.guest_session;
  if (!credentials?.email || !credentials?.password) {
    console.error('[InterviewMagicEntry] guest session missing credentials', guest.data);
    throw new Error('Could not create the secure interview guest session.');
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password,
  });
  if (error || !data.user) {
    console.error('[InterviewMagicEntry] guest sign-in failed', error);
    throw new Error('Could not create the secure interview guest session.');
  }
  return data.user.id;
}

function friendlyError(code: string | undefined): string {
  switch (code) {
    case 'invalid_token':
      return 'This interview link is no longer valid.';
    case 'expired':
    case 'room_closed':
      return 'This interview room is now closed. If you need to reschedule, please contact the team.';
    case 'booking_expired':
      return 'This booking link expired (links are valid for 48 hours). Please contact the team to receive a fresh invitation.';
    case 'interview_cancelled':
      return 'This interview has been cancelled. Please contact the team.';
    case 'already_booked':
      return 'This interview is already scheduled. Re-open your invitation link to enter the room.';
    case 'reschedule_limit_reached':
      return 'You have used both reschedule attempts. Please contact the team to receive a new invitation.';
    case 'too_close_to_start':
      return 'It is too close to the interview start time to cancel. Please contact the team.';
    default:
      return 'We could not open your interview room. Please contact the team.';
  }
}

function friendlyCancelError(code: string): string {
  return friendlyError(code);
}

export default function InterviewMagicEntry() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('Validating your invitation…');
  const [interview, setInterview] = useState<InterviewMeta | null>(null);
  const [preOpen, setPreOpen] = useState<{ pre_open: boolean; opens_at: string | null } | null>(null);
  const [entering, setEntering] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const ranRef = useRef(false);

  const persistHubChoice = async (hubType: 'playground' | 'academy' | 'success') => {
    if (!token) return;
    try {
      sessionStorage.setItem(`interview_hub:${token}`, hubType);
    } catch {/* ignore */}
    const res = await callTokenAuth(token, 'set_hub', undefined, undefined, hubType);
    if (!res.ok) {
      throw new Error(friendlyError(res.data?.error));
    }
    setInterview(res.data.interview as InterviewMeta);
  };

  // Step 1 — token validation (runs once, doesn't depend on auth)
  useEffect(() => {
    if (!token) {
      setError('Missing interview token.');
      return;
    }
    // Mark this tab as being inside the interview flow so any auth state
    // change (e.g. guest sign-in) doesn't trigger a redirect from
    // HomeGate / Dashboard into a student hub or placement test.
    try { sessionStorage.setItem('interview_flow_active', '1'); } catch {/* ignore */}
    if (ranRef.current) return;
    ranRef.current = true;
    (async () => {
      const lookup = await callTokenAuth(token, 'lookup');
      if (!lookup.ok) {
        setError(friendlyError(lookup.data?.error));
        return;
      }
      const iv = lookup.data.interview as InterviewMeta;
      let nextInterview = iv;
      try {
        const savedHub = sessionStorage.getItem(`interview_hub:${token}`) as 'playground' | 'academy' | 'success' | null;
        if (savedHub && savedHub !== iv.hub_type) {
          const saved = await callTokenAuth(token, 'set_hub', undefined, undefined, savedHub);
          if (saved.ok) nextInterview = saved.data.interview as InterviewMeta;
        }
      } catch {/* ignore */}
      setInterview(nextInterview);
      setPreOpen({ pre_open: !!lookup.data?.pre_open, opens_at: lookup.data?.opens_at ?? null });
      try {
        sessionStorage.setItem(`interview_token:${iv.id}`, token);
        sessionStorage.setItem(`interview_guest:${iv.id}`, '1');
      } catch {/* ignore */}
    })();
  }, [token]);

  const handleEnterRoom = async () => {
    if (!interview || !token) return;
    try {
      setEntering(true);
      setStatus('Preparing your interview room…');
      let participantUserId = user?.id;
      const currentEmail = user?.email?.toLowerCase?.() ?? '';
      const applicantEmail = interview.teacher_email?.toLowerCase?.() ?? '';
      const shouldUseCurrentUser =
        !!participantUserId &&
        (participantUserId === interview.admin_id ||
          participantUserId === interview.applicant_user_id ||
          (!!currentEmail && currentEmail === applicantEmail));
      if (!shouldUseCurrentUser) {
        participantUserId = await ensureInterviewGuestSession(token, interview);
        try {
          sessionStorage.setItem(`interview_guest:${interview.id}`, '1');
        } catch {/* ignore */}
      }
        const boot = await callTokenAuth(token, 'bootstrap_room', undefined, participantUserId, interview.hub_type);
      if (!boot.ok) {
        setError(friendlyError(boot.data?.error));
        return;
      }
      const fresh = boot.data.interview as InterviewMeta;
      const sessionId = fresh.classroom_session_id || `interview-${fresh.id}`;
      setStatus('Connecting you to the interview room…');
      for (let i = 0; i < 40; i++) {
        const { data } = await supabase.auth.getSession();
        if (data.session?.user?.id) break;
        await new Promise((r) => setTimeout(r, 100));
      }
      navigate(`/classroom/${sessionId}?interview=1`, { replace: true });
    } catch (e: any) {
      toast.error(e?.message ?? 'Could not enter the classroom.');
    } finally {
      setEntering(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!token || !interview) return;
    try {
      setCancelling(true);
      const res = await cancelBooking(token);
      toast.success(
        res.remaining_reschedules > 0
          ? `Slot released — you have ${res.remaining_reschedules} reschedule${res.remaining_reschedules === 1 ? '' : 's'} left.`
          : 'Slot released — please pick a new time.',
      );
      setInterview({
        ...interview,
        scheduled_at: null,
        status: 'awaiting_booking',
        reschedule_count: res.reschedule_count,
        remaining_reschedules: res.remaining_reschedules,
      });
      setCancelOpen(false);
    } catch (e: any) {
      toast.error(friendlyCancelError(String(e?.message ?? 'cancel_failed')));
    } finally {
      setCancelling(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background p-4">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center space-y-3">
            <ShieldAlert className="h-10 w-10 text-destructive mx-auto" />
            <h2 className="text-lg font-bold">Interview Room</h2>
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button variant="outline" onClick={() => navigate('/')}>
              Back to home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Awaiting booking → first pick a hub (if not preset by admin), then render the Calendly-style slot picker inline.
  if (interview && !interview.scheduled_at && token) {
    const remaining = interview.remaining_reschedules ?? 2;

    if (!interview.hub_type) {
      const HUBS: { id: 'playground' | 'academy' | 'success'; title: string; blurb: string; icon: typeof Sparkles; accent: string }[] = [
        { id: 'playground', title: 'Playground Hub', blurb: 'Kids 4–9 · 30-min playful demo', icon: Sparkles, accent: 'from-orange-500/20 to-amber-400/10 border-orange-400/40' },
        { id: 'academy', title: 'Academy Hub', blurb: 'Teens 10–17 · 60-min structured demo', icon: GraduationCap, accent: 'from-purple-500/20 to-violet-400/10 border-purple-400/40' },
        { id: 'success', title: 'Success Hub', blurb: 'Adults 18+ · 60-min professional demo', icon: Briefcase, accent: 'from-emerald-500/20 to-teal-400/10 border-emerald-400/40' },
      ];
      return (
        <div className="min-h-dvh flex items-center justify-center bg-background p-4">
          <Card className="max-w-2xl w-full">
            <CardContent className="pt-6 space-y-5">
              <div className="text-center space-y-1">
                <h2 className="text-2xl font-bold">Choose your demo hub</h2>
                <p className="text-sm text-muted-foreground">
                  Pick the hub you'd like to teach in. Your interview & demo lesson will be tailored to that audience.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {HUBS.map(({ id, title, blurb, icon: Icon, accent }) => (
                  <button
                    key={id}
                    onClick={async () => {
                      try {
                        await persistHubChoice(id);
                        toast.success(`${title} selected for this interview.`);
                      } catch (e: any) {
                        toast.error(e?.message ?? 'Could not save the selected hub.');
                      }
                    }}
                    className={`text-left rounded-xl border bg-gradient-to-br ${accent} p-4 hover:scale-[1.02] transition-transform`}
                  >
                    <Icon className="h-6 w-6 mb-2" />
                    <div className="font-semibold">{title}</div>
                    <div className="text-xs text-muted-foreground mt-1">{blurb}</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div>
        {(interview.reschedule_count ?? 0) > 0 && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-900 px-4 py-2 text-center text-xs text-amber-900 dark:text-amber-100">
            You have <strong>{remaining}</strong> reschedule{remaining === 1 ? '' : 's'} remaining on this invitation.
          </div>
        )}
        <div className="bg-muted/40 border-b px-4 py-2 text-center text-xs text-muted-foreground">
          Demo hub: <strong className="capitalize text-foreground">{interview.hub_type}</strong>
          <button
            className="ml-2 underline hover:text-foreground"
            onClick={() => setInterview({ ...interview, hub_type: null })}
          >
            change
          </button>
        </div>
        <InterviewSlotPicker
          token={token}
          interview={interview}
          onBooked={async (scheduledAt, bookedInterview) => {
            setInterview({
              ...interview,
              ...bookedInterview,
              scheduled_at: scheduledAt,
              status: 'scheduled',
            });
          }}
        />
      </div>
    );
  }

  // Booked → show confirmation with Enter + Cancel actions.
  if (interview && interview.scheduled_at && !entering) {
    const start = parseISO(interview.scheduled_at);
    const durationMin = interview.duration_minutes ?? 30;
    // Applicant (teacher) may enter ANY time before the interview window
    // closes — no 15-min pre-open gate. Window closes once the scheduled
    // end-of-interview moment has passed.
    const endMs = start.getTime() + durationMin * 60_000;
    const isInterviewOver = Date.now() > endMs;
    const remaining = interview.remaining_reschedules ?? Math.max(0, 2 - (interview.reschedule_count ?? 0));
    const canCancel =
      remaining > 0 && start.getTime() > Date.now() + 15 * 60_000 && interview.status !== 'cancelled';
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 space-y-5 text-center">
            <div className="rounded-xl border bg-muted/40 p-3 text-left space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Demo hub</div>
              <div className="grid grid-cols-3 gap-2">
                {(['playground', 'academy', 'success'] as const).map((hub) => (
                  <Button
                    key={hub}
                    type="button"
                    size="sm"
                    variant={interview.hub_type === hub ? 'default' : 'outline'}
                    disabled={entering}
                    onClick={async () => {
                      try {
                        await persistHubChoice(hub);
                        toast.success(`${hub[0].toUpperCase()}${hub.slice(1)} hub saved.`);
                      } catch (e: any) {
                        toast.error(e?.message ?? 'Could not save the selected hub.');
                      }
                    }}
                    className="capitalize"
                  >
                    {hub === 'success' ? 'Success' : hub}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <CalendarCheck className="h-10 w-10 text-primary" />
              <h2 className="text-xl font-bold">Your interview is booked</h2>
              <p className="text-sm text-muted-foreground">
                {format(start, 'EEEE, MMMM d')} at {format(start, 'h:mm a')}
                <br />
                <span className="text-xs">({Intl.DateTimeFormat().resolvedOptions().timeZone})</span>
              </p>
            </div>

            {!isInterviewOver ? (
              <p className="text-xs text-muted-foreground">
                You can enter the classroom any time before your interview
                window ends to test your camera and rehearse the demo lesson.
              </p>
            ) : (
              <p className="text-xs text-destructive">
                This interview window has closed. Please contact the admin if
                you need to reschedule.
              </p>
            )}

            <div className="space-y-2">
              <Button
                size="lg"
                className="w-full"
                onClick={handleEnterRoom}
                disabled={entering || isInterviewOver}
              >
                <DoorOpen className="h-4 w-4 mr-2" />
                Enter classroom
              </Button>


              {canCancel ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-muted-foreground"
                  onClick={() => setCancelOpen(true)}
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                  Cancel & reschedule
                  <span className="ml-1.5 text-xs opacity-70">
                    ({remaining} left)
                  </span>
                </Button>
              ) : (
                <p className="text-xs text-muted-foreground pt-1">
                  {remaining === 0
                    ? 'No reschedules remaining. Contact the admin if you need to change this time.'
                    : 'Too close to start time to cancel.'}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel and reschedule?</AlertDialogTitle>
              <AlertDialogDescription>
                This will release your slot back to other applicants and let
                you pick a new time. You have <strong>{remaining}</strong>{' '}
                reschedule{remaining === 1 ? '' : 's'} left on this invitation
                — after that, only the admin can issue a new one.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={cancelling}>Keep my slot</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault();
                  handleConfirmCancel();
                }}
                disabled={cancelling}
              >
                {cancelling ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Releasing…
                  </>
                ) : (
                  'Yes, cancel & reschedule'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4 text-center px-6">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          {status}
        </div>
      </div>
    </div>
  );
}
