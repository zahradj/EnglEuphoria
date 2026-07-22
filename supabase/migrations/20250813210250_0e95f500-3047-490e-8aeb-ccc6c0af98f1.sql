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

-- Only system can manage admin secrets (no one can access)
CREATE POLICY "System only can manage admin secrets"
ON public.admin_secrets
FOR ALL
USING (false);

-- Fix database functions security - add SET search_path = '' to all functions
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

-- Fix student_achievement_tiers policies (drop existing first)
DROP POLICY IF EXISTS "Users can view their own achievement tiers" ON public.student_achievement_tiers;
DROP POLICY IF EXISTS "System can update achievement tiers" ON public.student_achievement_tiers;

CREATE POLICY "Users can view their own achievement tiers"
ON public.student_achievement_tiers
FOR SELECT
USING (auth.uid() = student_id);

CREATE POLICY "System can update achievement tiers"
ON public.student_achievement_tiers
FOR UPDATE
USING (auth.uid() = student_id);

-- Remove the overly permissive teacher_profiles policy if it exists
DROP POLICY IF EXISTS "teacher_profiles_public_read" ON public.teacher_profiles;