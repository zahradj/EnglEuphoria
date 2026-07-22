import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSecurityAudit } from './SecurityAuditLogger';
import { useInputSanitization } from '@/hooks/useInputSanitization';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Lock, Eye, EyeOff, AlertTriangle } from 'lucide-react';

interface AuthAttempt {
  timestamp: Date;
  success: boolean;
  ip?: string;
}

interface PasswordStrength {
  score: number;
  feedback: string[];
  isStrong: boolean;
}

export const AdvancedAuth: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authAttempts, setAuthAttempts] = useState<AuthAttempt[]>([]);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    feedback: [],
    isStrong: false
  });
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimeRemaining, setBlockTimeRemaining] = useState(0);

  const { logAuthEvent, logSuspiciousActivity } = useSecurityAudit();
  const { validateAndSanitizeFormData } = useInputSanitization();
  const { toast } = useToast();

  // Rate limiting configuration
  const MAX_ATTEMPTS = 5;
  const BLOCK_DURATION = 15 * 60 * 1000; // 15 minutes

  // NOTE: Brute-force protection is enforced server-side by Supabase Auth.
  // We intentionally do NOT persist attempt counters in localStorage because
  // any attacker can trivially clear them via DevTools, giving false security.
  useEffect(() => {
    // no-op: rely on Supabase's server-side rate limiting
  }, []);

  useEffect(() => {
    if (password) {
      checkPasswordStrength(password);
    }
  }, [password]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isBlocked && blockTimeRemaining > 0) {
      interval = setInterval(() => {
        setBlockTimeRemaining(prev => {
          if (prev <= 1) {
            setIsBlocked(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isBlocked, blockTimeRemaining]);

  const checkPasswordStrength = (pwd: string) => {
    const strength: PasswordStrength = {
      score: 0,
      feedback: [],
      isStrong: false
    };

    if (pwd.length < 8) {
      strength.feedback.push('Password must be at least 8 characters long');
    } else {
      strength.score += 1;
    }

    if (!/[A-Z]/.test(pwd)) {
      strength.feedback.push('Add uppercase letters');
    } else {
      strength.score += 1;
    }

    if (!/[a-z]/.test(pwd)) {
      strength.feedback.push('Add lowercase letters');
    } else {
      strength.score += 1;
    }

    if (!/[0-9]/.test(pwd)) {
      strength.feedback.push('Add numbers');
    } else {
      strength.score += 1;
    }

    if (!/[^A-Za-z0-9]/.test(pwd)) {
      strength.feedback.push('Add special characters');
    } else {
      strength.score += 1;
    }

    // Check for common weak patterns
    const commonPatterns = [
      /123456/,
      /password/i,
      /qwerty/i,
      /admin/i,
      /letmein/i
    ];

    if (commonPatterns.some(pattern => pattern.test(pwd))) {
      strength.feedback.push('Avoid common password patterns');
      strength.score = Math.max(0, strength.score - 2);
    }

    // Check for personal information (basic check)
    if (email && pwd.toLowerCase().includes(email.split('@')[0].toLowerCase())) {
      strength.feedback.push('Avoid using email address in password');
      strength.score = Math.max(0, strength.score - 1);
    }

    strength.isStrong = strength.score >= 4;
    setPasswordStrength(strength);
  };

  const checkRateLimit = (attempts: AuthAttempt[]) => {
    const now = new Date();
    const recentAttempts = attempts.filter(attempt => 
      now.getTime() - attempt.timestamp.getTime() < BLOCK_DURATION
    );

    const failedAttempts = recentAttempts.filter(attempt => !attempt.success);

    if (failedAttempts.length >= MAX_ATTEMPTS) {
      const lastFailedAttempt = failedAttempts[failedAttempts.length - 1];
      const timeSinceLastAttempt = now.getTime() - lastFailedAttempt.timestamp.getTime();
      const remainingBlockTime = Math.max(0, BLOCK_DURATION - timeSinceLastAttempt);

      if (remainingBlockTime > 0) {
        setIsBlocked(true);
        setBlockTimeRemaining(Math.ceil(remainingBlockTime / 1000));
        
        logSuspiciousActivity('Rate limit triggered', {
          failedAttempts: failedAttempts.length,
          email,
          blockDuration: remainingBlockTime
        });
      }
    }
  };

  const recordAuthAttempt = (success: boolean) => {
    const attempt: AuthAttempt = {
      timestamp: new Date(),
      success,
      ip: 'unknown' // In a real app, you'd get this from the server
    };

    const newAttempts = [...authAttempts, attempt];
    setAuthAttempts(newAttempts);
    // Intentionally NOT persisted to localStorage — server-side rate limiting
    // (Supabase Auth) is the authoritative defense against brute-force.

    if (!success) {
      checkRateLimit(newAttempts);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isBlocked) {
      toast({
        title: "Account Temporarily Locked",
        description: `Too many failed attempts. Please wait ${Math.ceil(blockTimeRemaining / 60)} minutes.`,
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Validate and sanitize input
      const { sanitizedData, errors, isValid } = validateAndSanitizeFormData(
        { email, password, confirmPassword },
        {
          email: { required: true, type: 'email', maxLength: 100 },
          password: { required: true, type: 'text', maxLength: 128 },
          ...(isSignUp && {
            confirmPassword: { required: true, type: 'text', maxLength: 128 }
          })
        }
      );

      if (!isValid) {
        Object.entries(errors).forEach(([field, error]) => {
          toast({
            title: "Validation Error",
            description: `${field}: ${error}`,
            variant: "destructive"
          });
        });
        return;
      }

      if (isSignUp) {
        // Additional validation for sign up
        if (sanitizedData.password !== sanitizedData.confirmPassword) {
          toast({
            title: "Password Mismatch",
            description: "Passwords do not match",
            variant: "destructive"
          });
          return;
        }

        if (!passwordStrength.isStrong) {
          toast({
            title: "Weak Password",
            description: "Please choose a stronger password",
            variant: "destructive"
          });
          return;
        }

        // Sign up
        const { data, error } = await supabase.auth.signUp({
          email: sanitizedData.email,
          password: sanitizedData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`
          }
        });

        if (error) {
          recordAuthAttempt(false);
          await logAuthEvent('signup_failed', {
            email: sanitizedData.email,
            error: error.message
          });
          
          toast({
            title: "Sign Up Failed",
            description: error.message,
            variant: "destructive"
          });
        } else {
          recordAuthAttempt(true);
          await logAuthEvent('signup_success', {
            email: sanitizedData.email,
            userId: data.user?.id
          });
          
          toast({
            title: "Account Created",
            description: "Please check your email to verify your account",
            variant: "default"
          });
          
          // Clear form
          setEmail('');
          setPassword('');
          setConfirmPassword('');
        }
      } else {
        // Sign in
        const { data, error } = await supabase.auth.signInWithPassword({
          email: sanitizedData.email,
          password: sanitizedData.password
        });

        if (error) {
          recordAuthAttempt(false);
          await logAuthEvent('signin_failed', {
            email: sanitizedData.email,
            error: error.message
          });
          
          toast({
            title: "Sign In Failed",
            description: error.message,
            variant: "destructive"
          });
        } else {
          recordAuthAttempt(true);
          await logAuthEvent('signin_success', {
            email: sanitizedData.email,
            userId: data.user?.id
          });
          
          toast({
            title: "Welcome Back",
            description: "You have been signed in successfully",
            variant: "default"
          });
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
      recordAuthAttempt(false);
      await logAuthEvent('auth_error', {
        email,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      toast({
        title: "Authentication Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength.score <= 1) return 'bg-red-500';
    if (passwordStrength.score <= 2) return 'bg-orange-500';
    if (passwordStrength.score <= 3) return 'bg-yellow-500';
    if (passwordStrength.score <= 4) return 'bg-green-500';
    return 'bg-green-600';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength.score <= 1) return 'Very Weak';
    if (passwordStrength.score <= 2) return 'Weak';
    if (passwordStrength.score <= 3) return 'Fair';
    if (passwordStrength.score <= 4) return 'Good';
    return 'Strong';
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Shield className="h-6 w-6" />
          {isSignUp ? 'Create Account' : 'Sign In'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isBlocked && (
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Account temporarily locked due to multiple failed attempts. 
              Time remaining: {Math.ceil(blockTimeRemaining / 60)} minutes.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              disabled={isLoading || isBlocked}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={isLoading || isBlocked}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading || isBlocked}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>

            {isSignUp && password && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Password Strength:</span>
                  <span className={passwordStrength.isStrong ? 'text-green-600' : 'text-red-600'}>
                    {getPasswordStrengthText()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                    style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                  />
                </div>
                {passwordStrength.feedback.length > 0 && (
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {passwordStrength.feedback.map((feedback, index) => (
                      <li key={index}>• {feedback}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {isSignUp && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
                disabled={isLoading || isBlocked}
              />
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || isBlocked || (isSignUp && !passwordStrength.isStrong)}
          >
            {isLoading ? (
              'Processing...'
            ) : (
              <>
                <Lock className="h-4 w-4 mr-2" />
                {isSignUp ? 'Create Account' : 'Sign In'}
              </>
            )}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <Button
            variant="link"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setPassword('');
              setConfirmPassword('');
            }}
            disabled={isLoading || isBlocked}
          >
            {isSignUp 
              ? 'Already have an account? Sign in' 
              : "Don't have an account? Sign up"
            }
          </Button>
        </div>

        {authAttempts.length > 0 && (
          <div className="mt-4 text-xs text-muted-foreground">
            Recent attempts: {authAttempts.filter(a => !a.success).length} failed, {authAttempts.filter(a => a.success).length} successful
          </div>
        )}
      </CardContent>
    </Card>
  );
};