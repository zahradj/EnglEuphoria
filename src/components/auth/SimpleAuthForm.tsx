import { detectMarketRegion } from '@/lib/marketRegion';
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff, CheckCircle, XCircle, Mail, Lock, User, GraduationCap, BookOpen, Sparkles, Shield, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  { test: (pwd: string) => pwd.length >= 6, text: "At least 6 characters" },
  { test: (pwd: string) => /[A-Z]/.test(pwd), text: "One uppercase letter" },
  { test: (pwd: string) => /[0-9]/.test(pwd), text: "One number" },
  { test: (pwd: string) => /[!@#$%^&*]/.test(pwd), text: "One special character" }
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
              await supabase.from('users').insert({
                id: data.user.id,
                email: formData.email,
                full_name: formData.fullName,
                role: formData.role,
                current_system: systemTag,
                market_region: detectMarketRegion(),
              } as any);
              await supabase.from('user_roles').insert({
                user_id: data.user.id,
                role: formData.role
              });
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
                await supabase.from('users').update({ referred_by: referrer.id }).eq('id', data.user.id);
                await supabase.from('referrals').insert({
                  referrer_id: referrer.id,
                  friend_id: data.user.id,
                  status: 'pending'
                });
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
      <div className="space-y-4">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-foreground">Reset Password</h3>
          <p className="text-sm text-muted-foreground">Enter your email to receive reset instructions</p>
        </div>
        <form onSubmit={handleForgotPassword} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="email"
              value={resetEmail}
              onChange={e => setResetEmail(e.target.value)}
              placeholder="your.email@example.com"
              className="pl-10 h-11 bg-muted/50 border-border focus:ring-2 focus:ring-primary/30 transition-shadow"
              disabled={resetLoading}
            />
          </div>
          <Button type="submit" className="w-full h-11" disabled={resetLoading}>
            {resetLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Send Reset Link
          </Button>
          <Button type="button" variant="ghost" className="w-full" onClick={() => setShowForgotPassword(false)}>
            Back to Login
          </Button>
        </form>
      </div>
    );
  }

  // --- Main Form ---
  let fieldIndex = 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {(formError || error) && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg"
          role="alert"
        >
          <p className="text-sm text-destructive">
            {formError || error || 'Something went wrong. Please try again.'}
          </p>
        </motion.div>
      )}

      {/* Google OAuth */}
      <motion.div variants={fieldVariants} initial="hidden" animate="visible" custom={fieldIndex++}>
        <Button
          type="button"
          variant="outline"
          className="w-full h-11 gap-3 font-medium border-border hover:bg-muted/60 transition-all hover:shadow-md"
          onClick={handleGoogleSignIn}
          disabled={googleLoading || loading}
        >
          {googleLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden>
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          )}
          Continue with Google
        </Button>
      </motion.div>

      {/* Divider */}
      <motion.div
        variants={fieldVariants} initial="hidden" animate="visible" custom={fieldIndex++}
        className="flex items-center gap-3"
      >
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground font-medium">or continue with email</span>
        <div className="flex-1 h-px bg-border" />
      </motion.div>

      {/* Name (signup only) */}
      {mode === 'signup' && (
        <motion.div variants={fieldVariants} initial="hidden" animate="visible" custom={fieldIndex++} className="space-y-1.5">
          <label className="text-sm font-medium text-foreground/80">Full Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={formData.fullName}
              onChange={e => handleInputChange('fullName', e.target.value)}
              placeholder="Enter your full name"
              className="pl-10 h-11 bg-muted/50 border-border focus:ring-2 focus:ring-primary/30 transition-shadow"
              disabled={loading}
              required
            />
          </div>
        </motion.div>
      )}

      {/* Email */}
      <motion.div variants={fieldVariants} initial="hidden" animate="visible" custom={fieldIndex++} className="space-y-1.5">
        <label className="text-sm font-medium text-foreground/80">Email Address</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="email"
            value={formData.email}
            onChange={e => handleInputChange('email', e.target.value)}
            placeholder="your.email@example.com"
            className={`pl-10 h-11 bg-muted/50 border-border focus:ring-2 focus:ring-primary/30 transition-shadow ${emailError ? 'border-destructive' : ''}`}
            disabled={loading}
            required
          />
        </div>
        {emailError && <p className="text-xs text-destructive">{emailError}</p>}
      </motion.div>

      {/* Role selector (signup only) */}
      {mode === 'signup' && (
        <motion.div variants={fieldVariants} initial="hidden" animate="visible" custom={fieldIndex++} className="space-y-1.5">
          <label className="text-sm font-medium text-foreground/80">I am a...</label>
          <div className="flex gap-2">
            {([
              { value: 'student' as const, label: 'Student', icon: BookOpen, desc: 'Learn & Grow' },
              { value: 'teacher' as const, label: 'Teacher', icon: GraduationCap, desc: 'Inspire & Educate' },
            ]).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleInputChange('role', opt.value)}
                className={`flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all duration-300 text-sm font-medium ${
                  formData.role === opt.value
                    ? 'text-white shadow-lg scale-[1.02]'
                    : 'border-border bg-muted/30 text-muted-foreground hover:bg-muted/60'
                }`}
                style={formData.role === opt.value ? {
                  backgroundImage: `linear-gradient(135deg, ${theme.cssFrom}, ${theme.cssTo})`,
                  borderColor: theme.cssFrom,
                } : undefined}
                disabled={loading}
              >
                <opt.icon className="h-4 w-4" />
                <div className="text-left">
                  <div>{opt.label}</div>
                  <div className={`text-[10px] ${formData.role === opt.value ? 'text-white/80' : 'text-muted-foreground/60'}`}>{opt.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Date of birth (signup student only) */}
      {mode === 'signup' && formData.role === 'student' && (
        <motion.div variants={fieldVariants} initial="hidden" animate="visible" custom={fieldIndex++} className="space-y-1.5">
          <label className="text-sm font-medium text-foreground/80">Date of Birth</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="date"
              value={formData.dateOfBirth}
              onChange={e => handleInputChange('dateOfBirth', e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="pl-10 h-11 bg-muted/50 border-border focus:ring-2 focus:ring-primary/30 transition-shadow"
              disabled={loading}
              required
            />
          </div>
          {formData.dateOfBirth && (
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <span>Program:</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
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
      <motion.div variants={fieldVariants} initial="hidden" animate="visible" custom={fieldIndex++} className="space-y-1.5">
        <label className="text-sm font-medium text-foreground/80">Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={e => handleInputChange('password', e.target.value)}
            placeholder={mode === 'login' ? "Enter your password" : "Create a password"}
            className="pl-10 pr-10 h-11 bg-muted/50 border-border focus:ring-2 focus:ring-primary/30 transition-shadow"
            disabled={loading}
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            disabled={loading}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>

        {mode === 'signup' && formData.password && (
          <div className="mt-2 p-3 bg-muted/50 rounded-lg border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Shield className="h-3 w-3" />
                Password Strength
              </span>
              <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                getPasswordStrength() >= 3 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                getPasswordStrength() >= 2 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                {getPasswordStrength()}/4
              </span>
            </div>
            <div className="flex gap-1 mb-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className={`flex-1 h-1 rounded-full transition-colors ${i > getPasswordStrength() ? 'bg-muted' : ''}`}
                  style={i <= getPasswordStrength() ? { backgroundColor: theme.cssFrom } : undefined}
                />
              ))}
            </div>
            <div className="grid grid-cols-2 gap-1">
              {passwordRequirements.map((req, i) => (
                <div key={i} className="flex items-center gap-1 text-xs">
                  {req.test(formData.password) ?
                    <CheckCircle className="h-3 w-3 text-green-500" /> :
                    <XCircle className="h-3 w-3 text-muted-foreground/40" />
                  }
                  <span className={req.test(formData.password) ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground/60'}>
                    {req.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Confirm password (signup only) */}
      {mode === 'signup' && (
        <motion.div variants={fieldVariants} initial="hidden" animate="visible" custom={fieldIndex++} className="space-y-1.5">
          <label className="text-sm font-medium text-foreground/80">Confirm Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={e => handleInputChange('confirmPassword', e.target.value)}
              placeholder="Confirm your password"
              className="pl-10 pr-10 h-11 bg-muted/50 border-border focus:ring-2 focus:ring-primary/30 transition-shadow"
              disabled={loading}
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
              disabled={loading}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </motion.div>
      )}

      {/* Submit */}
      <motion.div variants={fieldVariants} initial="hidden" animate="visible" custom={fieldIndex++}>
        <Button
          type="submit"
          className="w-full h-11 text-white font-medium shadow-lg transition-all duration-500 hover:shadow-xl hover:brightness-110"
          style={{ backgroundImage: `linear-gradient(to right, ${theme.cssFrom}, ${theme.cssTo})` }}
          disabled={loading || verifyingRole}
        >
          {loading || verifyingRole ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {verifyingRole ? 'Verifying role…' : (mode === 'login' ? 'Signing in...' : 'Creating account...')}
            </>
          ) : (
            <>
              {mode === 'login' ? (
                <><Shield className="mr-2 h-4 w-4" /> Sign In</>
              ) : (
                <><Sparkles className="mr-2 h-4 w-4" /> Create Account</>
              )}
            </>
          )}
        </Button>
      </motion.div>

      {/* Footer links */}
      <div className="space-y-3 text-center text-sm">
        {mode === 'login' && (
          <button
            type="button"
            onClick={() => setShowForgotPassword(true)}
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            Forgot password?
          </button>
        )}

        <div className="pt-2">
          <span className="text-muted-foreground">
            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
          </span>
          {onModeChange ? (
            <button
              type="button"
              onClick={() => onModeChange(mode === 'login' ? 'signup' : 'login')}
              className="font-medium text-primary hover:underline"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          ) : (
            <Link
              to={mode === 'login' ? '/student-signup' : '/login'}
              className="font-medium text-primary hover:underline"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </Link>
          )}
        </div>

        {mode === 'signup' && (
          <div className="pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2">Specialized signup</p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => navigate('/for-teachers')}
                className="flex-1 text-xs"
              >
                <GraduationCap className="mr-1 h-3 w-3" />
                Teacher
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => navigate('/student-signup')}
                className="flex-1 text-xs"
              >
                <BookOpen className="mr-1 h-3 w-3" />
                Student
              </Button>
            </div>
          </div>
        )}
      </div>
    </form>
  );
};
