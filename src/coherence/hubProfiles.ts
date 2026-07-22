// Hub profiles for coherence engine.
import type { Hub } from '@/governance/types';
import type { GameType, HomeworkTaskType } from './types';

export interface HubCoherenceProfile {
  homework_minutes_cap: number;
  homework_min_tasks: number;
  homework_max_tasks: number;
  game_rounds: number;
  homework_modes: HomeworkTaskType[];
  game_catalog: GameType[];
  framing: 'story_quest' | 'social_challenge' | 'achievement_track';
  unsupervised_writing_max_lines: number;
}

export const COHERENCE_HUB_PROFILES: Record<Hub, HubCoherenceProfile> = {
  playground: {
    homework_minutes_cap: 10,
    homework_min_tasks: 2,
    homework_max_tasks: 4,
    game_rounds: 4,
    homework_modes: ['vocab_recall', 'mini_recording', 'listening_recap', 'parent_script'],
    game_catalog: ['WordRush', 'SoundMatch', 'MemoryGrid', 'BossRound'],
    framing: 'story_quest',
    unsupervised_writing_max_lines: 2,
  },
  academy: {
    homework_minutes_cap: 20,
    homework_min_tasks: 3,
    homework_max_tasks: 5,
    game_rounds: 5,
    homework_modes: ['vocab_recall', 'sentence_build', 'mini_recording', 'micro_reading', 'micro_writing', 'peer_message'],
    game_catalog: ['WordRush', 'GrammarSprint', 'DialogueDash', 'MeaningMaze', 'FluencyArcade', 'BossRound'],
    framing: 'social_challenge',
    unsupervised_writing_max_lines: 8,
  },
  success: {
    homework_minutes_cap: 25,
    homework_min_tasks: 3,
    homework_max_tasks: 6,
    game_rounds: 5,
    homework_modes: ['sentence_build', 'mini_recording', 'micro_reading', 'micro_writing', 'email_draft'],
    game_catalog: ['GrammarSprint', 'DialogueDash', 'MeaningMaze', 'FluencyArcade', 'BossRound'],
    framing: 'achievement_track',
    unsupervised_writing_max_lines: 20,
  },
};
