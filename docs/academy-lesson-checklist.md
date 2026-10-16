# Lesson checklist and unit assessment (2026-10-14)

Owner: after a lesson the teacher can check what the student did; at the end of a unit a marked checklist says whether the student needs more practice or nailed it; and **it should be included in the lesson report**. Yes, it is possible, and it is built.

## 1. After every lesson (the lesson checklist)
- **Goals:** the lesson's success criteria ("I can ..." lines from the deck, 5 per lesson). The teacher marks each one: **Nailed it / Almost / Needs more practice**. In the player's review mode the marks can start from what the student did (wrong tries and hints per goal, `suggestMark`).
- **Also marked:** the highest **speaking ladder step** reached, up to **3 recurring errors** (pronunciation, vocabulary, grammar, word order, listening, spelling, fluency, confidence; they start the next Remember?), a **comfort** flag, notes, and the "Say it" tally.
- **Verdict** (`lessonResult`): *Nailed the lesson* (all goals nailed, speaking reached its step, student at ease) · *Needs more practice* (any goal not yet, two or more almost, tense student, or speaking below its step) · *Replay this lesson* (half or more goals not yet). Each verdict lists actions: "Practise next lesson: ...", "Start the next Remember? with: ...", "Move on".

## 2. End of a unit (the unit assessment, after lesson 8)
- **Six strands** scored 0-100: listening, speaking, reading, writing, vocabulary, grammar (speaking and writing from the rubric as a percentage). 80+ = nailed, 60-79 = almost (65 at a level check), below = needs more practice.
- **Release rubric**, five criteria rated 1-4: accuracy, range, fluency, interaction, independence.
- **Verdict** (`unitResult`): *Nailed the unit* (5+ strands nailed, none weak, Release average 3+) · *Ready for the next unit* · *Needs more practice, then move on* (1-2 weak strands) · *Repeat the unit first* (3 weak strands or Release average under 2). A level check is stricter (6 strong for "nailed", 4 for "ready").
- **Practice plan** for each weak strand: which lessons to replay (listening E1/E4, speaking E4/E6, reading E5, writing E5/E6, vocabulary E2, grammar E3), extra Daily 10 time, retest in 2 weeks.

## 3. Where it lives
- Rules: `src/curriculum/academy/checklist.ts` (tested). Panels: `src/academy-deck/teacher/LessonChecklistPanel.tsx`, `UnitAssessmentPanel.tsx`.
- **In the lesson report:** `LessonWrapUpDialog` (the teacher's report after class) shows the checklist in step 2 when an Academy library lesson was on screen (`TeacherClassroom` passes `academyLessonId`), and the unit assessment after a unit's last lesson. The results go into the family message draft ("Lesson goals: 3 of 5 nailed. To practise: ..."), are saved in the report (`lesson_feedback_submissions.feedback_content.academy_checklist`, no new columns) and are shown in `FeedbackReportDialog` (teacher and student) and the parent's feedback card (`AcademyChecklistSummary`).
- Teacher's own copy: `src/services/academyChecklistService.ts`, table `academy_teacher_checks` (migration `20261014150000_academy_teacher_checks.sql`, **written, not applied**; until then it is kept in the teacher's browser).

## 4. Limits
- The report carries the checklist only when the lesson was an Academy library lesson shown in the classroom; other lessons keep the old report.
- Marks start at "Almost" in the classroom (the live player does not send wrong tries to the report yet); the teacher sets them.
- Thresholds are starting values [target]. The unit assessment's scores must be entered by the teacher; the checkpoint games do not feed them automatically yet.
- Student and parent see the marks in plain words; a verdict like "Repeat the unit first" is shown only to the teacher in the practice plan (families see the goals and "To practise").
