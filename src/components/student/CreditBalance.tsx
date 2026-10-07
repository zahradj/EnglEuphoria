import { Coins } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useStudentCredits } from '@/hooks/useStudentCredits';
import { creditAlertLevel } from '@/components/student/CreditAlertBanner';
import { FamilyBuyNote } from '@/components/student/FamilyBuyNote';
import { useFamilyMembership } from '@/hooks/useFamilyMembership';

/**
 * The student's lesson balance, always visible at the top of the dashboard.
 * 1 credit = 30 minutes, so the hours are shown next to it. When credits are low or gone the
 * CreditAlertBanner takes over, so this stays quiet then (no two notices for the same thing).
 */
export function CreditBalance({ studentId }: { studentId?: string | null }) {
  const { user } = useAuth();
  const id = studentId ?? user?.id ?? null;
  const { availableCredits, loading } = useStudentCredits(id);
  const inFamily = useFamilyMembership(id);
  if (!id || loading || creditAlertLevel(availableCredits) !== 'none') return null;

  const hours = availableCredits / 2;
  return (
    <div
      data-credit-balance={availableCredits}
      className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3"
    >
      <div className="flex items-center gap-3">
        <Coins className="h-5 w-5 shrink-0 text-primary" />
        <p className="text-sm">
          <span className="font-bold">{availableCredits} lesson credits</span>
          <span className="text-muted-foreground"> · {hours} {hours === 1 ? 'hour' : 'hours'} of lessons (1 credit = 30 min)</span>
        </p>
      </div>
      {inFamily ? (
        <FamilyBuyNote className="max-w-xs" />
      ) : (
        <Button asChild size="sm" variant="outline">
          <Link to="/pricing">Buy more</Link>
        </Button>
      )}
    </div>
  );
}
