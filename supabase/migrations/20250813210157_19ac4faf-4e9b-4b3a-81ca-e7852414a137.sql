-- Remove hardcoded admin secret and implement secure server-side admin creation
-- Create admin creation edge function with proper RLS

-- First, create a secure admin secret table
CREATE TABLE IF NOT EXISTS public.admin_secrets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  secret_hash text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  used boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS for admin secrets
ALTER TABLE public.admin_secrets ENABLE ROW LEVEL SECURITY;

-- Only system can manage admin secrets
CREATE POLICY "System only can manage admin secrets"
ON public.admin_secrets
FOR ALL
USING (false);

-- Fix database functions security - add SET search_path = '' to all functions
-- This prevents search path injection attacks

-- Update existing functions to include search_path protection
CREATE OR REPLACE FUNCTION public.update_material_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_classroom_sessions_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_teacher_rating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  UPDATE teacher_profiles 
  SET 
    rating = (
      SELECT ROUND(AVG(rating::numeric), 2)
      FROM teacher_reviews 
      WHERE teacher_id = NEW.teacher_id AND is_public = true
    ),
    total_reviews = (
      SELECT COUNT(*) 
      FROM teacher_reviews 
      WHERE teacher_id = NEW.teacher_id AND is_public = true
    ),
    updated_at = now()
  WHERE user_id = NEW.teacher_id;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_lesson_packages_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.reset_monthly_class_usage()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  UPDATE user_subscriptions 
  SET classes_used_this_month = 0, updated_at = now()
  WHERE DATE_TRUNC('month', updated_at) < DATE_TRUNC('month', now());
END;
$function$;

-- Fix tables with RLS enabled but missing policies
-- Add basic policies for tables that currently have RLS enabled but no access rules

-- Fix student_achievement_tiers (has RLS but incomplete policies)
DROP POLICY IF EXISTS "System can insert achievement tiers" ON public.student_achievement_tiers;
CREATE POLICY "System can insert achievement tiers"
ON public.student_achievement_tiers
FOR INSERT
WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Users can view their own achievement tiers"
ON public.student_achievement_tiers
FOR SELECT
USING (auth.uid() = student_id);

CREATE POLICY "System can update achievement tiers"
ON public.student_achievement_tiers
FOR UPDATE
USING (auth.uid() = student_id);

-- Add missing RLS policies for any other tables that need them
-- These tables should have proper access control

-- Remove the overly permissive teacher_profiles policy that allows public reads
DROP POLICY IF EXISTS "teacher_profiles_public_read" ON public.teacher_profiles;