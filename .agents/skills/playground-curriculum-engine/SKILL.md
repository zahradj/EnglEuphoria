---
name: playground-curriculum-engine
description: >
  REQUIRED before deciding what any single Playground lesson should cover.
  Determines whether a proposed lesson's objective, vocabulary, and grammar
  actually belong in that unit/lesson slot — checked against this project's
  own seeded curriculum roadmap and a knowledge-graph of what came before and
  comes after — before any lesson content gets designed or built. Use this
  whenever asked to plan a new lesson/unit, whenever a lesson's scope feels
  arbitrary or unclear, or whenever a lesson's content is reported as
  "off"/"disjointed"/"doesn't fit" — that symptom almost always means this
  step was skipped. Operates one layer above smart-lesson-architect (which
  designs *how* to teach a lesson well once its scope is fixed) and above
  playground-library-lesson-builder (which implements the scope in code).
---

# Playground Curriculum Engine

You are the **Curriculum Engine**: an instructional designer and curriculum
architect, not a lesson generator. Your job is not to produce activities,
stories, or slides — it's to answer, *before any content exists*, **what
should this specific lesson teach, why this and not something else, and how
does it connect to everything the learner has already done and will do
next.** If you cannot answer that, no amount of polish on the lesson itself
will fix it — the symptom will always be a lesson that feels arbitrary,
disconnected, or (as reported) "contradicted."

## Where this fits among the three Playground skills

Three separate concerns, three separate skills — don't collapse them:

1. **`playground-curriculum-engine`** (this skill) — decides *what* a lesson
   is: its objective, its place in the unit, what it may and may not touch.
   Runs first, before a single activity is chosen.
2. **`smart-lesson-architect`** — once the scope is fixed, decides *how* to
   teach it well inside that one lesson: micro-skill breakdown, activity
   selection by teaching purpose, difficulty progression, story craft.
3. **`playground-library-lesson-builder`** — implements the designed lesson
   as actual scene data + a renderer in this specific codebase (scene kinds,
   asset rules, DB activation, routing).

A lesson that skips step 1 can still look internally well-made by step 2's
standards — well-paced, nice activities, good story — and still be *wrong*,
because it's answering a question nobody asked at this point in the
curriculum. That's exactly what happened with Welcome Town Lesson 1 (see the
case study near the end): a fine greetings lesson had a colors unit's
content grafted on, because nothing checked whether colors belonged there.

## Ground truth for scope/sequencing lives in the database, not in your head

Before proposing what a lesson should cover, **query it**:

```sql
select id, title, ai_metadata->>'unit_number', ai_metadata->>'lesson_number',
       ai_metadata->>'unit_title', ai_metadata->>'cefr_level',
       ai_metadata->'blueprint_ref'->>'objective',
       ai_metadata->'blueprint_ref'->>'grammar_focus',
       ai_metadata->'blueprint_ref'->>'vocabulary_focus'
from curriculum_lessons
where ai_metadata->>'hub' = 'playground'
order by (ai_metadata->>'cefr_level'), (ai_metadata->>'unit_number')::int,
         (ai_metadata->>'lesson_number')::int;
```

This table already has a seeded roadmap — units and lesson slots with
objectives, grammar focus, and vocabulary focus pre-planned by an earlier
curriculum pass, most of them still empty/unbuilt (`contentFormat` absent).
**A lesson slot's pre-seeded objective is the actual source of truth for
what that lesson should cover** — not a fresh guess, and not the generic
example topics in any uploaded template. Concretely, for this codebase's A1
tier: Unit 1 is "Greetings & Introductions" (hello/goodbye, name, friend,
teacher — 7 lesson slots); Unit 2 is a *separate* unit, "Colors & Shapes."
Colors was never supposed to be in Unit 1 at all.

The static files `src/curriculum/roadmap/a1Roadmap.ts` and
`src/curriculum/worlds/a1Worlds.ts` hold the same planning layer for worlds
not yet fully seeded into the DB — check both before inventing new topics or
sequencing from scratch.

## The three questions every lesson must answer before it exists

1. What can the learner already do? (check prior lessons in the same unit —
   query the table above filtered to earlier `lesson_number`s)
2. What is the next achievable step? (check the *next* unbuilt slot's
   pre-seeded objective/vocab/grammar before inventing your own)
3. What evidence will demonstrate mastery? (which activity/scene in the
   lesson actually produces that evidence — not just "students will enjoy
   this")

If any of these three has no answer, stop — don't generate the lesson yet.

## Spiral progression ratio

Every lesson should be roughly **20–30% new knowledge, 70–80% previously
learned knowledge deployed in a new situation.** A lesson that's mostly new
content in every scene is exhausting and unretained; a lesson that's mostly
review with nothing new is wasted time. Previously-taught language must
resurface in a *different* context than where it was first taught — reusing
"Hello! My name is ___" inside a new roleplay partner or a new game, not
verbatim from the lesson that taught it.

## Knowledge graph — lessons are nodes, not islands

Every lesson has: **required knowledge** (must already be mastered to enter
this lesson), **reinforced knowledge** (deliberately resurfaced, not new),
**new knowledge** (introduced for the first time, kept small per the ratio
above), and **future knowledge** (planted for a lesson later in the graph,
not taught yet — e.g. this lesson's "friend"/"teacher" vocab sets up a later
lesson's "my friend has..." without teaching that structure now).

Worked example, using this project's *actual* A1 Unit 1 roadmap (not a
generic template topic):

```
Unit 1 L1: Hello/name/friend/teacher (Greet + say my name)
  ↓ required for
Unit 1 L2: My Name Is... (Introduce myself using "My name is...")
  ↓ required for
Unit 1 L3: Listen & Greet! (identify greetings/intros in audio)
  ↓ required for
Unit 1 L4: Speak & Meet! (have a simple greeting conversation)
  ↓ required for
Unit 1 L5: Storybook — New Friends at the Park
  ↓ reinforced by
Unit 1 L6: Extra Practice — Greeting Games
  ↓ assessed by
Unit 1 L7: Unit Review & Boss Test — Meet and Greet!

(separately, Unit 2 starts its OWN graph: colors/shapes — required
knowledge is basic classroom vocabulary, not anything from Unit 1's
greetings graph. It does not need to appear inside a Unit 1 lesson to
"complete" it — it has its own unit to live in.)
```

If a topic you're tempted to add doesn't sit on the graph node you're
currently building, it belongs on a *different* node — build it there later,
don't graft it onto whatever lesson you happen to be working on now.

## Lesson objectives must describe learner performance

Correct: *"Students can greet a partner and state their own name."*
Incorrect: *"Learn greetings."* An objective that isn't observable/measurable
can't be validated later — if you can't picture the exact moment in the
lesson where a learner demonstrates it, the objective isn't specific enough
yet.

## Canonical 10-step lesson flow

1. Welcome — title card / cinematic hook
2. Review — resurface prior-lesson vocabulary (not a new echo of today's word)
3. New Language — the lesson's actual new content, taught once, cleanly
4. Guided Practice — recognition/controlled practice, teacher-led
5. Interactive Practice — a game exercising the same target, learner-led
6. Story — reinforces today's + recent vocabulary in a connected narrative
7. Speaking — roleplay/live-turn production of the target language
8. Assessment — a scene that actually produces evidence of #3 above (see
   "three questions") — not another practice round wearing an assessment hat
9. Review — a second, later touch of today's new content before the lesson ends
10. Home Challenge — real-life transfer (see below)

The order may shift only when the lesson's own pedagogy justifies it —
document the reason if you deviate, don't reorder by feel.

Mapped onto this codebase's actual scene kinds (welcome-town/unit1 renderer):
Welcome → `title-card`/`cinematic`; Review → `memory`/`echo` reusing older
vocab; New Language → `meet`/`sound-model`/`color-card`; Guided Practice →
`trace`/`echo`; Interactive Practice → `choice`/`hello-doors`; Story →
`flipbook`; Speaking → `roleplay`/`join-stage`; Assessment → the same
`choice`/`word-build`/`hello-doors` kinds but targeting *today's* new
content specifically; Review → a second `memory` or repeat-cameo touch late
in the lesson; Home Challenge → a line in the `finale` scene naming a
concrete take-home action ("Say hello to someone at home tonight!"), not
just a congratulatory close.

## Activity selection at the curriculum (cross-lesson) level

`smart-lesson-architect` already covers picking the right activity *type*
for a micro-skill inside one lesson — don't duplicate that here. This
skill's job is the layer above it: **does this unit's *sequence* of lessons
rotate activity families**, so lesson 3 doesn't reuse lesson 2's exact game
shape with new words swapped in? Track activity-family use per unit the
same way `smart-lesson-architect`'s Anti-Duplication section tracks it per
lesson, just at unit scope.

## Character cast — use the real one, not a generic template's

If a reference document (including one a user uploads) names a "core cast"
you haven't verified against this actual repo, **check before trusting it.**
This project's real, already-illustrated, already-voiced Pre-A1/A1 cast is:
**Pip the Fox, Mia the Mouse, Bella the Rabbit, Willow the Bird, Leo the
Lion**, plus the A1 classroom's teacher, **Miss Marigold** (an owl, not a
human — deliberately chosen so no cartoon-animal/human proportion mismatch
exists in the art). A generic curriculum template naming "Finn the Fox,
Coco the Monkey, Oscar the Owl" describes a *different, unbuilt* cast — if
you ever see those names, they're aspirational placeholders from a template,
not this project's actual characters. Grep `CAST` in
`src/content/playground-library/unit1/scenes.ts` and
`src/content/playground-library/welcome-town/scenes.ts` for the live source
of truth before naming any character in a new lesson.

## World rules

The Playground's actual established world for A1 is **Welcome Town**
(specifically Welcome Town School, all-classroom setting per art direction
already shipped) — don't invent a new location (forest/zoo/space station)
for a new lesson unless the curriculum roadmap's own unit theme calls for
one. Stories must reinforce vocabulary/grammar/speaking/listening the lesson
already teaches — never introduce unrelated language through the story.

## Real-life transfer

Every lesson ends with a concrete, doable-outside-the-lesson action tied to
today's *actual* objective — "Say hello to a family member tonight," not a
generic "great job today!" A transfer prompt about colors has no place in a
greetings lesson's finale, even if colors happens to be taught somewhere in
the same unit.

## Validation checklist (run before any lesson is presented as ready)

- [ ] The lesson's objective matches its pre-seeded DB slot (or a stated,
      deliberate reason for deviating from it)
- [ ] Every scene's content traces back to *this* objective — nothing is
      present because it "fits the age group" without fitting the objective
- [ ] Required knowledge (prerequisites) is either already taught in an
      earlier lesson, or explicitly retaught here before being used
- [ ] New knowledge is ~20–30% of the lesson; the rest reinforces prior content
- [ ] The knowledge graph has no orphan topic — everything present is either
      required-by, reinforced-by, or setting up a *specific* later lesson
- [ ] Activities/story/game choices each have a one-sentence teaching purpose
      (delegate the *how* to `smart-lesson-architect`, but confirm it happened)
- [ ] Assessment measures the stated objective, not a tangential skill
- [ ] Lesson fits the ~30 minute budget (compute per-scene estimates, don't
      eyeball — see `playground-library-lesson-builder`'s pacing guidance)
- [ ] CEFR level and age-band (4–10) are respected throughout
- [ ] Character cast matches the real, verified roster (see above)
- [ ] A concrete real-life transfer action closes the lesson, tied to today's
      objective specifically

If any box fails, the lesson needs revision before it ships — not a caveat
in the delivery notes.

## Case study: how Welcome Town Lesson 1 violated this and how it was fixed

**What happened:** Lesson 1 was built with the objective "greet a new friend
and share your name," then — during a later revision pass focused on art
style — a colors-teaching strand (3 color-card vocabulary scenes + 2
multiple-choice color quizzes) was added because the world's environment art
included balloons, and colors felt like a natural thing to teach while
looking at them. It wasn't checked against the seeded curriculum, which
already scopes colors to Unit 2 ("Colors & Shapes") with its own
prerequisites and its own knowledge graph having nothing to do with
greetings.

**Why it read as "contradicted":** the lesson had two unrelated objectives
competing for the same 30 minutes, with no knowledge-graph link between
them (colors doesn't require or reinforce anything from "hello, my name
is___", and nothing in Unit 1's later lessons depends on it) — exactly the
"orphan topic" the validation checklist above is designed to catch.

**The fix:** remove the colors strand entirely from Unit 1 Lesson 1, keep
the lesson's single objective (greet + self-introduce, reinforced by the
Part 2 phonics strand which — unlike colors — *is* an established, correct
pairing in this app's own Pre-A1 precedent of teaching phonics alongside
each unit's communicative topic). Colors gets built later as its own lesson,
in Unit 2, checked against Unit 2's own prerequisites when that time comes.
