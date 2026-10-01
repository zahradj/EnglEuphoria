/* =============================================================================
 * Homework Quests — gamified, themed homework for every Playground lesson.
 *
 * A quest is pure data (this file's types): a themed map of levels, each
 * level one game mechanic driven by the lesson's own pictures, characters,
 * words and phonics sound. <HomeworkQuest /> plays any quest.
 *
 * Every line a quest can say is recorded ahead of time with the platform's
 * character voices (scripts/generate-voice-cache.mjs reads allQuestLines()),
 * and the game only ever plays recorded clips — never the browser's voice
 * (CLAUDE.md "Voice"). Images are paths under /public; new art is made by
 * scripts/art-targets.json + .github/workflows/bake-art.yml.
 * ========================================================================== */

export type QuestVoice = 'teacher' | 'pip' | 'mia' | 'bella' | 'willow' | 'leo' | 'narrator';

/** A box on a picture, in percent of the picture (x/y = top-left). */
export interface Box { x: number; y: number; w: number; h: number }

/** A sticker placed on a picture (percent position of its foot / centre). */
export interface PlacedSticker { src: string; x: number; y: number; w?: number }

interface LevelBase {
  name: string;
  /** Map icon: an emoji or an image path. */
  icon: string;
  /** Spoken when the level opens. */
  intro: string;
  /** Voice for this level's lines (defaults to the quest's guide voice). */
  voice?: QuestVoice;
}

export type QuestLevel =
  | (LevelBase & {
      /** Picture cut into pieces; "Find the kitchen." → drop that piece in
       *  its place. `numbered`: slots show numbers and lines say them. */
      kind: 'scene-puzzle'; img: string; aspect: number; numbered?: boolean;
      pieces: { label: string; box: Box; line: string }[];
    })
  | (LevelBase & {
      /** Listen-only: hear a sentence, tap the right place on the picture. */
      kind: 'tap-hotspot'; img: string; aspect: number; marker?: string;
      spots: { label: string; box: Box }[];
      rounds: { target: string; line: string }[];
    })
  | (LevelBase & {
      /** Drag real stickers into the right zone of a (often empty) scene. */
      kind: 'sticker-drop'; img: string; aspect: number;
      zones: { id: string; box: Box }[];
      stickers: { item: string; src: string; zone: string; size: number; line: string }[];
    })
  | (LevelBase & {
      kind: 'true-false';
      rounds: { img: string; line: string; isTrue: boolean; sticker?: PlacedSticker }[];
    })
  | (LevelBase & {
      /** Hear the sentence, build it word by word (extra words are traps). */
      kind: 'sentence-builder';
      rounds: { img: string; line: string; extra: string[]; sticker?: PlacedSticker }[];
    })
  | (LevelBase & {
      /** Hear a word, pick its sound (ch / sh, or letters). `phonics`: the
       *  answer buttons also play the recorded letter sound. */
      kind: 'sound-choice'; img: string; choices: string[]; phonics?: boolean;
      rounds: { word: string; answer: string; emoji?: string; picture?: string }[];
    })
  | (LevelBase & {
      /** Hear a word/sentence, tap the matching picture (for non-readers). */
      kind: 'picture-choice'; img: string;
      rounds: { line: string; answer: string; options: { label: string; src?: string; emoji?: string }[] }[];
    })
  | (LevelBase & {
      /** Tongue twister: rebuild it against the hourglass, then say it 3 speeds. */
      kind: 'twister'; img: string; line: string; seconds: number; focus: string; sayIt: string;
    })
  | (LevelBase & {
      /** Read a short text (audio costs a star), then answer from memory. */
      kind: 'reading'; img: string; focus?: string; sentences: string[];
      questions: { q: string; options: string[]; answer: string }[];
    })
  | (LevelBase & {
      kind: 'treasure'; img: string; closed: string; open: string; win: string;
    });

export interface HomeworkQuest {
  /** Stable id, also the URL: /homework-quest/<id>. */
  id: string;
  title: string;
  subtitle: string;
  level: 'Pre-A1' | 'A1' | 'A2';
  /** The lesson this practises (scene-lesson registry key). */
  lessonKey: string;
  /** World theme. */
  theme: {
    accent: string;
    accent2: string;
    /** Night-sky wash (wizard/castle) or daylight look. */
    night: boolean;
    mapImg: string;
    /** The world's guide character sticker (header + map marker). */
    guide: string;
    /** Sticker that walks along the map path. */
    walker: string;
  };
  /** Default voice for level lines. */
  voice: QuestVoice;
  praise: { voice: QuestVoice; lines: string[]; tryAgain: string };
  levels: QuestLevel[];
}

/** Every (voice, text) the quest can say — for the voice baker. */
export function questLines(q: HomeworkQuest): [QuestVoice, string][] {
  const out: [QuestVoice, string][] = [];
  const add = (v: QuestVoice, t: string) => { if (t && t.trim()) out.push([v, t]); };
  q.praise.lines.forEach((t) => add(q.praise.voice, t));
  add(q.praise.voice, q.praise.tryAgain);
  for (const l of q.levels) {
    const v = l.voice ?? q.voice;
    add(v, l.intro);
    switch (l.kind) {
      case 'scene-puzzle': l.pieces.forEach((p) => add(v, p.line)); break;
      case 'tap-hotspot': l.rounds.forEach((r) => add(v, r.line)); break;
      case 'sticker-drop': l.stickers.forEach((s) => add(v, s.line)); break;
      case 'true-false': case 'sentence-builder': l.rounds.forEach((r) => add(v, r.line)); break;
      case 'sound-choice': l.rounds.forEach((r) => add(v, r.word)); break;
      case 'picture-choice': l.rounds.forEach((r) => add(v, r.line)); break;
      case 'twister': add(v, l.line); add(v, l.sayIt); break;
      case 'reading': l.sentences.forEach((s) => add(v, s)); l.questions.forEach((x) => add(v, x.q)); break;
      case 'treasure': add(v, l.win); break;
    }
  }
  return out;
}
