import { detectMarketRegion, toDbMarketRegion } from '@/lib/marketRegion';
import { getStoredReferralCode } from '@/lib/referralCode';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Mail, Lock, User as UserIcon, Calendar, ArrowLeft, ArrowRight, CheckCircle, BookOpen } from 'lucide-react';

import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AuthPageLayout } from '@/components/auth/AuthPageLayout';
import { AccountTypeSwitch, AuthButton, AuthField, AuthSteps, EyeToggle } from '@/components/auth/authUi';
import {
  assignHubFromAge,
  calculateAgeFromDob,
  hubToDashboardRoute,
  HUB_BRAND,
  LEARNING_REASONS,
  type LearningReason,
} from '@/lib/hubAssignment';

type Step = 1 | 2 | 3;

interface WizardState {
  fullName: string;
  email: string;
  password: string;
  dateOfBirth: string;
  reason: LearningReason | null;
}

const STEP_LABELS = ['Account', 'About you', 'Your goal'];

const StudentSignUp = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { toast } = useToast();
  const { user, signUp, isConfigured, loading } = useAuth();

  const [step, setStep] = useState<Step>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [signedOut, setSignedOut] = useState(false);
  const [data, setData] = useState<WizardState>({
    fullName: '',
    email: '',
    password: '',
    dateOfBirth: '',
    reason: null,
  });

  // Force signout when arriving on the wizard with an active session.
  useEffect(() => {
    if (!loading && user && !signedOut) {
      setSignedOut(true);
      supabase.auth.signOut().catch(() => undefined);
    }
  }, [loading, user, signedOut]);

  const update = <K extends keyof WizardState>(key: K, value: WizardState[K]) =>
    setData((prev) => ({ ...prev, [key]: value }));

  const age = data.dateOfBirth ? calculateAgeFromDob(data.dateOfBirth) : 0;
  const assignment = useMemo(() => (age > 0 ? assignHubFromAge(age) : null), [age]);

  // ── Step validation ──────────────────────────────────────────────────────
  const step1Valid =
    data.fullName.trim().length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) &&
    data.password.length >= 6;

  const step2Valid = age >= 4 && age <= 99;
  const step3Valid = !!data.reason;

  // ── Navigation ───────────────────────────────────────────────────────────
  const next = () => setStep((s) => (s < 3 ? ((s + 1) as Step) : s));
  const back = () => setStep((s) => (s > 1 ? ((s - 1) as Step) : s));

  // ── Submission (runs at end of step 3) ───────────────────────────────────
  const handleSubmit = async () => {
    if (!step1Valid || !step2Valid || !step3Valid || !assignment) return;
    setSubmitting(true);

    if (!isConfigured) {
      toast({
        title: 'Authentication not configured',
        description: 'Supabase is not connected.',
        variant: 'destructive',
      });
      setSubmitting(false);
      return;
    }

    try {
      // users.current_system has a CHECK constraint on these exact lowercase values.
      const systemTag = age < 10 ? 'kids' : age < 18 ? 'teen' : 'adult';

      const { data: authData, error } = await signUp(data.email, data.password, {
        role: 'student',
        full_name: data.fullName,
        age,
        hub_type: assignment.hub_type,
        ref_code: getStoredReferralCode() ?? undefined,
      } as any);

      if (error || !authData?.user) {
        toast({
          title: 'Sign up failed',
          description: error?.message ?? 'Please try again.',
          variant: 'destructive',
        });
        setSubmitting(false);
        return;
      }

      const userId = authData.user.id;

      // Ensure public.users row exists (the auth trigger usually creates it).
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      if (!existing) {
        const { error: usersInsertErr } = await supabase.from('users').insert({
          id: userId,
          email: data.email,
          full_name: data.fullName,
          role: 'student',
          current_system: systemTag,
          market_region: toDbMarketRegion(detectMarketRegion()),
        } as any);
        if (usersInsertErr) console.error('StudentSignUp users insert failed:', usersInsertErr);
        const { error: rolesInsertErr } = await supabase.from('user_roles').insert({ user_id: userId, role: 'student' });
        if (rolesInsertErr) console.error('StudentSignUp user_roles insert failed:', rolesInsertErr);
      } else {
        const { error: systemErr } = await supabase.from('users').update({ current_system: systemTag }).eq('id', userId);
        if (systemErr) console.error('StudentSignUp users.current_system update failed:', systemErr);
      }

      // Persist the wizard state into student_profiles.
      const { error: profileError } = await supabase.from('student_profiles').upsert(
        {
          user_id: userId,
          student_level: assignment.hub_type,
          hub_type: assignment.hub_type,
          lesson_duration: assignment.lesson_duration,
          weekly_goal: assignment.weekly_goal,
          weekly_goal_set_at: new Date().toISOString(),
          learning_reason: data.reason,
          date_of_birth: data.dateOfBirth,
          age,
          onboarding_completed: false,
        } as any,
        { onConflict: 'user_id' },
      );

      if (profileError) {
        console.error('Failed to upsert student_profiles:', profileError);
      }

      // Fire-and-forget welcome / admin notification emails. `.catch()` alone
      // is not enough here — supabase-js resolves (doesn't reject) on HTTP
      // error statuses like the function's own 403 self-auth check, so a
      // failure was previously swallowed with zero visibility. Check the
      // resolved `error` too so a broken send actually surfaces in logs.
      void supabase.functions
        .invoke('send-user-emails', {
          body: {
            to: data.email,
            type: 'student-welcome',
            data: { userName: data.fullName, baseUrl: window.location.origin, userId, hub: assignment.hub_type },
          },
        })
        .then(({ error: sendError }) => {
          if (sendError) console.error('[StudentSignUp] Welcome email failed to send:', sendError);
        })
        .catch((err) => console.error('[StudentSignUp] Welcome email invoke threw:', err));
      void supabase.functions
        .invoke('notify-admin-new-student', {
          body: {
            record: { id: userId, email: data.email, full_name: data.fullName, role: 'student' },
          },
        })
        .then(({ error: notifyError }) => {
          if (notifyError) console.error('[StudentSignUp] Admin notification failed to send:', notifyError);
        })
        .catch((err) => console.error('[StudentSignUp] Admin notification invoke threw:', err));

      toast({
        title: '🎉 Welcome to Engleuphoria!',
        description: 'Let’s find your starting level…',
      });

      // Hand off to the dashboard, which triggers PlacementGatekeeper's
      // chat-style placement test inline since placement isn't complete yet.
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      toast({
        title: 'Sign up failed',
        description: err?.message ?? 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Sign Up — Start Learning English | EnglEuphoria</title>
        <meta
          name="description"
          content="Create your free EnglEuphoria account in three quick steps and book your first live 1-on-1 English lesson."
        />
      </Helmet>
      <AuthPageLayout
      title="Create your account"
      subtitle="Three quick steps and you’re in."
      icon={BookOpen}
      variant="student"
      backLink={{ to: '/', label: 'Back to Home' }}
    >
      <AccountTypeSwitch active="individual" />

      <AuthSteps steps={STEP_LABELS} current={step} />

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.25 }}
          className="space-y-4"
        >
          {step === 1 && (
            <Step1Account
              data={data}
              update={update}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
            />
          )}

          {step === 2 && (
            <Step2Age
              dateOfBirth={data.dateOfBirth}
              onChange={(v) => update('dateOfBirth', v)}
              age={age}
              hubLabel={assignment ? HUB_BRAND[assignment.hub_type].label : null}
            />
          )}

          {step === 3 && (
            <Step3Reason reason={data.reason} onChange={(v) => update('reason', v)} />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Footer Nav */}
      <div className="mt-7 flex items-center gap-3">
        {step > 1 && (
          <AuthButton variant="ghost" onClick={back} disabled={submitting}>
            <ArrowLeft className="h-4 w-4" /> Back
          </AuthButton>
        )}
        {step < 3 && (
          <AuthButton
            onClick={next}
            disabled={(step === 1 && !step1Valid) || (step === 2 && !step2Valid)}
            className="flex-1"
          >
            Continue <ArrowRight className="h-4 w-4" />
          </AuthButton>
        )}
        {step === 3 && (
          <AuthButton onClick={handleSubmit} disabled={!step3Valid} loading={submitting} className="flex-1">
            {submitting ? 'Creating account…' : (
              <>
                Start placement test <ArrowRight className="h-4 w-4" />
              </>
            )}
          </AuthButton>
        )}
      </div>

      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-[var(--auth-accent)] hover:underline">
          Log in
        </Link>
      </p>
    </AuthPageLayout>
    </>
  );
};

// ── Step 1 ─────────────────────────────────────────────────────────────────
function Step1Account({
  data,
  update,
  showPassword,
  setShowPassword,
}: {
  data: WizardState;
  update: <K extends keyof WizardState>(k: K, v: WizardState[K]) => void;
  showPassword: boolean;
  setShowPassword: (b: boolean) => void;
}) {
  const passwordChecks = [
    { ok: data.password.length >= 6, text: '6+ characters' },
    { ok: /[A-Z]/.test(data.password), text: 'An uppercase letter' },
    { ok: /[0-9]/.test(data.password), text: 'A number' },
  ];

  return (
    <>
      <AuthField
        label="Full name"
        icon={UserIcon}
        value={data.fullName}
        onChange={(e) => update('fullName', e.target.value)}
        placeholder="Your full name"
        autoComplete="name"
      />

      <AuthField
        label="Email"
        icon={Mail}
        type="email"
        value={data.email}
        onChange={(e) => update('email', e.target.value)}
        placeholder="your.email@example.com"
        autoComplete="email"
      />

      <div>
        <AuthField
          label="Password"
          icon={Lock}
          type={showPassword ? 'text' : 'password'}
          value={data.password}
          onChange={(e) => update('password', e.target.value)}
          placeholder="Create a password"
          autoComplete="new-password"
          right={<EyeToggle shown={showPassword} onToggle={() => setShowPassword(!showPassword)} />}
        />
        {data.password && (
          <ul className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1">
            {passwordChecks.map((c) => (
              <li key={c.text} className="flex items-center gap-1.5 text-xs">
                <CheckCircle className={c.ok ? 'h-3.5 w-3.5 text-emerald-500' : 'h-3.5 w-3.5 text-slate-300 dark:text-slate-600'} />
                <span className={c.ok ? 'font-medium text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}>{c.text}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

// ── Step 2 ─────────────────────────────────────────────────────────────────
function Step2Age({
  dateOfBirth,
  onChange,
  age,
  hubLabel,
}: {
  dateOfBirth: string;
  onChange: (v: string) => void;
  age: number;
  hubLabel: string | null;
}) {
  const today = new Date().toISOString().slice(0, 10);
  return (
    <>
      <AuthField
        label="Date of birth"
        icon={Calendar}
        type="date"
        value={dateOfBirth}
        max={today}
        onChange={(e) => onChange(e.target.value)}
        hint="We use this to choose the best learning hub for you."
      />

      {age > 0 && hubLabel && (
        <div className="rounded-xl border border-[var(--auth-accent)] bg-[var(--auth-accent-soft)] p-3.5 text-sm">
          <p className="font-semibold text-slate-900 dark:text-white">Looks like a perfect fit for the {hubLabel}.</p>
          <p className="text-xs text-slate-600 dark:text-slate-300">You can always switch later from your profile.</p>
        </div>
      )}
    </>
  );
}

// ── Step 3 ─────────────────────────────────────────────────────────────────
function Step3Reason({
  reason,
  onChange,
}: {
  reason: LearningReason | null;
  onChange: (v: LearningReason) => void;
}) {
  return (
    <>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Why are you learning English? Pick the closest match.
      </p>
      <div className="grid grid-cols-2 gap-3">
        {LEARNING_REASONS.map((r) => {
          const active = reason === r.value;
          return (
            <button
              key={r.value}
              type="button"
              onClick={() => onChange(r.value)}
              className={`group relative rounded-2xl border-2 p-4 text-left transition-all duration-200 ${
                active
                  ? 'border-[var(--auth-accent)] bg-[var(--auth-accent-soft)] shadow-md'
                  : 'border-slate-200 bg-slate-50/70 hover:-translate-y-px hover:border-slate-300 hover:bg-white dark:border-slate-700 dark:bg-slate-800/40 dark:hover:bg-slate-800'
              }`}
              aria-pressed={active}
            >
              <div className="text-2xl" aria-hidden>
                {r.emoji}
              </div>
              <div className="mt-1 text-sm font-bold text-slate-900 dark:text-white">{r.label}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{r.blurb}</div>
            </button>
          );
        })}
      </div>
    </>
  );
}

export default StudentSignUp;
