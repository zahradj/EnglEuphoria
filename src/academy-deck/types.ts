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

/** Pre-A1 run of show (owner 2026-10-12): slower, with reading. Mirrors PRE_A1_RUN_OF_SHOW in src/curriculum/academy/lessonBlueprint.ts (a test keeps them equal). */
export const PRE_A1_PARTS = [
  { name: 'Check-in', goal: 'Say hello and see today’s goal', minutes: 5 },
  { name: 'Remember?', goal: 'Wake up the last two lessons', minutes: 10 },
  { name: 'The Drop', goal: 'Meet the scene and the new words', minutes: 8 },
  { name: 'Learn', goal: 'A few new words, then two games', minutes: 10 },
  { name: 'Read', goal: 'Blend sounds and read a short text', minutes: 8 },
  { name: 'Learn more', goal: 'A few more words, then two games', minutes: 8 },
  { name: 'Mission', goal: 'Use it with Theo', minutes: 6 },
  { name: 'Wrap', goal: 'What you can do now', minutes: 5 },
] as const;
/** Which run of show a deck follows: the A1+ one (PARTS) or the slower Pre-A1 one with a Read part. */
export type RunShape = 'standard' | 'pre-a1';
export const partsOf = (shape?: RunShape): readonly { name: string; goal: string; minutes: number }[] => (shape === 'pre-a1' ? PRE_A1_PARTS : PARTS);

/** Learner lanes (owner 2026-10-12): the same lesson at three levels. start = pre-A1, core = A1, stretch = post-A1. */
export type Lane = 'start' | 'core' | 'stretch';
export const LANES: Lane[] = ['start', 'core', 'stretch'];

/** Where a slide sits in the teaching sequence (docs/research/academy-lesson-sequencing.md): context, model (I do), rule, controlled practice (we do), free practice, produce (you do), review. */
export type Stage = 'context' | 'model' | 'rule' | 'controlled' | 'free' | 'produce' | 'review';
export const STAGE_ORDER: Stage[] = ['context', 'model', 'rule', 'controlled', 'free', 'produce'];

export interface SlideBase {
  /** a bonus game (owner 2026-10-14: more vocabulary games): the teacher can skip it when time is short; it is not counted in the core 60 minutes */
  flex?: boolean;
  /** the teaching stage of this slide (optional; lessons that set it are checked for the order model, rule, controlled, free, produce) */
  stage?: Stage;
  id: string;
  /** per-lane overrides: the fields listed here replace the slide's own when the student is in that lane (core = the slide as written) */
  lanes?: Partial<Record<Exclude<Lane, 'core'>, Record<string, unknown>>>;
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
  /** the knowledge items (words/chunks) this slide practises: homework results are logged per item */
  items?: string[];
}

export interface TitleSlide extends SlideBase { kind: 'title'; heading: string; sub: string }
export interface BriefSlide extends SlideBase { kind: 'brief'; say: string; heading: string; stamps: { id: string; icon: string; label: string }[] }
export interface BadgeSlide extends SlideBase { kind: 'badge'; prompt: string; starter: string; /** also ask the age (saved as vars.age) */ ages?: number[] }
export interface DialSlide extends SlideBase { kind: 'dial'; prompt: string }
/** The student (or teacher) picks a lane: Start, Core or Stretch. Saved as vars.lane; can be changed any time from More. */
export interface LaneSlide extends SlideBase { kind: 'lane'; prompt: string; choices: { lane: Lane; title: string; blurb: string; art: TeachArt }[] }
export interface WhoSaidSlide extends Omit<SlideBase, 'items'> {
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
export type ActionId = 'listen' | 'look' | 'repeat' | 'click' | 'read' | 'point' | 'sorry' | 'slow' | 'confused' | 'meaning';
export type TeachArt =
  | { type: 'count'; n: number }
  | { type: 'flag'; code: string }
  | { type: 'person'; code: string }
  | { type: 'letters'; text: string }
  /** flag + traveller side by side (a country and its nationality) */
  | { type: 'pair'; code: string }
  /** a cast character holding the flag of a country (painted character, waving flag) */
  | { type: 'bearer'; code: string; who: CastName }
  /** an animated drawn classroom picture (slides/actions.tsx): the instruction words and the help phrases */
  | { type: 'action'; id: ActionId }
  /** a Canva picture card from `cards/<id>.webp` (flat 2D illustration; never 3D, never emoji) */
  | { type: 'card'; id: string; label: string };
export interface TeachPage { word: string; art: TeachArt; meaning: string; example: string; clue?: string }
export interface TeachSlide extends SlideBase { kind: 'teach'; title: string; pages: TeachPage[] }
/** Modelling: the characters DO the language, line by line; the pattern card shows the frame and the part that changes. */
export type ModelPart = string | { slot: string; label: string };
export interface ModelSlide extends SlideBase { kind: 'model'; title: string; lines: { who: CastName; text: string; pic?: TeachArt; frame?: ModelPart[]; note?: string }[]; closing: string }
/** Hidden-object hunt (homework): find the numbers hidden in the scene. Drawn number cards are placed on the scene plate. */
export interface HuntSlide extends SlideBase {
  kind: 'hunt';
  prompt: string;
  targets: { word: string; n: number; x: number; y: number }[];
  decoys: { n: number; x: number; y: number }[];
}
/** Shadow match (homework): a dark silhouette of a picture; pick the right word. */
export interface ShadowSlide extends SlideBase { kind: 'shadow'; prompt: string; rounds: { art: TeachArt; answer: string; options: string[] }[] }
export interface BorderSlide extends SlideBase { kind: 'border'; prompt: string; /** nationality word -> flag code: each passport shows its flag */ flags?: Record<string, string>; /** `who`: the cast character who arrives holding the flag (default: a drawn traveller) */ rounds: { flag: string; says: string; answer: string; options: string[]; who?: CastName }[]; stamp?: string }
export interface NumWallSlide extends SlideBase { kind: 'numwall'; title: string; /** also show 200, 300 … 900 under the chart */ hundreds?: boolean; /** how many different numbers the student must tap (default 8) */ need?: number }
export interface MemorySlide extends SlideBase { kind: 'memory'; prompt: string; /** each pair is a flag, or any teach picture (`art`), with its word */ pairs: { flag?: string; art?: TeachArt; text: string }[] }
export interface PhoneChatSlide extends SlideBase { kind: 'phonechat'; prompt: string; contact: CastName; steps: { text: string; /** a sticker picture beside the message */ pic?: TeachArt; reply: string; extra?: string[]; /** pictures on the word tiles (key = the tile text) so beginners see what the word means */ tilePics?: Record<string, TeachArt> }[] }
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
/** Match the picture with the word (drag the word onto its picture, or tap word then picture). */
export interface MatchSlide extends SlideBase {
  kind: 'match';
  prompt: string;
  pairs: { word: string; art: TeachArt }[];
  /** 'drag' (default): drag the word onto its picture. 'listen': hear the word, then choose its picture. */
  mode?: 'drag' | 'listen';
}
/** Counting practice: a row of numbers with gaps; fill each gap with the right number (the row is counted aloud first). */
export interface CountUpSlide extends SlideBase { kind: 'countup'; prompt: string; rounds: { seq: number[]; /** indexes of seq that are hidden */ blanks: number[] }[] }
/** Grammar: pick am / is / are for a sentence with a blank (statements, negatives and questions). */
export interface BePickSlide extends SlideBase { stamp?: string; kind: 'bepick'; prompt: string; rounds: { frame: string; answer: 'am' | 'is' | 'are'; who: TeachArt; why: string }[] }
/** Grammar: build a sentence from word tiles (a short fact on top says what to build); wrong forms are the distractors. */
export interface BuildSlide extends SlideBase { stamp?: string; kind: 'build'; prompt: string; rounds: { cue: string; target: string; extra?: string[]; hint?: string }[] }
/** Fact-check a profile card: is each sentence true? If not, choose the sentence that fixes it. */
export interface FactCheckSlide extends SlideBase {
  kind: 'factcheck';
  stamp?: string;
  prompt: string;
  profile: { who: CastName; name: string; age: number; from: string; nationality: string; flag: string };
  claims: { text: string; fact: boolean; fixes?: { text: string; ok?: boolean; hint?: string }[] }[];
}
/** Writing: the student types sentences with the pattern; each row is checked against accepted shapes (model hidden until "Show me"). */
export interface WriteSlide extends SlideBase {
  kind: 'write';
  stamp?: string;
  prompt: string;
  rows: { label: string; frame: string; /** regular expressions (source) tested on the normalised sentence */ accept: string[]; hint: string; sample: string }[];
}
/** Blending (Pre-A1): letters slide together into a word (s-a-t → sat). The student drags the slider or taps "Blend it". */
export interface BlendSlide extends SlideBase { kind: 'blend'; prompt: string; rounds: { letters: string[]; word: string; art?: TeachArt }[] }
/** Hear and pick (Pre-A1): the guide says a letter name or a word; the student picks it from big tiles. */
export interface HearPickSlide extends SlideBase { kind: 'hearpick'; prompt: string; rounds: { say: string; options: string[]; answer: string }[] }
/** Decodable reader page (Pre-A1): short lines with tap-to-hear words; match each line to its picture. */
export interface ReaderSlide extends SlideBase { kind: 'reader'; prompt: string; lines: { text: string; art: TeachArt }[] }
/** The rule, stated plainly (owner 2026-10-13): at most 3 lines, each with an example; the guide reads it, the student repeats it and taps "I said it". */
export interface RuleSlide extends SlideBase { kind: 'rule'; title: string; lines: { rule: string; /** spoken version of the rule (symbols like + are not read) */ say: string; example: string }[] }
/** Explore (owner 2026-10-14: new scenes and games): the scene plate is the game. Tap each hotspot (a stall, a poster) to hear the character say its line; a picture pops out and the line shows in a bubble. Done when every spot has been visited. */
export interface ExploreSlide extends SlideBase {
  kind: 'explore';
  prompt: string;
  /** x and y are percentages of the scene plate (the centre of the hotspot) */
  spots: { id: string; x: number; y: number; art: TeachArt; who: CastName; line: string; label: string }[];
}
export interface WrapSlide extends SlideBase { kind: 'wrap'; heading: string; ticks: string[]; homework: string; clue: string }

export type Slide =
  | TitleSlide | BriefSlide | BadgeSlide | DialSlide | LaneSlide | WhoSaidSlide | LockersSlide | NumTrainSlide | PadlockSlide | ConvoSlide | SpellSlide
  | MatchSlide | CountUpSlide | BePickSlide | BuildSlide | FactCheckSlide | WriteSlide | HuntSlide | ShadowSlide | TeachSlide | ModelSlide | FindWrongSlide | BorderSlide | MemorySlide | NumWallSlide | PhoneChatSlide | FadeSlide | CardSlide | SaySlide | WrapSlide | BlendSlide | HearPickSlide | ReaderSlide | RuleSlide | ExploreSlide;

export interface DeckScript {
  lessonId: string;
  level: 'Pre-A1' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
  /** which run of show the lesson follows (default: standard) */
  shape?: RunShape;
  /** Pre-A1 reading: the letters whose sounds are taught so far and the whole words (sight words) taught; reading pages are tested against them (decodable.ts) */
  taughtSounds?: string[];
  sightWords?: string[];
  title: string;
  objective: string;
  criteria: string[];
  cast: CastName[];
  /** one line per part (index 0-7) shown on the part card; defaults to the PARTS goals */
  partGoals?: string[];
  slides: Slide[];
}

export type Vars = Record<string, string>;
export interface Stats { right: number; wrong: number; hints: number; skipped: string[] }
