-- First delete lesson payments referencing the test lesson
DELETE FROM public.lesson_payments
WHERE lesson_id = 'fe68f2d9-f077-4ce2-87ba-2298826b902f';

-- Delete lesson participants
DELETE FROM public.lesson_participants
WHERE lesson_id = 'fe68f2d9-f077-4ce2-87ba-2298826b902f';

-- Delete package redemptions
DELETE FROM public.package_lesson_redemptions
WHERE lesson_id = 'fe68f2d9-f077-4ce2-87ba-2298826b902f';

-- Delete class_bookings
DELETE FROM public.class_bookings
WHERE student_id = '162ffaf0-6188-49c0-b8fa-2381b562aa22';

-- Delete appointments  
DELETE FROM public.appointments
WHERE student_id = '162ffaf0-6188-49c0-b8fa-2381b562aa22';

-- Reset availability slots
UPDATE public.teacher_availability
SET is_booked = false, student_id = NULL, lesson_id = NULL, lesson_title = NULL
WHERE student_id = '162ffaf0-6188-49c0-b8fa-2381b562aa22'
   OR lesson_id = 'fe68f2d9-f077-4ce2-87ba-2298826b902f';

-- Now delete the lesson
DELETE FROM public.lessons
WHERE id = 'fe68f2d9-f077-4ce2-87ba-2298826b902f';