-- Remove the restrictive 20-slot minimum validation (with CASCADE)
DROP FUNCTION IF EXISTS public.validate_teacher_minimum_slots() CASCADE;