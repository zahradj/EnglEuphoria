import React, { forwardRef, useId } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Check, Loader2, User, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Shared pieces for the sign-in / sign-up cards. They read the page accent from the CSS
 * variables AuthPageLayout sets (--auth-accent, --auth-accent-2, --auth-accent-soft), so the
 * focus ring, buttons and step dots follow the hero colour.
 */

// ── Field: label, icon, input, optional right slot, hint / error ───────────────────────────
interface AuthFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className'> {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  /** Content at the end of the field (e.g. the show-password eye). */
  right?: React.ReactNode;
  hint?: React.ReactNode;
  error?: string | null;
  className?: string;
}

export const AuthField = forwardRef<HTMLInputElement, AuthFieldProps>(function AuthField(
  { label, icon: Icon, right, hint, error, className, id, ...inputProps },
  ref,
) {
  const auto = useId();
  const fieldId = id ?? auto;
  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={fieldId} className="block text-[13px] font-semibold tracking-wide text-slate-700 dark:text-slate-200">
        {label}
      </label>
      <div
        className={cn(
          'group flex items-center rounded-xl border bg-slate-50/80 transition-all duration-200 dark:bg-slate-800/50',
          'focus-within:bg-white focus-within:ring-4 dark:focus-within:bg-slate-900',
          error
            ? 'border-red-400 focus-within:border-red-500 focus-within:ring-red-500/15'
            : 'border-slate-200 hover:border-slate-300 focus-within:border-[var(--auth-accent,#6366f1)] focus-within:ring-[var(--auth-accent-soft,#6366f12e)] dark:border-slate-700 dark:hover:border-slate-600',
        )}
      >
        {Icon && (
          <span className="pointer-events-none flex h-12 w-11 shrink-0 items-center justify-center text-slate-400 transition-colors group-focus-within:text-[var(--auth-accent,#6366f1)]">
            <Icon className="h-[18px] w-[18px]" />
          </span>
        )}
        <input
          ref={ref}
          id={fieldId}
          aria-invalid={!!error}
          aria-describedby={error || hint ? `${fieldId}-note` : undefined}
          {...inputProps}
          className={cn(
            'h-12 min-w-0 flex-1 bg-transparent text-[15px] text-slate-900 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-60 dark:text-slate-50',
            Icon ? 'pe-3' : 'px-3.5',
            right ? 'pe-1' : '',
          )}
        />
        {right && <span className="flex shrink-0 items-center pe-1.5">{right}</span>}
      </div>
      {(error || hint) && (
        <p id={`${fieldId}-note`} className={cn('text-xs', error ? 'text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400')}>
          {error || hint}
        </p>
      )}
    </div>
  );
});

// ── Primary button ─────────────────────────────────────────────────────────────────────────
interface AuthButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: 'primary' | 'ghost';
}

export const AuthButton = forwardRef<HTMLButtonElement, AuthButtonProps>(function AuthButton(
  { loading, variant = 'primary', className, children, disabled, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={cn(
        'inline-flex h-12 items-center justify-center gap-2 rounded-xl px-5 text-[15px] font-semibold transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--auth-accent-soft,#6366f12e)]',
        variant === 'primary'
          ? 'bg-[linear-gradient(135deg,var(--auth-accent,#6366f1),var(--auth-accent-2,#a855f7))] text-white shadow-[0_10px_24px_-10px_var(--auth-accent,#6366f1)] hover:-translate-y-px hover:shadow-[0_14px_28px_-10px_var(--auth-accent,#6366f1)] hover:brightness-105 active:translate-y-0 disabled:translate-y-0 disabled:opacity-45 disabled:shadow-none'
          : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100 dark:hover:bg-slate-800',
        className,
      )}
      {...rest}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
});

// ── Individual / Family switch (top of every sign-up page) ────────────────────────────────
const ACCOUNT_TYPES = [
  { key: 'individual', to: '/student-signup', label: 'au.individual', sub: 'au.individualSub', defLabel: 'Individual', defSub: 'For myself', icon: User },
  { key: 'family', to: '/parent-signup', label: 'au.family', sub: 'au.familySub', defLabel: 'Family', defSub: 'Parent + kids', icon: Users },
] as const;

export function AccountTypeSwitch({ active, className }: { active: 'individual' | 'family'; className?: string }) {
  const { t } = useTranslation();
  return (
    <nav aria-label="Account type" className={cn('mb-6', className)}>
      <p className="mb-2 text-[13px] font-semibold tracking-wide text-slate-700 dark:text-slate-200">{t('au.signingUpAs', 'I’m signing up as')}</p>
      <div className="grid grid-cols-2 gap-1.5 rounded-2xl bg-slate-100 p-1.5 dark:bg-slate-800/70">
        {ACCOUNT_TYPES.map(({ key, to, label, sub, defLabel, defSub, icon: Icon }) => {
          const on = key === active;
          return (
            <Link
              key={key}
              to={to}
              replace
              aria-current={on ? 'page' : undefined}
              className={cn(
                'flex items-center gap-2.5 rounded-xl px-3 py-2.5 transition-all duration-200',
                on
                  ? 'bg-white shadow-sm ring-1 ring-[var(--auth-accent,#6366f1)] dark:bg-slate-900'
                  : 'text-slate-500 hover:bg-white/60 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-900/50 dark:hover:text-slate-100',
              )}
            >
              <span
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors',
                  on ? 'bg-[linear-gradient(135deg,var(--auth-accent,#6366f1),var(--auth-accent-2,#a855f7))] text-white' : 'bg-slate-200/80 text-slate-500 dark:bg-slate-700 dark:text-slate-300',
                )}
              >
                <Icon className="h-[18px] w-[18px]" />
              </span>
              <span className="min-w-0 leading-tight">
                <span className={cn('block text-sm font-bold', on ? 'text-slate-900 dark:text-white' : '')}>{t(label, defLabel)}</span>
                <span className="block text-[11px] font-medium opacity-80">{t(sub, defSub)}</span>
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

// ── Step indicator: numbered dots joined by a line ─────────────────────────────────────────
export function AuthSteps({ steps, current, className }: { steps: string[]; current: number; className?: string }) {
  const { t } = useTranslation();
  return (
    <ol className={cn('mb-7 flex items-start', className)} aria-label={t('au.stepLabel', { current, total: steps.length, defaultValue: 'Step {{current}} of {{total}}' })}>
      {steps.map((label, i) => {
        const n = i + 1;
        const done = n < current;
        const active = n === current;
        return (
          <li key={label} className="relative flex flex-1 flex-col items-center gap-1.5" aria-current={active ? 'step' : undefined}>
            {i > 0 && (
              <span
                aria-hidden
                className={cn(
                  'absolute start-[-50%] top-[13px] h-0.5 w-full rounded-full transition-colors duration-300',
                  n <= current ? 'bg-[var(--auth-accent,#6366f1)]' : 'bg-slate-200 dark:bg-slate-700',
                )}
              />
            )}
            <span
              className={cn(
                'relative z-10 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all duration-300',
                done && 'bg-[var(--auth-accent,#6366f1)] text-white',
                active && 'bg-white text-[var(--auth-accent,#6366f1)] ring-[3px] ring-[var(--auth-accent,#6366f1)] dark:bg-slate-900',
                !done && !active && 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500',
              )}
            >
              {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : n}
            </span>
            <span className={cn('text-[11px] font-semibold', active ? 'text-slate-900 dark:text-white' : done ? 'text-slate-600 dark:text-slate-300' : 'text-slate-400 dark:text-slate-500')}>
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

// ── Show / hide password eye, shared by every password field ───────────────────────────────
export function EyeToggle({ shown, onToggle, disabled }: { shown: boolean; onToggle: () => void; disabled?: boolean }) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      aria-label={shown ? t('au.hidePassword', 'Hide password') : t('au.showPassword', 'Show password')}
      aria-pressed={shown}
      className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
    >
      {shown ? (
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.1A10.4 10.4 0 0 1 12 5c5 0 9 4.5 10 7-0.4 1-1.3 2.4-2.7 3.7M6.6 6.6C4.5 8 3.2 10 2 12c1 2.5 5 7 10 7 1.5 0 2.9-.4 4.1-1" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )}
    </button>
  );
}

// ── "or" divider ───────────────────────────────────────────────────────────────────────────
export function AuthDivider({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 text-xs font-medium text-slate-400">
      <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
      {children}
      <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
    </div>
  );
}
