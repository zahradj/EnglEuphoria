-- Seeds real host personas for the Academy and Success hubs, giving content
-- to the names already used as the CastChatPanel fallback ("Mentor Vee",
-- "Coach Sol") instead of only ever having generic on-the-fly names.
-- Illustrated-but-realistic humans, not cutesy kid mascots — per the
-- unified pilot lesson engine's persona design (Phase 1).
--
-- created_by uses the nil uuid to mark these as system-seeded, shared cast
-- (cast_vault_characters.created_by has no FK constraint, so this is safe).

INSERT INTO public.cast_vault_characters
  (hub, name, role, personality_traits, visual_blueprint, signature_traits, is_shared, created_by)
SELECT 'academy', 'Vee', 'Academy mentor',
  '{"tone": "direct, upbeat peer-mentor", "treats_mistakes_as": "normal"}'::jsonb,
  '{"appearance": "illustrated, semi-realistic proportions, not a talking animal", "outfit": "casual contemporary streetwear-adjacent", "age_range": "16-19 presenting", "palette": ["#3b82f6", "#93c5fd", "#1e3a8a"]}'::jsonb,
  '["direct", "upbeat", "treats mistakes as normal"]'::jsonb,
  true, '00000000-0000-0000-0000-000000000000'
WHERE NOT EXISTS (
  SELECT 1 FROM public.cast_vault_characters WHERE hub = 'academy' AND name = 'Vee'
);

INSERT INTO public.cast_vault_characters
  (hub, name, role, personality_traits, visual_blueprint, signature_traits, is_shared, created_by)
SELECT 'success', 'Sol', 'Success coach',
  '{"tone": "calm, competent, respects learner expertise", "never": "childlike"}'::jsonb,
  '{"appearance": "illustrated, semi-realistic proportions, not a talking animal", "outfit": "business-casual", "age_range": "adult professional", "palette": ["#059669", "#6ee7b7", "#065f46"]}'::jsonb,
  '["calm", "competent", "respectful of expertise"]'::jsonb,
  true, '00000000-0000-0000-0000-000000000000'
WHERE NOT EXISTS (
  SELECT 1 FROM public.cast_vault_characters WHERE hub = 'success' AND name = 'Sol'
);
