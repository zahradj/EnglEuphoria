
import { SubscriptionPlan, LessonPackage } from '@/types/pricing';

// New lesson packages based on standardized pricing (30/60 minute lessons)
export const lessonPackages: LessonPackage[] = [
  // 30-minute packages (Algeria - DZD)
  {
    id: 'pkg-3x30-dzd',
    name: '3 × 30-min lessons',
    lesson_count: 3,
    duration_minutes: 30,
    total_price: 4350,
    savings_amount: 150,
    is_active: true,
    region: 'algeria'
  },
  {
    id: 'pkg-5x30-dzd',
    name: '5 × 30-min lessons',
    lesson_count: 5,
    duration_minutes: 30,
    total_price: 7250,
    savings_amount: 250,
    is_active: true,
    region: 'algeria'
  },
  {
    id: 'pkg-10x30-dzd',
    name: '10 × 30-min lessons',
    lesson_count: 10,
    duration_minutes: 30,
    total_price: 14500,
    savings_amount: 500,
    is_active: true,
    region: 'algeria'
  },
  
  // 60-minute packages (Algeria - DZD)
  {
    id: 'pkg-3x60-dzd',
    name: '3 × 60-min lessons',
    lesson_count: 3,
    duration_minutes: 60,
    total_price: 7800,
    savings_amount: 300,
    is_active: true,
    region: 'algeria'
  },
  {
    id: 'pkg-5x60-dzd',
    name: '5 × 60-min lessons',
    lesson_count: 5,
    duration_minutes: 60,
    total_price: 13000,
    savings_amount: 500,
    is_active: true,
    region: 'algeria'
  },
  {
    id: 'pkg-10x60-dzd',
    name: '10 × 60-min lessons',
    lesson_count: 10,
    duration_minutes: 60,
    total_price: 26000,
    savings_amount: 1000,
    is_active: true,
    region: 'algeria'
  },
  
  // 30-minute packages (International - EUR)
  {
    id: 'pkg-3x30-eur',
    name: '3 × 30-min lessons',
    lesson_count: 3,
    duration_minutes: 30,
    total_price: 26.00,
    savings_amount: 1.00,
    is_active: true,
    region: 'international'
  },
  {
    id: 'pkg-5x30-eur',
    name: '5 × 30-min lessons',
    lesson_count: 5,
    duration_minutes: 30,
    total_price: 43.50,
    savings_amount: 1.50,
    is_active: true,
    region: 'international'
  },
  {
    id: 'pkg-10x30-eur',
    name: '10 × 30-min lessons',
    lesson_count: 10,
    duration_minutes: 30,
    total_price: 87.00,
    savings_amount: 3.00,
    is_active: true,
    region: 'international'
  },
  
  // 60-minute packages (International - EUR)
  {
    id: 'pkg-3x60-eur',
    name: '3 × 60-min lessons',
    lesson_count: 3,
    duration_minutes: 60,
    total_price: 46.00,
    savings_amount: 2.00,
    is_active: true,
    region: 'international'
  },
  {
    id: 'pkg-5x60-eur',
    name: '5 × 60-min lessons',
    lesson_count: 5,
    duration_minutes: 60,
    total_price: 77.00,
    savings_amount: 3.00,
    is_active: true,
    region: 'international'
  },
  {
    id: 'pkg-10x60-eur',
    name: '10 × 60-min lessons',
    lesson_count: 10,
    duration_minutes: 60,
    total_price: 154.00,
    savings_amount: 6.00,
    is_active: true,
    region: 'international'
  }
];

// Legacy subscription plans for backward compatibility
export const fallbackPlans: SubscriptionPlan[] = [
  {
    id: 'trial',
    name: 'Free Trial',
    price_dzd: 0,
    price_eur: 0,
    max_classes_per_month: 1,
    per_class_price: 0,
    features: { 
      trial_class: true, 
      selected_teachers: true, 
      basic_materials: false,
      rescheduling: false,
      downloadable_content: false 
    },
    is_trial: true,
    sort_order: 1,
    description: '1 class with selected teachers'
  },
  {
    id: 'starter',
    name: 'Starter Pack',
    price_dzd: 6500,
    price_eur: 40,
    max_classes_per_month: 4,
    per_class_price: 10,
    features: { 
      any_teacher: true, 
      basic_materials: true, 
      chat_support: true,
      rescheduling: false,
      downloadable_content: false 
    },
    is_trial: false,
    sort_order: 2,
    description: 'Book any teacher, basic materials access'
  },
  {
    id: 'smart',
    name: 'Smart Learner',
    price_dzd: 12200,
    price_eur: 75,
    max_classes_per_month: 8,
    per_class_price: 9.37,
    savings_percentage: 6,
    features: { 
      any_teacher: true, 
      full_materials: true, 
      priority_support: true,
      rescheduling: true,
      downloadable_content: false 
    },
    is_trial: false,
    sort_order: 3,
    description: 'Save 6%, full access to teachers/materials'
  },
  {
    id: 'power',
    name: 'Power Learner',
    price_dzd: 17900,
    price_eur: 110,
    max_classes_per_month: 12,
    per_class_price: 9.16,
    savings_percentage: 8,
    features: { 
      any_teacher: true, 
      full_materials: true, 
      priority_support: true,
      rescheduling: true,
      downloadable_content: true 
    },
    is_trial: false,
    sort_order: 4,
    description: 'Save 8%, rescheduling + downloadable content'
  },
  {
    id: 'pay_as_go',
    name: 'Pay-As-You-Go',
    price_dzd: 1630,
    price_eur: 10,
    max_classes_per_month: 1,
    per_class_price: 10,
    features: { 
      any_teacher: true, 
      basic_materials: true, 
      one_time: true,
      rescheduling: false,
      downloadable_content: false 
    },
    is_trial: false,
    sort_order: 5,
    description: 'One-time class, book any teacher'
  }
];
