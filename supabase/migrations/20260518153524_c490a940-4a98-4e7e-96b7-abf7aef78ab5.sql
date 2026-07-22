create table public.lesson_test_runs (
  id uuid primary key default gen_random_uuid(),
  run_label text,
  hub text not null,
  cefr_level text not null,
  lesson_kind text not null,
  blueprint_hash text,
  lesson_id uuid,
  qa_verdict text,
  stab_verdict text,
  detector_failures jsonb not null default '[]'::jsonb,
  overall_verdict text not null check (overall_verdict in ('pass','warn','fail')),
  duration_ms int,
  created_at timestamptz not null default now()
);

create index idx_lesson_test_runs_label on public.lesson_test_runs(run_label);
create index idx_lesson_test_runs_matrix on public.lesson_test_runs(hub, cefr_level, lesson_kind);
create index idx_lesson_test_runs_created on public.lesson_test_runs(created_at desc);

create table public.lesson_test_failures (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.lesson_test_runs(id) on delete cascade,
  category text not null,
  severity text not null check (severity in ('info','warn','error')),
  detector text not null,
  evidence jsonb,
  slide_index int,
  created_at timestamptz not null default now()
);

create index idx_lesson_test_failures_run on public.lesson_test_failures(run_id);
create index idx_lesson_test_failures_category on public.lesson_test_failures(category);

alter table public.lesson_test_runs enable row level security;
alter table public.lesson_test_failures enable row level security;

create policy "Admins and content creators can view test runs"
  on public.lesson_test_runs for select to authenticated
  using (
    public.has_role(auth.uid(), 'admin'::app_role)
    or public.has_role(auth.uid(), 'content_creator'::app_role)
  );

create policy "Admins and content creators can view test failures"
  on public.lesson_test_failures for select to authenticated
  using (
    public.has_role(auth.uid(), 'admin'::app_role)
    or public.has_role(auth.uid(), 'content_creator'::app_role)
  );