
DO $$
DECLARE
  lid uuid := '01f9cf17-3ef5-4899-9dba-d0cbe383dfe8';
  c jsonb;
  s jsonb;
  slides jsonb;
  i int;
  word text;
  vocab_words text[] := ARRAY['HEAD','ARM','LEG','BODY','ROBOT'];
  cleanup_slots int[] := ARRAY[12, 13, 15];
  cleanup_prompts text[] := ARRAY[
    'A child-friendly cartoon robot with the HEAD highlighted in Playground orange.',
    'A cute cartoon robot with the BODY highlighted in Playground orange.',
    'Pip the fox celebrating with a cartoon robot, Playground hub flat 2.0 style.'
  ];
BEGIN
  SELECT content INTO c FROM curriculum_lessons WHERE id = lid;
  slides := c->'slides';

  -- 1. Slide 11 (idx 10): fix MCQ options so "head" is the only /ɛ/ word.
  slides := jsonb_set(slides, '{10,options}', '["head","sun","dog","cat"]'::jsonb);

  -- 2. Slides 13, 14, 16 (idx 12, 13, 15): replace dead placeholder.
  FOR i IN 1..array_length(cleanup_slots, 1) LOOP
    s := slides -> cleanup_slots[i];
    s := s - 'image_url';
    s := s || jsonb_build_object(
      'image_prompt', cleanup_prompts[i],
      'needs_image', true
    );
    slides := jsonb_set(slides, ARRAY[cleanup_slots[i]::text], s);
  END LOOP;

  -- 3. Vocab_solo slides (idx 2..6): add image_prompt + needs_image.
  FOR i IN 0..4 LOOP
    word := vocab_words[i+1];
    s := slides -> (i+2);
    s := s || jsonb_build_object(
      'image_prompt', 'A cute child-friendly cartoon robot showing its ' || word ||
                      ', Playground hub flat 2.0 style, bright orange/yellow palette.',
      'needs_image', true
    );
    slides := jsonb_set(slides, ARRAY[(i+2)::text], s);
  END LOOP;

  c := jsonb_set(c, '{slides}', slides);
  UPDATE curriculum_lessons SET content = c, updated_at = now() WHERE id = lid;
END $$;
