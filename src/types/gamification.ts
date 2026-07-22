export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'listening' | 'speaking' | 'reading' | 'writing' | 'grammar' | 'special' | 'completion' | 'learning' | 'mastery' | 'streak' | 'social';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  xpValue: number;
  unlockCondition: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'unit_completion' | 'skill_mastery' | 'streak' | 'creative_project';
  requirements: string[];
  rewards: {
    xp: number;
    badges: string[];
    unlocks: string[];
  };
  progress?: number;
  total?: number;
}

export interface XPRule {
  action: string;
  baseXP: number;
  multipliers?: {
    streak?: number;
    perfectScore?: number;
    firstTime?: number;
  };
}

export interface ProgressTracker {
  totalXP: number;
  level: number;
  badges: Badge[];
  activeQuests: Quest[];
  streakDays: number;
  lastActivity: Date;
}

// Legacy types for existing gamification components
export interface EnhancedAchievementBadge {
  id: string;
  name: string;
  description: string;
  icon: string | any;
  category: string | any;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  xpValue?: number;
  unlockCondition?: string;
  tier?: string;
  tier_name?: string;
  tier_level?: number;
  earnedDate?: Date | string;
  unlocked?: boolean;
  unlocked_at?: Date | string;
  xp_reward?: number;
  coin_reward?: number;
  progress?: {
    current: number;
    required?: number;
    total?: number;
  };
}

export interface LearningChallenge {
  id: string;
  title: string;
  description: string;
  type: string;
  challenge_type?: string;
  difficulty: 'easy' | 'medium' | 'hard' | string;
  difficulty_level?: string;
  xpReward: number;
  requirements: string[];
  deadline?: Date;
  end_date?: Date;
  isActive: boolean;
  is_active?: boolean;
  current_participants?: number;
  rewards?: {
    xp?: number;
    coins?: number;
    badges?: string[];
    badge?: string;
  };
}

export interface StudentChallengeProgress {
  id?: string;
  challengeId: string;
  challenge_id?: string;
  challenge?: LearningChallenge;
  studentId: string;
  progress: number;
  completion_percentage?: number;
  completed: boolean;
  is_completed?: boolean;
  startedAt: Date;
  completedAt?: Date;
}

export interface StudentLearningStreak {
  studentId: string;
  currentStreak: number;
  current_streak?: number;
  longestStreak: number;
  longest_streak?: number;
  lastActivityDate: Date;
  last_activity_date?: Date;
  streak_type?: 'daily' | 'weekly' | 'monthly';
}

export interface LearningCurrency {
  id: string;
  name: string;
  symbol: string;
  balance: number;
  total_coins?: number;
  coins_spent?: number;
}

export interface VirtualReward {
  id: string;
  name: string;
  description: string;
  cost: number;
  cost_coins?: number;
  category: 'avatar' | 'theme' | 'power-up' | 'badge';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  imageUrl?: string;
  limited_quantity?: number;
  purchased_count?: number;
}

export interface StudentRewardPurchase {
  id: string;
  studentId: string;
  rewardId: string;
  reward_id?: string;
  reward?: VirtualReward;
  purchasedAt: Date;
  cost: number;
  coins_spent?: number;
}

export interface LeaderboardEntry {
  id: string;
  leaderboard_id?: string;
  studentId?: string;
  student_id?: string;
  rank?: number;
  rank_position?: number;
  score?: number;
  displayName?: string;
  user_name?: string;
  user_avatar?: string;
  user_level?: number;
  avatarUrl?: string;
  badges?: number;
  achievement_count?: number;
  streak?: number;
  additional_data?: any;
  recorded_at?: Date | string;
}

export interface GamificationStats {
  totalXP?: number;
  xp?: number;
  next_level_xp?: number;
  level?: number;
  currentStreak?: number;
  current_daily_streak?: number;
  longest_streak?: number;
  badges?: number;
  unlocked_achievements?: number;
  total_achievements?: number;
  total_coins?: number;
  coins_spent?: number;
  completedChallenges?: number;
  completed_challenges?: number;
  active_challenges?: number;
  rank?: number;
}
