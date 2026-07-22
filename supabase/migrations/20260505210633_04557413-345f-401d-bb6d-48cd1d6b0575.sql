
CREATE TABLE public.classroom_states (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id text NOT NULL UNIQUE,
  lesson_id uuid,
  teacher_id uuid NOT NULL,
  current_slide_index int NOT NULL DEFAULT 0,
  active_media_state jsonb NOT NULL DEFAULT '{"playing":false,"position":0}'::jsonb,
  student_rewards int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.classroom_states ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view classroom states"
  ON public.classroom_states FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Teachers can create classroom states"
  ON public.classroom_states FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update their classroom states"
  ON public.classroom_states FOR UPDATE
  TO authenticated
  USING (auth.uid() = teacher_id)
  WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can delete their classroom states"
  ON public.classroom_states FOR DELETE
  TO authenticated
  USING (auth.uid() = teacher_id);

CREATE TRIGGER update_classroom_states_updated_at
  BEFORE UPDATE ON public.classroom_states
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.classroom_states REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.classroom_states;
