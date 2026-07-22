DO $$
BEGIN
  -- Delete lesson payments first
  DELETE FROM public.lesson_payments WHERE lesson_id IN (SELECT id FROM public.lessons WHERE teacher_id IN (SELECT id FROM public.users WHERE role != 'admin'));
  DELETE FROM public.lesson_payments WHERE student_id IN (SELECT id FROM public.users WHERE role != 'admin');
  
  -- Delete payments (uses student_id)
  DELETE FROM public.payments WHERE student_id IN (SELECT id FROM public.users WHERE role != 'admin');
  
  -- Delete lessons
  DELETE FROM public.lessons WHERE teacher_id IN (SELECT id FROM public.users WHERE role != 'admin');
  DELETE FROM public.lessons WHERE student_id IN (SELECT id FROM public.users WHERE role != 'admin');
  
  -- Delete class bookings
  DELETE FROM public.class_bookings WHERE student_id IN (SELECT id FROM public.users WHERE role != 'admin');
  DELETE FROM public.class_bookings WHERE teacher_id IN (SELECT id FROM public.users WHERE role != 'admin');
  
  -- Delete teacher profiles
  DELETE FROM public.teacher_profiles WHERE user_id IN (SELECT id FROM public.users WHERE role != 'admin');
  
  -- Delete student achievements
  DELETE FROM public.student_achievements WHERE student_id IN (SELECT id FROM public.users WHERE role != 'admin');
  
  -- Delete certificates
  DELETE FROM public.certificates WHERE student_id IN (SELECT id FROM public.users WHERE role != 'admin');
  
  -- Delete AI sessions
  DELETE FROM public.ai_tutoring_sessions WHERE student_id IN (SELECT id FROM public.users WHERE role != 'admin');
  DELETE FROM public.ai_learning_events WHERE student_id IN (SELECT id FROM public.users WHERE role != 'admin');
  DELETE FROM public.ai_learning_models WHERE student_id IN (SELECT id FROM public.users WHERE role != 'admin');
  DELETE FROM public.ai_lessons WHERE user_id IN (SELECT id FROM public.users WHERE role != 'admin');
  
  -- Delete subscriptions
  DELETE FROM public.user_subscriptions WHERE user_id IN (SELECT id FROM public.users WHERE role != 'admin');
  
  -- Delete notifications
  DELETE FROM public.notifications WHERE user_id IN (SELECT id FROM public.users WHERE role != 'admin');
  DELETE FROM public.admin_notifications WHERE admin_id IN (SELECT id FROM public.users WHERE role != 'admin');
  
  -- Delete user_roles
  DELETE FROM public.user_roles WHERE user_id IN (SELECT id FROM public.users WHERE role != 'admin');
  
  -- Finally delete users
  DELETE FROM public.users WHERE role != 'admin';
END $$;