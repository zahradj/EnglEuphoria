create table if not exists public.intelligence_snapshots (
  student_id uuid not null,
  hub text not null,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (student_id, hub)
);
alter table public.intelligence_snapshots enable row level security;
create policy "Students read own intelligence" on public.intelligence_snapshots for select to authenticated using (student_id = auth.uid());
create policy "Students write own intelligence" on public.intelligence_snapshots for all to authenticated using (student_id = auth.uid()) with check (student_id = auth.uid());
create policy "Admins read all intelligence" on public.intelligence_snapshots for select to authenticated using (public.has_role(auth.uid(), 'admin'));

create table if not exists public.narrative_state (
  student_id uuid not null,
  hub text not null,
  active_characters jsonb not null default '[]'::jsonb,
  current_arc jsonb not null default '{}'::jsonb,
  last_beat jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (student_id, hub)
);
alter table public.narrative_state enable row level security;
create policy "Students read own narrative" on public.narrative_state for select to authenticated using (student_id = auth.uid());
create policy "Students write own narrative" on public.narrative_state for all to authenticated using (student_id = auth.uid()) with check (student_id = auth.uid());
create policy "Admins read all narrative" on public.narrative_state for select to authenticated using (public.has_role(auth.uid(), 'admin'));

create index if not exists idx_intelligence_snapshots_updated on public.intelligence_snapshots(updated_at desc);
create index if not exists idx_narrative_state_updated on public.narrative_state(updated_at desc);

-- Security: classroom_states SELECT — restrict to participants/admins
drop policy if exists "Authenticated users can view classroom states" on public.classroom_states;
create policy "Teachers see own classroom states" on public.classroom_states for select to authenticated using (teacher_id = auth.uid());
create policy "Students see classroom states for their bookings" on public.classroom_states for select to authenticated using (
  exists (select 1 from public.class_bookings b where b.session_id = classroom_states.session_id and b.student_id = auth.uid())
);
create policy "Admins see all classroom states" on public.classroom_states for select to authenticated using (public.has_role(auth.uid(), 'admin'));

-- Security: storage classroom-files SELECT — restrict to owner/participants/admin
drop policy if exists "Authenticated can list classroom files" on storage.objects;
create policy "Owners can list their classroom files" on storage.objects for select to authenticated using (
  bucket_id = 'classroom-files' and (storage.foldername(name))[1] = auth.uid()::text
);
create policy "Booking participants can list classroom files" on storage.objects for select to authenticated using (
  bucket_id = 'classroom-files' and exists (
    select 1 from public.class_bookings b
    where (coalesce(b.classroom_id::text,'') = (storage.foldername(name))[1] or coalesce(b.session_id,'') = (storage.foldername(name))[1])
      and (b.student_id = auth.uid() or b.teacher_id = auth.uid())
  )
);
create policy "Admins can list all classroom files" on storage.objects for select to authenticated using (
  bucket_id = 'classroom-files' and public.has_role(auth.uid(), 'admin')
);