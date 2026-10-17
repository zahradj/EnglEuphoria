import type { RawChapter } from '../authoring';

/** Hand-written arc of one Season (skill academy-season-arc): the essential question and the eight chapters E1-E8. */
export interface SeasonArc {
  /** "How can I ...?" / "What ...?" - the one question the Season lets the student answer; the Release answers it */
  essentialQuestion: string;
  /** exactly 8, in episode order; the 8th question === essentialQuestion */
  chapters: RawChapter[];
}
