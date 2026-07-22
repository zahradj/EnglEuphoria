import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { 
  Loader2, Eye, EyeOff, CheckCircle, XCircle, Mail, Lock, User, 
  GraduationCap, BookOpen, Sparkles, Shield, Calendar, ArrowLeft,
  Bird, Rocket, Briefcase
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import logoBlack from '@/assets/logo-black.png';
import logoWhite from '@/assets/logo-white.png';

type SystemType = 'KIDS' | 'ACADEMY' | 'HUB' | null;

interface FormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'student' | 'teacher';
  dateOfBirth: string;
  gradeLevel: string;
  profession: string;
  interest: string;
}

const systemConfig = {
  KIDS: {
    name: 'Playground',
    displayName: 'English for Kids',
    gradient: 'from-yellow-300 via-lime-400 to-emerald-500',
    bgGradient: 'from-yellow-100 via-lime-50 to-emerald-100',
    textColor: 'text-emerald-900',
    accentColor: 'emerald',
    icon: Bird,
    mascotImage: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=400&fit=crop&q=80',
    description: 'Fun & colorful learning adventures!',
    defaultInterest: 'English for Kids',
  },
  ACADEMY: {
    name: 'Academy',
    displayName: 'The Academy',
    gradient: 'from-violet-600 via-purple-700 to-slate-900',
    bgGradient: 'from-violet-950 via-purple-900 to-slate-950',
    textColor: 'text-white',
    accentColor: 'purple',
    icon: Rocket,
    mascotImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&q=80',
    description: 'Level up your English skills!',
    defaultInterest: 'Teen English',
  },
  HUB: {
    name: 'Hub',
    displayName: 'Professional Hub',
    gradient: 'from-slate-200 via-blue-100 to-white',
    bgGradient: 'from-slate-50 via-blue-50 to-white',
    textColor: 'text-slate-900',
    accentColor: 'blue',
    icon: Briefcase,
    mascotImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&q=80',
    description: 'Master business English with confidence.',
    defaultInterest: 'Business English',
  },
};

const passwordRequirements = [
  { test: (pwd: string) => pwd.length >= 6, text: "At least 6 characters" },
  { test: (pwd: string) => /[A-Z]/.test(pwd), text: "One uppercase letter" },
  { test: (pwd: string) => /[0-9]/.test(pwd), text: "One number" },
  { test: (pwd: string) => /[!@#$%^&*]/.test(pwd), text: "One special character" },
];

const gradeOptions = [
  '6th Grade', '7th Grade', '8th Grade', '9th Grade', 
  '10th Grade', '11th Grade', '12th Grade'
];

export const ThemedSignupForm: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [selectedSystem, setSelectedSystem] = useState<SystemType>(null);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    dateOfBirth: '',
    gradeLevel: '',
    profession: '',
    interest: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');

  const { signUp, isConfigured, error } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Parse URL parameter on mount
  useEffect(() => {
    const systemParam = searchParams.get('system')?.toUpperCase() as SystemType;
    if (systemParam && ['KIDS', 'ACADEMY', 'HUB'].includes(systemParam)) {
      setSelectedSystem(systemParam);
      setFormData(prev => ({
        ...prev,
        interest: systemConfig[systemParam].defaultInterest,
      }));
    }
  }, [searchParams]);

  const config = selectedSystem ? systemConfig[selectedSystem] : null;
  const Icon = config?.icon || Sparkles;

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

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'email') validateEmail(value);
  };

  const handleSwitchSystem = () => {
    setSelectedSystem(null);
    navigate('/student-signup');
  };

  const validateForm = (): boolean => {
    if (!validateEmail(formData.email)) return false;
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
    if (selectedSystem === 'ACADEMY' && !formData.gradeLevel) {
      toast({ title: "Missing Information", description: "Please select your grade level.", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      if (!isConfigured) {
        toast({ title: "Authentication Error", description: "Supabase not configured.", variant: "destructive" });
        return;
      }

      const systemTag = selectedSystem === 'KIDS' ? 'KIDS' : selectedSystem === 'ACADEMY' ? 'TEENS' : 'ADULTS';

      const { error } = await signUp(formData.email, formData.password, {
        role: formData.role,
        full_name: formData.fullName,
        system_tag: systemTag,
      } as any);

      if (error) {
        toast({ title: "Sign Up Failed", description: error.message || "Failed to create account.", variant: "destructive" });
      } else {
        toast({
          title: "Account Created! 📧",
          description: "We sent one welcome email with your confirmation link. Please open it and activate your account before logging in.",
          duration: 8000,
        });

        // Notify admin
        supabase.functions.invoke('notify-admin-new-registration', {
          body: {
            name: formData.fullName,
            email: formData.email,
            role: formData.role,
            systemTag,
            gradeLevel: formData.gradeLevel || null,
            profession: formData.profession || null,
            registeredAt: new Date().toISOString(),
          }
        }).catch(err => console.error('Failed to send admin notification:', err));

        // Redirect to appropriate system
        navigate('/playground');
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast({ title: "Authentication Error", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Background styles based on system
  const getBackgroundClasses = () => {
    if (!selectedSystem) return 'bg-gradient-to-br from-rose-50 via-purple-50 to-blue-50';
    return `bg-gradient-to-br ${config?.bgGradient}`;
  };

  const isDarkMode = selectedSystem === 'ACADEMY';

  return (
    <div className={`min-h-dvh relative overflow-hidden transition-all duration-700 ${getBackgroundClasses()}`}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {selectedSystem === 'KIDS' && (
          <>
            <motion.div 
              className="absolute top-20 left-10 w-32 h-32 bg-yellow-300/30 rounded-full blur-2xl"
              animate={{ y: [0, -20, 0], scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 4 }}
            />
            <motion.div 
              className="absolute bottom-20 right-20 w-48 h-48 bg-emerald-300/30 rounded-full blur-3xl"
              animate={{ y: [0, 20, 0], scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 5, delay: 1 }}
            />
            <motion.div 
              className="absolute top-1/2 left-1/4 w-24 h-24 bg-lime-300/40 rounded-full blur-xl"
              animate={{ x: [0, 30, 0], y: [0, -15, 0] }}
              transition={{ repeat: Infinity, duration: 6 }}
            />
          </>
        )}
        {selectedSystem === 'ACADEMY' && (
          <>
            <motion.div 
              className="absolute top-10 right-10 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"
              animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ repeat: Infinity, duration: 4 }}
            />
            <motion.div 
              className="absolute bottom-10 left-10 w-48 h-48 bg-violet-600/30 rounded-full blur-2xl"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 5, delay: 2 }}
            />
            {/* Neon glow lines */}
            <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-purple-500/50 to-transparent" />
            <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-violet-400/30 to-transparent" />
          </>
        )}
        {selectedSystem === 'HUB' && (
          <>
            <motion.div 
              className="absolute top-20 right-20 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 6 }}
            />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
          </>
        )}
      </div>

      {/* Header with Logo and Switch Link */}
      <motion.div 
        className="absolute top-6 left-6 right-6 flex items-center justify-between z-20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')} 
          className={`backdrop-blur-sm rounded-xl px-4 py-2 ${isDarkMode ? 'text-white/80 hover:bg-white/10' : 'text-slate-700 hover:bg-white/50'}`}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Home
        </Button>

        {selectedSystem && (
          <button
            onClick={handleSwitchSystem}
            className={`text-sm backdrop-blur-sm px-4 py-2 rounded-full transition-all ${
              isDarkMode 
                ? 'text-purple-300 hover:text-white hover:bg-white/10' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            Not looking for {config?.displayName}? <span className="underline">Switch</span>
          </button>
        )}
      </motion.div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-24 min-h-dvh flex items-center justify-center">
        <div className="w-full max-w-5xl flex flex-col lg:flex-row items-center gap-8">
          
          {/* Mascot Section (Left side on desktop) */}
          {selectedSystem && (
            <motion.div 
              className="hidden lg:flex flex-col items-center justify-center flex-1"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="relative">
                {/* Glow behind mascot */}
                <div className={`absolute inset-0 bg-gradient-to-br ${config?.gradient} rounded-full blur-3xl opacity-30 scale-150`} />
                
                {/* Mascot image */}
                <motion.div 
                  className="relative w-64 h-64 rounded-full overflow-hidden border-4 border-white/30 shadow-2xl"
                  whileHover={{ scale: 1.05 }}
                  animate={{ y: [0, -10, 0] }}
                  transition={{ y: { repeat: Infinity, duration: 3 } }}
                >
                  <img 
                    src={config?.mascotImage} 
                    alt="Mascot" 
                    className="w-full h-full object-cover"
                  />
                </motion.div>

                {/* Floating Icon */}
                <motion.div 
                  className={`absolute -top-4 -right-4 w-16 h-16 rounded-2xl bg-gradient-to-br ${config?.gradient} flex items-center justify-center shadow-xl`}
                  animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 4 }}
                >
                  <Icon className={`w-8 h-8 ${config?.textColor}`} />
                </motion.div>
              </div>

              <motion.div 
                className={`mt-8 text-center ${config?.textColor}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <h2 className="text-3xl font-bold font-display mb-2">{config?.displayName}</h2>
                <p className={`text-lg ${isDarkMode ? 'text-purple-200' : 'text-slate-600'}`}>
                  {config?.description}
                </p>
              </motion.div>
            </motion.div>
          )}

          {/* Form Card */}
          <motion.div 
            className="w-full max-w-md flex-shrink-0"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className={`relative overflow-hidden rounded-3xl shadow-2xl ${
              isDarkMode 
                ? 'bg-slate-900/80 backdrop-blur-xl border-purple-500/30' 
                : 'bg-white/90 backdrop-blur-xl border-white/50'
            }`}>
              {/* Gradient border glow */}
              {selectedSystem && (
                <div className={`absolute -inset-1 bg-gradient-to-r ${config?.gradient} rounded-3xl blur-xl opacity-30`} />
              )}

              <div className={`relative ${isDarkMode ? 'bg-slate-900/90' : 'bg-white/95'} rounded-3xl`}>
                <CardHeader className="text-center pb-6 pt-8">
                  {/* Logo */}
                  <div className="flex justify-center mb-6">
                    <motion.div 
                      className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${config?.gradient || 'from-primary to-accent'} flex items-center justify-center shadow-lg`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <img 
                        src={isDarkMode ? logoBlack : logoWhite} 
                        alt="EnglEuphoria" 
                        className="w-12 h-12 object-contain"
                      />
                    </motion.div>
                  </div>

                  <CardTitle className={`text-3xl font-bold font-display ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    {selectedSystem ? `Join ${config?.name}!` : 'Create Account'}
                  </CardTitle>
                  <CardDescription className={isDarkMode ? 'text-purple-200' : 'text-slate-600'}>
                    {selectedSystem ? config?.description : 'Start your English learning journey'}
                  </CardDescription>
                </CardHeader>

                <CardContent className="px-6 pb-8">
                  {error && (
                    <div className="mb-4 p-3 bg-red-500/20 border border-red-500/40 rounded-xl">
                      <p className="text-sm text-red-400">{error}</p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Full Name */}
                    <div className="space-y-1.5">
                      <label className={`text-sm font-medium ${isDarkMode ? 'text-purple-200' : 'text-slate-700'}`}>
                        Full Name
                      </label>
                      <div className="relative">
                        <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-purple-400' : 'text-slate-400'}`} />
                        <Input
                          value={formData.fullName}
                          onChange={e => handleInputChange('fullName', e.target.value)}
                          placeholder="Enter your name"
                          disabled={loading}
                          className={`h-12 pl-10 rounded-xl ${
                            isDarkMode 
                              ? 'bg-slate-800/50 border-purple-500/30 text-white placeholder:text-slate-400 focus:border-purple-400' 
                              : 'bg-white/70 border-slate-200 focus:border-primary'
                          }`}
                          required
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <label className={`text-sm font-medium ${isDarkMode ? 'text-purple-200' : 'text-slate-700'}`}>
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-purple-400' : 'text-slate-400'}`} />
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={e => handleInputChange('email', e.target.value)}
                          placeholder="your@email.com"
                          disabled={loading}
                          className={`h-12 pl-10 rounded-xl ${
                            isDarkMode 
                              ? 'bg-slate-800/50 border-purple-500/30 text-white placeholder:text-slate-400 focus:border-purple-400' 
                              : 'bg-white/70 border-slate-200 focus:border-primary'
                          } ${emailError ? 'border-red-400' : ''}`}
                          required
                        />
                      </div>
                      {emailError && <p className="text-xs text-red-400">{emailError}</p>}
                    </div>

                    {/* System-specific fields */}
                    {selectedSystem === 'ACADEMY' && (
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-purple-200">
                          Grade Level
                        </label>
                        <select
                          value={formData.gradeLevel}
                          onChange={e => handleInputChange('gradeLevel', e.target.value)}
                          className="w-full h-12 px-4 rounded-xl bg-slate-800/50 border border-purple-500/30 text-white focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20"
                          required
                        >
                          <option value="" className="bg-slate-800">Select your grade</option>
                          {gradeOptions.map(grade => (
                            <option key={grade} value={grade} className="bg-slate-800">{grade}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {selectedSystem === 'HUB' && (
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700">
                          Profession
                        </label>
                        <div className="relative">
                          <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input
                            value={formData.profession}
                            onChange={e => handleInputChange('profession', e.target.value)}
                            placeholder="e.g. Software Engineer, Marketing Manager"
                            disabled={loading}
                            className="h-12 pl-10 rounded-xl bg-white/70 border-slate-200 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    )}

                    {/* Date of Birth - Hidden for KIDS (auto-valid) */}
                    {selectedSystem !== 'KIDS' && !selectedSystem && (
                      <div className="space-y-1.5">
                        <label className={`text-sm font-medium ${isDarkMode ? 'text-purple-200' : 'text-slate-700'}`}>
                          Date of Birth
                        </label>
                        <div className="relative">
                          <Calendar className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-purple-400' : 'text-slate-400'}`} />
                          <Input
                            type="date"
                            value={formData.dateOfBirth}
                            onChange={e => handleInputChange('dateOfBirth', e.target.value)}
                            max={new Date().toISOString().split('T')[0]}
                            disabled={loading}
                            className={`h-12 pl-10 rounded-xl ${
                              isDarkMode 
                                ? 'bg-slate-800/50 border-purple-500/30 text-white focus:border-purple-400' 
                                : 'bg-white/70 border-slate-200 focus:border-primary'
                            }`}
                          />
                        </div>
                      </div>
                    )}

                    {/* Password */}
                    <div className="space-y-1.5">
                      <label className={`text-sm font-medium ${isDarkMode ? 'text-purple-200' : 'text-slate-700'}`}>
                        Password
                      </label>
                      <div className="relative">
                        <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-purple-400' : 'text-slate-400'}`} />
                        <Input
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={e => handleInputChange('password', e.target.value)}
                          placeholder="Create a secure password"
                          disabled={loading}
                          className={`h-12 pl-10 pr-10 rounded-xl ${
                            isDarkMode 
                              ? 'bg-slate-800/50 border-purple-500/30 text-white placeholder:text-slate-400 focus:border-purple-400' 
                              : 'bg-white/70 border-slate-200 focus:border-primary'
                          }`}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowPassword(!showPassword)}
                          className={`absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 ${isDarkMode ? 'text-purple-300 hover:text-white' : ''}`}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>

                      {/* Password Strength */}
                      {formData.password && (
                        <div className={`mt-2 p-3 rounded-xl ${isDarkMode ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                          <div className="flex gap-1 mb-2">
                            {[1, 2, 3, 4].map(i => (
                              <div 
                                key={i} 
                                className={`flex-1 h-1 rounded-full transition-all ${
                                  i <= getPasswordStrength() 
                                    ? `bg-gradient-to-r ${config?.gradient || 'from-primary to-accent'}` 
                                    : isDarkMode ? 'bg-slate-700' : 'bg-slate-200'
                                }`} 
                              />
                            ))}
                          </div>
                          <div className="grid grid-cols-2 gap-1">
                            {passwordRequirements.map((req, idx) => (
                              <div key={idx} className="flex items-center gap-1 text-xs">
                                {req.test(formData.password) 
                                  ? <CheckCircle className="w-3 h-3 text-green-500" />
                                  : <XCircle className={`w-3 h-3 ${isDarkMode ? 'text-slate-500' : 'text-slate-300'}`} />
                                }
                                <span className={req.test(formData.password) ? 'text-green-500' : isDarkMode ? 'text-slate-400' : 'text-slate-500'}>
                                  {req.text}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-1.5">
                      <label className={`text-sm font-medium ${isDarkMode ? 'text-purple-200' : 'text-slate-700'}`}>
                        Confirm Password
                      </label>
                      <div className="relative">
                        <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-purple-400' : 'text-slate-400'}`} />
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          value={formData.confirmPassword}
                          onChange={e => handleInputChange('confirmPassword', e.target.value)}
                          placeholder="Confirm your password"
                          disabled={loading}
                          className={`h-12 pl-10 pr-10 rounded-xl ${
                            isDarkMode 
                              ? 'bg-slate-800/50 border-purple-500/30 text-white placeholder:text-slate-400 focus:border-purple-400' 
                              : 'bg-white/70 border-slate-200 focus:border-primary'
                          }`}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className={`absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 ${isDarkMode ? 'text-purple-300 hover:text-white' : ''}`}
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={loading}
                      className={`w-full h-12 rounded-xl font-semibold text-base shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] ${
                        selectedSystem
                          ? `bg-gradient-to-r ${config?.gradient} ${config?.textColor}`
                          : 'bg-gradient-to-r from-primary to-accent text-white'
                      }`}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 w-4 h-4" />
                          Start Your Journey
                        </>
                      )}
                    </Button>

                    {/* Login Link */}
                    <p className={`text-center text-sm ${isDarkMode ? 'text-purple-200' : 'text-slate-600'}`}>
                      Already have an account?{' '}
                      <Link 
                        to="/login" 
                        className={`font-semibold hover:underline ${isDarkMode ? 'text-purple-300' : 'text-primary'}`}
                      >
                        Sign in
                      </Link>
                    </p>
                  </form>
                </CardContent>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
