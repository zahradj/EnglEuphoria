// Academy Deck: a lesson as a deck of slides. Each slide = a full scene plate + ONE game. Data-driven (like PowerPoint slides), no hidden state machine:
// the deck only knows which slide you are on, whether it is solved, the student's answers (vars) and the stamps earned.
// Academy-only (hub separation). Silent: no browser TTS, no voices yet. No timers, no ranking.
export type CastName = 'Vee' | 'Ava' | 'Theo' | 'Mia';
export type Expr = 'neutral' | 'happy' | 'curious' | 'surprised' | 'thinking' | 'concerned' | 'wave' | 'thumbs' | 'football' | 'music';
export interface Actor {
  who: CastName;
  pos: 'left' | 'center' | 'right';
  expr?: Expr;
}

/** The Academy blueprint's run of show (src/curriculum/academy/lessonBlueprint.ts RUN_OF_SHOW): every deck lesson follows it, in this order. */
export const PARTS = [
  { name: 'Check-in', goal: 'Say hello and see today’s mission', minutes: 5 },
  { name: 'Remember?', goal: 'Wake up what you already know', minutes: 7 },
  { name: 'The Drop', goal: 'Meet the new words and watch the language in use', minutes: 10 },
  { name: 'Notice & Build', goal: 'Practise: numbers, spelling and nationalities', minutes: 10 },
  { name: 'Energiser', goal: 'A quick game', minutes: 4 },
  { name: 'Mission', goal: 'Choose your help, then try it for real', minutes: 12 },
  { name: 'Release', goal: 'Make your sign-up card and say it on your own', minutes: 7 },
  { name: 'Wrap', goal: 'What you can do now', minutes: 5 },
] as const;

export interface SlideBase {
  id: string;
  /** which part of the blueprint's run of show this slide belongs to (0-7, see PARTS); slides stay in part order */
  part: number;
  /** scene plate id: `${artBase}/bg/<id>.webp` (a drawn gradient shows if the picture is missing) */
  bg: string;
  actors?: Actor[];
  /** success criteria this slide trains (1-based); a slide with none is only allowed for title / brief / wrap */
  trains?: number[];
  /** two-step help shown by the Hint button: [small nudge, bigger help] */
  hints?: [string, string?];
  /** one line for the teacher in a live class */
  note?: string;
}

export interface TitleSlide extends SlideBase { kind: 'title'; heading: string; sub: string }
export interface BriefSlide extends SlideBase { kind: 'brief'; say: string; heading: string; stamps: { id: string; icon: string; label: string }[] }
export interface BadgeSlide extends SlideBase { kind: 'badge'; prompt: string; starter: string; /** also ask the age (saved as vars.age) */ ages?: number[] }
export interface DialSlide extends SlideBase { kind: 'dial'; prompt: string }
export interface WhoSaidSlide extends SlideBase {
  kind: 'whosaid';
  prompt: string;
  items: { text: string; who: CastName }[];
  /** the conversation is shown first, line by line (nothing is asked that was not shown); then the game */
  replay?: { who: CastName; text: string }[];
  replayTitle?: string;
}
export interface LockersSlide extends SlideBase { kind: 'lockers'; prompt: string; rounds: number[]; words: Record<number, string>; /** the lockers shown (default: 1-10) */ grid?: number[] }
export interface NumTrainSlide extends SlideBase { kind: 'numtrain'; prompt: string; numbers: number[]; words: Record<number, string> }
export interface PadlockSlide extends SlideBase { kind: 'padlock'; prompt: string; clue: string; code: string; reward: string; stamp?: string }
export interface ConvoSlide extends SlideBase {
  kind: 'convo';
  prompt: string;
  /** the student plays `me`; the other actor asks */
  me: CastName;
  /** what the student's lines are called in the log (default: the character's name) */
  meLabel?: string;
  /** options may carry a picture so beginners can choose by meaning, not only by reading */
  steps: { ask: string; pic?: TeachArt; options: { text: string; pic?: TeachArt; ok?: boolean; hint?: string }[] }[];
  after: string;
}
export interface SpellSlide extends SlideBase { kind: 'spell'; prompt: string; target: string; save?: string; stamp?: string }
export interface FindWrongSlide extends SlideBase { kind: 'findwrong'; prompt: string; rows: { label: string; text: string; wrong?: boolean; fix?: string }[]; reveal: string }
/** Vocabulary illustration: one animated page per word (picture that moves, meaning, example, clue). */
export type TeachArt =
  | { type: 'count'; n: number }
  | { type: 'flag'; code: string }
  | { type: 'person'; code: string }
  | { type: 'letters'; text: string }
  | { type: 'phrase'; icon: string }
  /** an animated emoji picture (feelings, objects) */
  | { type: 'emoji'; icon: string; label: string }
  /** a Canva picture card from `cards/<id>.webp` (falls back to its label) */
  | { type: 'card'; id: string; label: string };
export interface TeachPage { word: string; art: TeachArt; meaning: string; example: string; clue?: string }
export interface TeachSlide extends SlideBase { kind: 'teach'; title: string; pages: TeachPage[] }
/** Modelling: the characters DO the language, line by line; the pattern card shows the frame and the part that changes. */
export type ModelPart = string | { slot: string; label: string };
export interface ModelSlide extends SlideBase { kind: 'model'; title: string; lines: { who: CastName; text: string; pic?: TeachArt; frame?: ModelPart[]; note?: string }[]; closing: string }
export interface BorderSlide extends SlideBase { kind: 'border'; prompt: string; rounds: { flag: string; says: string; answer: string; options: string[] }[]; stamp?: string }
export interface MemorySlide extends SlideBase { kind: 'memory'; prompt: string; pairs: { flag: string; text: string }[] }
export interface PhoneChatSlide extends SlideBase { kind: 'phonechat'; prompt: string; contact: CastName; steps: { text: string; /** a sticker picture beside the message */ pic?: TeachArt; reply: string; extra?: string[] }[] }
export interface FadeSlide extends SlideBase { kind: 'fade'; prompt: string; lines: { who: CastName; text: string; keys: string[] }[] }
export interface CardSlide extends SlideBase {
  kind: 'card';
  prompt: string;
  model: { label: string; text: string }[];
  ages: number[];
  nationalities: string[];
}
export interface SaySlide extends SlideBase {
  kind: 'say';
  prompt: string;
  model: string;
  /** the model changes with the Chill / Normal / Push choice */
  byDial?: { chill: string; normal: string; push: string };
  /** the model stays visible (Mission takes); without it the model is hidden until "Show me" (the exit task) */
  open?: boolean;
}
export interface WrapSlide extends SlideBase { kind: 'wrap'; heading: string; ticks: string[]; homework: string; clue: string }

export type Slide =
  | TitleSlide | BriefSlide | BadgeSlide | DialSlide | WhoSaidSlide | LockersSlide | NumTrainSlide | PadlockSlide | ConvoSlide | SpellSlide
  | TeachSlide | ModelSlide | FindWrongSlide | BorderSlide | MemorySlide | PhoneChatSlide | FadeSlide | CardSlide | SaySlide | WrapSlide;

export interface DeckScript {
  lessonId: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
  title: string;
  objective: string;
  criteria: string[];
  cast: CastName[];
  slides: Slide[];
}

export type Vars = Record<string, string>;
export interface Stats { right: number; wrong: number; hints: number; skipped: string[] }
