-- Update the lessons table INSERT policy to allow both teachers and students to create lessons
DROP POLICY IF EXISTS "Teachers can create lessons" ON public.lessons;

-- Create updated policy that allows both teachers and students to create lessons
CREATE POLICY "Teachers and students can create lessons" ON public.lessons
FOR INSERT 
WITH CHECK (auth.uid() = teacher_id OR auth.uid() = student_id);