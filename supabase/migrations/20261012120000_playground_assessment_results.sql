-- Playground assessment results (owner-approved plan, 2026-10-12: docs/assessment/prea1-assessment-plan.md).
-- One row per test a child sits: the Pre-A1 Final Test ("Explorer Graduation"), Checkpoint 1 ("Halfway Explorer"),
-- and later the unit Boss Tests. Stores the evidence (every answer, the teacher's speaking rubric, the stars per
-- section) and the decision, so it survives the lesson and the teacher / admin can see it. A move to another level
-- still goes through request_level_change → admin approval; this table never changes a student's level itself.
-- Additive: nothing existing is touched.

create table if not exists public.playground_assessment_results (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id) on delete cascade,
  teacher_id uuid references auth.users(id) on delete set null,
  booking_id uuid,
  test_key text not null,                 -- e.g. 'prea1-final', 'prea1-checkpoint-1', 'prea1-u10-boss'
  level text not null default 'Pre-A1',
  sections jsonb not null default '[]'::jsonb,   -- [{key, label, correct, total, stars}]
  items jsonb not null default '[]'::jsonb,      -- [{section, ask, answer, chosen, correct}]
  rubric jsonb not null default '[]'::jsonb,     -- [{prompt, score 0-3}]
  stars_total int not null default 0,
  stars_max int not null default 0,
  decision text not null,
  teacher_note text,
  level_request_id uuid references public.level_change_requests(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint playground_assessment_results_decision_check
    check (decision in ('ready', 'almost', 'not_yet', 'go_on', 'go_on_support', 'review_first', 'unit_pass', 'unit_practise'))
);

create index if not exists playground_assessment_results_student_idx
  on public.playground_assessment_results (student_id, created_at desc);

alter table public.playground_assessment_results enable row level security;

-- The student's teacher (a booking links them) or an admin records a result.
drop policy if exists "Teachers record assessment results" on public.playground_assessment_results;
create policy "Teachers record assessment results"
  on public.playground_assessment_results for insert to authenticated
  with check (teacher_id = auth.uid() and _can_manage_student(student_id));

-- The student sees their own results; their teachers and admins see them too.
drop policy if exists "Students, their teachers and admins read assessment results" on public.playground_assessment_results;
create policy "Students, their teachers and admins read assessment results"
  on public.playground_assessment_results for select to authenticated
  using (student_id = auth.uid() or _can_manage_student(student_id));
