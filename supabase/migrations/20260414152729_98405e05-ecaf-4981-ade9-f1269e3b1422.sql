-- Also add low_rating_alert which is used by notify_admin_low_rating trigger
ALTER TABLE public.admin_notifications DROP CONSTRAINT IF EXISTS admin_notifications_notification_type_check;

ALTER TABLE public.admin_notifications ADD CONSTRAINT admin_notifications_notification_type_check 
CHECK (notification_type = ANY (ARRAY[
  'new_student'::text, 
  'new_teacher'::text, 
  'lesson_booked'::text, 
  'payment_received'::text, 
  'system_alert'::text,
  'teacher_pending_approval'::text,
  'low_rating_alert'::text
]));