// Playground Pedagogy Prompt — injected ONLY for hub === 'playground'.
// Chained AFTER governance, BEFORE activity per-type prompts.
//
// Contract: ultra-short concrete definitions, ≤6-word sentences,
// ≤2-syllable target words, no abstract concepts, every 3 slides
// includes celebration + speaking, hard ban on debate/opinion/essay.

import { PLAYGROUND_PACING, PLAYGROUND_REGISTER, PLAYGROUND_ACTIVITY_PROFILE } from './types';

export function buildPlaygroundSystemPrompt(): string {
  const r = PLAYGROUND_REGISTER;
  const p = PLAYGROUND_PACING;
  const a = PLAYGROUND_ACTIVITY_PROFILE;

  return `# PLAYGROUND PEDAGOGY CONTRACT (binding — early-years register)

This lesson is for the Playground Hub (ages 4–8). Apply ALL rules below
on top of governance/planning. Violations BLOCK publish.

## Early-Years Register
- Definitions: MAX ${r.maxDefinitionWords} words, concrete, kid-grade.
  Good: "a small red fruit"
  Bad:  "a round edible reproductive body of a seed plant"
- Example sentences: MAX ${r.maxSentenceWords} words, one verb each.
- Target words: prefer ≤ ${r.maxSyllablesPerWord} syllables.
- FORBIDDEN abstract words anywhere (definitions, prompts, instructions):
  ${r.forbiddenAbstractWords.join(', ')}
- No metaphor, no irony, no double meanings, no idioms unless taught explicitly.
- Tone: warm, playful, curious. NEVER corporate, NEVER teen-cool, NEVER patronizing.

## Pacing
- Total slides: ${p.targetSlideCount[0]}–${p.targetSlideCount[1]}.
- Max ${p.maxConsecutiveHighLoad} high-cognitive-load slide in a row
  (reading passages, grammar explanations, multi-step writing).
- Insert a celebration / Pip cheer / sticker / confetti moment
  every ${p.celebrationEveryNSlides} slides.
- Speaking opportunity every ${p.speakingEveryNSlides} slides.
- Each slide body_text MUST be ≤ ${p.maxTextLengthChars} characters.

## Activity Bans (HARD)
The following activity types are FORBIDDEN in Playground lessons:
  ${a.banned.join(', ')}
If asked to produce one, substitute with a story-driven equivalent
(matching, drag_drop, storytelling, pronunciation, trace_word).

## Required Coverage
Each lesson MUST contain at least one of EACH:
- Phonics / letter-trace activity (trace_letter, trace_word, phoneme_tap, rhyme_match)
- Listening activity (listen_and_match, listening, audio_to_image_match, sound_discrimination)
- Speaking activity (pronunciation, speaking_mission, storytelling, echo_repetition)

## Style
- All instructions to the child: ≤ 8 words, imperative, friendly.
  Good: "Tap the red apple!"  Bad: "Please proceed to identify the crimson fruit."
- Always pair text with image_prompt. NEVER text-only on a Playground slide.
- Mascot Pip should appear with varied expressions, not the same image every slide.

Internally CONFIRM compliance with every rule above before generating each activity.
`;
}
