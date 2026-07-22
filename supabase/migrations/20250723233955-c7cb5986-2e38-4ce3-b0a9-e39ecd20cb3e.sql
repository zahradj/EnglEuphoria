-- Keep only the most recent teacher profile for each user and delete duplicates
WITH ranked_profiles AS (
  SELECT id, user_id, 
         ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY updated_at DESC, created_at DESC) as rn
  FROM public.teacher_profiles
),
profiles_to_delete AS (
  SELECT id 
  FROM ranked_profiles 
  WHERE rn > 1
)
DELETE FROM public.teacher_profiles 
WHERE id IN (SELECT id FROM profiles_to_delete);

-- Add unique constraint to prevent future duplicates
ALTER TABLE public.teacher_profiles 
ADD CONSTRAINT teacher_profiles_user_id_unique UNIQUE (user_id);