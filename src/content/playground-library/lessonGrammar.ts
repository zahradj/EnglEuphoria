/** Grammar the scene-based Playground lessons teach, keyed by lesson key
 *  (`${contentFormat}-${unit_number}-${lesson_number}` — same key as the
 *  Homework Quest registry). The student dashboard's Grammar Journal shows
 *  these for every lesson the student has finished; scene lessons have no
 *  grammar_pattern column to read from, so the pattern lives with the code
 *  that teaches it. Add an entry when you build a lesson that teaches one. */
export interface LessonGrammarEntry {
  pattern: string;
  cefr: string;
  /** Short form cards: label + formula. */
  forms: { label: string; formula: string }[];
  examples: string[];
}

export const LESSON_GRAMMAR: Record<string, LessonGrammarEntry> = {
  // Pre-A1 Unit 2 Lesson 1 — Red, Blue, Yellow! (The Color Carnival)
  'lep1-rich-2-1': {
    pattern: "It's + color",
    cefr: 'Pre-A1',
    forms: [
      { label: 'Say the color', formula: "It's + red / blue / yellow" },
      { label: 'Say what you like', formula: 'I like + color' },
      { label: 'Say what you don’t like', formula: 'I don’t like + color' },
    ],
    examples: ["It's red!", "It's blue!", "It's yellow!", 'I like red!', 'I don’t like blue!'],
  },
  // A1 Unit 9 Lesson 1 — Magic Castle: rooms and furniture
  'castle-rich-9-1': {
    pattern: 'There is / There is no',
    cefr: 'A1',
    forms: [
      { label: 'There is', formula: 'There is + a + thing + in the + room' },
      { label: 'There is no', formula: 'There is no + thing + in the + room' },
    ],
    examples: ['There is a chair in the kitchen.', 'There is a bed in the bedroom.', 'There is no chair in the kitchen.'],
  },
};
