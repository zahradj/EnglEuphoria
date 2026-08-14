import { detectMarketRegion } from '@/lib/marketRegion';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Mail, Lock, User as UserIcon, Calendar, Eye, EyeOff, ArrowLeft, ArrowRight, CheckCircle, BookOpen } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AuthPageLayout } from '@/components/auth/AuthPageLayout';
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

  const progressPct = (step / 3) * 100;

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
      const systemTag = age < 10 ? 'KIDS' : age < 18 ? 'TEENS' : 'ADULTS';

      const { data: authData, error } = await signUp(data.email, data.password, {
        role: 'student',
        full_name: data.fullName,
        age,
        hub_type: assignment.hub_type,
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
        await supabase.from('users').insert({
          id: userId,
          email: data.email,
          full_name: data.fullName,
          role: 'student',
          current_system: systemTag,
          market_region: detectMarketRegion(),
        } as any);
        await supabase.from('user_roles').insert({ user_id: userId, role: 'student' });
      } else {
        await supabase.from('users').update({ current_system: systemTag }).eq('id', userId);
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
    <AuthPageLayout
      title="Start Learning English"
      subtitle="Three quick steps and you’re in."
      icon={BookOpen}
      variant="student"
      backLink={{ to: '/', label: 'Back to Home' }}
    >
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2 text-xs font-medium">
          <span className="text-muted-foreground">Step {step} of 3</span>
          <span className="text-primary">{STEP_LABELS[step - 1]}</span>
        </div>
        <Progress value={progressPct} className="h-2" />
        <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
          {STEP_LABELS.map((label, i) => (
            <span
              key={label}
              className={i + 1 <= step ? 'font-semibold text-primary' : ''}
            >
              {i + 1}. {label}
            </span>
          ))}
        </div>
      </div>

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
      <div className="mt-6 flex items-center gap-2">
        {step > 1 && (
          <Button type="button" variant="outline" onClick={back} disabled={submitting}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        )}
        <div className="flex-1" />
        {step < 3 && (
          <Button
            type="button"
            onClick={next}
            disabled={(step === 1 && !step1Valid) || (step === 2 && !step2Valid)}
            className="bg-gradient-to-r from-violet-500 to-pink-500 text-white hover:from-violet-600 hover:to-pink-600"
          >
            Continue <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
        {step === 3 && (
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!step3Valid || submitting}
            className="bg-gradient-to-r from-violet-500 to-pink-500 text-white hover:from-violet-600 hover:to-pink-600"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account…
              </>
            ) : (
              <>
                Start placement test <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        )}
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <Button
            variant="link"
            className="h-auto p-0 font-semibold text-violet-600 hover:text-violet-700"
            onClick={() => navigate('/login')}
          >
            Log in
          </Button>
        </p>
      </div>
    </AuthPageLayout>
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
    { ok: data.password.length >= 6, text: 'At least 6 characters' },
    { ok: /[A-Z]/.test(data.password), text: 'One uppercase letter' },
    { ok: /[0-9]/.test(data.password), text: 'One number' },
  ];

  return (
    <>
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Full name</label>
        <div className="relative">
          <UserIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={data.fullName}
            onChange={(e) => update('fullName', e.target.value)}
            placeholder="Your full name"
            className="h-11 pl-10"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Email</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="email"
            value={data.email}
            onChange={(e) => update('email', e.target.value)}
            placeholder="your.email@example.com"
            className="h-11 pl-10"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type={showPassword ? 'text' : 'password'}
            value={data.password}
            onChange={(e) => update('password', e.target.value)}
            placeholder="••••••"
            className="h-11 pl-10 pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-11 px-3 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
        {data.password && (
          <ul className="mt-2 space-y-1">
            {passwordChecks.map((c) => (
              <li key={c.text} className="flex items-center gap-2 text-xs">
                <CheckCircle className={c.ok ? 'h-3 w-3 text-emerald-500' : 'h-3 w-3 text-muted-foreground/40'} />
                <span className={c.ok ? 'text-emerald-600' : 'text-muted-foreground'}>{c.text}</span>
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
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Date of birth</label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="date"
            value={dateOfBirth}
            max={today}
            onChange={(e) => onChange(e.target.value)}
            className="h-11 pl-10"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          We use this to choose the best learning hub for you.
        </p>
      </div>

      {age > 0 && hubLabel && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm">
          <p className="font-medium text-foreground">Looks like a perfect fit for the {hubLabel}.</p>
          <p className="text-xs text-muted-foreground">
            You can always switch later from your profile.
          </p>
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
      <p className="text-sm text-muted-foreground">
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
              className={`group relative rounded-2xl border-2 p-4 text-left transition-all ${
                active
                  ? 'border-primary bg-primary/10 shadow-md'
                  : 'border-border bg-muted/30 hover:bg-muted/60'
              }`}
              aria-pressed={active}
            >
              <div className="text-2xl" aria-hidden>
                {r.emoji}
              </div>
              <div className="mt-1 text-sm font-semibold">{r.label}</div>
              <div className="text-xs text-muted-foreground">{r.blurb}</div>
            </button>
          );
        })}
      </div>
    </>
  );
}

export default StudentSignUp;
