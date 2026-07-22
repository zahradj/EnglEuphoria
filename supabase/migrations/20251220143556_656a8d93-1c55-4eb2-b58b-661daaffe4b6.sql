-- Phase 1: Database Schema Updates for Curriculum Management System

-- 1. Add sequence_number to interactive_lessons for ordering
ALTER TABLE public.interactive_lessons 
ADD COLUMN IF NOT EXISTS sequence_number INT;

-- 2. Add progression tracking columns to student_profiles
ALTER TABLE public.student_profiles 
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS last_completed_sequence_prea1 INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_completed_sequence_a1 INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_completed_sequence_a2 INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_completed_sequence_b1 INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_completed_sequence_b2 INT DEFAULT 0;

-- 3. Create index for efficient lesson lookup by sequence
CREATE INDEX IF NOT EXISTS idx_interactive_lessons_sequence 
ON public.interactive_lessons(cefr_level, age_group, sequence_number);

-- 4. Create a view for easy lesson library queries
CREATE OR REPLACE VIEW public.lesson_library_view AS
SELECT 
  il.id,
  il.title,
  il.topic,
  il.cefr_level,
  il.age_group,
  il.sequence_number,
  il.duration_minutes,
  il.status,
  il.screens_data,
  il.learning_objectives,
  il.created_at,
  il.updated_at,
  u.full_name as creator_name
FROM public.interactive_lessons il
LEFT JOIN public.users u ON il.created_by = u.id
ORDER BY il.cefr_level, il.age_group, il.sequence_number;