import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { CheckCircle2, Clock, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useSafeToLeaveTimer } from '@/hooks/classroom/useSafeToLeaveTimer';
import { SafeToLeaveWarningModal } from './SafeToLeaveWarningModal';

const TRIAL_MIN_CORE_MS = 25 * 60_000;

interface Props {
  sessionId: string;
  lessonType: 'trial' | 'standard';
  scheduledAt: string | null;
  durationMinutes: number;
  studentJoined: boolean;
  startedAt?: string | null;
  dashboardPath?: string;
}

/**
 * Teacher-only "Safe to Leave" button.
 * - Student present: neutral "End Class".
 * - Student absent, window not elapsed: destructive variant + warning modal.
 * - Window elapsed: success variant; click marks session student_absent via server-validated RPC.
 */
export function SafeToLeaveButton({
  sessionId,
  lessonType,
  scheduledAt,
  durationMinutes,
  studentJoined,
  startedAt,
  dashboardPath = '/teacher',
}: Props) {
  const navigate = useNavigate();
  const [warnOpen, setWarnOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const { canLeaveSafely, label } = useSafeToLeaveTimer({
    sessionId,
    lessonType,
    scheduledAt,
    durationMinutes,
    studentJoined,
    startedAt,
  });

  // Trial min-duration guard (mirrors DB trigger): during first 25 min with
  // the student present, block the End Class dispatch with a friendly toast.
  const [, setTick] = useState(0);
  useEffect(() => {
    if (lessonType !== 'trial' || !studentJoined) return;
    const i = setInterval(() => setTick((t) => t + 1), 5_000);
    return () => clearInterval(i);
  }, [lessonType, studentJoined]);

  const trialCoreBase = startedAt ?? scheduledAt;
  const trialElapsedMs = trialCoreBase ? Date.now() - new Date(trialCoreBase).getTime() : 0;
  const trialCoreLocked =
    lessonType === 'trial' && studentJoined && trialCoreBase != null && trialElapsedMs < TRIAL_MIN_CORE_MS;
  const trialCoreRemainingMin = Math.max(1, Math.ceil((TRIAL_MIN_CORE_MS - trialElapsedMs) / 60_000));

  const handleClick = async () => {
    if (studentJoined) {
      if (trialCoreLocked) {
        toast.warning(
          `Trial lessons need a full 25 minutes of core time. About ${trialCoreRemainingMin} min to go.`,
        );
        return;
      }
      // Ask the teacher classroom to open the Wrap-Up flow first.
      // TeacherClassroom listens for this event and runs the full end-class
      // sequence (end session + open wrap-up panel with "Submit now / Later").
      const evt = new CustomEvent('classroom:request-end-class', {
        detail: { sessionId },
        cancelable: true,
      });
      const accepted = !window.dispatchEvent(evt);
      // If no listener handled it, fall back to the legacy navigate-out behavior
      // so the teacher is never stuck inside the classroom.
      if (!accepted && evt.defaultPrevented === false) {
        navigate(dashboardPath);
      }
      return;
    }
    if (!canLeaveSafely) {
      setWarnOpen(true);
      return;
    }
    // Safe to leave: stamp student_absent
    setBusy(true);
    try {
      const { error } = await supabase.rpc('mark_student_absent', {
        p_session_id: sessionId,
      });
      if (error) throw error;
      toast.success('Marked as Student No-Show. You are paid in full.');
      navigate(dashboardPath);
    } catch (e: any) {
      toast.error(e?.message ?? 'Could not mark absent. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  // Variant + icon by state
  let variant: 'default' | 'destructive' | 'outline' = 'destructive';
  let Icon = LogOut;
  let className = '';
  if (studentJoined) {
    variant = 'outline';
  } else if (canLeaveSafely) {
    variant = 'default';
    Icon = CheckCircle2;
    className = 'bg-success text-success-foreground hover:bg-success/90';
  } else {
    Icon = Clock;
  }

  // The "waiting for student" state is shown inside the student video tile —
  // the top-bar button stays a compact "End Class" / "Safe to Leave" control
  // so it never displays a countdown (or a NaN/Infinity fallback).
  const buttonLabel = studentJoined
    ? 'End Class'
    : canLeaveSafely
      ? 'Safe to Leave'
      : 'End Class';

  return (
    <>
      <Button
        onClick={handleClick}
        variant={variant}
        disabled={busy}
        className={className}
        size="sm"
        title={
          trialCoreLocked
            ? `Trial core time in progress — ~${trialCoreRemainingMin} min remaining before you can end.`
            : undefined
        }
        aria-disabled={trialCoreLocked || undefined}
      >
        <Icon className="h-4 w-4 mr-2" />
        {buttonLabel}
      </Button>
      <SafeToLeaveWarningModal
        open={warnOpen}
        onOpenChange={setWarnOpen}
        onConfirmStay={() => setWarnOpen(false)}
      />
    </>
  );
}
