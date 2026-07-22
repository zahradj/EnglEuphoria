
-- Enhanced payment system schema for comprehensive payment tracking

-- Payment plans table for subscription tiers
CREATE TABLE public.payment_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL, -- Basic, Premium, Enterprise
  type VARCHAR CHECK (type IN ('subscription', 'one_time')) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'DZD',
  interval VARCHAR, -- month, year for subscriptions
  features JSONB, -- Plan features as JSON
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enhanced payments table
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS subscription_id UUID,
ADD COLUMN IF NOT EXISTS plan_id UUID REFERENCES payment_plans(id),
ADD COLUMN IF NOT EXISTS invoice_url TEXT,
ADD COLUMN IF NOT EXISTS receipt_email TEXT,
ADD COLUMN IF NOT EXISTS payment_gateway VARCHAR, -- stripe, cib, baridimob
ADD COLUMN IF NOT EXISTS gateway_transaction_id TEXT,
ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Subscriptions table
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  plan_id UUID REFERENCES payment_plans(id) NOT NULL,
  stripe_subscription_id TEXT UNIQUE,
  status VARCHAR CHECK (status IN ('active', 'canceled', 'past_due', 'incomplete', 'trialing')) DEFAULT 'active',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoice items for detailed billing
CREATE TABLE public.invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID REFERENCES payments(id) NOT NULL,
  description TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE payment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- Policies for payment_plans (readable by all authenticated users)
CREATE POLICY "payment_plans_select" ON payment_plans FOR SELECT TO authenticated USING (true);

-- Policies for subscriptions (users can only see their own)
CREATE POLICY "subscriptions_select" ON subscriptions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "subscriptions_insert" ON subscriptions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "subscriptions_update" ON subscriptions FOR UPDATE USING (user_id = auth.uid());

-- Policies for invoice_items (users can see items from their payments)
CREATE POLICY "invoice_items_select" ON invoice_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM payments WHERE payments.id = invoice_items.payment_id AND payments.student_id = auth.uid())
);

-- Insert default payment plans
INSERT INTO payment_plans (name, type, price, currency, interval, features) VALUES
('Basic Monthly', 'subscription', 2500, 'DZD', 'month', '{"lessons_per_month": 8, "ai_assistant": true, "homework_tracking": true}'),
('Premium Monthly', 'subscription', 4500, 'DZD', 'month', '{"lessons_per_month": 16, "ai_assistant": true, "homework_tracking": true, "priority_support": true}'),
('Enterprise Monthly', 'subscription', 7500, 'DZD', 'month', '{"lessons_per_month": -1, "ai_assistant": true, "homework_tracking": true, "priority_support": true, "custom_curriculum": true}'),
('Single Lesson', 'one_time', 350, 'DZD', null, '{"lessons": 1, "ai_assistant": false}');
