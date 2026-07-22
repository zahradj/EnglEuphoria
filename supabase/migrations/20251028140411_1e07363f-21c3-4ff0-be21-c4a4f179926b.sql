-- Fix security_audit_logs table schema to match function expectations
ALTER TABLE public.security_audit_logs 
  RENAME COLUMN table_name TO resource_type;

ALTER TABLE public.security_audit_logs 
  RENAME COLUMN record_id TO resource_id;

ALTER TABLE public.security_audit_logs 
  RENAME COLUMN created_at TO timestamp;

ALTER TABLE public.security_audit_logs 
  ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}';

-- Drop old duration check constraints from all tables
ALTER TABLE public.teacher_availability DROP CONSTRAINT IF EXISTS valid_duration;
ALTER TABLE public.teacher_availability DROP CONSTRAINT IF EXISTS teacher_availability_duration_check;
ALTER TABLE public.lesson_packages DROP CONSTRAINT IF EXISTS lesson_packages_duration_minutes_check;
ALTER TABLE public.lessons DROP CONSTRAINT IF EXISTS lessons_duration_check;
ALTER TABLE public.lessons DROP CONSTRAINT IF EXISTS lessons_duration_minutes_check;

-- Update all duration values to standardize on 25 and 55 minutes
-- Update teacher_availability table
UPDATE public.teacher_availability 
SET duration = 25 
WHERE duration = 30;

UPDATE public.teacher_availability 
SET duration = 55 
WHERE duration = 60;

-- Update end_time to match new duration
UPDATE public.teacher_availability 
SET end_time = start_time + (duration || ' minutes')::interval
WHERE duration IN (25, 55);

-- Update lessons table
UPDATE public.lessons 
SET duration = 25 
WHERE duration = 30;

UPDATE public.lessons 
SET duration = 55 
WHERE duration = 60;

UPDATE public.lessons 
SET duration_minutes = 25 
WHERE duration_minutes = 30;

UPDATE public.lessons 
SET duration_minutes = 55 
WHERE duration_minutes = 60;

-- Update lesson_packages table
UPDATE public.lesson_packages 
SET duration_minutes = 25 
WHERE duration_minutes = 30;

UPDATE public.lesson_packages 
SET duration_minutes = 55 
WHERE duration_minutes = 60;

-- Add new check constraints for 25 and 55 minutes
ALTER TABLE public.teacher_availability 
  ADD CONSTRAINT valid_duration CHECK (duration IN (25, 55));

ALTER TABLE public.lesson_packages 
  ADD CONSTRAINT lesson_packages_duration_minutes_check CHECK (duration_minutes IN (25, 55));