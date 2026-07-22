
export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year' | 'one_time';
  type: 'subscription' | 'one_time';
  description: string;
  popular?: boolean;
  features: {
    lessons_per_month?: number;
    lessons?: number;
    ai_assistant: boolean;
    homework_tracking: boolean;
    priority_support: boolean;
    custom_curriculum: boolean;
    progress_reports: boolean;
    certificate: boolean;
  };
}

export interface RegionalPricingPlan extends PricingPlan {
  region: 'algeria' | 'international';
}

export const getPricingPlans = async (): Promise<PricingPlan[]> => {
  // In a real app, this would fetch from Supabase
  return [
    {
      id: 'trial',
      name: 'Trial Lesson',
      price: 500,
      currency: 'DZD',
      interval: 'one_time',
      type: 'one_time',
      description: 'Try our platform with a single lesson',
      features: {
        lessons: 1,
        ai_assistant: true,
        homework_tracking: false,
        priority_support: false,
        custom_curriculum: false,
        progress_reports: false,
        certificate: false
      }
    },
    {
      id: 'basic',
      name: 'Basic Plan',
      price: 2500,
      currency: 'DZD',
      interval: 'month',
      type: 'subscription',
      description: 'Perfect for beginners',
      features: {
        lessons_per_month: 4,
        ai_assistant: true,
        homework_tracking: true,
        priority_support: false,
        custom_curriculum: false,
        progress_reports: true,
        certificate: false
      }
    },
    {
      id: 'premium',
      name: 'Premium Plan',
      price: 4500,
      currency: 'DZD',
      interval: 'month',
      type: 'subscription',
      description: 'Most popular choice',
      popular: true,
      features: {
        lessons_per_month: 8,
        ai_assistant: true,
        homework_tracking: true,
        priority_support: true,
        custom_curriculum: true,
        progress_reports: true,
        certificate: true
      }
    }
  ];
};

export const getRegionalPlans = async (region: 'algeria' | 'international'): Promise<RegionalPricingPlan[]> => {
  const basePlans = await getPricingPlans();
  
  return basePlans.map(plan => ({
    ...plan,
    region,
    // Adjust pricing based on region
    price: region === 'international' ? Math.round(plan.price * 0.1) : plan.price,
    currency: region === 'international' ? 'EUR' : 'DZD'
  }));
};
