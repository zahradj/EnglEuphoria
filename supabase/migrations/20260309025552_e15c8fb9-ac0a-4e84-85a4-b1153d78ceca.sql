
-- Add 'parent' to app_role enum if missing
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'parent';
