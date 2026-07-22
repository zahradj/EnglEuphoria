
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { paymentService } from "@/services/paymentService";

export const usePaymentVerification = () => {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      verifyPayment(sessionId);
    }
  }, [searchParams]);

  const verifyPayment = async (sessionId: string) => {
    try {
      setIsLoading(true);
      const result = await paymentService.verifyPayment(sessionId);
      
      if (result.success && result.status === 'paid') {
        setPaymentSuccess(true);
        localStorage.removeItem('pendingUser');
        toast({
          title: "Payment Successful!",
          description: "Your payment has been processed successfully.",
        });
        setTimeout(() => navigate("/dashboard"), 3000);
      } else {
        toast({
          title: "Payment Verification",
          description: "Payment is still being processed. Please check back later.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Payment Error",
        description: "Failed to verify payment. Please contact support.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    paymentSuccess
  };
};
