# Hub separation — each hub owns its blueprints (owner rule, 2026-10-08)

> "The playground blueprint, curriculum blueprint and lesson blueprint are apart from the academy and success. Each one has their own."
> "Don't touch the playground." "Don't touch the legacy." — owner

## Ownership

| Hub | Curriculum blueprint | Lesson blueprint | Skills | Docs |
|---|---|---|---|---|
| **Playground** (ages 4–9) | existing, **untouched** by Academy work | existing, **untouched** | `playground-*`, `smart-lesson-architect`, `lesson-quality-gate`, `generate-lesson`, `lesson-variety-engine`, … (unchanged) | existing |
| **Academy** (ages 11–18, A1 → C1) | `src/curriculum/academy/` — 70 Seasons (`levels/a1.ts` … `c1.ts`), generated `docs/academy-roadmap-v2.md` | `src/curriculum/academy/lessonBlueprint.ts` — 560 session blueprints | `.claude/skills/academy-*` (9 skills) | `docs/academy-*.md`, `docs/research/academy-*.md` |
| **Success** (adults) | to be created when the owner asks — its own, never shared | its own | its own | its own |

## Rules

1. Academy work never edits, imports from, or reuses code of the Playground or Success blueprints, and never edits their skills or docs.
2. The old Academy rows in the database (`curriculum_lessons` with the legacy 10 × 7 Pre-A1/A1/A2/B1 blueprint) are **legacy**: not read, not changed, not migrated by Academy work. The new Academy roadmap lives in code until the owner decides how it reaches the database.
3. Shared multi-hub modules (for example `src/services/contentCreator/lessonBlueprint.ts`, which has a `Hub` union) are **not used** by the Academy. The Academy has its own types.
4. `src/curriculum/academy/__tests__/isolation.test.ts` fails if any file in that folder imports from outside it.
5. Truly shared infrastructure (authentication, UI kit, Supabase client, classroom video, the voice policy in `src/lib/speechPolicy.ts`) may be used by a hub's *player/UI code*, not by its blueprints.
6. Open item: `speak()` (the recorded-voice helper the voice rule requires) currently lives inside the Playground library. When the Academy player needs it, ask the owner where a neutral shared copy should live; do not import from the Playground library.
