import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Eye, EyeOff, CheckCircle, ArrowRight, Loader2, AlertTriangle, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const SetPassword = () => {
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setSessionReady(true);
        setCheckingSession(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSessionReady(true);
        setCheckingSession(false);
      }
    });

    const timeout = setTimeout(() => {
      setCheckingSession(prev => {
        if (prev) {
          setSessionExpired(true);
          return false;
        }
        return prev;
      });
    }, 8000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const passwordRequirements = [
    { test: (pwd: string) => pwd.length >= 6, text: "At least 6 characters" },
    { test: (pwd: string) => /[A-Z]/.test(pwd), text: "One uppercase letter" },
    { test: (pwd: string) => /[0-9]/.test(pwd), text: "One number" },
  ];

  const getPasswordStrength = (): number => {
    return passwordRequirements.filter(req => req.test(password)).length;
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (getPasswordStrength() < 2) {
      toast({ title: "Password Too Weak", description: "Password must meet at least 2 security requirements.", variant: "destructive" });
      return;
    }

    if (password !== confirmPassword) {
      toast({ title: "Passwords Don't Match", description: "Please make sure both passwords are identical.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        toast({ title: "Failed to Set Password", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Welcome to EnglEuphoria! 🎉", description: "Your password has been set. Redirecting to your dashboard..." });
        setTimeout(() => navigate('/teacher'), 2000);
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-gradient-to-br from-gray-50 via-purple-50/20 to-gray-50">
        <Card className="w-full max-w-md shadow-2xl bg-white/95 backdrop-blur-sm border-0">
          <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-purple-500" />
            <p className="text-muted-foreground text-sm">Verifying your invitation link...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (sessionExpired && !sessionReady) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-gradient-to-br from-gray-50 via-purple-50/20 to-gray-50">
        <Card className="w-full max-w-md shadow-2xl bg-white/95 backdrop-blur-sm border-0">
          <CardContent className="flex flex-col items-center justify-center py-16 gap-4 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Link Expired or Invalid</h2>
            <p className="text-muted-foreground text-sm max-w-xs">
              This invitation link has expired or is invalid. Please contact the EnglEuphoria team for a new one.
            </p>
            <Button onClick={() => navigate('/login')} className="mt-4 bg-purple-500/90 hover:bg-purple-600/90">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-dvh relative overflow-hidden bg-gradient-to-br from-gray-50 via-purple-50/20 to-gray-50">
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-80 h-80 bg-gradient-to-r from-purple-300/15 to-purple-400/15 rounded-full mix-blend-multiply filter blur-3xl animate-float-slow"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-purple-400/10 to-purple-500/10 rounded-full mix-blend-multiply filter blur-3xl animate-float-delayed"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-dvh p-4">
        <Card className="w-full max-w-md shadow-2xl bg-white/95 backdrop-blur-sm border-0 animate-fade-in">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-purple-500/80 rounded-full flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-foreground">
              Welcome to EnglEuphoria! 🎉
            </CardTitle>
            <p className="text-muted-foreground mt-2">Set your password to access your Teacher Dashboard</p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSetPassword} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Create Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="pl-10 pr-10 h-11"
                  />
                  <Button type="button" variant="ghost" size="sm"
                    className="absolute right-0 top-0 h-11 px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                  </Button>
                </div>
                {password && (
                  <div className="mt-2 space-y-1">
                    {passwordRequirements.map((req, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs">
                        <CheckCircle className={`h-3 w-3 ${req.test(password) ? 'text-green-500' : 'text-muted-foreground/40'}`} />
                        <span className={req.test(password) ? 'text-green-600' : 'text-muted-foreground/60'}>{req.text}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="pl-10 pr-10 h-11"
                  />
                  <Button type="button" variant="ghost" size="sm"
                    className="absolute right-0 top-0 h-11 px-3 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                  </Button>
                </div>
              </div>

              <Button type="submit" disabled={loading}
                className="w-full h-12 text-lg font-semibold bg-purple-500/90 hover:bg-purple-600/90 transition-all duration-200">
                {loading ? "Setting up..." : "Set Password & Enter Dashboard"}
                {!loading && <ArrowRight className="ml-2 h-5 w-5" />}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SetPassword;
