import { AlertTriangle, Coins, Mail, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useStudentCredits } from '@/hooks/useStudentCredits';
import { ONLINE_PAYMENTS_ENABLED, contactToBuyHref } from '@/config/payments';
import { FamilyBuyNote } from '@/components/student/FamilyBuyNote';
import { useFamilyMembership } from '@/hooks/useFamilyMembership';

/** Credits at or below this show a gentle "running low" note. */
export const LOW_CREDITS_AT = 2;

export type CreditAlertLevel = 'none' | 'low' | 'empty';

export function creditAlertLevel(available: number): CreditAlertLevel {
  if (available <= 0) return 'empty';
  if (available <= LOW_CREDITS_AT) return 'low';
  return 'none';
}

/**
 * The message on every student dashboard (all hubs) when credits run out or run low.
 * With no credits the student cannot book a lesson until they buy: today they contact the school
 * (the admin then adds the credits and this banner disappears on its own, live); once online
 * payments are switched on the same button opens the packs to buy.
 */
export function CreditAlertBanner({ studentId }: { studentId?: string | null }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const id = studentId ?? user?.id ?? null;
  const { availableCredits, loading } = useStudentCredits(id);
  const level = creditAlertLevel(availableCredits);
  const inFamily = useFamilyMembership(id);
  if (!id || loading || level === 'none') return null;

  const empty = level === 'empty';
  const buy = inFamily ? (
    <FamilyBuyNote className="max-w-xs shrink-0 text-current opacity-90" />
  ) : ONLINE_PAYMENTS_ENABLED ? (
    <div className="flex shrink-0 flex-wrap gap-2">
      <Button size="sm" onClick={() => navigate('/pricing')} className="gap-1.5">
        <ShoppingCart className="h-4 w-4" /> Buy online
      </Button>
      <Button size="sm" variant="outline" asChild className="gap-1.5 bg-transparent">
        <a href={contactToBuyHref({ studentEmail: user?.email })}><Mail className="h-4 w-4" /> Contact us to buy</a>
      </Button>
    </div>
  ) : (
    <Button size="sm" asChild className="gap-1.5 shrink-0">
      <a href={contactToBuyHref({ studentEmail: user?.email })}><Mail className="h-4 w-4" /> Contact us to buy</a>
    </Button>
  );

  return (
    <div
      role="alert"
      data-credit-alert={level}
      className={`mb-4 flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between ${
        empty ? 'border-destructive/40 bg-destructive/10 text-destructive' : 'border-amber-400/50 bg-amber-50 text-amber-900 dark:bg-amber-500/10 dark:text-amber-200'
      }`}
    >
      <div className="flex items-start gap-3">
        {empty ? <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" /> : <Coins className="mt-0.5 h-5 w-5 shrink-0" />}
        <div>
          <p className="font-bold">
            {empty ? 'You have used all your credits' : `Only ${availableCredits} credit${availableCredits === 1 ? '' : 's'} left`}
          </p>
          <p className="text-sm opacity-90">
            {empty
              ? ONLINE_PAYMENTS_ENABLED
                ? 'Buy a credit pack online, or contact us to buy, to book your next lesson.'
                : 'You can book your next lesson once you buy more credits. Contact us and your new credits will appear here as soon as they are added.'
              : '1 credit = 30 minutes (a 1-hour lesson uses 2). Top up so your next lesson is never blocked.'}
          </p>
        </div>
      </div>
      {buy}
    </div>
  );
}
