// Academy lesson player — scene script format (owned by the Academy hub; imports nothing outside src/academy-player/).
// A lesson is a typed array of BEATS. The player position is one small serialisable object (see engine.ts), which is also
// the live-sync snapshot and the rewind point. Design: docs/academy-player-design.md §6.

export type CastName = 'Vee' | 'Ava' | 'Theo' | 'Mia';
export const CAST_NAMES: readonly CastName[] = ['Vee', 'Ava', 'Theo', 'Mia'] as const;
export type Speaker = CastName | 'narrator';
export type Expression = 'neutral' | 'happy' | 'curious' | 'surprised' | 'thinking' | 'concerned' | 'wave' | 'thumbs' | 'football' | 'music';
/** poses are acting pictures (a wave, a thumbs-up, holding a football...); a character without that picture shows 'happy' instead */
export const POSES: readonly Expression[] = ['wave', 'thumbs', 'football', 'music'] as const;
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
  /** a very short A1 meaning, e.g. "what people call you" (shown under the picture) */
  meaning?: string;
  /** the question the card answers, e.g. "What is a name?" (shown big on the card's full page) */
  ask?: string;
  /** one or two very short A1 sentences with real examples (the clue) */
  clue?: string;
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

export interface ProfileRow {
  label: string;
  /** shown text; may contain {key} placeholders filled from the student's answers */
  value: string;
}

export interface FormField {
  key: string;
  label: string;
  kind: 'text' | 'choice' | 'multi';
  options?: string[];
  placeholder?: string;
  optional?: boolean;
  /** the start of the full sentence, shown before the answer ("My name is"); the saved value stays just the answer */
  starter?: string;
  /** one short clue under the field */
  clue?: string;
}

/** A model to follow: a short talk (who says what) or a filled example card (label -> value). */
export interface FormModel {
  title: string;
  style: 'talk' | 'card';
  lines: { who: string; text: string }[];
}

export type Beat =
  | { t: 'label'; name: string }
  | { t: 'bg'; id: string; alt: string }
  | { t: 'show'; who: CastName; pos: Position; expr: Expression }
  | { t: 'hide'; who: CastName }
  /**
   * `repeat`: after reading, the student says the line out loud (or types it): "read and repeat".
   * `hide`: memorise mode, the line is shown with its key words (or all but the first word) hidden; the student says it, then taps "Show me".
   */
  | { t: 'say'; who: Speaker; expr?: Expression; text: string; voice?: string; key?: string[]; gloss?: Gloss; repeat?: boolean; hide?: 'keys' | 'all' }
  /** tags the screens that follow with the success criteria (1..n) they train; 0 = warm-up/set-up only. Checked by tests (academy-lesson-craft alignment matrix). */
  | { t: 'trains'; criteria: number[] }
  /** story layout: a full-page scene where the characters act the conversation, speech bubbles next to the speaker */
  | { t: 'layout'; mode: 'story' | 'normal' }
  /** complete the conversation: lines with {{word}} gaps; tap a gap, then a word from the bank. Wrong word => "Not yet — try again" */
  | { t: 'cloze'; prompt: string; lines: { who: CastName; text: string }[]; bank: string[] }
  | { t: 'choice'; prompt: string; tests: 'language' | 'story'; options: ChoiceOption[] }
  | { t: 'chat'; title: string; messages: ChatMessage[]; reply?: { prompt: string; options: ChoiceOption[] } }
  | { t: 'panels'; layout: 'strip' | 'grid'; panels: PanelSpec[] }
  | { t: 'flash'; title: string; cards: FlashCard[]; /** skip the tap-the-picture check (a drag & drop match follows) */ noCheck?: boolean }
  /** tap word tiles to build the target sentence (distractor tiles allowed); wrong order => "Not yet — try again" */
  | { t: 'build'; prompt: string; target: string; extraTiles?: string[]; hint?: string }
  /** private say-it-aloud-or-type-it step; nothing is recorded or sent (the recording booth + consent are not built yet) */
  | { t: 'record'; prompt: string; model: string; hideModel?: boolean }
  /** can-do self-rating at the Wrap (yes / almost / not yet): honest evidence for the teacher, never a score */
  | { t: 'ticks'; prompt: string; items: string[] }
  /** one card at a time, two buttons ("I know it" / "not sure yet"); the count of "yes" is saved in vars[key] (teacher baseline) */
  | { t: 'sort'; prompt: string; cards: string[]; yes: string; no: string; key: string }
  /** tap a left item, then its partner on the right (right side shuffled by the seed) */
  | { t: 'match'; prompt: string; drag?: boolean; pairs: { left: string; right: string; leftPicture?: { id: string; alt: string } }[] }
  /** a profile card to read (tap-to-gloss). With hotspots the student taps rows that look wrong; each reveals why. */
  | { t: 'profile'; title: string; prompt?: string; rows: ProfileRow[]; hotspots?: { row: number; why: string }[]; gloss?: Gloss }
  /** a small form; answers are saved in vars[field.key] and can be shown later as {key} */
  | { t: 'form'; prompt: string; fields: FormField[]; model?: FormModel }
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
export const INTERACTIVE_KINDS: readonly Beat['t'][] = ['say', 'cloze', 'choice', 'chat', 'panels', 'flash', 'build', 'record', 'ticks', 'sort', 'match', 'profile', 'form', 'end'] as const;
export const isInteractive = (b: Beat) => (INTERACTIVE_KINDS as readonly string[]).includes(b.t);
