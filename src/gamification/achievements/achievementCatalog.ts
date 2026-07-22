import type { AchievementDefinition } from '../types';

/**
 * Meaningful achievements — tied to real skills, not click counts.
 * Each tier represents demonstrated competence, not raw activity volume.
 */
export const ACHIEVEMENT_CATALOG: AchievementDefinition[] = [
  {
    id: 'vocabulary_explorer',
    name: 'Vocabulary Explorer',
    description: 'Master new words through real communication.',
    category: 'vocabulary',
    icon: 'book-open',
    hubs: ['playground', 'academy', 'success'],
    unlockCondition: {
      kind: 'mastery_count',
      threshold: { bronze: 10, silver: 50, gold: 150, platinum: 400 },
    },
  },
  {
    id: 'pronunciation_hero',
    name: 'Pronunciation Hero',
    description: 'Attempt difficult sounds with courage and grow.',
    category: 'pronunciation',
    icon: 'mic',
    hubs: ['playground', 'academy', 'success'],
    unlockCondition: {
      kind: 'speaking_sessions',
      threshold: { bronze: 5, silver: 25, gold: 75, platinum: 200 },
    },
  },
  {
    id: 'storytelling_master',
    name: 'Storytelling Master',
    description: 'Tell complete, vivid stories in English.',
    category: 'speaking',
    icon: 'sparkles',
    hubs: ['academy', 'success'],
    unlockCondition: {
      kind: 'missions_completed',
      threshold: { bronze: 3, silver: 12, gold: 30, platinum: 75 },
    },
  },
  {
    id: 'debate_champion',
    name: 'Debate Champion',
    description: 'Defend your opinion respectfully in English.',
    category: 'speaking',
    icon: 'message-circle',
    hubs: ['academy', 'success'],
    unlockCondition: {
      kind: 'missions_completed',
      threshold: { bronze: 2, silver: 8, gold: 20, platinum: 50 },
    },
  },
  {
    id: 'fluency_builder',
    name: 'Fluency Builder',
    description: 'Speak with growing confidence and ease.',
    category: 'communication',
    icon: 'trending-up',
    hubs: ['academy', 'success'],
    unlockCondition: {
      kind: 'speaking_sessions',
      threshold: { bronze: 10, silver: 40, gold: 100, platinum: 250 },
    },
  },
  {
    id: 'reading_detective',
    name: 'Reading Detective',
    description: 'Find meaning, inference, and detail in texts.',
    category: 'reading',
    icon: 'search',
    hubs: ['playground', 'academy', 'success'],
    unlockCondition: {
      kind: 'reviews_passed',
      threshold: { bronze: 5, silver: 25, gold: 60, platinum: 150 },
    },
  },
  {
    id: 'grammar_navigator',
    name: 'Grammar Navigator',
    description: 'Use grammar accurately in real communication.',
    category: 'grammar',
    icon: 'compass',
    hubs: ['playground', 'academy', 'success'],
    unlockCondition: {
      kind: 'mastery_count',
      threshold: { bronze: 5, silver: 20, gold: 60, platinum: 150 },
    },
  },
  {
    id: 'consistency_keeper',
    name: 'Consistency Keeper',
    description: 'Return to learning, day after day.',
    category: 'consistency',
    icon: 'calendar-check',
    hubs: ['playground', 'academy', 'success'],
    unlockCondition: {
      kind: 'streak_days',
      threshold: { bronze: 3, silver: 14, gold: 45, platinum: 120 },
    },
  },
];

export function getAchievementsForHub(hub: 'playground' | 'academy' | 'success'): AchievementDefinition[] {
  return ACHIEVEMENT_CATALOG.filter((a) => a.hubs.includes(hub));
}

export function getAchievementById(id: string): AchievementDefinition | undefined {
  return ACHIEVEMENT_CATALOG.find((a) => a.id === id);
}
