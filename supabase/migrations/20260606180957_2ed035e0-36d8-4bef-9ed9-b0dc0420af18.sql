
CREATE TABLE public.cat_items (
  id text PRIMARY KEY,
  cefr text NOT NULL,
  skill text NOT NULL,
  prompt text NOT NULL,
  options jsonb NOT NULL,
  correct_index integer NOT NULL,
  partial_indices jsonb,
  audio_url text,
  option_image_urls jsonb,
  option_audio_urls jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.cat_items TO anon, authenticated;
GRANT ALL ON public.cat_items TO service_role;

ALTER TABLE public.cat_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cat_items public read"
  ON public.cat_items FOR SELECT
  USING (true);

CREATE POLICY "cat_items service role write"
  ON public.cat_items FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- Seed item bank (mirrors src/placement/leanCat/itemBank.ts)
INSERT INTO public.cat_items (id, cefr, skill, prompt, options, correct_index) VALUES
  ('pa1-v-1','pre_a1','vocab','Which word means a small animal that says "meow"?','["dog","cat","cow","fish"]'::jsonb,1),
  ('pa1-g-1','pre_a1','grammar','I ___ a student.','["am","is","are","be"]'::jsonb,0),
  ('pa1-v-2','pre_a1','vocab','What colour is the sun?','["blue","green","yellow","black"]'::jsonb,2),
  ('a1-g-1','a1','grammar','She ___ to school every day.','["go","going","goes","gone"]'::jsonb,2),
  ('a1-v-1','a1','vocab','I am _____. I want to eat.','["tired","happy","hungry","cold"]'::jsonb,2),
  ('a1-r-1','a1','reading','"My name is Tom. I am 8." How old is Tom?','["6","7","8","9"]'::jsonb,2),
  ('a1-g-2','a1','grammar','There ___ two cats on the sofa.','["is","are","am","be"]'::jsonb,1),
  ('a2-g-1','a2','grammar','Yesterday I ___ to the park.','["go","goes","went","going"]'::jsonb,2),
  ('a2-v-1','a2','vocab','The opposite of "expensive" is:','["old","cheap","big","fast"]'::jsonb,1),
  ('a2-r-1','a2','reading','"The shop opens at 9 and closes at 6." How long is the shop open?','["6 hours","7 hours","9 hours","15 hours"]'::jsonb,2),
  ('a2-g-2','a2','grammar','I have ___ been to Paris.','["never","ever","yet","still"]'::jsonb,0),
  ('b1-g-1','b1','grammar','If it rains tomorrow, we ___ at home.','["stay","will stay","stayed","would stay"]'::jsonb,1),
  ('b1-v-1','b1','vocab','A person who writes books is a:','["actor","author","editor","reader"]'::jsonb,1),
  ('b1-r-1','b1','reading','"Despite the rain, the match continued." This means:','["The rain stopped the match","The match went on anyway","They cancelled the match","It did not rain"]'::jsonb,1),
  ('b1-g-2','b1','grammar','The cake ___ by my sister.','["baked","is baking","was baked","bakes"]'::jsonb,2),
  ('b2-g-1','b2','grammar','I wish I ___ harder for the exam.','["studied","had studied","would study","study"]'::jsonb,1),
  ('b2-v-1','b2','vocab','Choose the best synonym for "diligent":','["lazy","hard-working","cheerful","clever"]'::jsonb,1),
  ('b2-r-1','b2','reading','"The proposal was met with scepticism." People were:','["enthusiastic","doubtful","angry","indifferent"]'::jsonb,1),
  ('b2-g-2','b2','grammar','Not only ___ late, but he also forgot the keys.','["he was","was he","he is","is he"]'::jsonb,1),
  ('c1-g-1','c1','grammar','Had I known the truth, I ___ differently.','["would act","would have acted","will act","acted"]'::jsonb,1),
  ('c1-v-1','c1','vocab','"Ubiquitous" most nearly means:','["rare","temporary","present everywhere","expensive"]'::jsonb,2),
  ('c1-r-1','c1','reading','"The argument hinges on a flawed premise." Hinges on means:','["contradicts","depends on","avoids","replaces"]'::jsonb,1),
  ('c1-g-2','c1','grammar','Were it not for her support, the project ___ have failed.','["would","will","might","shall"]'::jsonb,0)
ON CONFLICT (id) DO NOTHING;
