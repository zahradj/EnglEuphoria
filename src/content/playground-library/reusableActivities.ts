/**
 * The reusable-activity vault: concrete, already-built lesson activities
 * (scene `kind`s shared by every Playground scene library) that can be
 * dropped into any lesson with a different vocabulary set or background.
 * Shown on the /activity-catalog page; the full authoring rules live in
 * .claude/skills/activity-pattern-library.
 *
 * Add an entry here whenever a new shared activity is built, with an example
 * that is valid to paste straight into a lesson's scene array.
 */
export interface ReusableActivity {
  kind: string;
  name: string;
  /** Where the component lives. */
  file: string;
  purpose: string;
  howItWorks: string;
  /** Paste-ready scene object (swap the vocabulary / pictures). */
  example: Record<string, unknown>;
}

export const REUSABLE_ACTIVITIES: ReusableActivity[] = [
  {
    kind: 'picture-match',
    name: 'Picture ↔ word match',
    file: 'src/content/playground-library/PictureMatchScene.tsx',
    purpose: 'Controlled practice / self-check of 2-8 known words (vocabulary recognition + reading).',
    howItWorks:
      'Picture cards with an empty slot in two side columns, word tiles in the middle. The student drags a word into '
      + 'the slot under its picture (or taps the word, then the slot). Right = snaps in and is spoken; wrong = shakes '
      + 'back. With studentOnly the student works alone and the teacher watches live (auto-evaluation slide).',
    example: {
      id: 'u5-food-match',
      kind: 'picture-match',
      prompt: 'Match the words to the pictures',
      studentOnly: true,
      teacher:
        'Auto-evaluation slide. The student does the exercise independently, without help from the teacher. '
        + "Dragging is switched off on the teacher's screen — watch and praise at the end.",
      items: [
        { word: 'muffins', emoji: '🧁' },
        { word: 'bread', emoji: '🍞' },
        { word: 'yoghurt', emoji: '🥛' },
        { word: 'cheese', emoji: '🧀' },
        { word: 'butter', emoji: '🧈' },
        { word: 'eggs', emoji: '🥚' },
      ],
    },
  },
  {
    kind: 'spin-wheel',
    name: 'Spin the wheel',
    file: 'src/content/playground-library/SpinWheelScene.tsx',
    purpose: 'Speaking production / retrieval review of 2-8 known words.',
    howItWorks:
      'Picture scene with numbered badges plus the shared numbered spinner. SPIN lands on a number, that badge '
      + 'lights up, the student says the word (🔊 models it). Tapping a badge is the no-spinner route.',
    example: {
      id: 'u3-spin-actions',
      kind: 'spin-wheel',
      bg: '<background image import>',
      title: 'Spin!',
      teacher:
        'Have the student spin the wheel and say the word that matches the number. '
        + 'If you prefer, do the activity without the spinner.',
      items: [
        { label: 'jump', left: '78%', top: '44%' },
        { label: 'run', left: '62%', top: '82%' },
        { label: 'swim', left: '30%', top: '30%' },
      ],
    },
  },
];
