/**
 * Playground Unit Blueprint — types.
 *
 * The AI emits a PlaygroundUnitContent payload (vocab, phonic, story);
 * `buildPlaygroundUnit()` (lessonBuilder.ts) wraps it in the locked
 * 7-lesson UnitTemplate shape. Anything not matching this contract is
 * rejected by `validatePlaygroundUnit()`.
 */

import type { PlaygroundLessonNumber } from "./unitTemplate";

export interface PlaygroundPhonic {
  letter: string;          // "c"
  sound: string;           // "/k/"
  words: string[];         // ["cat","cow","car"] — must start with `letter`
}

export interface PlaygroundVocabMedia {
  imageUrl?: string;
  audioUrl?: string;
  /** One-line plain-English definition (concrete for PG). Fed to Language Engine slot targets. */
  definition?: string;
  /** Example sentence that MUST contain the headword. */
  example?: string;
}

export interface PlaygroundLessonContent {
  lesson_number: PlaygroundLessonNumber;
  /** Lessons 1: full vocab list. L2/L3: new vocab introduced this lesson. */
  vocab?: string[];
  /** Per-word media (image / Pip voice) generated from the editor. */
  vocab_media?: Record<string, PlaygroundVocabMedia>;
  /** L4 storybook payload. */
  story?: {
    title: string;
    scenes: { id: string; text: string; image_prompt?: string }[];
    qa?: { prea1?: string[]; a1?: string[]; a2?: string[] };
    look_and_say?: {
      a2?: { who: string; where: string; what: string };
      b1?: { who: string; where: string; what: string };
      b2?: { who: string; where: string; what: string };
    };
  };
  /** Required for L1–L3. */
  phonic?: PlaygroundPhonic;
  /** Review/recycle pool for L4–L7, generated from earlier lessons. */
  review_targets?: string[];
  /** Optional remediation marker for Lesson 7 Stretch. */
  remediation_source?: string;
  /** Optional seed for L6 quiz item generator. */
  quiz_seed?: Record<string, unknown>;
  /** Editable pages — hydrated lazily by `derivePages()` on first edit. */
  pages?: PlaygroundPage[];
  /** Character who "stars" in this lesson. */
  starring_character?: { name: string; visual_blueprint: string; voice_id: string } | null;
  /** Homework pack attached to this lesson. */
  homework?: PlaygroundHomework;
  /** Teacher-authored game rounds — fed into pinAuthoredGamePack(). */
  authored_games?: PlaygroundAuthoredGameRound[];
}

export interface PlaygroundAuthoredGameRound {
  id: string;
  type: string;               // GameType from Playground hub catalog
  scenario_key?: string;
  difficulty_tier?: number;   // 1..5
  is_boss?: boolean;
  /** Teacher-picked ReinforcementTarget binding. Same format as PlaygroundHomeworkTask.reinforcement_key. */
  reinforcement_key?: string;
}



// ─── Editable page model ────────────────────────────────────────────────

export type PlaygroundBlock =
  | { kind: "text"; id: string; label?: string; value: string }
  | { kind: "image"; id: string; label?: string; subject: string; url?: string; character?: string; style?: string; prompt?: string }
  | { kind: "audio"; id: string; label?: string; text?: string; voice?: string; url?: string }
  | { kind: "music"; id: string; label?: string; mood: string; durationSec?: number; url?: string }
  | { kind: "video"; id: string; label?: string; url?: string; provider?: "upload" | "youtube" | "vimeo" | "ai"; prompt?: string; posterUrl?: string }
  | { kind: "activity"; id: string; label?: string; type: string; config: Record<string, unknown> }
  | {
      kind: "language_engine_slot";
      id: string;
      label?: string;
      /** One of story_engine_slot | escape_room_slot | detective_mystery_slot | hidden_object_slot */
      engineType: string;
      mode?: "lesson" | "review" | "quiz";
      hub?: "playground" | "academy" | "success";
      cefr?: string;
      title?: string;
      objective?: string;
      targets?: Array<{ word: string; definition?: string; example?: string; image_url?: string | null }>;
      target_words?: string[];
      /** One of graph | room | case | scene (deterministic payload for the matching engine). */
      graph?: unknown;
      room?: unknown;
      case?: unknown;
      scene?: unknown;
    };

export type PipMascotState =
  | 'idle' | 'blink' | 'wave' | 'point_left' | 'point_right'
  | 'celebrate' | 'thinking' | 'listening' | 'speaking' | 'sad';

export type PipEnvironment =
  | 'classroom' | 'park' | 'kitchen' | 'space' | 'beach'
  | 'library' | 'forest' | 'bedroom';

export type MotionEntrance =
  | 'fade_up' | 'scale_in' | 'slide_in_right' | 'slide_in_left' | 'pop';

export interface PageMascot {
  state: PipMascotState;
  environment?: PipEnvironment;
  speech?: string;
}

export interface PageMotion {
  entrance: MotionEntrance;
  duration_ms?: number;
  easing?: string;
  stagger_ms?: number;
  emphasis?: 'none' | 'pulse' | 'shake' | 'bounce';
}

export interface PlaygroundPage {
  id: string;          // stable per (lesson_number, phase_id)
  phase_id: string;    // from unitTemplate.phase_ids
  title?: string;
  notes?: string;
  blocks: PlaygroundBlock[];
  /** Motion & Mascot Animation Contract — drives SlideStage runtime. */
  mascot?: PageMascot;
  motion?: PageMotion;
}


// ─── Homework ───────────────────────────────────────────────────────────

export type PlaygroundHomeworkTaskType = string; // any activity/game type from ACTIVITY_CATALOG

export interface PlaygroundHomeworkTask {
  id: string;
  type: PlaygroundHomeworkTaskType;
  label?: string;
  prompt: string;
  /** Payload/config — same shape as activity block config (prompt, options, pairs, etc). */
  payload: Record<string, unknown>;
  minutes: number;
  /** Teacher-picked ReinforcementTarget binding. Format: `vocab:<word>` | `grammar:<key>` | `phonic:<letter>`. */
  reinforcement_key?: string;
}

export interface PlaygroundHomework {
  lesson_number: PlaygroundLessonNumber;
  title?: string;
  tasks: PlaygroundHomeworkTask[];
  total_minutes: number;
}


export interface PlaygroundUnitContent {
  unit_topic: string;
  unit_theme?: string;
  unit_topics?: { l1: string; l2: string; l3: string };
  lessons: PlaygroundLessonContent[];
}

export interface PlaygroundUnit extends PlaygroundUnitContent {
  /** Locked vocab pool — L1.vocab ∪ L2.vocab ∪ L3.vocab. */
  vocab_pool: string[];
  /** Locked phonics pool — L1.phonic, L2.phonic, L3.phonic. */
  phonics_pool: PlaygroundPhonic[];
}
