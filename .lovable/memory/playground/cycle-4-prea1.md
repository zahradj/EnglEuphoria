---
name: Pre-A1 Cycle 4 — ESA Component Contract
description: Pre-A1 Playground lessons enforce strict ESA component sequence, lexical-chunks-only vocab, zero explicit grammar testing, multi-sensory phonics, and silent-period Activate
type: feature
---

# Pre-A1 Cycle 4 — ESA Component & Schema Contract

Applies ONLY when `hub === 'Playground'` AND `cefr === 'Pre-A1'`. Lives in `src/playground/` + `src/playground/esa/`, registered in `src/qa/orchestrator.ts`.

## Required ESA component sequence (HARD)

```
ENGAGE:   intro → click_to_reveal → scaffolded_media
STUDY:    phonics_focus → trace_letter → blend_builder → listen_and_repeat
ACTIVATE: [input-only opener] → drag_drop → sentence_builder(visual)
CONCLUDE: storybook → speaking_mission → lesson_summary
```

Input-only openers (silent-period safe): `audio_to_image_match`, `listen_and_match`, `listen_and_choose`, `instruction_command`, `grab_and_drag_sequence`. First `speaking_mission` MUST come AFTER first input-only opener.

## Banned activity types (Pre-A1 only)

`PLAYGROUND_PREA1_BANNED` in `src/playground/types.ts`: `fill_blank`, `multiple_choice`, `mcq`, `tense_transform`, `dictation`, `dictation_builder`, `error_correction`. A1+ Playground keeps current freedom.

## Vocabulary rules

- No isolated function-word headwords (`PLAYGROUND_PREA1_FUNCTION_WORDS`: is/am/are/the/a/my/your/it/this/that/can/etc.).
- Every vocab `example` must match a frame in `PLAYGROUND_CHUNK_LIBRARY`.
- `sentence_builder` / `chunk_builder` must be visual: `content.mode === 'visual'` OR every token carries `image_prompt`/`image`/`icon`.

## Multi-sensory phonics (SSP)

Every phonics-family block (`phonics`, `phoneme_tap`, `blend_builder`, `sound_hunt`, `rhyme_match`, `decode_the_word`, `cvc_builder`) must include all three: `content.tpr_action`, `content.blend_script`, `content.fine_motor_prompt`.

## Validator codes (all HARD, auto_repairable)

`PG_PREA1_BANNED_COMPONENT`, `PG_PREA1_ESA_SEQUENCE_VIOLATION`, `PG_PREA1_ACTIVATE_NO_SILENT_INPUT`, `PG_PREA1_ISOLATED_VOCAB`, `PG_PREA1_SENTENCE_BUILDER_TEXT_ONLY`, `PG_PREA1_PHONICS_MULTISENSORY_MISSING`. Plus `PG_BALANCE_MCQ_OVERLOAD` is now hard-zero for Pre-A1.

## Prompt enforcement

`buildPlaygroundEsaPrompt({ cefr_band: 'pre-a1', ... })` appends the Pre-A1 Cycle 4 binding section listing all 5 rules + the required sequence. Chained AFTER `buildPlaygroundSystemPrompt`, BEFORE activity prompts.

## Files

- `src/playground/types.ts` — `PLAYGROUND_PREA1_BANNED`, `PLAYGROUND_PREA1_FUNCTION_WORDS`
- `src/playground/esa/types.ts` — `GameSpec.input_only`, `PlaygroundEsaLesson.required_components`
- `src/playground/esa/gameCatalog.ts` — `input_only: true` on listen_and_choose, instruction_command, grab_and_drag_sequence, match_pairs
- `src/playground/esa/promptAddendum.ts` — Pre-A1 Cycle 4 section
- `src/playground/validators/prea1Sequence.ts` — NEW (6 hard validators)
- `src/playground/validators/activityBalance.ts` — zero MCQ cap for Pre-A1
- `src/qa/orchestrator.ts` — registers `validatePreA1Sequence`
