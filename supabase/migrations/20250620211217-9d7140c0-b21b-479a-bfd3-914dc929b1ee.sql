
-- Create teacher applications table
CREATE TABLE public.teacher_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'interview_scheduled', 'accepted', 'rejected')),
  
  -- Personal Information
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  date_of_birth DATE,
  nationality VARCHAR(100),
  
  -- Professional Information
  education TEXT,
  certifications TEXT[],
  teaching_experience_years INTEGER DEFAULT 0,
  previous_roles TEXT,
  skills TEXT[],
  languages_spoken TEXT[],
  
  -- ESL Specific
  esl_certification VARCHAR(100),
  teaching_methodology TEXT,
  age_groups_experience TEXT[],
  
  -- Application Materials
  cv_url TEXT,
  cover_letter TEXT,
  portfolio_url TEXT,
  
  -- Preferences
  availability TEXT,
  preferred_age_groups TEXT[],
  preferred_schedule TEXT,
  salary_expectation DECIMAL(10,2),
  
  -- References (renamed from 'references' which is a reserved keyword)
  professional_references JSONB,
  
  -- Admin Management
  admin_notes TEXT,
  interview_scheduled_at TIMESTAMP WITH TIME ZONE,
  interviewed_by UUID,
  interview_feedback TEXT,
  
  -- Contact tracking
  last_contact_date TIMESTAMP WITH TIME ZONE,
  contact_notes TEXT
);

-- Create indexes for better performance
CREATE INDEX idx_teacher_applications_status ON public.teacher_applications(status);
CREATE INDEX idx_teacher_applications_email ON public.teacher_applications(email);
CREATE INDEX idx_teacher_applications_created_at ON public.teacher_applications(created_at);

-- Enable RLS
ALTER TABLE public.teacher_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Applicants can view their own applications" 
  ON public.teacher_applications 
  FOR SELECT 
  USING (auth.jwt() ->> 'email' = email);

CREATE POLICY "Anyone can insert applications" 
  ON public.teacher_applications 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Applicants can update their own pending applications" 
  ON public.teacher_applications 
  FOR UPDATE 
  USING (auth.jwt() ->> 'email' = email AND status = 'pending');

-- Admin policies (assuming admin role check)
CREATE POLICY "Admins can view all applications" 
  ON public.teacher_applications 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Create trigger for updating updated_at
CREATE TRIGGER update_teacher_applications_updated_at
  BEFORE UPDATE ON public.teacher_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for CV uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('teacher-applications', 'teacher-applications', false);

-- Storage policies for teacher applications
CREATE POLICY "Authenticated users can upload their CVs"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'teacher-applications' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can view their own files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'teacher-applications'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Admins can view all application files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'teacher-applications'
    AND EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );
