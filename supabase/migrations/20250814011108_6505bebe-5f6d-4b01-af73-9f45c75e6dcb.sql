-- Add placement test completion tracking to student_profiles
ALTER TABLE public.student_profiles 
ADD COLUMN placement_test_completed_at timestamp with time zone NULL,
ADD COLUMN placement_test_score integer NULL,
ADD COLUMN placement_test_total integer NULL;

-- Create function to save placement test results
CREATE OR REPLACE FUNCTION public.save_placement_test_result(
  p_user_id uuid,
  p_cefr_level text,
  p_score integer,
  p_total integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update student profile with test results
  UPDATE public.student_profiles 
  SET 
    cefr_level = p_cefr_level,
    placement_test_completed_at = now(),
    placement_test_score = p_score,
    placement_test_total = p_total,
    updated_at = now()
  WHERE user_id = p_user_id;
  
  -- If no profile exists, create one
  IF NOT FOUND THEN
    INSERT INTO public.student_profiles (
      user_id, 
      cefr_level, 
      placement_test_completed_at,
      placement_test_score,
      placement_test_total
    )
    VALUES (
      p_user_id, 
      p_cefr_level, 
      now(),
      p_score,
      p_total
    );
  END IF;
  
  RETURN true;
END;
$$;