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

export interface SlideBase {
  id: string;
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
export interface BadgeSlide extends SlideBase { kind: 'badge'; prompt: string; starter: string }
export interface WhoSaidSlide extends SlideBase { kind: 'whosaid'; prompt: string; items: { text: string; who: CastName }[] }
export interface LockersSlide extends SlideBase { kind: 'lockers'; prompt: string; rounds: number[]; words: Record<number, string> }
export interface NumTrainSlide extends SlideBase { kind: 'numtrain'; prompt: string; numbers: number[]; words: Record<number, string> }
export interface PadlockSlide extends SlideBase { kind: 'padlock'; prompt: string; clue: string; code: string; reward: string; stamp?: string }
export interface ConvoSlide extends SlideBase {
  kind: 'convo';
  prompt: string;
  /** the student plays `me`; the other actor asks */
  me: CastName;
  steps: { ask: string; options: { text: string; ok?: boolean; hint?: string }[] }[];
  after: string;
}
export interface SpellSlide extends SlideBase { kind: 'spell'; prompt: string; target: string; save?: string; stamp?: string }
export interface FindWrongSlide extends SlideBase { kind: 'findwrong'; prompt: string; rows: { label: string; text: string; wrong?: boolean; fix?: string }[]; reveal: string }
export interface BorderSlide extends SlideBase { kind: 'border'; prompt: string; rounds: { flag: string; says: string; answer: string; options: string[] }[]; stamp?: string }
export interface MemorySlide extends SlideBase { kind: 'memory'; prompt: string; pairs: { flag: string; text: string }[] }
export interface PhoneChatSlide extends SlideBase { kind: 'phonechat'; prompt: string; contact: CastName; steps: { text: string; reply: string; extra?: string[] }[] }
export interface FadeSlide extends SlideBase { kind: 'fade'; prompt: string; lines: { who: CastName; text: string; keys: string[] }[] }
export interface CardSlide extends SlideBase {
  kind: 'card';
  prompt: string;
  model: { label: string; text: string }[];
  ages: number[];
  nationalities: string[];
}
export interface SaySlide extends SlideBase { kind: 'say'; prompt: string; model: string }
export interface WrapSlide extends SlideBase { kind: 'wrap'; heading: string; ticks: string[]; homework: string; clue: string }

export type Slide =
  | TitleSlide | BriefSlide | BadgeSlide | WhoSaidSlide | LockersSlide | NumTrainSlide | PadlockSlide | ConvoSlide | SpellSlide
  | FindWrongSlide | BorderSlide | MemorySlide | PhoneChatSlide | FadeSlide | CardSlide | SaySlide | WrapSlide;

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
