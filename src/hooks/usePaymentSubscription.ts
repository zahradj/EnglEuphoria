
import { useState, useEffect } from 'react';
import { paymentService, PaymentPlan, UserSubscription } from '@/services/paymentService';
import { useToast } from '@/hooks/use-toast';

interface UsePaymentSubscriptionProps {
  userId: string;
}

export function usePaymentSubscription({ userId }: UsePaymentSubscriptionProps) {
  const [plans, setPlans] = useState<PaymentPlan[]>([]);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [availablePlans, userSubscription] = await Promise.all([
        paymentService.getAvailablePlans(),
        paymentService.getUserSubscription(userId)
      ]);

      setPlans(availablePlans);
      setSubscription(userSubscription);
    } catch (error) {
      console.error('Failed to load payment data:', error);
      toast({
        title: "Error",
        description: "Failed to load subscription information",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToPlan = async (planId: string) => {
    try {
      setIsSubscribing(true);
      const newSubscription = await paymentService.createSubscription(userId, planId);
      setSubscription(newSubscription);
      
      toast({
        title: "Success",
        description: "Successfully subscribed to plan!",
      });
    } catch (error) {
      console.error('Subscription failed:', error);
      toast({
        title: "Subscription Failed",
        description: error.message || "Failed to subscribe to plan",
        variant: "destructive"
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  const bookClass = async (teacherId: string, lessonId?: string) => {
    try {
      await paymentService.bookClass(userId, teacherId, lessonId);
      // Reload subscription to get updated class count
      const updatedSubscription = await paymentService.getUserSubscription(userId);
      setSubscription(updatedSubscription);
      
      toast({
        title: "Class Booked",
        description: "Your class has been successfully booked!",
      });
    } catch (error) {
      console.error('Booking failed:', error);
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to book class",
        variant: "destructive"
      });
      throw error;
    }
  };

  const cancelSubscription = async () => {
    if (!subscription) return;

    try {
      await paymentService.cancelSubscription(subscription.id);
      setSubscription({ ...subscription, status: 'cancelled' });
      
      toast({
        title: "Subscription Cancelled",
        description: "Your subscription has been cancelled",
      });
    } catch (error) {
      console.error('Cancellation failed:', error);
      toast({
        title: "Cancellation Failed",
        description: "Failed to cancel subscription",
        variant: "destructive"
      });
    }
  };

  return {
    plans,
    subscription,
    isLoading,
    isSubscribing,
    subscribeToPlan,
    bookClass,
    cancelSubscription,
    refreshData: loadData
  };
}
