
-- Create subscription plans table
CREATE TABLE public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price_dzd INTEGER NOT NULL DEFAULT 0,
  price_eur INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'DZD',
  interval_type TEXT NOT NULL DEFAULT 'monthly', -- monthly, yearly, one_time
  max_classes_per_month INTEGER, -- NULL means unlimited
  features JSONB NOT NULL DEFAULT '{}',
  is_trial BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user subscriptions table
CREATE TABLE public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  status TEXT NOT NULL DEFAULT 'active', -- active, cancelled, expired, trial
  classes_used_this_month INTEGER NOT NULL DEFAULT 0,
  trial_end_date TIMESTAMPTZ,
  subscription_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  subscription_end TIMESTAMPTZ,
  payment_method TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create teacher profiles table for enhanced teacher discovery
CREATE TABLE public.teacher_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bio TEXT,
  specializations TEXT[] DEFAULT '{}',
  accent TEXT,
  languages_spoken TEXT[] DEFAULT '{}',
  intro_video_url TEXT,
  profile_image_url TEXT,
  hourly_rate_dzd INTEGER DEFAULT 2500,
  hourly_rate_eur INTEGER DEFAULT 15,
  years_experience INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0.00,
  total_reviews INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  timezone TEXT DEFAULT 'Africa/Algiers',
  availability_schedule JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create bookings table for class scheduling
CREATE TABLE public.class_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id),
  subscription_id UUID REFERENCES user_subscriptions(id),
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration INTEGER NOT NULL DEFAULT 60, -- minutes
  status TEXT NOT NULL DEFAULT 'scheduled', -- scheduled, completed, cancelled, no_show
  booking_type TEXT NOT NULL DEFAULT 'regular', -- trial, regular, makeup
  price_paid INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'DZD',
  notes TEXT,
  cancellation_reason TEXT,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create teacher reviews table
CREATE TABLE public.teacher_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  booking_id UUID NOT NULL REFERENCES class_bookings(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create messages table for in-app communication
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES class_bookings(id),
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text', -- text, booking_request, system
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL, -- class_reminder, payment_due, teacher_message, etc.
  is_read BOOLEAN DEFAULT false,
  action_url TEXT,
  scheduled_for TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default subscription plans
INSERT INTO subscription_plans (name, price_dzd, price_eur, max_classes_per_month, features, is_trial, sort_order) VALUES
('Free Trial', 0, 0, 1, '{"chat": false, "recordings": false, "materials": "basic", "support": "basic"}', true, 1),
('Basic Plan', 2500, 15, 4, '{"chat": true, "recordings": false, "materials": "standard", "support": "standard"}', false, 2),
('Standard Plan', 4500, 28, 8, '{"chat": true, "recordings": true, "materials": "premium", "support": "priority"}', false, 3),
('Premium Plan', 7500, 45, NULL, '{"chat": true, "recordings": true, "materials": "premium", "support": "priority", "unlimited": true}', false, 4);

-- Enable Row Level Security
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription_plans (public read)
CREATE POLICY "subscription_plans_public_read" ON subscription_plans FOR SELECT USING (true);

-- RLS Policies for user_subscriptions (users can view their own)
CREATE POLICY "user_subscriptions_own_read" ON user_subscriptions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "user_subscriptions_own_write" ON user_subscriptions FOR ALL USING (user_id = auth.uid());

-- RLS Policies for teacher_profiles (public read, teacher write)
CREATE POLICY "teacher_profiles_public_read" ON teacher_profiles FOR SELECT USING (true);
CREATE POLICY "teacher_profiles_own_write" ON teacher_profiles FOR ALL USING (user_id = auth.uid());

-- RLS Policies for class_bookings (student and teacher access)
CREATE POLICY "class_bookings_participant_access" ON class_bookings 
FOR ALL USING (student_id = auth.uid() OR teacher_id = auth.uid());

-- RLS Policies for teacher_reviews (public read, student write)
CREATE POLICY "teacher_reviews_public_read" ON teacher_reviews FOR SELECT USING (true);
CREATE POLICY "teacher_reviews_student_write" ON teacher_reviews FOR ALL USING (student_id = auth.uid());

-- RLS Policies for messages (sender and receiver access)
CREATE POLICY "messages_participant_access" ON messages 
FOR ALL USING (sender_id = auth.uid() OR receiver_id = auth.uid());

-- RLS Policies for notifications (user access)
CREATE POLICY "notifications_own_access" ON notifications FOR ALL USING (user_id = auth.uid());

-- Create function to update teacher rating
CREATE OR REPLACE FUNCTION update_teacher_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE teacher_profiles 
  SET 
    rating = (
      SELECT ROUND(AVG(rating::numeric), 2)
      FROM teacher_reviews 
      WHERE teacher_id = NEW.teacher_id AND is_public = true
    ),
    total_reviews = (
      SELECT COUNT(*) 
      FROM teacher_reviews 
      WHERE teacher_id = NEW.teacher_id AND is_public = true
    ),
    updated_at = now()
  WHERE user_id = NEW.teacher_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for teacher rating updates
CREATE TRIGGER trigger_update_teacher_rating
  AFTER INSERT OR UPDATE OR DELETE ON teacher_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_teacher_rating();

-- Create function to reset monthly class usage
CREATE OR REPLACE FUNCTION reset_monthly_class_usage()
RETURNS void AS $$
BEGIN
  UPDATE user_subscriptions 
  SET classes_used_this_month = 0, updated_at = now()
  WHERE DATE_TRUNC('month', updated_at) < DATE_TRUNC('month', now());
END;
$$ LANGUAGE plpgsql;
