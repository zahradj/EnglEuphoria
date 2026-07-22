# Engleuphoria — Playground Hub Blueprint

> Unit 1 · **Animal Friends** · Pre-A1 / A1 / A2 · Ages 4–9
>
> Brand: Playground hub · primary `#FE6A2F` · accent `#FEFBDD` · glassmorphism cards.
> Each lesson is ~30 minutes. All copy in English.

This document is the source-of-truth blueprint for what lives in the
Playground unit, how the lessons flow, and which files implement each piece.
Read this before changing pedagogy, vocabulary, or routing.

> ## ⚠️ This blueprint is binding
>
> The **lessons, activities, structure, style, and layout** described here are
> the heart of the Playground hub — not decoration. Every change to a lesson,
> phase, sentence frame, phonic, drag/drop container, art style, color, or
> route MUST stay consistent with this document. Before editing a lesson
> file, re-read the matching section here; after editing, update the section
> so the blueprint and the code never drift apart.
>
> The non-negotiables are:
>
> 1. **Lesson structure** — each numbered lesson follows the 9–10 phase
>    template (input → quiet game → controlled output → phonics → free
>    output → spelling → chant → cool down). Never collapse phases.
> 2. **Activity variety** — every lesson must mix a silent thinking game
>    (Memory Match) and a vocal repetition activity (Chant) alongside the
>    phonic and spelling phases.
> 3. **Visual style** — Playground orange `#FE6A2F` primary, cream
>    `#FEFBDD` accent, glassmorphism cards, rounded `rounded-3xl`, large
>    tap targets (≥80px). No hardcoded color utilities — use the
>    `--playground-*` tokens in `src/styles.css`.
> 4. **Layout** — `LessonShell` + phase strip + prev/next on every lesson.
>    Drop containers always larger than the items above them. Topic-themed
>    containers (cage, net, basket, fridge).
> 5. **Tone & language** — supportive, kid-friendly, English only.
>    No "wrong!" audio; gentle shake + re-model on mistakes.
>
> Treat this blueprint as the contract. Code that contradicts it is a bug.


---

## 1. Unit map at a glance

```
Lesson 1  Pets          /playground/animals     6 pets · sentence frame "It is a ___" · phonics /c/
Lesson 2  Jungle        /playground/jungle      3 animals · "It is ___ and ___" + colors · phonics /m/
Lesson 3  Ocean         /playground/ocean       3 animals · "It is a [color] [size] [animal]" · phonics /f/
Lesson 4  Storybook     /playground/storybook   Cat & Dog's Big Day · pre-read + fill gaps + Q&A
Lesson 5  Big Review    /playground/review      All 12 animals · all 3 phonics · sentence mixer
                                                ends with self-check → Quiz OR Booster
Lesson 6  Unit Quiz     /playground/quiz        24 questions · stars · low score → Booster
Booster   Extra Practice /playground/practice   Optional safety net · loops back to Quiz
```

The home hub (`src/routes/index.tsx`) lists Lessons 1–6 as numbered cards.
The Booster is shown underneath as a separate, unnumbered card.

---

## 2. Pedagogical priorities (immutable)

These are the non-negotiable rules every lesson must respect.

1. **Reading first.** Every core lesson teaches one phonic sound — /c/, /m/, /f/.
   The Review and Quiz revisit all three. The Booster drills them again.
2. **Minimised vocabulary.** Three new animals per lesson after Lesson 1.
   Stack sentence frames, do not stack vocabulary.
3. **Rotate, never repeat.** Sentence and spelling activities must rotate
   the target word across rounds. Scrambled letters must never match the
   original word.
4. **Topic-themed containers.** Drag/drop frames match the topic
   (animals → cage/jungle, ocean → net, fruit → basket). The drop frame
   is always visually larger than the items above it.
5. **Real, cute cartoon art.** Animal illustrations must look like clean,
   rounded cartoon characters — never silhouettes.
6. **Supportive tone.** No "wrong!" audio; wrong taps shake gently and
   re-model the target. Praise effort, not accuracy.

---

## 3. Lesson-by-lesson blueprint

### Lesson 1 · Pets — `src/routes/playground.animals.tsx`

- **Target vocab (6):** cat, cow, dog, duck, pig, fish (`src/lib/lesson/animals.ts`).
- **Sentence frame:** *"It is a ___."*
- **Phonic:** /c/ — words: cat, cow, car
  (`src/components/lesson/phases/Phonics.tsx`).
- **Phases:** Vocabulary → Modeling → Build sentence → Phonics /c/ → Spell.
- **Differentiation:** 4-yr-olds can stop after Build; 7–9 yr-olds add
  "What color?" follow-up.

### Lesson 2 · Jungle — `src/routes/playground.jungle.tsx`

- **Target vocab (3 new):** monkey, snake, tiger (`src/lib/lesson/jungle.ts`).
- **Sentence frame:** *"It is a ___. It is ___ and ___."* (adds 2 colors).
- **Phonic:** /m/ — monkey, moon, mouse (config inside the route file,
  rendered via `PhonicsAnyPhase`).
- **Phases:** Vocabulary → Modeling → Describe → Phonics /m/ →
  Listen & cage → Spelling → Coloring → Cool down.

### Lesson 3 · Ocean — `src/routes/playground.ocean.tsx`

- **Target vocab (3 new):** fish, octopus, crab (`src/lib/lesson/ocean.ts`).
- **Sentence frame:** *"It is a [color] [size] [animal]."* — combines
  Lesson 1's frame + Lesson 2's colors + a new size adjective.
  Article handled by `article()` in `src/lib/lesson/ocean.ts`
  (`/^[aeiou]/i.test(word) ? "an" : "a"`).
- **Phonic:** /f/ — fish, frog, foot.
- **Phases:** Vocabulary → Modeling → Describe → Phonics /f/ →
  Build sentence → Practice → Spelling → Cool down.

### Lesson 4 · Storybook — `src/routes/playground.storybook.tsx`

- **Story:** *Cat and Dog's Big Day* — uses words from Lessons 1–3
  (`src/lib/lesson/storybook.ts`, scenes in `src/assets/story/`).
- **Workflow:**
  1. Student is assigned the story BEFORE the live lesson.
  2. In class, re-read with gaps to fill in with Lesson 1–3 vocab.
  3. Leveled comprehension Q&A (Pre-A1 / A1 / A2):
     - Pre-A1: *"What color was the cat?"*
     - A1: *"Where did they go?"*
     - A2: *"Why was the dog happy?"*
- **Phases:** Warm-up → Vocabulary refresher → Sequence the scenes →
  Comprehension Q&A → **Look & Say (A2 / B1 / B2)** → Retell → Cool down.
- **Post-reading Look & Say** (`LOOK_AND_SAY` in `src/lib/lesson/storybook.ts`):
  graphic organizer with three slots — 👤 Who · 📍 Where · ❓ What — scaled
  by CEFR level so older students get more out of the same story:
  - **A2** — one short sentence per slot. *"It is a cat and a dog."*
  - **B1** — two ideas per slot joined with *because* / *and*.
    *"They go to the jungle and they feel excited because everything is new."*
  - **B2** — 3–4 sentence retell using *first / then / finally*, cause &
    effect, and sensory description. Encourages comparison across scenes
    and a final message of the story.
  Each slot has a sentence frame + a model answer. The student types or
  speaks their answer, then taps **Show model** / **Hear model** to
  compare. Phase difficulty is selected by the teacher at the top of the
  card (A2 / B1 / B2 tabs).

### Lesson 5 · Big Review — `src/routes/playground.review.tsx`

- **Cumulative:** all 12 animals from Lessons 1–3.
- **10 phases:** Flashcards · Colours · **Phonics /c/ /m/ /f/** ·
  Memory match · Sort by home · Odd one out · Sentence mixer ·
  Sentence scramble · Spell it · Listening sprint · Cool down.
- **Branching at cool-down (self-check):**
  - 😎 *"Easy! I'm ready."* → `/playground/quiz`
  - 🤔 *"I need more practice."* → `/playground/practice`

### Lesson 6 · Unit Quiz — `src/routes/playground.quiz.tsx`

- **24 questions across 4 formats:**
  - `picture` — identify animal / habitat from image.
  - `text` — colors, articles, sentence completion, **phonics letter→sound**.
  - `audio` — hear the word, tap the image.
  - `spell` — drag letters into order (rotated each round).
- **Scoring:**
  - 3 stars when `score >= total − 1`.
  - 2 stars when `score >= total / 2`.
  - 1 star otherwise.
- **Remediation loop:** any result with < 3 stars surfaces a
  "Need more practice?" card linking to `/playground/practice`.

### Booster · Extra Practice — `src/routes/playground.practice.tsx`

- **Not a numbered lesson.** Positioned as a safety net.
- **~20 min phases:** Warm-up → Phonics /c/ /m/ /f/ → Listen & point →
  Match word → Build "It is a ___" → All done.
- **Exit CTAs:** Back to Review · Try the Quiz again.

---

## 4. Shared building blocks

| File | Purpose |
| --- | --- |
| `src/components/lesson/LessonShell.tsx` | Lesson chrome: phase strip, prev/next, finished celebration. |
| `src/components/lesson/TeacherNotes.tsx` | Collapsible teacher-only notes block. |
| `src/components/lesson/phases/Phonics.tsx` | Lesson 1's /c/ phonics phase (specific). |
| `src/components/lesson/phases/PhonicsAny.tsx` | Generic phonics phase reused by Jungle & Ocean. Accepts `letter`, `sound`, `label`, `words[]`. |
| `src/components/lesson/phases/PhonicsReview.tsx` | Cumulative /c/ /m/ /f/ round game used by Review and Booster. Exports `PHONICS_BANK`. |
| `src/lib/lesson/speech.ts` | TTS wrapper — `speak(text, { rate })`. |
| `src/lib/lesson/animals.ts` · `jungle.ts` · `ocean.ts` · `storybook.ts` | Per-lesson vocab and helpers (e.g. `article()`). |

---

## 5. User flow

```
Home (/) ──► L1 Pets ──► L2 Jungle ──► L3 Ocean ──► L4 Storybook ──► L5 Review
                                                                        │
                                                          ┌─────────────┴─────────────┐
                                                          ▼ "Easy, ready"             ▼ "I need more"
                                                       L6 Quiz                    Booster
                                                          │                           │
                                                 stars < 3 │                           ▼
                                                          └────────► Booster ───► back to L6 Quiz
```

---

## 6. Routing & state

- File-based routes under `src/routes/`. The router auto-generates
  `src/routeTree.gen.ts` — do not edit by hand.
- Every lesson persists progress to `sessionStorage` under
  `playground-<lesson>-progress` so a refresh resumes the same phase.
- All in-lesson navigation uses TanStack Router `<Link to="/playground/...">`
  with typed paths. Never interpolate URLs with template strings.

---

## 7. Future units (planned)

Colors · Food · Family. Each new unit should reuse `LessonShell`,
`PhonicsAnyPhase` and `PhonicsReviewPhase`, define its own
`<unit>.ts` vocab module, and follow the same 6-lesson + Booster shape.

---

## Lesson Length Audit (2026-06 update)

Every numbered lesson is now scoped to **30+ minutes** of student-on-task time.
Two reusable game phases were added so every lesson has both a silent thinking
game and a vocal repetition activity:

- **Memory Match** (`src/components/lesson/phases/MemoryMatch.tsx`) — flip
  picture↔word cards, ~5 min. Reusable: pass any `{name, image}[]`.
- **Chant** (`src/components/lesson/phases/Chant.tsx`) — call-and-response
  rhythmic repetition of the target sentence frame, ~3 min.

### Per-lesson phase order + budget

**Lesson 1 — Pets** (~35 min)
Vocabulary → Practice → **Memory game** → Modeling → Sentence →
Phonics /c/ → Blending → Spelling → **Chant** → Cool down

**Lesson 2 — Jungle** (~36 min)
Vocabulary → Modeling → **Memory game** → Describe → Phonics /m/ →
Listen cage → Spelling → Coloring → **Chant** → Cool down

**Lesson 3 — Ocean** (~36 min)
Vocabulary → Modeling → **Memory game** → Describe → Phonics /f/ →
Build sentence → Practice → Spelling → **Chant** → Cool down

### Authoring rule for future lessons

When designing a new unit, target **9–10 phases** following this template:
*input → quiet game → controlled output → phonics → free output → spelling →
chant → cool down*. If a phase finishes faster than its budget, the chant
and memory game extend naturally with extra rounds — they are designed to be
"as long as you need."

---

## Brain Break (topic-aware filler activities)

**Component:** `src/components/lesson/phases/BrainBreak.tsx` — a reusable
optional phase slotted between **Chant** and **Cool down** in every numbered
lesson. Designed for the last 3–8 minutes of class when there is leftover
time, or as a reward after a tough phase.

The phase is a **picker**: pass a `games` array and the student chooses one
tab. Each game must call `onSolved` the first time it is finished — that
unlocks the phase so the lesson can advance. Students may keep playing.

### Reusable game primitives (exported)

| Game              | Component            | Use for                                                  |
| ----------------- | -------------------- | -------------------------------------------------------- |
| 🧩 Picture Puzzle | `PicturePuzzle`      | Any lesson — pass the hero image.                        |
| 🐾 Grid Maze      | `GridMaze`           | Any lesson — pass `emoji` (walker) + `goal`.             |
| 👋 Tap to Catch   | `TapToCatch`         | Any lesson — pass `emojis[]`, `target`, `cta`, `background`. |
| 👨‍👩‍👧 Family Tree | `FamilyTreeBuilder`  | Family unit — drag labels onto a 3-tier tree.            |

### Topic catalog (binding)

Brain-break games MUST match the lesson topic. Pick from this catalog when
adding a new unit; add new entries as needed but keep the spirit (cute,
on-topic, no failure state, replayable).

| Unit / topic       | Hero game (puzzle/maze)             | Action game                                | Future game ideas                                                  |
| ------------------ | ----------------------------------- | ------------------------------------------ | ------------------------------------------------------------------ |
| **Pets (L1)**      | Picture Puzzle of the pet           | 🦴 Feed the pets — tap `🦴🐾🥩`            | Walk-the-dog mini-maze, "Find the kitten" hide & seek              |
| **Jungle (L2)**    | Jungle puzzle + 🐾 Jungle path maze | 🦋 Catch butterflies — tap `🦋🐛🪲`        | Vine swing rhythm tap, "Spot the tiger" camouflage game            |
| **Ocean (L3)**     | Ocean puzzle + 🐾 Reef maze         | 🐟 Catch the fish — tap `🐟🐠🦐`           | Pearl diving, "Build the coral reef" stacking game                 |
| **Storybook (L4)** | Picture puzzle of a story scene    | "Who said it?" character match            | Story dominoes, retell-with-stickers board                         |
| **Family**         | Family group puzzle photo           | 👨‍👩‍👧 Family Tree builder                  | "Draw your family" coloring, gift-the-family tap (`💝🌷🎂`)         |
| **Fruits & Veg**   | Basket puzzle (fruit/veg pile)      | 🍎 Pick from the garden — tap `🍎🥕🍓🥦`   | Make-a-soup recipe builder, market shopping cart drag-and-drop     |
| **Food**           | Plate puzzle                        | 🍕 Catch the toppings                      | Lunchbox packer drag-and-drop, restaurant order matching           |
| **Colors**         | Rainbow puzzle                      | 🎨 Tap-the-color sprint                    | Paint-the-flower coloring, mix-two-colors quiz                     |
| **Weather**        | Sky puzzle                          | ☔ Catch the raindrops                     | Dress-the-bear-for-the-weather drag, cloud-shape spotting          |
| **Numbers**        | Number-line puzzle                  | 🔢 Tap-the-number in order                 | Bubble pop counting, balloon basket counting                       |

### Authoring rule (must follow)

1. Every numbered lesson route must end with a `break` phase
   *before* `cool`, rendering `<BrainBreakPhase games={...} />`.
2. The `games` array must contain **at least 2 topic-matched games** drawn
   from the catalog above. One slot may be a generic Picture Puzzle of the
   unit's hero image (always on-topic by definition).
3. Action games (`TapToCatch`) MUST use emojis that fit the unit. Never
   reuse `🦴` outside Pets or `🐟` outside Ocean — children rely on the
   visuals as a topic cue.
4. The Coloring phase (Lesson 2's `ColoringPhase`) stays in its own slot —
   Brain Break is *additional*, not a replacement.
5. New unique games belong in `BrainBreak.tsx` as exported components, then
   plug into a lesson via the `games` array. Do not create new top-level
   lesson phases for filler games — it would break the 9–10 phase template.

---

## Phonics — visual & audit rules

The phonics phases (`PhonicsPhase`, `PhonicsAnyPhase`, `PhonicsReviewPhase`)
now render a **real bitmap illustration for every sound-word**, not a bare
emoji. Children rely on the picture as much as the audio to lock in the
letter↔sound link.

- `PhonicsWord` / `PhonicsItem.words[]` accept an optional `image` URL.
  When `image` is set it is rendered; the `emoji` is only the fallback.
- Lesson 1 (/c/) uses the existing pet/car assets in
  `src/assets/animals/` (cat, cow, car).
- Lesson 2 (/m/) uses `monkey` (animals) + `moon`, `mouse`
  (`src/assets/phonics/`).
- Lesson 3 (/f/) uses `ocean-fish` (animals) + `frog`, `foot`
  (`src/assets/phonics/`).
- The cumulative Phonics Review (`PhonicsReviewPhase`) imports the same
  asset set so every round shows a picture, not an emoji.

### Authoring rule

Any new phonic set MUST ship with three cartoon illustrations placed in
`src/assets/phonics/<word>.png` and wired through the `image` field on
each `PhonicsWord`. Never ship a phonics phase with only emoji — emoji
are a fallback for when the asset is missing, not the default.

---

## Grammar audit (June 2026)

Quick pass over the lesson copy. Findings + fixes:

| Where                              | Was                              | Now                               |
| ---------------------------------- | -------------------------------- | --------------------------------- |
| Ocean L3 chant                     | "It is an orange small fish."    | "It is a small orange fish."      |
| Ocean L3 build sentence frame      | `[color] [size] [animal]`        | `[size] [color] [animal]`         |
| Ocean L3 BuildPhase template       | `${color} ${size}`               | `${size} ${color}`                |
| Ocean L3 meta description + copy   | "an orange small fish"           | "a small orange fish"             |
| Home hub Ocean blurb               | same                             | same fix                          |

### Why

English adjective order is **opinion → size → age → shape → colour →
origin → material → purpose → noun** (OSASCOMP). For Pre-A1/A1/A2
sentences the rule the student should internalise is **size before
colour**: *a small orange fish*, *a big purple octopus*, *a small red
crab*. The indefinite article (`a` / `an`) is selected from the **first
adjective**, not the colour — handled by `article()` in
`src/lib/lesson/ocean.ts`.

The intentionally-wrong distractors inside the storybook comprehension
quiz (*"It is a red small cat."*, *"It is an orange big dog."*) are
**kept**: they are the wrong-answer options that train the student to
spot bad adjective order.

### Authoring rule

When writing any new sentence frame that stacks descriptors, follow
OSASCOMP. The default Playground frame is always **`size + colour + noun`**.
Run a grep for `It is an? [a-z]+ (small|big|tiny|huge|little) ` before
shipping a new unit to catch order regressions.

## Storybook — Signed Story (opener)

Every storybook lesson opens with a **Signed Story** phase
(`src/components/lesson/phases/SignedStory.tsx`) before any task phase.

Why it exists:
- Students meet the whole story first, end-to-end, with no questions.
- Each key word shows a **sign / gesture chip** (e.g. *cat → 🐱 paws on
  cheeks*, *big → 🙌 arms wide*) that the teacher acts out and the
  student copies. This anchors meaning visually before reading or gaps.
- An auto **"Play whole story"** button reads every page in sequence so
  the student can listen + watch + mimic without tapping.

Rules (binding):
1. The `signed` phase MUST be the **first** entry in the storybook
   `PHASES` array — before `warmup`. Never reorder.
2. Sign cues live in the `SIGNS` map inside `SignedStory.tsx`. When a
   new key word is added to `STORY_PAGES`, add a matching gesture chip.
3. The phase is **input only** — no scoring, no gates. Students can
   replay or skip freely; the lesson does not block on it.
4. Visuals reuse the same page images as `Read` / `Gaps` so the student
   sees one consistent illustration set across the whole lesson.
