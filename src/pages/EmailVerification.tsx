import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Mail, ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const EmailVerification = () => {
  const [status, setStatus] = useState<'verifying' | 'verified' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      const type = searchParams.get('type');
      
      if (!token || type !== 'signup') {
        setStatus('error');
        setErrorMessage('Invalid verification link');
        return;
      }

      try {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'signup'
        });

        if (error) {
          setStatus('error');
          setErrorMessage(error.message);
        } else {
          setStatus('verified');
          toast({
            title: "Email Verified! ✅",
            description: "Your email has been successfully verified.",
          });
        }
      } catch (error: any) {
        setStatus('error');
        setErrorMessage(error.message || 'Verification failed');
      }
    };

    verifyEmail();
  }, [searchParams, toast]);

  const getStatusContent = () => {
    switch (status) {
      case 'verified':
        return {
          icon: <CheckCircle className="h-16 w-16 text-green-500" />,
          title: "Email Verified! 🎉",
          description: "Your email has been successfully verified. You can now access all features of EnglEuphoria.",
          buttonText: "Go to Dashboard",
          buttonAction: () => navigate('/dashboard')
        };
      case 'error':
        return {
          icon: <XCircle className="h-16 w-16 text-red-500" />,
          title: "Verification Failed",
          description: errorMessage || "There was an issue verifying your email. Please try again or contact support.",
          buttonText: "Back to Login",
          buttonAction: () => navigate('/login')
        };
      default:
        return {
          icon: <Loader2 className="h-16 w-16 text-purple-500 animate-spin" />,
          title: "Verifying Email...",
          description: "Please wait while we verify your email address.",
          buttonText: null,
          buttonAction: null
        };
    }
  };

  const content = getStatusContent();

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
              {content.icon}
            </div>
            <CardTitle className="text-3xl font-bold text-gray-800">
              {content.title}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="text-center space-y-6">
            <p className="text-gray-600 text-lg leading-relaxed">
              {content.description}
            </p>
            
            {content.buttonText && content.buttonAction && (
              <Button 
                onClick={content.buttonAction}
                className="w-full h-12 text-lg font-semibold bg-purple-500/90 hover:bg-purple-600/90 transition-all duration-200"
              >
                {content.buttonText}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            )}
            
            <div className="pt-4 border-t">
              <Button 
                variant="link" 
                onClick={() => navigate('/')}
                className="text-sm text-gray-600 hover:text-purple-600"
              >
                ← Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmailVerification;
