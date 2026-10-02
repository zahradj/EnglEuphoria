-- Level adjustments: set directly only in the student's trial lesson.
-- Afterwards a teacher sends a level change request; an admin approves
-- (which applies it) or rejects it.

-- The trial-level save writes method 'trial_lesson', and an approved
-- request writes 'level_adjustment'; the old check only allowed the
-- placement test's two methods, so every trial save failed.
alter table public.placement_results
  drop constraint if exists placement_results_method_check,
  add constraint placement_results_method_check
    check (method = any (array['beginner_bypass','lean_cat','trial_lesson','level_adjustment']));

-- Which trial booking set the level (re-saving within that same trial
-- class stays allowed; any other class needs a request).
alter table public.student_prior_knowledge add column if not exists set_in_booking uuid;

-- level_change_requests already exists (20260916144338: teacher_id,
-- admin_id, admin_notes, resolved_at). Add what the path needs: where the
-- student should start in the requested level, the teacher's unit marks,
-- the hub and the class it was sent from.
alter table public.level_change_requests
  add column if not exists booking_id uuid,
  add column if not exists hub text,
  add column if not exists requested_start_unit int not null default 1,
  add column if not exists unit_marks jsonb not null default '{}'::jsonb;
create index if not exists level_change_requests_status_idx on public.level_change_requests (status, created_at desc);

-- Path pointer guard: only the trial save, an approved request or an admin
-- may move a student's path into a different level.
create or replace function public._guard_pointer_level() returns trigger
language plpgsql security definer set search_path = public as $$
declare o record; n record;
begin
  if tg_op <> 'UPDATE' or new.current_lesson_id is not distinct from old.current_lesson_id then return new; end if;
  if coalesce(current_setting('app.level_change_ok', true), '') = '1' then return new; end if;
  if auth.uid() is not null and has_role(auth.uid(), 'admin'::app_role) then return new; end if;
  select target_system, slot_cefr_level into o from curriculum_lessons where id = old.current_lesson_id;
  select target_system, slot_cefr_level into n from curriculum_lessons where id = new.current_lesson_id;
  if o.slot_cefr_level is not null and n.slot_cefr_level is not null
     and _cefr_key(o.slot_cefr_level) <> _cefr_key(n.slot_cefr_level) then
    raise exception 'Changing a student''s level needs an approved level change request';
  end if;
  return new;
end $$;
do $$ begin
  create trigger guard_pointer_level before update on public.student_lesson_pointers
    for each row execute function public._guard_pointer_level();
exception when duplicate_object then null; end $$;

-- Shared: apply a level + start unit to a student (no permission checks —
-- callers check). Writes placement (method), profile, users, prior
-- knowledge and the path pointer. Returns the start slot.
create or replace function public._apply_student_level(
  p_student uuid, p_hub text, p_level text, p_start_unit int, p_marks jsonb,
  p_method text, p_booking uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_targets text[]; v_slot record; v_n int; v_start int;
begin
  v_targets := _hub_targets(p_hub);
  v_start := greatest(1, least(coalesce(p_start_unit, 1), 10));
  perform set_config('app.level_change_ok', '1', true);

  if p_method = 'trial_lesson' then
    update placement_results set cefr_level = p_level, hub = p_hub, created_at = now()
      where student_id = p_student and method = 'trial_lesson';
    get diagnostics v_n = row_count;
    if v_n = 0 then insert into placement_results (student_id, method, cefr_level, hub) values (p_student, 'trial_lesson', p_level, p_hub); end if;
  else
    insert into placement_results (student_id, method, cefr_level, hub) values (p_student, p_method, p_level, p_hub);
  end if;
  update student_profiles set cefr_level = p_level, final_cefr_level = p_level where user_id = p_student;
  update users set cefr_level = p_level where id = p_student;

  insert into student_prior_knowledge (student_id, hub, cefr_level, start_unit, unit_marks, set_by, set_in_booking, updated_at)
    values (p_student, p_hub, p_level, v_start, coalesce(p_marks, '{}'::jsonb), auth.uid(), p_booking, now())
    on conflict (student_id) do update set hub = excluded.hub, cefr_level = excluded.cefr_level,
      start_unit = excluded.start_unit, unit_marks = excluded.unit_marks, set_by = excluded.set_by,
      set_in_booking = coalesce(excluded.set_in_booking, student_prior_knowledge.set_in_booking), updated_at = now();

  select s.id, s.u, s.l, s.is_published into v_slot from _level_slots(v_targets, p_level) s
    where s.u >= v_start order by s.u, s.l limit 1;
  if v_slot.id is not null then
    insert into student_lesson_pointers (student_id, current_lesson_id, last_completed_lesson_id, updated_by, updated_at)
      values (p_student, v_slot.id, null, auth.uid(), now())
      on conflict (student_id) do update set current_lesson_id = excluded.current_lesson_id,
        last_completed_lesson_id = null, updated_by = excluded.updated_by, updated_at = now();
  end if;
  perform set_config('app.level_change_ok', '', true);
  return jsonb_build_object('start_unit', v_start, 'pointer_id', v_slot.id, 'u', v_slot.u, 'l', v_slot.l,
    'start_built', coalesce(v_slot.is_published, false));
end $$;
revoke all on function public._apply_student_level(uuid, text, text, int, jsonb, text, uuid) from public, authenticated;

-- Trial save: only in a trial booking, and only the trial class that first
-- set the level (re-saves within it are fine). Admins always.
create or replace function public.set_trial_start(
  p_booking_id uuid, p_cefr text, p_start_unit int default 1,
  p_marks jsonb default null, p_only_if_unset boolean default false)
returns jsonb language plpgsql security definer set search_path = public as $$
declare b record; v_level text; v_hub text; v_targets text[]; v_res jsonb; v_teach uuid; v_prior record; v_admin boolean;
begin
  select id, teacher_id, student_id, hub_type, booking_type into b from class_bookings where id = p_booking_id;
  if not found then raise exception 'booking not found'; end if;
  v_admin := auth.uid() is not null and has_role(auth.uid(), 'admin'::app_role);
  if auth.uid() is null or (auth.uid() <> b.teacher_id and not v_admin) then raise exception 'not allowed'; end if;
  v_level := case _cefr_key(p_cefr) when 'PREA1' then 'Pre-A1' when 'A1' then 'A1' when 'A2' then 'A2' when 'B1' then 'B1'
    when 'B2' then 'B2' when 'C1' then 'C1' when 'C2' then 'C2' else null end;
  if v_level is null then raise exception 'unknown level %', p_cefr; end if;

  if p_only_if_unset and exists (select 1 from placement_results where student_id = b.student_id and method = 'trial_lesson') then
    return jsonb_build_object('skipped', true);
  end if;
  if not v_admin then
    if lower(coalesce(b.booking_type, '')) <> 'trial' then
      raise exception 'The level can only be set in the trial lesson. Send a level change request instead.';
    end if;
    select set_in_booking into v_prior from student_prior_knowledge where student_id = b.student_id;
    if found and v_prior.set_in_booking is not null and v_prior.set_in_booking <> b.id then
      raise exception 'This student''s level was already set in their trial lesson. Send a level change request instead.';
    end if;
  end if;

  v_hub := case when 'kids' = any(_hub_targets(b.hub_type)) then 'playground'
    when 'adult' = any(_hub_targets(b.hub_type)) then 'success' else 'academy' end;
  v_targets := _hub_targets(v_hub);
  v_res := _apply_student_level(b.student_id, v_hub, v_level, p_start_unit, p_marks, 'trial_lesson', b.id);

  -- Lesson to teach now: the start lesson if built, else the latest built
  -- lesson before it, else the level's first built lesson.
  if (v_res->>'start_built')::boolean then v_teach := (v_res->>'pointer_id')::uuid;
  else
    select s.id into v_teach from _level_slots(v_targets, v_level) s
      where s.is_published and (v_res->>'pointer_id' is null or (s.u, s.l) < ((v_res->>'u')::int, (v_res->>'l')::int))
      order by s.u desc, s.l desc limit 1;
    if v_teach is null then
      select s.id into v_teach from _level_slots(v_targets, v_level) s where s.is_published order by s.u, s.l limit 1;
    end if;
  end if;
  if not p_only_if_unset and v_teach is not null then
    update class_bookings set curriculum_lesson_id = v_teach, lesson_id = null where id = b.id;
  end if;

  return jsonb_build_object('level', v_level, 'hub', v_hub, 'start_unit', (v_res->>'start_unit')::int,
    'pointer_id', v_res->>'pointer_id', 'start_built', (v_res->>'start_built')::boolean,
    'lesson_id', v_teach, 'student_id', b.student_id);
end $$;
revoke all on function public.set_trial_start(uuid, text, int, jsonb, boolean) from public;
grant execute on function public.set_trial_start(uuid, text, int, jsonb, boolean) to authenticated;

-- Teacher: ask for a level change (any of their students, any class).
create or replace function public.request_level_change(
  p_student uuid, p_level text, p_start_unit int, p_marks jsonb, p_reason text, p_booking uuid default null)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_level text; v_hub text; v_cur text; v_id uuid;
begin
  if not _can_manage_student(p_student) then raise exception 'not allowed'; end if;
  if coalesce(trim(p_reason), '') = '' then raise exception 'Please give a reason'; end if;
  v_level := case _cefr_key(p_level) when 'PREA1' then 'Pre-A1' when 'A1' then 'A1' when 'A2' then 'A2' when 'B1' then 'B1'
    when 'B2' then 'B2' when 'C1' then 'C1' when 'C2' then 'C2' else null end;
  if v_level is null then raise exception 'unknown level %', p_level; end if;
  select coalesce(pk.hub, sp.hub_type), coalesce(sp.final_cefr_level, pk.cefr_level)
    into v_hub, v_cur
    from (select 1) x
    left join student_prior_knowledge pk on pk.student_id = p_student
    left join student_profiles sp on sp.user_id = p_student;
  if v_hub = 'professional' then v_hub := 'success'; end if;
  if v_hub is null and p_booking is not null then
    select case when 'kids' = any(_hub_targets(hub_type)) then 'playground'
      when 'adult' = any(_hub_targets(hub_type)) then 'success' else 'academy' end
      into v_hub from class_bookings where id = p_booking;
  end if;
  -- One open request per student: a new one replaces the teacher's pending one.
  update level_change_requests set status = 'rejected', admin_notes = 'Replaced by a newer request', resolved_at = now()
    where student_id = p_student and teacher_id = auth.uid() and status = 'pending';
  insert into level_change_requests (student_id, teacher_id, booking_id, hub, current_level, requested_level,
      requested_start_unit, unit_marks, reason)
    values (p_student, auth.uid(), p_booking, v_hub, v_cur, v_level,
      greatest(1, least(coalesce(p_start_unit, 1), 10)), coalesce(p_marks, '{}'::jsonb), trim(p_reason))
    returning id into v_id;
  return v_id;
end $$;
revoke all on function public.request_level_change(uuid, text, int, jsonb, text, uuid) from public;
grant execute on function public.request_level_change(uuid, text, int, jsonb, text, uuid) to authenticated;

-- Admin: approve (applies the change) or reject.
create or replace function public.review_level_change(p_request uuid, p_approve boolean, p_note text default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare r record; v_res jsonb;
begin
  if auth.uid() is null or not has_role(auth.uid(), 'admin'::app_role) then raise exception 'not allowed'; end if;
  select * into r from level_change_requests where id = p_request for update;
  if not found then raise exception 'request not found'; end if;
  if r.status <> 'pending' then raise exception 'This request was already %', r.status; end if;
  if p_approve then
    v_res := _apply_student_level(r.student_id, coalesce(r.hub, 'academy'), r.requested_level, r.requested_start_unit,
      r.unit_marks, 'level_adjustment', null);
  end if;
  update level_change_requests set status = case when p_approve then 'approved' else 'rejected' end,
    admin_id = auth.uid(), resolved_at = now(), admin_notes = nullif(trim(coalesce(p_note, '')), '')
    where id = p_request;
  return jsonb_build_object('status', case when p_approve then 'approved' else 'rejected' end, 'applied', v_res);
end $$;
revoke all on function public.review_level_change(uuid, boolean, text) from public;
grant execute on function public.review_level_change(uuid, boolean, text) to authenticated;

-- Notifications (bell): admins on a new request; the teacher when it's
-- approved or rejected.
create or replace function public._notify_level_request() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_student text;
begin
  select coalesce(full_name, email, 'a student') into v_student from users where id = new.student_id;
  if tg_op = 'INSERT' and new.status = 'pending' then
    insert into notifications (user_id, title, content, type, action_url)
      select ur.user_id, 'Level change request',
        format('%s → %s%s for %s: %s', coalesce(new.current_level, 'unset'), new.requested_level,
          case when new.requested_start_unit > 1 then ' · Unit ' || new.requested_start_unit else '' end,
          v_student, left(coalesce(new.reason, ''), 140)),
        'admin_alert', '/super-admin?tab=students'
      from user_roles ur where ur.role = 'admin'::app_role;
  elsif tg_op = 'UPDATE' and old.status = 'pending' and new.status in ('approved','rejected')
        and coalesce(new.admin_notes, '') <> 'Replaced by a newer request' then
    insert into notifications (user_id, title, content, type)
      values (new.teacher_id,
        case when new.status = 'approved' then 'Level change approved' else 'Level change not approved' end,
        format('%s → %s for %s%s', coalesce(new.current_level, 'unset'), new.requested_level, v_student,
          case when coalesce(new.admin_notes, '') <> '' then ' — ' || new.admin_notes else '' end),
        'level_change');
  end if;
  return new;
end $$;
do $$ begin
  create trigger notify_level_request after insert or update on public.level_change_requests
    for each row execute function public._notify_level_request();
exception when duplicate_object then null; end $$;
