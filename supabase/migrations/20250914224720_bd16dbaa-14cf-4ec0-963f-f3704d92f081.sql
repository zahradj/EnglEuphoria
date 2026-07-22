-- Phase 3 Final: Complete remaining database function security fixes

-- Fix payment and lesson related functions
CREATE OR REPLACE FUNCTION public.process_lesson_completion(lesson_uuid uuid, lesson_status text, failure_reason text DEFAULT NULL::text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  lesson_record RECORD;
  payment_result JSONB;
  student_charge DECIMAL(10,2) := 10.00; -- €10 per lesson
  teacher_payout DECIMAL(10,2) := 4.00;  -- €4 per lesson
  platform_profit DECIMAL(10,2) := 6.00; -- €6 per lesson
BEGIN
  -- Get lesson details
  SELECT * INTO lesson_record FROM public.lessons WHERE id = lesson_uuid;
  
  IF lesson_record IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Lesson not found');
  END IF;
  
  -- Process based on lesson completion status
  IF lesson_status = 'completed' THEN
    -- Successful completion - charge student and pay teacher
    UPDATE public.lessons SET 
      status = 'completed',
      completed_at = NOW(),
      payment_status = 'paid',
      student_charged_amount = student_charge,
      teacher_payout_amount = teacher_payout,
      platform_profit_amount = platform_profit
    WHERE id = lesson_uuid;
    
    -- Create payment record
    INSERT INTO public.lesson_payments (
      lesson_id, student_id, teacher_id, amount_charged, 
      teacher_payout, platform_profit
    ) VALUES (
      lesson_uuid, lesson_record.student_id, lesson_record.teacher_id,
      student_charge, teacher_payout, platform_profit
    );
    
    payment_result := jsonb_build_object(
      'success', true, 
      'student_charged', student_charge,
      'teacher_paid', teacher_payout,
      'status', 'completed'
    );
    
  ELSE
    -- Failed lesson - no charges, record absence/failure
    UPDATE public.lessons SET 
      status = 'cancelled',
      payment_status = 'cancelled',
      cancellation_reason = failure_reason,
      student_charged_amount = 0.00,
      teacher_payout_amount = 0.00,
      platform_profit_amount = 0.00
    WHERE id = lesson_uuid;
    
    -- Record teacher absence/failure
    INSERT INTO public.teacher_absences (
      teacher_id, lesson_id, absence_date, absence_type
    ) VALUES (
      lesson_record.teacher_id, lesson_uuid, NOW(), failure_reason
    );
    
    -- Check for penalty application
    PERFORM public.check_teacher_penalties(lesson_record.teacher_id);
    
    payment_result := jsonb_build_object(
      'success', true,
      'student_charged', 0.00,
      'teacher_paid', 0.00,
      'status', 'cancelled',
      'reason', failure_reason
    );
  END IF;
  
  RETURN payment_result;
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_teacher_penalties(teacher_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  absence_count INTEGER;
  recent_absences INTEGER;
BEGIN
  -- Count absences in the last 30 days
  SELECT COUNT(*) INTO recent_absences
  FROM public.teacher_absences
  WHERE teacher_id = teacher_uuid 
    AND absence_date >= NOW() - INTERVAL '30 days';
  
  -- Apply penalties based on absence count
  IF recent_absences = 1 THEN
    -- First absence - warning only
    INSERT INTO public.teacher_penalties (teacher_id, penalty_type, penalty_amount, notes)
    VALUES (teacher_uuid, 'no_show', 0.00, '1st absence - Warning issued');
    
  ELSIF recent_absences = 2 THEN
    -- Second absence - €10 penalty
    INSERT INTO public.teacher_penalties (teacher_id, penalty_type, penalty_amount, notes)
    VALUES (teacher_uuid, 'repeated_absence', 10.00, '2nd absence in 30 days - €10 penalty');
    
  ELSIF recent_absences >= 3 THEN
    -- Third+ absence - suspension
    INSERT INTO public.teacher_penalties (teacher_id, penalty_type, penalty_amount, notes)
    VALUES (teacher_uuid, 'repeated_absence', 0.00, '3rd+ absence in 30 days - Account suspended');
    
    -- Update teacher profile to suspend account
    UPDATE public.teacher_profiles 
    SET can_teach = false, suspension_reason = 'Multiple absences'
    WHERE user_id = teacher_uuid;
  END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_student_lesson_stats(student_uuid uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  total_booked INTEGER;
  completed_paid INTEGER;
  cancelled_free INTEGER;
  total_spent DECIMAL(10,2);
  total_refunded DECIMAL(10,2);
BEGIN
  -- Get lesson statistics
  SELECT 
    COUNT(*) FILTER (WHERE status IN ('scheduled', 'completed', 'cancelled')),
    COUNT(*) FILTER (WHERE status = 'completed' AND payment_status = 'paid'),
    COUNT(*) FILTER (WHERE status = 'cancelled' AND payment_status = 'cancelled')
  INTO total_booked, completed_paid, cancelled_free
  FROM public.lessons
  WHERE student_id = student_uuid;
  
  -- Get spending totals
  SELECT 
    COALESCE(SUM(amount_charged), 0.00),
    COALESCE(SUM(refund_amount), 0.00)
  INTO total_spent, total_refunded
  FROM public.lesson_payments
  WHERE student_id = student_uuid;
  
  RETURN jsonb_build_object(
    'total_booked', COALESCE(total_booked, 0),
    'completed_paid', COALESCE(completed_paid, 0),
    'cancelled_free', COALESCE(cancelled_free, 0),
    'total_spent', total_spent,
    'total_refunded', total_refunded
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_teacher_earnings_summary(teacher_uuid uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  total_earned DECIMAL(10,2);
  lessons_completed INTEGER;
  pending_penalties DECIMAL(10,2);
  absence_count INTEGER;
  can_teach_status BOOLEAN;
BEGIN
  -- Get earnings
  SELECT 
    COALESCE(SUM(teacher_payout), 0.00),
    COUNT(*)
  INTO total_earned, lessons_completed
  FROM public.lesson_payments
  WHERE teacher_id = teacher_uuid;
  
  -- Get penalties
  SELECT COALESCE(SUM(penalty_amount), 0.00)
  INTO pending_penalties
  FROM public.teacher_penalties
  WHERE teacher_id = teacher_uuid AND resolved = false;
  
  -- Get recent absences
  SELECT COUNT(*)
  INTO absence_count
  FROM public.teacher_absences
  WHERE teacher_id = teacher_uuid 
    AND absence_date >= NOW() - INTERVAL '30 days';
    
  -- Check teaching status
  SELECT COALESCE(can_teach, true)
  INTO can_teach_status
  FROM public.teacher_profiles
  WHERE user_id = teacher_uuid;
  
  RETURN jsonb_build_object(
    'total_earned', total_earned,
    'lessons_completed', lessons_completed,
    'pending_penalties', pending_penalties,
    'recent_absences', absence_count,
    'can_teach', can_teach_status,
    'net_earnings', total_earned - pending_penalties
  );
END;
$function$;