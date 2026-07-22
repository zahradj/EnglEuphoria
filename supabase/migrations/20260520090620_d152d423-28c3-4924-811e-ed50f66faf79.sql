
-- =====================================================================
-- STORYBOOK CREATOR — FOUNDATION SCHEMA
-- =====================================================================

-- Helper enums
DO $$ BEGIN
  CREATE TYPE public.storybook_status AS ENUM ('draft','published','archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.storybook_page_type AS ENUM (
    'narration','dialogue','illustration','interaction',
    'reflection','vocab_spotlight','speaking_checkpoint','comprehension'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.library_status AS ENUM ('locked','unlocked','reading','completed','favorite');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.reading_session_mode AS ENUM ('solo','classroom');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =====================================================================
-- storybooks
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.storybooks (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title           text NOT NULL,
  hub             text NOT NULL CHECK (hub IN ('playground','academy','success')),
  cefr_level      text NOT NULL,
  unit_id         uuid,
  status          public.storybook_status NOT NULL DEFAULT 'draft',
  published       boolean NOT NULL DEFAULT false,
  cover_image_url text,
  story_arc       jsonb NOT NULL DEFAULT '{}'::jsonb,
  vocabulary_targets   jsonb NOT NULL DEFAULT '[]'::jsonb,
  grammar_targets      jsonb NOT NULL DEFAULT '[]'::jsonb,
  communication_goals  jsonb NOT NULL DEFAULT '[]'::jsonb,
  audio_layer     jsonb NOT NULL DEFAULT '{}'::jsonb,
  adaptive_state  jsonb NOT NULL DEFAULT '{}'::jsonb,
  qa_report       jsonb,
  created_by      uuid NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_storybooks_hub ON public.storybooks(hub);
CREATE INDEX IF NOT EXISTS idx_storybooks_published ON public.storybooks(published) WHERE published = true;
CREATE INDEX IF NOT EXISTS idx_storybooks_created_by ON public.storybooks(created_by);

-- =====================================================================
-- storybook_chapters
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.storybook_chapters (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id          uuid NOT NULL REFERENCES public.storybooks(id) ON DELETE CASCADE,
  order_index      integer NOT NULL,
  title            text NOT NULL,
  summary          text,
  learning_objective text,
  audio_url        text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (book_id, order_index)
);
CREATE INDEX IF NOT EXISTS idx_storybook_chapters_book ON public.storybook_chapters(book_id);

-- =====================================================================
-- storybook_pages
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.storybook_pages (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id      uuid NOT NULL REFERENCES public.storybook_chapters(id) ON DELETE CASCADE,
  order_index     integer NOT NULL,
  page_type       public.storybook_page_type NOT NULL,
  content         jsonb NOT NULL DEFAULT '{}'::jsonb,
  illustration_url text,
  audio_url       text,
  interactive_data jsonb,
  vocab_inline    jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (chapter_id, order_index)
);
CREATE INDEX IF NOT EXISTS idx_storybook_pages_chapter ON public.storybook_pages(chapter_id);

-- =====================================================================
-- cast_vault_characters
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.cast_vault_characters (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hub               text NOT NULL CHECK (hub IN ('playground','academy','success')),
  name              text NOT NULL,
  role              text,
  personality_traits jsonb NOT NULL DEFAULT '{}'::jsonb,
  visual_blueprint  jsonb NOT NULL DEFAULT '{}'::jsonb,
  voice_id          text,
  avatar_url        text,
  signature_traits  jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_shared         boolean NOT NULL DEFAULT false,
  created_by        uuid NOT NULL,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_cast_vault_hub ON public.cast_vault_characters(hub);
CREATE INDEX IF NOT EXISTS idx_cast_vault_created_by ON public.cast_vault_characters(created_by);

-- =====================================================================
-- storybook_character_bindings
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.storybook_character_bindings (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id       uuid NOT NULL REFERENCES public.storybooks(id) ON DELETE CASCADE,
  character_id  uuid NOT NULL REFERENCES public.cast_vault_characters(id) ON DELETE CASCADE,
  role_in_story text,
  arc_notes     text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (book_id, character_id)
);
CREATE INDEX IF NOT EXISTS idx_sbcb_book ON public.storybook_character_bindings(book_id);

-- =====================================================================
-- student_library
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.student_library (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id       uuid NOT NULL,
  book_id          uuid NOT NULL REFERENCES public.storybooks(id) ON DELETE CASCADE,
  status           public.library_status NOT NULL DEFAULT 'unlocked',
  unlocked_at      timestamptz,
  last_page_id     uuid,
  reading_progress numeric NOT NULL DEFAULT 0,
  unlock_reason    text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, book_id)
);
CREATE INDEX IF NOT EXISTS idx_student_library_student ON public.student_library(student_id);

-- =====================================================================
-- storybook_reading_sessions
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.storybook_reading_sessions (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id        uuid NOT NULL,
  book_id           uuid NOT NULL REFERENCES public.storybooks(id) ON DELETE CASCADE,
  mode              public.reading_session_mode NOT NULL DEFAULT 'solo',
  started_at        timestamptz NOT NULL DEFAULT now(),
  ended_at          timestamptz,
  pages_read        integer NOT NULL DEFAULT 0,
  words_read        integer NOT NULL DEFAULT 0,
  fluency_wpm       numeric,
  comprehension_score numeric,
  vocab_attempts    jsonb NOT NULL DEFAULT '[]'::jsonb,
  speaking_attempts jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at        timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_srs_student ON public.storybook_reading_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_srs_book ON public.storybook_reading_sessions(book_id);

-- =====================================================================
-- storybook_continuity
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.storybook_continuity (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id          uuid NOT NULL,
  hub                 text NOT NULL CHECK (hub IN ('playground','academy','success')),
  recurring_characters jsonb NOT NULL DEFAULT '[]'::jsonb,
  world_state         jsonb NOT NULL DEFAULT '{}'::jsonb,
  last_emotional_beat jsonb,
  story_history       jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, hub)
);

-- =====================================================================
-- updated_at trigger
-- =====================================================================
CREATE OR REPLACE FUNCTION public.tg_storybook_touch_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

DO $$ BEGIN
  CREATE TRIGGER tg_storybooks_updated BEFORE UPDATE ON public.storybooks
    FOR EACH ROW EXECUTE FUNCTION public.tg_storybook_touch_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER tg_storybook_chapters_updated BEFORE UPDATE ON public.storybook_chapters
    FOR EACH ROW EXECUTE FUNCTION public.tg_storybook_touch_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER tg_storybook_pages_updated BEFORE UPDATE ON public.storybook_pages
    FOR EACH ROW EXECUTE FUNCTION public.tg_storybook_touch_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER tg_cast_vault_updated BEFORE UPDATE ON public.cast_vault_characters
    FOR EACH ROW EXECUTE FUNCTION public.tg_storybook_touch_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER tg_student_library_updated BEFORE UPDATE ON public.student_library
    FOR EACH ROW EXECUTE FUNCTION public.tg_storybook_touch_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =====================================================================
-- RLS
-- =====================================================================
ALTER TABLE public.storybooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storybook_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storybook_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cast_vault_characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storybook_character_bindings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storybook_reading_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storybook_continuity ENABLE ROW LEVEL SECURITY;

-- storybooks
CREATE POLICY "storybooks_read_published_or_staff"
  ON public.storybooks FOR SELECT
  USING (
    published = true
    OR created_by = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'content_creator')
    OR public.has_role(auth.uid(), 'teacher')
  );

CREATE POLICY "storybooks_insert_creator_or_admin"
  ON public.storybooks FOR INSERT
  WITH CHECK (
    created_by = auth.uid()
    AND (public.has_role(auth.uid(), 'content_creator') OR public.has_role(auth.uid(), 'admin'))
  );

CREATE POLICY "storybooks_update_owner_or_admin"
  ON public.storybooks FOR UPDATE
  USING (created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "storybooks_delete_owner_or_admin"
  ON public.storybooks FOR DELETE
  USING (created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- chapters / pages — visibility follows book
CREATE POLICY "storybook_chapters_read"
  ON public.storybook_chapters FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.storybooks b WHERE b.id = book_id AND (
      b.published = true OR b.created_by = auth.uid()
      OR public.has_role(auth.uid(), 'admin')
      OR public.has_role(auth.uid(), 'content_creator')
      OR public.has_role(auth.uid(), 'teacher')
    )
  ));

CREATE POLICY "storybook_chapters_write"
  ON public.storybook_chapters FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.storybooks b WHERE b.id = book_id AND (b.created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.storybooks b WHERE b.id = book_id AND (b.created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  ));

CREATE POLICY "storybook_pages_read"
  ON public.storybook_pages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.storybook_chapters c
    JOIN public.storybooks b ON b.id = c.book_id
    WHERE c.id = chapter_id AND (
      b.published = true OR b.created_by = auth.uid()
      OR public.has_role(auth.uid(), 'admin')
      OR public.has_role(auth.uid(), 'content_creator')
      OR public.has_role(auth.uid(), 'teacher')
    )
  ));

CREATE POLICY "storybook_pages_write"
  ON public.storybook_pages FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.storybook_chapters c
    JOIN public.storybooks b ON b.id = c.book_id
    WHERE c.id = chapter_id AND (b.created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.storybook_chapters c
    JOIN public.storybooks b ON b.id = c.book_id
    WHERE c.id = chapter_id AND (b.created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  ));

-- cast vault
CREATE POLICY "cast_vault_read_shared_or_own"
  ON public.cast_vault_characters FOR SELECT
  USING (
    is_shared = true
    OR created_by = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "cast_vault_insert_creator_or_admin"
  ON public.cast_vault_characters FOR INSERT
  WITH CHECK (
    created_by = auth.uid()
    AND (public.has_role(auth.uid(), 'content_creator') OR public.has_role(auth.uid(), 'admin'))
  );

CREATE POLICY "cast_vault_update_owner_or_admin"
  ON public.cast_vault_characters FOR UPDATE
  USING (created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "cast_vault_delete_owner_or_admin"
  ON public.cast_vault_characters FOR DELETE
  USING (created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- bindings
CREATE POLICY "sbcb_read"
  ON public.storybook_character_bindings FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.storybooks b WHERE b.id = book_id AND (
      b.published = true OR b.created_by = auth.uid()
      OR public.has_role(auth.uid(), 'admin')
      OR public.has_role(auth.uid(), 'content_creator')
      OR public.has_role(auth.uid(), 'teacher')
    )
  ));

CREATE POLICY "sbcb_write"
  ON public.storybook_character_bindings FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.storybooks b WHERE b.id = book_id AND (b.created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.storybooks b WHERE b.id = book_id AND (b.created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  ));

-- student library
CREATE POLICY "student_library_own_or_teacher_or_admin"
  ON public.student_library FOR SELECT
  USING (
    student_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
    OR EXISTS (
      SELECT 1 FROM public.class_bookings cb
      WHERE cb.student_id = student_library.student_id AND cb.teacher_id = auth.uid()
    )
  );

CREATE POLICY "student_library_insert_own"
  ON public.student_library FOR INSERT
  WITH CHECK (student_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "student_library_update_own"
  ON public.student_library FOR UPDATE
  USING (student_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "student_library_delete_own"
  ON public.student_library FOR DELETE
  USING (student_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- reading sessions
CREATE POLICY "srs_select_own_or_teacher_or_admin"
  ON public.storybook_reading_sessions FOR SELECT
  USING (
    student_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
    OR EXISTS (
      SELECT 1 FROM public.class_bookings cb
      WHERE cb.student_id = storybook_reading_sessions.student_id AND cb.teacher_id = auth.uid()
    )
  );

CREATE POLICY "srs_insert_own"
  ON public.storybook_reading_sessions FOR INSERT
  WITH CHECK (student_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "srs_update_own"
  ON public.storybook_reading_sessions FOR UPDATE
  USING (student_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- continuity
CREATE POLICY "sb_continuity_select_own_or_teacher_or_admin"
  ON public.storybook_continuity FOR SELECT
  USING (
    student_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
    OR EXISTS (
      SELECT 1 FROM public.class_bookings cb
      WHERE cb.student_id = storybook_continuity.student_id AND cb.teacher_id = auth.uid()
    )
  );

CREATE POLICY "sb_continuity_upsert_own"
  ON public.storybook_continuity FOR INSERT
  WITH CHECK (student_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "sb_continuity_update_own"
  ON public.storybook_continuity FOR UPDATE
  USING (student_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
