import { detectMarketRegion, toDbMarketRegion } from '@/lib/marketRegion';
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AuthButton, AuthDivider, AuthField, EyeToggle } from '@/components/auth/authUi';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, XCircle, Mail, Lock, User, Users, GraduationCap, BookOpen, Sparkles, Shield, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useHeroTheme } from '@/contexts/HeroThemeContext';

interface SimpleAuthFormProps {
  mode: 'login' | 'signup';
  onModeChange?: (mode: 'login' | 'signup') => void;
}

interface FormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'student' | 'teacher' | 'admin';
  dateOfBirth: string;
}

const calculateSystemTag = (dateOfBirth: string): 'KIDS' | 'TEENS' | 'ADULTS' => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  if (age >= 4 && age < 10) return 'KIDS';
  if (age >= 10 && age < 18) return 'TEENS';
  return 'ADULTS';
};

const getRedirectPath = (role: string, systemTag: string | null): string => {
  if (role === 'admin') return '/super-admin';
  if (role === 'marketing') return '/marketing';
  if (role === 'teacher') return '/teacher';
  if (role === 'student') {
    switch (systemTag) {
      case 'KIDS':
      case 'TEENS':
      case 'ADULTS':
      default:
        return '/playground';
    }
  }
  return '/';
};

const passwordRequirements = [
  { test: (pwd: string) => pwd.length >= 6, key: "au.req.len6", text: "At least 6 characters" },
  { test: (pwd: string) => /[A-Z]/.test(pwd), key: "au.req.upper", text: "One uppercase letter" },
  { test: (pwd: string) => /[0-9]/.test(pwd), key: "au.req.number", text: "One number" },
  { test: (pwd: string) => /[!@#$%^&*]/.test(pwd), key: "au.req.special", text: "One special character" }
];

const fieldVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.1 * i, duration: 0.35, ease: [0.25, 0.1, 0.25, 1] as const }
  })
};

export const SimpleAuthForm: React.FC<SimpleAuthFormProps> = ({ mode, onModeChange }) => {
  const { theme } = useHeroTheme();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const refCode = searchParams.get('ref') || '';
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    dateOfBirth: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifyingRole, setVerifyingRole] = useState(false);
  const [formError, setFormError] = useState<string>('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const redirectFallbackTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const { user, signIn, signUp, resetPassword, isConfigured, error } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  React.useEffect(() => {
    return () => {
      if (redirectFallbackTimeoutRef.current) clearTimeout(redirectFallbackTimeoutRef.current);
    };
  }, []);

  React.useEffect(() => {
    if (mode === 'signup' && user) {
      supabase.auth.signOut().then(() => {
      });
    }
  }, [mode, user]);

  React.useEffect(() => {
    if (error) console.warn('Auth error:', error);
  }, [error]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) { setEmailError('Email is required'); return false; }
    if (!emailRegex.test(email)) { setEmailError('Please enter a valid email address'); return false; }
    setEmailError('');
    return true;
  };

  const getPasswordStrength = (): number => {
    return passwordRequirements.filter(req => req.test(formData.password)).length;
  };

  const validateForm = (): boolean => {
    if (!validateEmail(formData.email)) return false;
    if (mode === 'signup') {
      if (!formData.fullName.trim()) {
        toast({ title: "Missing Information", description: "Please enter your full name.", variant: "destructive" });
        return false;
      }
      if (getPasswordStrength() < 3) {
        toast({ title: "Password Too Weak", description: "Password must meet at least 3 security requirements.", variant: "destructive" });
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        toast({ title: "Passwords Don't Match", description: "Please make sure both passwords are identical.", variant: "destructive" });
        return false;
      }
    } else {
      if (formData.password.length < 6) {
        toast({ title: "Invalid Password", description: "Password must be at least 6 characters long.", variant: "destructive" });
        return false;
      }
    }
    return true;
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/auth/callback'
        }
      });
      if (error) {
        toast({ title: "Google Sign-In Failed", description: error.message, variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Could not connect to Google.", variant: "destructive" });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setFormError('');
    setLoading(true);
    setVerifyingRole(false);

    try {
      if (!isConfigured) {
        const msg = 'Supabase not configured.';
        setFormError(msg);
        toast({ title: "Authentication Error", description: msg, variant: "destructive" });
        return;
      }

      if (mode === 'login') {
        const { data, error } = await signIn(formData.email, formData.password);
        if (error) {
          const isInvalidCreds = error.message?.toLowerCase().includes('invalid login credentials');
          const description = isInvalidCreds
            ? "Incorrect email or password. Please double-check your credentials or use 'Forgot password?' below to reset it."
            : (error.message || "Invalid email or password.");
          setFormError(description);
          toast({ title: "Login Failed", description, variant: "destructive", duration: 8000 });
        } else {
          setVerifyingRole(true);
          if (redirectFallbackTimeoutRef.current) clearTimeout(redirectFallbackTimeoutRef.current);
          redirectFallbackTimeoutRef.current = setTimeout(() => {
            setVerifyingRole(false);
            setFormError('Sign-in succeeded, but the redirect did not complete. Please refresh once or check the console diagnostics.');
            console.warn('[AUTH FORM] Redirect did not complete within 5s after successful signIn');
          }, 5000);
          toast({ title: "Welcome back!", description: "Verifying your account…" });
        }
      } else {
        const systemTag = formData.role === 'student' && formData.dateOfBirth ? calculateSystemTag(formData.dateOfBirth) : null;
        // Compute age from DOB; pass it to the trigger as the source of truth.
        let computedAge: number | undefined;
        let hubType = 'playground';
        if (formData.dateOfBirth) {
          const ageMs = Date.now() - new Date(formData.dateOfBirth).getTime();
          computedAge = Math.floor(ageMs / (365.25 * 24 * 60 * 60 * 1000));
          if (computedAge >= 18) hubType = 'professional';
          else if (computedAge >= 10) hubType = 'academy';
        }
        const { data, error } = await signUp(formData.email, formData.password, {
          role: formData.role,
          full_name: formData.fullName,
          system_tag: systemTag,
          age: formData.role === 'student' ? computedAge : undefined,   // ← AGE-FIRST
          hub_type: formData.role === 'student' ? hubType : undefined,  // legacy fallback
        } as any);

        if (error) {
          toast({ title: "Sign Up Failed", description: error.message || "Failed to create account.", variant: "destructive" });
        } else {
          if (data?.user) {
            const { data: existingProfile } = await supabase
              .from('users')
              .select('id')
              .eq('id', data.user.id)
              .maybeSingle();
            
            if (!existingProfile) {
              const { error: usersInsertErr } = await supabase.from('users').insert({
                id: data.user.id,
                email: formData.email,
                full_name: formData.fullName,
                role: formData.role,
                current_system: systemTag,
                market_region: toDbMarketRegion(detectMarketRegion()),
              } as any);
              if (usersInsertErr) console.error('Signup users insert failed:', usersInsertErr);
              const { error: rolesInsertErr } = await supabase.from('user_roles').insert({
                user_id: data.user.id,
                role: formData.role
              });
              if (rolesInsertErr) console.error('Signup user_roles insert failed:', rolesInsertErr);
            }
          }

          if (refCode && data?.user) {
            try {
              const { data: referrer } = await supabase
                .from('users')
                .select('id')
                .eq('referral_code', refCode)
                .maybeSingle();
              if (referrer) {
                const { error: referredByErr } = await supabase.from('users').update({ referred_by: referrer.id }).eq('id', data.user.id);
                if (referredByErr) console.error('Signup users.referred_by update failed:', referredByErr);
                const { error: referralErr } = await supabase.from('referrals').insert({
                  referrer_id: referrer.id,
                  friend_id: data.user.id,
                  status: 'pending'
                });
                if (referralErr) console.error('Signup referrals insert failed:', referralErr);
              }
            } catch (refErr) {
              console.error('Error linking referral:', refErr);
            }
          }

          toast({
            title: "Account Created! 📧",
            description: "We sent one welcome email with your confirmation link. Please open it and activate your account before logging in.",
            duration: 8000,
          });

          supabase.functions.invoke('notify-admin-new-registration', {
            body: { name: formData.fullName, email: formData.email, role: formData.role, systemTag, registeredAt: new Date().toISOString() }
          }).catch(err => console.error('Failed to notify admin:', err));

          if (formData.role === 'teacher') {
            navigate('/for-teachers');
          } else if (formData.role === 'student' && systemTag) {
            navigate(getRedirectPath('student', systemTag));
          } else {
            navigate('/login');
          }
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'email') validateEmail(value);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(resetEmail)) {
      toast({ title: "Invalid Email", description: "Please enter a valid email.", variant: "destructive" });
      return;
    }
    setResetLoading(true);
    try {
      const { error } = await resetPassword(resetEmail);
      if (error) {
        toast({ title: "Reset Failed", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Email Sent", description: "Check your email for reset instructions." });
        setShowForgotPassword(false);
        setResetEmail('');
      }
    } catch {
      toast({ title: "Error", description: "An error occurred.", variant: "destructive" });
    } finally {
      setResetLoading(false);
    }
  };

  // --- Forgot Password View ---
  if (showForgotPassword) {
    return (
      <div className="space-y-5">
        <div className="text-center">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('au.resetTitle', 'Reset your password')}</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('au.resetSub', 'Enter your email and we’ll send you a reset link.')}</p>
        </div>
        <form onSubmit={handleForgotPassword} className="space-y-4">
          <AuthField
            label={t('au.emailAddress', 'Email address')}
            icon={Mail}
            type="email"
            value={resetEmail}
            onChange={e => setResetEmail(e.target.value)}
            placeholder="your.email@example.com"
            autoComplete="email"
            disabled={resetLoading}
          />
          <AuthButton type="submit" className="w-full" loading={resetLoading}>
            {t('au.sendReset', 'Send reset link')}
          </AuthButton>
          <AuthButton variant="ghost" className="w-full" onClick={() => setShowForgotPassword(false)}>
            {t('au.backToSignIn', 'Back to sign in')}
          </AuthButton>
        </form>
      </div>
    );
  }

  // --- Main Form ---
  let fieldIndex = 0;
  const rise = { variants: fieldVariants, initial: 'hidden', animate: 'visible' } as const;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {(formError || error) && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-red-200 bg-red-50 p-3.5 dark:border-red-500/30 dark:bg-red-500/10"
          role="alert"
        >
          <p className="text-sm font-medium text-red-700 dark:text-red-300">
            {formError || error || 'Something went wrong. Please try again.'}
          </p>
        </motion.div>
      )}

      {/* Google OAuth */}
      <motion.div {...rise} custom={fieldIndex++}>
        <AuthButton variant="ghost" className="w-full gap-3" onClick={handleGoogleSignIn} disabled={googleLoading || loading}>
          {googleLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          )}
          {t('au.google', 'Continue with Google')}
        </AuthButton>
      </motion.div>

      <motion.div {...rise} custom={fieldIndex++}>
        <AuthDivider>{t('au.orEmail', 'or continue with email')}</AuthDivider>
      </motion.div>

      {/* Name (signup only) */}
      {mode === 'signup' && (
        <motion.div {...rise} custom={fieldIndex++}>
          <AuthField
            label={t('au.fullName', 'Full name')}
            icon={User}
            value={formData.fullName}
            onChange={e => handleInputChange('fullName', e.target.value)}
            placeholder={t('au.fullNamePh', 'Enter your full name')}
            autoComplete="name"
            disabled={loading}
            required
          />
        </motion.div>
      )}

      {/* Email */}
      <motion.div {...rise} custom={fieldIndex++}>
        <AuthField
          label={t('au.emailAddress', 'Email address')}
          icon={Mail}
          type="email"
          value={formData.email}
          onChange={e => handleInputChange('email', e.target.value)}
          placeholder="your.email@example.com"
          autoComplete="email"
          error={emailError || null}
          disabled={loading}
          required
        />
      </motion.div>

      {/* Role selector (signup only) */}
      {mode === 'signup' && (
        <motion.div {...rise} custom={fieldIndex++} className="space-y-1.5">
          <p className="text-[13px] font-semibold tracking-wide text-slate-700 dark:text-slate-200">{t('au.iAmA', 'I am a…')}</p>
          <div className="grid grid-cols-2 gap-2">
            {([
              { value: 'student' as const, label: t('au.student', 'Student'), icon: BookOpen, desc: t('au.studentSub', 'Learn & Grow') },
              { value: 'teacher' as const, label: t('au.teacher', 'Teacher'), icon: GraduationCap, desc: t('au.teacherSub', 'Inspire & Educate') },
            ]).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleInputChange('role', opt.value)}
                aria-pressed={formData.role === opt.value}
                className={`flex items-center gap-2.5 rounded-xl border-2 px-3.5 py-2.5 text-start text-sm font-semibold transition-all duration-200 ${
                  formData.role === opt.value
                    ? 'text-white shadow-lg'
                    : 'border-slate-200 bg-slate-50/70 text-slate-600 hover:border-slate-300 hover:bg-white dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
                style={formData.role === opt.value ? {
                  backgroundImage: `linear-gradient(135deg, ${theme.cssFrom}, ${theme.cssTo})`,
                  borderColor: theme.cssFrom,
                } : undefined}
                disabled={loading}
              >
                <opt.icon className="h-4 w-4 shrink-0" />
                <span>
                  <span className="block">{opt.label}</span>
                  <span className={`block text-[10px] font-medium ${formData.role === opt.value ? 'text-white/80' : 'text-slate-400'}`}>{opt.desc}</span>
                </span>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Date of birth (signup student only) */}
      {mode === 'signup' && formData.role === 'student' && (
        <motion.div {...rise} custom={fieldIndex++} className="space-y-2">
          <AuthField
            label={t('au.dob', 'Date of birth')}
            icon={Calendar}
            type="date"
            value={formData.dateOfBirth}
            onChange={e => handleInputChange('dateOfBirth', e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            disabled={loading}
            required
          />
          {formData.dateOfBirth && (
            <p className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <span>{t('au.program', 'Program:')}</span>
              <span className="rounded-full px-2 py-0.5 text-xs font-semibold text-white"
                style={{
                  backgroundColor: calculateSystemTag(formData.dateOfBirth) === 'KIDS' ? '#FF9F1C' :
                    calculateSystemTag(formData.dateOfBirth) === 'TEENS' ? '#6366F1' : '#10B981'
                }}>
                {calculateSystemTag(formData.dateOfBirth)}
              </span>
            </p>
          )}
        </motion.div>
      )}

      {/* Password */}
      <motion.div {...rise} custom={fieldIndex++}>
        <AuthField
          label={t('au.password', 'Password')}
          icon={Lock}
          type={showPassword ? 'text' : 'password'}
          value={formData.password}
          onChange={e => handleInputChange('password', e.target.value)}
          placeholder={mode === 'login' ? t('au.passwordPh', 'Enter your password') : t('au.createPasswordPh', 'Create a password')}
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          disabled={loading}
          required
          right={<EyeToggle shown={showPassword} onToggle={() => setShowPassword(!showPassword)} disabled={loading} />}
        />

        {mode === 'signup' && formData.password && (
          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-700 dark:bg-slate-800/40">
            <div className="mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <Shield className="h-3 w-3" />
                {t('au.strength', 'Password strength')}
              </span>
              <span className={`rounded px-1.5 py-0.5 text-xs font-bold ${
                getPasswordStrength() >= 3 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                getPasswordStrength() >= 2 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                {getPasswordStrength()}/4
              </span>
            </div>
            <div className="mb-2 flex gap-1">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i > getPasswordStrength() ? 'bg-slate-200 dark:bg-slate-700' : ''}`}
                  style={i <= getPasswordStrength() ? { backgroundColor: theme.cssFrom } : undefined}
                />
              ))}
            </div>
            <div className="grid grid-cols-2 gap-1">
              {passwordRequirements.map((req, i) => (
                <div key={i} className="flex items-center gap-1 text-xs">
                  {req.test(formData.password) ?
                    <CheckCircle className="h-3 w-3 text-green-500" /> :
                    <XCircle className="h-3 w-3 text-slate-300 dark:text-slate-600" />
                  }
                  <span className={req.test(formData.password) ? 'text-green-600 dark:text-green-400' : 'text-slate-400'}>
                    {t(req.key, req.text)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {mode === 'login' && (
          <div className="mt-2 text-end">
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-xs font-semibold text-slate-500 transition-colors hover:text-[var(--auth-accent)]"
            >
              {t('au.forgot', 'Forgot password?')}
            </button>
          </div>
        )}
      </motion.div>

      {/* Confirm password (signup only) */}
      {mode === 'signup' && (
        <motion.div {...rise} custom={fieldIndex++}>
          <AuthField
            label={t('au.confirmPassword', 'Confirm password')}
            icon={Lock}
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={e => handleInputChange('confirmPassword', e.target.value)}
            placeholder={t('au.confirmPasswordPh', 'Confirm your password')}
            autoComplete="new-password"
            disabled={loading}
            required
            right={<EyeToggle shown={showConfirmPassword} onToggle={() => setShowConfirmPassword(!showConfirmPassword)} disabled={loading} />}
          />
        </motion.div>
      )}

      {/* Submit */}
      <motion.div {...rise} custom={fieldIndex++}>
        <AuthButton type="submit" className="w-full" disabled={verifyingRole} loading={loading || verifyingRole}>
          {loading || verifyingRole ? (
            verifyingRole ? t('au.verifying', 'Verifying role…') : (mode === 'login' ? t('au.signingIn', 'Signing in…') : t('au.creating', 'Creating account…'))
          ) : mode === 'login' ? (
            <><Shield className="h-4 w-4" /> {t('au.signIn', 'Sign in')}</>
          ) : (
            <><Sparkles className="h-4 w-4" /> {t('au.createAccount', 'Create account')}</>
          )}
        </AuthButton>
      </motion.div>

      {/* Footer links */}
      <div className="space-y-4 pt-1 text-center text-sm">
        {mode === 'login' ? (
          <div className="border-t border-slate-200 pt-5 dark:border-slate-700">
            <p className="mb-3 font-medium text-slate-500 dark:text-slate-400">{t('au.newTo', 'New to EnglEuphoria? Create an account')}</p>
            <div className="grid grid-cols-2 gap-2.5">
              <Link
                to="/student-signup"
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 transition-all hover:-translate-y-px hover:border-[var(--auth-accent)] hover:shadow-sm dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100"
              >
                <User className="h-4 w-4 text-[var(--auth-accent)]" />
                {t('au.individual', 'Individual')}
              </Link>
              <Link
                to="/parent-signup"
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 transition-all hover:-translate-y-px hover:border-[var(--auth-accent)] hover:shadow-sm dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100"
              >
                <Users className="h-4 w-4 text-[var(--auth-accent)]" />
                {t('au.family', 'Family')}
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div>
              <span className="text-slate-500 dark:text-slate-400">{t('au.haveAccount', 'Already have an account?')} </span>
              {onModeChange ? (
                <button type="button" onClick={() => onModeChange('login')} className="font-semibold text-[var(--auth-accent)] hover:underline">
                  {t('au.signIn', 'Sign in')}
                </button>
              ) : (
                <Link to="/login" className="font-semibold text-[var(--auth-accent)] hover:underline">
                  {t('au.signIn', 'Sign in')}
                </Link>
              )}
            </div>
            <div className="border-t border-slate-200 pt-4 dark:border-slate-700">
              <p className="mb-2 text-xs font-medium text-slate-400">{t('au.otherWays', 'Other ways to sign up')}</p>
              <div className="grid grid-cols-3 gap-2">
                <AuthButton variant="ghost" className="h-10 px-2 text-xs" onClick={() => navigate('/student-signup')}>
                  <BookOpen className="h-3.5 w-3.5" /> {t('au.student', 'Student')}
                </AuthButton>
                <AuthButton variant="ghost" className="h-10 px-2 text-xs" onClick={() => navigate('/parent-signup')}>
                  <Users className="h-3.5 w-3.5" /> {t('au.family', 'Family')}
                </AuthButton>
                <AuthButton variant="ghost" className="h-10 px-2 text-xs" onClick={() => navigate('/for-teachers')}>
                  <GraduationCap className="h-3.5 w-3.5" /> {t('au.teacher', 'Teacher')}
                </AuthButton>
              </div>
            </div>
          </>
        )}
      </div>
    </form>
  );
};
