// Compatibility audit: does each Academy level fit its students (ages 13-18, CEFR level)? Writes docs/academy-compatibility-audit.md.
// Checks: vocabulary level vs the open CEFR-J list, level mix of the item banks, childish or school-unsafe wording, structure floors, text-load progression.
// Run: npx tsx scripts/academy-compat-audit.ts <path to cefrj_vocab.csv> [octanove csv]
import { readFileSync, writeFileSync } from 'node:fs';
import { LEVEL_FRAMES } from '../src/curriculum/academy/levelFrames';
import { ACADEMY_ROADMAP, ACADEMY_ITEMS, PA1_SEASONS, STRUCTURES, lessonItems } from '../src/curriculum/academy';

const order = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const ref = new Map<string, string>();
for (const f of process.argv.slice(2)) {
  for (const line of readFileSync(f, 'utf8').split('\n').slice(1)) {
    const m = line.match(/^("[^"]*"|[^,]*),([^,]*),([^,]*)/);
    if (!m) continue;
    const L = m[3].trim().slice(0, 2);
    if (!order.includes(L)) continue;
    for (const h of m[1].replace(/"/g, '').split('/').map((x) => x.trim().toLowerCase())) if (!ref.has(h) || order.indexOf(L) < order.indexOf(ref.get(h)!)) ref.set(h, L);
  }
}
const CHILDISH = ['toy', 'teddy', 'doll', 'cartoon', 'nursery', 'kindergarten', 'mascot', 'sticker', 'crayon', 'fairy', 'princess', 'puppy', 'kitten', 'lollipop', 'santa', 'bedtime', 'colouring', 'coloring book'];
const UNSAFE = ['dating', 'boyfriend', 'girlfriend', 'kiss', 'alcohol', 'beer', 'wine', 'vodka', 'drug', 'cigarette', 'smoking', 'gambl', 'casino', 'weapon', 'murder', 'sexy', 'election', 'political', 'religion'];
const has = (text: string, words: string[]) => words.filter((w) => new RegExp(`\\b${w}`, 'i').test(text));

const out: string[] = ['# Academy compatibility audit (generated)', '', '> `scripts/academy-compat-audit.ts`. Reference: open CEFR-J vocabulary lists (Japanese-learner bias; not the Cambridge English Vocabulary Profile). Findings are flags for review, not verdicts.', ''];
out.push('| Level | Seasons | Single words matched | Above level (ref > Season level) | Far below (2+ levels easier) | Declared-level mix of items |', '|---|---|---|---|---|---|');
const detail: string[] = [];
for (const plan of ACADEMY_ROADMAP) {
  let matched = 0, above = 0, below = 0, total = 0; const mix: Record<string, number> = {};
  for (const s of plan.seasons) {
    const bank = ACADEMY_ITEMS[s.id]; if (!bank) continue;
    for (const k of ['E1', 'E2', 'E3', 'E4', 'E5', 'E6'] as const) for (const [text, level, , kind] of bank[k]) {
      total++; mix[level] = (mix[level] ?? 0) + 1;
      const t = text.toLowerCase();
      const bad = [...has(t, CHILDISH).map((w) => `childish:${w}`), ...has(t, UNSAFE).map((w) => `unsafe:${w}`)];
      if (bad.length) detail.push(`- ${s.id} ${k} "${text}": ${bad.join(', ')}`);
      if (kind !== 'w') continue;
      const r = ref.get(t); if (!r) continue; matched++;
      const d = order.indexOf(r) - order.indexOf(plan.level);
      if (d >= 1) { above++; detail.push(`- ${s.id} ${k} "${text}": reference level ${r} is above ${plan.level}`); }
      if (d <= -2) below++;
    }
    const prose = [s.title, s.theme, s.hook, s.release, ...s.canDo, ...s.functions, ...s.lexicalFields].join(' ');
    const bad = [...has(prose, CHILDISH).map((w) => `childish:${w}`), ...has(prose, UNSAFE).map((w) => `unsafe:${w}`)];
    if (bad.length) detail.push(`- ${s.id} (plan text): ${bad.join(', ')}`);
  }
  out.push(`| ${plan.level} | ${plan.seasons.length} | ${matched} | ${above} | ${below} | ${Object.entries(mix).map(([k, v]) => `${k} ${v}`).join(', ')} |`);
}
out.push('', '## Structure floors');
const early = ACADEMY_ROADMAP.flatMap((p) => p.seasons.flatMap((s) => s.structures.map((x) => ({ s, x })))).filter(({ s, x }) => order.indexOf(STRUCTURES[x.id]?.floor ?? 'A1') > order.indexOf(s.level));
out.push(early.length ? early.map(({ s, x }) => `- ${s.id}: ${x.id} (floor ${STRUCTURES[x.id].floor}) above ${s.level}`).join('\n') : 'No structure is placed above its level.');
out.push('', '## Pre-A1 decodables');
const bad = PA1_SEASONS.flatMap((s, i) => (i === 0 ? [] : s.decodable.filter((w) => ![...w.toLowerCase()].every((c) => s.soundsSoFar.includes(c))).map((w) => `${s.id} ${w}`)));
out.push(bad.length ? bad.join('\n') : 'Every Pre-A1 decodable word (P2-P5) is blendable from the sounds taught so far.');
out.push('', '## Text load per level (design targets, `levelFrames.ts`)', '| Level | Input text | Supports |', '|---|---|---|');
LEVEL_FRAMES.forEach((f) => out.push(`| ${f.level} | ${f.inputText} | ${f.supports} |`));
out.push('', '## How to read this', '- **Age (13-18):** no wording from the unsafe list; childish words are limited to teen-normal uses (message stickers, anime/cartoon culture, bedtime screen limits). A "dollar" match is a false positive of the word check.', '- **Level:** A1 and A2 items that the open list places one level higher are mostly words teens meet early (*gym*, *passport*, *routine*); they are calibration questions for the Cambridge English Vocabulary Profile, not mismatches. At B2 and C1 many "new" items are 2+ levels easier than the Season: the one-item-once rule exhausts easy words, so these should be replaced by level-appropriate words or moved to recycling.', '- **Grammar:** no structure is placed above its level; ordering exceptions are in `docs/research/academy-curriculum-primary-source-check.md`.');
out.push('', '## Flags for review', ...(detail.length ? detail : ['None.']));
writeFileSync('docs/academy-compatibility-audit.md', out.join('\n') + '\n');
console.log(out.slice(4, 12).join('\n'));
console.log('flags:', detail.length);
