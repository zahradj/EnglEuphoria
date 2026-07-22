
import { supabase } from '@/lib/supabase';

export interface PaymentPlan {
  id: string;
  name: string;
  price_dzd: number;
  price_eur: number;
  max_classes_per_month: number | null;
  features: Record<string, any>;
  is_trial: boolean;
  interval_type: 'monthly' | 'yearly';
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'cancelled' | 'expired';
  classes_used_this_month: number;
  subscription_start: string;
  subscription_end: string | null;
  plan?: PaymentPlan;
}

export interface PaymentHistoryItem {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  payment_method: string;
  payment_gateway?: string;
  created_at: string;
  plan?: PaymentPlan;
  invoice_url?: string;
}

export interface SubscriptionDetails {
  id: string;
  status: 'active' | 'cancelled' | 'expired';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  plan: {
    id: string;
    name: string;
    price: number;
    currency: string;
  };
}

class PaymentService {
  async getAvailablePlans(): Promise<PaymentPlan[]> {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to fetch payment plans:', error);
      return [];
    }
  }

  async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          plan:subscription_plans(*)
        `)
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      console.error('Failed to fetch user subscription:', error);
      return null;
    }
  }

  async getCurrentSubscription(): Promise<SubscriptionDetails | null> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const subscription = await this.getUserSubscription(user.id);
      if (!subscription || !subscription.plan) return null;

      return {
        id: subscription.id,
        status: subscription.status,
        current_period_start: subscription.subscription_start,
        current_period_end: subscription.subscription_end || '',
        cancel_at_period_end: subscription.status === 'cancelled',
        plan: {
          id: subscription.plan.id,
          name: subscription.plan.name,
          price: subscription.plan.price_dzd,
          currency: 'DZD'
        }
      };
    } catch (error) {
      console.error('Failed to get current subscription:', error);
      return null;
    }
  }

  async getPaymentHistory(): Promise<PaymentHistoryItem[]> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          plan:subscription_plans(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to fetch payment history:', error);
      return [];
    }
  }

  async openCustomerPortal(): Promise<{ url: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to open customer portal:', error);
      throw error;
    }
  }

  async verifyPayment(sessionId: string): Promise<{ success: boolean; status: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: { sessionId }
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to verify payment:', error);
      throw error;
    }
  }

  async createSubscription(userId: string, planId: string): Promise<UserSubscription> {
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: userId,
          plan_id: planId,
          status: 'active',
          classes_used_this_month: 0,
          subscription_start: new Date().toISOString(),
          payment_method: 'stripe' // Default for now
        })
        .select(`
          *,
          plan:subscription_plans(*)
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to create subscription:', error);
      throw error;
    }
  }

  async bookClass(studentId: string, teacherId: string, lessonId?: string): Promise<void> {
    try {
      // Check if user has available classes in their subscription
      const subscription = await this.getUserSubscription(studentId);
      
      if (!subscription) {
        throw new Error('No active subscription found');
      }

      if (subscription.plan?.max_classes_per_month && 
          subscription.classes_used_this_month >= subscription.plan.max_classes_per_month) {
        throw new Error('Monthly class limit reached');
      }

      // Create class booking
      const { error: bookingError } = await supabase
        .from('class_bookings')
        .insert({
          student_id: studentId,
          teacher_id: teacherId,
          lesson_id: lessonId,
          subscription_id: subscription.id,
          status: 'scheduled',
          booking_type: 'subscription',
          scheduled_at: new Date().toISOString(),
          price_paid: 0 // Covered by subscription
        });

      if (bookingError) throw bookingError;

      // Update classes used count
      const { error: updateError } = await supabase
        .from('user_subscriptions')
        .update({
          classes_used_this_month: subscription.classes_used_this_month + 1
        })
        .eq('id', subscription.id);

      if (updateError) throw updateError;

    } catch (error) {
      console.error('Failed to book class:', error);
      throw error;
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_subscriptions')
        .update({
          status: 'cancelled',
          subscription_end: new Date().toISOString()
        })
        .eq('id', subscriptionId);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      throw error;
    }
  }
}

export const paymentService = new PaymentService();
