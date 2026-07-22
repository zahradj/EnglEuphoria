import type { Hub } from '@/governance/types';

export interface ArcadeHubProfile {
  max_games_per_lesson: number;
  max_minutes_per_lesson: number;
  speaking_floor: number;        // min # of speaking-tagged games
  allow_multiplayer: ('solo' | 'teacher_led' | 'team' | 'pair' | 'live_quiz' | 'coop')[];
  allow_leaderboards: boolean;
  allow_long_text_input: boolean;
  ceiling_cefr: 'A2' | 'B1' | 'C1';
}

export const ARCADE_HUB_PROFILES: Record<Hub, ArcadeHubProfile> = {
  playground: {
    max_games_per_lesson: 3,
    max_minutes_per_lesson: 8,
    speaking_floor: 1,
    allow_multiplayer: ['solo', 'pair', 'coop'],
    allow_leaderboards: false,
    allow_long_text_input: false,
    ceiling_cefr: 'B1',
  },
  academy: {
    max_games_per_lesson: 4,
    max_minutes_per_lesson: 12,
    speaking_floor: 2,
    allow_multiplayer: ['solo', 'teacher_led', 'team', 'pair', 'live_quiz', 'coop'],
    allow_leaderboards: true,
    allow_long_text_input: true,
    ceiling_cefr: 'C1',
  },
  success: {
    max_games_per_lesson: 3,
    max_minutes_per_lesson: 10,
    speaking_floor: 2,
    allow_multiplayer: ['solo', 'teacher_led', 'team', 'pair', 'live_quiz'],
    allow_leaderboards: true,
    allow_long_text_input: true,
    ceiling_cefr: 'C1',
  },
};
