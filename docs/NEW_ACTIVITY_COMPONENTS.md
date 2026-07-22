# New Interactive Activity Components

This document describes the 3 new interactive activity components added to support Lesson 1 and future lessons.

## 1. TapToChooseActivity

### Purpose
Multiple choice activity where students tap/click on cards to select answers. Supports both single and multiple selection modes.

### File Location
`src/components/slides/activities/TapToChooseActivity.tsx`

### Props
```typescript
interface TapToChooseActivityProps {
  title: string;                    // Activity title
  instructions: string;              // Instructions for student
  options: TapToChooseOption[];      // Array of choice options
  allowMultiple?: boolean;           // Allow multiple selections
  onComplete: (score: number, xp: number) => void;
  studentId?: string;                // For progress tracking
  lessonId?: string;                 // For progress tracking
}

interface TapToChooseOption {
  id: string;                        // Unique identifier
  text: string;                      // Display text
  image?: string;                    // Optional emoji/image
  isCorrect: boolean;                // Correct answer flag
}
```

### Features
- Grid layout (2-3 columns responsive)
- Single-click selection (default) or multi-select mode
- Instant visual feedback (borders change color)
- Confetti animation for correct answers
- Checkmark/X icons reveal on submit
- Auto-progression after 2 seconds
- XP calculation based on accuracy

### Usage in JSON
```json
{
  "screenType": "tap_to_choose",
  "title": "Choose the Correct Greeting",
  "content": {
    "instructions": "Tap the word we use to greet someone",
    "options": [
      {"id": "1", "text": "Hello", "image": "🖐️", "isCorrect": true},
      {"id": "2", "text": "Banana", "image": "🍌", "isCorrect": false}
    ],
    "allowMultiple": false
  },
  "xpReward": 30
}
```

### Scoring Logic
- Single mode: 100% XP if correct, 0% if wrong
- Multi mode: (correct selections - incorrect selections) / total correct * 100
- Bonus XP for 80%+ accuracy (confetti trigger)

---

## 2. LetterTracingActivity

### Purpose
Drawing activity where students trace letters using a canvas. Uses Fabric.js for drawing functionality.

### File Location
`src/components/slides/activities/LetterTracingActivity.tsx`

### Props
```typescript
interface LetterTracingActivityProps {
  letter: string;                    // Letter to trace (e.g., "A")
  instructions: string;              // Instructions text
  onComplete: (xp: number) => void;  // Callback when done
  studentId?: string;
  lessonId?: string;
}
```

### Features
- Canvas-based drawing area (500x400px)
- Letter outline overlay (large, semi-transparent)
- Free-drawing with blue pencil brush
- "Clear" button to erase and restart
- "Done" button to complete
- Confetti on completion
- Auto-progression after 1.5 seconds
- Fixed 30 XP reward

### Technical Details
- Uses Fabric.js v6 Canvas API
- PencilBrush with 8px width
- Drawing tracked via `path:created` event
- "Done" button disabled until first stroke

### Usage in JSON
```json
{
  "screenType": "letter_tracing",
  "title": "Trace the Letter A",
  "content": {
    "letter": "A",
    "instructions": "Use your finger or mouse to trace the letter A"
  },
  "xpReward": 30
}
```

### Browser Compatibility
- Works on desktop (mouse)
- Works on tablets/mobile (touch)
- Requires JavaScript enabled
- Canvas API support required

---

## 3. FindTheLetterActivity

### Purpose
Visual search game where students find and tap specific letters hidden in a grid of letters.

### File Location
`src/components/slides/activities/FindTheLetterActivity.tsx`

### Props
```typescript
interface FindTheLetterActivityProps {
  targetLetter: string;              // Letter to find (e.g., "A")
  gridLetters: string[];             // Array of all letters in grid
  targetCount: number;               // How many target letters to find
  onComplete: (time: number, xp: number) => void;
  studentId?: string;
  lessonId?: string;
}
```

### Features
- 6-column grid of letter buttons
- Timer tracks completion time
- Progress counter (found / total)
- Click to select letters
- Instant feedback (green = correct, red = wrong)
- Checkmark appears on correct selections
- Confetti when all found
- Time-based XP bonus
- Auto-progression after 2 seconds

### Scoring Logic
```javascript
const xp = Math.max(20, 50 - timeInSeconds);
```
- Base: 50 XP
- -1 XP per second elapsed
- Minimum: 20 XP
- Encourages fast completion

### Usage in JSON
```json
{
  "screenType": "find_letter",
  "title": "Find All the Letter A's",
  "content": {
    "targetLetter": "A",
    "gridLetters": ["A", "B", "C", "A", "D", "E", ...],
    "targetCount": 5
  },
  "xpReward": 35
}
```

### Grid Generation Tips
```javascript
// Mix target letters with distractors
const gridLetters = [
  ...targetLetters,  // e.g., ["A", "A", "A", "A", "A"]
  ...distractors     // e.g., ["B", "C", "D", "E", ...]
].sort(() => Math.random() - 0.5); // Shuffle
```

---

## Integration with SlideRenderer

All three components are registered in `SlideRenderer.tsx`:

```typescript
// In renderSlideContent() switch statement:
case 'tap_to_choose':
  return <TapToChooseActivity {...props} />;

case 'letter_tracing':
  return <LetterTracingActivity {...props} />;

case 'find_letter':
  return <FindTheLetterActivity {...props} />;
```

The renderer automatically:
- Maps JSON content to component props
- Passes `studentId` and `lessonId` for tracking
- Handles onComplete callbacks
- Triggers auto-progression

---

## Progress Tracking

All activities receive optional `studentId` and `lessonId` props for future progress tracking enhancements:

```typescript
// Future implementation
const handleActivityComplete = async (score: number, xp: number) => {
  if (studentId && lessonId) {
    await interactiveLessonProgressService.updateActivityProgress({
      studentId,
      lessonId,
      activityType: 'tap_to_choose',
      score,
      xp,
      timestamp: new Date()
    });
  }
  onComplete(score, xp);
};
```

Currently, progress is tracked at the slide level via `InteractiveLessonPlayer`.

---

## Styling & Theming

All components use:
- Tailwind CSS utility classes
- Semantic color tokens from design system
- Framer Motion for animations
- Consistent border radius (rounded-2xl)
- Responsive grid layouts
- Dark mode support

### Color Tokens Used
- `border` - Default borders
- `primary` - Selected state, highlights
- `foreground` - Text color
- `muted-foreground` - Secondary text
- `card` - Card backgrounds
- `green-500/600` - Correct feedback
- `red-500/600` - Incorrect feedback

---

## Accessibility Considerations

### TapToChooseActivity
- Buttons have clear focus states
- High contrast borders
- Large click targets (6+ padding)
- Keyboard support (future enhancement)

### LetterTracingActivity
- "Clear" and "Done" buttons clearly labeled
- Tooltip explaining mouse/touch usage
- High contrast letter guide
- Button disabled states

### FindTheLetterActivity
- Timer and counter visible at all times
- Color + icon feedback (not color alone)
- Large clickable letter cells
- Progress counter for screen readers

---

## Performance Notes

### TapToChooseActivity
- Lightweight (no heavy assets)
- Instant rendering
- Minimal re-renders

### LetterTracingActivity
- Fabric.js canvas (~50KB gzipped)
- Lazy-loaded if needed
- Canvas cleanup on unmount
- No memory leaks

### FindTheLetterActivity
- Handles up to 50+ letters efficiently
- React keys prevent re-renders
- Timer uses interval (cleanup on unmount)
- Animation performance optimized

---

## Testing

### Manual Test Cases

**TapToChooseActivity:**
- [ ] Single choice works
- [ ] Multi-choice works
- [ ] Correct answer shows green border + checkmark
- [ ] Wrong answer shows red border + X
- [ ] Confetti triggers on success
- [ ] Auto-progresses after 2 seconds
- [ ] XP calculated correctly

**LetterTracingActivity:**
- [ ] Canvas renders correctly
- [ ] Can draw with mouse
- [ ] Can draw on touch devices
- [ ] Clear button erases drawing
- [ ] Done button disabled until first stroke
- [ ] Done triggers confetti
- [ ] Auto-progresses after 1.5 seconds

**FindTheLetterActivity:**
- [ ] Timer starts on mount
- [ ] Clicking correct letter marks it green
- [ ] Clicking wrong letter does nothing
- [ ] Progress counter updates
- [ ] Completes when all found
- [ ] XP bonus for fast completion
- [ ] Confetti on completion

---

## Future Enhancements

### All Components
- Analytics event tracking
- Sound effects on interactions
- Haptic feedback (mobile)
- Accessibility improvements (ARIA labels, keyboard nav)
- A/B testing variants

### TapToChooseActivity
- Image support (not just emoji)
- Animation variations
- Timed mode (answer within X seconds)
- Hint system

### LetterTracingActivity
- Stroke validation (check if they traced correctly)
- Show model tracing animation first
- Multiple letter practice in sequence
- Difficulty levels (with/without guide)

### FindTheLetterActivity
- Themes (different letter styles)
- Multiple target letters at once
- Larger grids for advanced students
- Hint system (highlight area)

---

**Last Updated:** 2025
**Version:** 1.0
**Status:** ✅ Production Ready
