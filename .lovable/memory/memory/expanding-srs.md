---
name: Expanding-Interval SRS for Grammar & Abstract Concepts
description: Cycle 5 addition routing item_type=grammar_rule|abstract_concept through a doubling ladder (1→2→4→8→16→32→60 day cap) via src/lib/expandingScheduler.ts; vocab keeps existing SM-2+/FSRS path.
type: feature
---

# Expanding-Interval SRS (Cycle 5)

Code: `src/lib/expandingScheduler.ts`, integration in `src/lib/srs.ts` (`reportSrsResult`).

- Ladder: `[1, 2, 4, 8, 16, 32, 60]` days, capped at 60.
- Routing: `item_type === 'grammar_rule' || 'abstract_concept'` → `scheduleExpanding({ currentStreak, stars })`; everything else keeps the flat `NEXT_REVIEW_DAYS` map.
- Streak rules: stars≥2 advances streak; stars=1 holds streak + 1-day interval; stars=0 resets streak.
- DB: `student_mastery.srs_streak int default 0`, `srs_strategy text default 'flat'` (`flat | expanding | fsrs`).
- Locked engines under `src/memory/**` are untouched — this is a Cycle-5 wrapper only.
