# Engineering Governance

## 1. CI Policy

Every push and PR triggers `.github/workflows/ci.yml`:

| Step | Command | Blocks merge? |
|------|---------|---------------|
| Lint | `npm run lint` | Yes |
| TypeScript (baseline) | `npm run typecheck` | Yes |
| TypeScript (strict) | `npm run typecheck:strict` | Yes |
| Unit tests + coverage | `npm run test:unit -- --coverage` | Yes |
| Repository hygiene | `npm run hygiene:check` | Yes |

All steps must pass before merging.

## 2. Branch Protection (Manual Setup Required)

Configure in GitHub → Settings → Branches → Branch protection rules for `main`:

- **Require a pull request before merging** — no direct pushes
- **Require approvals** — minimum 1 reviewer
- **Require status checks to pass** — select the `quality` job
- **Require branches to be up to date before merging**
- **Preferred merge method** — squash merge (keeps history clean)

## 3. Coverage Ratcheting

Initial thresholds (in `vitest.config.ts`):

| Metric | Threshold |
|--------|-----------|
| Lines | 60% |
| Functions | 60% |
| Branches | 60% |

**Ratcheting schedule:** Increase each threshold by 5% per quarter. Update `vitest.config.ts` and this doc when raising thresholds.

If current coverage is below 60% when first enforced, lower the threshold to match actual coverage and document the baseline here.

## 4. Logging Policy

- Use `src/utils/logger.ts` for all runtime logging in services and hooks
- **No raw `console.log/warn/error`** in `src/services/` or `src/hooks/`
- `logger.debug` / `logger.info` — development only (stripped in production)
- `logger.warn` / `logger.error` — always emitted

## 5. Hygiene Policy

`scripts/hygiene-check.mjs` runs in CI and detects:

- Stale files: `*.bak`, `*.old`, `*.tmp`, `*.security-update`, `*.orig`
- Duplicate files outside `src/` that shadow files inside `src/`

**To fix:** Delete or rename the flagged files. The script does not auto-delete.

## 6. CODEOWNERS

`.github/CODEOWNERS` assigns reviewers for critical paths. Replace placeholder team names (`@team-video`, `@team-auth`, `@team-payments`, `@team-infra`) with real GitHub handles.

## 7. Preview Deploys

Lovable automatically deploys preview builds for every change — no additional configuration needed. Use the preview URL to verify UI changes before merging.

## 8. Strict TypeScript Migration

See `docs/TS_MIGRATION.md` for the phased rollout plan. Currently strict checks cover `src/services/video/` and `src/utils/`.
