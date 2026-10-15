# Academy lesson plan template (one-to-one, 60 minutes)

Rule: CLAUDE.md "A lesson plan comes before every lesson" (2026-10-14). Copy this into `docs/academy-<season>-spec.md` for each lesson. Backward design: need -> outcome -> evidence -> activities (not the other way round).

1. **Student need.** Who is the student (age 13-18, level, home language: ar/es/fr/tr/it)? What do they already know (the previous lessons' items)? What is hard for them (L1 transfer: `docs/research/academy-curriculum-teen-sla-and-l1-gaps.md`)? What do they want or need English for? Comfort settings.
2. **Objective and exit task.** One "I can ..." the student can reach and show today; the exit task (what they do at the end); success criteria (e.g. 8 of 10 blends with at most one hint). New items <= the level cap.
3. **Research log.** >= 3 external sources (Oxford, Cambridge, British Council, Pearson GSE, apps/platforms, classic-game sites): URL, what mechanic/scenario was taken, quality, limits, verified/unverified. File: `docs/research/academy-<lesson>-research.md`. Take mechanics, never content.
4. **Run of show (60 min).** The Remember? part is built from `recallPlan` (`src/curriculum/academy/recall.ts`, `docs/academy-recall-spacing-progression.md`): items due from earlier lessons on the expanding schedule (1, 2, 4, 8, 16 teaching lessons back), earlier patterns, the teacher's error log, and a progress line (builds on / unlocks). Table: minute range, part, teacher does, student does, 1:1 technique, wait cue. Parts sum to 60. Teacher talk <= 40%. Model first (I do / we do / you do); the rule is stated plainly (<= 3 lines) before the practice; the student teaches it back at the end.
5. **Speaking.** Student talk, speaking minutes and the ladder steps reached, meeting `SPEAKING_TARGETS` for the level (`docs/academy-speaking-practice.md`); every game answer can be said aloud.
5b. **Intensive, gamified practice.** Responses per part (target >= 80 student responses per hour), a practice ladder (guided -> semi-independent -> independent -> mixed), interleaving old and new, an error-return loop with expanding spacing, a mastery check with a fallback (chill track), a fluency round against the student's own best (no leaderboards).
6. **Games and mechanics.** From `docs/academy-games-catalog.md` (incl. section 13 classic and retro games) and one video-game mechanic from `docs/academy-video-game-mechanics.md`; no game three times in a row; the signature game and fun hook.
7. **Traceability.** A table: activity -> objective / need served. Cut any activity that serves neither.
8. **Supports and differentiation.** Home-language hint, slower audio, chill track, stretch.
9. **Assessment and follow-up.** Formative evidence, the Daily 10 on the spacing calendar (days 1, 3, 7, 14, 30), voice note, next clue.
10. **Before building.** Scenario (if any story or video), pictures needed, audio needed, owner approval.


## Pre-A1 only: the reading-first block (owner, 2026-10-15)

Every Pre-A1 lesson plan states, before anything is built (data: `src/curriculum/academy/preA1Reading.ts`, rule: `CLAUDE.md` "Pre-A1 is reading-first"):

| Step | Plan says |
|---|---|
| Activate | the 3+ words for the private "I know it / New to me" check (words the student may already know from school or a phone) |
| Sounds and blending | the sounds taught so far, the words blended and spelled |
| Message | a 3-6 line message from a cast member made only of the sounds and whole words taught so far (checked by `readingProblems()`), read twice: listen, then read |
| Word bank | 3+ words the student may keep from the message, practised the same lesson (listen and match with word tiles) and returned on the spaced schedule |

A Pre-A1 plan without a reading block fails the traceability check.
