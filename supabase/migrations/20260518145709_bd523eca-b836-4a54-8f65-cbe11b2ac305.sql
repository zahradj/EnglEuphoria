create table if not exists public.pedagogical_quality_reports (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null,
  student_id uuid null,
  verdicts jsonb not null default '[]'::jsonb,
  metrics jsonb not null default '{}'::jsonb,
  repairs_applied jsonb not null default '[]'::jsonb,
  final_verdict text not null check (final_verdict in ('pass','repair','block')),
  created_at timestamptz not null default now()
);
create index if not exists pqr_lesson_created_idx on public.pedagogical_quality_reports (lesson_id, created_at desc);
create index if not exists pqr_student_created_idx on public.pedagogical_quality_reports (student_id, created_at desc);
alter table public.pedagogical_quality_reports enable row level security;
create policy "pqr_admin_read" on public.pedagogical_quality_reports for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "pqr_content_creator_read" on public.pedagogical_quality_reports for select to authenticated using (public.has_role(auth.uid(), 'content_creator'));
create policy "pqr_service_write" on public.pedagogical_quality_reports for insert to service_role with check (true);

create table if not exists public.curriculum_stabilization_signals (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null,
  signal_type text not null check (signal_type in ('skill_imbalance','activity_fatigue','learner_fatigue','hub_drift')),
  payload jsonb not null default '{}'::jsonb,
  consumed_at timestamptz null,
  created_at timestamptz not null default now()
);
create index if not exists css_student_unconsumed_idx on public.curriculum_stabilization_signals (student_id, consumed_at nulls first, created_at desc);
alter table public.curriculum_stabilization_signals enable row level security;
create policy "css_self_select" on public.curriculum_stabilization_signals for select to authenticated using (student_id = auth.uid());
create policy "css_admin_read" on public.curriculum_stabilization_signals for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "css_service_write" on public.curriculum_stabilization_signals for insert to service_role with check (true);
create policy "css_service_update" on public.curriculum_stabilization_signals for update to service_role using (true) with check (true);