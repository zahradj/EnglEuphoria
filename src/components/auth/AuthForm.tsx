
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';

interface AuthFormProps {
  mode: 'login' | 'signup';
  onModeChange?: (mode: 'login' | 'signup') => void;
}

interface FormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'student' | 'teacher' | 'admin';
}

const passwordRequirements = [
  { test: (pwd: string) => pwd.length >= 6, text: "At least 6 characters" },
  { test: (pwd: string) => /[A-Z]/.test(pwd), text: "One uppercase letter" },
  { test: (pwd: string) => /[0-9]/.test(pwd), text: "One number" },
  { test: (pwd: string) => /[!@#$%^&*]/.test(pwd), text: "One special character" }
];

export const AuthForm: React.FC<AuthFormProps> = ({ mode, onModeChange }) => {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  
  const { signIn, signUp, user, isConfigured } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Only redirect existing authenticated users on initial load
  const [hasRedirected, setHasRedirected] = React.useState(false);
  
  React.useEffect(() => {
    // Redirect authenticated users to their appropriate dashboard
    if (user && !hasRedirected) {
      const dashboardMap: Record<string, string> = {
        student: '/student',
        teacher: '/teacher',
        admin: '/super-admin',
        marketing: '/marketing',
      };
      const targetPath = dashboardMap[user.role] || '/student';
      
      // Use React Router for navigation
      navigate(targetPath, { replace: true });
      setHasRedirected(true);
    }
  }, [user, hasRedirected]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Email is required');
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
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
        toast({
          title: "Missing Information",
          description: "Please enter your full name.",
          variant: "destructive",
        });
        return false;
      }

      if (getPasswordStrength() < 3) {
        toast({
          title: "Password Too Weak",
          description: "Password must meet at least 3 security requirements.",
          variant: "destructive",
        });
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        toast({
          title: "Passwords Don't Match",
          description: "Please make sure both passwords are identical.",
          variant: "destructive",
        });
        return false;
      }
    } else {
      if (formData.password.length < 6) {
        toast({
          title: "Invalid Password",
          description: "Password must be at least 6 characters long.",
          variant: "destructive",
        });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      if (!isConfigured) {
        toast({
          title: "Demo Mode",
          description: "Supabase not configured. Use the demo login on the home page.",
          variant: "destructive",
        });
        return;
      }

      if (mode === 'login') {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          toast({
            title: "Login Failed",
            description: error.message || "Invalid email or password.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Login Successful",
            description: "Welcome back!",
          });
        }
      } else {
        const { error } = await signUp(formData.email, formData.password, {
          role: formData.role
        });

        if (error) {
          toast({
            title: "Sign Up Failed",
            description: error.message || "Failed to create account.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Account Created Successfully!",
            description: "Please check your email to verify your account.",
          });
          
          // Set flag to prevent automatic redirect
          setHasRedirected(true);
          
          // Navigate based on role after a short delay to ensure state is set
          setTimeout(() => {
            if (formData.role === 'teacher') {
              navigate('/for-teachers');
            } else if (formData.role === 'student') {
              navigate('/student-application');
            } else {
              navigate('/login');
            }
          }, 100);
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast({
        title: "Authentication Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'email') {
      validateEmail(value);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </CardTitle>
          <CardDescription>
            {mode === 'login' 
              ? 'Sign in to your EnglEuphoria account'
              : 'Join EnglEuphoria and start your learning journey'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-2">
                <label htmlFor="fullName" className="text-sm font-medium">
                  Full Name
                </label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="Enter your full name"
                  disabled={loading}
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter your email"
                disabled={loading}
                required
                className={emailError ? 'border-red-500' : ''}
              />
              {emailError && (
                <p className="text-sm text-red-500">{emailError}</p>
              )}
            </div>

            {mode === 'signup' && (
              <div className="space-y-2">
                <label htmlFor="role" className="text-sm font-medium">
                  I am a...
                </label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) => handleInputChange('role', e.target.value as 'student' | 'teacher' | 'admin')}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  disabled={loading}
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                </select>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder={mode === 'login' ? "Enter your password" : "Create a password"}
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              
              {mode === 'signup' && formData.password && (
                <div className="mt-2 space-y-1">
                  <div className="text-xs text-gray-600 mb-1">
                    Password strength: {getPasswordStrength()}/4
                  </div>
                  {passwordRequirements.map((req, index) => {
                    const met = req.test(formData.password);
                    return (
                      <div key={index} className="flex items-center gap-2 text-xs">
                        {met ? (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        ) : (
                          <XCircle className="h-3 w-3 text-gray-300" />
                        )}
                        <span className={met ? 'text-green-600' : 'text-gray-400'}>
                          {req.text}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {mode === 'signup' && (
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm Password
                </label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="Confirm your password"
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    disabled={loading}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                </>
              ) : (
                mode === 'login' ? 'Sign In' : 'Create Account'
              )}
            </Button>

            <div className="text-center text-sm">
              <span className="text-gray-600">
                {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
              </span>
              {onModeChange ? (
                <button
                  type="button"
                  onClick={() => onModeChange(mode === 'login' ? 'signup' : 'login')}
                  className="text-blue-600 hover:underline"
                >
                  {mode === 'login' ? 'Sign up' : 'Sign in'}
                </button>
              ) : (
                <Link 
                  to={mode === 'login' ? '/student-signup' : '/login'} 
                  className="text-blue-600 hover:underline"
                >
                  {mode === 'login' ? 'Sign up' : 'Sign in'}
                </Link>
              )}
            </div>

            <div className="text-center">
              <Link to="/" className="text-sm text-gray-500 hover:underline">
                ← Back to home
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
