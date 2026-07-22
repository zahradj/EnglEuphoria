-- Add Payoneer account field to teacher_profiles table
ALTER TABLE public.teacher_profiles 
ADD COLUMN IF NOT EXISTS payoneer_account_email TEXT;