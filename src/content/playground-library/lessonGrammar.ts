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
  // Pre-A1 Unit 2 Lesson 2 — Green, Orange, Purple! (The Magic Paint Pots)
  'lep1-rich-2-2': {
    pattern: 'What color is it? — It\'s + color',
    cefr: 'Pre-A1',
    forms: [
      { label: 'Ask the color', formula: 'What color is it?' },
      { label: 'Say the color', formula: "It's + green / orange / purple" },
      { label: 'Say what you like', formula: 'I like + color' },
    ],
    examples: ['What color is it?', "It's green!", "It's orange!", 'I like purple!', 'I don’t like green!'],
  },
  // Pre-A1 Unit 2 Lesson 3 — Circle, Square, Triangle!
  'lep1-rich-2-3': {
    pattern: 'What shape is it? — It\'s a + shape',
    cefr: 'Pre-A1',
    forms: [
      { label: 'Ask the shape', formula: 'What shape is it?' },
      { label: 'Say the shape', formula: "It's a + circle / square / triangle" },
      { label: 'Color and shape', formula: 'a + red + circle' },
      { label: 'Say what you like', formula: 'I like + circles / squares / triangles' },
    ],
    examples: ['What shape is it?', "It's a circle!", "It's a square!", 'A red triangle!', 'I like circles!'],
  },
  // Pre-A1 Unit 2 Lesson 4 — What Color Is This?
  'lep1-rich-2-4': {
    pattern: 'What color / shape is this? — Is it …? Yes, it is. / No, it isn\'t.',
    cefr: 'Pre-A1',
    forms: [
      { label: 'Ask the color', formula: 'What color is this?' },
      { label: 'Ask the shape', formula: 'What shape is this?' },
      { label: 'Yes / no question', formula: 'Is it + red? / Is it + a circle?' },
      { label: 'Short answers', formula: "Yes, it is. / No, it isn't." },
    ],
    examples: ['What color is this?', "It's red!", 'What shape is this?', "It's a circle!", 'Is it blue?', "No, it isn't!", 'Yes, it is!'],
  },
  // Pre-A1 Unit 2 Lesson 5 — The Rainbow Fish's Scales (Shelly's story)
  'lep1-rich-2-5': {
    pattern: 'What color do you want? — I want + color, please.',
    cefr: 'Pre-A1',
    forms: [
      { label: 'Ask what someone wants', formula: 'What color do you want?' },
      { label: 'Say what you want', formula: 'I want + red, please!' },
      { label: 'Give it', formula: 'Here you are!' },
      { label: 'Say thanks', formula: 'Thank you!' },
    ],
    examples: ['What color do you want?', 'I want red, please!', 'Here you are! A red circle!', 'Thank you!'],
  },
  // Pre-A1 Unit 2 Lesson 6 — Color & Shape Hunt (unit review)
  'lep1-rich-2-6': {
    pattern: "It's a + color + shape",
    cefr: 'Pre-A1',
    forms: [
      { label: 'Color and shape together', formula: 'a + green + triangle' },
      { label: 'Say what it is', formula: "It's a + blue + square" },
      { label: 'Yes / no question', formula: 'Is it + green? / Is it + a circle?' },
      { label: 'Say what you like', formula: 'I like + color' },
    ],
    examples: ["It's a red circle!", "It's a blue square!", 'Find a green triangle!', 'Is it purple?', 'I like orange!'],
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
