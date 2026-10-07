import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useStudentCredits } from '@/hooks/useStudentCredits';
import { creditAlertLevel } from '@/components/student/CreditAlertBanner';
import { useFamilyMembership } from '@/hooks/useFamilyMembership';

/**
 * The lesson balance on the Playground map: a small gold coin with the number of credits.
 * Tap it for the details. Few credits turn it amber; none turns it red and it softly pulses,
 * so a grown-up notices without a big banner over the map (1 credit = one 30-minute lesson).
 */
export const CreditCoin: React.FC<{ studentId?: string | null }> = ({ studentId }) => {
  const { user } = useAuth();
  const id = studentId ?? user?.id ?? null;
  const { availableCredits, loading } = useStudentCredits(id);
  const [open, setOpen] = useState(false);
  const inFamily = useFamilyMembership(id);
  if (!id || loading) return null;

  const level = creditAlertLevel(availableCredits);
  const fill =
    level === 'empty' ? 'from-rose-400 to-rose-600 ring-rose-200'
    : level === 'low' ? 'from-amber-300 to-orange-500 ring-amber-200'
    : 'from-yellow-300 to-amber-500 ring-yellow-100';
  const label =
    level === 'empty' ? 'No lessons left'
    : `${availableCredits} lesson${availableCredits === 1 ? '' : 's'} left`;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={label}
        aria-expanded={open}
        data-credit-coin={availableCredits}
        className={`grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br text-lg font-black text-white shadow-lg ring-4 transition hover:scale-110 active:scale-95 focus:outline-none focus-visible:ring-8 ${fill} ${level === 'empty' ? 'animate-pulse' : ''}`}
        style={{ textShadow: '0 1px 2px rgba(0,0,0,0.35)' }}
      >
        {availableCredits}
      </button>
      {open && (
        <div
          role="dialog"
          aria-label="Lessons left"
          className="absolute right-0 top-14 z-30 w-64 rounded-2xl bg-white p-4 text-left shadow-xl"
        >
          <p className="text-base font-extrabold text-slate-800">
            {level === 'empty' ? 'No lessons left' : `${availableCredits} lesson${availableCredits === 1 ? '' : 's'} left`}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {level === 'empty'
              ? 'Ask a grown-up to buy more lessons so you can book your next class.'
              : 'Each lesson is 30 minutes.'}
          </p>
          {inFamily ? (
            <p className="mt-3 text-sm font-semibold text-amber-700">
              Your parent can buy more lessons from the family dashboard.
            </p>
          ) : (
            <Link
              to="/pricing"
              className="mt-3 inline-block rounded-full bg-amber-500 px-4 py-2 text-sm font-bold text-white hover:bg-amber-600"
            >
              Buy more lessons
            </Link>
          )}
        </div>
      )}
    </div>
  );
};
