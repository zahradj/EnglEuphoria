CREATE OR REPLACE FUNCTION public.get_global_skill_averages()
RETURNS TABLE(skill_name text, avg_score numeric)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = 'public'
AS $$
  SELECT skill_name::text, ROUND(AVG(current_score), 1)::numeric
  FROM student_skills
  GROUP BY skill_name;
$$;