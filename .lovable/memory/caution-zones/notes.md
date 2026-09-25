---
name: Caution Zones
description: Parts of the codebase that are fragile, high-stakes, or tied to a past incident. Not a hard lock — no magic prefix required. Flag explicitly and confirm with the user before editing here, the same way any other risky change gets confirmed, just extra-deliberate specifically in these areas.
type: guidance
---

# Caution Zones (formerly "Gatekeeper Vault")

The old version of this file required a literal `UNLOCK:` or `OPEN THE LOCK:`
prefix before editing anything on its list, built for a different workflow.
That's retired. The replacement is simpler: read before editing, explain what's
about to change, confirm before anything risky — which is already how work
happens here — applied with extra deliberateness to the areas below, not
gated behind a password.

## Flag before editing — fragile / high-stakes areas

These are places where a careless change has an outsized cost: live in-session
behavior, delivery pipelines, or code some past migration/incident specifically
hardened. Before editing any of these, say so explicitly and confirm the change
with the user first — don't just proceed silently.

### Live classroom
`src/components/teacher/classroom/**` (incl. `TeacherClassroom.tsx`,
`ClassroomTopBar.tsx`, `TeacherControlDock.tsx`), `src/components/classroom/**`
(incl. `CountdownToStart.tsx`, `LessonWrapUpDialog.tsx`,
`StudentLessonOutcomeDialog.tsx`, `ConnectionDebugPanel.tsx`,
`ClassroomToolOverlay.tsx`, `CollaborativeCanvas.tsx`, `PreFlightCheck.tsx`,
`incidentFlags.ts`, `hubClassroomTheme.ts`), `src/pages/UnifiedClassroomPage.tsx`,
`src/pages/PostLessonSummary.tsx`, `src/hooks/useLiveClassroom.ts`,
`src/hooks/useLessonTimePolicy.ts`, `src/services/whiteboardService.ts`,
`supabase/functions/classroom-incident-verdict/**`, `src/components/live-classroom/**`,
`src/components/classroom/stage/StageContent.tsx`, and anything else matching
`*Classroom*`/`*classroom*`.

### Transactional email pipeline
`supabase/functions/send-transactional-email/**`, `send-teacher-emails/**`,
`send-user-emails/**`, `send-welcome-email/**`, `process-email-queue/**`,
`auth-email-hook/**`, `preview-transactional-email/**`,
`handle-email-suppression/**`, `handle-email-unsubscribe/**`,
`parent-email-preferences/**`, and any other `*email*` edge function.
This one exists specifically because of a past Outlook/Gmail delivery
incident that took real effort to fix — be especially careful here.

### Placement tests
`src/components/placement/**`, `src/placement/**`,
`src/pages/admin/PlacementAudioWarmPage.tsx`,
`src/components/classroom/content/PlacementTestLibrary.tsx`, and anything
matching `*Placement*`/`*placement*` (tests, hooks, edge functions,
migrations touching `placement_content`).

### Interview pipeline
`src/pages/InterviewMagicEntry.tsx`, `src/components/interview/**` (incl.
`InterviewSlotPicker.tsx`), `src/pages/interview/**`,
`supabase/functions/interview-token-auth/**`, `interview-invitation/**`,
`schedule-interview/**`, `cancel-interview/**`, `reschedule-interview/**`,
any `supabase/functions/*interview*/**`, and anything matching
`*Interview*`/`*interview*` (hooks, services, migrations touching
`interviews`, `interview_availability_rules`, `interview_availability_overrides`).

### Recruitment / teacher-application pipeline
`supabase/functions/recruitment-agent/**`, `src/pages/teach-with-us/**`,
`src/pages/admin/TeacherApplications*.tsx`,
`src/components/admin/teacher-applications/**`, anything matching
`*Recruit*`/`*recruit*`/`*TeacherApplication*`, and edge functions
`teacher-application-*`, `applicant-*`, recruitment-related `magic-link-*`.

### Teacher application + grading pipeline
`src/components/teach-with-us/**` (incl. `SimpleTeacherForm.tsx`),
`src/pages/ForTeachersPage.tsx`, `supabase/functions/grade-grammar-test/**`,
`src/services/lessonPlaybackService.ts`, `src/lib/academy/coins.ts`.

### Core engines (older, load-bearing subsystems)
`src/planning/**`, `src/activities/**` (selection, generation, validation,
catalog), `src/pronunciation/**`, `src/adaptive/**`, `src/qa/**`,
`src/gamification/**`, `src/grammar/**`, `src/intelligence/**`,
`src/memory/**` (SM-2+, FSRS, prioritizer, recall ladder, validators),
`src/speaking/**`, `src/speaking-cycle5/**`, `src/coherence/**`,
`src/arcade/**`, `src/stabilization/**`, `src/analytics/**`,
`src/curriculum-standards/**`, `src/wtc/**`, `src/hooks/useWTCMonitor.ts`,
`src/lib/srs.ts`, `src/lib/expandingScheduler.ts`,
`src/components/playground/**` (immersive student-facing shell),
already-shipped `supabase/migrations/**` (new additive migrations are fine).

## No extra caution needed — actively worked on, edit freely

Content Creator authoring tools, the publishing pipeline, and everything
promoted into active development: `src/governance/**`, `src/orchestrator/**`,
`src/curriculum/**` (binding, worlds, roadmap), `src/storybook/**`,
`src/playground/**` (incl. `validators/**`, `esa/**`),
`src/components/creator-studio/**`, `src/components/content-creator/**`,
`src/pages/ContentCreator*.tsx`, `src/pages/content-creator/**`,
`src/components/playground-creator/**`, `src/pages/PlaygroundCreator.tsx`,
academy/success/story/game creator surfaces, the unified lesson generator,
curriculum/lesson generation authoring UI, and the publishing pipeline itself.
