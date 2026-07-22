-- Critical Security Fixes

-- Phase 1: Secure Educational Content & RLS Policies
-- Add missing RLS policies for educational content tables

-- Secure lessons_content table - restrict to authenticated users only
CREATE POLICY "Authenticated users can view lesson content" 
ON public.lessons_content 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Secure systematic_lessons table if it exists
CREATE POLICY "Authenticated users can view systematic lessons" 
ON public.systematic_lessons 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Fix database function security by adding search_path
CREATE OR REPLACE FUNCTION public.update_classroom_sessions_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_lesson_packages_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_speaking_groups_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_teacher_availability_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_room_id()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  RETURN 'room-' || encode(gen_random_bytes(8), 'hex');
END;
$function$;

CREATE OR REPLACE FUNCTION public.set_lesson_room_id()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  IF NEW.room_id IS NULL THEN
    NEW.room_id := public.generate_room_id();
  END IF;
  
  IF NEW.room_link IS NULL THEN
    NEW.room_link := 'https://engleuphoria.lovable.app/oneonone-classroom-new?roomId=' || NEW.room_id;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Add security-focused policies for teacher data
CREATE POLICY "Public can view basic teacher info" 
ON public.teacher_profiles 
FOR SELECT 
USING (profile_complete = true AND can_teach = true);

-- Only authenticated users can see full teacher availability
CREATE POLICY "Authenticated users can view teacher availability" 
ON public.teacher_availability 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Add audit logging for sensitive operations
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id text,
  ip_address inet,
  user_agent text,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" 
ON public.security_audit_log 
FOR SELECT 
USING (public.is_admin());

-- System can insert audit logs
CREATE POLICY "System can insert audit logs" 
ON public.security_audit_log 
FOR INSERT 
WITH CHECK (true);