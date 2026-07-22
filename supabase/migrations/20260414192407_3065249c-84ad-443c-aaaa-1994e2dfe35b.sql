-- Link the lesson to the availability slot
UPDATE public.teacher_availability
SET lesson_id = '73faad7d-1671-48c9-b1fc-2e4417939267'
WHERE id = '60881059-36a9-4e5d-9e53-3db3f44527ef';

-- Clean up orphaned slot (is_booked=true but no student)
UPDATE public.teacher_availability
SET is_booked = false
WHERE id = '55c0e3d8-84ef-4213-9513-89d4e035f420'
AND student_id IS NULL;