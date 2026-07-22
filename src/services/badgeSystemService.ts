
// Mock Badge System
export const mockBadgeSystem = {
  skillMasteryBadges: [
    {
      id: 'vocab-master',
      name: 'Vocabulary Master',
      description: 'Complete 50 vocabulary exercises',
      xpValue: 100,
      category: 'skill_mastery'
    },
    {
      id: 'grammar-guru',
      name: 'Grammar Guru',
      description: 'Master all A1 grammar points',
      xpValue: 150,
      category: 'skill_mastery'
    },
    {
      id: 'speaking-star',
      name: 'Speaking Star',
      description: 'Complete 25 speaking activities',
      xpValue: 120,
      category: 'skill_mastery'
    }
  ],
  streakBadges: [
    {
      id: 'week-warrior',
      name: 'Week Warrior',
      description: 'Study for 7 consecutive days',
      xpValue: 75,
      category: 'streak'
    },
    {
      id: 'month-master',
      name: 'Month Master',
      description: 'Study for 30 consecutive days',
      xpValue: 200,
      category: 'streak'
    }
  ],
  completionBadges: [
    {
      id: 'level-finisher',
      name: 'Level Finisher',
      description: 'Complete an entire CEFR level',
      xpValue: 250,
      category: 'completion'
    },
    {
      id: 'perfect-score',
      name: 'Perfect Score',
      description: 'Get 100% on 10 assessments',
      xpValue: 180,
      category: 'completion'
    }
  ]
};

export const getBadgeSystem = () => {
  return mockBadgeSystem;
};
