// Prints the SQL that syncs the A1 Playground lesson plans (src/curriculum/roadmap/a1LessonPlans.ts) into
// curriculum_lessons: description, grammar_pattern, vocabulary_list, phonics_focus and ai_metadata.blueprint_ref.
// Run: npx tsx scripts/a1-lesson-plans-sql.ts [unitFrom] [unitTo] > out.sql   (then run the SQL in Supabase)
// Only touches rows with ai_metadata->>'hub' = 'playground' and slot_cefr_level = 'A1'; never touches content,
// titles or is_published. Keeps each row's blueprint_ref id and adaptive_profile, and stores the old plan once in
// ai_metadata.previous_plan_2026_10_12 (undo: copy it back).
import { A1_LESSON_PLANS } from '../src/curriculum/roadmap/a1LessonPlans';
import { A1_PLAYGROUND_BUCKETS } from '../src/curriculum/roadmap/a1Roadmap';
import { A1_PLAYGROUND_WORLDS } from '../src/curriculum/worlds/a1Worlds';

const from = Number(process.argv[2] ?? 1);
const to = Number(process.argv[3] ?? 10);

const units = A1_PLAYGROUND_BUCKETS.filter((b) => b.unitNumber >= from && b.unitNumber <= to).map((b) => {
  const w = A1_PLAYGROUND_WORLDS[b.unitNumber - 1];
  return { u: String(b.unitNumber), theme: w.name, title: `${w.name}: ${b.unitTitle}`, goal: b.communicativeGoal };
});
const rows = A1_LESSON_PLANS.filter((p) => p.unit >= from && p.unit <= to).map((p) => {
  const prev = A1_LESSON_PLANS.filter((x) => x.unit === p.unit && x.lesson < p.lesson).map((x) => x.title);
  const targets = (p.newVocabulary.length ? p.newVocabulary : p.reviewTargets).slice(0, 3);
  return {
    u: String(p.unit), l: String(p.lesson), lt: p.lessonType, sf: p.skillFocus,
    o: p.objective, g: p.grammarFocus, v: p.newVocabulary, ph: p.phonicsFocus,
    r: [...p.reviewTargets, ...prev.slice(-2)], t: targets, vf: [...p.newVocabulary, ...p.reviewTargets].slice(0, 10),
    cg: p.communicationGoal, sg: p.signatureGame, ev: p.evidence, fh: p.funHook, hm: p.homeMission,
  };
});

const q = (o: unknown) => JSON.stringify(o).replace(/'/g, "''");
console.log(`set lock_timeout = '5s';
with units as (select * from jsonb_to_recordset('${q(units)}'::jsonb) as x(u text, theme text, title text, goal text)),
plan as (select * from jsonb_to_recordset('${q(rows)}'::jsonb)
  as x(u text, l text, lt text, sf text, o text, g jsonb, v jsonb, ph jsonb, r jsonb, t jsonb, vf jsonb, cg text, sg text, ev text, fh text, hm text)),
p as (select plan.*, units.theme, units.title as unit_title, units.goal from plan join units using (u))
update curriculum_lessons c set
  description = p.o,
  grammar_pattern = (select string_agg(x, '; ') from jsonb_array_elements_text(p.g) x),
  vocabulary_list = p.v,
  phonics_focus = (select string_agg(x, ', ') from jsonb_array_elements_text(p.ph) x),
  ai_metadata = c.ai_metadata
    || case when c.ai_metadata ? 'previous_plan_2026_10_12' then '{}'::jsonb else jsonb_build_object('previous_plan_2026_10_12',
         jsonb_build_object('description', c.description, 'grammar_pattern', c.grammar_pattern, 'vocabulary_list', c.vocabulary_list,
           'phonics_focus', c.phonics_focus, 'unit_title', c.ai_metadata->'unit_title', 'blueprint_ref', c.ai_metadata->'blueprint_ref')) end
    || jsonb_build_object('unit_title', p.unit_title, 'blueprint_ref', jsonb_build_object(
         'id', coalesce(c.ai_metadata->'blueprint_ref'->'id', to_jsonb(c.id::text)),
         'adaptive_profile', coalesce(c.ai_metadata->'blueprint_ref'->'adaptive_profile', '{}'::jsonb),
         'title', c.title, 'objective', p.o, 'unit_theme', p.theme, 'unit_title', p.unit_title, 'unit_objective', p.goal,
         'lesson_type', p.lt, 'skill_focus', p.sf,
         'story_state', jsonb_build_object('arc', p.fh, 'theme', p.theme, 'characters', '[]'::jsonb),
         'unit_number', p.u::int, 'lesson_number', p.l::int, 'game_targets', p.t, 'homework_targets', p.t,
         'grammar_focus', p.g, 'phonics_focus', p.ph, 'pronunciation_focus', p.ph, 'review_targets', p.r,
         'vocabulary_focus', p.vf, 'communication_goal', p.cg, 'signature_game', p.sg, 'evidence', p.ev,
         'fun_hook', p.fh, 'home_mission', p.hm, 'plan_source', 'src/curriculum/roadmap/a1LessonPlans.ts (2026-10-12)')),
  updated_at = now()
from p
where c.ai_metadata->>'hub' = 'playground' and c.slot_cefr_level = 'A1'
  and c.slot_unit_number = p.u and c.slot_lesson_number = p.l
returning c.slot_unit_number, c.slot_lesson_number;`);
