DELETE FROM public.class_bookings
WHERE status = 'pending'
  AND (booking_type = 'trial' OR price_paid = 0);