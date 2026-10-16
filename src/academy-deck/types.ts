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
  /** extra practice the teacher can skip to keep the hour (shown dashed in the teacher's strip); the REQUIRED slides alone fill the hour */
  optional?: boolean;
  /** v2 lock-screen lessons: which lock (1-5) this slide belongs to; the key HUD fills when the lock's vault slide is done */
  lock?: number;
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
/** Sort (free practice, owner 2026-10-14): the student's own opinions. Tap a picture, then tap a bin ("I like…" / "I love…"); the sentence is built, shown and spoken. There is no wrong answer; done when every picture is placed. */
export interface SortSlide extends Omit<SlideBase, 'items'> {
  kind: 'sort';
  prompt: string;
  bins: { id: string; label: string; /** the sentence made when an item goes in: {w} is the item's word */ template: string }[];
  /** save the words placed in the FIRST bin (comma list) in vars[save]: the teacher sees what the student already knows */
  save?: string;
  /** `art` is optional: without a picture the item is a plain word or sentence chip (verbs, sentences) */
  items: { id: string; art?: TeachArt; word: string }[];
}
/** Story (owner 2026-10-14: stories as full scene plates): each beat is ONE full-bleed generated scene with the cast painted into it (public/academy-art/bg/<plate>.webp); the lines show as film subtitles and are spoken; the plates cross-fade (never zoom or pan). Done when the last line has been seen. */
export interface StorySlide extends SlideBase {
  kind: 'story';
  /** listening segment: the lines are heard first and the subtitle stays hidden until the student taps "Show the text" */
  listenFirst?: boolean;
  title: string;
  beats: { plate: string; lines: { who: CastName; text: string }[] }[];
}
/** Vault hub (v2): a lock opens. The door for `lock` swings open, its key flies into the HUD slot, one line says what the student just did. Done by itself after the animation; no question is asked. */
export interface VaultSlide extends SlideBase { kind: 'vault'; lock: number; line: string; reward: string }
/** Lock-pick lane (v2, Lock 1): the guide says a sound or word; the student taps the matching tile to set a pin. A soft light sweeps the tiles on a slow beat (visual only, no timing, no penalty); done when every pin is set. */
export interface RhythmSlide extends SlideBase { kind: 'rhythm'; prompt: string; rounds: { say: string; options: string[]; answer: string }[] }
/** Boss duel (v2, Lock 4, the signature game): a picture; the student picks its word, the sentence is built and spoken, then the student says it aloud (Say it). A right pick is a step forward; a miss is ONE soft step back (never below the start); three misses in a round show the answer. Done when the key reaches the lock. */
export interface DuelSlide extends SlideBase { kind: 'duel'; prompt: string; frame: string; rounds: { art: TeachArt; options: string[]; answer: string }[] }
/** Passage (Pre-A1 reading-first, owner 2026-10-15): a short message from a character. Step 1 listen, step 2 read it yourself (any word can be tapped to hear it), step 3 KEEP the words you want: they go in the student's word bank (vars[bank]) and come back in the word-bank game and the spaced Remember?/Daily 10. No wrong answers; done when the words are kept. */
export interface PassageSlide extends SlideBase { kind: 'passage'; prompt: string; from: CastName; lines: string[]; /** the words the student may keep (all appear in the lines) */ keepFrom: string[]; /** how many words must be kept (default 3) */ keep?: number; /** vars key for the bank */ bank: string }
/** Trophy Forge (B1 S1, owner-approved plan 2026-10-15): for each verb the student places the three forms (base, past simple, past participle) in order; the trio is forged into a trophy that stays on the board, and the student says it aloud (Say it). A wrong tile just shakes ("Not yet"); nothing is lost. Done when every verb is forged; the verbs are saved in vars.trophies. */
export interface ForgeSlide extends SlideBase { kind: 'forge'; prompt: string; rounds: { /** the three forms in order: base, past simple, past participle */ forms: [string, string, string] }[] }
/** Trio streak (B1 S1): the guide says the base form; the student picks the past simple and then the past participle. A streak counts the verbs done right the first time; a miss resets the streak (no penalty) and the verb comes again; the student's own best streak is kept in vars.bestStreak and the score in vars[save]. No timer. */
export interface StreakSlide extends SlideBase { kind: 'streak'; prompt: string; save?: string; rounds: { forms: [string, string, string]; /** wrong choices for the past simple and for the past participle */ pastOptions: string[]; partOptions: string[] }[] }
/** Reading questions (B1+): the text stays on screen; the student answers detail, inference and vocabulary-in-context questions by choosing a sentence; a short reason explains each answer. No voice: the student reads. Done when every question is answered. */
export interface ReadQSlide extends SlideBase { kind: 'readq'; prompt: string; title: string; from: CastName; paragraphs: string[]; questions: { type: 'gist' | 'detail' | 'inference' | 'word'; q: string; options: string[]; answer: string; why: string }[] }
/** Break the Clock (B1 S1, video-game mechanic: boss fight). A giant clock has hit points; each right choice of tense is a strike that cracks it, each wrong choice costs one of three shields (the shields recharge and the round repeats with the reason shown: nothing is lost). Serves "choose the past simple (a finished time) or the present perfect (an experience up to now)". Done when the clock is broken. */
export interface BossSlide extends SlideBase { kind: 'boss'; prompt: string; rounds: { /** the sentence with ___ for the gap */ frame: string; options: string[]; answer: string; /** one line that says why (the time word) */ why: string }[] }
/** Participle Wordle (video-game mechanic: word puzzle). Guess the past participle of the base verb in six tries; letters turn green (right place), gold (in the word) or grey. Keyboard on screen and on the device. Done when every word is solved or revealed. */
export interface WordleSlide extends SlideBase { kind: 'wordle'; prompt: string; rounds: { base: string; /** a sentence with ___ that the participle completes */ clue: string; answer: string }[] }
/** Rapport (video-game mechanic: dialogue RPG). A character talks to the student; the student picks a reply; each reply raises a Rapport meter by 0-2 and the character answers in kind. Teaches present perfect for experience plus a past-simple follow-up in a real exchange. Nothing is lost; done after the last scene. */
export interface RpgSlide extends SlideBase { kind: 'rpg'; prompt: string; /** the name of the meter (default "Rapport"; the Alibi uses "Evidence") */ meter?: string; npc: CastName; goal: number; scenes: { say: string; options: { text: string; score: 0 | 1 | 2; reply: string; note: string }[] }[] }
/** Hot Seat (video-game mechanic: quiz-show ladder with lifelines). Climb a ladder of questions; two lifelines (50:50 and Ask a friend, a hint) can each be used once; a wrong answer only greys that option. Done at the top. */
export interface QuizSlide extends SlideBase { kind: 'quiz'; prompt: string; friend: CastName; questions: { q: string; options: string[]; answer: string; why: string; hint: string }[] }
/** Triple Match (B1 S1, video-game mechanic: match-3). Three columns (base, past simple, past participle) of shuffled tiles; pick one tile in each column; when the three belong to the same verb they lock into a card with a pop, the trio is spoken, and a combo counter rises with each first-try triple. A wrong triple shakes and clears the picks (nothing is lost). Done when every verb is matched. */
export interface TripleSlide extends SlideBase { kind: 'triple'; prompt: string; verbs: [string, string, string][] }
/** Cloze (B1+): the passage again, with gaps where the vocabulary learned this lesson goes. A word bank of the missing words (plus no extras); tap a word, then a gap (or a gap, then a word). A wrong word shakes and the sentence is read back with a hint after two tries; nothing is lost. Done when every gap is filled. Gaps are written [[word]] inside `paragraphs`. */
export interface ClozeSlide extends SlideBase { kind: 'cloze'; prompt: string; title: string; paragraphs: string[]; /** a short hint per gap word (shown after two wrong tries) */ gapHints?: Record<string, string> }
/** Glitch Hunt (B1 S1, video-game mechanic: spot the glitch / bug hunt). A short chat in which ONE line has a tense glitch. The student taps the glitch (a wrong tap only shakes), then repairs it by choosing the right line; the repaired line is spoken with the reason. Done when every chat is repaired. */
export interface GlitchSlide extends SlideBase { kind: 'glitch'; prompt: string; rounds: { lines: { who: CastName; text: string }[]; /** index of the line with the glitch */ glitch: number; /** the repaired line and two wrong repairs */ fix: string; options: string[]; /** one line that says why (the time word) */ why: string }[] }
/** Verb Draw (B1 S1, video-game mechanic: collectible card draw + talk show). Phase 1: match-3 of the verb trios (base, past simple, past participle). Phase 2: draw a verb card; open a conversation with it (choose the participle for the question, say the question aloud, choose the right past-simple follow-up); the other character answers. A streak counts conversations done right the first time. Done after `draws` cards. */
export interface VerbDrawSlide extends SlideBase { kind: 'verbdraw'; prompt: string; npc: CastName; draws: number; verbs: { forms: [string, string, string]; /** the question with ___ for the participle */ frame: string; follow: { ok: string; bad: [string, string] }; /** what the other character answers */ reply: string }[] }
/** Case Board (B1 S1 L3, video-game mechanic: detective board / evidence sorting). One evidence card at a time drops onto the table; the student pins it under the right heading (a wrong pin only bounces back with the reason). `look: 'case'` = a corkboard with index cards and red string; `look: 'scenes'` = picture scene cards with two big choice buttons. Done when every card is pinned. The card text is spoken. */
export interface BoardSlide extends SlideBase {
  kind: 'board';
  look: 'case' | 'scenes';
  prompt: string;
  /** exactly two headings the cards are pinned under */
  bins: { id: string; label: string; hint?: string; /** an Icon name shown on the heading */ icon?: string }[];
  cards: { id: string; text: string; /** what is spoken when the card is read (defaults to `text`; use it when `text` has a ___ blank) */ say?: string; bin: string; /** why it belongs there (shown after a right pin, and as the nudge after a wrong one) */ why: string; /** scene picture (look 'scenes') */ art?: TeachArt; who?: CastName }[];
}
export interface WrapSlide extends SlideBase { kind: 'wrap'; heading: string; ticks: string[]; homework: string; clue: string }

export type Slide =
  | TitleSlide | BriefSlide | BadgeSlide | DialSlide | LaneSlide | WhoSaidSlide | LockersSlide | NumTrainSlide | PadlockSlide | ConvoSlide | SpellSlide
  | BoardSlide | MatchSlide | CountUpSlide | BePickSlide | BuildSlide | FactCheckSlide | WriteSlide | HuntSlide | ShadowSlide | TeachSlide | ModelSlide | FindWrongSlide | BorderSlide | MemorySlide | NumWallSlide | PhoneChatSlide | FadeSlide | CardSlide | SaySlide | VaultSlide | RhythmSlide | DuelSlide | PassageSlide | ForgeSlide | StreakSlide | ReadQSlide | BossSlide | WordleSlide | RpgSlide | QuizSlide | TripleSlide | GlitchSlide | VerbDrawSlide | ClozeSlide | WrapSlide | BlendSlide | HearPickSlide | ReaderSlide | RuleSlide | ExploreSlide | SortSlide | StorySlide;

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
  /** minutes per part for THIS lesson (eight numbers adding to 60) when the content needs a different split from the run of show; the part cards and the lesson clock use them */
  partMinutes?: number[];
  /** v2 lock-screen lesson: the names of the locks (five), shown by the key HUD; slides carry `lock` and a `vault` slide opens each lock */
  locks?: string[];
  /** a look for the whole lesson: 'scene' (default, owner 2026-10-15: "study the Playground player") = the painted scene fills the screen, frosted glass for the task, an instruction pill, floating pill buttons; 'night' = deep indigo and teal with dark glass panels */
  theme?: 'night' | 'scene';
  /** false keeps the plain title card instead of the Academy lobby */
  hub?: boolean;
  /** teacher view only: show the lesson clock (part target vs running time); never shown to the student */
  clock?: boolean;
  slides: Slide[];
}

export type Vars = Record<string, string>;
export interface Stats { right: number; wrong: number; hints: number; skipped: string[]; /** times the student tapped "Say it" after saying an answer aloud (speaking practice, docs/academy-speaking-practice.md) */ spoken?: number }
/** Slide kinds where the student can say the answer aloud and tap "Say it" (owner 2026-10-14: speaking practice in every lesson). */
export const SAY_IT_KINDS: readonly string[] = ['teach', 'hearpick', 'blend', 'reader', 'match', 'memory', 'build', 'spell', 'convo', 'duel', 'rhythm', 'passage', 'forge', 'streak', 'triple', 'verbdraw'];

/** The parts of a lesson: its run of show, with the lesson's own minutes when it sets `partMinutes`. */
export function partsFor(script: Pick<DeckScript, 'shape' | 'partMinutes'>): { name: string; goal: string; minutes: number }[] {
  const base = partsOf(script.shape);
  return base.map((p, i) => ({ name: p.name, goal: p.goal, minutes: script.partMinutes?.[i] ?? p.minutes }));
}
