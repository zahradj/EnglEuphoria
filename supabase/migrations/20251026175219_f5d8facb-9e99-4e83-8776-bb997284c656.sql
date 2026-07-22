-- Fix generate_room_id function to avoid gen_random_bytes search path issues
-- This replaces the existing function with a more reliable implementation

CREATE OR REPLACE FUNCTION public.generate_room_id()
RETURNS TEXT 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Use built-in gen_random_uuid() which doesn't require extensions
  -- Extract and format the UUID to create a room ID
  RETURN 'room-' || substring(replace(gen_random_uuid()::text, '-', '') from 1 for 16);
END;
$$;

-- Test the function to ensure it works
DO $$
DECLARE
  test_room_id TEXT;
BEGIN
  test_room_id := public.generate_room_id();
  RAISE NOTICE 'Test room ID generated successfully: %', test_room_id;
END $$;