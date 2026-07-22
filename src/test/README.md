# Student Lesson Progress System - Test Suite

This test suite validates the core functionality of the student-linked lesson progress tracking system.

## Test Coverage

### 1. **Auto-Continuation Tests**
Tests that students can resume lessons from where they left off:
- ✅ First-time access starts at slide 0
- ✅ Subsequent access resumes from last saved slide
- ✅ Progress saves after each slide navigation

### 2. **50% Completion Rule Tests**
Tests the completion status logic based on slide completion:
- ✅ ≥50% (10/20 slides) → status = "completed"
- ✅ >50% (15/20 slides) → status = "completed"
- ✅ <50% (9/20 slides) → status = "redo_required"
- ✅ No next lesson unlock when <50%
- ✅ Completed timestamp only set when status = "completed"

### 3. **Auto-Progression Tests**
Tests automatic lesson unlocking based on completion:
- ✅ Completing lesson (≥50%) unlocks next lesson in sequence
- ✅ Only the immediate next lesson is unlocked, not beyond
- ✅ Next lesson status updated to "unlocked"
- ✅ Auto-progression triggered from completeLessonSession

### 4. **Teacher Override Tests**
Tests teacher control functions:
- ✅ Mark lesson as completed (override)
- ✅ Mark lesson as redo required
- ✅ Reset lesson progress completely

### 5. **Lesson Assignment Tests**
Tests lesson assignment functionality:
- ✅ Assign lesson with correct sequence order
- ✅ Create locked assignments when isUnlocked = false

## Running Tests

### Run all tests:
```bash
npm run test
```

### Run tests in watch mode:
```bash
npm run test:watch
```

### Run tests with coverage:
```bash
npm run test:coverage
```

### Run specific test file:
```bash
npm run test src/test/services/interactiveLessonProgressService.test.ts
```

## Test Structure

```
src/test/
├── setup.ts                                           # Test configuration & mocks
├── services/
│   └── interactiveLessonProgressService.test.ts      # Service layer tests
├── hooks/
│   └── useProgressTracking.test.tsx                  # Hook tests
└── README.md                                          # This file
```

## Key Test Scenarios

### Scenario 1: Student First-Time Experience
```typescript
// Student opens assigned lesson for first time
// Expected: Progress initialized at slide 0, status = 'not_started'
```

### Scenario 2: Student Resume Experience
```typescript
// Student previously at slide 7 (35% complete)
// Expected: Resume at slide 7, status = 'in_progress'
```

### Scenario 3: 50% Completion Success
```typescript
// Student completes 12/20 slides (60%)
// Expected: status = 'completed', next lesson unlocked, completed_at timestamp set
```

### Scenario 4: 50% Completion Failure
```typescript
// Student completes 8/20 slides (40%)
// Expected: status = 'redo_required', next lesson stays locked, no completed_at
```

### Scenario 5: Auto-Progression
```typescript
// Lesson 1 completed (≥50%)
// Expected: Lesson 2 unlocked automatically, status = 'unlocked'
```

## Mocking Strategy

The tests use Vitest's mocking system to mock:
- **Supabase client**: All database operations are mocked
- **Authentication**: Mock user context
- **Toast notifications**: Mock toast service
- **Error boundaries**: Mock error handling

## Continuous Integration

Tests should be run:
- ✅ Before every commit (pre-commit hook)
- ✅ On pull request creation
- ✅ Before production deployment

## Adding New Tests

When adding new features to the progress system:

1. Create test file in appropriate directory
2. Mock external dependencies
3. Test happy path and error cases
4. Test edge cases (0%, 50%, 100% completion)
5. Update this README with new test coverage

## Coverage Goals

- **Target**: 90%+ code coverage
- **Critical paths**: 100% coverage (auto-continuation, 50% rule, auto-progression)
- **Edge cases**: Full coverage of boundary conditions

## Troubleshooting

### Tests fail with "Cannot find module"
```bash
npm install
```

### Tests timeout
Increase timeout in vitest.config.ts:
```typescript
test: {
  testTimeout: 10000
}
```

### Mock not working
Ensure mock is defined before importing the module being tested.
