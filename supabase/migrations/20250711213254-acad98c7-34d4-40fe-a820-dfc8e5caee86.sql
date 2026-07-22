-- Create comprehensive gamification system tables

-- Learning currency system
CREATE TABLE public.learning_currency (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  total_coins INTEGER NOT NULL DEFAULT 0,
  coins_spent INTEGER NOT NULL DEFAULT 0,
  streak_bonus_coins INTEGER NOT NULL DEFAULT 0,
  achievement_bonus_coins INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Learning streaks and challenges
CREATE TABLE public.learning_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  challenge_type TEXT NOT NULL, -- 'daily', 'weekly', 'monthly', 'seasonal'
  difficulty_level INTEGER NOT NULL DEFAULT 1,
  requirements JSONB NOT NULL DEFAULT '{}',
  rewards JSONB NOT NULL DEFAULT '{}',
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Student challenge participation
CREATE TABLE public.student_challenge_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  challenge_id UUID NOT NULL REFERENCES public.learning_challenges(id),
  progress_data JSONB NOT NULL DEFAULT '{}',
  completion_percentage INTEGER NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, challenge_id)
);

-- Enhanced achievement system with tiers
CREATE TABLE public.achievement_tiers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id),
  tier_level INTEGER NOT NULL, -- 1=Bronze, 2=Silver, 3=Gold, 4=Platinum
  tier_name TEXT NOT NULL,
  requirements JSONB NOT NULL DEFAULT '{}',
  xp_reward INTEGER NOT NULL DEFAULT 0,
  coin_reward INTEGER NOT NULL DEFAULT 0,
  unlock_requirements JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Student achievement tiers progress
CREATE TABLE public.student_achievement_tiers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  achievement_tier_id UUID NOT NULL REFERENCES public.achievement_tiers(id),
  progress_data JSONB NOT NULL DEFAULT '{}',
  unlocked_at TIMESTAMP WITH TIME ZONE,
  is_unlocked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, achievement_tier_id)
);

-- Learning streaks tracking
CREATE TABLE public.student_learning_streaks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  streak_type TEXT NOT NULL, -- 'daily', 'weekly', 'monthly'
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
  streak_multiplier DECIMAL(3,2) NOT NULL DEFAULT 1.0,
  bonus_coins_earned INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, streak_type)
);

-- Virtual rewards store
CREATE TABLE public.virtual_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL, -- 'avatar', 'theme', 'feature_unlock', 'boost'
  cost_coins INTEGER NOT NULL,
  rarity TEXT NOT NULL DEFAULT 'common', -- 'common', 'rare', 'epic', 'legendary'
  metadata JSONB NOT NULL DEFAULT '{}',
  is_available BOOLEAN NOT NULL DEFAULT true,
  limited_quantity INTEGER,
  purchased_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Student reward purchases
CREATE TABLE public.student_reward_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  reward_id UUID NOT NULL REFERENCES public.virtual_rewards(id),
  coins_spent INTEGER NOT NULL,
  purchased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Leaderboards
CREATE TABLE public.leaderboards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  leaderboard_type TEXT NOT NULL, -- 'global', 'community', 'weekly', 'monthly'
  scope_identifier UUID, -- community_id for community leaderboards
  calculation_period TEXT NOT NULL, -- 'current', 'weekly', 'monthly', 'all_time'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Leaderboard entries
CREATE TABLE public.leaderboard_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  leaderboard_id UUID NOT NULL REFERENCES public.leaderboards(id),
  student_id UUID NOT NULL,
  score INTEGER NOT NULL,
  rank_position INTEGER NOT NULL,
  additional_data JSONB DEFAULT '{}',
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(leaderboard_id, student_id)
);

-- Social achievements and sharing
CREATE TABLE public.achievement_shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id),
  achievement_tier_id UUID REFERENCES public.achievement_tiers(id),
  share_platform TEXT NOT NULL, -- 'community', 'social_media'
  share_message TEXT,
  likes_count INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  shared_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Seasonal events
CREATE TABLE public.seasonal_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  theme_data JSONB NOT NULL DEFAULT '{}',
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  special_rewards JSONB NOT NULL DEFAULT '{}',
  participation_requirements JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.learning_currency ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_challenge_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievement_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_achievement_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_learning_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.virtual_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_reward_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievement_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seasonal_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for learning_currency
CREATE POLICY "Users can view their own learning currency" ON public.learning_currency
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Users can update their own learning currency" ON public.learning_currency
  FOR UPDATE USING (auth.uid() = student_id);

CREATE POLICY "System can insert learning currency" ON public.learning_currency
  FOR INSERT WITH CHECK (auth.uid() = student_id);

-- RLS Policies for learning_challenges
CREATE POLICY "Anyone can view active challenges" ON public.learning_challenges
  FOR SELECT USING (is_active = true);

-- RLS Policies for student_challenge_progress
CREATE POLICY "Users can view their own challenge progress" ON public.student_challenge_progress
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Users can create their own challenge progress" ON public.student_challenge_progress
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Users can update their own challenge progress" ON public.student_challenge_progress
  FOR UPDATE USING (auth.uid() = student_id);

-- RLS Policies for achievement_tiers
CREATE POLICY "Anyone can view achievement tiers" ON public.achievement_tiers
  FOR SELECT USING (true);

-- RLS Policies for student_achievement_tiers
CREATE POLICY "Users can view their own achievement tiers" ON public.student_achievement_tiers
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "System can insert achievement tiers" ON public.student_achievement_tiers
  FOR INSERT WITH CHECK (auth.uid() = student_id);

-- RLS Policies for student_learning_streaks
CREATE POLICY "Users can view their own streaks" ON public.student_learning_streaks
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Users can manage their own streaks" ON public.student_learning_streaks
  FOR ALL USING (auth.uid() = student_id);

-- RLS Policies for virtual_rewards
CREATE POLICY "Anyone can view available rewards" ON public.virtual_rewards
  FOR SELECT USING (is_available = true);

-- RLS Policies for student_reward_purchases
CREATE POLICY "Users can view their own purchases" ON public.student_reward_purchases
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Users can make purchases" ON public.student_reward_purchases
  FOR INSERT WITH CHECK (auth.uid() = student_id);

-- RLS Policies for leaderboards
CREATE POLICY "Anyone can view leaderboards" ON public.leaderboards
  FOR SELECT USING (true);

-- RLS Policies for leaderboard_entries
CREATE POLICY "Anyone can view leaderboard entries" ON public.leaderboard_entries
  FOR SELECT USING (true);

-- RLS Policies for achievement_shares
CREATE POLICY "Users can create their own shares" ON public.achievement_shares
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Anyone can view achievement shares" ON public.achievement_shares
  FOR SELECT USING (true);

-- RLS Policies for seasonal_events
CREATE POLICY "Anyone can view active seasonal events" ON public.seasonal_events
  FOR SELECT USING (is_active = true);

-- Create functions for gamification system
CREATE OR REPLACE FUNCTION public.update_learning_currency(
  student_uuid UUID,
  coins_to_add INTEGER,
  currency_source TEXT DEFAULT 'general'
) 
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_record RECORD;
  new_total INTEGER;
BEGIN
  -- Get or create currency record
  SELECT * INTO current_record FROM public.learning_currency WHERE student_id = student_uuid;
  
  IF current_record IS NULL THEN
    INSERT INTO public.learning_currency (student_id, total_coins)
    VALUES (student_uuid, coins_to_add)
    RETURNING * INTO current_record;
    new_total := coins_to_add;
  ELSE
    new_total := current_record.total_coins + coins_to_add;
    
    UPDATE public.learning_currency 
    SET 
      total_coins = new_total,
      streak_bonus_coins = CASE WHEN currency_source = 'streak' THEN streak_bonus_coins + coins_to_add ELSE streak_bonus_coins END,
      achievement_bonus_coins = CASE WHEN currency_source = 'achievement' THEN achievement_bonus_coins + coins_to_add ELSE achievement_bonus_coins END,
      updated_at = now()
    WHERE student_id = student_uuid;
  END IF;
  
  RETURN jsonb_build_object(
    'total_coins', new_total,
    'coins_added', coins_to_add,
    'source', currency_source
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.update_learning_streak(
  student_uuid UUID,
  streak_type_param TEXT DEFAULT 'daily'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_record RECORD;
  new_streak INTEGER;
  streak_multiplier DECIMAL(3,2);
  bonus_coins INTEGER;
BEGIN
  SELECT * INTO current_record FROM public.student_learning_streaks 
  WHERE student_id = student_uuid AND streak_type = streak_type_param;
  
  IF current_record IS NULL THEN
    INSERT INTO public.student_learning_streaks (student_id, streak_type, current_streak, longest_streak)
    VALUES (student_uuid, streak_type_param, 1, 1)
    RETURNING * INTO current_record;
    new_streak := 1;
  ELSE
    -- Check if streak should continue or reset
    IF current_record.last_activity_date = CURRENT_DATE - INTERVAL '1 day' THEN
      new_streak := current_record.current_streak + 1;
    ELSIF current_record.last_activity_date = CURRENT_DATE THEN
      new_streak := current_record.current_streak; -- Same day, no change
    ELSE
      new_streak := 1; -- Reset streak
    END IF;
    
    UPDATE public.student_learning_streaks
    SET 
      current_streak = new_streak,
      longest_streak = GREATEST(longest_streak, new_streak),
      last_activity_date = CURRENT_DATE,
      updated_at = now()
    WHERE student_id = student_uuid AND streak_type = streak_type_param;
  END IF;
  
  -- Calculate bonus coins based on streak
  bonus_coins := CASE 
    WHEN new_streak >= 30 THEN 50
    WHEN new_streak >= 14 THEN 25
    WHEN new_streak >= 7 THEN 10
    WHEN new_streak >= 3 THEN 5
    ELSE 0
  END;
  
  -- Award bonus coins if applicable
  IF bonus_coins > 0 THEN
    PERFORM public.update_learning_currency(student_uuid, bonus_coins, 'streak');
  END IF;
  
  RETURN jsonb_build_object(
    'current_streak', new_streak,
    'longest_streak', GREATEST(current_record.longest_streak, new_streak),
    'bonus_coins', bonus_coins,
    'streak_type', streak_type_param
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.purchase_virtual_reward(
  student_uuid UUID,
  reward_uuid UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  reward_record RECORD;
  currency_record RECORD;
  purchase_result JSONB;
BEGIN
  -- Get reward details
  SELECT * INTO reward_record FROM public.virtual_rewards WHERE id = reward_uuid AND is_available = true;
  
  IF reward_record IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Reward not found or not available');
  END IF;
  
  -- Check if limited quantity and still available
  IF reward_record.limited_quantity IS NOT NULL AND reward_record.purchased_count >= reward_record.limited_quantity THEN
    RETURN jsonb_build_object('success', false, 'error', 'Reward sold out');
  END IF;
  
  -- Get student currency
  SELECT * INTO currency_record FROM public.learning_currency WHERE student_id = student_uuid;
  
  IF currency_record IS NULL OR currency_record.total_coins < reward_record.cost_coins THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient coins');
  END IF;
  
  -- Make the purchase
  INSERT INTO public.student_reward_purchases (student_id, reward_id, coins_spent)
  VALUES (student_uuid, reward_uuid, reward_record.cost_coins);
  
  -- Deduct coins
  UPDATE public.learning_currency
  SET 
    total_coins = total_coins - reward_record.cost_coins,
    coins_spent = coins_spent + reward_record.cost_coins,
    updated_at = now()
  WHERE student_id = student_uuid;
  
  -- Update purchase count
  UPDATE public.virtual_rewards
  SET purchased_count = purchased_count + 1
  WHERE id = reward_uuid;
  
  RETURN jsonb_build_object(
    'success', true,
    'reward_name', reward_record.name,
    'coins_spent', reward_record.cost_coins,
    'remaining_coins', currency_record.total_coins - reward_record.cost_coins
  );
END;
$$;

-- Create indexes for performance
CREATE INDEX idx_learning_currency_student ON public.learning_currency(student_id);
CREATE INDEX idx_student_challenge_progress_student ON public.student_challenge_progress(student_id);
CREATE INDEX idx_student_challenge_progress_challenge ON public.student_challenge_progress(challenge_id);
CREATE INDEX idx_student_achievement_tiers_student ON public.student_achievement_tiers(student_id);
CREATE INDEX idx_student_learning_streaks_student_type ON public.student_learning_streaks(student_id, streak_type);
CREATE INDEX idx_student_reward_purchases_student ON public.student_reward_purchases(student_id);
CREATE INDEX idx_leaderboard_entries_leaderboard ON public.leaderboard_entries(leaderboard_id);
CREATE INDEX idx_leaderboard_entries_rank ON public.leaderboard_entries(leaderboard_id, rank_position);
CREATE INDEX idx_achievement_shares_student ON public.achievement_shares(student_id);

-- Add triggers for automatic updates
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_learning_currency_updated_at BEFORE UPDATE ON public.learning_currency 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_student_challenge_progress_updated_at BEFORE UPDATE ON public.student_challenge_progress 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_student_learning_streaks_updated_at BEFORE UPDATE ON public.student_learning_streaks 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add to realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.learning_currency;
ALTER PUBLICATION supabase_realtime ADD TABLE public.student_challenge_progress;
ALTER PUBLICATION supabase_realtime ADD TABLE public.student_learning_streaks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.leaderboard_entries;