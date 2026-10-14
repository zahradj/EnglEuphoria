# Remembering earlier learning: recall, spacing and progression (2026-10-14)

Owner request: "remind the students about previous things, previous knowledge", "add spacing", "add progression". This is how the Academy does it. The rules live in code (`src/curriculum/academy/recall.ts`, tested in `__tests__/recall.test.ts`) so a lesson plan can read them instead of guessing.

## 1. The idea in one paragraph
A word met once is forgotten. A word met again **just before it is forgotten**, and again after longer and longer gaps, stays. So every lesson opens with **Remember?** (about ten minutes) that brings back items from earlier lessons on a fixed expanding schedule, the **Daily 10** practises the same items on calendar days, and the **Remix and Finale** lessons bring the whole Season back. The student also always sees **where they are** (progress) and **what this lesson builds on**.

## 2. The spacing schedule (what comes back, and when)
Counted in lessons that teach new language (Remix and Finale do not count as steps):

| Step | The items come back | Roughly (2 lessons a week) | Items per lesson |
|---|---|---|---|
| 1 | in the very next such lesson | 3 days | 4 |
| 2 | 2 lessons later | 1 week | 3 |
| 3 | 4 lessons later | 2 weeks | 3 |
| 4 | 8 lessons later | 4 weeks | 2 |
| 5 | 16 lessons later | 8 weeks | 2 |

Each lesson teaches up to 14 items and the five steps give 4+3+3+2+2 = 14, so **every item returns at least once**; a rotating window picks different items at each step. A Remember? holds **at most 12 items** (Pre-A1: 8) so the ten minutes stay light. Patterns (grammar) taught in a lesson return from step 2 on as one quick use each. The teacher's **error log** (up to 3 recurring errors from the last lesson) also starts the Remember?. The gaps are design choices [target], to be tuned with real student data.

**Daily 10 calendar** (days after a lesson): 1, 3, 7, 14 and 30. Example: items taught on day 10 come back on days 11, 13, 17, 24 and 40.

## 3. Review lessons
- **Remix (lesson 7):** no new language; the whole Season comes back, mixed. In a **Big Remix** (every second Season) the Season before it comes back too.
- **Finale (lesson 8):** the Release and the checkpoint cover the Season; the checkpoint reports six strands (listening, speaking, reading, writing, vocabulary, grammar) so a weak strand gets extra Daily 10 time and appears in the next Season's lessons.
- **Level check (last Season of each level):** samples items from the whole level.
- **Start of a Season:** its first lesson recalls the last lessons of the Season before, because the schedule is continuous across Seasons.

## 4. Progression the student sees
For every lesson the system can say: *builds on* (the previous lesson's goal), *unlocks* (the next one), which Seasons are finished, how many items the student already knows and how many are new today. Shown to students as the path/skill tree, and to teachers and creators in the library: every planned lesson now lists its **Remember? (spaced)** plan, e.g. "A1-S02-E3 (2 lessons ago): …".

## 5. What a lesson plan must do (added to the template)
`docs/academy-lesson-plan-template.md` step 4 now requires: the Remember? list taken from `recallPlan`, a progress line (builds on / unlocks), and the Daily 10 calendar. `academy-quality-gate` fails a plan with no Remember? list.

## 6. What is not built yet
- **Done (2026-10-14):** `src/academy-deck/recallSlides.ts` builds a Remember? hear-and-pick game from `recallPlan` (one item per earlier lesson in turn); Pre-A1 Season 2 lesson 1 uses it (`rem-recall`). Other decks still have hand-written Remember? slides; replace them with `recallRounds` when each lesson is rebuilt.
- **Done (2026-10-14):** the Daily 10 scheduler (`src/curriculum/academy/dailyTen.ts`): each item sits in a box 0-5; a right answer pushes its next practice to day 1, 3, 7, 14, 30 after the last good answer, a wrong one sends it back to tomorrow; today's pack is the ten most urgent items (fading ones first); tasks are recognise → say → use, so speaking starts early. `src/academy-deck/dailyTenDeck.ts` turns the pack into a short deck (hear-and-pick, then say-it-aloud). **Wired (2026-10-14, browser storage):** `src/academy-deck/practiceStore.ts` keeps item states, finished lessons (with the "Say it" tally) and Daily 10 days in this browser (a stand-in for the database); finishing a deck lesson adds its new items (`GenericDeckLesson`); the student page `/academy-daily-10` plays today's pack and moves items up or back. Still to do: the database table behind `practiceStore` (so progress follows the student across devices and the teacher can open `GapReportCard` for each student), a link to the page from My Lessons, and the existing Sign Me Up homework quest keeps its own fixed chests.
- Per-student scheduling (items a student finds hard return sooner) needs the diagnostics service; the plan above is the default for everyone.

## 7. When the student does not practise (owner, 2026-10-14: "each curriculum has a gap… students don't remember because of the lack of practice")
Spacing only works if the student comes back on schedule. The gap manager (`src/curriculum/academy/practiceGap.ts`) decides what the next lesson does when they do not. Why forgetting happens, and the answer for each cause:

| Cause | What the system does |
|---|---|
| Too few exposures | Each item meets 6+ encounters in the lesson and returns at gaps 1, 2, 4, 8, 16 (section 2); the Daily 10 adds days 1, 3, 7, 14, 30 |
| Only recognising, never producing | Every lesson ends in a Mission (speak or write) and the Remember? asks for production as well as recognition; the Season Release is a thing the student makes |
| A gap between lessons (holiday, missed lessons) | `decideForGap`: **refresh** (8+ days, Daily 10 under half, recall under 70 %): fewer new items (8), Remember? 15 minutes, overdue items first. **Rewind** (15+ days, 3 missed lessons, recall under 50 %): no new language, replay the last two lessons. **Restart** (31+ days): 5-minute re-check and four lessons replayed |
| No practice between lessons | The Daily 10 is small by design (10 minutes); below the weekly dose (2 lessons + 3 Daily 10 sessions, about 90 minutes) it shrinks to a 5-minute mini or rescue round, with streak freezes, never a penalty |
| A weak strand hidden by a good average | The Finale reports six strands; the weak one gets extra Daily 10 time and returns in the next Season |
| Knowledge that never meets the next topic | Each Season recycles the two before it (`recycleFrom`) and the Remember? continues across Seasons; Big Remix every second Season |

Teacher view (**built 2026-10-14**, `gapReport()` in `src/curriculum/academy/gapReport.ts` and the card `src/academy-deck/teacher/GapReportCard.tsx`; not yet placed on a teacher page because the student data is not saved anywhere yet): a gap report per student: days since the last lesson, Daily 10 rate, recall accuracy, and the mode chosen with its reasons. The thresholds are starting values [target]; tune them with real students' data.
