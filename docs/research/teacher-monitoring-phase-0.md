# Teacher monitoring, Phase 0 checklist

Companion to `teacher-monitoring-research.md`. Status as of 2026-10-15.

## Done in the app (switch: `VITE_LEGACY_KPI`, default = paused)

- Admin Teacher KPI page: no ranking (teachers listed A to Z), no "At Risk" banner or tier, no overall score, no star-rating and response-time columns, no KPI trend, no recent-review stars, and **no "Queue bonus"**. A notice explains why.
- Admin sidebar badge and overview counters no longer count "at risk" teachers.
- Teacher dashboard: the score/tier/bonus card is replaced by a "My teaching" card.
- "My teaching" page: no old at-risk notice and no bonus preview.
- New teacher page "How we measure" (`/teacher/how-we-measure`).
- Nothing deleted. Bonuses already queued are unchanged. To restore the old behaviour: set `VITE_LEGACY_KPI=on`.

## You need to do (not possible from code)

1. **Run `run-in-supabase\pause_legacy_kpi_weekly_jobs.sql`** in the Supabase SQL editor. It stops three weekly jobs (at-risk flagging, the admin at-risk email, the per-teacher score email). Without it, teachers would still get an email with their old score and tier every Monday.
2. **Check the nightly recompute job** (the report suspects it fails on a missing `feedback_text` column):
   ```sql
   select start_time, status, return_message
   from cron.job_run_details
   where command ilike '%recompute_teacher_kpis%'
   order by start_time desc limit 10;
   ```
   If it shows errors, the old numbers have been stale; that is one more reason they should not drive anything.
3. **Sign off the principles** (section 3 of the research report): coach first; two lanes never merged into one score; humans judge teaching quality; the default consequence of a low number is support, not a penalty.
4. **Bonus decision.** The KPI payroll bonus is paused from the old score. Decide what, if anything, replaces it (the report recommends tying any reward to the reliability lane only, not to ratings). Until then nothing new can be queued from the old score.
5. **Have a lawyer review** the two drafts below before relying on them. Contractor/employee status, data-protection rules for children and recording, and the EU platform-work directive all matter here.

## Draft: contract addendum (one page, for legal review)

> **How teaching quality is supported at EnglEuphoria**
>
> 1. *Purpose.* We look at a small number of measures so we can support teachers, not to rank them.
> 2. *What we measure.* Punctuality, lessons delivered, lesson reports sent within 24 hours, how much of the lesson the student speaks (counted from microphone activity, no audio stored), and students' feedback on their own confidence. The current list is published on the "How we measure" page, and we will tell you before it changes.
> 3. *Fairness.* Platform faults and student cancellations or absences are not counted against you. A figure is not judged until enough lessons stand behind it.
> 4. *What we do not use.* Star ratings and the former overall score are not used to rank, flag, discipline or pay.
> 5. *Observation.* If we introduce lesson observations or recordings, we will tell you in advance, explain the rubric, obtain consent where required, and limit who can see them and for how long.
> 6. *Support first.* A low figure leads first to a conversation and support. Any formal step requires evidence from more than one source, a written explanation, and the right to ask for a review by a different person.
> 7. *Your data.* You can ask what we hold about your teaching measures and ask for errors to be corrected.

## Draft: short data-protection impact outline (for legal review)

| Item | Current state |
|---|---|
| Personal data involved | Lesson join/leave times, cancellations, lesson report timestamps, student feedback, talk-time seconds (counts only). |
| Children's data | Talk time is counted on the device from microphone level and only seconds are sent; no audio. Must be disclosed in the privacy policy and to parents before the talk-time meter (`VITE_TALK_TIME`) is switched on. |
| Recording | Lesson recording is **not** live (stub). If piloted: consent, retention limit, access log, Academy/Success first, Playground only with parent consent. |
| Who sees it | The teacher; coordinators/admins who can open the same scorecard (admin overview is held back by `VITE_ADMIN_SCORECARDS`). |
| Risks | Surveillance culture, bias in ratings, unfair attribution. Mitigations: no star ratings, fault exclusions, minimum sample sizes, support-first consequences, appeal route. |
| Open items | Retention period for the talk-time counters; wording of the privacy policy; lawful basis per country. |
