---
name: generate-lesson
description: SLA/CEFR-grounded methodology for generating a new lesson in any Engleuphoria hub (Playground ages 4-9, Academy ages 10-17, Success ages 18+). Triggers on "/generate-lesson <hub> <cefr_level> <theme> <lesson_number>", "create the next lesson", "build unit N lesson N", or any request to design/author new curriculum content. Adapted from a user-authored SLA spec (generate-lesson-skill.md, 2026-08-12) — grounded against this repo's REAL schemas, not an invented one; see "Where this departs from the original spec" below before trusting any JSON shape or lesson count from that source doc again.
---

# Generate Lesson — SLA-grounded lesson authoring

Encodes the SLA (Second Language Acquisition) and CEFR principles from a user-provided spec, rebased onto what this codebase actually runs. The original spec proposed its own `ActivityNode` JSON contract and a 7-lesson unit runway — neither exists anywhere in this repo. Follow this file's schema/structure sections, not the original doc's, when actually writing code.

## 1. Which real system you're generating for

| Hub | Ages | CEFR | Real content system |
|---|---|---|---|
| Playground | 4-9 | Pre-A1 → A2 | `Scene[]` in `src/content/playground-library/unit1/scenes.ts` + `SceneRenderer.tsx`, ~50 richly-interactive `kind`s (not a generic 8-type `ActivityNode` schema) |
| Academy | 10-17 | A1 → B2 | `generate-ppp-slides` edge function → `GeneratedSlide[]` deck, persisted to `curriculum_lessons` |
| Success | 18+ | B1 → C1 | Not yet built in this repo as of 2026-08-12 — no lesson has ever been authored here. Apply the principles below as design guidance when it is, but there is no existing pipeline to point at. |

Before writing a single scene, confirm which system you're actually generating into. Playground's `Scene[]` is what every "next lesson" request in this session has meant — assume Playground unless the user names Academy or Success.

**Before writing any scene content**, run `smart-lesson-architect` (breaks the objective into micro-skills and picks a purpose per activity) and then `activity-pattern-library` (grounds those purposes in this codebase's real, existing `kind` catalog per hub, enforces the no-more-than-2-consecutive-same-`kind` Variety Rule, and is where the "research trending mechanics before defaulting to a familiar shape" step lives). Skipping this is exactly how A1 Welcome Town Lesson 3 first shipped with nine near-identical `choice` scenes in a row — see that skill's case study.

## 2. SLA / CEFR boundaries by hub

These are the original spec's demographic boundaries, kept as design principles — but see §5 for where the *already-built* Playground lessons don't fully comply, and why that's a known, accepted gap rather than a bug to retroactively fix without being asked.

**Playground (Pre-A1 → A2):**
- **Silent-Period bias, not a hard gate.** Lean Lesson 1-2 of a new unit toward receptive/matching activities (`shape-model`, `color-model`, `listen-repeat-cards`, `color-spot`) before asking for open production (`join-stage`, `roleplay` with `repeat: true`). Already-built lessons (U1L1, U2L1) both introduce light production ("I like red!") inside Lesson 1 — that's the established norm for this project, not a violation to fix. Apply the *bias* going forward; don't rewrite existing lessons to enforce a hard silent period unless asked.
- **Chunk everything — but only concrete vocabulary, not the unit's own category word.** Never drill an isolated *target* word. Every `listen-repeat-cards`/`sentence-practice` card is a full sentence ("It's red!", "The apple is red!"), never a bare noun. This does NOT apply to a unit's own theme/category label showing up in a transition line ("Let's look at food!", "Toys!") — that's framing, not a vocabulary drill, and shouldn't be flagged the same way a bare "Apple!" card would be. If ever building an automated checker for this, exempt the theme category itself and only check the unit's actual concrete vocabulary items.
- **Phonics letters are theme-driven, not a fixed universal sequence.** The original spec's Jolly-Phonics-style Group 1 (`s, a, t, p`) does not match this project — Unit 1 taught H,M,N,W,A,S,B,T (driven by greeting/name vocab), Unit 2 taught R,Y then G,O,P then C (driven by color/shape vocab). Pick the new unit's letters from what its own core vocabulary actually starts with; check which letters are already taught (query prior units) so a repeated letter gets retrieval-only treatment (a phonics hint, not a full `sound-model`+`trace` pair) — see [[feedback_smart_lesson_architect_methodology]].
- **Tracing needs a straight-line prerequisite before curved letters**, if a `trace` scene is used for a brand-new curved letter (a, s, p, etc.) — not yet enforced anywhere in this codebase; treat as a nice-to-have, not a blocker.

**Academy (A1 → B2):**
- **5-minute fatigue limit.** Keep individual activity blocks short; this is already the spirit of Academy's existing vocab-round/grammar-drill structure (per `generate-ppp-slides`'s prompt — 4 vocab rounds ending in production, escalating grammar drills, per commits `0b555df5`/`5JNG8xhi7` in this repo's own history).
- **Inductive Focus-on-Form.** Prefer noticing-before-explaining for grammar (matches the "Bloom's-style escalation" requirement already added to the live Academy prompt per commit `56106de3`).
- **EMTAS-style substitution tables** for grammar practice (5-column, parallel singular/plural agreement) — a genuinely new idea not yet in the live Academy prompt. If asked to improve Academy's grammar block, this is a concrete, worth-trying addition to `generate-ppp-slides`'s prompt — propose it, don't silently assume it's already there.

**Success (18+):** No existing pipeline. If ever asked to build this hub for the first time, use the original spec's "Professional ROI theme" / PEE scaffolding / conversational-repair-chip ideas as a starting design brief, and expect to build real infrastructure, not just content.

## 3. Playground's real unit/lesson shape (6 lessons, not 7)

Every Pre-A1 unit in the `curriculum_lessons` blueprint is pre-seeded at exactly 6 lesson slots (verified across Units 1-10 this session — see [[project_pre_a1_unit3_toys_retheme]]), not the original spec's 7. The pattern that has organically emerged and is now the house convention:

1. **Lesson 1** — core vocabulary set A, isolated sentence frame, light production allowed.
2. **Lesson 2** — core vocabulary set B, same frame, occasionally a second grammar feature (e.g. plural).
3. **Lesson 3** — introduces the unit's own "twist" skill (a new sub-category, e.g. shapes after colors) AND combines it with what Lessons 1-2 taught — see the **progressive-combination rule** in [[feedback_smart_lesson_architect_methodology]]: "It's a yellow triangle," not just "It's a triangle."
4. **Lesson 4** — pure review/consolidation. Zero new vocabulary, no new art (reuse Lessons 1-3's own images/backgrounds directly), harder/combined recall (boss-difficulty versions of earlier games). Matches Harmer's "Extra Practice" / spaced-retrieval slot.
5. **Lesson 5** — the unit's story lesson. Flipbook-centric, lighter on drills, reviews the unit's vocabulary through an original narrative (never retell a copyrighted plot — use only generic, non-copyrightable premises; never invent a new speaking cast member — reuse Pip/Bella/Mia/Leo/Willow, or make any new creature a mute story prop).
6. **Lesson 6** — cumulative capstone review/hunt. Reviews everything from Lessons 1-5, including the Lesson 3 combination skill specifically (not just its two halves separately). No new art. Matches Harmer's "Review/Boss Test."

Before designing any specific lesson, query the DB stub for that exact unit/lesson slot (`curriculum_lessons` filtered on `unit_number`/`lesson_number`/`cefr_level`) — the pre-seeded title is the authoritative source for what that slot should teach. **Also query the FULL blueprint (all units, no unit filter) before renaming or retheming any unit's topic** — this session hit the same "invented a topic that duplicated a different, unchecked unit" bug twice in a row (see [[project_pre_a1_unit3_toys_retheme]]) by only checking one adjacent unit instead of the whole table.

## 4. Registration checklist (Playground) — the real "output schema"

There is no JSON contract to emit. A new Playground lesson means editing real files, in this order:

1. Write `LESSON_UxLy_SCENES`, `LESSON_UxLy_TITLE`, `LESSON_UxLy_OBJECTIVE` in `src/content/playground-library/unit1/scenes.ts`, reusing existing `Scene` `kind`s wherever possible.
2. If a new `kind` is genuinely needed, add it to the `Scene` type union AND write its render function + switch-case in `SceneRenderer.tsx` AND add it to `sceneValidator.ts`'s own separate `SCENE_KINDS` array (easy to miss — it's a second, independent list from the renderer's switch statement).
3. Add the new lesson to `sceneValidator.test.ts`'s `LESSONS` array.
4. Add a `'{unit}-{lesson}'` entry to `sceneLessonRegistry.ts`.
5. Create `src/pages/playground-scene/PlayUnit{unit}Lesson{lesson}.tsx` (thin wrapper, copy an existing one).
6. Add the lazy import + `<Route>` in `src/App.tsx`.
7. Sync the pre-seeded `curriculum_lessons` DB stub row via `execute_sql` — **UPDATE the existing stub, never INSERT a new row** (see [[project_curriculum_lessons_slot_convention]]).
8. Run `npx tsc --noEmit` and `npx vitest run src/content/playground-library/unit1/sceneValidator.test.ts` before calling it done.

## 4b. Registration checklist (Playground A1/A2 Welcome Town) — a separate system from §4

Welcome Town (`wt-rich`/`wt-a2-rich`, ages 4-9 A1/A2 tier) is a *different*
`Scene[]` module from Pre-A1's unit1 — separate type union, separate
renderer, separate registry, and **no `sceneValidator.ts` involvement at
all** (verified this session — its only test coverage is a route-resolution
check, not scene-shape validation). Don't apply §4's steps 2-3 here; they
target unit1-only files.

1. Write `LESSON_N_SCENES`, `LESSON_N_TITLE`, `LESSON_N_OBJECTIVE` in
   `src/content/playground-library/welcome-town/scenes.ts` (A1) or
   `welcome-town-a2/scenes.ts` (A2), reusing existing `kind`s per
   `activity-pattern-library`'s Welcome Town table wherever possible.
2. If a new `kind` is genuinely needed: add it to that file's own `Scene`
   type union AND add the render function + switch-case in that family's
   own `SceneRenderer.tsx`. There is no separate `SCENE_KINDS` list to keep
   in sync here (unlike unit1) — but check `PlayWelcomeTownLesson.tsx`'s
   `GEM_KINDS` set and add the new `kind` there too, or its scenes silently
   won't count toward the gem-progress total.
3. Add a `'{contentFormat}-{unit}-{lesson}'` entry (e.g. `'wt-rich-1-4'`) to
   `welcomeTownLessonRegistry.ts`'s `WELCOME_TOWN_LESSON_REGISTRY`.
4. Create `src/pages/playground-scene/PlayWelcomeTown{N}.tsx` (thin
   wrapper, copy an existing one — note the session key is per-lesson,
   e.g. `wt4-scene-idx`).
5. Add the lazy import + `<Route path="/playground-scene/welcome-town-lesson-{N}">` in `src/App.tsx`.
6. Sync the pre-seeded `curriculum_lessons` DB stub row via `execute_sql`
   (query `information_schema.columns` first if unsure of the real column
   names — they are `slot_cefr_level`/`slot_unit_number`/`slot_lesson_number`,
   not `cefr_level`/`unit_number`/`lesson_number`) — **UPDATE the existing
   stub, never INSERT** (see [[project_curriculum_lessons_slot_convention]]),
   and merge `ai_metadata.contentFormat` (`'wt-rich'` or `'wt-a2-rich'`) into
   the existing jsonb rather than overwriting the whole column.
7. Run `npx tsc --noEmit` and `npx vitest run src/services/lessonLibraryService.test.ts`.
8. Verify in-browser: `?dev_bypass=true&as_role=student` on the new route,
   then `sessionStorage.setItem('<sessionKey>', '<idx>'); location.reload();`
   to jump to specific scenes — restart the dev server if a jump silently
   lands on the wrong scene (a known Vite HMR flakiness after many edits).

## 5. Self-validation checklist (adapted from the original spec's Gates A-D)

- **Gate A (Silent-Period bias):** For a new unit's Lesson 1-2, are recognition/matching scenes sequenced *before* the first production-required scene? Not a hard fail if violated — a design smell to notice, not block on.
- **Gate B (Chunking):** Does every `listen-repeat-cards`/`sentence-practice` card carry a full sentence, never a bare word? Hard requirement — this one IS already always true in this codebase; keep it that way.
- **Gate C (Progressive combination):** If this lesson combines a skill from an earlier lesson in the same unit, does the review lesson (L4/L6) test the *combined* form, not just each half separately? See [[feedback_smart_lesson_architect_methodology]].
- **Gate D (Art discipline):** No new art in a pure-review lesson (L4, L6) — reuse existing, already-verified images. New art elsewhere must be full-bleed (no white margin, no sticker/frame look) for scene backgrounds, and transparent/no-background for vocabulary item icons — two different rules for two different asset classes; see [[feedback_lesson_background_art_quality]].

## Where this departs from the original spec (generate-lesson-skill.md)

Keep this list current if the spec or this codebase changes:
- Its `ActivityNode` TypeScript interface and `ActivityType` union describe a schema that doesn't exist anywhere in this repo. Use §4 instead.
- Its 7-lesson unit runway doesn't match the seeded 6-lesson blueprint. Use §3 instead.
- Its "zero productive nodes in Lessons 1-2" gate is stricter than this project's actual built content. Treated as a bias in §2, not a hard gate.
- Its fixed Jolly-Phonics letter-group sequence doesn't match this project's theme-driven phonics letters. See §2.
- Its `wtc_adaptive_trigger` telemetry block (gaze timeout, volume threshold, deviation px) has no equivalent system in this codebase — omitted entirely rather than faked.
