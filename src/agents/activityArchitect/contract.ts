// Activity Architect — contract types.
// The 4th specialist agent in the Hub Brain hybrid setup.
// Owns: lesson-grounded games, drills, and practice activities.

export type ActivityType =
  | "multiple" | "match" | "fill" | "memory" | "tap_order" | "sort"
  | "word_builder" | "sound_blend" | "missing_letter" | "phonics_hunt"
  | "trace" | "balloon_pop" | "family_tree" | "echo"
  | "speaking_mission" | "storybook";

export interface ActivityContext {
  lesson_number?: number;
  objective?: string;
  grammar_target?: string;
  sentence_frame?: string;
  phonic?: { letter?: string; sound?: string } | null;
  ace_role?: "activate" | "connect" | "express";
  page_label?: string;
  page_phase?: string;
}

export interface ActivityArchitectInput {
  activity_type: ActivityType;
  topic?: string;
  vocab: string[];
  cefr?: string;
  instructions?: string;
  context?: ActivityContext;
  current_config?: Record<string, unknown>;
}

export interface ActivityArchitectResult {
  config: Record<string, unknown>;
  durationMs: number;
}
