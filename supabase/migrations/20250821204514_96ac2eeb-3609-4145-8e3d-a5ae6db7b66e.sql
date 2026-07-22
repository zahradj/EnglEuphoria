-- Add RLS policies for lessons_content table to allow public read access and authenticated user write access

-- Policy for viewing lessons (public read access)
CREATE POLICY "Anyone can view active lessons" 
ON public.lessons_content 
FOR SELECT 
USING (is_active = true);

-- Policy for creating lessons (authenticated users)
CREATE POLICY "Authenticated users can create lessons" 
ON public.lessons_content 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Policy for updating lessons (lesson creators and authenticated users)
CREATE POLICY "Authenticated users can update lessons" 
ON public.lessons_content 
FOR UPDATE 
USING (auth.role() = 'authenticated');

-- Policy for deleting lessons (authenticated users only)
CREATE POLICY "Authenticated users can delete lessons" 
ON public.lessons_content 
FOR DELETE 
USING (auth.role() = 'authenticated');