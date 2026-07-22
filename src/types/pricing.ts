
// Lesson Package Types
export interface LessonPackage {
  id: string;
  name: string;
  lesson_count: number;
  duration_minutes: 30 | 60;
  total_price: number;
  savings_amount: number;
  is_active: boolean;
  region?: 'algeria' | 'international';
  created_at?: string;
  updated_at?: string;
}

export interface StudentPackagePurchase {
  id: string;
  student_id: string;
  package_id: string;
  lessons_remaining: number;
  total_lessons: number;
  purchased_at: string;
  expires_at?: string;
  payment_id?: string;
  package?: LessonPackage;
}

// Lesson Pricing Types
export interface LessonPricing {
  duration_minutes: 30 | 60;
  student_price: number;
  teacher_payout: number;
  platform_profit: number;
}

// Dual-duration pricing structure
export interface DurationPricing {
  duration_minutes: 30 | 60;
  price_dzd: number;
  price_eur: number;
  teacher_payout_dzd: number;
  teacher_payout_eur: number;
  platform_profit_dzd: number;
  platform_profit_eur: number;
}

export interface LessonPayment {
  id: string;
  lesson_id: string;
  student_id: string;
  teacher_id: string;
  amount_charged: number;
  teacher_payout: number;
  platform_profit: number;
  payment_method?: string;
  payment_gateway_id?: string;
  refund_amount?: number;
  refund_reason?: string;
  processed_at: string;
}

// Teacher Penalty Types
export interface TeacherPenalty {
  id: string;
  teacher_id: string;
  lesson_id?: string;
  penalty_type: 'no_show' | 'technical_issues' | 'late_cancellation';
  amount_deducted: number;
  reason?: string;
  resolved: boolean;
  applied_at: string;
}

export interface TeacherAbsence {
  id: string;
  teacher_id: string;
  lesson_id?: string;
  absence_date: string;
  absence_type: 'no_show' | 'technical_failure' | 'emergency';
  student_refunded: boolean;
  penalty_applied: boolean;
}

// Pricing Constants by Duration (Updated to 30/60 minutes)
export const LESSON_PRICING_BY_DURATION: Record<30 | 60, DurationPricing> = {
  30: {
    duration_minutes: 30,
    price_dzd: 1500,
    price_eur: 9.00,
    teacher_payout_dzd: 750,
    teacher_payout_eur: 4.50,
    platform_profit_dzd: 750,
    platform_profit_eur: 4.50
  },
  60: {
    duration_minutes: 60,
    price_dzd: 2700,
    price_eur: 16.00,
    teacher_payout_dzd: 1350,
    teacher_payout_eur: 8.00,
    platform_profit_dzd: 1350,
    platform_profit_eur: 8.00
  }
};

// Helper function to get pricing
export const getLessonPricing = (
  duration: 30 | 60,
  region: 'algeria' | 'international'
) => {
  const pricing = LESSON_PRICING_BY_DURATION[duration];
  return {
    duration: duration,
    price: region === 'algeria' ? pricing.price_dzd : pricing.price_eur,
    currency: region === 'algeria' ? 'DZD' : 'EUR',
    teacher_payout: region === 'algeria' ? pricing.teacher_payout_dzd : pricing.teacher_payout_eur,
    platform_profit: region === 'algeria' ? pricing.platform_profit_dzd : pricing.platform_profit_eur
  };
};

// Legacy constant for backward compatibility
export const LESSON_PRICING: LessonPricing = {
  duration_minutes: 60,
  student_price: 16.00,
  teacher_payout: 8.00,
  platform_profit: 8.00
};

// Legacy subscription interface for backward compatibility
export interface SubscriptionPlan {
  id: string;
  name: string;
  price_dzd: number;
  price_eur: number;
  max_classes_per_month: number | null;
  features: any;
  is_trial: boolean;
  sort_order: number;
  per_class_price?: number;
  savings_percentage?: number;
  description?: string;
}
