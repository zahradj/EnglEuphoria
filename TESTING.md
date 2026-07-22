# Running Tests

## Setup

Add the following test scripts to your `package.json`:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage"
  }
}
```

## Running Tests

### Run all tests once:
```bash
npm run test
```

### Run tests in watch mode (re-runs on file changes):
```bash
npm run test:watch
```

### Run tests with UI:
```bash
npm run test:ui
```

### Generate coverage report:
```bash
npm run test:coverage
```

## Test Files

- `src/test/setup.ts` - Test configuration
- `src/test/services/interactiveLessonProgressService.test.ts` - Service layer tests (50+ scenarios)
- `src/test/hooks/useProgressTracking.test.tsx` - React hooks tests
- `src/test/integration/studentProgressFlow.test.tsx` - End-to-end integration tests
- `src/test/README.md` - Detailed test documentation

## What's Tested

✅ **Auto-Continuation** - Students resume from last slide
✅ **50% Completion Rule** - Completed vs redo_required logic
✅ **Auto-Progression** - Next lesson unlocking
✅ **Teacher Controls** - Override, restart, mark completed/redo
✅ **Assignment Flow** - Sequential lesson unlocking
✅ **Edge Cases** - Boundary conditions (0%, 50%, 100%)

See `src/test/README.md` for comprehensive documentation.
