export interface TeacherTreeHealth {
  totalLeaves: number; // Current leaves (0-10)
  maxLeaves: number; // Maximum leaves (10)
  sunlightPoints: number; // Student praise points
  monthlyBlooms: number; // Months with perfect record
  tier: 'blooming_mentor' | 'healthy_educator' | 'wilting_branch' | 'dormant_tree';
  tierName: string;
  recentEvents: TreeEvent[];
  badges: TeacherBadge[];
  weeklyStreak: number; // Weeks of perfect attendance
}

export interface TreeEvent {
  id: string;
  type: 'loss' | 'gain' | 'bloom' | 'sunlight';
  leavesChanged: number;
  reason: string;
  date: Date;
  icon: string;
}

export interface TeacherBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedDate?: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  season?: 'spring' | 'summer' | 'autumn' | 'winter';
}

export const TREE_TIERS = {
  blooming_mentor: {
    name: 'Blooming Mentor',
    minLeaves: 9,
    maxLeaves: 10,
    color: 'emerald',
    emoji: '🌸',
    message: 'Your tree is thriving! Keep nurturing your students',
  },
  healthy_educator: {
    name: 'Healthy Educator',
    minLeaves: 7,
    maxLeaves: 8,
    color: 'green',
    emoji: '🌿',
    message: 'Great consistency! Your garden is flourishing',
  },
  wilting_branch: {
    name: 'Wilting Branch',
    minLeaves: 4,
    maxLeaves: 6,
    color: 'amber',
    emoji: '🍂',
    message: 'Your tree needs care. Stay consistent to regrow',
  },
  dormant_tree: {
    name: 'Dormant Tree',
    minLeaves: 0,
    maxLeaves: 3,
    color: 'orange',
    emoji: '🌰',
    message: 'Time to nurture your garden back to health',
  },
};

export const SEASONAL_BADGES: TeacherBadge[] = [
  {
    id: 'spring_blossom',
    name: 'Spring Blossom Teacher',
    description: '3 months of perfect attendance',
    icon: '🌸',
    rarity: 'rare',
    season: 'spring',
  },
  {
    id: 'summer_sunshine',
    name: 'Summer Sunshine',
    description: 'Received 50+ sunlight points',
    icon: '☀️',
    rarity: 'epic',
    season: 'summer',
  },
  {
    id: 'autumn_harvest',
    name: 'Autumn Harvest',
    description: '100 lessons completed',
    icon: '🍎',
    rarity: 'rare',
    season: 'autumn',
  },
  {
    id: 'winter_evergreen',
    name: 'Winter Evergreen',
    description: '6 months of consistent teaching',
    icon: '❄️',
    rarity: 'legendary',
    season: 'winter',
  },
  {
    id: 'perfect_month',
    name: 'Perfect Month',
    description: 'No issues for 30 days',
    icon: '🌼',
    rarity: 'common',
  },
  {
    id: 'student_favorite',
    name: 'Student Favorite',
    description: '10+ five-star reviews',
    icon: '⭐',
    rarity: 'epic',
  },
];
