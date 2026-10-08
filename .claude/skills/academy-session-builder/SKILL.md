---
name: academy-session-builder
description: >
  Turn one Episode of a Season into a complete 60-minute one-on-one Live Session plan: segment-by-segment timings, teacher
  script and wait-time cues, stage content and chosen mechanics, last-time recap card, Remember? item list, Mission with
  Take 1/Take 2, Release step, Wrap, Chill-track alternative, homework and Daily-10 assignment. Use for "build the lesson",
  "write session N", "what happens in E3", or when generating any Academy lesson content. Needs a SeasonSpec first.
---

# Academy Session Builder — one Episode -> one great hour

Prerequisites: `academy-season-system` (rules), a `SeasonSpec`/`EpisodeSpec` from `academy-roadmap-architect`, the student profile from
`academy-learner-diagnostics` (use defaults if new), mechanics from `academy-activity-selector`.
**Sequencing law (learned the hard way):** never ask the student to find, say or write language not yet introduced. Check every slide.

## Run of show (fixed order; mechanics rotate)

| Min | Segment | Technique (science doc) | Teacher does | Student does |
|---|---|---|---|---|
| 0-5 | **Check-in** (flex) | rapport, low-anxiety spontaneous speech | reads energy dial; 3 quick-fire questions from the student's world; adapts plan | picks energy emoji; answers 3 questions |
| 5-12 | **Remember?** (core) | retrieval + spacing + feedback | shows **Last-Time card**; runs due items production-first | recalls, types/says; sees retention score vs own past |
| 12-22 | **The Drop** (core) | comprehensible input, interest, surprise | releases the clue/message/clip; pre-teaches nothing the gist needs | picks 1 of 2 skins; reads/listens; gist check |
| 22-32 | **Notice & Build** (core) | noticing, explicit rule check, deliberate vocab | Socratic prompts; <= 3-line rule after discovery | finds the pattern / meets words; 2 different controlled mechanics |
| 32-36 | **Energiser** (flex) | attention reset, enjoyment | plays along | quick game; zero stakes |
| 36-48 | **Mission** (core) | pushed output, interaction, planning, task repetition | sets dial; 60-s planning (opt.); logs errors silently; feedback ladder; Take 2 constraint | Take 1 -> feedback -> Take 2 |
| 48-55 | **Release** (core) | generation, ownership, portfolio | coaches; never edits for them | records privately, listens back, sends/retries |
| 55-60 | **Wrap** (core) | metacognition, self-regulation | can-do ticks; "Best Line of the Session"; assigns homework + Daily 10 | rates can-dos; picks next skin; enjoyment emoji |

Core 51 min is never skipped (Check-in 5 and Energiser 4 are the flex). If the energy dial is low: swap Mission for the **Chill track** (same language, lower-pressure game).

## Per-episode content

| Ep | Drop (input) | Notice & Build | Mission | Release step |
|---|---|---|---|---|
| E1 Cold Open | story beat / voice message / clip, <= ~80 words at A1; tappable words; gist T/F | meet 5-8 words in context; prediction | predict & share opinion (1-2 sentences) | one-sentence reaction |
| E2 Word Lab | picture-word reveal of Season items | deliberate vocab: meaning -> sound/stress -> recycle -> combine; HVPT minimal pairs | describe-and-draw / info-gap using the words | voice note: "my words" |
| E3 Pattern Lab | 3-4 example sentences from E1 | find pattern -> <= 3-line rule -> controlled practice -> builder | sentence-build duel / guided Q&A | write 3-5 own sentences |
| E4 On Air | model dialogue (listen twice) | phrase ladder: chunks, polite forms, stress | role-play with a cast situation (teacher = awkward customer/friend) | record the dialogue |
| E5 Deep Dive | longer graded text/clip (95-98 % known) | cloze + reading detective; collocations | summarise/discuss; debate at B1+ | short written piece + rewrite to fix |
| E6 Side Quest | student-chosen skin text; second structure if any | free choice of 2 mechanics | creative/fluency task of their choice | mini creation |
| E7 Remix | boss briefing | mixed retrieval grid (earlier Seasons) | boss round (Push optional) | recap clip |
| E8 Finale | finale briefing | checkpoint warm-up | peer-style task Take 1 + Take 2 | **the Season Release** + checkpoint |

Level scaling: A1 teacher talk <= 40 %, scaffolds full; B1 task-first; C1 seminar/pitch, authentic text, mediation, register work (see season-system).

## Required parts of every session plan

00. **Cast:** use only the Academy cast from the vault (`src/curriculum/academy/cast.ts`; blueprint field `cast`). Vee is the mentor voice (Remember? card, clue hand-over, Wrap: mistakes are normal); the Season lead and one helper student play the parts the blueprint gives them, following their vault traits (Ava asks, Theo listens, Mia = peer, traits to be defined). No invented characters.

0. **Progressive stack (owner rule):** this lesson = ALL earlier lessons of the unit + its new items (`buildsOn` in the lesson blueprint). The Remember? list, the Notice & Build practice, the Mission and the Release must each reuse language from lessons 1..n-1 of the unit, not only the previous lesson. Texts for the Drop use >= 95 % words already met (earlier lessons, recycled Seasons) or glossed.

1. **Last-Time card** (30-60 s): 3 bullet "what we did" (from the previous SessionPlan), 1 sentence the student produced ("Best Line"), 1 thing to remember today. Generated, never typed ad hoc.
2. **Remember? list**: item ids from the SRS due list (calendar days), mistakes from the Mistake Bank first, 8-12 items, >= 60 % production.
3. **Input**: spec (kind, words, CEFR, known-word %), glosses, audio file ids (recorded voices only), comprehension check.
4. **Notice & Build**: exact examples, the <= 3-line rule text, 2 mechanics (from selector) + reasons.
5. **Mission**: scenario, roles, success criteria in student words, dial variants (Chill/Normal/Push), planning time, Take 2 constraint, error-log categories.
6. **Release**: product spec, rubric id, private-first flow.
7. **Wrap**: can-dos to tick (<= 4), homework, Daily-10 pack id, next-session teaser (the next clue).
8. **Fun ingredients (>= 5)** named explicitly; **comfort levers** named explicitly; **science techniques** named per segment.
9. **Chill track** alternative for Mission and a **Plan B** if tech fails (conversation-only version).
10. **Teacher notes**: wait-time cues, likely errors with prompt wording, what to log, things not to do.

## Output schema

```ts
type SessionPlan = {
  id: string; seasonId: string; episode: number; minutes: 60;
  lastTimeCard: { did: string[]; bestLine?: string; remember: string };
  segments: { name: string; core: boolean; minutes: number; technique: string; mechanic?: string; why?: string;
              teacher: string[]; student: string[]; stage: unknown; comfort: string[]; fun?: string[] }[];
  mission: { dial: Record<'chill'|'normal'|'push', string>; planningSeconds?: number; take2: string; criteria: string[] };
  release: { spec: string; rubricId: string };
  wrap: { canDo: string[]; homework: string[]; dailyTenPackId: string; nextClue: string };
  chillTrack: string; planB: string; errorLogCategories: string[];
};
```

## Teacher script rules

Speak less (targets by level in season-system). Ask, don't tell: prompt -> clue -> direct fix. Wait 5-7 s. Correct after fluency tasks, not mid-sentence.
End every error on a success. Praise process ("good repair") not talent. Never compare with other students. Always offer type-instead-of-speak.

## Don't

Invent new characters or art styles; use browser TTS; add vocabulary beyond the Season list (log it as passive gloss instead); schedule a game without a language purpose;
put two same-kind mechanics back to back; skip Remember?.
