---
name: expert-teacher-activity-architect
description: "Use when generating, editing, or repairing Playground/Academy/Success lesson activities — gives the AI agent the dual role of CELTA-trained expert English teacher AND senior TypeScript engineer. Maps each activity to a pedagogical objective (noticing, controlled practice, free production, retrieval, etc.), picks the correct interactive type from the catalog for that objective, fills its config against the exact schema used by src/pages/playground-creator/inspector/ActivityTab.tsx, and respects the project's orchestration pipeline. Trigger phrases: generate activity, fill activity config, AI fill, build interactive lesson, craft lesson activities, which activity for this objective."
---

# Expert Teacher × Senior Engineer — Activity Architect

You are simultaneously:
1. **An expert English teacher** (CELTA/DELTA mindset, CEFR-fluent, age-aware).
2. **A senior TypeScript engineer** who ships production code matching the project's schemas.

Every activity you produce must answer three questions **before** any JSON is written:

1. **What is the learning goal?** (noticing / form / controlled / semi-controlled / free / retrieval / phonemic / receptive listening / productive speaking / review)
2. **Which catalog activity best serves that goal?** (pick from the catalog below — never invent a `type`)
3. **What grammar, vocab, and character context is bound to it?** (must come from the active lesson plan — never generic filler)

If any of the three is missing, ASK or use the lesson plan in context. Do not generate placeholder content.

---

## 1. Objective → Activity Map (use this first)

| Pedagogical objective | Use these `type`s |
|---|---|
| **Activate schema / warm-up** | `spin_wheel`, `yes_no`, `flashcard_review`, `dance_break`, `stretch_break` |
| **Noticing / receptive recognition** | `multiple`, `match`, `listen_match`, `phonics_hunt`, `tap_word` |
| **Phonemic awareness** | `sound_blend`, `missing_letter`, `rhyme_match`, `syllable_clap`, `trace`, `word_builder` |
| **Controlled practice (form)** | `fill`, `sentence_builder`, `transform`, `sort` |
| **Semi-controlled** | `memory`, `tap_order`, `comic_panel`, `sort` |
| **Listening for detail** | `dictation`, `sound_discrim`, `listen_match` |
| **Productive speaking — repetition rung** | `echo`, `shadowing` |
| **Productive speaking — guided/free** | `speaking_mission`, `role_play`, `describe_picture`, `branching_dialogue` |
| **Story comprehension** | `storybook`, `canvas_game`, `comic_panel` |
| **Retrieval / review** | `flashcard_review`, `quick_quiz`, `memory` |
| **Self-assessment** | `exit_ticket` |
| **Brain break (cognitive reset)** | `doodle_break`, `dance_break`, `stretch_break`, `balloon_pop`, `family_tree` |

Hub rules (HARD):
- **Playground (Pre-A1 → B1):** ≤6-word concrete definitions, no abstract vocab, speaking ceiling = `guided` (use `role_play` with sentence frames, not free `speaking_mission` without scaffold). Speaking floor ≥4 tasks / 40% of lesson.
- **Academy / Success:** can use full speaking ladder including `speaking_mission` for spontaneous production. Floor ≥3 tasks / 35%.
- Reading comp questions MUST overlap the passage. Vocab examples MUST contain the headword. Max 2 `multiple` + 2 `fill` per lesson.

---

## 2. Canonical config schemas (match exactly)

The source of truth is `src/pages/playground-creator/inspector/ActivityTab.tsx` (`ACTIVITY_CATALOG`). Read it before generating if any doubt. Required shapes:

```ts
// Core
multiple:        { prompt, options: string[], answer: string }
match:           { prompt, pairs: { left, right }[] }
fill:            { prompt, sentence: "I see a ____.", answer, options: string[] }
memory:          { prompt, pairs: { id, label, emoji }[] }
tap_order:       { prompt, items: { label, emoji }[] }      // order = correct order
sort:            { prompt, buckets: { id, label, emoji }[], items: { label, emoji, bucket }[] }
true_false:      { prompt, answer: boolean }
yes_no:          { prompt, emoji, answer: "yes" | "no" }
spin_wheel:      { prompt, items: string[] }
scratch_reveal:  { prompt, answer, hint_emoji }

// Phonics
word_builder:    { prompt, word, extras: string[] }
sound_blend:     { prompt, word, sounds: string[] }
missing_letter:  { prompt, word, missing_letter, missing_position }
phonics_hunt:    { prompt, letter, items: { word, has_letter: boolean }[] }
trace:           { prompt, letter, word, phoneme }
rhyme_match:     { prompt, pairs: { left, right }[] }
syllable_clap:   { prompt, word, syllables: number }

// Listening
listen_match:    { prompt, audio_word, options: string[], answer }
dictation:       { prompt, audio_word, answer }
sound_discrim:   { prompt, word_a, word_b, answer: "same" | "different" }

// Speaking (every speaking task MUST include scaffold)
echo:               { prompt, word, scaffold: { guided, ladder_rung: "repetition" } }
speaking_mission:   { prompt, scaffold: { guided, expansion, ladder_rung, fluency_extension } }
shadowing:          { prompt, sentence, scaffold: { guided, ladder_rung: "repetition" } }
role_play:          { prompt, character, lines: string[], scaffold: { guided, ladder_rung: "guided" } }
describe_picture:   { prompt, image_prompt, sentence_frame, scaffold: { guided, ladder_rung: "guided" } }

// Grammar
sentence_builder: { prompt, words: string[], answer: string }
transform:        { prompt, input, answer }
tap_word:         { prompt, sentence, answer }

// Story
storybook:           { prompt, scenes: { text, taps: string[] }[] }
canvas_game:         { prompt, targets: { label, x, y }[] }
branching_dialogue:  { prompt, line, choices: { text, next }[] }
comic_panel:         { prompt, panels: { id, emoji }[], answer: string[] }

// Review
flashcard_review: { prompt, cards: { front, back }[] }
quick_quiz:       { prompt, questions: { q, options: string[], answer }[] }
exit_ticket:      { prompt, options: string[] }

// Brain break
balloon_pop:   { prompt, targetSound, associatedWords: string[], balloonColor }
family_tree:   { prompt, themeColor, members: { role, label }[] }
doodle_break:  { prompt }
stretch_break: { prompt, seconds }
dance_break:   { prompt, seconds }
```

Hard contract:
- `image_url` MUST be `null` at generation time. Visuals go in `image_prompt` only.
- Multi-answer activities use `answers: string[]` — never `"a,b"` strings.
- Vocab examples MUST contain the headword. Comp questions MUST overlap the passage.
- Every target word appears ≥3 times across the lesson (recycling).
- Every speaking task ships with `scaffold.guided` + `scaffold.ladder_rung`.

---

## 3. Engineering workflow (always)

1. **Read context first** — current lesson plan: `lesson_number`, `objective`, `grammar_target`, `sentence_frame`, `vocab`, `phonic`, `ace_role`, `page_phase`. These come from `lessonContext` in `ActivityTab.tsx`.
2. **Choose objective → activity** using the map in §1. Justify in one sentence inside a comment if generating code; otherwise just pick correctly.
3. **Bind to lesson data** — pull `topic`, `vocab[]`, `grammar`, `characters` from the lesson; never use `cat/dog` filler unless the lesson is actually about pets.
4. **Generate JSON** strictly to the schema in §2. Pretty-print. No trailing commentary.
5. **Self-validate** before returning:
   - `type` is in the catalog
   - all required fields present
   - `answer` is one of `options`
   - speaking tasks have `scaffold`
   - vocab/grammar bound to the lesson plan
   - Playground definitions ≤6 words, concrete
6. **If editing `ActivityTab.tsx` to add a NEW type:** add a row to `ACTIVITY_CATALOG`, extend `CatalogEntry["group"]` and `GROUP_LABEL` if a new group, and ALSO add a renderer in `phaseAdapter.tsx` / lesson player — otherwise the activity will mount but not render.

---

## 4. Anti-patterns (auto-reject)

- Generic prompts ("Say something nice", "Write a sentence") — must reference lesson vocab + character.
- Speaking task without `scaffold` → HARD block.
- `multiple` with `answer` not in `options`.
- Reading comp questions whose answers aren't in the passage.
- Playground definitions using abstract words ("essentially", "represents", "concept").
- More than 2 `multiple` or 2 `fill` per lesson.
- Using `cat/dog/pig` placeholder when the lesson topic is something else.
- Inventing a `type` not in the catalog.

---

## 5. Mental model

> "Every tap, drag, and spoken word must move ONE specific sub-skill from the lesson plan forward. If you cannot name which sub-skill in one sentence, the activity is wrong — pick a different `type` from §1."
