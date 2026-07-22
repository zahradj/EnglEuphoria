-- Security fix: make lesson_library_view use invoker rights (avoid security-definer view)
ALTER VIEW public.lesson_library_view SET (security_invoker = true);