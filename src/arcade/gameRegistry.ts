// Gamer Arcade — game registry. Mirrors arcade_games_catalog seed.
// Lives in code so the deterministic selector + validator never depend on a DB read.
import type { ArcadeGameMeta } from './types';

export const ARCADE_GAMES: ArcadeGameMeta[] = [
  // foundational
  { id: 'matching_pairs', game_type: 'matching', display_name: 'Matching Pairs', skill_focus: ['vocab'], hub_allow: ['playground','academy','success'], cefr_min: 'Pre-A1', cefr_max: 'C1', supports_speaking: false, supports_multiplayer: true, ceiling_seconds: 120, character_slots: 1, category: 'foundational' },
  { id: 'drag_drop_sort', game_type: 'drag_drop', display_name: 'Drag & Drop Sort', skill_focus: ['vocab','grammar'], hub_allow: ['playground','academy','success'], cefr_min: 'Pre-A1', cefr_max: 'C1', supports_speaking: false, supports_multiplayer: false, ceiling_seconds: 150, character_slots: 1, category: 'foundational' },
  { id: 'sentence_builder', game_type: 'sentence_builder', display_name: 'Sentence Builder', skill_focus: ['grammar','vocab'], hub_allow: ['playground','academy','success'], cefr_min: 'Pre-A1', cefr_max: 'C1', supports_speaking: false, supports_multiplayer: true, ceiling_seconds: 180, character_slots: 1, category: 'foundational' },
  { id: 'spelling_race', game_type: 'spelling_race', display_name: 'Spelling Race', skill_focus: ['vocab','spelling'], hub_allow: ['academy','success'], cefr_min: 'A1', cefr_max: 'C1', supports_speaking: false, supports_multiplayer: true, ceiling_seconds: 150, character_slots: 1, category: 'foundational' },
  { id: 'phonics_challenge', game_type: 'phonics_challenge', display_name: 'Phonics Challenge', skill_focus: ['pronunciation','phonics'], hub_allow: ['playground'], cefr_min: 'Pre-A1', cefr_max: 'A2', supports_speaking: true, supports_multiplayer: false, ceiling_seconds: 120, character_slots: 1, category: 'foundational' },
  { id: 'listening_hunt', game_type: 'listening_hunt', display_name: 'Listening Hunt', skill_focus: ['listening','vocab'], hub_allow: ['playground','academy','success'], cefr_min: 'Pre-A1', cefr_max: 'C1', supports_speaking: false, supports_multiplayer: false, ceiling_seconds: 150, character_slots: 1, category: 'foundational' },
  { id: 'song_chant', game_type: 'song_chant', display_name: 'Song & Chant', skill_focus: ['pronunciation','vocab'], hub_allow: ['playground'], cefr_min: 'Pre-A1', cefr_max: 'A2', supports_speaking: true, supports_multiplayer: false, ceiling_seconds: 120, character_slots: 1, category: 'foundational' },
  { id: 'timeline_race', game_type: 'timeline_race', display_name: 'Timeline Race', skill_focus: ['grammar','tense'], hub_allow: ['academy','success'], cefr_min: 'A1', cefr_max: 'C1', supports_speaking: false, supports_multiplayer: true, ceiling_seconds: 180, character_slots: 1, category: 'foundational' },
  // alphabet & phonics blocks (Playground foundational)
  { id: 'alphabet_blocks_order', game_type: 'alphabet_blocks', display_name: '🔤 Alphabet Blocks · Order the ABCs', skill_focus: ['alphabet','phonics'], hub_allow: ['playground'], cefr_min: 'Pre-A1', cefr_max: 'A1', supports_speaking: false, supports_multiplayer: false, ceiling_seconds: 180, character_slots: 1, category: 'foundational' },
  { id: 'letter_sounds_blocks', game_type: 'alphabet_blocks', display_name: '🔊 Letter Sounds · Match the Phonic', skill_focus: ['phonics','listening'], hub_allow: ['playground'], cefr_min: 'Pre-A1', cefr_max: 'A1', supports_speaking: false, supports_multiplayer: false, ceiling_seconds: 150, character_slots: 1, category: 'foundational' },
  { id: 'phonics_word_blocks', game_type: 'alphabet_blocks', display_name: '🧱 Phonics Blocks · Spell the Word', skill_focus: ['phonics','spelling','vocab'], hub_allow: ['playground'], cefr_min: 'Pre-A1', cefr_max: 'A1', supports_speaking: false, supports_multiplayer: false, ceiling_seconds: 210, character_slots: 1, category: 'foundational' },
  { id: 'alphabet_arcade', game_type: 'alphabet_arcade', display_name: '✨ Alphabet Arcade · Letters, Sounds & Rhymes', skill_focus: ['alphabet','phonics','listening'], hub_allow: ['playground'], cefr_min: 'Pre-A1', cefr_max: 'A1', supports_speaking: false, supports_multiplayer: false, ceiling_seconds: 240, character_slots: 1, category: 'foundational' },
  // communication
  { id: 'roleplay_mission', game_type: 'roleplay', display_name: 'Roleplay Mission', skill_focus: ['speaking','communication'], hub_allow: ['academy','success'], cefr_min: 'A1', cefr_max: 'C1', supports_speaking: true, supports_multiplayer: true, ceiling_seconds: 300, character_slots: 2, category: 'communication' },
  { id: 'pronunciation_quest', game_type: 'pronunciation_quest', display_name: 'Pronunciation Quest', skill_focus: ['speaking','pronunciation'], hub_allow: ['playground','academy','success'], cefr_min: 'Pre-A1', cefr_max: 'C1', supports_speaking: true, supports_multiplayer: false, ceiling_seconds: 180, character_slots: 1, category: 'communication' },
  { id: 'fluency_round', game_type: 'fluency_round', display_name: 'Fluency Round', skill_focus: ['speaking','fluency'], hub_allow: ['academy','success'], cefr_min: 'A2', cefr_max: 'C1', supports_speaking: true, supports_multiplayer: true, ceiling_seconds: 180, character_slots: 1, category: 'communication' },
  { id: 'story_continuation', game_type: 'story_continuation', display_name: 'Story Continuation', skill_focus: ['speaking','creativity'], hub_allow: ['academy','success'], cefr_min: 'A2', cefr_max: 'C1', supports_speaking: true, supports_multiplayer: true, ceiling_seconds: 240, character_slots: 2, category: 'communication' },
  { id: 'debate_battle', game_type: 'debate_battle', display_name: 'Debate Battle', skill_focus: ['speaking','argumentation'], hub_allow: ['success'], cefr_min: 'B1', cefr_max: 'C1', supports_speaking: true, supports_multiplayer: true, ceiling_seconds: 300, character_slots: 2, category: 'communication' },
  { id: 'business_sim', game_type: 'business_sim', display_name: 'Business Simulation', skill_focus: ['speaking','communication'], hub_allow: ['success'], cefr_min: 'B1', cefr_max: 'C1', supports_speaking: true, supports_multiplayer: true, ceiling_seconds: 360, character_slots: 2, category: 'communication' },
  // review
  { id: 'memory_quest', game_type: 'memory_quest', display_name: 'Memory Quest', skill_focus: ['vocab','grammar','memory'], hub_allow: ['playground','academy','success'], cefr_min: 'Pre-A1', cefr_max: 'C1', supports_speaking: false, supports_multiplayer: false, ceiling_seconds: 180, character_slots: 1, category: 'review' },
  { id: 'grammar_boss', game_type: 'grammar_boss', display_name: 'Grammar Boss Battle', skill_focus: ['grammar'], hub_allow: ['academy','success'], cefr_min: 'A1', cefr_max: 'C1', supports_speaking: false, supports_multiplayer: true, ceiling_seconds: 240, character_slots: 1, category: 'review' },
  { id: 'vocab_boss_round', game_type: 'boss_round', display_name: '⚔️ Boss Round · Vocab Duel', skill_focus: ['vocab','memory'], hub_allow: ['playground','academy','success'], cefr_min: 'Pre-A1', cefr_max: 'C1', supports_speaking: false, supports_multiplayer: false, ceiling_seconds: 210, character_slots: 1, category: 'review' },
  { id: 'vocab_tournament', game_type: 'vocab_tournament', display_name: 'Vocab Tournament', skill_focus: ['vocab'], hub_allow: ['academy','success'], cefr_min: 'A1', cefr_max: 'C1', supports_speaking: false, supports_multiplayer: true, ceiling_seconds: 300, character_slots: 1, category: 'review' },
  { id: 'fluency_streak', game_type: 'fluency_streak', display_name: 'Fluency Streak', skill_focus: ['vocab','grammar'], hub_allow: ['academy','success'], cefr_min: 'A1', cefr_max: 'C1', supports_speaking: false, supports_multiplayer: false, ceiling_seconds: 180, character_slots: 1, category: 'review' },
  // social
  { id: 'team_mission', game_type: 'team_mission', display_name: 'Team Mission', skill_focus: ['communication'], hub_allow: ['academy','success'], cefr_min: 'A2', cefr_max: 'C1', supports_speaking: true, supports_multiplayer: true, ceiling_seconds: 360, character_slots: 2, category: 'social' },
  { id: 'classroom_battle', game_type: 'classroom_battle', display_name: 'Classroom Battle', skill_focus: ['vocab','grammar'], hub_allow: ['academy','success'], cefr_min: 'A1', cefr_max: 'C1', supports_speaking: false, supports_multiplayer: true, ceiling_seconds: 360, character_slots: 1, category: 'social' },
  { id: 'leaderboard_event', game_type: 'leaderboard_event', display_name: 'Leaderboard Event', skill_focus: ['vocab','grammar'], hub_allow: ['academy','success'], cefr_min: 'A1', cefr_max: 'C1', supports_speaking: false, supports_multiplayer: true, ceiling_seconds: 300, character_slots: 1, category: 'social' },
  { id: 'coop_challenge', game_type: 'coop_challenge', display_name: 'Coop Challenge', skill_focus: ['vocab','grammar','communication'], hub_allow: ['playground','academy','success'], cefr_min: 'Pre-A1', cefr_max: 'C1', supports_speaking: true, supports_multiplayer: true, ceiling_seconds: 300, character_slots: 2, category: 'social' },
];

export function findGame(id: string): ArcadeGameMeta | undefined {
  return ARCADE_GAMES.find((g) => g.id === id);
}

const CEFR_ORDER: string[] = ['Pre-A1','A1','A2','B1','B2','C1','C2'];
export function cefrIdx(c: string): number {
  const i = CEFR_ORDER.indexOf(c);
  return i < 0 ? 0 : i;
}
