import { Badge, XPRule, Quest } from '@/types/gamification';

export const XP_RULES: XPRule[] = [
  {
    action: 'complete_unit',
    baseXP: 100,
    multipliers: {
      streak: 1.2,
      perfectScore: 1.5,
      firstTime: 2.0
    }
  },
  {
    action: 'complete_activity',
    baseXP: 20,
    multipliers: {
      perfectScore: 1.5
    }
  },
  {
    action: 'practice_skill',
    baseXP: 10
  },
  {
    action: 'complete_quest',
    baseXP: 200
  },
  {
    action: 'daily_login',
    baseXP: 5,
    multipliers: {
      streak: 1.1
    }
  }
];

export const ALL_BADGES: Badge[] = [
  {
    id: 'little-speaker',
    name: 'Little Speaker 🌟',
    description: 'Complete your first speaking activity',
    icon: '🌟',
    category: 'speaking',
    rarity: 'common',
    xpValue: 50,
    unlockCondition: 'Complete any speaking activity'
  },
  {
    id: 'hello-master',
    name: 'Hello Master 👋',
    description: 'Master greetings and introductions',
    icon: '👋',
    category: 'special',
    rarity: 'common',
    xpValue: 100,
    unlockCondition: 'Complete Unit 1: Hello'
  },
  {
    id: 'classroom-expert',
    name: 'Classroom Expert 📚',
    description: 'Know all classroom objects',
    icon: '📚',
    category: 'special',
    rarity: 'common',
    xpValue: 100,
    unlockCondition: 'Complete Unit 2: My Classroom'
  },
  {
    id: 'color-master',
    name: 'Color Master 🌈',
    description: 'Identify all colors correctly',
    icon: '🌈',
    category: 'special',
    rarity: 'rare',
    xpValue: 150,
    unlockCondition: 'Perfect score on colors unit'
  },
  {
    id: 'shape-star',
    name: 'Shape Star ⭐',
    description: 'Master all basic shapes',
    icon: '⭐',
    category: 'special',
    rarity: 'common',
    xpValue: 100,
    unlockCondition: 'Complete Unit 3: Colors & Shapes'
  },
  {
    id: 'counting-champion',
    name: 'Counting Champion 🔢',
    description: 'Count to 10 perfectly',
    icon: '🔢',
    category: 'special',
    rarity: 'rare',
    xpValue: 150,
    unlockCondition: 'Complete Unit 4: Numbers & Toys'
  },
  {
    id: 'family-star',
    name: 'Family Star 👨‍👩‍👧‍👦',
    description: 'Talk about your family',
    icon: '👨‍👩‍👧‍👦',
    category: 'speaking',
    rarity: 'common',
    xpValue: 100,
    unlockCondition: 'Complete Unit 5: My Family'
  },
  {
    id: 'feelings-friend',
    name: 'Feelings Friend 😊',
    description: 'Express all emotions',
    icon: '😊',
    category: 'speaking',
    rarity: 'common',
    xpValue: 100,
    unlockCondition: 'Complete Unit 6: Feelings'
  },
  {
    id: 'food-expert',
    name: 'Food Expert 🍎',
    description: 'Know food vocabulary',
    icon: '🍎',
    category: 'special',
    rarity: 'common',
    xpValue: 100,
    unlockCondition: 'Complete Unit 7: Food Time'
  },
  {
    id: 'animal-expert',
    name: 'Animal Expert 🦁',
    description: 'Identify all animals and sounds',
    icon: '🦁',
    category: 'special',
    rarity: 'epic',
    xpValue: 200,
    unlockCondition: 'Complete Unit 8: Animals'
  },
  {
    id: 'stage-1-complete',
    name: 'Foundation Builder 🏆',
    description: 'Complete entire Stage 1',
    icon: '🏆',
    category: 'completion',
    rarity: 'legendary',
    xpValue: 500,
    unlockCondition: 'Complete all Stage 1 units'
  },
  {
    id: 'listening-star',
    name: 'Listening Star 🎧',
    description: 'Complete 10 listening activities',
    icon: '🎧',
    category: 'listening',
    rarity: 'rare',
    xpValue: 150,
    unlockCondition: 'Complete 10 listening activities'
  },
  {
    id: 'reading-wizard',
    name: 'Reading Wizard 📖',
    description: 'Complete 10 reading activities',
    icon: '📖',
    category: 'reading',
    rarity: 'rare',
    xpValue: 150,
    unlockCondition: 'Complete 10 reading activities'
  },
  {
    id: 'writing-hero',
    name: 'Writing Hero ✍️',
    description: 'Complete 10 writing activities',
    icon: '✍️',
    category: 'writing',
    rarity: 'rare',
    xpValue: 150,
    unlockCondition: 'Complete 10 writing activities'
  },
  {
    id: 'grammar-genius',
    name: 'Grammar Genius 🧠',
    description: 'Master grammar structures',
    icon: '🧠',
    category: 'grammar',
    rarity: 'epic',
    xpValue: 200,
    unlockCondition: 'Score 100% on 5 grammar activities'
  },
  {
    id: '7-day-streak',
    name: '7-Day Streak 🔥',
    description: 'Practice for 7 days in a row',
    icon: '🔥',
    category: 'special',
    rarity: 'epic',
    xpValue: 250,
    unlockCondition: '7 consecutive days of practice'
  },
  {
    id: 'young-communicator',
    name: 'Young Communicator 💬',
    description: 'Complete Stage 2',
    icon: '💬',
    category: 'completion',
    rarity: 'legendary',
    xpValue: 600,
    unlockCondition: 'Complete all Stage 2 units'
  },
  {
    id: 'grammar-hero',
    name: 'Grammar Hero 📝',
    description: 'Complete Stage 3',
    icon: '📝',
    category: 'completion',
    rarity: 'legendary',
    xpValue: 700,
    unlockCondition: 'Complete all Stage 3 units'
  }
];

export const QUEST_TEMPLATES: Quest[] = [
  {
    id: 'first-steps',
    title: 'First Steps Quest',
    description: 'Complete your first 3 units',
    type: 'unit_completion',
    requirements: ['Complete 3 units'],
    rewards: {
      xp: 200,
      badges: ['little-speaker'],
      unlocks: ['Stage 1 Advanced Units']
    }
  },
  {
    id: 'speaking-master',
    title: 'Speaking Master Quest',
    description: 'Practice speaking 20 times',
    type: 'skill_mastery',
    requirements: ['Complete 20 speaking activities'],
    rewards: {
      xp: 300,
      badges: ['speaking-master'],
      unlocks: ['Advanced Speaking Games']
    }
  },
  {
    id: 'weekly-warrior',
    title: 'Weekly Warrior',
    description: 'Practice every day this week',
    type: 'streak',
    requirements: ['7-day login streak'],
    rewards: {
      xp: 250,
      badges: ['7-day-streak'],
      unlocks: ['Bonus XP Multiplier']
    }
  },
  {
    id: 'creative-genius',
    title: 'Creative Genius',
    description: 'Complete 5 creative projects',
    type: 'creative_project',
    requirements: ['Complete 5 production activities'],
    rewards: {
      xp: 350,
      badges: ['creative-star'],
      unlocks: ['Advanced Projects']
    }
  }
];
