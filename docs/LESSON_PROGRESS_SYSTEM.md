# Interactive Lesson Progress Tracking System

## Overview
Every interactive lesson automatically tracks student progress per individual student ID. This enables auto-continuation, completion rules, and sequential progression through the curriculum.

## Quick Links

- [Testing Checklist](./TESTING_CHECKLIST.md) - Comprehensive testing scenarios
- [Test Suite Documentation](../src/test/README.md) - Automated test coverage

---

## Database Tables

### `interactive_lesson_progress`
Stores slide-by-slide progress for each student-lesson pair.

**Fields:**
- `student_id` - UUID of the student
- `lesson_id` - UUID of the lesson
- `current_slide_index` - Current slide position (0-based)
- `completed_slides` - Number of slides completed
- `total_slides` - Total slides in the lesson
- `completion_percentage` - Calculated percentage (0-100)
- `lesson_status` - Status: `not_started`, `in_progress`, `completed`, `redo_required`
- `xp_earned` - Total XP earned from this lesson
- `started_at` - When the lesson was first started
- `last_accessed_at` - Last time the student accessed this lesson
- `completed_at` - When the lesson was completed

### `interactive_lesson_assignments`
Tracks which lessons are assigned to which students and their unlock status.

**Fields:**
- `lesson_id` - UUID of the lesson
- `student_id` - UUID of the student
- `teacher_id` - UUID of the teacher who assigned it
- `assigned_at` - When the lesson was assigned
- `sequence_order` - Position in the curriculum sequence
- `is_unlocked` - Whether the student can access this lesson
- `unlock_conditions` - JSONB rules for unlocking

## Key Features

### 1. Auto-Continuation
- Students resume exactly where they stopped
- First-time opens start at slide 1
- Progress saves after every slide navigation
- `current_slide_index` tracks exact position

### 2. 50% Completion Rule
- **≥50% completion** = "Completed" status + auto-unlock next lesson
- **<50% completion** = "Redo Required" status
- Redo lessons must reach 50% to progress
- Completion percentage = `(completed_slides / total_slides) * 100`

### 3. Lesson Sequencing
- Lessons assigned in sequential order via `sequence_order`
- Completing a lesson auto-unlocks the next one
- Locked lessons appear grayed out with a lock icon
- First assigned lesson is automatically unlocked

### 4. Teacher Controls
Teachers have full control over student progress:
- **Continue from student's last slide** - Resume where they left off
- **Restart lesson** - Reset progress to slide 0
- **Mark as completed** - Override status regardless of %
- **Mark as redo** - Force redo status
- **Manual progress override** - Set custom slide/percentage

### 5. Student Dashboard Integration
- **My Lessons** tab shows all assigned lessons
- Progress rings show completion percentage
- Status badges indicate lesson state
- "Continue Lesson" button resumes from last slide
- Current lesson card on main dashboard

### 6. Badge System
- **NEW!** badge - Appears when previous lesson is completed
- **REDO** badge - Shows when lesson needs to be redone
- Badges use animations to draw attention

## Usage

### For Students

#### Accessing Lessons
1. Go to "My Lessons" tab in student dashboard
2. See all assigned lessons with progress indicators
3. Click "Start Lesson", "Continue Lesson", or "Redo Lesson"

#### Progress Tracking
- Progress saves automatically after each slide
- Completion percentage updates in real-time
- XP earned accumulates throughout the lesson
- Status changes automatically based on 50% rule

#### Lesson States
- **Not Started** - First time seeing the lesson
- **In Progress** - Currently working through it
- **Completed** - Finished with ≥50% completion
- **Redo Required** - Finished with <50% completion
- **Locked** - Waiting for previous lesson completion

### For Teachers

#### Assigning Lessons
1. Go to Library tab in teacher dashboard
2. Select student from dropdown
3. Click "Assign" button on lesson cards
4. Lessons appear in student's library immediately

#### Managing Student Progress
Use `ClassroomLessonControls` component:
```tsx
<ClassroomLessonControls
  lessonId="lesson-uuid"
  studentId="student-uuid"
  progress={currentProgress}
  onProgressUpdate={handleRefresh}
/>
```

#### Viewing Lesson History
Use `StudentLessonHistory` component:
```tsx
<StudentLessonHistory studentId="student-uuid" />
```


## API Reference

### Service: `interactiveLessonProgressService`

#### `getStudentLessonProgress(studentId: string, lessonId: string)`
Fetches current progress for a student-lesson pair.

**Returns:** `LessonProgress | null`

#### `initializeLessonProgress(studentId: string, lessonId: string, totalSlides: number)`
Creates initial progress record when student first opens a lesson.

**Returns:** `LessonProgress`

#### `updateSlideProgress(studentId: string, lessonId: string, slideIndex: number)`
Updates progress after student navigates to a new slide.

**Returns:** `void`

#### `completeLessonSession(studentId: string, lessonId: string, xpEarned: number)`
Finalizes lesson session, applies 50% rule, and unlocks next lesson if completed.

**Returns:** `void`

#### `unlockNextLesson(studentId: string, currentLessonId: string)`
Unlocks the next lesson in sequence after completion.

**Returns:** `void`

#### `resetLessonProgress(studentId: string, lessonId: string)`
Resets lesson to initial state (slide 0, 0% completion).

**Returns:** `void`

#### `getStudentLessonLibrary(studentId: string)`
Fetches all assigned lessons with their progress and assignment data.

**Returns:** `LessonWithProgress[]`

#### `assignLessonToStudent(lessonId: string, studentId: string, teacherId: string)`
Assigns a lesson to a student with proper sequence order.

**Returns:** `void`

#### `markLessonCompleted(studentId: string, lessonId: string)`
Manually marks lesson as completed (teacher override).

**Returns:** `void`

#### `markLessonRedo(studentId: string, lessonId: string)`
Manually marks lesson for redo (teacher override).

**Returns:** `void`

## Integration Example

### Lesson Player Integration
```tsx
import { InteractiveLessonPlayer } from '@/components/lesson/InteractiveLessonPlayer';

<InteractiveLessonPlayer
  lessonId="lesson-uuid"
  studentId="student-uuid" // Required for progress tracking
  mode="student" // or "classroom" or "preview"
/>
```

### Student Dashboard Integration
```tsx
import { StudentLessonsLibrary } from '@/components/student/StudentLessonsLibrary';

<StudentLessonsLibrary studentId={user.id} />
```

## Important Rules

1. **Every lesson must track progress** - This is not optional
2. **50% completion rule is permanent** - Cannot be changed without migration
3. **Auto-progression is automatic** - Completing a lesson always tries to unlock the next
4. **Teachers can override any status** - But overrides should be used sparingly
5. **Progress saves after every slide** - Not on lesson exit

## Testing Checklist

- [ ] Student opens lesson for first time → starts at slide 1
- [ ] Student navigates through slides → progress updates
- [ ] Student closes and reopens lesson → resumes at last slide
- [ ] Student completes 10/20 slides (50%) → status = "Completed"
- [ ] Student completes 9/20 slides (45%) → status = "Redo Required"
- [ ] Completing lesson ≥50% → next lesson unlocks
- [ ] Toast notification appears on lesson unlock
- [ ] NEW! badge appears on newly unlocked lessons
- [ ] REDO badge appears on redo_required lessons
- [ ] Teacher can continue from student's slide
- [ ] Teacher can restart lesson
- [ ] Teacher can mark as completed
- [ ] Teacher can mark as redo
- [ ] Teacher can override slide/percentage

## Future Enhancements

- **Analytics Dashboard** - Aggregate progress data across all students
- **Completion Certificates** - Auto-generate on lesson completion
- **Time Tracking** - Track how long students spend on each slide
- **Attempt History** - Store multiple attempts per lesson
- **Custom Completion Rules** - Allow teachers to set custom thresholds
- **Group Progress View** - See all students' progress at once
