// Game & Homework Coherence Engine — types.
import type { Hub, Cefr } from '@/governance/types';

export type HomeworkTaskType =
  | 'vocab_recall'
  | 'sentence_build'
  | 'mini_recording'
  | 'listening_recap'
  | 'micro_reading'
  | 'micro_writing'
  | 'parent_script'      // PG
  | 'peer_message'       // AC
  | 'email_draft';       // SU

export type GameType =
  | 'WordRush'
  | 'SoundMatch'
  | 'GrammarSprint'
  | 'DialogueDash'
  | 'MeaningMaze'
  | 'MemoryGrid'
  | 'FluencyArcade'
  | 'BossRound';

export type ReinforcementSource =
  | 'mastery_gap'
  | 'memory_due'
  | 'speaking_weak_rung'
  | 'grammar_struggle'
  | 'pronunciation_target'
  | 'lesson_target';

export interface ReinforcementTarget {
  id: string;
  source: ReinforcementSource;
  skill_kind: 'vocab' | 'grammar' | 'phoneme' | 'speaking' | 'function';
  skill_key: string;
  label: string;
  priority: number; // 0..1
  cefr_ceiling: Cefr;
}

export interface HomeworkTask {
  id: string;
  type: HomeworkTaskType;
  template_key: string;
  reinforcement_target_id: string;
  estimated_minutes: number;
  prompt: string;
  bound_to_lesson: true;
  educational_value: number; // 0..1
  modality: 'speaking' | 'listening' | 'reading' | 'writing' | 'mixed';
}

export interface GameRound {
  id: string;
  type: GameType;
  reinforcement_target_id: string;
  scenario_key: string;
  difficulty_tier: number; // 1..5
  educational_value: number; // 0..1
  is_boss: boolean;
}

export interface HomeworkPack {
  lessonId: string;
  studentId: string;
  hub: Hub;
  tasks: HomeworkTask[];
  total_minutes: number;
  coherence_score: number; // 0..1
  /**
   * Hand-of-Cards drill plan (distilled from RoadWords). Ordered vocab keys
   * with their starting test direction so the player can run a 6-card round
   * before the freeform tasks. Optional — empty when no vocab targets exist.
   */
  drill_plan?: {
    direction_start: 'receptive' | 'expressive';
    cards: { skill_key: string; label: string }[];
  };
  /** Backdrop world inherited from the lesson coherence decision. */
  unit_theme?: string;
  /** Scene phrase like "in a deep-space rocket". */
  scene_phrase?: string;
}

export interface GamePack {
  lessonId: string;
  studentId: string;
  hub: Hub;
  rounds: GameRound[];
  educational_value_avg: number; // 0..1
  /** Backdrop world inherited from the lesson coherence decision. */
  unit_theme?: string;
  /** Scene phrase like "in a deep-space rocket". */
  scene_phrase?: string;
}

export type CoherenceVerdict = 'pass' | 'repair' | 'block';

export interface CoherenceIssue {
  code: string;
  severity: 'hard' | 'soft';
  message: string;
}

export interface CoherenceDecision {
  hub: Hub;
  cefr: Cefr;
  targets: ReinforcementTarget[];
  homework: HomeworkPack;
  game: GamePack;
  verdict: CoherenceVerdict;
  issues: CoherenceIssue[];
  repairs_applied: number;
  /** Backdrop world (e.g. "Space"). Binds homework/game copy to the same setting. */
  unit_theme?: string;
  /** Scene phrase derived from unit_theme (e.g. "in a deep-space rocket"). */
  scene_phrase?: string;
}
