export interface ConstellationStar {
  id: string;
  name: string;
  description: string;
  icon: string;
  brightness: number; // 0-100
  maxBrightness: number;
  position: { x: number; y: number };
  size: 'small' | 'medium' | 'large';
  color: string;
  isActive: boolean;
}

export interface FallingStarEvent {
  id: string;
  starId: string;
  startPosition: { x: number; y: number };
  reason: string;
  timestamp: Date;
}

export interface ConstellationState {
  stars: ConstellationStar[];
  fallingStars: FallingStarEvent[];
  overallHealth: number; // 0-100
  tier: 'legendary' | 'excellent' | 'good' | 'fair' | 'struggling';
  tierName: string;
}

export const CONSTELLATION_TIERS = {
  legendary: {
    name: 'Legendary Constellation',
    minHealth: 90,
    color: 'from-yellow-400 to-pink-500',
    emoji: '✨',
    message: 'Your constellation shines brilliantly!',
  },
  excellent: {
    name: 'Excellent Constellation',
    minHealth: 75,
    color: 'from-cyan-400 to-purple-500',
    emoji: '⭐',
    message: 'Keep up the stellar performance!',
  },
  good: {
    name: 'Good Constellation',
    minHealth: 60,
    color: 'from-blue-400 to-purple-400',
    emoji: '🌟',
    message: 'Your stars are shining well',
  },
  fair: {
    name: 'Fair Constellation',
    minHealth: 40,
    color: 'from-orange-400 to-yellow-400',
    emoji: '💫',
    message: 'Some stars need attention',
  },
  struggling: {
    name: 'Struggling Constellation',
    minHealth: 0,
    color: 'from-red-400 to-orange-400',
    emoji: '🌑',
    message: 'Time to reignite your stars',
  },
};

export const INITIAL_STARS: ConstellationStar[] = [
  {
    id: 'attendance',
    name: 'Attendance Star',
    description: 'Tracks class attendance',
    icon: '🌟',
    brightness: 100,
    maxBrightness: 100,
    position: { x: 50, y: 30 },
    size: 'large',
    color: 'hsl(var(--primary))',
    isActive: true,
  },
  {
    id: 'punctuality',
    name: 'Punctuality Star',
    description: 'Tracks on-time arrivals',
    icon: '⏰',
    brightness: 100,
    maxBrightness: 100,
    position: { x: 30, y: 60 },
    size: 'medium',
    color: 'hsl(186 100% 45%)',
    isActive: true,
  },
  {
    id: 'technical',
    name: 'Technical Readiness Star',
    description: 'Tracks technical preparedness',
    icon: '💻',
    brightness: 100,
    maxBrightness: 100,
    position: { x: 70, y: 60 },
    size: 'medium',
    color: 'hsl(280 65% 60%)',
    isActive: true,
  },
  {
    id: 'satisfaction',
    name: 'Student Satisfaction Star',
    description: 'Reflects student feedback',
    icon: '💖',
    brightness: 100,
    maxBrightness: 100,
    position: { x: 25, y: 85 },
    size: 'small',
    color: 'hsl(330 85% 60%)',
    isActive: true,
  },
  {
    id: 'consistency',
    name: 'Consistency Star',
    description: 'Tracks weekly streaks',
    icon: '📅',
    brightness: 100,
    maxBrightness: 100,
    position: { x: 75, y: 85 },
    size: 'small',
    color: 'hsl(45 95% 60%)',
    isActive: true,
  },
];
