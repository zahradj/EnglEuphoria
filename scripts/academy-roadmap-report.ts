// Generates docs/academy-roadmap-v2.md from the roadmap data, so the document can never disagree with the code.
// Run: npx tsx scripts/academy-roadmap-report.ts
import { writeFileSync } from 'node:fs';
import { ACADEMY_ROADMAP, ACADEMY_ROADMAP_ISSUES, ACADEMY_ROADMAP_SUMMARY } from '../src/curriculum/academy';

const lines: string[] = [];
const out = (s = '') => lines.push(s);

out('# Academy roadmap v2 — A1 → C1 (generated)');
out();
out('> **Generated** by `scripts/academy-roadmap-report.ts` from `src/curriculum/academy/`. Edit the data, not this file.');
out('> Brand-new and Academy-only: the Playground curriculum files and the old Academy rows in the database are not used or changed.');
out('> Rules: `.claude/skills/academy-season-system`, `docs/academy-lesson-system.md`, `docs/academy-learning-science.md`.');
out();
out(`**Size:** ${ACADEMY_ROADMAP_SUMMARY.seasons} Seasons · ${ACADEMY_ROADMAP_SUMMARY.sessions} sessions of 60 minutes · ${ACADEMY_ROADMAP_SUMMARY.items} planned new items (words + chunks).`);
out();
out('**Status of the placements.** Grammar levels are recalled from the English Grammar Profile, Pearson GSE and Cambridge lists and were **not re-checked** against the sources (they could not be opened on 2026-10-08). Rows marked ⚠ are the least certain. Word lists (Oxford 3000/5000, Cambridge Vocabulary Profile) are **not yet loaded**: each Season has an item *budget* and lexical fields, not an item list. CEFR can-do lines are paraphrased from memory of the CEFR Companion Volume (2020) and need checking at coe.int.');
out();

out('## Overview');
out();
out('| Level | Seasons | Sessions | New items (budget) | Cumulative items | Cambridge cumulative hours |');
out('|---|---|---|---|---|---|');
let cum = 0;
for (const p of ACADEMY_ROADMAP) {
  const items = p.seasons.reduce((n, s) => n + s.newItemBudget, 0);
  cum += items;
  out(`| ${p.level} | ${p.seasons.length} | ${p.seasons.length * 8} | ${items} | ${cum} (target ${p.cumulativeItemTarget}) | ${p.cambridgeCumulativeHours ?? ''} |`);
}
out();

for (const p of ACADEMY_ROADMAP) {
  out(`## ${p.level}`);
  out();
  out('| Season | Title · theme | Structures (E3 / E6) | Functions | Release | Items |');
  out('|---|---|---|---|---|---|');
  for (const s of p.seasons) {
    const flag = s.bigRemix ? ' · Big Remix' : '';
    const check = s.levelCheck ? ' · **level check**' : '';
    const st = s.structures.map((x) => `${x.label}${x.use ? ` (${x.use})` : ''}${x.confidence === 'unverified' ? ' ⚠' : ''}`).join(' / ');
    out(`| ${s.id}${flag}${check} | **${s.title}** · ${s.theme} | ${st} | ${s.functions.join('; ')} | ${s.release} | ${s.newItemBudget} |`);
  }
  out();
  out('<details><summary>Can-do statements, hooks and mediation</summary>');
  out();
  for (const s of p.seasons) {
    out(`**${s.id} ${s.title}** — *${s.hook}*`);
    s.canDo.forEach((c) => out(`- ${c}`));
    if (s.mediation) out(`- *Mediation:* ${s.mediation}`);
    out(`- Lexical fields: ${s.lexicalFields.join('; ')} · Pronunciation: ${s.pronunciation.join('; ')} · Skins: ${s.skins.map((k) => k.id).join(', ')}`);
    if (s.notes) out(`- Note: ${s.notes}`);
    out();
  }
  out('</details>');
  out();
}

const warns = ACADEMY_ROADMAP_ISSUES.filter((i) => i.severity === 'warn');
const errs = ACADEMY_ROADMAP_ISSUES.filter((i) => i.severity === 'error');
out('## Validator');
out();
out(`Errors: ${errs.length} · Warnings: ${warns.length}`);
out();
errs.forEach((e) => out(`- ❌ ${e.seasonId ?? ''} ${e.code}: ${e.message}`));
const unverified = warns.filter((w) => w.code === 'structure_unverified');
if (unverified.length) {
  out();
  out(`**Unverified grammar placements (${unverified.length}) — check in the English Grammar Profile / GSE Grammar before locking:**`);
  unverified.forEach((w) => out(`- ${w.seasonId}: ${w.message}`));
}
warns.filter((w) => w.code !== 'structure_unverified').forEach((w) => out(`- ⚠ ${w.seasonId ?? ''} ${w.code}: ${w.message}`));
out();
writeFileSync('docs/academy-roadmap-v2.md', lines.join('\n'));
console.log(`wrote docs/academy-roadmap-v2.md (${lines.length} lines; ${errs.length} errors, ${warns.length} warnings)`);
