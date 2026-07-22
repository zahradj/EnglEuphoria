INSERT INTO public.student_credits (student_id, total_credits)
VALUES ('162ffaf0-6188-49c0-b8fa-2381b562aa22', 100)
ON CONFLICT (student_id) DO UPDATE
SET total_credits = student_credits.total_credits + 100, updated_at = now();