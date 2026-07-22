CREATE OR REPLACE FUNCTION public.submit_teacher_application(p_payload jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  app public.teacher_applications;
  new_id uuid;
BEGIN
  -- Strip caller-controlled admin/review fields defensively.
  p_payload := p_payload
    - 'id'
    - 'created_at'
    - 'updated_at'
    - 'admin_notes'
    - 'user_id'
    - 'status'
    - 'current_stage'
    - 'intro_video_approved'
    - 'documents_approved'
    - 'equipment_test_passed'
    - 'interview_passed'
    - 'interview_invite_token'
    - 'interview_invite_sent_at'
    - 'reviewer_id'
    - 'reviewed_at'
    - 'interviewed_by'
    - 'interview_feedback'
    - 'last_contact_date'
    - 'contact_notes'
    - 'rejection_reason';

  app := jsonb_populate_record(NULL::public.teacher_applications, p_payload);

  IF NULLIF(BTRIM(app.first_name), '') IS NULL
    OR NULLIF(BTRIM(app.last_name), '') IS NULL
    OR NULLIF(BTRIM(app.email), '') IS NULL THEN
    RAISE EXCEPTION 'First name, last name, and email are required';
  END IF;

  INSERT INTO public.teacher_applications (
    first_name,
    last_name,
    email,
    phone,
    address,
    date_of_birth,
    nationality,
    education,
    certifications,
    teaching_experience_years,
    previous_roles,
    skills,
    languages_spoken,
    esl_certification,
    teaching_methodology,
    age_groups_experience,
    cv_url,
    cover_letter,
    portfolio_url,
    availability,
    preferred_age_groups,
    preferred_schedule,
    salary_expectation,
    professional_references,
    bio,
    teaching_philosophy,
    classroom_management,
    video_description,
    motivation,
    hub_preference,
    market_region,
    grammar_test_status,
    grammar_score
  ) VALUES (
    app.first_name,
    app.last_name,
    LOWER(app.email),
    app.phone,
    app.address,
    app.date_of_birth,
    app.nationality,
    app.education,
    app.certifications,
    COALESCE(app.teaching_experience_years, 0),
    app.previous_roles,
    app.skills,
    app.languages_spoken,
    app.esl_certification,
    app.teaching_methodology,
    app.age_groups_experience,
    app.cv_url,
    app.cover_letter,
    app.portfolio_url,
    app.availability,
    app.preferred_age_groups,
    app.preferred_schedule,
    app.salary_expectation,
    app.professional_references,
    app.bio,
    app.teaching_philosophy,
    app.classroom_management,
    app.video_description,
    app.motivation,
    app.hub_preference,
    COALESCE(app.market_region, 'INTL'::public.market_region),
    COALESCE(app.grammar_test_status, 'not_started'),
    app.grammar_score
  )
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_teacher_application(jsonb) TO anon;
GRANT EXECUTE ON FUNCTION public.submit_teacher_application(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_teacher_application(jsonb) TO service_role;