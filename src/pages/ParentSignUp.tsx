import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Mail, Lock, User as UserIcon, Eye, EyeOff, ArrowLeft, ArrowRight, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AuthPageLayout } from '@/components/auth/AuthPageLayout';
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
      } as any);

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
        description: `${children.length === 1 ? 'Your child is' : 'Your children are'} ready to learn.`,
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
          content="Create one parent account for the whole family and add each of your children in minutes."
        />
      </Helmet>
      <AuthPageLayout
        title="Create your family account"
        subtitle="One login for you. A learning space for each child."
        icon={Users}
        variant="student"
        backLink={{ to: '/', label: 'Back to Home' }}
      >
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-xs font-medium">
            <span className="text-muted-foreground">Step {step} of 2</span>
            <span className="text-primary">{step === 1 ? 'Your account' : 'Your children'}</span>
          </div>
          <Progress value={(step / 2) * 100} className="h-2" />
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
              <>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium" htmlFor="parent-name">Your full name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="parent-name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" className="h-11 pl-10" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium" htmlFor="parent-email">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="parent-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your.email@example.com" className="h-11 pl-10" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium" htmlFor="parent-password">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="parent-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      className="h-11 pl-10 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-11 px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <p className="text-sm font-medium">You are their…</p>
                  <div className="flex flex-wrap gap-2">
                    {RELATIONSHIPS.map((r) => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => setRelationship(r.value)}
                        aria-pressed={relationship === r.value}
                        className={`min-h-[44px] rounded-xl border-2 px-4 text-sm transition-colors ${
                          relationship === r.value ? 'border-primary bg-primary/10 font-semibold' : 'border-border bg-muted/30 hover:bg-muted/60'
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

        <div className="mt-6 flex items-center gap-2">
          {step === 2 && (
            <Button type="button" variant="outline" onClick={() => setStep(1)} disabled={submitting}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          )}
          <div className="flex-1" />
          {step === 1 ? (
            <Button
              type="button"
              onClick={() => setStep(2)}
              disabled={!step1Valid}
              className="bg-gradient-to-r from-violet-500 to-pink-500 text-white hover:from-violet-600 hover:to-pink-600"
            >
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!step2Valid || submitting}
              className="bg-gradient-to-r from-violet-500 to-pink-500 text-white hover:from-violet-600 hover:to-pink-600"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating family…
                </>
              ) : (
                <>Create family account <ArrowRight className="ml-2 h-4 w-4" /></>
              )}
            </Button>
          )}
        </div>

        <div className="mt-6 space-y-1 text-center text-sm text-muted-foreground">
          <p>
            Already have an account?{' '}
            <Button variant="link" className="h-auto p-0 font-semibold text-violet-600 hover:text-violet-700" onClick={() => navigate('/login')}>
              Log in
            </Button>
          </p>
          <p>
            Learning on your own?{' '}
            <Button variant="link" className="h-auto p-0 font-semibold text-violet-600 hover:text-violet-700" onClick={() => navigate('/student-signup')}>
              Sign up as a student
            </Button>
          </p>
        </div>
      </AuthPageLayout>
    </>
  );
};

export default ParentSignUp;
