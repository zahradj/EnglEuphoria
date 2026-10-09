import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Mail, Lock, User as UserIcon, ArrowLeft, ArrowRight, Users } from 'lucide-react';

import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AuthPageLayout } from '@/components/auth/AuthPageLayout';
import { AccountTypeSwitch, AuthButton, AuthField, AuthSteps, EyeToggle } from '@/components/auth/authUi';
import { getStoredReferralCode } from '@/lib/referralCode';
import {
  FamilyChildrenForm,
  createFamilyChildren,
  emptyChild,
  isChildValid,
  type ChildDraft,
} from '@/components/parent/FamilyChildrenForm';

type Step = 1 | 2;

const RELATIONSHIPS = [
  { value: 'mother', label: 'Mother' },
  { value: 'father', label: 'Father' },
  { value: 'guardian', label: 'Guardian' },
  { value: 'other', label: 'Other' },
];

const ParentSignUp = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signUp, isConfigured, loading } = useAuth();

  const [step, setStep] = useState<Step>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [signedOut, setSignedOut] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [relationship, setRelationship] = useState('guardian');
  const [children, setChildren] = useState<ChildDraft[]>([emptyChild()]);

  // Same rule as the student wizard: arriving with an active session starts from a clean slate.
  useEffect(() => {
    if (!loading && user && !signedOut) {
      setSignedOut(true);
      supabase.auth.signOut().catch(() => undefined);
    }
  }, [loading, user, signedOut]);

  const step1Valid =
    fullName.trim().length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
    password.length >= 8;
  const step2Valid = children.length >= 1 && children.every(isChildValid);

  const handleSubmit = async () => {
    if (!step1Valid || !step2Valid || submitting) return;
    setSubmitting(true);

    if (!isConfigured) {
      toast({ title: 'Authentication not configured', description: 'Supabase is not connected.', variant: 'destructive' });
      setSubmitting(false);
      return;
    }

    try {
      const { data: authData, error } = await signUp(email, password, {
        role: 'parent',
        full_name: fullName.trim(),
        ref_code: getStoredReferralCode() ?? undefined,
      } as any);

      // An email that already has an account (for example one made as a student): the sign-up either
      // errors, or - with email confirmation on - quietly returns a user with no identities.
      const identities = (authData?.user as { identities?: unknown[] } | null | undefined)?.identities;
      const alreadyHasAccount =
        /already (registered|exists)|already been registered/i.test(error?.message ?? '') ||
        (Array.isArray(identities) && identities.length === 0);
      if (alreadyHasAccount) {
        toast({
          title: 'This email already has an account',
          description: 'Sign in with it, then choose “Switch to a family account” in your Profile or Settings.',
        });
        navigate('/login', { replace: true });
        return;
      }

      if (error || !authData?.user) {
        toast({ title: 'Sign up failed', description: error?.message ?? 'Please try again.', variant: 'destructive' });
        return;
      }

      // Email confirmation is on: no session yet, so the children can't be created from here.
      if (!authData.session) {
        toast({
          title: 'Check your email',
          description: 'Confirm your email, log in, and add your children from your dashboard.',
        });
        navigate('/login', { replace: true });
        return;
      }

      const result = await createFamilyChildren(children, relationship);
      if (result.error) {
        // The parent account exists; don't make them start over.
        toast({
          title: 'Account created, but we couldn’t add your children',
          description: `${result.error.message} You can add them from your dashboard.`,
          variant: 'destructive',
        });
        navigate('/parent', { replace: true });
        return;
      }

      toast({
        title: 'Welcome to Engleuphoria!',
        description: `${children.length === 1 ? 'Your learner is' : 'Your learners are'} ready to learn.`,
      });
      navigate('/parent', { replace: true });
    } catch (err: any) {
      toast({ title: 'Sign up failed', description: err?.message ?? 'An unexpected error occurred.', variant: 'destructive' });
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
        <title>Parent Sign Up — Family Account | EnglEuphoria</title>
        <meta
          name="description"
          content="Create one parent account for the whole family and add each of your children (and any adult learner) in minutes."
        />
      </Helmet>
      <AuthPageLayout
        title="Create your family account"
        subtitle="One login for you. A learning space for each learner."
        icon={Users}
        variant="student"
        backLink={{ to: '/', label: 'Back to Home' }}
      >
        <AccountTypeSwitch active="family" />

        <AuthSteps steps={['Your account', 'Who is learning?']} current={step} />

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
              <>
                <AuthField
                  id="parent-name"
                  label="Your full name"
                  icon={UserIcon}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  autoComplete="name"
                />

                <AuthField
                  id="parent-email"
                  label="Email"
                  icon={Mail}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  autoComplete="email"
                />

                <AuthField
                  id="parent-password"
                  label="Password"
                  icon={Lock}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  hint={password.length > 0 && password.length < 8 ? `${8 - password.length} more character${8 - password.length === 1 ? '' : 's'} to go` : undefined}
                  right={<EyeToggle shown={showPassword} onToggle={() => setShowPassword(!showPassword)} />}
                />

                <div className="space-y-1.5">
                  <p className="text-[13px] font-semibold tracking-wide text-slate-700 dark:text-slate-200">You are their…</p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {RELATIONSHIPS.map((r) => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => setRelationship(r.value)}
                        aria-pressed={relationship === r.value}
                        className={`min-h-[44px] rounded-xl border-2 px-3 text-sm transition-all duration-200 ${
                          relationship === r.value
                            ? 'border-[var(--auth-accent)] bg-[var(--auth-accent-soft)] font-bold text-slate-900 dark:text-white'
                            : 'border-slate-200 bg-slate-50/70 font-medium text-slate-600 hover:border-slate-300 hover:bg-white dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-300 dark:hover:bg-slate-800'
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {step === 2 && <FamilyChildrenForm value={children} onChange={setChildren} disabled={submitting} />}
          </motion.div>
        </AnimatePresence>

        <div className="mt-7 flex items-center gap-3">
          {step === 2 && (
            <AuthButton variant="ghost" onClick={() => setStep(1)} disabled={submitting}>
              <ArrowLeft className="h-4 w-4" /> Back
            </AuthButton>
          )}
          {step === 1 ? (
            <AuthButton onClick={() => setStep(2)} disabled={!step1Valid} className="flex-1">
              Continue <ArrowRight className="h-4 w-4" />
            </AuthButton>
          ) : (
            <AuthButton onClick={handleSubmit} disabled={!step2Valid} loading={submitting} className="flex-1">
              {submitting ? 'Creating family…' : (<>Create family account <ArrowRight className="h-4 w-4" /></>)}
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

export default ParentSignUp;
