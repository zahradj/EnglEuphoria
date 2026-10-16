# Monitoring and improving teacher performance at EnglEuphoria

Research report for the owner. Prepared 2026-10-15. Scope: teacher side only (student dashboards were researched separately).

Source tags: **[O]** = I opened the page or PDF and read it; **[R]** = I only saw it in search-result summaries (the claim is as reported there, not checked against the full text); **[V]** = vendor or marketing source; **[P]** = my own proposal or judgement, not a finding. Numbered sources are listed at the end (S1-S40).

---

## 1. Summary

**Answer in one sentence.** Do not build a teacher score and rank people by it. Build a *coach-first* system with two lanes: (A) a small set of objective, fault-adjusted service standards (reliability and professionalism) that are checked automatically, and (B) a human-judged teaching-practice lane (sampled, rubric-based observation plus a short learner-experience check) whose only default consequence is a coaching conversation. Learner outcomes are context, never a verdict on one teacher.

**Why (the evidence in five lines).**
1. Coaching works when it is one-to-one, regular (about every couple of weeks), sustained and focused on specific skills: pooled effect 0.49 SD on instruction and 0.18 SD on student achievement across 60 causal studies, but effects are much smaller in large programs [S1, O].
2. Evaluation that is observation-based and comes with feedback can itself improve teachers (Cincinnati study) [S2, R], and video-based observation made teachers feel feedback was more supportive and raised retention, though it did not move student achievement by itself [S3, R].
3. Raw student star ratings are biased (gender, accent/ethnicity, grade expectations) and weakly related to learning [S15, S16, S19, R]; test-score value-added is unreliable for small samples and not meant for high-stakes use on its own [S11, S17, O/R].
4. One or two observations by one rater are unstable; 2-3 observations per year, at least one by a trained outsider, and adjustment for the learner mix is what the best US study recommends [S11, O]. Evaluator training alone did not produce better feedback in a randomized trial [S6, R].
5. Electronic monitoring shows no performance benefit and raises stress, but being transparent and less invasive gives better attitudes (meta-analysis, K=94, N=23,461) [S28, O]. Rank-and-yank style forcing yields gains that fade and invites gaming [S36-S38, R].

**What the repo already gives you.** A good reliability foundation (join/leave/ping telemetry, cancel attribution, fault classification, lesson-report timestamps) and a well-designed, fairness-aware teacher scorecard plus a counts-only talk-time meter that are built but not applied. It also carries a **legacy composite KPI** (ranking, "At Risk" flags, bonus tiers) that conflicts with the evidence and has at least one probable bug. Nothing exists yet for observation, rubric scoring, coaching, goals, peer learning, or appeals (section 4, section 12).

---

## 2. Evidence: what works, what does not

### 2.1 What improves teaching

| Practice | What the evidence says | Strength / caveats |
|---|---|---|
| **Coaching cycles** | Kraft, Blazar & Hogan (2018): 60 causal studies, +0.49 SD instruction, +0.18 SD achievement. Their coaching definition: individualized (1:1), intensive (at least every couple of weeks), sustained, context-specific (in the teacher's own classroom), focused (deliberate practice of specific skills). Pairing coaching with group training was associated with +0.31 SD larger instructional effect; with instructional materials +0.21 SD; a video library alone -0.27 SD. No significant difference between in-person and virtual coaching (but wide error bars). Effects from larger "effectiveness" trials are only a fraction of small "efficacy" trials. [S1, O] | Strong (meta-analysis of causal designs). Mostly US pre-K/elementary literacy; not 1:1 online ESL. Scale-up shrinkage is the key risk: keep coaching ratios small. |
| **Observation + rubric feedback (evaluation that informs)** | Taylor & Tyler (2012, AER): in Cincinnati's observation-based evaluation, teachers were more productive in post-evaluation years, most for initially weaker teachers; mechanism is information/skill development. [S2, R] | Quasi-experimental, ~100 mid-career math teachers, US. Quality of the observation system (trained peer/outside evaluators) is the point. |
| **Video of own teaching** | Best Foot Forward RCT (Kane et al., 2020, 433 teachers, 4 sites): teachers in the video group found post-observation meetings more supportive and could name a practice they changed; retention rose; no gain in student achievement or survey-reported experience. [S3, R] Gaudin & Chaliès (2015) review of 255 articles frames video viewing as a growing PD tool, with open questions on transfer to practice. [S4, R] Caveat from commentary: teacher-chosen videos can hide weaknesses. | Moderate. Supports video as a *fairness and reflection* tool, not as proof of better learner outcomes. |
| **Peer observation** | Developmental peer observation is valued by teachers and seen as non-threatening when clearly separated from evaluation; evidence is mostly self-report and qualitative. Cosh's sceptical point (cited in secondary sources): little evidence people improve from others' judgments alone. [S5, R] | Weak-moderate. Purpose clarity (development vs evaluation) matters more than the format. |
| **Formative "mini-observations" with fast feedback** | Marshall's model: frequent short visits, brief conversation, short write-up. [S7, R] | Practitioner model, little causal evidence; useful design pattern. |
| **Tutor-specific standards** | Stanford NSSA 2025 Tutoring Quality Standards: pre-service training, ongoing coaching and feedback, and data use are rated "Research-Informed"; safety and data privacy are "Emergent" (consensus, not research); applies to virtual tutoring too. [S9, O] Tutoring impacts (about 0.29 SD across 89 RCTs in the 2024 version) come from sustained programs, strongest with teachers/paraprofessionals as tutors and at least 3 sessions a week. [S8, R] | Good fit for a 1:1 context, but evidence is on school-age tutoring programs, mostly maths/reading. |
| **Language-teaching-specific practices that are observable** | Prompts (elicit self-correction) beat recasts for oral corrective feedback, especially on free production; younger learners benefited more (Lyster & Saito 2010, 15 classroom studies) [S22, O]. Wait time of about 3 seconds changed teacher/student talk and raised higher-order learning in science/maths (Tobin 1987 review; Rowe 1986 is the origin; narrative and old) [S23, R]. Teachers ask mostly display questions (51% vs 14% referential in Long & Sato's data); referential questions elicited longer, more complex learner answers in Brock's experiment [S24, R]. Teacher-talk studies in EFL report roughly 65-78% teacher share (small, mixed measures) [S26, R]. | Observable, teachable behaviours with decent support, so they make good rubric dimensions. Thresholds are not universal; use as coaching targets, not pass/fail cut-offs. |

### 2.2 What does not work, or backfires

| Practice | Evidence |
|---|---|
| **Raw student ratings as a measure of teaching quality** | Boring, Ottoboni & Stark (2016): SET more sensitive to instructor gender and grade expectations than to teaching effectiveness; bias cannot be corrected by adjustment (23,001 ratings, France; randomized online experiment, US) [S15, R]. Uttl et al. (2017) multisection meta-analysis: no significant correlation between ratings and learning (contested) [S16, R]. Accent/ethnicity: Rubin (1992) found listening comprehension was undermined merely by *identifying* the instructor as Asian [S19, R]; studies report lower ratings for non-native-speaker instructors (economics-course evidence, small qualitative evidence) [S19b, R]. **This is directly relevant: your teachers come from many countries.** |
| **Student surveys, done carefully** | MET found a well-designed survey (Tripod, specific behaviour items) predicted teachers' test-score impact, though Ferguson himself says no single instrument should carry high stakes alone [S10, S18, R]. Note the difference between *"how many stars?"* and *specific, observable items*. |
| **Test-score value-added for individual teachers** | ASA 2014 statement: report precision and assumptions, use within a broader quality-improvement frame, high expertise required [S17, R]. Brookings: reliability depends on sample size; less reliable in small settings [S11, O]. With 1:1 lessons and a handful of students per teacher, the sample is tiny. |
| **Observation without safeguards** | Observation scores run higher for teachers whose students have higher incoming achievement; adjust for it [S11, O; S14, R]. In-building administrators' scores are less valid than a trained outside observer's [S11, O]. High inter-rater agreement alone does not guarantee dependable scores (need generalizability analysis across raters, lessons, occasions) [S12, R]. |
| **Better evaluator training alone** | Boston RCT: intensive evaluator training did not measurably improve the quality of evaluation feedback or teacher retention/achievement; evaluation systems often fail to deliver developmental feedback [S6, R]. Implication: separate the *coach* role from the *judge* role and build structure (focus, practice, follow-up), not just "training". |
| **Electronic performance monitoring** | Meta-analysis (Ravid et al., 2023, 94 samples, N=23,461): no evidence EPM improves performance; monitoring without an explicit purpose gave no performance increase; EPM was associated with stress regardless of design; more transparent, less invasive monitoring gave more positive attitudes [S28, O for abstract]. A news summary also links surveillance to burnout/turnover [R, secondary]. |
| **Rank-and-yank / forced distribution** | Simulation (Scullen et al., 2005): gains of about 16% per year early, falling to 1-2% by years 6-10 [S38, R]. Harms to teamwork and gaming are asserted by other sources I did not check [R]. |
| **Hard targets on single metrics (Campbell's/Goodhart's law)** | "The more any quantitative social indicator is used for social decision-making, the more subject it will be to corruption pressures" (Nichols & Berliner 2005) [S36, R]. Applies to talk-time %, ratings, report counts. |
| **Contingent tangible rewards** | Deci, Koestner & Ryan (1999, 128 experiments): engagement-, completion- and performance-contingent rewards reduced free-choice intrinsic motivation (d = -0.40, -0.36, -0.28); positive feedback did not [S37, R]. Disputed by Cameron & Pierce, so treat as "risk", not law. |
| **Micro-credentials as proof of quality** | Evidence is developer-run surveys and self-reports; I found no independent outcome studies [S40, R, V]. Fine as recognition, not as evidence of improved teaching. |

---

## 3. Recommended method: "Coach first, count carefully"

Name it something teacher-friendly ("Teaching Growth Cycle"). Eight design rules:

1. **Two lanes, never merged into one number.**
   - *Lane A, Service standards* (reliability + professionalism): objective, automatic, fault-adjusted, published thresholds. Can carry contractual consequences.
   - *Lane B, Teaching practice* (lesson quality + learner experience): human-judged, coached, developmental by default. No automatic consequences.
2. **Retire the composite score and the leaderboard** (legacy `overall_kpi_score`, tier labels "Excellent/Strong/On Track/At Risk", the ranked admin table, the weekly at-risk flag, and the bonus tied to it). Replace with a per-indicator profile with sample sizes and "collecting data" states (your new scorecard already does this).
3. **Triangulate before any judgement.** A person is only discussed at "review" level when at least two independent sources point the same way (e.g., observation rubric + learner check, or telemetry + complaints), never on one metric.
4. **Teachers see their data first and the admin sees the same numbers** (your scorecard already follows this).
5. **Observation is sampled, rubric-based, calibrated, and mostly formative** (section 6).
6. **Coaching cycle every 2-4 weeks** on one focus skill, following the Kraft definition (section 7).
7. **Fault-adjusted fairness** (platform crashes, student no-shows, student-caused cancellations excluded) and **context-adjusted** (hub, level, age band, first-lesson vs established student).
8. **Human decisions only for consequential steps**, with written reasons, access to evidence, response, and appeal (section 8).

---

## 4. What exists in the repo today (read-only findings)

Everything below was read from the working tree on branch `feat/academy-a1-anime-series`. **I could not query the production database**, so I cannot confirm which migrations are applied. Per your project notes, the two scorecard/talk-time migrations are *not* applied.

### 4.1 Legacy composite KPI (in migrations and UI; presumably live)
- Tables `teacher_performance_metrics`, `teacher_kpi_snapshots`, `teacher_kpi_alerts` (`supabase/migrations/20260703114443_e90bf9dc-...sql`); nightly cron `recompute_teacher_kpis()` at 02:00 and weekly `flag_atrisk_teachers()` (Mondays 08:00) flag anyone with `overall_kpi_score < 55` and count consecutive weeks.
- Latest formula (`20260708123049_...sql`): quality 25% (average **star rating x 20**, default 70 if none), attendance 15% (`completed / all bookings in 30 days`), "student progress impact" 15% (average `speech_attempts.overall_score`, default 70), feedback completion 10% (default 60), curriculum coverage 10% (default 75), **retention 15% (students with 2 or more completed lessons in 90 days; default 0 if no data)**, response time 10% (read from the table, never recomputed in this function, so it stays at its 75 default unless something else writes it; I found nothing else that does).
- Problems visible in the code (all [P] interpretations of the code as written):
  - Quality is raw star ratings, the most bias-prone input (section 2.2).
  - "Student progress impact" is an average pronunciation-attempt score, which is not attributable to the teacher (baseline, practice, content).
  - Missing data is silently replaced by neutral defaults (70/75/60) or zero (retention), so the composite mixes real and invented numbers.
  - Attendance denominator has no upper date bound (`scheduled_at >= now() - 30 days` only), so future bookings count against the teacher; it also counts student cancellations as "missed" in the denominator.
  - **Probable bug:** both versions of `recompute_teacher_kpis()` read `lesson_feedback_submissions.feedback_text` and `.created_at`, but the generated types show that table has `feedback_content` and `submitted_at`, and `feedback_text` appears in no migration. PL/pgSQL only fails at run time, so the nightly job may be erroring (unverified; check cron logs).
- UI: `src/pages/admin/TeacherKpiDashboard.tsx` ranks teachers by `overall_kpi_score` with tier badges and a bonus preview; `src/lib/kpiBonus.ts` converts the composite into a 0-15% pay bonus (+ up to 5% "kickers"); `src/pages/teacher/TeacherKpiSelfView.tsx` shows the new scorecard plus a legacy bonus preview and at-risk notice.
- `useTeacherEmbers.ts`: a separate "Legacy Embers" standing (10 embers, start at 5; same-day cancel -2, no-show -2, late arrival -1; re-ignite by 5-star feedback, retained regulars, trial-to-paid conversions, cancel-free streaks). It is a second, gamified ranking built on star feedback and conversions.
- `teacher_cancel_slot` (`20260729161523_...sql`): cancelling within 48 hours charges a 50% fee against the teacher's balance and increments `late_cancellations_count`. So money is already tied to a reliability behaviour. That is defensible as a service term, but see section 9 on contractor status.

### 4.2 New scorecard + talk-time (built, **not applied**)
- Migration `supabase/migrations/20261003110000_teacher_scorecard_and_talk_time.sql`: table `classroom_talk_time` (seconds per side per lesson; **counts only, no audio is recorded or sent**), RPC `record_talk_time` (server decides teacher vs student; caps at 30 s per call and at real elapsed time + 1 s; no direct writes), and `get_teacher_scorecard(teacher, days=90)` returning: on-time join (within 2 min), lessons delivered, full-length (at least 85% of duration), lesson report within 24 h of the lesson end, teacher cancellations (and those inside 48 h), student feedback (energy, relevance, "more confident" %), talk time (student %), and counts of excluded events. Exclusions are explicit: student cancellations/absences, platform crashes, student tech drops, and non-teacher technical faults. Each measure carries `n`.
- UI: `src/components/teacher/scorecard/TeachingScorecard.tsx` (five goals, status "collecting data" until n >= 5, or 3 lessons for talk), `src/pages/admin/TeacherScorecards.tsx` (admin overview, "needs attention" first), `src/components/classroom/TalkTimeMeter.tsx` mounted in `TeacherClassroom.tsx` and `StudentClassroom.tsx`, `src/lib/talkTime.ts` (browser-side speech gate; target "student at least 50%"; code comment cites a "commonly cited ~70/30" which I could not source).
- Caveats [P]: (a) the mic-level gate measures loudness above a learned noise floor, so it can mis-attribute echo or background voices; (b) a single 50% target ignores age band and activity (games, songs, phonics for ages 4-7 are not conversation); (c) `lesson_feedback_submissions.lesson_id` is a text/uuid join against `class_bookings.id`, which should be type-checked before applying.

### 4.3 Other data that already exists
- **Join/leave/heartbeat:** `classroom_sessions` gained `teacher_joined_at`, `student_joined_at`, `*_last_ping_at`, `*_left_at`, `disconnect_reason`, `fault_type`, `ai_verdict`, `scheduled_at`, `duration_minutes` (`20260530201343_...sql`); table `classroom_session_heartbeats` (session, user, role, `pinged_at`, `connection_quality`). **Not found:** camera/mic on/off status columns, join-readiness checks, or audio/video quality metrics beyond `connection_quality`.
- **Cancellation attribution:** `class_bookings.cancelled_by` (`teacher`/`student`), `technical_fault_party` (from the lesson-end pipeline migrations).
- **Learner feedback:** `post_class_feedback` (teacher energy 1-5, material relevance 1-5, `feels_more_confident`, free-text suggestion; trigger notifies admins when a rating is 2 or below) and `teacher_reviews` (1-5 stars via `PostLessonRatingCard`, written as `is_public: true`, feeding `teacher_profiles.rating`).
- **Teacher lesson report:** `lesson_feedback_submissions` (feedback content, homework assigned, objectives met, student performance rating, parent communication notes, `payment_unlocked`), written through `FeedbackReportDialog` / `LessonWrapUpDialog`. The `payment_unlocked` flag suggests report submission can gate pay; that makes the report both a control and a rubber-stamp risk (see section 5, Professionalism).
- **Retention proxies:** the legacy `retention_rate` (2 or more lessons with the same teacher in 90 days) and the embers' trial-to-paid and "regular" counters.
- **Interview scorecard** for hiring (`useInterviewScorecard.ts`, `AdminScorecard.tsx` in live-classroom): exists; I did not inspect it in depth; could seed the observation rubric.

### 4.4 Not found
- Any lesson recording: `RealTimeVideoService.startRecording()` is a stub that returns `false`; the privacy policy says "We do not record sessions by default. If a session is recorded for educational quality assurance, both parties will be notified before recording begins." (`src/pages/legal/PrivacyPolicyPage.tsx`). The Jitsi-based `enhancedVideoService` is dead code (per your notes).
- Any classroom-observation, rubric, calibration, coaching log, goal, peer-observation, micro-credential, improvement-plan, or appeal table or page (searched migrations and `src` by table and file names).
- Any lesson-plan adherence telemetry beyond `lesson_completions` (used by the legacy "curriculum coverage").
- Any teacher-facing explanation of how data is used, or a teacher-consent record for monitoring.

---

## 5. Indicators (a small set) and how each is measured here

Rule: every indicator has a minimum sample (shown as n), a "collecting data" state, and a stated use. **A** = service standard (can have consequences, human-confirmed); **C** = coaching only (conversation, never auto-penalty).

### 5.1 Reliability (Lane A)

| Indicator | Definition | How measured in this app | Exists? | Cautions | Use |
|---|---|---|---|---|---|
| Punctuality | Teacher joined within 2 min of start | `classroom_sessions.teacher_joined_at` vs `scheduled_at` (scorecard `on_time`) | Data exists; scorecard RPC not applied | Time-zone/clock issues; excuse flag for platform faults | A |
| Delivered lessons | Booked lessons that took place, excluding student-side and platform causes | `class_bookings.status`, `cancelled_by`, `technical_fault_party`, `fault_type` (scorecard `delivered`) | Data exists | Fault attribution must stay human-appealable (`ai_verdict` exists: treat as a suggestion) | A |
| Teacher no-shows and short-notice cancels | Count, and cancels inside 48 h | `status='no_show'`, `cancelled_by='teacher'`, `cancelled_at` (scorecard) | Data exists | Illness/emergency path; already carries a 50% fee, so keep an exception route | A |
| Full-length delivery | Teacher present at least 85% of booked minutes | joined/left/last_ping (scorecard `full_length`) | Data exists | Ping gaps from network drops | A |
| Tech readiness | Pre-lesson device/mic/camera/bandwidth check passed; share of lessons with teacher-side drops | **New:** pre-join readiness check; reuse `classroom_session_heartbeats.connection_quality` | Partly (quality in heartbeats only) | Poor home connectivity is a fairness issue by country; use as support signal (offer help, not penalty) | C |

### 5.2 Lesson quality (Lane B, the core)

| Indicator | Definition | How measured | Exists? | Cautions | Use |
|---|---|---|---|---|---|
| **Rubric profile (8 dimensions, 4 levels)** | See rubric below | Sampled live or recorded observation, 2 trained raters, section 6 | **New** | Needs calibration; adjust for learner level/age; never compare across hubs | C (decision input only with the triangulation rule) |
| Learner talk share | Student speech seconds / total, by age/level band | `classroom_talk_time` counts, `record_talk_time` | Built, not applied | Loudness-based; hub/age-specific targets; not meaningful in song/phonics/game scenes | C |
| Wait time and question types | Pause after a question (aim about 3 s, coaching target); referential vs display questions; prompts vs recasts | **Observer-coded** with the rubric (not feasible to auto-measure reliably without recording or speech analytics) | **New** (observation only) | Research support is moderate; use as coaching targets | C |
| Use of the lesson plan | Scenes covered / objective evidence | Existing lesson/scene progress (`lesson_completions`) plus observer judgement of *purposeful* adaptation | Partial | Rewarding 100% coverage punishes good adaptation and is the strongest "control" signal for contractor status (section 9); frame as "plan used or adapted with a reason" | C |
| Child-safe conduct | Boundaries, language, contact outside platform, privacy, safeguarding procedure | Observer checklist (pass/concern, not scored), complaints, safeguarding reports | **New** | A single credible concern triggers the safeguarding track, not coaching | Safeguarding track (separate) |

**Rubric v1 (proposal [P], adapted from the structure of the Cambridge English Teaching Framework: Foundation / Developing / Proficient / Expert [S20, R], and Danielson-style four-level rubrics [S33b, R]):**
1. Aims and use of the lesson plan (clear objective, purposeful adaptation).
2. Learner participation (talk share, opportunities to produce language).
3. Questioning and wait time (referential questions, scaffolding, pause).
4. Feedback and error correction (prompts over recasts where suitable, timing, age-appropriate tone).
5. Clarity and graded language (instructions, modelling, level-appropriate teacher talk).
6. Engagement and rapport (pace, motivation, warmth, appropriate challenge).
7. Online craft (use of classroom tools, screen/audio, minimal downtime; cf. Hampel & Stickler's online-teacher skills pyramid [S27, R]).
8. Learning check (end-of-lesson confirmation that the objective was reached).
Plus a non-scored **safeguarding/conduct checklist**. Add a hub overlay (Playground: routines/TPR/age-appropriate management; Academy: motivation/autonomy; Success: needs-orientation, professional register). The British Council CPD framework for teachers and Cambridge's framework can be used as vocabulary for teacher self-assessment [S20, S21, R].

### 5.3 Learner outcomes (be careful)

| Indicator | What can be said | How measured | Exists? | Use |
|---|---|---|---|---|
| Lesson objective reached (same-day) | Whether *this lesson* achieved its objective, via a short platform-generated exit check tied to the lesson plan (not teacher-graded) | **New:** 3-item exit check in the lesson player; aggregate over at least 20 lessons per teacher and compare within hub/unit | New | C (context) |
| Unit-level progress | Cohort-level (by unit, hub, level), not per teacher | existing speech attempts, homework quests, placement | Partial | **Programme evaluation only. Do not feed into teacher scores.** |
| Teacher-reported objectives met | Self-assessed; useful for reflection | `lesson_feedback_submissions.lesson_objectives_met` | Exists | Reflection prompt only |

**What cannot be attributed:** gains in a pronunciation score or CEFR level to one teacher. Reasons: tiny per-teacher samples, no randomization of students to teachers, baseline and practice-time differences, content effects; ASA/Brookings caution applies [S11, S17]. Tutoring benefits come from sustained high-dosage programs, not individual-lesson variation [S8, R].

### 5.4 Learner experience

| Indicator | Definition | How measured | Exists? | Cautions | Use |
|---|---|---|---|---|---|
| Specific-behaviour pulse | 3 short items answered by the learner (age-banded; parent assists for ages 4-7), for example "My teacher waited for me to answer", "I understood what to do", "I felt comfortable", plus the existing "more confident" yes/no | Extend `post_class_feedback`; replace star-first UI | Partly (energy/relevance/confident exist) | Response-rate bias (only happy or angry respond); accent/gender/grade-expectation bias; young children; show trend and n, never rank | C, and an *alert* for extreme or repeated low outliers |
| Star rating | Existing 1-5 | `teacher_reviews` | Exists, **public** | Most bias-prone item; remove from KPI and bonus; keep only as optional marketplace feedback | Not for evaluation |
| Rebooking / retention | Share of learners who book a second and fourth lesson with the same teacher; first-3-sessions retention | `class_bookings` (legacy `retention_rate` exists) | Exists | Confounded by price, time-zone, availability, trial-to-paid dynamics, parent budget; correlational only. Literature: drop-out is front-loaded and student-tutor interaction drives satisfaction in an online Dutch course; in an Ecuadorian online-tutor study, satisfaction with the tutor predicted continuation [R, small]; vendor white papers (e.g., Brainfuse) are correlational [V] | C (context); ask "why did you stop?" |
| Complaints and safeguarding reports | Count with outcome | **New** intake form | New | Verify before recording; protect reporters | Safeguarding track |

### 5.5 Professionalism

| Indicator | Definition | How measured | Exists? | Cautions | Use |
|---|---|---|---|---|---|
| Lesson report on time | Sent within 24 h | `lesson_feedback_submissions.submitted_at` vs lesson end (scorecard `reports`) | Data exists | Pay gating (`payment_unlocked`) can produce rushed templates | A (timeliness) |
| Report quality | Specific strength + one next step + homework linked to the objective; no copy-paste | **New:** periodic sample reviewed by a coach with a 3-item checklist | New | Same rubric discipline as lessons | C |
| Communication | Reply time to admin/parent messages | Not found as a recorded metric | New or skip | Legacy `response_time_score` is a stuck default; remove it until measured | C |
| Participation in development | Coaching sessions attended, micro-credential steps | **New** | New | Do not penalize non-participants silently; offer | recognition |

---

## 6. Observation and calibration protocol

### 6.1 How to observe
1. **Three modes, mixed:** (a) live *silent observer* joins the classroom (needs a read-only role and a visible "observer present" banner for everyone, including parents of young children); (b) *consented recording* (opt-in, see section 9) reviewed asynchronously; (c) *teacher-selected clip* plus *system-selected clip*, so teachers have a voice but weaknesses are not hidden (the "teacher picks only the best" concern from the video trial commentary [S3, R]).
2. **Start with adults (Success) and consenting Academy learners; pilot Playground only with parent consent and a live-observer-only option.** [P]
3. **Announce the window, not the minute,** for development observations (like mini-observations); treat unannounced visits as a trust cost unless used for safeguarding or sampling a pattern. [P]
4. **Observer must not be the teacher's coach for evaluative scoring.** Whitehurst et al. found in-building observers less valid than outside observers; at least one yearly observation should be by a trained outsider [S11, O]. For a small academy: a second rater who is not the mentor.
5. **Score on evidence, not impressions:** observers write timestamped evidence notes first (what was said or done), then pick the level per dimension.
6. **Adjust for the learner:** score "appropriate for this learner" and compare a teacher with *their own* earlier scores or within the same hub/level, since observation scores correlate with learners' incoming achievement [S11, O; S14, R].

### 6.2 How many observations for a stable judgement
- Evidence: going from one to two observations improves stability; three predicted as well as five; recommendation is 2-3 observations per teacher per year [S11, O via Education Next summary]. A commentary on MET reports single-lesson reliability of about .14-.37 and about .39-.67 when four lessons are averaged (secondary; not from the Brookings report) [R]. Rater and lesson variance must be studied together, not just rater agreement [S12, R]. In a MET follow-up, 129 school-personnel observers scored four video lessons each, which was used to find combinations of raters and lessons reaching the .65 reliability target [S13, R].
- **Proposal [P] for this academy:**
  - *Formative:* 1 observed lesson per teacher per quarter plus the focus-skill check in the coaching cycle (low stakes; one rater is fine).
  - *Any decision beyond coaching (improvement plan or above):* at least **4 observed lessons**, by at least **2 trained raters**, with **2 or more different learners**, spread over **2 or more months**, **and** at least one other independent indicator pointing the same way.
  - *Onboarding:* 3 observed lessons in the first 60 days, entirely developmental.

### 6.3 Inter-rater reliability and calibration
1. **Anchor set:** 6-8 lessons (use staged or consented lessons, not children's recordings without consent) scored by the lead raters and discussed until a consensus score with notes exists for each dimension.
2. **Calibration meeting before launch and every quarter:** all observers score 2 new anchors blind, then compare.
3. **Statistics:** report ICC (two-way random, absolute agreement, single rater) with confidence intervals [S39, R]; common guidance reads below 0.5 poor, 0.5-0.75 moderate, 0.75-0.9 good, above 0.9 excellent (guideline thresholds from the paper as summarized; I did not see the full text). Target [P]: ICC at least 0.75 and at least 80% of scores within one level; if lower, retrain and do not use scores for anything but conversation.
4. **Double-score 20% of observations;** disagreements by 2 or more levels go to a reconciliation chat.
5. **Rater effects:** track each rater's mean and spread; flag leniency or severity drift; rotate raters.
6. **Bias audit twice a year:** compare rubric and learner-pulse results by teacher market region, accent group, gender and hub, to catch the accent/gender effects found in the literature [S15, S19, R].

---

## 7. Improvement loop: turning data into growth

**The 4-week cycle (per teacher), following the Kraft definition of coaching [S1, O]:**
1. **Self-assess** (10 min) against the rubric or Cambridge-style competencies; pick **one focus** (example: "wait 3 seconds after each question"). [S20, R]
2. **Gather evidence on the focus only:** observed lesson or clip, talk-time trend, a learner-pulse item.
3. **Coaching conversation** (20-30 min, within 3 days): strength first, one focus, "try this" strategy, brief practice (role-play), agreed micro-goal.
4. **Try it in the next 3-5 lessons;** the teacher self-reviews a 5-minute clip (if recording is consented) or checks the talk-time trend.
5. **Follow-up check** in 2-4 weeks. Close the goal or choose the next.
Keep coach-to-teacher ratios small (suggest about 1:15; [P], motivated by Kraft's scale-up shrinkage). Pair coaching with a short group workshop and ready-made materials, which were associated with larger effects [S1, O]; do not rely on a video library alone (associated with smaller effects).

**Peer learning.** Teacher triads that observe each other *without scores* and share one idea a month; keep peer observation strictly separate from evaluation [S5, R].

**Micro-credentials (recognition, not proof).** Examples: *Wait-Time*, *Prompts not Recasts*, *Referential Questions*, *Child-Safe Online Lessons*, *Tech Ready*, *Great Reports*. Each requires a short evidence submission reviewed by a coach (the Digital Promise model uses evidence plus peer assessment, though its evidence base is self-reported and developer-run) [S40, R, V].

**Recognition without crowding out motivation.** Prefer informational and competence-affirming recognition (feedback quotes, badges, a "teaching spotlight", choice of advanced groups, coach role) over contingent cash. Deci et al. found contingent rewards reduce intrinsic motivation while positive feedback does not [S37, R]. Consider restricting any bonus to *reliability* (objective, fault-adjusted) and removing the composite-based bonus in `kpiBonus.ts`.

**Tiers and fairness.**

| Tier | Trigger (needs minimum n; human-confirmed) | What happens | Teacher rights |
|---|---|---|---|
| 0, On track | Meets service standards; no concerns | Normal growth cycle, optional micro-credentials | Self-view of all data |
| 1, Support | A service-standard indicator below standard for 2 consecutive periods, or rubric profile in "Developing" on 2 or more dimensions | Coach offers a conversation and a resource plan; no stigma; not visible to learners | Can add context; excluded events removed |
| 2, Focused improvement plan | Support steps done for 6-8 weeks without movement, or a significant rubric gap confirmed by 2 raters over 4 or more lessons | Written plan: 2-3 specific goals, support (coach, materials, observation schedule), mid-point review at 3-4 weeks | Agree the plan; may bring a peer or representative; can ask for a different observer |
| 3, Review | Plan not met after the review period, or serious service-standard breaches | Decision by a human panel (not the coaching mentor) using all evidence: extend, move hub/level, reduce hours, pause, or end the agreement | Written reasons; sees the evidence; can respond; can appeal to a different reviewer within about 14 days |
| Separate track: safeguarding/conduct | Any credible child-safety or serious conduct concern | Immediate protective action, fair investigation, human decision | Informed of the allegation as early as safe |

Anchors for the process design [S32, O]: in the EU Platform Work Directive 2024/2831, decisions to restrict, suspend or terminate "shall be taken by a human being" (Art. 10(5)); platforms must respond to a review request within two weeks (Art. 11(2)) and inform workers about automated monitoring (Art. 9). Whether that directive applies to this academy is a legal question, but it is a sensible fairness benchmark.

---

## 8. Ethics and compliance

**Transparency.**
- Publish a plain-language "How we support your teaching" page and a contract addendum listing exactly what is collected (join times, talk-time seconds, reports, learner pulse, observations), why, who sees it, and retention. Transparency and less invasive monitoring were linked to better worker attitudes; monitoring without a purpose gave no performance gain [S28, O].
- Teachers see their own data before anyone else and can add context.

**Recording and observation consent.**
- Today you do not record (stub; privacy policy says notice before any QA recording). Keep that promise: explicit opt-in, a visible recording indicator, notice at lesson start to both sides.
- For learners under 18: parent/guardian consent, purpose limited to coaching/quality and safeguarding, short retention (suggest 30-60 days unless flagged; other providers publish retention such as about 3 months for safeguarding recordings [V, S35]), restricted and logged access, no use for model training or marketing. The ICO Children's Code stresses data minimisation and high-privacy defaults for services likely to be used by children [S34, R]; my application to lesson recordings is [P].
- Prefer the least intrusive method that serves the purpose: live observer or consented clip before any continuous recording; your **counts-only talk-time** design is a good minimal-data pattern.
- Do not add: screen capture, keystroke logging, webcam emotion/attention analytics, or off-hours tracking. The EU Platform Work Directive limits processing of workers' emotional/psychological state data (recital 40) and off-duty data (Art. 7(1)(c)) [S32, O].

**Lawful basis and impact assessment (GDPR/UK GDPR).**
- WP29 Opinion 2/2017: consent from employees is rarely freely given; monitoring must be necessary and proportionate; inform people [S30, R]. ICO monitoring-workers guidance (2023) covers anyone performing work, including gig relationships, and recommends a DPIA for higher-risk monitoring [S29, O for scope; law-firm summaries R for details]. Run a short DPIA before recordings or any speech analytics.
- No *solely automated* significant decisions about teachers (GDPR Art. 22, WP251): keep a real human with authority and competence to change the outcome [S31, R]. Treat `ai_verdict` and any scores as advisory.

**Contractor vs employee.** [legal advice needed; the following is illustrative]
- Behavioural control (mandatory methods, required reports with deadlines, quality-based penalties, unannounced observation) is the type of evidence that can push a relationship toward employment in some jurisdictions; the outcome depends on local tests and facts [S35b, R, weak]. Examples in the search results show platforms winning some cases and losing others.
- Mitigations [P]: frame standards as *service levels and outcomes*, not methods; make coaching offered and observation scheduled and mutual; avoid compulsory lesson-plan scripts for teachers (offer "plan or justified adaptation"); get counsel in the main teacher jurisdictions (EU, UK, Algeria, others) before tiers 2-3 carry pay or access consequences. The 50% late-cancel fee and a KPI-linked bonus are already control-type features.

**Avoiding surveillance culture.**
- Keep indicators few; no real-time dashboards of teachers' live behaviour for managers; no leaderboard; no public rating as an evaluation tool.
- Pair every metric with a support action (what we will do to help).
- Review the system yearly with teacher representatives; retire any metric that does not predict anything useful or shows bias.

**Safeguarding.**
- NSPCC and tutor-trust style guidance exist for online tutoring (professional boundaries, parental awareness, no private contact); provider policies vary on recording [S35, R, V]. Make child-safe conduct a gate (checklist in every observation, training in onboarding), separate from quality coaching.

---

## 9. Phased implementation plan (fitted to this product)

**Phase 0, hygiene and decisions (weeks 0-2)**
- Decide principles in section 3 (owner sign-off).
- Pause consequences from the legacy composite: hide the ranking and "At Risk" tier from admin view, stop the weekly at-risk flag, decouple `kpiBonus.ts` from the composite (or freeze it).
- Check cron logs for `recompute_teacher_kpis()` errors (probable `feedback_text` column mismatch).
- Remove star rating and `response_time_score` from any evaluation use.
- Write the teacher-facing "How we measure" page and a one-page contract addendum; short DPIA.

**Phase 1, Reliability lane (weeks 2-6)**
- Review and apply `20261003110000_teacher_scorecard_and_talk_time.sql` (type-check `lesson_id` join; make talk-time targets hub/age-banded and exclude non-conversation scenes).
- Launch teacher self-view first (4 weeks), admin overview afterwards.
- Add pre-lesson tech-readiness check (support signal) using existing heartbeat quality.

**Phase 2, Observation program (weeks 6-12)**
- Rubric v1 (eight dimensions + safeguarding checklist), observer role in classroom (read-only, visible banner), new tables (suggested names [P]): `teacher_observations`, `observation_scores`, `observation_evidence`.
- Train 3-4 observers; calibration on 6 anchor lessons; compute ICC; start with Success and Academy adults, 1 observation per teacher.
- Add `learner_pulse` items to `post_class_feedback`.

**Phase 3, Coaching and peer learning (months 3-6)**
- Tables `teacher_goals`, `coaching_sessions` (focus, agreed action, next check), teacher reflection prompt after lessons (2 questions).
- Coach pool and the 4-week cycle; peer triads; first 4-6 micro-credentials; recognition spotlight.
- Exit-check (3 items) in the lesson player; per-teacher aggregation after at least 20 lessons.
- Consented recording pilot (Academy/Success first; Playground only with parent consent): clip review, retention and access log.

**Phase 4, Tiers, appeals, evaluation (months 6-12)**
- Tiers 1-3 workflow, written-reason templates, appeal path to a different reviewer, panel.
- Quarterly calibration and double-scoring; twice-yearly bias audit by market region/accent/gender/hub.
- Evaluate the system itself: do rubric scores relate to exit-check results and to rebooking? Do coached teachers improve? Drop what does not work.

**Cost control (rough, [P]):** at 60 teachers, 1 observation per quarter = 240 observations a year; at about 1.5 hours each including notes (and double-scoring 20%) that is a few hundred coach-hours a year. Start with a subset (new teachers and volunteers) and sample the rest.

---

## 10. Limits and gaps

- **Population mismatch.** Most hard evidence is US K-12 classrooms; I found **no validated observation instrument for 1:1 online ESL**. Hampel & Stickler's work is about tutor skills and training, not a scored rubric [S27, R].
- **Coaching evidence** is mostly pre-K/elementary literacy; effects shrink at scale [S1, O].
- **Language-teaching thresholds** (wait time about 3 s, talk share, referential-question counts) come from older or small studies with mixed measures [S23, S24, S26, R]; use them as coaching targets. Your code's 50% student-talk line and the "70/30" comment are not backed by a source I could verify.
- **Rebooking as quality:** I found no study directly modelling rebooking on a language marketplace; related evidence is small or vendor-linked [R, V]. Treat as context.
- **Student ratings research** is largely from universities, not paid 1:1 lessons or children; the Uttl meta-analysis is contested [R].
- **Some sources were seen only in search-result summaries** (tagged R), including the MET final report, Taylor & Tyler, Kane et al., Tobin, Long & Sato, ASA, Boring et al.; several statistics are from secondary summaries. The Brookings PDF, Kraft et al. PDF, NSSA 2025 standards, Lyster & Saito abstract, the Ravid abstract, EU Directive text and the ICO scope page were read [O].
- **Law:** ICO, WP29/EDPB, children's-data, platform-work and contractor points are general; the platform-work directive's applicability and transposition status (member-state deadline 2 December 2026 per a secondary summary) must be checked with counsel; contractor-status case summaries are illustrative only.
- **Repo:** database state unknown; I did not run the app or tests; I did not inspect the interview scorecard in depth; the "probable bug" and "attendance denominator" points are from reading SQL only.

---

## 11. Quick comparison: legacy KPI vs recommended

| | Legacy composite (today) | Recommended |
|---|---|---|
| Output | One 0-100 score, ranked, tiers incl. "At Risk" | Per-indicator profile with n, no ranking |
| Missing data | Replaced with defaults (70/75/60) or 0 | "Collecting data" |
| Quality input | Average star rating x 20 | Rubric-scored observation + specific-behaviour pulse |
| Outcome input | Pronunciation-attempt average (not attributable) | Exit-check context; cohort-level progress only |
| Consequence | Weekly at-risk alert; 0-15% bonus | Coaching offer first; tiers with human review and appeal |
| Fairness | Student-caused faults partly counted as misses | Explicit exclusions listed on the scorecard |

---

## 12. Sources

Format: ID - citation (year) - URL - status. **O** = opened/read; **R** = seen in search results only; **V** = vendor or marketing.

**Improving teaching**
- S1 - Kraft, Blazar & Hogan, "The Effect of Teacher Coaching on Instruction and Achievement: A Meta-Analysis of the Causal Evidence," *Review of Educational Research* 88(4) (2018) - https://education.umd.edu/sites/default/files/uploads/inline-files/Kraft%20Blazar%20Hogan_2018_The%20Effect%20of%20Teacher%20Coaching_Review%20of%20Educational%20Research.pdf (also https://annenberg.brown.edu/publications/effect-teacher-coaching-instruction-and-achievement-meta-analysis-causal-evidence) - O
- S2 - Taylor & Tyler, "The Effect of Evaluation on Teacher Performance," *American Economic Review* 102(7) (2012) - https://www.nber.org/papers/w16877 (working paper) and https://erictaylor.scholars.harvard.edu/publications/the-effect-of-evaluation-on-teacher-performance - R
- S3 - Kane, Blazar, Gehlbach, Greenberg, Quinn & Thal, "Can Video Technology Improve Teacher Evaluations? An Experimental Study," *Education Finance and Policy* 15(3) (2020) - https://cepr.harvard.edu/publications/can-video-technology-improve-teacher-evaluations-experimental-study ; project: https://cepr.harvard.edu/best-foot-forward-project - R
- S4 - Gaudin & Chaliès, "Video viewing in teacher education and professional development: A literature review," *Educational Research Review* 16 (2015) - https://www.e-teaching.org/materialien/literatur/gaudin-chalies-2015 - R
- S5 - Peer observation of teaching (developmental vs evaluative; Bell & Mladenovic, Cosh as cited): "Peer observation of teaching as a faculty development tool" (PMC) - https://pmc.ncbi.nlm.nih.gov/articles/PMC3406982 - R
- S6 - Kraft & Christian, "In Search of High-Quality Evaluation Feedback: An Administrator Training Field Experiment" (published as "Can teacher evaluation systems produce high-quality feedback?", AERJ 2021/22) - https://annenberg.brown.edu/publications/search-high-quality-evaluation-feedback-administrator-training-field-experiment ; https://www.brookings.edu/blog/brown-center-chalkboard/2022/01/18/feedback-on-teacher-evaluations-misses-the-mark/ - R
- S7 - Marshall (& Menasche), *Rethinking Teacher Supervision and Evaluation* (2013; 2021 ed.), mini-observations; practitioner summary NAESP "5 Benefits of Mini-Observations" - https://www.naesp.org/?p=36995 - R (practitioner)
- S8 - Nickow, Oreopoulos & Quan, tutoring meta-analysis: NBER w27476 (2020) https://www.nber.org/papers/w27476 ; 2024 revision "The Promise of Tutoring for PreK-12 Learning" https://nssa.stanford.edu/studies/promise-tutoring-prek-12-learning-systematic-review-and-metaanalysis-experimental-evidence - R
- S9 - Stanford National Student Support Accelerator, Tutoring Quality Standards (Nov 2025 update) - https://nssa.stanford.edu/sites/default/files/TQIS%20Tutoring%20Quality%20Standards.pdf - O

**Measuring teaching**
- S10 - Measures of Effective Teaching (MET) final report press release (Gates Foundation, 2013) - https://www.gatesfoundation.org/ideas/media-center/press-releases/2013/01/measures-of-effective-teaching-project-releases-final-research-report ; critique: Rothstein & Mathis (NEPC) https://nepc-archive.colorado.edu/sites/default/files/TTR-MET-Gates_0.pdf ; Fordham commentary https://fordhaminstitute.org/national/commentary/measures-effective-teaching-final-reports - R
- S11 - Whitehurst, Chingos & Lindquist, "Evaluating Teachers with Classroom Observations: Lessons Learned in Four Districts," Brookings (2014) - https://www.brookings.edu/wp-content/uploads/2016/06/Evaluating-Teachers-with-Classroom-Observations.pdf ; Education Next summary https://www.educationnext.org/substantial-opportunities-improving-teacher-evaluations-lie-area-classroom-observations - O
- S12 - Hill, Charalambous & Kraft, "When Rater Reliability Is Not Enough," *Educational Researcher* 41(2) (2012) - https://scholar.harvard.edu/sites/scholar.harvard.edu/files/mkraft/files/hill_charalambous_kraft_2012._when_rater_reliability_is_not_enough_-_edr..pdf - R
- S13 - Ho & Kane, "The Reliability of Classroom Observations by School Personnel," MET (2013) - https://cepr.harvard.edu/resource/reliability-classroom-observations-school-personnel - R
- S14 - Steinberg & Garrett, "Classroom Composition and Measured Teacher Performance," *Educational Evaluation and Policy Analysis* (2016) - https://journals.sagepub.com/doi/full/10.3102/0162373715616249 - R
- S15 - Boring, Ottoboni & Stark, "Student Evaluations of Teaching (Mostly) Do Not Measure Teaching Effectiveness," *ScienceOpen Research* (2016) - https://doaj.org/article/f74e8e3f674646a9befb4961ee7b53b0 - R (abstract/summaries)
- S16 - Uttl, White & Gonzalez, "Meta-analysis of faculty's teaching effectiveness: SET ratings and student learning are not related," *Studies in Educational Evaluation* 54 (2017) - summary https://cte.ku.edu/its-time-change-way-we-evaluate-teaching - R (contested)
- S17 - American Statistical Association, Statement on Using Value-Added Models for Educational Assessment (2014) - https://amstat.org/asa/files/pdfs/POL-ASAVAM-Statement.pdf - R
- S18 - Ferguson / Tripod and MET student surveys: Brookings "Ask the Students" https://www.brookings.edu/research/ask-the-students ; vendor material https://www.edelements.com/hubfs/tripod-7Cs%20evidence%20v2.pdf (V) - R
- S19 - Rubin, "Nonlanguage factors affecting undergraduates' judgments of nonnative English-speaking teaching assistants," *Research in Higher Education* 33(4) (1992) - https://doi.org/10.1007/BF00973770 - R. S19b - Accent bias in student evaluations: JoSoTL 25(3) (2025) https://scholarworks.iu.edu/journals/index.php/josotl/article/download/35964/43649/122247 ; NPR on Subtirelu https://www.npr.org/sections/codeswitch/2015/03/05/390686619/study-at-rate-my-professor-a-foreign-accent-can-hurt-a-teachers-score - R (small/qualitative; Saunders 2001 and Hamermesh & Parker 2005 via secondary citation)

**English-language-teaching specifics**
- S20 - Cambridge English Teaching Framework - https://www.cambridgeenglish.org/teaching-english/professional-development/cambridge-english-teaching-framework - R
- S21 - British Council, CPD Framework for teachers (2025 revision) / TeachingEnglish - https://www.teachingenglish.org.uk/professional-development/teachers - R
- S22 - Lyster & Saito, "Oral Feedback in Classroom SLA: A Meta-Analysis," *Studies in Second Language Acquisition* 32 (2010) - https://www.cambridge.org/core/journals/studies-in-second-language-acquisition/article/oral-feedback-in-classroom-sla/4999EE1C8379B2BF026B148EAF373CA1 - O (abstract)
- S23 - Tobin, "The Role of Wait Time in Higher Cognitive Level Learning," *Review of Educational Research* 57 (1987) - https://journals.sagepub.com/doi/10.3102/00346543057001069 ; Rowe (1986) via secondary summaries - R
- S24 - Long & Sato (1983) display vs referential questions; Brock, "The Effects of Referential Questions on ESL Classroom Discourse," *TESOL Quarterly* 20 (1986) - https://scholarspace.manoa.hawaii.edu/items/4936c229-5e35-4578-948e-7a21e155b4d1/full - R
- S25 - Walsh, classroom interactional competence and SETT: summarized in https://linguistlist.org/issues/25/1573/ - R (secondary)
- S26 - Teacher-talk time in ESL/EFL (Flanders two-thirds; recent small studies), e.g. Pakistan study https://pu.edu.pk/images/journal/PJERE/PDF-FILES/2-V8_no1_20.pdf - R
- S27 - Hampel & Stickler, "New skills for new classrooms: training tutors to teach languages online," *CALL* (2005) - https://oro.open.ac.uk/6404 - R

**Monitoring, ethics, compliance**
- S28 - Ravid, White, Tomczak, Miles & Behrend, "A meta-analysis of the effects of electronic performance monitoring on work outcomes," *Personnel Psychology* 76 (2023) - https://microsoft.com/research/publication/a-meta-analysis-of-the-effects-of-digital-surveillance-of-workers-a-psychology-focused-approach - O (abstract); sample size K=94, N=23,461 from search summary
- S29 - UK ICO, "Employment practices and data protection: monitoring workers" (Oct 2023; under review for the Data (Use and Access) Act) - https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/employment/monitoring-workers/ - O (introduction/scope page); detail via law-firm summary https://freeths.co.uk/2023/11/21/ico-guidance-overview-lawfully-monitoring-workers - R
- S30 - Article 29 Working Party, Opinion 2/2017 on data processing at work - https://gdpr-text.com/hr/guidelines/dataprocessingatwork/ (also https://www.wr.no/en/news/the-wp29-opinion-2-2017-on-data-processing-at-work) - R
- S31 - WP29/EDPB Guidelines on automated individual decision-making and profiling (WP251rev.01): AEPD commentary https://www.aepd.es/en/press-and-communication/blog/evaluating-human-intervention-in-automated-decisions - R
- S32 - Directive (EU) 2024/2831 on improving working conditions in platform work - https://eur-lex.europa.eu/eli/dir/2024/2831/oj/eng - O (recitals 40-49; Arts. 7, 9-12)
- S33 - ICO Age Appropriate Design Code (Children's Code) - https://ico.org.uk/media/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/age-appropriate-design-a-code-of-practice-for-online-services-2-1.pdf - R. S33b - Danielson Framework for Teaching (four domains, four levels) overview: https://www.structural-learning.com/post/danielson-framework-teachers-guide - R (secondary)
- S34 - ICO Children's Code data-minimisation commentary: https://www.esrb.org/privacy-certified-blog/the-icos-age-appropriate-design-code-default-settings-and-data-minimization/ - R (secondary)
- S35 - Safeguarding and recording practice for online tutoring: NSPCC https://learning.nspcc.org.uk/safeguarding-child-protection/tutors ; Tutor Trust https://tutorhub.thetutortrust.org/sites/default/files/2025-07/Tutor%20Trust%20Remote%20Tuition%20Safeguarding%20Guidance_1.pdf ; Think Academy UK (provider, V) https://www.thinkacademy.uk/safeguarding-policy - R. S35b - Contractor-control illustrations: IRS SS-8 determination https://irs.gov/pub/ss8/05ITE028761.pdf ; Stradling case note https://www.stradlinglaw.com/experience/large-tutoring-company-secures-summary-judgment-in-a-class-action-and-paga-case.html - R (illustrative only, not legal authority)
- S36 - Nichols & Berliner, *Collateral Damage* / EPSL-0503-101-EPRU (2005), Campbell's law - https://nepc-archive.colorado.edu/sites/default/files/EPSL-0503-101-EPRU.pdf - R
- S37 - Deci, Koestner & Ryan, *Psychological Bulletin* 125(6) (1999) - https://home.ubalt.edu/ntygmitc/642/Articles%20syllabus/Deci%20Koestner%20Ryan%20meta%20IM%20psy%20bull%2099.pdf - R (abstract)
- S38 - Scullen, Bergey & Aiman-Smith, forced distribution simulation (2005): summary https://www.socialsciencespace.com/2011/06/a-new-hope-for-rank-and-yank/ ; arXiv 2512.06583 (preprint) https://arxiv.org/pdf/2512.06583 - R
- S39 - Koo & Li, "A Guideline of Selecting and Reporting Intraclass Correlation Coefficients for Reliability Research," *J Chiropr Med* 15(2) (2016) - https://pmc.ncbi.nlm.nih.gov/articles/4913118 - R (thresholds from general knowledge/summary)
- S40 - Digital Promise, micro-credentials (developer; V) https://digitalpromise.org/reportsandresources/micro-credentials-driving-teacher-learning-leadership ; AIR review (2017) https://new.air.org/sites/default/files/2021-06/Micro-Creditials-for-Teachers-September-2017.pdf - R
- S41 - Retention and tutor satisfaction (small/vendor): Brainfuse white paper (V) https://home.brainfuse.com/wp-content/uploads/2025/02/Online-Tutoring-White-Paper-.pdf ; Ecuador online-tutor study https://digitum.um.es/entities/publication/194655d6-d568-4f4a-b9f4-bd7fec161284 ; Flanders online Dutch study https://www.researchportal.be/nl/node/4728782 - R

**Repo files read (read-only)**
`supabase/migrations/20261003110000_teacher_scorecard_and_talk_time.sql`; `20260703114443_e90bf9dc-368f-479d-bf57-f00600d0a2bf.sql`; `20260708123049_0dea5eb7-2e38-4f3e-b0ef-a4719c41a82e.sql`; `20260530201343_d1fa8bea-9c90-49bc-b888-c80eda028375.sql`; `20260221011240_1ae31f2a-f95f-4112-bcd3-94e6bd228722.sql`; `20260729161523_teacher_late_cancellation_penalty.sql`; `src/pages/admin/TeacherKpiDashboard.tsx`; `src/pages/admin/TeacherScorecards.tsx`; `src/pages/teacher/TeacherKpiSelfView.tsx`; `src/components/teacher/scorecard/TeachingScorecard.tsx`; `src/hooks/useTeacherScorecard.ts`; `src/lib/talkTime.ts`; `src/lib/kpiBonus.ts`; `src/hooks/useTeacherEmbers.ts`; `src/components/classroom/TalkTimeMeter.tsx`; `src/components/student/PostLessonRatingCard.tsx`; `src/services/video/realTimeVideoService.ts`; `src/pages/legal/PrivacyPolicyPage.tsx`; `src/integrations/supabase/types.ts` (lesson_feedback_submissions).
