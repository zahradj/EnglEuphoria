-- Phase 9: Social Learning Communities Database Schema

-- Community categories enum
CREATE TYPE public.community_category AS ENUM (
  'conversation_practice',
  'business_english', 
  'ielts_preparation',
  'academic_english',
  'cultural_exchange',
  'pronunciation',
  'writing_practice',
  'general_discussion'
);

-- Community privacy levels
CREATE TYPE public.community_privacy AS ENUM ('public', 'private', 'invite_only');

-- Community member roles
CREATE TYPE public.community_role AS ENUM ('owner', 'moderator', 'member', 'guest');

-- Communities table
CREATE TABLE public.communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category community_category NOT NULL,
  privacy_level community_privacy DEFAULT 'public',
  cefr_level TEXT NOT NULL,
  max_members INTEGER DEFAULT 50,
  current_members INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  banner_url TEXT,
  tags TEXT[] DEFAULT '{}',
  community_rules TEXT,
  is_active BOOLEAN DEFAULT true,
  requires_approval BOOLEAN DEFAULT false,
  weekly_goal_hours INTEGER DEFAULT 2,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Community memberships
CREATE TABLE public.community_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role community_role DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  weekly_hours_contributed INTEGER DEFAULT 0,
  total_contributions INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  UNIQUE(community_id, user_id)
);

-- Community posts/discussions
CREATE TABLE public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  post_type TEXT DEFAULT 'discussion', -- discussion, question, announcement, challenge
  is_pinned BOOLEAN DEFAULT false,
  likes_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Community post replies
CREATE TABLE public.community_post_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  parent_reply_id UUID REFERENCES community_post_replies(id),
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Community challenges
CREATE TABLE public.community_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE NOT NULL,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  challenge_type TEXT NOT NULL, -- weekly_speaking, pronunciation, vocabulary
  difficulty_level INTEGER DEFAULT 1,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  reward_points INTEGER DEFAULT 100,
  is_active BOOLEAN DEFAULT true,
  challenge_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Community challenge participations
CREATE TABLE public.community_challenge_participations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID REFERENCES community_challenges(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  submission_data JSONB DEFAULT '{}',
  completed_at TIMESTAMPTZ,
  score INTEGER,
  rank INTEGER,
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(challenge_id, user_id)
);

-- Community events (speaking sessions, workshops)
CREATE TABLE public.community_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE NOT NULL,
  organizer_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL, -- speaking_session, workshop, cultural_exchange
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  max_participants INTEGER DEFAULT 10,
  current_participants INTEGER DEFAULT 0,
  room_id TEXT,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern JSONB,
  requires_signup BOOLEAN DEFAULT true,
  event_data JSONB DEFAULT '{}',
  status TEXT DEFAULT 'scheduled',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Community event participants
CREATE TABLE public.community_event_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES community_events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  attendance_status TEXT DEFAULT 'registered', -- registered, attended, no_show
  feedback_rating INTEGER,
  feedback_notes TEXT,
  UNIQUE(event_id, user_id)
);

-- User community stats
CREATE TABLE public.user_community_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  total_communities INTEGER DEFAULT 0,
  total_posts INTEGER DEFAULT 0,
  total_replies INTEGER DEFAULT 0,
  total_likes_received INTEGER DEFAULT 0,
  total_challenges_completed INTEGER DEFAULT 0,
  total_events_attended INTEGER DEFAULT 0,
  community_points INTEGER DEFAULT 0,
  reputation_score INTEGER DEFAULT 0,
  badges_earned TEXT[] DEFAULT '{}',
  streak_days INTEGER DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Community likes (for posts and replies)
CREATE TABLE public.community_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content_type TEXT NOT NULL, -- post, reply
  content_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, content_type, content_id)
);

-- Enable RLS
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_post_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_challenge_participations ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_community_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for communities
CREATE POLICY "Public communities are viewable by everyone" ON communities
  FOR SELECT USING (privacy_level = 'public' OR auth.uid() IN (
    SELECT user_id FROM community_memberships WHERE community_id = communities.id
  ));

CREATE POLICY "Users can create communities" ON communities
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Community owners and moderators can update" ON communities
  FOR UPDATE USING (auth.uid() IN (
    SELECT user_id FROM community_memberships 
    WHERE community_id = communities.id AND role IN ('owner', 'moderator')
  ));

-- RLS Policies for memberships
CREATE POLICY "Community members can view memberships" ON community_memberships
  FOR SELECT USING (community_id IN (
    SELECT community_id FROM community_memberships WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can join communities" ON community_memberships
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave communities" ON community_memberships
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for posts
CREATE POLICY "Community members can view posts" ON community_posts
  FOR SELECT USING (community_id IN (
    SELECT community_id FROM community_memberships WHERE user_id = auth.uid()
  ));

CREATE POLICY "Community members can create posts" ON community_posts
  FOR INSERT WITH CHECK (
    auth.uid() = author_id AND 
    community_id IN (SELECT community_id FROM community_memberships WHERE user_id = auth.uid())
  );

CREATE POLICY "Post authors can update their posts" ON community_posts
  FOR UPDATE USING (auth.uid() = author_id);

-- RLS Policies for replies
CREATE POLICY "Community members can view replies" ON community_post_replies
  FOR SELECT USING (post_id IN (
    SELECT id FROM community_posts WHERE community_id IN (
      SELECT community_id FROM community_memberships WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Community members can create replies" ON community_post_replies
  FOR INSERT WITH CHECK (
    auth.uid() = author_id AND 
    post_id IN (
      SELECT id FROM community_posts WHERE community_id IN (
        SELECT community_id FROM community_memberships WHERE user_id = auth.uid()
      )
    )
  );

-- RLS Policies for user stats
CREATE POLICY "Users can view their own stats" ON user_community_stats
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for likes
CREATE POLICY "Users can manage their own likes" ON community_likes
  FOR ALL USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_communities_category ON communities(category);
CREATE INDEX idx_communities_cefr_level ON communities(cefr_level);
CREATE INDEX idx_communities_privacy ON communities(privacy_level);
CREATE INDEX idx_community_memberships_user ON community_memberships(user_id);
CREATE INDEX idx_community_memberships_community ON community_memberships(community_id);
CREATE INDEX idx_community_posts_community ON community_posts(community_id);
CREATE INDEX idx_community_posts_author ON community_posts(author_id);
CREATE INDEX idx_community_posts_created ON community_posts(created_at DESC);
CREATE INDEX idx_community_replies_post ON community_post_replies(post_id);
CREATE INDEX idx_community_events_community ON community_events(community_id);
CREATE INDEX idx_community_events_scheduled ON community_events(scheduled_at);

-- Triggers for updating counts
CREATE OR REPLACE FUNCTION update_community_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE communities 
    SET current_members = current_members + 1 
    WHERE id = NEW.community_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE communities 
    SET current_members = current_members - 1 
    WHERE id = OLD.community_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER community_member_count_trigger
  AFTER INSERT OR DELETE ON community_memberships
  FOR EACH ROW EXECUTE FUNCTION update_community_member_count();

CREATE OR REPLACE FUNCTION update_post_reply_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_posts 
    SET replies_count = replies_count + 1 
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_posts 
    SET replies_count = replies_count - 1 
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER post_reply_count_trigger
  AFTER INSERT OR DELETE ON community_post_replies
  FOR EACH ROW EXECUTE FUNCTION update_post_reply_count();

-- Function to update user community stats
CREATE OR REPLACE FUNCTION update_user_community_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_community_stats (user_id, total_posts, last_activity_date)
  VALUES (NEW.author_id, 1, CURRENT_DATE)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    total_posts = user_community_stats.total_posts + 1,
    last_activity_date = CURRENT_DATE,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_stats_on_post
  AFTER INSERT ON community_posts
  FOR EACH ROW EXECUTE FUNCTION update_user_community_stats();

-- Add realtime for communities
ALTER PUBLICATION supabase_realtime ADD TABLE communities;
ALTER PUBLICATION supabase_realtime ADD TABLE community_memberships;
ALTER PUBLICATION supabase_realtime ADD TABLE community_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE community_post_replies;
ALTER PUBLICATION supabase_realtime ADD TABLE community_events;

-- Set replica identity for realtime
ALTER TABLE communities REPLICA IDENTITY FULL;
ALTER TABLE community_memberships REPLICA IDENTITY FULL;
ALTER TABLE community_posts REPLICA IDENTITY FULL;
ALTER TABLE community_post_replies REPLICA IDENTITY FULL;
ALTER TABLE community_events REPLICA IDENTITY FULL;