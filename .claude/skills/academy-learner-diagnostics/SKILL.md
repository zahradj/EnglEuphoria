---
name: academy-learner-diagnostics
description: >
  Decide what an Academy student needs more practice in and turn it into a plan: the knowledge-item model (New -> Learning ->
  Known -> Secure -> Fading), per-skill levels, error taxonomy, signals (retention, hints, talk-time, rubric scores,
  comfort flags), decision rules with default thresholds, and how needs change the next session, the Daily 10, homework and
  the teacher dashboard. Use when personalising lessons, generating a next-session plan, or building analytics/needs reports.
---

# Academy Learner Diagnostics — know what each student needs

Principle: **learning != performance.** Use delayed, production-based evidence; treat in-session scores, XP and streaks as engagement only.
Thresholds below are **defaults [RT]** to be tuned in the pilot. Small data -> suggestions, not verdicts; the teacher can always override.
Never label a student ("weak"); say "needs another look at ...". Collect the minimum data, show it to the student and guardian.

## 1. Profile (collected at onboarding and updated)

- Level (from placement), goals, sessions/week (1-3), age band (Explorer/Studio), interests (for skins), comfort preferences
  (camera, voice vs type, timers off), L1 hint on/off, accessibility needs. All editable by the student/guardian.

## 2. Knowledge items (the unit of observation)

`item = { id, kind: word|chunk|structure|sound|function, cefr, firstSeen, encounters{read,heard,said,written}, retrievals[{date, mode, correct, hints, timeMs}], intervalDays, state, lastProduction }`

States: **New** (seen) -> **Learning** (retrieved, not stable) -> **Known** (correct production on >= 2 different days) -> **Secure** (correct after >= 21-day gap AND used in a freer task) ->
**Fading** (overdue or recently missed). States can fall. Scheduling: calendar days (same session -> +1 -> +3 -> +7 -> +21 -> +60; miss -> +1).

## 3. Signals and what they mean

| Signal | Source | Default flag [RT] | Reading |
|---|---|---|---|
| Retention score | Remember? (production-weighted) | < 70 % on 2 consecutive sessions | vocabulary/structure not consolidating |
| Fading count | item states | > 20 % of Known items Fading | review load too light or gaps too long |
| Hints per session | comfort dock | rising 3 sessions, or > 8 per session | supports not fading; or anxiety |
| Production accuracy by structure | Mission/Release error log | < 60 % correct over 2 sessions | structure needs re-notice + contrast work |
| Talk-time share | `TalkTimeMeter` (seconds only, never audio) | < 55 % (A1), < 65 % (B1+), < 70 % (C1) | teacher over-talking or student reticent |
| "I need a minute"/stop uses | comfort dock | > 3 per session | pressure too high -> Chill track |
| Listening decode | dictation/minimal pair accuracy | < 70 % | decoding/connected speech gap |
| Reading speed/comprehension | graded text questions | < 70 % at target level | text too hard or vocabulary gap |
| Writing rubric | Release/writing sample | any criterion down a band | target that criterion next |
| Speaking rubric | Release recording | as above | |
| Daily-10 completion | solo log | < 2 days/week for 3 weeks | adjust length/time, ask the student; no guilt |
| Enjoyment emoji | Wrap | 2 sessions below neutral | change skins/mechanics, ask |

## 4. Error taxonomy (teacher taps the category; keep ~12)

Form: verb tense/aspect · agreement (3rd-person -s, plural) · articles/determiners · word order/questions · prepositions · modals.
Lexis: wrong word · collocation · register. Pronunciation: segmental (which pair) · stress/rhythm · intonation. Discourse: connectors/cohesion · task fulfilment.
Each error is saved as an item (Mistake Bank) and re-enters Remember?/Daily 10 until Known.

## 5. Decision rules (flag -> action)

| Condition | Next session | Daily 10 / homework |
|---|---|---|
| Retention low | extend Remember? to 10 min; add production retrieval + varied-context use | +3-5 due items; shorter gaps for missed items |
| A structure < 60 % | 5-min re-notice (Grammar Detective) before the Mission; contrast only after it is stable | grammar items +1/+3 days; builder game |
| Listening decode low | dictation/minimal-pair in Notice & Build; graded audio | listening snack daily |
| Talk-time low / minute high | Chill track first, planning time on, private rehearsal, Reverse Teacher, lower stakes | voice note with 3 self-retry |
| Fluent but inaccurate | Take 2 with accuracy constraint; delayed correction | Error Hunt |
| Accurate but halting | Just-a-Minute / Story Dice, shorter prep, repeat tasks | speaking snack |
| Fading items many | Big Remix early; +1 retrieval cycle | spaced queue weighted to Fading |
| Hints not falling | check whether supports can fade or anxiety is the cause; ask the student | keep supports, add confidence tasks |
| Writing criterion down | model text + checklist + rewrite loop | micro-writing with self-check |
| Ready (stable high) | offer Push on Mission; skip a drill; stretch skin | harder library text |

Only one or two interventions per session. Over-fixing burns the fun.

## 6. Per-skill levels (shown to student/teacher/parent)

Listening · Reading · Speaking · Writing · Vocabulary · Grammar · Pronunciation. Each: **Attempted -> Familiar -> Proficient -> Mastered**.
Mastered requires a later mixed check; levels can fall. Level claims (A2, B1...) only from a separate level test every 2 Seasons and at level boundaries.

## 7. Outputs

```ts
type NeedsReport = {
  studentId: string; asOf: string;
  skills: Record<string, 'attempted'|'familiar'|'proficient'|'mastered'>;
  flags: { code: string; evidence: string; confidence: 'low'|'med'|'high' }[];
  recommendations: { target: string; action: string; where: 'session'|'daily10'|'homework'|'teacher'; minutes: number }[];
  estimatedFinish: { level: string; date: string; basis: 'sessions_per_week' };
  trainingWheels: { hintsPerSession: number[]; trend: 'down'|'flat'|'up' };
};
```
Teacher dashboard shows "This week's focus" (max 3), talk-time, hint/minute trends, fading items; the student sees can-dos, retention score, training-wheels meter, Best Lines.

## 8. Cautions

Correlational signals; no causal claims. Don't use diagnostics to rank students. Store aggregates (seconds, counts), not audio; recordings only with consent and deletable.
Check bias: accents and L1 background change error patterns - judge intelligibility, not accent. Validate rules in the pilot (`docs/academy-learning-science.md` §5) and revise thresholds.
