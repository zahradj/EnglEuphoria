# Academy lesson player — how it plugs into the live classroom

Owner, 2026-10-09: the live classroom already exists; Academy needs a **lesson player** that is compatible with it. Nothing here builds a classroom.

## Files (all Academy-only, `src/academy-player/`)

| File | Job |
|---|---|
| `AcademyLessonPlayer.tsx` | The classroom-compatible player. Same props and ref handle as the Playground's `PlayUnitLesson` (`role`, `roomId`, `hideInternalNav`, `onNavState`, `persistedSceneIdx`, `onSceneIdxPersist`, `persistedInteractionUnlocked`, `onInteractionUnlockedPersist`; handle `goNext / goBack / goToIndex / setInteractionUnlocked`). Works solo when `role`/`roomId` are omitted. |
| `EmbeddedAcademyLesson.tsx` | Twin of `EmbeddedSceneLesson`: takes `lessonId` (e.g. `A1-S01-E1`) + `roomId` + `role`, loads the script from `lessonRegistry.ts`, mounts the player. |
| `lessonRegistry.ts` | Academy lesson id -> script. Add a lesson here when it is built and tested. |
| `liveSync.ts` | `reconcilePlayerState` (never trust a snapshot from the wire), `academySyncId`, `shareable`. |
| `engine.ts` | `replayTo` (catch a late joiner up to an index), `autoEvent` (what the teacher's "Next" does on any beat). |
| `AcademyPlayer.tsx` | The screen. Controlled mode: `state` + `onEvent`, `readOnly`, `lockLines`, `showBack`. Still plays solo on its own. |

## How the two screens share one lesson

- The shared object is the engine's `PlayerState` (pure JSON, ordered by `rev`), sent on the classroom's existing activity-state channel (`whiteboardService.sendSceneActivityState`, scene id `academy:<lesson id>`).
- **Teacher** = authority: moves the story on, goes back, jumps (through the classroom's own nav bar and the ref handle). **Student** = mirror, and does the activities while the teacher has interaction ON (the classroom default); then both are authorities and the higher `rev` wins. The teacher's pause makes the student's screen read-only ("Your teacher is showing this"). Story lines are always moved on by the teacher.
- Late join / reconnect: the student asks (`scene_state_request`), the teacher answers and also repeats the state every 5 s; a saved index is replayed with `replayTo`. The lock travels on `scene_interaction_permission` with the same 3 s heartbeat as the Playground.
- A snapshot is rebuilt by `reconcilePlayerState` or dropped, so a wrong-shaped or other-lesson snapshot cannot crash the student's screen (same rule as `.claude/skills/classroom-sync-robustness`).
- Not shared yet: what is half-typed or half-built inside one activity. Answers and wrong tries are in the shared state.

## Hooking it into the stage (one place, not done here)

`src/components/classroom/stage/MainStage.tsx` renders `EmbeddedSceneLesson` only for `hubType === 'playground'` scene lessons. For an Academy lesson, render `EmbeddedAcademyLesson` in the same slot with the same props (`ref`, `roomId`, `role`, `hideInternalNav`, `onNavState={handleSceneNavState}`, persisted index and lock). The classroom code was not changed (the owner said it is finished).

## Tests

`__tests__/liveSync.test.ts` (wire safety, replay) and `__tests__/AcademyLessonPlayer.test.tsx` (a teacher and a student over a fake channel: only the teacher navigates, the student follows, jump, pause reaches the student, late join, bad snapshot ignored).
