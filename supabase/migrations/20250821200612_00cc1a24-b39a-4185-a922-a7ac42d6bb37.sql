-- Clear all lesson data from the database in correct order to handle foreign key constraints
-- This will remove all systematic lessons (curriculum content) and individual lesson bookings

-- First, clear all dependent records that reference lessons
DELETE FROM lesson_payments;
DELETE FROM teacher_earnings WHERE lesson_id IS NOT NULL;
DELETE FROM lesson_feedback_submissions;
DELETE FROM learning_analytics WHERE activity_type LIKE '%lesson%';

-- Clear homework assignments
DELETE FROM homework;

-- Clear individual lesson bookings and sessions
DELETE FROM class_bookings;
DELETE FROM lessons;

-- Clear AI tutoring sessions and messages
DELETE FROM ai_conversation_messages;
DELETE FROM ai_tutoring_sessions;

-- Clear systematic curriculum lessons (content library)
DELETE FROM systematic_lessons;

-- Reset curriculum levels timestamp
UPDATE curriculum_levels SET updated_at = now();

-- Log the cleanup (only if there's an authenticated user)
DO $$
BEGIN
  IF auth.uid() IS NOT NULL THEN
    INSERT INTO learning_analytics (
      student_id,
      activity_type,
      skill_area,
      session_duration,
      xp_earned,
      metadata,
      recorded_at
    ) VALUES (
      auth.uid(),
      'system_cleanup',
      'administration',
      0,
      0,
      jsonb_build_object(
        'action', 'deleted_all_lessons',
        'timestamp', now(),
        'description', 'All lesson data cleared from database'
      ),
      now()
    );
  END IF;
END $$;