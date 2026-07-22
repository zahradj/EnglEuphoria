# Architecture Boundaries & Service Conventions

## Overview

This document defines the directory structure and conventions for organizing service layers in the codebase.

## Service Directory Structure

### `src/services/` — Active Services

Production-ready, actively maintained services.

**Examples**:
- `src/services/video/` — Video conferencing subsystem (Jitsi integration)
- `src/services/ai/` — AI content generation services

**Requirements**:
- Must have clear public API
- Must include error handling
- Should have unit tests
- Must use `logger` utility (not raw `console.log`)

### Adapter Pattern

**Purpose**: Backward compatibility re-exports

**Convention**: Add file header documenting adapter role

**Example**: `src/services/enhancedVideoService.ts`
```typescript
/**
 * @adapter
 * Legacy export file for backward compatibility.
 * Re-exports from src/services/video/enhancedVideoService
 */
export { EnhancedVideoService } from './video/enhancedVideoService';
```

### Placeholder/Stub Services

**Purpose**: Temporary implementations awaiting full integration

**Convention**: Add `@placeholder` or `@stub` JSDoc tag at file top

**Example**: `src/services/audioPlaceholderService.ts`
```typescript
/**
 * @placeholder
 * Audio service placeholder awaiting TTS integration.
 * Currently returns placeholder strings for audio files.
 */
```

**Requirements**:
- Must document what final implementation will do
- Must not be used in critical paths
- Should have tracking issue for full implementation

## Migration Path

### New Placeholder → Active Service

1. Implement full service in `src/services/<name>/`
2. Update placeholder file to re-export (adapter pattern)
3. Add deprecation notice to placeholder
4. Update all imports to use new location
5. Remove adapter after migration complete

### Example
```typescript
// Step 1: src/services/audio/audioService.ts (new)
export class AudioService { /* full implementation */ }

// Step 2: src/services/audioPlaceholderService.ts (adapter)
/**
 * @deprecated Use src/services/audio/audioService.ts
 * @adapter
 */
export { AudioService } from './audio/audioService';
```

## File Naming Conventions

- Active services: `<name>Service.ts`
- Placeholders: `<name>PlaceholderService.ts`
- Adapters: Keep original name, add `@adapter` tag
- Tests: `__tests__/<name>.test.ts` or `<name>.test.ts`

## Code Organization

### Directory Layout
```
src/services/
├── video/                  # Active service
│   ├── enhancedVideoService.ts
│   ├── jitsiApiLoader.ts
│   ├── __tests__/
│   │   └── enhancedVideoService.test.ts
│   └── types.ts
├── enhancedVideoService.ts # Adapter (re-export)
├── audioPlaceholderService.ts # Placeholder
└── audioService.ts         # Stub
```

## Review Checklist

Before committing new services:

- [ ] Service placed in correct directory
- [ ] Adapter/placeholder tags added if applicable
- [ ] Public API documented
- [ ] Error handling implemented
- [ ] Uses logger utility (not console.log)
- [ ] Tests added (if active service)
- [ ] README updated (if new subsystem)

## Questions?

Contact: Engineering team lead or open discussion in #architecture Slack channel
