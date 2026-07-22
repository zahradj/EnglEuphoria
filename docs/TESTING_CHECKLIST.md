# Lesson Progress System Testing Checklist

This document provides comprehensive testing scenarios for the student-linked lesson progress tracking system.

## Prerequisites

- Test student account created
- Test teacher account created
- At least 3 interactive lessons created and assigned sequentially
- Database RLS policies enabled

---

## 1. Student Flow Testing

### 1.1 Auto-Continuation (First Time)
**Test Scenario:** Student opens an assigned lesson for the first time

**Steps:**
1. Login as test student
2. Navigate to Dashboard
3. Click on an assigned lesson with "New" badge
4. Verify lesson opens at slide 0 (intro)

**Expected Results:**
- ✅ Progress is initialized (current_slide_index = 0)
- ✅ Status shows "Not Started"
- ✅ No "Continue from" message displayed
- ✅ Lesson opens at beginning

---

### 1.2 Auto-Continuation (Resume)
**Test Scenario:** Student resumes a partially completed lesson

**Steps:**
1. Start lesson, navigate to slide 5
2. Close lesson (browser tab or navigate away)
3. Return to Dashboard
4. Click same lesson again

**Expected Results:**
- ✅ Lesson opens at slide 5 (exact resume point)
- ✅ "Continue from slide 5" message displayed
- ✅ Progress ring shows partial completion
- ✅ Status badge shows "Continue"

---

### 1.3 50% Completion Rule - Success
**Test Scenario:** Student completes ≥50% of lesson

**Steps:**
1. Start Lesson 1
2. Complete 12 out of 20 slides (60%)
3. Exit lesson
4. Return to Dashboard

**Expected Results:**
- ✅ Lesson 1 status changes to "Completed"
- ✅ Green checkmark badge displayed
- ✅ Lesson 2 automatically unlocks
- ✅ Lesson 2 shows "New Available" badge
- ✅ XP and stars awarded

---

### 1.4 50% Completion Rule - Redo Required
**Test Scenario:** Student completes <50% of lesson

**Steps:**
1. Start Lesson 2
2. Complete only 8 out of 20 slides (40%)
3. Exit lesson
4. Return to Dashboard

**Expected Results:**
- ✅ Lesson 2 status changes to "Redo Required"
- ✅ Orange "Redo Required" badge displayed
- ✅ Lesson 3 remains locked
- ✅ Progress ring shows 40%
- ✅ "Redo This Lesson" button visible

---

### 1.5 Redo Flow
**Test Scenario:** Student redoes a failed lesson

**Steps:**
1. Click "Redo This Lesson" on Lesson 2
2. Complete 14 out of 20 slides (70%)
3. Exit lesson
4. Return to Dashboard

**Expected Results:**
- ✅ Lesson 2 status updates to "Completed"
- ✅ Badge changes from orange to green
- ✅ Lesson 3 automatically unlocks
- ✅ New completion data overwrites previous attempt

---

### 1.6 Badge Visibility
**Test Scenario:** Verify all badge states

**Expected Badge States:**
- 🆕 "New Available" - Lesson unlocked but not started
- ▶️ "Continue" - Lesson in progress (<50% complete)
- ✅ "Completed" - Lesson completed (≥50%)
- 🔁 "Redo Required" - Lesson failed (<50%)
- 🔒 "Locked" - Lesson not yet unlocked

---

## 2. Teacher Flow Testing

### 2.1 Student Detail View Access
**Test Scenario:** Teacher opens student progress dialog

**Steps:**
1. Login as teacher
2. Navigate to Students tab
3. Click "Progress" button on a student card

**Expected Results:**
- ✅ StudentDetailDialog opens
- ✅ Student avatar and name displayed
- ✅ All assigned lessons visible
- ✅ Progress rings show correct percentages
- ✅ Status badges accurate

---

### 2.2 Restart Lesson Control
**Test Scenario:** Teacher resets student progress

**Steps:**
1. Open StudentDetailDialog for a student with progress
2. Expand a lesson with progress
3. Click "Restart Lesson"
4. Confirm action

**Expected Results:**
- ✅ Progress resets to 0%
- ✅ current_slide_index = 0
- ✅ Status changes to "Not Started"
- ✅ completed_at is cleared
- ✅ XP/stars reset to 0
- ✅ Student's dashboard updates immediately

---

### 2.3 Mark Completed Control
**Test Scenario:** Teacher manually marks lesson as completed

**Steps:**
1. Open StudentDetailDialog
2. Expand a lesson that is incomplete
3. Click "Mark Completed"
4. Confirm action

**Expected Results:**
- ✅ Status changes to "Completed"
- ✅ Completion percentage = 100%
- ✅ Next lesson in sequence unlocks
- ✅ Green checkmark badge appears
- ✅ completed_at timestamp set

---

### 2.4 Mark as Redo Control
**Test Scenario:** Teacher marks lesson for redo

**Steps:**
1. Open StudentDetailDialog
2. Expand a completed lesson
3. Click "Mark as Redo"
4. Confirm action

**Expected Results:**
- ✅ Status changes to "Redo Required"
- ✅ Orange badge appears
- ✅ Next lesson remains unlocked (doesn't re-lock)
- ✅ Student sees redo badge on dashboard

---

### 2.5 Continue from Slide
**Test Scenario:** Teacher opens lesson at student's current position

**Steps:**
1. Student has progress at slide 7
2. Teacher opens StudentDetailDialog
3. Teacher expands lesson
4. Teacher clicks "Continue from Slide 7"

**Expected Results:**
- ✅ Lesson player opens in new tab
- ✅ Lesson starts at slide 7
- ✅ mode=classroom parameter in URL
- ✅ Teacher can navigate freely

---

### 2.6 Manual Override
**Test Scenario:** Teacher manually sets custom progress

**Steps:**
1. Open StudentDetailDialog
2. Expand a lesson
3. Expand "Advanced Controls"
4. Set current_slide_index = 15
5. Set completion_percentage = 75
6. Click "Apply Override"

**Expected Results:**
- ✅ Database updates with custom values
- ✅ Progress ring shows 75%
- ✅ Toast notification confirms success
- ✅ Student's next lesson open starts at slide 15

---

## 3. Classroom Mode Testing

### 3.1 Floating Controls Button
**Test Scenario:** Teacher accesses controls during live lesson

**Steps:**
1. Open lesson in classroom mode (/lesson/:id?mode=classroom&studentId=xxx)
2. Verify floating "Student Controls" button appears
3. Click button

**Expected Results:**
- ✅ Button visible in bottom-right corner
- ✅ StudentDetailDialog opens
- ✅ Shows current student's progress
- ✅ Teacher can make changes without leaving lesson

---

## 4. Security & RLS Testing

### 4.1 Student Data Isolation
**Test Scenario:** Verify students can only see their own data

**Steps:**
1. Login as Student A
2. Attempt to access Student B's progress (via direct API call or URL manipulation)

**Expected Results:**
- ✅ No data returned
- ✅ RLS policy blocks access
- ✅ Console shows "Row-level security policy violation" or returns empty

---

### 4.2 Teacher Data Scope
**Test Scenario:** Verify teachers can only see their students

**Steps:**
1. Login as Teacher A
2. Attempt to view Student C (assigned to Teacher B)

**Expected Results:**
- ✅ Student C not visible in StudentsTab
- ✅ Cannot open StudentDetailDialog for Student C
- ✅ RLS enforces teacher-student relationship

---

### 4.3 Admin Access
**Test Scenario:** Verify admins have full visibility

**Steps:**
1. Login as admin
2. Navigate to Interactive Lessons
3. View any student's progress

**Expected Results:**
- ✅ Admin can see all students
- ✅ Admin can view all progress
- ✅ Admin has same controls as teachers

---

## 5. Recent Activity Card Testing

### 5.1 Activity Display
**Test Scenario:** Verify recent activity shows correctly

**Steps:**
1. Login as teacher
2. Navigate to Dashboard
3. View "Recent Student Activity" card

**Expected Results:**
- ✅ Shows last 5 activities
- ✅ Displays student name and avatar
- ✅ Shows lesson title and CEFR level
- ✅ Correct status badge (Completed/In Progress/Redo Required)
- ✅ Relative timestamp ("2 hours ago")
- ✅ "View" button opens StudentDetailDialog

---

### 5.2 Auto-Refresh
**Test Scenario:** Verify activity refreshes automatically

**Steps:**
1. Keep Dashboard open
2. In another tab, have student complete a lesson
3. Wait 30 seconds

**Expected Results:**
- ✅ Activity card updates without page refresh
- ✅ New activity appears at the top
- ✅ No manual refresh needed

---

## 6. Edge Cases

### 6.1 No Progress Data
**Test Scenario:** Student opens lesson with no existing progress

**Expected Results:**
- ✅ Progress record created automatically
- ✅ Starts at slide 0
- ✅ No errors thrown

---

### 6.2 Concurrent Updates
**Test Scenario:** Teacher and student modify progress simultaneously

**Expected Results:**
- ✅ Most recent update wins
- ✅ No data corruption
- ✅ Both UIs reflect final state

---

### 6.3 Network Failure
**Test Scenario:** Progress update fails due to network error

**Expected Results:**
- ✅ Error toast displayed
- ✅ User can retry
- ✅ No partial updates

---

## 7. Performance Testing

### 7.1 Large Lesson List
**Test Scenario:** Student with 50+ assigned lessons

**Expected Results:**
- ✅ Dashboard loads within 2 seconds
- ✅ Progress rings render smoothly
- ✅ No UI lag or freezing

---

### 7.2 Rapid Navigation
**Test Scenario:** Student quickly navigates between slides

**Expected Results:**
- ✅ Progress updates debounced (not every slide change)
- ✅ No excessive database writes
- ✅ Final progress accurate

---

## Test Summary Template

After completing all tests, document results:

```
✅ PASSED: [Test Name]
❌ FAILED: [Test Name] - [Issue Description]
⚠️ PARTIAL: [Test Name] - [Notes]
```

---

## Troubleshooting Common Issues

**Issue:** Auto-continuation not working
- Check: Is `current_slide_index` being saved?
- Check: Is `InteractiveLessonPlayer` reading from progress service?
- Check: Browser console for errors

**Issue:** Next lesson not unlocking
- Check: Is completion percentage ≥50%?
- Check: Is `order_in_sequence` set correctly?
- Check: Review `unlockNextLesson()` logic

**Issue:** Teacher can't see student progress
- Check: RLS policies on `interactive_lesson_progress` table
- Check: Teacher-student relationship exists
- Check: Assignment records present

---

## Automated Testing

For automated testing, see:
- `src/test/services/interactiveLessonProgressService.test.ts` (50+ unit tests)
- `src/test/hooks/useProgressTracking.test.tsx` (React hooks tests)
- `src/test/integration/studentProgressFlow.test.tsx` (E2E integration tests)

Run tests:
```bash
npm run test
```
