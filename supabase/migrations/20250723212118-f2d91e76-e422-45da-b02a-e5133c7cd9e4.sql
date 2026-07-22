-- Phase 1: Critical Security & Database Fixes

-- Fix 1: Add missing RLS policies for community tables
CREATE POLICY "Community event participants can view events" 
ON public.community_events 
FOR SELECT 
USING (
  community_id IN (
    SELECT community_id 
    FROM community_memberships 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Community moderators can manage events" 
ON public.community_events 
FOR ALL 
USING (
  auth.uid() IN (
    SELECT user_id 
    FROM community_memberships 
    WHERE community_id = community_events.community_id 
      AND role IN ('owner', 'moderator')
  )
);

-- Fix 2: Add missing RLS policies for event participants table (assuming it exists)
-- Note: This table might not exist yet, adding basic structure if needed
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'community_event_participants') THEN
    CREATE TABLE public.community_event_participants (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      event_id UUID REFERENCES public.community_events(id) ON DELETE CASCADE,
      user_id UUID NOT NULL,
      joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      status TEXT DEFAULT 'registered'
    );
    
    ALTER TABLE public.community_event_participants ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Users can view event participants" 
    ON public.community_event_participants 
    FOR SELECT 
    USING (
      event_id IN (
        SELECT id FROM community_events 
        WHERE community_id IN (
          SELECT community_id 
          FROM community_memberships 
          WHERE user_id = auth.uid()
        )
      )
    );
    
    CREATE POLICY "Users can join/leave events" 
    ON public.community_event_participants 
    FOR ALL 
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- Fix 3: Secure all database functions by adding SECURITY DEFINER and proper search path
-- Update critical functions to be more secure

-- Update get_approved_teachers function
CREATE OR REPLACE FUNCTION public.get_approved_teachers()
RETURNS TABLE(
  id uuid, 
  user_id uuid, 
  full_name text, 
  bio text, 
  video_url text, 
  profile_image_url text, 
  specializations text[], 
  accent text, 
  languages_spoken text[], 
  years_experience integer, 
  rating numeric, 
  total_reviews integer, 
  hourly_rate_dzd integer, 
  hourly_rate_eur integer, 
  timezone text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    tp.id,
    tp.user_id,
    u.full_name,
    tp.bio,
    tp.video_url,
    tp.profile_image_url,
    tp.specializations,
    tp.accent,
    tp.languages_spoken,
    tp.years_experience,
    tp.rating,
    tp.total_reviews,
    tp.hourly_rate_dzd,
    tp.hourly_rate_eur,
    tp.timezone
  FROM public.teacher_profiles tp
  JOIN public.users u ON tp.user_id = u.id
  WHERE tp.profile_complete = true 
    AND tp.can_teach = true 
    AND tp.is_available = true;
END;
$function$;

-- Update student XP function
CREATE OR REPLACE FUNCTION public.update_student_xp(student_uuid uuid, xp_to_add integer)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  current_record RECORD;
  new_total_xp INTEGER;
  new_level INTEGER;
  new_xp_in_level INTEGER;
  level_up BOOLEAN := FALSE;
  xp_per_level CONSTANT INTEGER := 500;
BEGIN
  -- Get current XP record or create if doesn't exist
  SELECT * INTO current_record FROM public.student_xp WHERE student_id = student_uuid;
  
  IF current_record IS NULL THEN
    INSERT INTO public.student_xp (student_id, total_xp, current_level, xp_in_current_level)
    VALUES (student_uuid, xp_to_add, 1, xp_to_add)
    RETURNING * INTO current_record;
    
    new_total_xp := xp_to_add;
    new_level := 1;
    new_xp_in_level := xp_to_add;
  ELSE
    new_total_xp := current_record.total_xp + xp_to_add;
    new_xp_in_level := current_record.xp_in_current_level + xp_to_add;
    new_level := current_record.current_level;
    
    -- Check for level up
    WHILE new_xp_in_level >= xp_per_level LOOP
      new_xp_in_level := new_xp_in_level - xp_per_level;
      new_level := new_level + 1;
      level_up := TRUE;
    END LOOP;
    
    -- Update the record
    UPDATE public.student_xp 
    SET 
      total_xp = new_total_xp,
      current_level = new_level,
      xp_in_current_level = new_xp_in_level,
      last_activity_date = CURRENT_DATE,
      updated_at = now()
    WHERE student_id = student_uuid;
  END IF;
  
  RETURN jsonb_build_object(
    'total_xp', new_total_xp,
    'current_level', new_level,
    'xp_in_current_level', new_xp_in_level,
    'level_up', level_up,
    'xp_added', xp_to_add
  );
END;
$function$;

-- Update lesson access function
CREATE OR REPLACE FUNCTION public.can_access_lesson(room_uuid text, user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  lesson_record RECORD;
  current_time TIMESTAMPTZ := NOW();
BEGIN
  -- Find the lesson by room_id
  SELECT * INTO lesson_record
  FROM public.lessons
  WHERE room_id = room_uuid;
  
  -- Return false if lesson doesn't exist
  IF lesson_record IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if user is the teacher or student for this lesson
  IF lesson_record.teacher_id = user_uuid OR lesson_record.student_id = user_uuid THEN
    -- Allow access 10 minutes before scheduled time and up to 2 hours after
    IF current_time >= (lesson_record.scheduled_at - INTERVAL '10 minutes') 
       AND current_time <= (lesson_record.scheduled_at + INTERVAL '2 hours') THEN
      RETURN TRUE;
    END IF;
  END IF;
  
  RETURN FALSE;
END;
$function$;