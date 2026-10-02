-- Trial class: the teacher sets the student's level (TrialLevelPicker, and
-- the end-of-class handoff). Saves it everywhere in one call: a
-- 'trial_lesson' placement_results row (dashboard level), student_profiles
-- and users cefr_level, the learning-path pointer (student_lesson_pointers →
-- that level's Unit 1 Lesson 1 for the booking's hub) and, unless
-- p_only_if_unset, pins the booking to that lesson so the class reloads
-- into it. SECURITY DEFINER because placement_results / student_profiles /
-- users are only writable by the student themselves under RLS; access is
-- checked here (the booking's teacher, or an admin).
create or replace function public.set_trial_level(p_booking_id uuid, p_cefr text, p_only_if_unset boolean default false)
returns jsonb language plpgsql security definer set search_path = public as $$
declare b record; v_level text; v_hub text; v_targets text[]; v_lesson uuid; v_key text; v_n int;
begin
  select id, teacher_id, student_id, hub_type into b from class_bookings where id = p_booking_id;
  if not found then raise exception 'booking not found'; end if;
  if auth.uid() is null or (auth.uid() <> b.teacher_id and not has_role(auth.uid(), 'admin'::app_role)) then raise exception 'not allowed'; end if;
  v_key := upper(translate(coalesce(p_cefr, ''), ' _-', ''));
  v_level := case v_key when 'PREA1' then 'Pre-A1' when 'A1' then 'A1' when 'A2' then 'A2' when 'B1' then 'B1' when 'B2' then 'B2' when 'C1' then 'C1' when 'C2' then 'C2' else null end;
  if v_level is null then raise exception 'unknown level %', p_cefr; end if;
  v_hub := case lower(coalesce(b.hub_type, '')) when 'playground' then 'playground' when 'kids' then 'playground' when 'success' then 'success' when 'professional' then 'success' when 'adult' then 'success' when 'adults' then 'success' else 'academy' end;
  v_targets := case v_hub when 'playground' then array['playground','kids'] when 'success' then array['success','professional','adult','adults'] else array['academy','teen','teens'] end;
  if p_only_if_unset and exists (select 1 from placement_results where student_id = b.student_id and method = 'trial_lesson') then return jsonb_build_object('skipped', true); end if;
  select id into v_lesson from curriculum_lessons where target_system = any(v_targets) and is_published and lower(slot_cefr_level) = lower(v_level) and slot_unit_number::text = '1' and slot_lesson_number::text = '1' order by id limit 1;
  update placement_results set cefr_level = v_level, hub = v_hub, created_at = now() where student_id = b.student_id and method = 'trial_lesson';
  get diagnostics v_n = row_count;
  if v_n = 0 then insert into placement_results (student_id, method, cefr_level, hub) values (b.student_id, 'trial_lesson', v_level, v_hub); end if;
  update student_profiles set cefr_level = v_level, final_cefr_level = v_level where user_id = b.student_id;
  update users set cefr_level = v_level where id = b.student_id;
  if v_lesson is not null then
    insert into student_lesson_pointers (student_id, current_lesson_id, updated_by, updated_at) values (b.student_id, v_lesson, auth.uid(), now())
      on conflict (student_id) do update set current_lesson_id = excluded.current_lesson_id, updated_by = excluded.updated_by, updated_at = now();
    if not p_only_if_unset then update class_bookings set curriculum_lesson_id = v_lesson, lesson_id = null where id = b.id; end if;
  end if;
  return jsonb_build_object('level', v_level, 'hub', v_hub, 'lesson_id', v_lesson, 'student_id', b.student_id);
end; $$;
revoke all on function public.set_trial_level(uuid, text, boolean) from public;
grant execute on function public.set_trial_level(uuid, text, boolean) to authenticated;
