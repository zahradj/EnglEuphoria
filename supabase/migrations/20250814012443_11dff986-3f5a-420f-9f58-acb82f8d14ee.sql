-- Create curriculum generation tables

-- Generated curriculums storage
CREATE TABLE public.generated_curriculums (
  id TEXT PRIMARY KEY,
  level TEXT NOT NULL CHECK (level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  total_pages INTEGER NOT NULL,
  estimated_study_time INTEGER NOT NULL, -- in hours
  neuroscientific_features TEXT[] NOT NULL,
  progression_map JSONB NOT NULL,
  curriculum_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT true
);

-- Student curriculum progress tracking
CREATE TABLE public.student_curriculum_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id),
  curriculum_id TEXT NOT NULL REFERENCES public.generated_curriculums(id),
  current_week INTEGER DEFAULT 1,
  current_lesson INTEGER DEFAULT 1,
  completion_percentage NUMERIC(5,2) DEFAULT 0.00,
  vocabulary_mastered TEXT[] DEFAULT '{}',
  grammar_patterns_learned TEXT[] DEFAULT '{}',
  conversation_milestones_achieved TEXT[] DEFAULT '{}',
  neuroscience_scores JSONB DEFAULT '{}',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, curriculum_id)
);

-- Individual lesson completions
CREATE TABLE public.lesson_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id),
  curriculum_id TEXT NOT NULL REFERENCES public.generated_curriculums(id),
  lesson_id TEXT NOT NULL,
  week_number INTEGER NOT NULL,
  lesson_number INTEGER NOT NULL,
  pages_completed INTEGER DEFAULT 0,
  total_pages INTEGER DEFAULT 20,
  vocabulary_learned TEXT[] DEFAULT '{}',
  grammar_practiced TEXT[] DEFAULT '{}',
  conversation_time_seconds INTEGER DEFAULT 0,
  neuroscience_engagement_score INTEGER CHECK (neuroscience_engagement_score BETWEEN 1 AND 5),
  memory_consolidation_score INTEGER CHECK (memory_consolidation_score BETWEEN 1 AND 5),
  attention_optimization_score INTEGER CHECK (attention_optimization_score BETWEEN 1 AND 5),
  completion_data JSONB DEFAULT '{}',
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, curriculum_id, lesson_id)
);

-- Weekly assessments and progress
CREATE TABLE public.weekly_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id),
  curriculum_id TEXT NOT NULL REFERENCES public.generated_curriculums(id),
  week_number INTEGER NOT NULL,
  theme TEXT NOT NULL,
  conversation_duration_seconds INTEGER DEFAULT 0,
  vocabulary_accuracy_percentage NUMERIC(5,2) DEFAULT 0.00,
  grammar_accuracy_percentage NUMERIC(5,2) DEFAULT 0.00,
  sentence_construction_score INTEGER CHECK (sentence_construction_score BETWEEN 1 AND 10),
  conversation_fluency_score INTEGER CHECK (conversation_fluency_score BETWEEN 1 AND 10),
  neuroscience_retention_score INTEGER CHECK (neuroscience_retention_score BETWEEN 1 AND 10),
  assessment_data JSONB DEFAULT '{}',
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, curriculum_id, week_number)
);

-- Enable RLS on all tables
ALTER TABLE public.generated_curriculums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_curriculum_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_assessments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for generated_curriculums
CREATE POLICY "Anyone can view active curriculums" 
ON public.generated_curriculums 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Authenticated users can create curriculums" 
ON public.generated_curriculums 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can update their curriculums" 
ON public.generated_curriculums 
FOR UPDATE 
USING (auth.uid() = created_by);

-- RLS Policies for student_curriculum_progress
CREATE POLICY "Students can view their own progress" 
ON public.student_curriculum_progress 
FOR SELECT 
USING (auth.uid() = student_id);

CREATE POLICY "Students can update their own progress" 
ON public.student_curriculum_progress 
FOR ALL 
USING (auth.uid() = student_id);

-- RLS Policies for lesson_completions
CREATE POLICY "Students can view their own lesson completions" 
ON public.lesson_completions 
FOR SELECT 
USING (auth.uid() = student_id);

CREATE POLICY "Students can create their own lesson completions" 
ON public.lesson_completions 
FOR INSERT 
WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update their own lesson completions" 
ON public.lesson_completions 
FOR UPDATE 
USING (auth.uid() = student_id);

-- RLS Policies for weekly_assessments
CREATE POLICY "Students can view their own assessments" 
ON public.weekly_assessments 
FOR SELECT 
USING (auth.uid() = student_id);

CREATE POLICY "Students can create their own assessments" 
ON public.weekly_assessments 
FOR INSERT 
WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update their own assessments" 
ON public.weekly_assessments 
FOR UPDATE 
USING (auth.uid() = student_id);

-- Indexes for performance
CREATE INDEX idx_curriculum_progress_student ON public.student_curriculum_progress(student_id);
CREATE INDEX idx_curriculum_progress_curriculum ON public.student_curriculum_progress(curriculum_id);
CREATE INDEX idx_lesson_completions_student ON public.lesson_completions(student_id);
CREATE INDEX idx_lesson_completions_curriculum ON public.lesson_completions(curriculum_id);
CREATE INDEX idx_weekly_assessments_student ON public.weekly_assessments(student_id);
CREATE INDEX idx_weekly_assessments_curriculum ON public.weekly_assessments(curriculum_id);

-- Functions for curriculum analytics
CREATE OR REPLACE FUNCTION public.get_student_curriculum_analytics(p_student_id UUID, p_curriculum_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'overall_progress', COALESCE(scp.completion_percentage, 0),
    'current_week', COALESCE(scp.current_week, 1),
    'current_lesson', COALESCE(scp.current_lesson, 1),
    'vocabulary_mastered_count', COALESCE(array_length(scp.vocabulary_mastered, 1), 0),
    'grammar_patterns_count', COALESCE(array_length(scp.grammar_patterns_learned, 1), 0),
    'conversation_milestones_count', COALESCE(array_length(scp.conversation_milestones_achieved, 1), 0),
    'lessons_completed', COALESCE(lessons_stats.completed_count, 0),
    'total_study_time_hours', COALESCE(lessons_stats.total_study_time, 0),
    'average_engagement_score', COALESCE(lessons_stats.avg_engagement, 0),
    'average_memory_score', COALESCE(lessons_stats.avg_memory, 0),
    'average_attention_score', COALESCE(lessons_stats.avg_attention, 0),
    'weeks_assessed', COALESCE(assessment_stats.weeks_assessed, 0),
    'average_conversation_fluency', COALESCE(assessment_stats.avg_conversation_fluency, 0),
    'average_sentence_construction', COALESCE(assessment_stats.avg_sentence_construction, 0)
  ) INTO result
  FROM public.student_curriculum_progress scp
  LEFT JOIN (
    SELECT 
      COUNT(*) as completed_count,
      ROUND(AVG(conversation_time_seconds) / 3600.0, 2) as total_study_time,
      ROUND(AVG(neuroscience_engagement_score), 2) as avg_engagement,
      ROUND(AVG(memory_consolidation_score), 2) as avg_memory,
      ROUND(AVG(attention_optimization_score), 2) as avg_attention
    FROM public.lesson_completions 
    WHERE student_id = p_student_id AND curriculum_id = p_curriculum_id
  ) lessons_stats ON true
  LEFT JOIN (
    SELECT 
      COUNT(*) as weeks_assessed,
      ROUND(AVG(conversation_fluency_score), 2) as avg_conversation_fluency,
      ROUND(AVG(sentence_construction_score), 2) as avg_sentence_construction
    FROM public.weekly_assessments 
    WHERE student_id = p_student_id AND curriculum_id = p_curriculum_id
  ) assessment_stats ON true
  WHERE scp.student_id = p_student_id AND scp.curriculum_id = p_curriculum_id;

  RETURN COALESCE(result, '{}'::jsonb);
END;
$$;