// Academy lesson player v2 — data model (docs/academy-player-v2-plan.md). Academy only: nothing here is imported from the Playground.
// A lesson is a chapter of a Season: its blueprint (objective, chapter, run of show) is read from src/curriculum/academy, never copied.
import type { ComponentType } from 'react';

export type CastName = 'Vee' | 'Ava' | 'Theo' | 'Mia';

/** The eight parts of the 60-minute run of show (blueprint order). */
export const PART_COUNT = 8;

export interface SceneBase {
  id: string;
  /** which of the 8 parts (0-7) this scene belongs to */
  part: number;
  /** the scene kind: a key of the scene registry */
  kind: string;
  /** success criteria (1-based indexes of the lesson's `criteria`) this scene trains */
  trains?: number[];
  /** the picture behind it: id of a plate in public/academy-art/bg */
  plate?: string;
}

export interface LessonScript {
  /** blueprint id, e.g. 'B1-S01-E3': chapter, big question and run of show come from it */
  blueprintId: string;
  title: string;
  /** the lesson's "I can" goals (what the Lobby shows and the teacher marks) */
  criteria: string[];
  cast: CastName[];
  /** minutes of each of the 8 parts; sums to 60 */
  partMinutes: number[];
  scenes: SceneBase[];
}

/** What a game or scene reports when it is done. */
export interface SceneResult {
  won: boolean;
  /** scene-local score, 0 when the scene is not scored */
  score: number;
  /** items the student got wrong (ids or short labels), for the Mistake Bank */
  mistakes: string[];
  /** a clean first-try win earns a gem */
  gem?: boolean;
}

/** What every scene view receives from the player. */
export interface SceneProps<S extends SceneBase = SceneBase> {
  scene: S;
  script: LessonScript;
  /** call when the student may move on (the scene is finished or skippable) */
  onDone: (result?: Partial<SceneResult>) => void;
  /** art base, e.g. '/academy-art' */
  artBase: string;
  /** Calm mode: no shake, no loops, fewer effects */
  calm: boolean;
  /** the seeded random of this scene (both screens of a live class match) */
  seed: number;
}

/** A scene kind: its view, what it says aloud, and a validator the registry test runs on every scene. */
export interface SceneModule<S extends SceneBase = SceneBase> {
  view: ComponentType<SceneProps<S>>;
  /** lines the recorded voices say on this scene, in order */
  spoken: (scene: S) => { who: string; text: string }[];
  /** return a list of problems (empty = valid) */
  validate: (scene: S) => string[];
}

export type Role = 'teacher' | 'student' | 'solo';
