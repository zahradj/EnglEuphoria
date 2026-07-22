-- Wipe all future unbooked teacher_availability rows for teachers whose
-- hub_role has been set (these were touched by the realign_availability_to_hub_role
-- trigger and the user did not personally publish them). Booked slots are preserved.
DELETE FROM public.teacher_availability ta
USING public.teacher_profiles tp
WHERE ta.teacher_id = tp.user_id
  AND tp.hub_role IS NOT NULL
  AND ta.start_time > now()
  AND ta.is_booked = false;