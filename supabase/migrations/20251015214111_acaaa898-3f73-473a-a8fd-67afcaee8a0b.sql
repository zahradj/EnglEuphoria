-- Create assessments table for teacher-created formal assessments
CREATE TABLE public.assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assessment_type TEXT NOT NULL CHECK (assessment_type IN ('quiz', 'test', 'exam', 'project', 'assignment')),
  cefr_level TEXT NOT NULL CHECK (cefr_level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  duration_minutes INTEGER,
  passing_score INTEGER NOT NULL DEFAULT 70,
  total_points INTEGER NOT NULL DEFAULT 100,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  due_date TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create assessment questions table
CREATE TABLE public.assessment_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  question_order INTEGER NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'true_false', 'short_answer', 'essay', 'listening', 'speaking')),
  question_text TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 1,
  options JSONB, -- For multiple choice questions
  correct_answer TEXT, -- For auto-gradable questions
  rubric TEXT, -- For manually graded questions
  audio_url TEXT, -- For listening questions
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create assessment submissions table
CREATE TABLE public.assessment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  submitted_at TIMESTAMPTZ,
  graded_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'submitted', 'graded', 'returned')),
  total_score NUMERIC(5,2),
  percentage NUMERIC(5,2),
  passed BOOLEAN,
  time_taken_minutes INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(assessment_id, student_id)
);

-- Create assessment answers table
CREATE TABLE public.assessment_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES public.assessment_submissions(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.assessment_questions(id) ON DELETE CASCADE,
  answer_text TEXT,
  answer_audio_url TEXT, -- For speaking questions
  is_correct BOOLEAN,
  points_earned NUMERIC(5,2),
  feedback TEXT,
  graded_by UUID REFERENCES auth.users(id),
  graded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create certificates table
CREATE TABLE public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES auth.users(id),
  certificate_type TEXT NOT NULL CHECK (certificate_type IN ('completion', 'achievement', 'mastery', 'cefr_level')),
  title TEXT NOT NULL,
  description TEXT,
  cefr_level TEXT CHECK (cefr_level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  certificate_number TEXT NOT NULL UNIQUE,
  verification_code TEXT NOT NULL UNIQUE,
  skills_demonstrated TEXT[],
  hours_completed INTEGER,
  score_achieved NUMERIC(5,2),
  pdf_url TEXT,
  metadata JSONB DEFAULT '{}',
  is_verified BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create certificate templates table
CREATE TABLE public.certificate_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  template_type TEXT NOT NULL CHECK (template_type IN ('completion', 'achievement', 'mastery', 'cefr_level')),
  design_config JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificate_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for assessments
CREATE POLICY "Teachers can manage their own assessments"
  ON public.assessments FOR ALL
  USING (auth.uid() = teacher_id);

CREATE POLICY "Students can view published assessments"
  ON public.assessments FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins can manage all assessments"
  ON public.assessments FOR ALL
  USING (is_user_admin());

-- RLS Policies for assessment_questions
CREATE POLICY "Teachers can manage questions for their assessments"
  ON public.assessment_questions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.assessments 
      WHERE id = assessment_questions.assessment_id 
      AND teacher_id = auth.uid()
    )
  );

CREATE POLICY "Students can view questions from published assessments"
  ON public.assessment_questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.assessments 
      WHERE id = assessment_questions.assessment_id 
      AND is_published = true
    )
  );

-- RLS Policies for assessment_submissions
CREATE POLICY "Students can manage their own submissions"
  ON public.assessment_submissions FOR ALL
  USING (auth.uid() = student_id);

CREATE POLICY "Teachers can view submissions for their assessments"
  ON public.assessment_submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.assessments 
      WHERE id = assessment_submissions.assessment_id 
      AND teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can update submissions for grading"
  ON public.assessment_submissions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.assessments 
      WHERE id = assessment_submissions.assessment_id 
      AND teacher_id = auth.uid()
    )
  );

-- RLS Policies for assessment_answers
CREATE POLICY "Students can manage their own answers"
  ON public.assessment_answers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.assessment_submissions 
      WHERE id = assessment_answers.submission_id 
      AND student_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can view and grade answers"
  ON public.assessment_answers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.assessment_submissions s
      JOIN public.assessments a ON s.assessment_id = a.id
      WHERE s.id = assessment_answers.submission_id 
      AND a.teacher_id = auth.uid()
    )
  );

-- RLS Policies for certificates
CREATE POLICY "Students can view their own certificates"
  ON public.certificates FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Teachers can view certificates they issued"
  ON public.certificates FOR SELECT
  USING (auth.uid() = teacher_id);

CREATE POLICY "Admins can manage all certificates"
  ON public.certificates FOR ALL
  USING (is_user_admin());

CREATE POLICY "Public can verify certificates"
  ON public.certificates FOR SELECT
  USING (true);

-- RLS Policies for certificate_templates
CREATE POLICY "Everyone can view active templates"
  ON public.certificate_templates FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage templates"
  ON public.certificate_templates FOR ALL
  USING (is_user_admin());

-- Create indexes for performance
CREATE INDEX idx_assessments_teacher ON public.assessments(teacher_id);
CREATE INDEX idx_assessments_published ON public.assessments(is_published);
CREATE INDEX idx_assessment_questions_assessment ON public.assessment_questions(assessment_id);
CREATE INDEX idx_assessment_submissions_student ON public.assessment_submissions(student_id);
CREATE INDEX idx_assessment_submissions_assessment ON public.assessment_submissions(assessment_id);
CREATE INDEX idx_assessment_answers_submission ON public.assessment_answers(submission_id);
CREATE INDEX idx_certificates_student ON public.certificates(student_id);
CREATE INDEX idx_certificates_verification ON public.certificates(verification_code);

-- Create function to auto-grade objective questions
CREATE OR REPLACE FUNCTION public.auto_grade_question()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  question_record RECORD;
BEGIN
  -- Get question details
  SELECT * INTO question_record 
  FROM public.assessment_questions 
  WHERE id = NEW.question_id;

  -- Auto-grade if it's an objective question type
  IF question_record.question_type IN ('multiple_choice', 'true_false') THEN
    IF NEW.answer_text = question_record.correct_answer THEN
      NEW.is_correct := true;
      NEW.points_earned := question_record.points;
    ELSE
      NEW.is_correct := false;
      NEW.points_earned := 0;
    END IF;
    NEW.graded_at := now();
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_auto_grade_question
  BEFORE INSERT OR UPDATE ON public.assessment_answers
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_grade_question();

-- Create function to update submission score
CREATE OR REPLACE FUNCTION public.update_submission_score()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_points_earned NUMERIC;
  total_possible_points NUMERIC;
  submission_percentage NUMERIC;
  submission_passed BOOLEAN;
  passing_threshold INTEGER;
BEGIN
  -- Calculate total score
  SELECT COALESCE(SUM(points_earned), 0) INTO total_points_earned
  FROM public.assessment_answers
  WHERE submission_id = NEW.submission_id;

  -- Get total possible points
  SELECT COALESCE(SUM(q.points), 0) INTO total_possible_points
  FROM public.assessment_questions q
  JOIN public.assessment_submissions s ON s.assessment_id = q.assessment_id
  WHERE s.id = NEW.submission_id;

  -- Calculate percentage
  IF total_possible_points > 0 THEN
    submission_percentage := (total_points_earned / total_possible_points) * 100;
  ELSE
    submission_percentage := 0;
  END IF;

  -- Get passing score
  SELECT a.passing_score INTO passing_threshold
  FROM public.assessment_submissions s
  JOIN public.assessments a ON s.assessment_id = a.id
  WHERE s.id = NEW.submission_id;

  -- Determine if passed
  submission_passed := submission_percentage >= passing_threshold;

  -- Update submission
  UPDATE public.assessment_submissions
  SET 
    total_score = total_points_earned,
    percentage = submission_percentage,
    passed = submission_passed,
    updated_at = now()
  WHERE id = NEW.submission_id;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_submission_score
  AFTER INSERT OR UPDATE ON public.assessment_answers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_submission_score();

-- Create function to generate certificate number
CREATE OR REPLACE FUNCTION public.generate_certificate_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.certificate_number := 'CERT-' || 
    EXTRACT(YEAR FROM NEW.issue_date)::TEXT || '-' ||
    LPAD(EXTRACT(MONTH FROM NEW.issue_date)::TEXT, 2, '0') || '-' ||
    SUBSTRING(gen_random_uuid()::TEXT, 1, 8);
  
  NEW.verification_code := UPPER(SUBSTRING(MD5(NEW.id::TEXT || now()::TEXT), 1, 12));
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_generate_certificate_number
  BEFORE INSERT ON public.certificates
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_certificate_number();

-- Create updated_at triggers
CREATE TRIGGER set_updated_at_assessments
  BEFORE UPDATE ON public.assessments
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at_timestamp();

CREATE TRIGGER set_updated_at_submissions
  BEFORE UPDATE ON public.assessment_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at_timestamp();

CREATE TRIGGER set_updated_at_answers
  BEFORE UPDATE ON public.assessment_answers
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at_timestamp();

CREATE TRIGGER set_updated_at_certificates
  BEFORE UPDATE ON public.certificates
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at_timestamp();

CREATE TRIGGER set_updated_at_templates
  BEFORE UPDATE ON public.certificate_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at_timestamp();