import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Eye, EyeOff, CheckCircle, ArrowRight, Loader2, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ResetPassword = () => {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Listen for PASSWORD_RECOVERY event from Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessionReady(true);
        setCheckingSession(false);
      }
    });

    // Also check if there's already a session (user may have landed with hash fragment already processed)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSessionReady(true);
        setCheckingSession(false);
      }
    });

    // Timeout after 5 seconds if no recovery session detected
    const timeout = setTimeout(() => {
      setCheckingSession(prev => {
        if (prev) {
          setSessionExpired(true);
          return false;
        }
        return prev;
      });
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const passwordRequirements = [
    { test: (pwd: string) => pwd.length >= 6, text: t('st.auth.req6', 'At least 6 characters') },
    { test: (pwd: string) => /[A-Z]/.test(pwd), text: t('st.auth.reqUpper', 'One uppercase letter') },
    { test: (pwd: string) => /[0-9]/.test(pwd), text: t('st.auth.reqNumber', 'One number') },
  ];

  const getPasswordStrength = (): number => {
    return passwordRequirements.filter(req => req.test(password)).length;
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (getPasswordStrength() < 2) {
      toast({
        title: t('st.auth.weak', 'Password Too Weak'),
        description: t('st.auth.weakDesc', 'Password must meet at least 2 security requirements.'),
        variant: "destructive"
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: t('st.auth.mismatch', "Passwords Don't Match"),
        description: t('st.auth.mismatchDesc', 'Please make sure both passwords are identical.'),
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        toast({
          title: t('st.auth.resetFailed', 'Reset Failed'),
          description: error.message || t('st.auth.resetFailedDesc', 'Failed to reset password.'),
          variant: "destructive"
        });
      } else {
        toast({
          title: t('st.auth.resetOk', 'Password Reset Successful! ✅'),
          description: t('st.auth.resetOkDesc', 'Your password has been updated. You can now log in.'),
        });
        await supabase.auth.signOut();
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (error: any) {
      toast({
        title: t('st.auth.resetError', 'Reset Error'),
        description: error.message || t('st.auth.unexpected', 'An unexpected error occurred.'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Loading state while checking for recovery session
  if (checkingSession) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-gradient-to-br from-gray-50 via-purple-50/20 to-gray-50">
        <Card className="w-full max-w-md shadow-2xl bg-white/95 backdrop-blur-sm border-0">
          <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-purple-500" />
            <p className="text-gray-600 text-sm">{t('st.auth.verifying', 'Verifying your reset link...')}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Expired / invalid link state
  if (sessionExpired && !sessionReady) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-gradient-to-br from-gray-50 via-purple-50/20 to-gray-50">
        <Card className="w-full max-w-md shadow-2xl bg-white/95 backdrop-blur-sm border-0">
          <CardContent className="flex flex-col items-center justify-center py-16 gap-4 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">{t('st.auth.expired', 'Link Expired or Invalid')}</h2>
            <p className="text-gray-600 text-sm max-w-xs">
              {t('st.auth.expiredDesc', 'This password reset link has expired or is invalid. Please request a new one.')}
            </p>
            <Button
              onClick={() => navigate('/login')}
              className="mt-4 bg-purple-500/90 hover:bg-purple-600/90"
            >
              {t('st.auth.backLogin', 'Back to Login')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-dvh relative overflow-hidden bg-gradient-to-br from-gray-50 via-purple-50/20 to-gray-50">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-80 h-80 bg-gradient-to-r from-purple-300/15 to-purple-400/15 rounded-full mix-blend-multiply filter blur-3xl animate-float-slow"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-purple-400/10 to-purple-500/10 rounded-full mix-blend-multiply filter blur-3xl animate-float-delayed"></div>
      </div>
      
      <div className="relative z-10 flex items-center justify-center min-h-dvh p-4">
        <Card className="w-full max-w-md shadow-2xl bg-white/95 backdrop-blur-sm border-0 animate-fade-in">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-purple-500/80 rounded-full flex items-center justify-center">
                <Lock className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-gray-800">
              {t('st.auth.resetTitle', 'Reset Password 🔐')}
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  {t('st.set.newPw', 'New Password')}
                </label>
                <div className="relative">
                  <Lock className="absolute start-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('st.auth.enterNew', 'Enter new password')}
                    className="ps-10 pe-10 h-11"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute end-0 top-0 h-11 px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
                
                {password && (
                  <div className="mt-2 space-y-1">
                    {passwordRequirements.map((req, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs">
                        <CheckCircle className={`h-3 w-3 ${req.test(password) ? 'text-green-500' : 'text-gray-300'}`} />
                        <span className={req.test(password) ? 'text-green-600' : 'text-gray-400'}>{req.text}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  {t('st.auth.confirm', 'Confirm Password')}
                </label>
                <div className="relative">
                  <Lock className="absolute start-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t('st.auth.confirmNew', 'Confirm new password')}
                    className="ps-10 pe-10 h-11"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute end-0 top-0 h-11 px-3 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 text-lg font-semibold bg-purple-500/90 hover:bg-purple-600/90 transition-all duration-200"
              >
                {loading ? t('st.auth.resetting', 'Resetting...') : t('st.auth.resetBtn', 'Reset Password')}
                {!loading && <ArrowRight className="ms-2 h-5 w-5 rtl:rotate-180" />}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <Button 
                variant="link" 
                onClick={() => navigate('/login')}
                className="text-sm text-gray-600 hover:text-purple-600"
              >
                <span className="inline-block rtl:rotate-180">←</span> {t('st.auth.backLogin', 'Back to Login')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
