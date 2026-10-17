// Renders src/curriculum/roadmap/playgroundCurriculum.ts into docs/playground-curriculum-prea1-b2.md.
// Run: npx tsx scripts/render-playground-curriculum.ts
import { writeFileSync } from 'node:fs';
import { LEVELS, PLAYGROUND_CURRICULUM, UNIT_ARC, type PlaygroundLevel } from '../src/curriculum/roadmap/playgroundCurriculum';

const esc = (s: string) => s.replace(/\|/g, '\\|');
const out: string[] = [];
out.push('# Playground curriculum — Pre-A1 → B2 (all units and lessons)', '');
out.push('Generated from `src/curriculum/roadmap/playgroundCurriculum.ts` (`npx tsx scripts/render-playground-curriculum.ts`) — edit the data file, not this page.', '');
out.push('**Status:** Pre-A1 built · A1 building · **A2, B1, B2 = draft for the owner\'s approval** (owner 2026-10-15: "create the full curriculum of the playground from pre-A to B2, all of the units and lessons"). No A2-B2 lesson is built before its unit plan is approved (CLAUDE.md).', '');
out.push('Research (levels, grammar placement, exam formats — never content): [`docs/research/playground-curriculum-research.md`](research/playground-curriculum-research.md).', '');
out.push('## 1. The ladder', '', '| Level | Ages | Lesson | Points at | GSE | The child can at the end | Reading strand | Writing | Status |', '|---|---|---|---|---|---|---|---|---|');
for (const l of LEVELS) out.push(`| **${l.level}** | ${l.ages} | ${l.lessonLength} | ${l.exam} | ${l.gse} | ${esc(l.exit)} | ${esc(l.literacyStrand)} | ${esc(l.writingStrand)} | ${l.status} |`);
const total = (Object.values(PLAYGROUND_CURRICULUM) as { lessons: unknown[] }[][]).reduce((n, us) => n + us.reduce((m, u) => m + u.lessons.length, 0), 0);
out.push('', `**${Object.keys(PLAYGROUND_CURRICULUM).length} levels × 10 units × 7 lessons = ${total} lessons.**`, '');
out.push('## 2. The unit arc (every level)', '', ...UNIT_ARC.map((a) => `- ${a}`), '');
out.push('Every lesson keeps the Playground rules: one "I can" goal, Remember? warm-up, model first (I do → we do → you do), Read and Match after new words (A1+), games not worksheets with no game twice in a unit, a song in L3, a story in L5, recorded voices only, Canva / Gemini pictures (Playground brand shades, modest clothing, cut-out stickers), research before every lesson, a plan approved before building.', '');
let n = 3;
for (const level of Object.keys(PLAYGROUND_CURRICULUM) as PlaygroundLevel[]) {
  const units = PLAYGROUND_CURRICULUM[level];
  out.push(`## ${n++}. ${level}`, '', '| Unit | World | Can-do goal | New grammar | Reading strand | Writing | Speaking task |', '|---|---|---|---|---|---|---|');
  for (const u of units) out.push(`| ${u.unit} | **${esc(u.world)}** | ${esc(u.goal)} | ${esc(u.grammar.join('; '))} | ${esc(u.literacy)} | ${esc(u.writing)} | ${esc(u.speakingTask)} |`);
  out.push('');
  for (const u of units) {
    out.push(`### ${level} · Unit ${u.unit} · ${u.world}`, '', `*${u.goal}* — words: ${u.vocabulary.join('; ')}`, '', '| L | Title | Objective |', '|---|---|---|');
    for (const l of u.lessons) out.push(`| ${l.lesson} | ${esc(l.title)} | ${esc(l.objective)} |`);
    out.push('');
  }
}
writeFileSync('docs/playground-curriculum-prea1-b2.md', out.join('\n'));
console.log(`wrote docs/playground-curriculum-prea1-b2.md (${total} lessons)`);
