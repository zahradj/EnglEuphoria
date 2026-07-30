---
name: playground-library-lesson-builder
description: >
  Build, extend, restyle, or design-audit a lesson (or a whole new unit) in
  the Playground Library's "Little Explorers Phonics" scene-based lesson
  player. Use this whenever asked to create/build/write a Playground Library
  lesson, add a new unit for the Pre-A1 phonics curriculum, fix/extend an
  existing lesson's scenes, make a lesson's visuals "identical" to a
  reference design, or invent new interactive mini-games for it. Covers the
  Scene type system, hard asset-safety rules learned from real bugs (incl. a
  container-query sizing bug that silently breaks layout — always use
  vh/vw, never cqh/cqw, in this codebase), the reference-design-matching
  workflow (extracting a live site's real DOM/CSS instead of eyeballing
  screenshots), the reusable visual-component library, 30-minute pacing
  guidance, a bank of not-yet-built game mechanics researched for future
  creativity, the Supabase scaffold-activation flow, routing, and the
  browser verification workflow.
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
- **Never use bare `cqh`/`cqw` (container-query units) for sizing or
  positioning in `SceneRenderer.tsx` — use `vh`/`vw` instead.** Confirmed,
  repeatedly, as a real bug: `cqh`/`cqw` resolve relative to the nearest
  ancestor with `container-type: size`, which in this app's actual mounted
  DOM structure does not reliably reflect the scene's real available space —
  it's been caught resolving to 0 (making a full-width tap button
  unclickable), or to roughly half the size a class name like `42cqh`
  implies. `vh`/`vw` are simple viewport-relative units with no such
  ambiguity, and this app always renders full-viewport, so they're the
  semantically correct choice anyway. If you find `cqh`/`cqw` anywhere while
  editing a scene, replace it with `vh`/`vw` on sight — don't leave it "since
  it was already there." Verify any such change by reading the element's
  real `getBoundingClientRect()` in the browser, not just by re-reading the
  CSS.
- **A `Record<CharKey, …>`-shaped lookup with a `?? fallback` default is a
  silent trap for characters introduced in later units.** `PROP_THEME`
  (character → prop-reveal theme for `sound-model` scenes) only had entries
  for `pip`/`mia` for a long time; every other character's `sound-model`
  scene fell through to `PROP_THEME[scene.prop ?? scene.who] ?? PROP_THEME.pip`
  and silently rendered *Pip's* shell icon in, e.g., a birthday-themed
  lesson starring Bella — no error, just visibly wrong. Same risk applies to
  any other per-character lookup table (`BALLOONS_SPRITE`, `BIRTHDAY_SPRITE`,
  `CHARACTER_STAGE`, `COLOR_SKETCH`, etc.). Before using a character in a
  scene kind that reads one of these maps, grep the map's definition and
  confirm that character has a real entry — don't trust the `??` fallback to
  mean "this works," it usually means "this silently degrades."

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

## 9. Matching a reference design (when asked to make a lesson "identical")

Never eyeball screenshots and guess at sizes/colors/animations from memory —
extract the reference site's actual rendered DOM and CSS and copy the real
numbers. This is far more reliable than visual comparison and was the only
thing that got scene-for-scene pixel parity right in practice.

1. Open the reference (e.g. `early-ear-learners.lovable.app/play/<N>`) in the
   Browser pane. Clear `localStorage`/`sessionStorage` and reload if it
   resumes mid-lesson from a stale session.
2. Define a reusable dump helper once per page load via `javascript_tool`
   (it's lost on every full navigation/reload, so redefine it after each
   one — SPA-internal navigation via clicking a "Next scene" button does
   *not* lose it):
   ```js
   window.dumpScene = function() {
     const root = document.querySelector('.flex-1') || document.body;
     function dump(el, depth) {
       if (depth > 8) return '';
       const rect = el.getBoundingClientRect();
       if (rect.width === 0 && rect.height === 0) return '';
       let s = '  '.repeat(depth) + `<${el.tagName.toLowerCase()} class="${(el.className||'').toString().slice(0,100)}" w=${Math.round(rect.width)} h=${Math.round(rect.height)}>`;
       const txt = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join('').slice(0,50);
       if (txt) s += ' T="' + txt + '"';
       if (el.tagName === 'IMG') s += ' SRC=' + el.src.split('/').pop();
       const style = el.getAttribute('style');
       if (style) s += ' STYLE="' + style.slice(0,150) + '"';
       s += '\n';
       for (const child of el.children) s += dump(child, depth + 1);
       return s;
     }
     return dump(root, 0);
   };
   window.clickNext = function() {
     const btn = [...document.querySelectorAll('button')].find(b => b.getAttribute('aria-label') === 'Next scene');
     if (btn) { btn.click(); return true; }
     return false;
   };
   ```
   Navigate scene-to-scene with `window.clickNext()` (the dev stepper's
   `aria-label="Next scene"` is stable across the whole app) rather than
   re-navigating by URL each time, so the helper stays defined.
3. Call `window.dumpScene()` after each `clickNext()` to see real class
   names, computed pixel sizes, and inline `style` attributes (which is
   where exact `width`/`height`/`animation`/positioning values live —
   Tailwind class names alone often don't tell you the actual number, e.g.
   `min(11vw, 74px)` only shows up in the `style` attribute).
4. **`.click()` on a raw DOM node doesn't always fire a React handler** if
   the component listens for pointer events instead of click. If a tap does
   nothing, dispatch a real sequence instead:
   ```js
   const rect = el.getBoundingClientRect();
   const x = rect.left + rect.width / 2, y = rect.top + rect.height / 2;
   ['pointerdown', 'pointerup', 'click'].forEach(type =>
     el.dispatchEvent(new PointerEvent(type, { bubbles: true, clientX: x, clientY: y, pointerId: 1 })));
   ```
5. To copy an exact `@keyframes` animation (name, timing, easing), pull it
   straight from `document.styleSheets` rather than guessing from the
   animation's visual effect:
   ```js
   const sheets = [...document.styleSheets];
   let rule = null;
   for (const sheet of sheets) {
     try { for (const r of sheet.cssRules)
       if (r.type === CSSRule.KEYFRAMES_RULE && r.name === 'theKeyframeName') rule = r.cssText; }
     catch (e) {}
   }
   ```
   Port the keyframe into `Lep1Keyframes` (`SceneRenderer.tsx`) under an
   `lep1-`-prefixed name so it doesn't collide with anything, and reference
   that name from the scene component.
6. For hand-drawn SVG props (gift boxes, cakes, balloons — anything the
   reference draws as inline SVG rather than a raster asset), just read
   `element.outerHTML` on the actual `<svg>` node and port the path data
   directly as a small local component (see §10 — several of these already
   exist, reuse before re-deriving).
7. Cross-check your own app's rendering the same way (same helper, same
   `getBoundingClientRect()` calls) — "looks right" is not verification,
   matching *measured pixel numbers* against the reference is.
8. After any batch of JSX edits, don't trust `tsc --noEmit` alone as your
   only syntax check — it has been observed to pass clean on code with a
   real unbalanced-JSX-tag error that Vite's actual SWC/Babel parser
   correctly rejects. Also load the page against a **freshly started** dev
   server and check `preview_logs` (a long-running server's log tail can
   show a *stale* error from an earlier, already-fixed edit — restart the
   server, or confirm via a fresh `get_page_text`/`read_console_messages`
   read, before concluding a real error is current).

## 10. Reusable visual components (don't reinvent these)

Small, dependency-free, already-built pieces in `SceneRenderer.tsx` worth
reaching for before hand-rolling something similar:

- **`RAINBOW_10`** — a fixed 10-color spectrum (`#ef4444` red through
  `#a855f7` purple, one hue per digit 1–10) used consistently across every
  "count to 10" surface (number tiles, balloon-pop colors) so they read as
  one system. Reuse this exact array for any new counting/ordinal activity
  rather than picking arbitrary colors.
- **`<Balloon color=".." />`** — a hand-drawn inline-SVG balloon (body +
  wavy string + glossy highlight), sized by its parent, colored via the
  `color` prop. Use for any "pop/count/hold balloons" mechanic instead of
  the 🎈 emoji or a CSS gradient circle.
- **`<PresentBox />`** — a hand-drawn wrapped gift box (pink body, cream lid
  band, ribbon, bow, big "?"), used as a tap-to-reveal mystery container.
  Reusable for any "guess what's inside" mechanic, not just age/candle
  guessing.
- **`<MiniCake candles={n} />`** — draws a birthday cake with exactly `n`
  live candles (each candle is a small positioned `<g>` — the pattern
  generalizes to "N of a repeated decorative element" for any count-based
  visual).
- **`<SpriteMascot />`** (`SpriteMascot.tsx`) — breathing/idle-bob/talk-bob/
  blink "aliveness" wrapper around a character sprite, animated via
  framer-motion (already a project dependency — match this pattern rather
  than hand-rolling raw CSS `@keyframes` for new character animation).
  **Only use it when the scene's background does *not* already paint the
  character into the art** — check the actual background JPG/PNG first (the
  `Read` tool renders images directly, use it). A large share of this app's
  full-bleed backgrounds have the character(s) merged into the painting per
  the art style guide's own rule ("never pasted as a cut-out") — layering
  `SpriteMascot` on top of one of those duplicates the character. When the
  background is character-merged, render nothing but an invisible tap
  target (+ maybe a subtle pulsing ring hint) over the painted-in figure
  instead.
- **`Lep1Keyframes`** — the single shared `<style>` block with every
  `lep1-*` keyframe used across the whole scene set. Add new animations
  here, not as a one-off inline `<style>` tag in a single scene component.

## 11. Art style contract (condensed — full guide has more detail if the user shares it again)

> **Kawaii Comic Cartoon.** Thick, warm-dark (never pure black) outlines.
> Flat-to-soft-cel shading, one soft light source top-left. Rounded, chunky
> shapes, no sharp corners. Big expressive eyes, single specular highlight.
> Warm storybook palette. Painterly-illustrated backgrounds, never
> photographic. No text/letters/numbers baked into any artwork — all
> language is rendered by the UI on top.

- **Color tokens:** Playground orange `#FE6A2F`, cream `#FEFBDD`, Mia
  purple `#B85CD1`, Bella pink `#E76FA5`, Willow blue `#4FA9E0`, Leo amber
  `#C97A2F`, foliage green `#5FA85A`→`#2F6B39`, outline brown `#2B1E17`.
- **Never generate a cast member from scratch.** If new art for an existing
  character is ever needed, it must be an edit of their existing sprite
  (same proportions/palette/face), not a fresh generation.
- **Backgrounds are full-bleed 16:9**, no frame/border/vignette, low
  horizon, calm uncluttered center (that's where UI text/prompts land).
  Characters that are part of a background scene are painted in with
  matched lighting and contact shadows — never a pasted cut-out (see §10's
  `SpriteMascot` note — this rule is *why* that check matters).
- **One emotion per sprite file**, carried by eyebrows/mouth/posture, not
  recolor. `getEmotionSprite(who, emotion)` is the correct accessor for a
  character's mood-specific art — `CAST[who].img` is always the neutral
  pose; conflating the two was a real, previously-shipped bug.

## 12. Pacing a 30-minute live 1-on-1 lesson

Live lessons run ~30 minutes with a teacher and one student. Rough scene-kind
time budget observed across the built lessons (adjust for the specific
lesson's density of new content vs. review):

- **1–2 min:** title card + cinematic intro (sets the story hook).
- **2–4 min per new letter/word taught:** `sound-model` (listen + explore
  anchor words) + `trace` (finger-trace the letter). Two new letters per
  lesson (L1–L3 pattern) ≈ 8–12 min total.
- **1–2 min per communicative-goal rep:** `meet`/`echo`/`roleplay`/
  `join-stage` — the "say this out loud" moments. Budget 3–5 of these
  across a lesson.
- **1–3 min per mini-game/review activity:** `memory`, `dash`,
  `sound-sort`, `word-build`, `bingo`, `brick-crush`, drag-match, etc. —
  these are the highest-engagement, most-flexible-length part of the
  lesson; a teacher can let a strong student breeze through or let a
  struggling one linger, so they're the natural place to absorb pacing
  slack.
- **1–2 min:** goodbye song + finale.
- **Always keep at least one clearly-optional "bonus" scene near the end**
  (this codebase's convention is `color-friends`, a free-play coloring
  activity with no gem/objective attached) as designed slack — a fast pair
  plays it for fun and lingers; a slow pair can be told by the teacher to
  skip straight to goodbye. Don't make bonus scenes load-bearing for
  completion or gem count.
- A 20–26 scene lesson at this budget lands close to 30 minutes in practice
  for a live teacher-paced session; a self-paced async run (no teacher
  narration between taps) tends to run shorter, since the empty "teacher
  talks live" beats compress. If a lesson is being built for async/self-play
  specifically, consider 3–4 more small review-game scenes to fill the gap
  the missing live narration leaves.

## 13. Game-mechanic idea bank for future creativity (researched, not yet built)

Researched from current ESL-kids-game resources and general kids'-app design
practice (2025–2026) specifically to avoid reusing the same handful of
mechanics (memory match, dash, drag-match, bingo, spin wheel, present
reveal, whack-a-friend) lesson after lesson. None of these have a `Scene`
kind yet — pick one when a lesson calls for fresh energy, design its data
shape following §2's pattern, and add a render function in
`SceneRenderer.tsx`.

- **TPR command scene ("Simon Says")** — the teacher/character calls a
  physical command ("touch your nose", "hop like a bunny", "point to
  something blue") over voice; the student performs it on camera; a
  `join-stage`-style tap-to-confirm advances the round. Sourced from Total
  Physical Response teaching method — reported as especially effective in
  1-on-1 online lessons because it turns a passive screen into a movement
  space. Natural fit for a lesson's warm-up or a mid-lesson energy reset.
  ([novakidschool.com](https://www.novakidschool.com/blog/importance-of-tpr-online-english-lessons/), [etateach.com](https://etateach.com/total-physical-response-activities.html))
- **Scavenger hunt inside a full-bleed scene** — "Find something blue" /
  "find the [target vocab word]" spoken aloud, several candidate objects
  already painted into one busy background image, student taps the right
  one. Differs from `who-said-it`'s character-recognition pattern by
  hunting for *objects/vocab* in the scene art itself, not characters.
  ([goabroad.com](https://www.goabroad.com/articles/teach-abroad/how-to-use-tpr-online))
- **Chant-along** — a short 4–8 line rhythmic chant (not a full song) tied
  to the lesson's target vocab, with a simple repeated gesture per line,
  looped 2–3×. Sits between `song` (too long/produced) and `roleplay`
  (no rhythm) — good for cementing a vocab set right after it's introduced.
- **Mystery-box reveal, generalized** — `PresentBox` (§10) already proves
  the mechanic (tap a container → it opens → multiple-choice reveal). Reuse
  the *pattern* (not literally a present) for other "what's inside"
  moments: a treasure chest, a picnic basket, a backpack — themed per
  lesson rather than always birthday-specific. **Built**: the `trophy-chest`
  `Scene` kind (`TrophyChestScene` + `TrophyChestArt` in `SceneRenderer.tsx`,
  used by Lesson 6's `l6-trophy-chest`) is this pattern applied to a
  treasure chest — tap the letter matching the spoken word, the lid pops
  open (CSS `transform: rotate()` on an SVG `<g>` with
  `transformBox: 'fill-box'`), item art bursts up with `lep1-pop`, gold
  `✨` sparkles ring outward with `lep1-pop-fade`. Copy this file's shape
  for the next "themed container" reveal instead of re-deriving it.
- **Sequencing/ordering game** — e.g. "help Bella bake a cake: tap the
  ingredients in the right order" (mix → pour → bake → decorate), teaching
  ordinal/sequence vocabulary ("first", "then", "next", "last") through a
  simple step-by-step tap sequence with visual/audio feedback per step.
  Distinct from `alphabet-order` (which drags letters, not story steps).
- **Sticker-book progress reward** — a persistent visual collectible (one
  sticker per completed activity, distinct from the gem/heart HUD) that
  accumulates into a mini "sticker book" shown at the lesson's `finale`.
  Adds a second, lower-stakes reward loop for kids who complete every
  activity, without changing scoring/gem logic.
- **Paint-and-match** — extend `color-friends`'s free coloring into a
  light objective: color the item matching a spoken word/color name, not
  just free-paint. Cited as outperforming flashcards for color-name
  retention in one classroom example. ([nipsapp.com](https://nipsapp.com/top-10-kids-learning-games-2025/))

When inventing a genuinely new mechanic beyond this list, check
`.agents/skills/esl-game-studio/` first — it documents a broader (if
differently-wired) game-design framework and a roster of "archetype"
ideas that may already cover the concept.

## 14. Tools that would materially improve this skill

The single biggest capability gap hit repeatedly this session: **there is
no image-generation tool available by default**, so most visual fixes had
to reuse an existing downloaded asset or a hand-authored inline SVG (§3,
§10) — workable for icons/props, but a real ceiling on building a *new*
lesson topic that needs new full-bleed background scenes or new character
emotion/pose variants matching the established Kawaii Comic Cartoon style
(§11). If an image-generation tool/skill becomes available (ideally one
that supports image-to-image edits against an existing reference sprite,
per §11's "never generate from scratch" rule, not just fresh
text-to-image), it should be usable directly against the "Prompt template"
already documented in the user's `little-explorers-art-style-guide.md`
(§6 of that doc). Two smaller, lower-priority gaps also worth flagging: a
way to preview generated TTS audio's actual duration/pacing without a full
round-trip through the live `elevenlabs-tts` edge function (would speed up
voice-pipeline tuning), and a packaged version of §9's DOM-diffing helper
as a proper reusable tool rather than re-pasting the snippet into
`javascript_tool` each time.

**Setting up image generation via Gemini CLI's `nanobanana` extension**
(discovered/installed 2026-07-30, tied to a real user request — see
`[[feedback_codify_learnings_as_skills]]` memory): `.agents/skills/nano-banana/SKILL.md`
already documents *how to call* the tool once installed, but installation
in this sandboxed, non-interactive shell needs a workaround:
1. `npm install -g @google/gemini-cli` (works fine, no special flags).
2. The documented `gemini extensions install <url>` command is a full-screen
   interactive TUI (Ink-based) — it **crashes** (`Assertion failed:
   !(handle->flags & UV_HANDLE_CLOSING)`) if you pipe stdin into it, and the
   one flag that skips the prompt (`--consent`) gets blocked by the Claude
   Code auto-mode permission classifier as a "skips a security
   confirmation" action — expect to ask the user for one-time approval to
   run it, or do the manual install below instead.
3. **Manual install (no interactive prompt, no special permission needed):**
   `git clone --depth 1 https://github.com/gemini-cli-extensions/nanobanana ~/.gemini/extensions/nanobanana`,
   then `cd` into that repo's `mcp-server/` and run `npm install && npm run
   build` (compiles the TypeScript MCP server to `dist/`). `gemini
   extensions list` then correctly reports it installed — the CLI discovers
   extensions by scanning `~/.gemini/extensions/*` for a valid
   `gemini-extension.json`, it doesn't require having gone through its own
   installer.
4. **Two separate env vars are needed**, both as the *same* key value:
   `GEMINI_API_KEY` (for the CLI's own model calls, e.g. its natural-language
   command router) and `NANOBANANA_API_KEY` (the extension's own setting,
   per its `gemini-extension.json`). Since this Bash tool's shell state does
   **not** persist between calls, pass both inline on every invocation
   rather than `export`-ing them: `GEMINI_API_KEY=... NANOBANANA_API_KEY=... gemini --yolo --skip-trust "/generate '...'"`.
5. `--skip-trust` (or `GEMINI_CLI_TRUST_WORKSPACE=true`) is required —
   headless/CI environments fail the interactive "trust this folder" check
   otherwise.
6. **A 429 `RESOURCE_EXHAUSTED` / "prepayment credits are depleted" error
   means the API key's Google Cloud/AI Studio project has no billing
   enabled** — this is a billing-account problem, not a code/setup problem;
   don't waste time re-checking the install if you see this specific error.
   Billing is set up at https://ai.studio/projects. Image gen via
   `gemini-2.5-flash-image` runs roughly $0.04/image once billing is live.
7. **Once billing is live, skip the `gemini` CLI entirely for actual asset
   generation** (confirmed 2026-07-30) — the CLI's own agentic wrapper
   around the MCP tool call is unreliable (`Error: MCP tool 'generate_image'
   reported an error` with an empty `{}` error body, even when the
   underlying call is fine) and its `-d`/debug output is a multi-MB,
   self-referential mess (the agent re-reads its own log file). The
   underlying `@google/genai` SDK call and the `nanobanana` MCP server's
   stdio protocol both work perfectly when called directly — set up a
   throwaway scratch npm project (`npm init -y && npm install @google/genai
   sharp`) and call `ai.models.generateContent({ model:
   'gemini-3.1-flash-image-preview', contents: [{ role: 'user', parts: [{
   text: prompt }] }] })` yourself; the image comes back as base64 in
   `response.candidates[0].content.parts[].inlineData.data`.
8. **The model always returns opaque JPEG, never a real alpha-channel
   PNG**, regardless of prompt wording ("transparent background", "PNG
   with alpha" — tried, ignored). Every item icon in this project
   (`public/lep1/items/*.png`) needs true RGBA transparency, so:
   - Ask for the subject **on a solid flat magenta background (`#FF00FF`,
     say so explicitly in the prompt)** — a color unlikely to appear in
     the subject itself.
   - JPEG compression shifts that nominal color slightly (observed
     `(254,68,251)` instead of `(255,0,255)`) and non-uniformly enough
     that a hardcoded key color under-transparents the edges — **sample
     the actual corner-pixel color from the generated image first**
     (average a few corner pixels), then chroma-key against *that*
     sampled color with `sharp`: `ensureAlpha()` → `.raw().toBuffer()` →
     zero the alpha channel for pixels within a color-distance threshold
     of the sampled key (with a soft falloff band for anti-aliased
     edges) → `sharp(data, {raw:{width,height,channels}}).trim().png()`.
   - **Verify transparency by checking raw pixel alpha values directly**
     (`sharp(file).raw().toBuffer()`, inspect `data[i+3]` at a background
     coordinate) or by flattening onto a *different* solid color (e.g.
     green) and re-viewing — this project's own image-preview tooling
     does not composite alpha against a checkerboard/backdrop, so a
     correctly-transparent PNG can still visually appear to have its old
     opaque background when just eyeballed; the pixel-level alpha check
     is the only reliable verification.
   - Full-bleed scene backgrounds (`public/lep1/scenes/*.jpg`) need none
     of this — they're plain rectangular JPEGs used as CSS
     `background-image`, so generate those directly with no chroma-key
     step (see the Lesson 6 trophy-trail/trophy-podium backgrounds for a
     worked example of matching the established painterly style with a
     plain background-only prompt, no characters baked in per §11's "never
     generate a cast member from scratch" rule).

## 15. The canonical curriculum map (source of truth for scope + objectives)

Fetched 2026-07-30 from the reference site's own `/curriculum` page —
**use `https://early-ear-learners.lovable.app/curriculum`, not the
`preview--early-ear-learners.lovable.app` subdomain**, which redirects to a
Lovable.dev login wall and is not publicly viewable. This page is the
authoritative spec for what the full course covers: **10 units, 70 lessons
total (7 lessons/unit — 6 content lessons + 1 "boss test"/extra-practice
lesson), ages 4–6, Pre-A1.** As of the fetch date only Unit 1 (6/7 lessons)
is marked `LIVE` there; everything else is `DRAFT`/`Ready` — i.e. the
reference project itself hasn't built most of this yet either, so treat
units 2–10 below as **target specs to build toward**, not proof a reference
implementation exists to DOM-diff against (§9's diffing workflow only
applies to already-`LIVE` reference pages).

**Correction to a prior session's assumption:** earlier context in this
project mistakenly described Unit 1 Lesson 5 as diverging from "the
reference's actual colors lesson." That was wrong — the reference's own
U1L5 is "The Big Playground Day," a **story capstone that recycles Unit 1**,
which is exactly what this codebase's `l5-title` ("Leo's Lost Star") already
is. No divergence exists; the earlier note conflated it with Unit 2's colors
theme. Colors belong to Unit 2, not Unit 1.

**A real content bug this fetch surfaced (fixed 2026-07-30):** `u2l1-*`
scenes in `scenes.ts` were teaching **B/T** phonics — Unit 1 Lesson 4's
pair — instead of the reference curriculum's **R/Y** ("Red, Blue, Yellow!"
— identify and name basic colors), duplicating already-taught content
instead of progressing the letter sequence. Fixed by re-authoring every
`u2l1-*` phonics scene (`model`/`trace`/`echo`/`basket`/`sort-sound`/
`word-build`/`dash`/`memory`/`who-said-it`/`roleplay`/`alphabet-blocks`) to
R/Y vocab: Rain/Rainbow/Rose for R, Yoyo/Yarn/Yak for Y — generated fresh
item art for all six via the image-gen workflow in §14 (item-rain.png,
item-rainbow.png, item-rose.png, item-yoyo.png, item-yarn.png,
item-yak.png). The old item-ball/bear/butterfly/triangle/turtle/tree SVG
consts were removed from scenes.ts (files left on disk, unreferenced —
harmless). Worth knowing for the *next* letter-pair swap like this: when a
lesson's `alphabet-blocks` scene spells short words using both target
letters (the original used BAT/TUB for B+T), look for real short English
words containing both new letters rather than forcing it — RYE and TRY
both naturally contain R+Y.

### Full map (unit → theme → lessons: title — objective [phonics/skill tag])

- **Unit 1 — "Hello, Friend!"** 👋 (Greetings, Names, Feelings, Ages,
  Goodbye) — `LIVE`, 6/7 built
  1. Hello! My name is ___ — Greet a friend and share your name. `H` `M`
  2. What's your name? — Ask and answer name questions. `N` `W`
  3. How are you? — Talk about feelings + he/she. `Æ` `S`
  4. How old are you? Goodbye! — Say your age. Say goodbye. `B` `T`
  5. The Big Playground Day — Story capstone: recycle Unit 1. `ALL`
  6. Review with Pip — Review greetings, names, feelings, ages, and
     phonics M/H/B/T with all Unit 1 friends. `M` `H` `B` `T`
  7. Extra Practice — Remedial recycle. `ALL` (`Draft` even on reference)
- **Unit 2 — "Colors & Shapes"** 🎨 (Rainbow world — see and name) — `DRAFT`
  1. Red, Blue, Yellow! — Identify and name basic colors. `R` `Y`
  2. Green, Orange, Purple! — Name secondary colors. `G` `P`
  3. Circle, Square, Triangle! — Recognize and name basic shapes. `C` `SQ`
  4. What Color is This? — Ask and answer about colors and shapes. `WH`
  5. The Rainbow Fish's Scales — Colors and shapes in a story. `SH`
  6. Color & Shape Hunt — Extra practice. `review`
  7. Color & Shape Master — Boss test. `review`
- **Unit 3 — "Numbers 1–10 & Counting"** 🔢 (Count with friends) — `DRAFT`
  1. One, Two, Three! — Count 1–3. `O` `TH`
  2. Four, Five, Six! — Count 4–6. `F` `S`
  3. Seven, Eight, Nine, Ten! — Count 7–10. `EI` `N`
  4. How Many? — Ask and answer 'How many?'. `H`
  5. Ten Little Monkeys — Count along with a story. `M`
  6. Number Bingo — Extra practice. `review`
  7. Counting Challenge — Boss test. `review`
- **Unit 4 — "My Body & Face"** 🧍 (Head to toe) — `DRAFT`
  1. Head, Shoulders, Knees, Toes! — Name body parts. `H` `K`
  2. Eyes, Ears, Mouth, Nose! — Name face parts. `E` `N`
  3. Hands, Fingers, Feet, Arms! — More body parts. `F` `A`
  4. My Big Body — Describe your body simply. `B`
  5. From Head to Toe — Story: animals moving body parts. `T`
  6. Simon Says Body Parts — Extra practice. `review`
  7. Body & Face Challenge — Boss test. `review`
- **Unit 5 — "My Family"** 👨‍👩‍👧 (Mommy, Daddy, and me) — `DRAFT`
  1. Mommy, Daddy, Me! — Name immediate family. `M` `D`
  2. Brother, Sister, Baby! — Name siblings. `BR` `S`
  3. Grandma & Grandpa — Identify grandparents. `G`
  4. My Family Tree — Introduce family with 'This is...'. `TH`
  5. Just Me and My Dad — Story: family activities. `D`
  6. Family Match-Up — Extra practice. `review`
  7. Family Fun — Boss test. `review`
- **Unit 6 — "Toys & Playtime"** 🧸 (Play, share, imagine) — `DRAFT`
  1. Ball, Car, Doll! — Name common toys. `B` `C`
  2. Teddy Bear, Blocks, Train! — Name more toys. `T` `BL`
  3. What Do You Like to Play? — Understand toy preference questions. `L`
  4. My Favorite Toy — State favorite toy and a reason. `F`
  5. Where's My Teddy Bear? — Story: looking for a lost toy. `W`
  6. Toy Sorting Game — Extra practice. `review`
  7. Playtime Challenge — Boss test. `review`
- **Unit 7 — "Pets & Farm Animals"** 🐄 (Furry, feathered friends) — `DRAFT`
  1. Dog, Cat, Bird! — Name common pets. `D` `C`
  2. Cow, Pig, Sheep! — Name farm animals. `C` `P`
  3. Horse, Chicken, Duck! — More farm animals. `H` `CH`
  4. What Animal is This? — Ask and answer about animals. `WH`
  5. Old MacDonald Had a Farm — Animals + sounds in a song. `M`
  6. Animal Sounds Game — Extra practice. `review`
  7. Animal Kingdom — Boss test. `review`
- **Unit 8 — "Food & Drink"** 🍎 (I like / I don't like) — `DRAFT`
  1. Apple, Banana, Milk! — Name common food & drink. `A` `B`
  2. Bread, Water, Juice! — More food & drink. `BR` `J`
  3. Pizza, Cake, Ice Cream! — Popular treats. `P` `K`
  4. I Like Apples! — Express likes and dislikes. `L`
  5. The Very Hungry Caterpillar — Story: many foods. `H`
  6. Food Preference Chart — Extra practice. `review`
  7. Yummy Food — Boss test. `review`
- **Unit 9 — "Clothes"** 👕 (What are you wearing?) — `DRAFT`
  1. Shirt, Pants, Dress! — Name clothing items. `SH` `P`
  2. Shoes, Hat, Socks! — More clothing items. `SH` `H`
  3. Coat, Skirt, T-shirt! — More clothing items. `C` `T`
  4. What Are You Wearing? — Ask & answer about clothing. `WH`
  5. Pete the Cat: I Love My White Shoes — Colors + clothes in a story. `W`
  6. Dress Up Game — Extra practice. `review`
  7. Fashion Show — Boss test. `review`
- **Unit 10 — "Action Verbs"** 🏃 (Run, Jump, Swim) — `DRAFT`
  1. Run, Jump, Walk! — Basic actions. `R` `J`
  2. Swim, Dance, Sing! — More actions. `S` `D`
  3. Clap, Play, Sleep! — More action verbs. `CL` `SL`
  4. What Can You Do? — Ask & answer 'can you...?'. `C`
  5. We're Going on a Bear Hunt — Story: act out verbs. `B`
  6. Action Charades — Extra practice. `review`
  7. Action Hero — Boss test. `review`

### How to use this map when building a new lesson

- **Objective first.** The one-line objective column above is the lesson's
  actual learning target — write it into that lesson's `title-card`
  `subtitle` (or close to it) and let every scene in the lesson serve it.
  Don't invent a different communicative goal than what's specified.
- **Respect the 6+1 pattern.** Lessons 1–3 of a unit each introduce ~2 new
  vocab/phonics items; lesson 4 adds a communicative-question wrapper
  ("What color is this?", "How many?", etc.); lesson 5 is always a *story*
  scene wrapping the unit's content; lesson 6 is a *cumulative review*
  ("Review with X" / boss-adjacent); lesson 7 is *remedial extra practice*
  (`Draft` even in the reference — lowest priority to build).
  §12/§13's pacing and creativity guidance both apply per-lesson as before.
  the letters listed per lesson are the **new** phonics pair for that
  lesson — carry every previously-taught letter forward into later
  cumulative-review lessons the way `l6-*`/`l5-*` already do for Unit 1.
- **Don't silently reuse another unit's phonics pair.** Check this map
  before assigning `letter`/`phoneme` fields on any new `sound-model` /
  `trace` / `basket` / `sound-sort` scene — the U2L1 bug above is exactly
  what happens when that check is skipped.
- **Building order:** given 63 of 70 lessons are unbuilt, always confirm
  with the user which unit/lesson to build next rather than assuming —
  the reference itself builds sequentially by unit (Unit 1 fully live
  before Unit 2 started), so Unit 2 Lessons 1–7 is the most likely next
  ask, but don't assume without confirming.
