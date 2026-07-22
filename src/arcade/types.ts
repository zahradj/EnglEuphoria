// Gamer Arcade — types. Pure TS, safe everywhere.
import type { Hub, Cefr } from '@/governance/types';
import type { ReinforcementTarget } from '@/coherence/types';

export type ArcadeCategory = 'foundational' | 'communication' | 'review' | 'social';

export type ArcadeMode =
  | 'solo'
  | 'teacher_led'
  | 'team'
  | 'pair'
  | 'live_quiz'
  | 'coop';

export type ArcadeSource = 'lesson_integrated' | 'standalone' | 'classroom_live';

export interface ArcadeGameMeta {
  id: string;
  game_type: string;
  display_name: string;
  description?: string;
  skill_focus: string[];                  // e.g. ['vocab','grammar']
  hub_allow: Hub[];
  cefr_min: Cefr;
  cefr_max: Cefr;
  supports_speaking: boolean;
  supports_multiplayer: boolean;
  ceiling_seconds: number;
  character_slots: number;
  category: ArcadeCategory;
}

export interface CharacterBinding {
  character_id: string;
  name: string;
  role: 'host' | 'narrator' | 'celebrant' | 'mentor';
}

export interface GameSpec {
  spec_id: string;                        // deterministic per (lesson|standalone, game, target)
  game: ArcadeGameMeta;
  target: ReinforcementTarget | null;     // null only in pure-standalone freeplay
  difficulty_tier: 1 | 2 | 3 | 4 | 5;
  scaffolding_boost: 0 | 1 | 2;
  est_seconds: number;
  is_boss: boolean;
  characters: CharacterBinding[];
  educational_value: number;              // 0..1, mirrors coherence scorer
}

export type InjectionSlot = 'warmup' | 'drill' | 'review' | 'speaking' | 'exit';

export interface InjectionDecision {
  slot: InjectionSlot;
  spec: GameSpec;
  rationale: string;
}

export type ArcadeVerdict = 'pass' | 'repair' | 'block';

export interface ArcadeIssue {
  code: string;
  severity: 'hard' | 'soft';
  message: string;
}

export interface ArcadeReport {
  verdict: ArcadeVerdict;
  issues: ArcadeIssue[];
  total_seconds: number;
  speaking_count: number;
  game_count: number;
}

export interface ArcadeDecision {
  hub: Hub;
  cefr: Cefr;
  source: ArcadeSource;
  selected: GameSpec[];
  injections: InjectionDecision[];        // empty when source=standalone
  report: ArcadeReport;
  repairs_applied: number;
}
