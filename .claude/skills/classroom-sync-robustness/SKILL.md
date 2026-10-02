---
name: classroom-sync-robustness
description: REQUIRED when adding or editing any Playground scene kind that uses useSyncedState / activitySync, the lesson players (PlayUnitLesson, PlayWelcomeTownLesson), or the classroom scene error handling. Rules that keep live classes from showing "This activity hit a snag".
---

# Live classroom: scenes must never crash on the student's mirror

In a live class the student's screen **mirrors** the teacher's activity state
(`useSyncedState`, `sceneActivitySync.ts`). A crash while rendering that mirror
ends the activity for the whole class ("This activity hit a snag"). It was
reported live, intermittently, from `Cannot read properties of undefined
(reading 'length' | 'line' | 'prompt' | 'img' | 'who' …)` in `system_errors`.

## Rules for scene code
1. **State is one JSON object per scene** (one `useSyncedState` call). Never put a
   `Set`/`Map`/function in it — use arrays and derive a Set with `useMemo`
   (`openedSet`). **Never call `.has()`/`.size` on the raw array** — use the derived set / `.length`.
   (`NameGateScene` did, and crashed the moment a ticket was tapped.)
2. **Give every field a typed default** in the `useSyncedState` initial object.
   `reconcileSyncedState` replaces missing / wrong-typed snapshot fields with
   those defaults, so a partial or other-scene snapshot can't produce `undefined`.
   A non-empty default array also pins the element type (e.g. `order: scene.cast`).
3. Treat indices from state defensively: `scene.rounds[round]` can be `undefined`
   — guard it (`if (!r) return …`).
4. The players keep activity state **scene-scoped** (`useSceneScopedState`): the
   render right after a scene change must never see the previous scene's state.

## Where scene code lives (one file per activity)

`unit1/SceneRenderer.tsx` and `welcome-town/SceneRenderer.tsx` are only the **dispatcher** (a `switch` on `scene.kind`) plus a few re-exports. Each activity is its own file:

- `<hub>/scene-components/<Name>Scene.tsx` — the scene and any helper/constant only it uses.
- `<hub>/scene-components/shared.tsx` — helpers used by 2+ scenes (GlassCard, Hearts, CharacterPointer…).

Adding a new scene kind: create `scene-components/MyScene.tsx` (`export function MyScene`), import it in the hub's `SceneRenderer.tsx`, add the `case`. If another scene needs one of your helpers, move it to `shared.tsx` — never import one scene from another's internals. `classroomHygiene.test.ts` scans every file in these folders.

## Safety nets already in place (don't remove)
- `SceneCrashGuard` (inside both players): crash #1 → quiet remount, crash #2 → remount
  in **safe mode** (`activitySync` undefined = no live sync), crash #3 → card with
  Reload (+ Skip for the teacher/solo). Logged to `system_errors` with scene id/kind/side.
- `ClassroomSceneErrorBoundary` (MainStage): outermost net, quiet auto-retry.

## Tests that guard this (run in CI via `npm run test:unit`)
- `sceneMirrorFuzz.test.tsx` renders **every scene of every lesson export**
  (`LESSON_*_SCENES` in unit1, welcome-town, a2, magic-castle, jungle) as the student
  mirror with hostile + mid-interaction snapshots. New lessons/scenes are picked up
  automatically — if it fails, fix the scene, don't loosen the test.
- `SceneCrashGuard.test.tsx`, `sceneActivitySync.test.tsx`.
- Quick run: `npx vitest run src/content/playground-library/sceneMirrorFuzz.test.tsx`

## Debugging a live crash
`select created_at, route, error_message, component_name from system_errors
 where component_name like 'ClassroomScenePlayer%' order by created_at desc;`
Labels read `Scene <id> [<kind>] · student mirror · safe mode · crash #n`.

## Type-check gotcha
`npm run typecheck` / `tsc -p .` check **nothing** (root tsconfig has `"files": []`).
Use `tsc --noEmit -p tsconfig.app.json` (very slow, ~7 min) or a scoped config that
`extends ./tsconfig.app.json` with a small `include` list.
