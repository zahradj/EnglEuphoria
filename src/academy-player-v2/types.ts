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
  /** optional quest dressing (English content): stage names and goals, the Season clue unlocked at the end. Defaults come from the run of show. */
  quest?: QuestData;
  /** "Previously on…": beats shown on the lobby chapter card, taken from how the earlier lesson went (see StoryValue / chapter memory) */
  previously?: Previously;
}

/** What a scene can remember for the story: small flags and counters, read by later scenes and by the next lesson's "Previously on…". */
export type StoryValue = string | number | boolean;

/** One line of the highlight reel: a line the student chose or said on air (stays on the device, never uploaded). */
export interface ReelLine { who: string; text: string }

/** The recap of the earlier lesson on the lobby: each beat shows when its flag was set in that lesson (no `when` = always, the fallback when nothing is remembered). */
export interface Previously {
  /** blueprint id of the lesson it recaps, e.g. 'B1-S01-E3' */
  from: string;
  beats: { text: string; when?: string }[];
}

/** The lesson as a quest (Quest Layer): everything is optional, the defaults are the standard run of show and the Season chapter. */
export interface QuestData {
  /** quest name; default = the Season chapter title */
  name?: string;
  /** per part (0-7): title and one-line goal; missing entries use the default run of show */
  stages?: { title?: string; goal?: string }[];
  /** the clue this episode unlocks ("Clue N of 8"), shown on the Quest Complete screen */
  clue?: string;
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
  /** hunt scenes: the ids of the targets found (clue pieces / Word Cards for the bag) */
  found?: string[];
  /** story flags this scene sets (merged into the lesson's story state; later scenes and the next lesson read them) */
  story?: Record<string, StoryValue>;
  /** lines for the highlight reel (the Wrap plays them back) */
  reel?: ReelLine[];
}

export type FxTone = 'gold' | 'teal' | 'lilac' | 'coral';

/**
 * Game feel for scenes (the effects layer lives in the player, scenes only ask). Coordinates are % of the player (0-100).
 * Calm mode / reduced motion: burst, shake and confetti do nothing; float only fades in place, so feedback stays visible.
 */
export interface SceneFx {
  calm: boolean;
  /** sparks + ring at a point */
  burst: (x: number, y: number, tone?: FxTone) => void;
  /** a floating "+10" */
  float: (x: number, y: number, text: string, tone?: FxTone) => void;
  /** a short, soft stage shake that decays (never the picture) */
  shake: (strength?: 'soft' | 'hard') => void;
  /** confetti rain for a win */
  confetti: () => void;
  /** the centre of an element as % of the player */
  at: (el: Element | null | undefined) => { x: number; y: number };
  /** burst at an element's centre */
  burstAt: (el: Element | null | undefined, tone?: FxTone) => void;
  /** floating text just above an element */
  floatAt: (el: Element | null | undefined, text: string, tone?: FxTone) => void;
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
  /** how the lesson is going so far (the Wrap shows it) */
  summary: { xp: number; gems: number; mistakes: string[]; /** story flags set so far in this lesson */ story?: Record<string, StoryValue>; /** the highlight reel so far */ reel?: ReelLine[]; /** the quest recap (Quest Complete screen); absent when a scene renders alone */ quest?: import('./engine/quest').QuestRecap };
  /** a hunt scene tells the player the moment a target is found (the bag fills live); `el` is where it flew from */
  onFound?: (id: string, el?: Element | null) => void;
  /** game feel (bursts, floating text, shake, confetti); optional so a scene renders alone in tests: use `useSceneFx(props.fx)` */
  fx?: SceneFx;
}

/** A scene kind: its view, what it says aloud, and a validator the registry test runs on every scene. */
export interface SceneModule<S extends SceneBase = SceneBase> {
  view: ComponentType<SceneProps<S>>;
  /** lines the recorded voices say on this scene, in order */
  spoken: (scene: S) => { who: string; text: string }[];
  /** return a list of problems (empty = valid) */
  validate: (scene: S) => string[];
  /** pictures this scene shows besides the plate, as 'cards/<id>' (paths under public/academy-art, no extension): the art check reads them */
  art?: (scene: S) => string[];
}

export type Role = 'teacher' | 'student' | 'solo';
