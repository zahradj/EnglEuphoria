# Dependency Maintenance Guide

## Overview

This document outlines the process for keeping npm dependencies up-to-date and secure.

## Automated Updates

### Dependabot Configuration

**File**: `.github/dependabot.yml`

**Schedule**: Weekly (Mondays at 08:00 UTC)

**Grouping**:
- `@radix-ui/*` packages grouped together
- React ecosystem packages (`react`, `react-dom`, `react-*`) grouped together

**Limits**: Max 10 open PRs at once

### PR Review Process

1. **Automated PRs**: Dependabot creates PRs for updates
2. **CI Validation**: All PRs must pass CI (lint, types, tests, hygiene)
3. **Review**: Developer reviews changelog and breaking changes
4. **Merge**: Approved PRs merged to main

## Manual Audit Routine

### Monthly Security Audit

**Schedule**: First Monday of each month

**Steps**:

```bash
# 1. Check for vulnerabilities
npm audit

# 2. Review high/critical vulnerabilities
npm audit --audit-level=high

# 3. Fix automatically where possible
npm audit fix

# 4. Review manual fix suggestions
npm audit fix --dry-run
```

### Triage Process

| Severity | Action | Timeline |
|----------|--------|----------|
| **Critical** | Immediate fix + emergency deploy | Same day |
| **High** | Fix in next sprint | 1-2 weeks |
| **Moderate** | Evaluate risk, fix if feasible | 1 month |
| **Low** | Monitor, fix during major updates | 3-6 months |

### Vulnerability Assessment Template

For each high/critical vulnerability:

1. **Package**: Which package is affected?
2. **Impact**: What functionality is at risk?
3. **Exploit**: Is there a known exploit? (Check CVE details)
4. **Exposure**: Are we using the vulnerable code path?
5. **Fix**: Is a patch available? Breaking changes?
6. **Workaround**: Can we mitigate without upgrade?

## Major Version Updates

### Quarterly Review

**Schedule**: End of each quarter

**Process**:

1. **Identify candidates**: Packages with major version updates
2. **Risk assessment**: Review changelogs for breaking changes
3. **Test branch**: Create dedicated branch for major updates
4. **Testing**:
   - Run full test suite
   - Manual QA on staging
   - Check production bundle size impact
5. **Rollout**: Gradual release if high-risk

### High-Risk Packages

Packages requiring extra caution during major updates:

- `react`, `react-dom` — Core framework
- `@supabase/supabase-js` — Database client
- `vite` — Build tool
- `typescript` — Type system
- UI component libraries (`@radix-ui/*`)

## Emergency Vulnerability Response

### Severity Levels

**Critical**: Actively exploited, affects production

**Response**:
1. Create hotfix branch immediately
2. Apply minimal fix (patch or workaround)
3. Skip normal review cycle (pair review only)
4. Deploy to production ASAP
5. Post-mortem within 48 hours

**High**: Exploitable but not actively exploited

**Response**:
1. Create fix PR within 24 hours
2. Fast-track review
3. Deploy in next release (within 1 week)

## Tools & Commands

### Check outdated packages
```bash
npm outdated
```

### Update specific package
```bash
npm install <package>@latest
```

### Update all patch/minor versions
```bash
npm update
```

### Lock file integrity
```bash
npm ci  # Clean install from lock file
```

## Best Practices

1. **Never commit lock file conflicts** — Regenerate with `npm install`
2. **Test locally before merging** — Run `npm run test && npm run build`
3. **Review bundle size** — Check for unexpected increases
4. **Read changelogs** — Don't blindly accept updates
5. **Pin critical versions** — Use exact versions for deployment tools

## Contact

Questions or concerns: #engineering Slack channel
