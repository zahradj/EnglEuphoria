// Emotional Beats — the 7 human moments every lesson must include.
// Language sticks when it rides an emotion. Missing beats = a flat lesson,
// even if pedagogy is technically correct.

export const EMOTIONAL_BEATS = [
  {
    id: 'surprise',
    label: 'Surprise',
    prompt: 'An unexpected twist — a hidden object appears, a character switches sides, the wrong answer turns out useful.',
  },
  {
    id: 'funny',
    label: 'Funny moment',
    prompt: 'A character does something silly (Pip trips over a balloon, Bella paints her nose). Age-safe humor, never sarcasm.',
  },
  {
    id: 'challenge',
    label: 'Challenge',
    prompt: 'A moment where the learner must stretch — boss round, tricky prompt, timed movement. Must be beatable with today\'s language.',
  },
  {
    id: 'celebration',
    label: 'Celebration',
    prompt: 'A visible win — confetti, cheer, character high-five. Ties directly to the mission success.',
  },
  {
    id: 'reward',
    label: 'Reward',
    prompt: 'A concrete keepsake from the Theme Brain (Rainbow Badge, Master Chef Hat). Persists after the lesson ends.',
  },
  {
    id: 'emotional',
    label: 'Emotional moment',
    prompt: 'A heart beat — Pip is sad, then helped; a character makes a friend; kindness resolves the problem.',
  },
  {
    id: 'memorable_scene',
    label: 'Memorable scene',
    prompt: 'One visually iconic slide the learner will still picture tomorrow — the "album cover" of the lesson.',
  },
] as const;
export type EmotionalBeatId = typeof EMOTIONAL_BEATS[number]['id'];

export const EMOTIONAL_BEATS_PROMPT = `
## EMOTIONAL BEATS (binding — every lesson must include all seven)

A lesson without emotion does not stick. Every blueprint MUST plant these
seven moments and bind each one to a specific slide index. Emit at
\`blueprint.emotional_beats\`:
\`{ [beat_id]: { slide_index: number, description: string } }\`.

${EMOTIONAL_BEATS.map(
  (b, i) => `${i + 1}. **${b.label}** (id: \`${b.id}\`) — ${b.prompt}`,
).join('\n')}

Rules:
- One slide may carry multiple beats (a celebration can be the memorable
  scene) but every beat_id MUST resolve to a real slide index.
- A missing beat = the blueprint is rejected and rewritten.
- Beats must feel earned, not decorative. The Surprise cannot be random —
  it must connect to the mission. The Emotional moment cannot be tacked on —
  it must arise from the story\'s problem.
- Playground: keep humor gentle, keep the emotional moment resolved before
  the lesson ends (never leave a young learner sad).
`.trim();
