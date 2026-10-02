-- Learning path: advancing stays inside the student's CEFR level. When the
-- student finishes the last lesson published at their level so far, the
-- pointer stays on it and last_completed_lesson_id = current_lesson_id
-- ("waiting"); the next lesson published at that level is picked up
-- automatically (activeCoreLessonResolver, LearningPathTab).
alter table public.student_lesson_pointers
  add column if not exists last_completed_lesson_id uuid
  references public.curriculum_lessons(id) on delete set null;

comment on column public.student_lesson_pointers.last_completed_lesson_id is
  'Last lesson finished. When equal to current_lesson_id the student finished everything published at their level and is waiting; the next lesson published at that level is picked up automatically.';
