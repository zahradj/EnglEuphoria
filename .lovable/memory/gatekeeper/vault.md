---
name: Gatekeeper Vault
description: Locked files/directories. Edits require UNLOCK: or OPEN THE LOCK: prefix. Cycle 6 (Content Creator + publishing) is the only unlocked surface.
type: constraint
---

# Gatekeeper Vault — Cycle 6 Lock-In

The following paths are LOCKED. Refuse edits unless the user prompt begins with `UNLOCK:` or `OPEN THE LOCK:`.

## LOCKED — All placement test code (NEW — Cycle 6 lock)

- `src/components/placement/**`
- `src/placement/**`
- `src/pages/admin/PlacementAudioWarmPage.tsx`
- `src/components/classroom/content/PlacementTestLibrary.tsx`
- Any other file matching `*Placement*` / `*placement*` (tests, hooks, edge functions, migrations touching `placement_content`, etc.)

## LOCKED — Cycles 1–5 engines (do not edit)

- `src/planning/**`
- `src/activities/**` (selection, generation, validation, catalog)
- `src/pronunciation/**`
- `src/adaptive/**`
- `src/qa/**`
- `src/gamification/**`
- `src/grammar/**`
- `src/intelligence/**`
- `src/memory/**` (SM-2+, FSRS, prioritizer, recall ladder, validators)
- `src/speaking/**` (core engine)
- `src/speaking-cycle5/**`
- `src/coherence/**`
- `src/arcade/**`
- `src/stabilization/**`
- `src/analytics/**`
- `src/curriculum-standards/**`
- `src/wtc/**`, `src/hooks/useWTCMonitor.ts`
- `src/lib/srs.ts`, `src/lib/expandingScheduler.ts`
- `src/components/playground/**` (immersive student-facing shell)
- `src/components/live-classroom/**`
- `src/components/classroom/stage/StageContent.tsx`
- `supabase/functions/recruitment-agent/**`
- `supabase/migrations/**` already shipped (additive new migrations OK)

## LOCKED — Teacher application + grading pipeline (frozen this cycle)

- `src/components/teach-with-us/**` (incl. `SimpleTeacherForm.tsx`)
- `src/pages/ForTeachersPage.tsx`
- `supabase/functions/grade-grammar-test/**`
- `src/services/lessonPlaybackService.ts`
- `src/lib/academy/coins.ts`

## LOCKED — Interview pipeline (NEW — current cycle lock)

- `src/pages/InterviewMagicEntry.tsx`
- `src/components/interview/**` (incl. `InterviewSlotPicker.tsx`)
- `src/pages/interview/**`
- `supabase/functions/interview-token-auth/**`
- `supabase/functions/interview-invitation/**`
- `supabase/functions/schedule-interview/**`
- `supabase/functions/cancel-interview/**`
- `supabase/functions/reschedule-interview/**`
- Any other `supabase/functions/*interview*/**`
- Any other file matching `*Interview*` / `*interview*` (hooks, services, migrations touching `interviews`, `interview_availability_rules`, `interview_availability_overrides`)

## LOCKED — Recruitment pipeline (NEW — current cycle lock)

- `supabase/functions/recruitment-agent/**` (already locked above; reaffirmed)
- `src/pages/teach-with-us/**`
- `src/pages/admin/TeacherApplications*.tsx`
- `src/components/admin/teacher-applications/**`
- Any file matching `*Recruit*` / `*recruit*` / `*TeacherApplication*`
- Edge functions: `teacher-application-*`, `applicant-*`, `magic-link-*` related to recruitment

## LOCKED — Classroom (NEW — current cycle lock)

- `src/components/teacher/classroom/**` (incl. `TeacherClassroom.tsx`, `ClassroomTopBar.tsx`, `TeacherControlDock.tsx`)
- `src/components/classroom/**` (incl. `CountdownToStart.tsx`, `LessonWrapUpDialog.tsx`, `StudentLessonOutcomeDialog.tsx`, `ConnectionDebugPanel.tsx`, `ClassroomToolOverlay.tsx`, `CollaborativeCanvas.tsx`, `PreFlightCheck.tsx`, `incidentFlags.ts`, `hubClassroomTheme.ts`)
- `src/pages/UnifiedClassroomPage.tsx`
- `src/pages/PostLessonSummary.tsx`
- `src/hooks/useLiveClassroom.ts`, `src/hooks/useLessonTimePolicy.ts`
- `src/services/whiteboardService.ts`
- `supabase/functions/classroom-incident-verdict/**`
- Any other file matching `*Classroom*` / `*classroom*` (already-locked `live-classroom/**` and `stage/StageContent.tsx` reaffirmed)

## LOCKED — Transactional email pipeline (NEW — locked after Outlook/Gmail delivery fix)

- `supabase/functions/send-transactional-email/**`
- `supabase/functions/send-teacher-emails/**`
- `supabase/functions/send-user-emails/**`
- `supabase/functions/send-welcome-email/**`
- `supabase/functions/process-email-queue/**`
- `supabase/functions/auth-email-hook/**`
- `supabase/functions/preview-transactional-email/**`
- `supabase/functions/handle-email-suppression/**`
- `supabase/functions/handle-email-unsubscribe/**`
- `supabase/functions/parent-email-preferences/**`
- Any other file matching `*email*` under `supabase/functions/**`

## UNLOCKED — Cycle 6 surface (Content Creator + publishing + curriculum/orchestrator/story/playground-validation)

All Content Creator authoring tools, the publishing pipeline, and the engines explicitly promoted into Cycle 6:

- `src/governance/**`
- `src/orchestrator/**`
- `src/curriculum/**` (binding, worlds, roadmap)
- `src/storybook/**` (story engine + story creator surface)
- `src/playground/**` including `src/playground/validators/**` and `src/playground/esa/**`
- `src/components/creator-studio/**`
- `src/components/content-creator/**`
- `src/pages/ContentCreator*.tsx`, `src/pages/content-creator/**`
- `src/components/playground-creator/**`, `src/pages/PlaygroundCreator.tsx`
- Academy creator surface (`src/components/academy-creator/**`, `src/pages/AcademyCreator*.tsx` if present)
- Success creator surface (`src/components/success-creator/**`, `src/pages/SuccessCreator*.tsx` if present)
- Story creator surface (`src/components/story-creator/**`, `src/pages/StoryCreator*.tsx`)
- Game creator surface (`src/components/game-creator/**`, `src/pages/GameCreator*.tsx`)
- Unified Lesson Generator (`src/pages/content-creator/unified-generator*`, related components)
- Curriculum generation authoring UI (creator-side wizards, manifest builders)
- Lesson generation authoring UI (creator-side)
- Publishing pipeline (publish buttons, review queues, preview tools that ship content live)

## Override

- `UNLOCK: <reason>` or `OPEN THE LOCK: <reason>` permits edits to locked files for that single prompt only.
- `GATEKEEPER, FREEZE THIS CYCLE.` adds the cycle's files to this vault.
