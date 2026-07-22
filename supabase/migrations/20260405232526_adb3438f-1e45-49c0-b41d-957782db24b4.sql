-- Make bucket public for getPublicUrl() to work
UPDATE storage.buckets SET public = true WHERE id = 'teacher-certificates';

-- Add UPDATE policy for photo re-upload (upsert)
CREATE POLICY "Teachers can update their own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'teacher-certificates'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Add DELETE policy for certificate removal
CREATE POLICY "Teachers can delete their own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'teacher-certificates'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Fix trigger to handle INSERT (OLD is NULL)
CREATE OR REPLACE FUNCTION public.update_teacher_profile_completion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.profile_complete = (
    NEW.bio IS NOT NULL AND NEW.bio != '' AND
    NEW.video_url IS NOT NULL AND NEW.video_url != ''
  );
  RETURN NEW;
END;
$function$;