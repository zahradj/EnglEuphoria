export type CommunityCategory = 
  | 'conversation_practice'
  | 'business_english'
  | 'ielts_preparation'
  | 'academic_english'
  | 'cultural_exchange'
  | 'pronunciation'
  | 'writing_practice'
  | 'general_discussion';

export type CommunityPrivacy = 'public' | 'private' | 'invite_only';
export type CommunityRole = 'owner' | 'moderator' | 'member' | 'guest';

export interface Community {
  id: string;
  name: string;
  description?: string;
  category: CommunityCategory;
  privacy_level: CommunityPrivacy;
  cefr_level: string;
  max_members: number;
  current_members: number;
  created_by: string;
  banner_url?: string;
  tags: string[];
  community_rules?: string;
  is_active: boolean;
  requires_approval: boolean;
  weekly_goal_hours: number;
  created_at: string;
  updated_at: string;
}

export interface CommunityMembership {
  id: string;
  community_id: string;
  user_id: string;
  role: CommunityRole;
  joined_at: string;
  last_active_at: string;
  weekly_hours_contributed: number;
  total_contributions: number;
  status: string;
  community?: Community;
}

export interface CommunityPost {
  id: string;
  community_id: string;
  author_id: string;
  title?: string;
  content: string;
  post_type: 'discussion' | 'question' | 'announcement' | 'challenge';
  is_pinned: boolean;
  likes_count: number;
  replies_count: number;
  tags: string[];
  created_at: string;
  updated_at: string;
  author?: {
    id: string;
    full_name?: string;
    avatar_url?: string;
  };
  user_liked?: boolean;
}

export interface CommunityPostReply {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  parent_reply_id?: string;
  likes_count: number;
  created_at: string;
  updated_at: string;
  author?: {
    id: string;
    full_name?: string;
    avatar_url?: string;
  };
  user_liked?: boolean;
}

export interface CommunityChallenge {
  id: string;
  community_id: string;
  created_by: string;
  title: string;
  description: string;
  challenge_type: 'weekly_speaking' | 'pronunciation' | 'vocabulary';
  difficulty_level: number;
  start_date: string;
  end_date: string;
  max_participants?: number;
  current_participants: number;
  reward_points: number;
  is_active: boolean;
  challenge_data: Record<string, any>;
  created_at: string;
}

export interface CommunityEvent {
  id: string;
  community_id: string;
  organizer_id: string;
  title: string;
  description?: string;
  event_type: 'speaking_session' | 'workshop' | 'cultural_exchange';
  scheduled_at: string;
  duration_minutes: number;
  max_participants: number;
  current_participants: number;
  room_id?: string;
  is_recurring: boolean;
  recurrence_pattern?: Record<string, any>;
  requires_signup: boolean;
  event_data: Record<string, any>;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  organizer?: {
    id: string;
    full_name?: string;
    avatar_url?: string;
  };
}

export interface UserCommunityStats {
  id: string;
  user_id: string;
  total_communities: number;
  total_posts: number;
  total_replies: number;
  total_likes_received: number;
  total_challenges_completed: number;
  total_events_attended: number;
  community_points: number;
  reputation_score: number;
  badges_earned: string[];
  streak_days: number;
  last_activity_date?: string;
  created_at: string;
  updated_at: string;
}

export interface CommunityFilters {
  category?: CommunityCategory;
  cefr_level?: string;
  privacy_level?: CommunityPrivacy;
  search?: string;
  tags?: string[];
}

export interface CreateCommunityData {
  name: string;
  description?: string;
  category: CommunityCategory;
  privacy_level: CommunityPrivacy;
  cefr_level: string;
  max_members?: number;
  tags?: string[];
  community_rules?: string;
  requires_approval?: boolean;
  weekly_goal_hours?: number;
  banner_url?: string;
}

export interface CreatePostData {
  community_id: string;
  title?: string;
  content: string;
  post_type?: 'discussion' | 'question' | 'announcement' | 'challenge';
  tags?: string[];
}

export interface CreateReplyData {
  post_id: string;
  content: string;
  parent_reply_id?: string;
}

export const COMMUNITY_CATEGORIES: { value: CommunityCategory; label: string; description: string }[] = [
  {
    value: 'conversation_practice',
    label: 'Conversation Practice',
    description: 'Practice everyday conversations with other learners'
  },
  {
    value: 'business_english',
    label: 'Business English',
    description: 'Professional English for workplace communication'
  },
  {
    value: 'ielts_preparation',
    label: 'IELTS Preparation',
    description: 'Prepare for IELTS speaking and writing tests'
  },
  {
    value: 'academic_english',
    label: 'Academic English',
    description: 'English for academic and educational purposes'
  },
  {
    value: 'cultural_exchange',
    label: 'Cultural Exchange',
    description: 'Learn about different cultures while practicing English'
  },
  {
    value: 'pronunciation',
    label: 'Pronunciation',
    description: 'Focus on improving pronunciation and accent'
  },
  {
    value: 'writing_practice',
    label: 'Writing Practice',
    description: 'Collaborative writing exercises and feedback'
  },
  {
    value: 'general_discussion',
    label: 'General Discussion',
    description: 'Open discussions on various topics'
  }
];

export const CEFR_LEVELS = [
  { value: 'A1', label: 'A1 - Beginner' },
  { value: 'A2', label: 'A2 - Elementary' },
  { value: 'B1', label: 'B1 - Intermediate' },
  { value: 'B2', label: 'B2 - Upper Intermediate' },
  { value: 'C1', label: 'C1 - Advanced' },
  { value: 'C2', label: 'C2 - Proficient' }
];