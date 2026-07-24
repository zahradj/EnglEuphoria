---
name: playground-library-lesson-builder
description: >
  Build and activate a new lesson (or a whole new unit) in the Playground
  Library's "Little Explorers Phonics" scene-based lesson player. Use this
  whenever asked to create/build/write a Playground Library lesson, add a
  new unit for the Pre-A1 phonics curriculum, or fix/extend an existing
  lesson's scenes. Covers the Scene type system, hard asset-safety rules
  learned from real bugs, the Supabase scaffold-activation flow, routing,
  and the browser verification workflow.
---

# Playground Library Lesson Builder

Builds lessons for the "Little Explorers Phonics" curriculum (Pre-A1, kids' English) —
a scene-based interactive lesson player used inside the Playground Library.

## 1. Orient yourself first — read the plan before writing content

Never invent a lesson's topic, letters, or characters from scratch. The
curriculum plan already exists in two places that must agree:

1. **Supabase `curriculum_lessons` table** — the authoritative scaffold. Every
   lesson (built or not) has a row keyed by `created_by` (a specific
   content-creator account) with `ai_metadata` containing `hub: 'playground'`,
   `unit_number`, `unit_title`, `unit_theme`, `unit_letters`, `lesson_number`,
   `lesson_role`, and `contentFormat` (`'lep1-empty'` = scaffold placeholder,
   `'lep1-rich'` = built and live, `'scene-player'` = an alternate content
   format). Query it before doing anything else:

   ```sql
   select id, title, description, ai_metadata
   from curriculum_lessons
   where ai_metadata->>'hub' = 'playground'
     and (ai_metadata->>'unit_number')::int = <N>
   order by (ai_metadata->>'lesson_number')::int;
   ```

   The project ref to use is whatever `supabase/config.toml`'s `project_id`
   says — don't assume, there may be multiple Supabase projects on the
   account. Confirm Supabase MCP is authenticated before relying on it; if
   not, tell the user it needs `claude mcp` / `/mcp` authorization and proceed
   with code-only work in the meantime.

2. **`lesson_role` names are a fixed 6-lesson-per-unit template**, repeated
   identically across every unit in the scaffold: `Meet the Sound` (L1),
   `Sound Safari` (L2), `Sounds & Feelings` (L3), `Let's Talk!` (L4),
   `Story Time` (L5), `Trophy Quiz` (L6). Only L1–L3 introduce *new* phonics
   letters (2 letters each, matching the unit's `unit_letters` field exactly —
   do not add letters beyond what `unit_letters` lists just because a
   same-named constant elsewhere suggests more; the DB scaffold is the
   authority on unit scope, not incidental code comments). L4–L6 are
   **consolidation lessons** — conversation practice, a narrative, and a
   cumulative review/quiz — reusing the letters/vocab/characters already
   taught, never introducing new ones.

Cross-check both sources agree before writing scenes. If a DB row's
`unit_letters` looks stale relative to what's actually been built, that's
worth a quick sanity check, but the DB row is still what the Library UI reads
today — treat it as ground truth for scope, and only touch it via the
activation step in §4.

## 2. The Scene type system

Everything lives in `src/content/playground-library/unit1/` (the folder is
named after curriculum Unit 1, but nothing in it is Unit-1-specific in
principle — see §6 for what actually needs duplicating for a new unit):

- **`scenes.ts`** — the `Scene` discriminated union (one variant per `kind`),
  `CAST` (character roster: name/img/emoji/color), background image consts,
  item image consts, and one `LESSON_N_SCENES: Scene[]` array per lesson plus
  `LESSON_N_TITLE`/`LESSON_N_OBJECTIVE` exports.
- **`SceneRenderer.tsx`** — one render function per `kind` (`~20` scene kinds:
  `title-card`, `cinematic`, `meet`, `sound-model`, `echo`, `basket`, `trace`,
  `sound-sort`, `word-build`, `who-said-it`, `gather`, `memory`, `dash`,
  `feelings`, `puzzle`, `roleplay`, `join-stage`, `hello-doors`,
  `color-friends`, `alphabet-blocks`, `alphabet-order`, `song`, `finale`,
  `name-gate`, `meet-group`, `voice-stage`, `sound-pop`, `brick-crush`,
  `friend-pop`). Read the type definitions at the top of `scenes.ts` for each
  kind's exact required/optional fields before writing scene data — don't
  guess a shape.
- **`audio.ts`, `sfx.ts`, `fx.tsx`, `masteryTracker.ts`** — TTS/audio cueing,
  sound effects, confetti, and a localStorage mastery tracker. Rarely need
  edits for a new lesson.

A typical lesson is 20–26 scenes: title-card → cinematic intro → meet new
character(s) if any → per-new-letter block (sound-model, trace, echo) →
communicative-goal practice → cumulative sound-sort review → word-build →
who-said-it → memory → dash → puzzle → roleplay → join-stage →
friend-pop/hello-doors → color-friends bonus → alphabet-blocks →
alphabet-order → goodbye song → finale. Read `LESSON_1_SCENES` and
`LESSON_2_SCENES` end to end before writing a new one — they're the style
guide.

## 3. Asset-safety rules (learned from real bugs — follow exactly)

**Always `grep`/`find` `public/lep1/` for an asset before referencing its
path.** Never invent an image path on the assumption it exists — a missing
file is a silent broken-image icon in the middle of a kids' lesson.

- **`sound-model`'s opened-anchor image is NOT emoji-safe.** In
  `SceneRenderer.tsx`, the opened state renders `<img src={a.img}>`
  unconditionally — no emoji fallback. Only give a letter a `sound-model`
  scene if every one of its `anchors` has a real image file. If real art
  doesn't exist for a new letter's vocab, skip `sound-model` for that letter
  and teach it via `echo` + `trace` instead (both are asset-light: `echo`
  only needs the speaking character's own sprite, which always exists in
  `CAST`; `trace` only needs text + a letter).
- **`basket`, `sound-sort`, `word-build`, `memory`, `dash` items ARE
  emoji-safe** — each renders `item.img ? <img/> : <span>{emoji}</span>`.
  Emoji-only items are always safe to ship here. Prefer a small hand-authored
  SVG over bare emoji when it's easy (see below), but don't block on it.
- **`trace` requires a `TRACE_SEGMENTS` entry for the letter** (a small
  private map inside `TraceScene` in `SceneRenderer.tsx`, keyed by uppercase
  letter, each a list of `{from, to}` line segments in a 600×600 viewBox).
  Missing letters **silently fall back to tracing an "H" shape** while
  speaking the correct letter name — no error, just wrong. Check this map
  before using a new letter in a `trace` scene; add real segments if missing
  (2–4 straight segments is enough for a blocky version of most capital
  letters — good enough for a finger-tracing minigame).
- **No image-generation tool is available in this environment.** When a
  vocabulary word has no existing asset and needs a real image (not just
  emoji), hand-author a small flat-style SVG (~150–250 byte paths, thick
  strokes, flat fills, square viewBox) and save it under
  `public/lep1/items/item-<word>.svg`. Reference it exactly like the existing
  `.png` items — the renderer doesn't care about the extension.
- **Check `CAST` for already-defined-but-unused characters before "creating"
  a new one.** A character can have full sprite/color/emoji data sitting
  unused in `CAST` for lessons that haven't been built yet (this is how a
  new character for a later lesson gets introduced — the assets are
  pre-ported ahead of the content). Grep every `CAST` key against every
  `LESSON_N_SCENES` array to see who's still unused before assuming a new
  character needs new assets.

## 4. Activating a built lesson (Supabase)

The Playground Library listing page (`PlaygroundLibraryPage.tsx`) reads
`curriculum_lessons` filtered by `created_by = <logged-in user>` and
`ai_metadata->>hub = 'playground'`. A lesson card is clickable and routes to
the real content **only** when `ai_metadata.contentFormat` is `'lep1-rich'`
or `'scene-player'` — otherwise it renders locked with "🔒 Coming Soon" and
routes into the generic authoring tool instead.

**Never insert a new row.** The scaffold row for the lesson you're building
already exists (created ahead of time, one per unit × 6 lessons). Find it and
update it in place:

```sql
UPDATE curriculum_lessons
SET title = '<LESSON_N_TITLE from scenes.ts>',
    description = '<LESSON_N_OBJECTIVE from scenes.ts>',
    ai_metadata = ai_metadata || '{"contentFormat": "lep1-rich"}'::jsonb
WHERE id = '<the placeholder row's id, found via the query in §1>'
RETURNING id, title, ai_metadata;
```

The `||` merge preserves `unit_number`, `unit_title`, `unit_theme`,
`unit_letters`, `lesson_number`, `lesson_role`, and `hub` — only
`contentFormat` (and the columns you set explicitly) change. Double-check the
`RETURNING` row before moving on.

## 5. Wiring a new lesson route

Three small, mechanical steps, mirroring the existing `PlayLesson1`/`PlayLesson2`
pattern exactly:

1. **`src/pages/playground-scene/PlayLessonN.tsx`** (new file, ~5 lines):
   ```tsx
   import { LESSON_N_SCENES } from '@/content/playground-library/unit1/scenes';
   import PlayUnitLesson from './PlayUnitLesson';

   export default function PlayLessonN() {
     return <PlayUnitLesson scenes={LESSON_N_SCENES} sessionKey="lepN-scene-idx" />;
   }
   ```
2. **`src/App.tsx`** — add a lazy import next to the existing
   `PlayLesson1`/`PlayLesson2` ones, and a `<Route path="/playground-scene/lesson-N">`
   entry right after the existing lesson routes, wrapped in the same
   `ImprovedProtectedRoute` + `Suspense` pattern.
3. Nothing else needs to change — `PlayUnitLesson` and `SceneRenderer` are
   fully generic over `scenes: Scene[]`.

## 6. Starting a new unit (e.g. Unit 2 — different theme/letters/cast)

This is more than "add more scenes" — `SceneRenderer.tsx` imports `CAST`,
`PROP_THEME`, `getEmotionSprite`, `COLOR_SKETCH`, and `comicPointForward`
directly from `./scenes` (i.e. `unit1/scenes.ts`), so it's coupled to that
one module's roster and asset paths, not just to "Unit 1" as a curriculum
concept. Two honest options, pick based on how different the new unit's
world is:

- **New unit, same characters/world** (e.g. a later lesson still starring
  Pip/Mia/Bella/Willow/Leo): keep adding to `unit1/scenes.ts` and
  `LESSON_N_SCENES` exactly like Lessons 1–3, regardless of what the DB's
  `unit_number` says. The folder name is just a module name, not a hard
  boundary.
- **New unit, new cast/world** (e.g. Unit 2 "The Rainbow Meadow" with new
  characters and a colors/shapes theme unrelated to the forest-friends
  cast): duplicate the `unit1/` folder into a new `unit2/` module (`scenes.ts`
  + a copy of `SceneRenderer.tsx` re-pointed at the new module's own `CAST`/
  assets/backgrounds, or refactor `SceneRenderer` to accept `CAST`/theme data
  as props if you want to avoid the duplication going forward — that's a
  bigger, separate refactor, don't fold it into a content-writing task
  unless asked). Either way, still follow §§1–5 for asset safety, DB
  activation, and routing — those rules aren't Unit-1-specific.

Before starting a new unit's characters, check whether the new cast's sprite
assets already exist under `public/lep1/characters/` unused (same pre-porting
pattern as §3's "unused CAST entry" tip) before assuming new art needs to be
hand-authored.

## 7. Verification workflow (always do this before calling a lesson done)

1. Start the dev server (`preview_start` with the project's `.claude/launch.json`
   entry).
2. Navigate to `/playground-scene/lesson-N?dev_bypass=true&as_role=student` —
   this query param is a real, existing dev-only auth bypass
   (`useDevBypass` hook, gated on `import.meta.env.DEV`), not a hack. It only
   works against the local dev server.
3. Click through **every scene** via the "Next scene" debug stepper button
   (bottom-right), reading `get_page_text` after each click to confirm the
   right content/character/line shows.
4. After the full run, check `read_network_requests` for the session —
   every `lep1/...` asset request must be `200 OK`. Any failed/404 request
   means a scene references a path that doesn't exist; go fix that scene's
   `img`/`bg` reference (usually a typo, or an asset you assumed existed).
5. Check `read_console_messages` (`onlyErrors: true`) — should be empty.
6. Confirm the run reaches the `finale` scene and shows "LESSON COMPLETE".
7. Only then do the DB activation step (§4) and consider the lesson done.

## 8. Content-design conventions worth keeping

- Reuse existing backgrounds thematically rather than assuming a new one is
  needed — L1 and L2 both reuse a handful of `bg-*.jpg` files across many
  different scene kinds. A "mascot-free" background variant
  (`bg-gather-empty.jpg`, used for `roleplay`/`join-stage`) exists
  specifically so those scenes' foreground character sprites don't visually
  double up with characters painted into the background art — use it (or a
  same-idea empty variant) for any scene kind that renders `CAST` sprites over
  a background that might already depict characters.
- Give the new lesson's cumulative review scenes (`sound-sort`, `word-build`)
  the full list of letters taught **so far in the unit**, not just the ones
  new to this lesson — that's what makes L3 onward "cumulative" rather than
  reintroducing scope creep.
- Keep the "communication goal" thread visible in the lesson title/objective
  and in at least the `roleplay`/`join-stage`/`feelings` scenes — every
  lesson in this curriculum is built around one clear functional-English goal
  ("Hello, my name is ___", "What is your name?", "How are you?", etc.), not
  just phonics drilling.
