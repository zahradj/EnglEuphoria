# TypeScript Strict Mode Migration Plan

## Overview

This document outlines the phased approach to enabling stricter TypeScript checking across the codebase.

## Current State

- `tsconfig.app.json`: `strict: false`, `strictNullChecks` disabled
- Existing code written with permissive type checking
- Goal: Incrementally improve type safety without breaking builds

## Migration Phases

### Phase 1: Critical Paths (Current)

**Config**: `tsconfig.strict.json`  
**Enabled**: `strictNullChecks: true`, `noImplicitAny: true`  
**Scope**: 
- `src/services/video/` — video conferencing subsystem
- `src/utils/` — shared utilities

**Status**: ✅ In progress  
**CI Gate**: Separate type-check step (`tsc -p tsconfig.strict.json --noEmit`)

### Phase 2: Services & Hooks (Planned)

**Target folders**:
- `src/services/`
- `src/hooks/`
- `src/contexts/`

**Tasks**:
1. Extend `tsconfig.strict.json` includes to cover these folders
2. Fix type errors incrementally (one folder at a time)
3. Update CI to verify strict checking

### Phase 3: Global Enablement (Future)

**Goal**: Enable strict mode in `tsconfig.app.json` globally

**Prerequisites**:
- All Phase 2 folders passing strict checks
- Team alignment on timeline
- Documentation of common patterns/fixes

**Tasks**:
1. Set `strict: true` in `tsconfig.app.json`
2. Remove `tsconfig.strict.json` (no longer needed)
3. Fix remaining type errors across entire codebase
4. Update contributing guidelines

## Common Fixes

### Null/Undefined Checks
```typescript
// Before
function getName(user: User) {
  return user.profile.name;
}

// After
function getName(user: User) {
  return user.profile?.name ?? 'Unknown';
}
```

### Type Assertions
```typescript
// Before
const api = getApi();

// After
const api = getApi() as JitsiAPI | null;
if (!api) return;
```

## Testing Strategy

- Strict config is type-check only (no build impact)
- CI fails if strict-checked files have type errors
- Main build continues to use permissive config during migration

## Timeline

- **Phase 1**: Completed by [current sprint]
- **Phase 2**: TBD (requires team bandwidth)
- **Phase 3**: TBD (6-12 months estimate)

## Rollback Plan

If strict checking blocks critical work:
1. Remove problematic folder from `tsconfig.strict.json` includes
2. Document reason and create follow-up task
3. CI continues to enforce strict mode on remaining folders
