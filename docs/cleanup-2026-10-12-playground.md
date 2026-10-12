# Playground clean-up of 2026-10-12 — what was done and how to undo it

Owner asked (2026-10-12) to clean up the old Pre-A1 Playground material without touching the curriculum blueprint,
the lesson blueprint or the Playground Library. Tested first: see PR #49.

## 1. Old Pre-A1 draft rows (database)

71 unpublished rows in `curriculum_lessons`: 69 July drafts ("U1L1 — …" … "U10L6 — …") + 2 "Seed unit (edit me)". Nothing referenced them; the blueprint, the
Playground Library and the student lesson list never used them (no unit/lesson numbers, not published, wrong source).

- **Step taken:** archived — `ai_metadata.hub` changed from `playground` to `playground-archived`.
- **Backup:** every column of all 71 rows is in `supabase/backups/2026-10-12-prea1-old-drafts.json`.

Undo the archive (rows still there):

```sql
update curriculum_lessons
set ai_metadata = (ai_metadata - 'archived_from_hub' - 'archived_reason') || '{"hub":"playground"}'::jsonb
where ai_metadata->>'hub' = 'playground-archived';
```

Delete for good (only after you are happy; the backup above stays in git):

```sql
delete from curriculum_lessons where ai_metadata->>'hub' = 'playground-archived';
```

Bring rows back after a delete: ask Claude to re-insert them from the backup file (the `slot_*` columns are generated,
so they are left out of the insert), or Supabase → Database → Backups (point-in-time restore, if the plan has it).

## 2. Old Playground Creator (code)

`src/pages/PlaygroundCreator.tsx` and 8 files only it used were removed; `/playground-creator` and the studio's
Playground entry open the Playground Library. The editor pieces in `src/pages/playground-creator/` were kept.

Undo:
- **Fastest (minutes, no code):** Vercel → engl-euphoria → Deployments → the production deployment before the merge
  → "Instant Rollback" / "Promote".
- **Proper:** GitHub → the merged PR → "Revert" → merge the revert PR. Everything comes back exactly as it was.
