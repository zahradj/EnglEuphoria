// Academy lesson player — scene script format (owned by the Academy hub; imports nothing outside src/academy-player/).
// A lesson is a typed array of BEATS. The player position is one small serialisable object (see engine.ts), which is also
// the live-sync snapshot and the rewind point. Design: docs/academy-player-design.md §6.

export type CastName = 'Vee' | 'Ava' | 'Theo' | 'Mia';
export const CAST_NAMES: readonly CastName[] = ['Vee', 'Ava', 'Theo', 'Mia'] as const;
export type Speaker = CastName | 'narrator';
export type Expression = 'neutral' | 'happy' | 'curious' | 'surprised' | 'thinking' | 'concerned';
export type Position = 'left' | 'center' | 'right';
export type Level = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
export type VarValue = string | number | boolean;

/** Optional tap-to-gloss words inside a line: the student taps the word to see its meaning. */
export type Gloss = Record<string, string>;

export interface ChoiceOption {
  text: string;
  /** label to jump to after this option (defaults to the next beat) */
  goto?: string;
  /** for language-testing choices: is this the right answer? */
  correct?: boolean;
  /** shown after picking; wrong answers get a specific, friendly hint */
  feedback?: string;
  set?: Record<string, VarValue>;
}

export interface PanelSpec {
  /** background id (art slot); shown as a placeholder until the real picture exists */
  bg: string;
  alt: string;
  who?: CastName;
  expr?: Expression;
  bubble?: { who: Speaker; text: string };
  /** one tappable key word per panel (A1: at most one) */
  keyWord?: { word: string; meaning: string };
}

export interface FlashCard {
  word: string;
  /** the word inside a short chunk, e.g. "a new student" */
  chunk: string;
  /** picture id (art slot) */
  pictureId: string;
  alt: string;
  voice?: string;
}

/**
 * A chat message. 'Unknown' is a story PROP (for example a mystery profile): it has a label and text on screen but no picture,
 * no sprite and no voice. Only the four Academy cast members ever speak or appear.
 */
export interface ChatMessage {
  who: CastName | 'You' | 'Unknown';
  /** display name for 'Unknown' senders, e.g. "new_friend" */
  label?: string;
  text: string;
  gloss?: Gloss;
}

export type Beat =
  | { t: 'label'; name: string }
  | { t: 'bg'; id: string; alt: string }
  | { t: 'show'; who: CastName; pos: Position; expr: Expression }
  | { t: 'hide'; who: CastName }
  | { t: 'say'; who: Speaker; expr?: Expression; text: string; voice?: string; key?: string[]; gloss?: Gloss }
  | { t: 'choice'; prompt: string; tests: 'language' | 'story'; options: ChoiceOption[] }
  | { t: 'chat'; title: string; messages: ChatMessage[]; reply?: { prompt: string; options: ChoiceOption[] } }
  | { t: 'panels'; layout: 'strip' | 'grid'; panels: PanelSpec[] }
  | { t: 'flash'; title: string; cards: FlashCard[] }
  | { t: 'set'; key: string; value: VarValue }
  | { t: 'if'; key: string; equals: VarValue; goto: string }
  | { t: 'jump'; label: string }
  | { t: 'segment'; index: number }
  | { t: 'end'; summary?: string };

export interface SceneScript {
  /** 'A1-S01-E1' (matches the Academy lesson blueprint id) */
  lessonId: string;
  level: Level;
  title: string;
  /** characters that appear; must be Academy cast-vault characters only */
  cast: CastName[];
  beats: Beat[];
}

/** Beats the player stops on and waits for the student (or the teacher). */
export const INTERACTIVE_KINDS: readonly Beat['t'][] = ['say', 'choice', 'chat', 'panels', 'flash', 'end'] as const;
export const isInteractive = (b: Beat) => (INTERACTIVE_KINDS as readonly string[]).includes(b.t);
