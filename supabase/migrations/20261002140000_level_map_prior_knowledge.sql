-- Level map + prior knowledge + blueprint-ordered learning path.
--
-- Every level has 10 units in the curriculum blueprint (the pre-seeded
-- curriculum_lessons slots, published or "Coming Soon"). The learning path
-- walks those slots strictly in order (unit, then lesson). The pointer may
-- sit on a slot that isn't built yet: the class then reviews the latest
-- built lesson before it, and the slot opens automatically once a lesson
-- is published there (matched by level/unit/lesson, not by row id).
-- In the trial the teacher marks which units the student already knows;
-- the path starts at the first unit not known.

create or replace function public._cefr_key(t text) returns text
language sql immutable as $$ select upper(translate(coalesce(t, ''), ' _-', '')) $$;

create or replace function public._int_or_null(t text) returns int
language sql immutable as $$ select case when t ~ '^\s*\d+\s*$' then trim(t)::int end $$;

create or replace function public._hub_targets(p_hub text) returns text[]
language sql immutable as $$
  select case lower(coalesce(p_hub, ''))
    when 'playground' then array['playground','kids']
    when 'kids' then array['playground','kids']
    when 'success' then array['success','professional','adult','adults']
    when 'professional' then array['success','professional','adult','adults']
    when 'adult' then array['success','professional','adult','adults']
    when 'adults' then array['success','professional','adult','adults']
    else array['academy','teen','teens'] end
$$;

-- One row per blueprint slot (published row preferred when a slot has duplicates).
create or replace function public._level_slots(p_targets text[], p_cefr text)
returns table(id uuid, u int, l int, is_published boolean, title text, unit_title text)
language sql stable security definer set search_path = public as $$
  select distinct on (_int_or_null(slot_unit_number), _int_or_null(slot_lesson_number))
    id, _int_or_null(slot_unit_number), _int_or_null(slot_lesson_number), is_published,
    regexp_replace(title, '\s*·\s*Coming Soon\s*$', ''),
    coalesce(ai_metadata->>'unit_title', ai_metadata->>'unit_theme')
  from curriculum_lessons
  where target_system = any(p_targets)
    and _cefr_key(slot_cefr_level) = _cefr_key(p_cefr)
    and _int_or_null(slot_unit_number) is not null
    and _int_or_null(slot_lesson_number) is not null
  order by _int_or_null(slot_unit_number), _int_or_null(slot_lesson_number),
           is_published desc, updated_at desc nulls last
$$;
revoke all on function public._level_slots(text[], text) from public;

-- The level map for a hub + level: 10 units, each with its lesson slots.
create or replace function public.get_level_map(p_hub text, p_cefr text)
returns table(unit_number int, unit_title text, lessons jsonb)
language sql stable security definer set search_path = public as $$
  with s as (select * from _level_slots(_hub_targets(p_hub), p_cefr))
  select s.u,
    (select mode() within group (order by s2.unit_title) from s s2 where s2.u = s.u and s2.unit_title is not null),
    jsonb_agg(jsonb_build_object('lesson', s.l, 'title', s.title, 'id', s.id, 'published', s.is_published) order by s.l)
  from s group by s.u order by s.u
$$;
revoke all on function public.get_level_map(text, text) from public;
grant execute on function public.get_level_map(text, text) to authenticated;

-- What the teacher marked in the trial (and can adjust later).
create table if not exists public.student_prior_knowledge (
  student_id uuid primary key,
  hub text,
  cefr_level text,
  start_unit int not null default 1,
  unit_marks jsonb not null default '{}'::jsonb,
  set_by uuid,
  updated_at timestamptz not null default now()
);
alter table public.student_prior_knowledge enable row level security;
grant select on public.student_prior_knowledge to authenticated;
do $$ begin
  create policy "Students read own prior knowledge" on public.student_prior_knowledge
    for select to authenticated using (student_id = auth.uid());
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "Teachers read their students prior knowledge" on public.student_prior_knowledge
    for select to authenticated using (
      has_role(auth.uid(), 'admin'::app_role) or exists (
        select 1 from class_bookings cb where cb.student_id = student_prior_knowledge.student_id and cb.teacher_id = auth.uid()));
exception when duplicate_object then null; end $$;

create or replace function public._can_manage_student(p_student uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select auth.uid() is not null and (
    has_role(auth.uid(), 'admin'::app_role)
    or exists (select 1 from class_bookings where student_id = p_student and teacher_id = auth.uid()))
$$;

-- Which lesson to teach for the student's path pointer.
-- mode: current (built lesson at the pointer), review (pointer slot not
-- built yet → latest built lesson before it), level_complete, none.
create or replace function public.resolve_student_lesson(p_student uuid)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare v_ptr uuid; v_last uuid; r record; v_targets text[]; v_pub uuid; v_review uuid; v_u int; v_l int;
begin
  if not (auth.uid() = p_student or _can_manage_student(p_student)) then raise exception 'not allowed'; end if;
  select current_lesson_id, last_completed_lesson_id into v_ptr, v_last from student_lesson_pointers where student_id = p_student;
  if v_ptr is null then return jsonb_build_object('mode', 'none'); end if;
  select target_system, slot_cefr_level, _int_or_null(slot_unit_number) u, _int_or_null(slot_lesson_number) l, is_published
    into r from curriculum_lessons where id = v_ptr;
  if not found or r.u is null or r.l is null then
    return jsonb_build_object('mode', 'current', 'pointer_id', v_ptr, 'lesson_id', case when r.is_published then v_ptr end);
  end if;
  v_targets := _hub_targets(r.target_system); v_u := r.u; v_l := r.l;
  select s.id into v_pub from _level_slots(v_targets, r.slot_cefr_level) s where s.u = v_u and s.l = v_l and s.is_published;
  if v_pub is not null then
    return jsonb_build_object('mode', case when v_last = v_ptr then 'level_complete' else 'current' end,
      'pointer_id', v_ptr, 'lesson_id', v_pub, 'level', r.slot_cefr_level, 'unit', v_u, 'lesson', v_l);
  end if;
  select s.id into v_review from _level_slots(v_targets, r.slot_cefr_level) s
    where s.is_published and (s.u, s.l) < (v_u, v_l) order by s.u desc, s.l desc limit 1;
  return jsonb_build_object('mode', case when v_review is null then 'none' else 'review' end,
    'pointer_id', v_ptr, 'lesson_id', v_review, 'level', r.slot_cefr_level, 'unit', v_u, 'lesson', v_l);
end $$;
revoke all on function public.resolve_student_lesson(uuid) from public;
grant execute on function public.resolve_student_lesson(uuid) to authenticated;

-- After a completed lesson: move to the next blueprint slot at the same
-- level (built or not). Never moves the pointer backwards (e.g. after a
-- review class). Stays put after the level's last slot (level complete).
create or replace function public.advance_student_path(p_student uuid, p_completed uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare c record; p record; v_ptr uuid; v_targets text[]; v_next record; v_new uuid;
begin
  if not _can_manage_student(p_student) then raise exception 'not allowed'; end if;
  select target_system, slot_cefr_level, _int_or_null(slot_unit_number) u, _int_or_null(slot_lesson_number) l
    into c from curriculum_lessons where id = p_completed;
  if not found or c.u is null then return jsonb_build_object('next_id', null); end if;
  v_targets := _hub_targets(c.target_system);
  select s.id, s.u, s.l, s.is_published into v_next from _level_slots(v_targets, c.slot_cefr_level) s
    where (s.u, s.l) > (c.u, c.l) order by s.u, s.l limit 1;
  v_new := coalesce(v_next.id, p_completed);
  select current_lesson_id into v_ptr from student_lesson_pointers where student_id = p_student;
  if v_ptr is not null then
    select target_system, slot_cefr_level, _int_or_null(slot_unit_number) u, _int_or_null(slot_lesson_number) l
      into p from curriculum_lessons where id = v_ptr;
    if found and p.u is not null and _cefr_key(p.slot_cefr_level) = _cefr_key(c.slot_cefr_level)
       and _hub_targets(p.target_system) = v_targets
       and (p.u, p.l) > (coalesce(v_next.u, c.u), coalesce(v_next.l, c.l)) then
      v_new := v_ptr; -- already further ahead
    end if;
  end if;
  insert into student_lesson_pointers (student_id, current_lesson_id, last_completed_lesson_id, updated_by, updated_at)
    values (p_student, v_new, p_completed, auth.uid(), now())
    on conflict (student_id) do update set current_lesson_id = excluded.current_lesson_id,
      last_completed_lesson_id = excluded.last_completed_lesson_id, updated_by = excluded.updated_by, updated_at = now();
  return jsonb_build_object('next_id', v_next.id, 'next_published', v_next.is_published, 'pointer_id', v_new,
    'level_complete', v_next.id is null);
end $$;
revoke all on function public.advance_student_path(uuid, uuid) from public;
grant execute on function public.advance_student_path(uuid, uuid) to authenticated;

-- Trial: level + start unit (from the teacher's prior-knowledge marks).
-- Saves the level everywhere (placement, profile, users), the marks, and
-- points the path at Unit <start>, Lesson 1 of that level. Unless
-- p_only_if_unset, pins this booking to the lesson to teach now.
create or replace function public.set_trial_start(
  p_booking_id uuid, p_cefr text, p_start_unit int default 1,
  p_marks jsonb default null, p_only_if_unset boolean default false)
returns jsonb language plpgsql security definer set search_path = public as $$
declare b record; v_level text; v_key text; v_hub text; v_targets text[]; v_slot record; v_teach uuid; v_n int; v_start int;
begin
  select id, teacher_id, student_id, hub_type into b from class_bookings where id = p_booking_id;
  if not found then raise exception 'booking not found'; end if;
  if auth.uid() is null or (auth.uid() <> b.teacher_id and not has_role(auth.uid(), 'admin'::app_role)) then raise exception 'not allowed'; end if;
  v_key := _cefr_key(p_cefr);
  v_level := case v_key when 'PREA1' then 'Pre-A1' when 'A1' then 'A1' when 'A2' then 'A2' when 'B1' then 'B1'
    when 'B2' then 'B2' when 'C1' then 'C1' when 'C2' then 'C2' else null end;
  if v_level is null then raise exception 'unknown level %', p_cefr; end if;
  v_hub := case when 'kids' = any(_hub_targets(b.hub_type)) then 'playground'
    when 'adult' = any(_hub_targets(b.hub_type)) then 'success' else 'academy' end;
  v_targets := _hub_targets(v_hub);
  v_start := greatest(1, least(coalesce(p_start_unit, 1), 10));
  if p_only_if_unset and exists (select 1 from placement_results where student_id = b.student_id and method = 'trial_lesson') then
    return jsonb_build_object('skipped', true);
  end if;

  update placement_results set cefr_level = v_level, hub = v_hub, created_at = now()
    where student_id = b.student_id and method = 'trial_lesson';
  get diagnostics v_n = row_count;
  if v_n = 0 then insert into placement_results (student_id, method, cefr_level, hub) values (b.student_id, 'trial_lesson', v_level, v_hub); end if;
  update student_profiles set cefr_level = v_level, final_cefr_level = v_level where user_id = b.student_id;
  update users set cefr_level = v_level where id = b.student_id;

  insert into student_prior_knowledge (student_id, hub, cefr_level, start_unit, unit_marks, set_by, updated_at)
    values (b.student_id, v_hub, v_level, v_start, coalesce(p_marks, '{}'::jsonb), auth.uid(), now())
    on conflict (student_id) do update set hub = excluded.hub, cefr_level = excluded.cefr_level,
      start_unit = excluded.start_unit, unit_marks = excluded.unit_marks, set_by = excluded.set_by, updated_at = now();

  -- First slot of the start unit (built or not), else the first slot after it.
  select s.id, s.u, s.l, s.is_published into v_slot from _level_slots(v_targets, v_level) s
    where s.u >= v_start order by s.u, s.l limit 1;
  if v_slot.id is not null then
    insert into student_lesson_pointers (student_id, current_lesson_id, last_completed_lesson_id, updated_by, updated_at)
      values (b.student_id, v_slot.id, null, auth.uid(), now())
      on conflict (student_id) do update set current_lesson_id = excluded.current_lesson_id,
        last_completed_lesson_id = null, updated_by = excluded.updated_by, updated_at = now();
  end if;

  -- Lesson to teach now: the start lesson if built, else the latest built
  -- lesson before it, else the first built lesson of the level.
  if v_slot.is_published then v_teach := v_slot.id;
  else
    select s.id into v_teach from _level_slots(v_targets, v_level) s
      where s.is_published and (v_slot.id is null or (s.u, s.l) < (v_slot.u, v_slot.l)) order by s.u desc, s.l desc limit 1;
    if v_teach is null then
      select s.id into v_teach from _level_slots(v_targets, v_level) s where s.is_published order by s.u, s.l limit 1;
    end if;
  end if;
  if not p_only_if_unset and v_teach is not null then
    update class_bookings set curriculum_lesson_id = v_teach, lesson_id = null where id = b.id;
  end if;

  return jsonb_build_object('level', v_level, 'hub', v_hub, 'start_unit', v_start, 'pointer_id', v_slot.id,
    'start_built', coalesce(v_slot.is_published, false), 'lesson_id', v_teach, 'student_id', b.student_id);
end $$;
revoke all on function public.set_trial_start(uuid, text, int, jsonb, boolean) from public;
grant execute on function public.set_trial_start(uuid, text, int, jsonb, boolean) to authenticated;

-- Level-only entry point (end-of-class handoff): start at Unit 1.
create or replace function public.set_trial_level(p_booking_id uuid, p_cefr text, p_only_if_unset boolean default false)
returns jsonb language sql security definer set search_path = public as $$
  select public.set_trial_start(p_booking_id, p_cefr, 1, null, p_only_if_unset)
$$;
