
-- Create tables for teacher journey workflow

-- Equipment and internet test results
CREATE TABLE public.teacher_equipment_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES teacher_applications(id) ON DELETE CASCADE,
  microphone_test BOOLEAN DEFAULT false,
  speaker_test BOOLEAN DEFAULT false,
  webcam_test BOOLEAN DEFAULT false,
  screen_sharing_test BOOLEAN DEFAULT false,
  download_speed NUMERIC, -- Mbps
  upload_speed NUMERIC, -- Mbps
  ping_latency INTEGER, -- ms
  overall_passed BOOLEAN DEFAULT false,
  test_completed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Interview scheduling
CREATE TABLE public.teacher_interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES teacher_applications(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration INTEGER DEFAULT 20, -- minutes
  interviewer_id UUID REFERENCES users(id),
  interview_type VARCHAR(50) DEFAULT 'video_call',
  status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
  interview_notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  approved BOOLEAN DEFAULT false,
  zoom_link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teacher onboarding steps tracking
CREATE TABLE public.teacher_onboarding_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES teacher_applications(id) ON DELETE CASCADE,
  step_name VARCHAR(100) NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  data JSONB, -- Store step-specific data
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Update teacher_applications to track current stage
ALTER TABLE public.teacher_applications 
ADD COLUMN IF NOT EXISTS current_stage VARCHAR(50) DEFAULT 'application_submitted',
ADD COLUMN IF NOT EXISTS intro_video_approved BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS documents_approved BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS equipment_test_passed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS interview_passed BOOLEAN DEFAULT false;

-- Add check constraint for valid stages
ALTER TABLE public.teacher_applications 
ADD CONSTRAINT valid_current_stage 
CHECK (current_stage IN (
  'application_submitted', 
  'documents_review', 
  'equipment_test', 
  'interview_scheduled', 
  'interview_completed', 
  'final_review', 
  'approved', 
  'rejected'
));

-- Enable RLS on new tables
ALTER TABLE public.teacher_equipment_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_onboarding_progress ENABLE ROW LEVEL SECURITY;

-- RLS policies for teacher_equipment_tests
CREATE POLICY "Applicants can view their own equipment tests" 
  ON public.teacher_equipment_tests FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.teacher_applications 
      WHERE teacher_applications.id = teacher_equipment_tests.application_id 
      AND teacher_applications.email = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "Applicants can insert their own equipment tests" 
  ON public.teacher_equipment_tests FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.teacher_applications 
      WHERE teacher_applications.id = teacher_equipment_tests.application_id 
      AND teacher_applications.email = auth.jwt() ->> 'email'
    )
  );

-- RLS policies for teacher_interviews
CREATE POLICY "Applicants can view their own interviews" 
  ON public.teacher_interviews FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.teacher_applications 
      WHERE teacher_applications.id = teacher_interviews.application_id 
      AND teacher_applications.email = auth.jwt() ->> 'email'
    )
  );

-- RLS policies for teacher_onboarding_progress
CREATE POLICY "Applicants can view their own onboarding progress" 
  ON public.teacher_onboarding_progress FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.teacher_applications 
      WHERE teacher_applications.id = teacher_onboarding_progress.application_id 
      AND teacher_applications.email = auth.jwt() ->> 'email'
    )
  );

-- Admin policies for all tables
CREATE POLICY "Admins can manage equipment tests" 
  ON public.teacher_equipment_tests FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage interviews" 
  ON public.teacher_interviews FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage onboarding progress" 
  ON public.teacher_onboarding_progress FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Function to update teacher application stage
CREATE OR REPLACE FUNCTION public.update_teacher_application_stage()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-update stage based on completed steps
  IF NEW.equipment_test_passed = true AND OLD.equipment_test_passed = false THEN
    NEW.current_stage = 'interview_scheduled';
  ELSIF NEW.interview_passed = true AND OLD.interview_passed = false THEN
    NEW.current_stage = 'final_review';
  END IF;
  
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic stage updates
CREATE TRIGGER update_teacher_stage_trigger
  BEFORE UPDATE ON public.teacher_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_teacher_application_stage();
