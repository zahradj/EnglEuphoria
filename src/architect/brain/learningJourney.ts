// Multi-Sensory Learning Journey — binding sequence for every Playground lesson.
// Children remember language when they SEE → HEAR → TOUCH → MOVE → SAY → USE → REPEAT.

export const LEARNING_JOURNEY_STAGES = [
  'see',
  'hear',
  'touch',
  'move',
  'say',
  'use',
  'repeat',
] as const;
export type LearningJourneyStage = typeof LEARNING_JOURNEY_STAGES[number];

export const LEARNING_JOURNEY_PROMPT = `
## MULTI-SENSORY LEARNING JOURNEY (binding — every target word)

Children remember language only when they experience it through every channel,
in this exact order:

1. **SEE** — a concrete image anchor introduces the word (flashcard / vocab card).
2. **HEAR** — the word is spoken with clear audio (chant, listen_match, echo).
3. **TOUCH** — the learner taps, drags, or points to the object on screen.
4. **MOVE** — the learner performs a TPR gesture bound to the word.
5. **SAY** — the learner repeats or shadows the word aloud (echo / shadowing).
6. **USE** — the learner produces the word inside the exact grammar frame
   (sentence_builder / speaking_mission / role_play).
7. **REPEAT** — the word returns in a review, game, or homework slot so the
   loop closes and memory consolidates.

Binding rules:
- Every target vocabulary item MUST pass through ALL seven stages across the
  lesson. Missing any stage = the word is not learned.
- The stages MUST appear in order for each word. Never let USE precede SEE/HEAR.
- One slide may satisfy multiple stages (e.g. a chant covers HEAR + SAY + MOVE),
  but the blueprint MUST label which stages each slide covers via
  \`learning_journey: LearningJourneyStage[]\` on the slide plan.
- REPEAT is not a duplicate — it is spaced retrieval in a new context
  (different activity type, later slide, or homework).

Emit a compact \`learning_journey_map\` on the blueprint:
\`{ [targetWord]: LearningJourneyStage[] }\` proving all seven stages are covered.
Blueprints missing any stage for any target word will be rejected.
`.trim();
