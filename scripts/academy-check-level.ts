// Checks one level of the Academy roadmap while it is being edited: prints the roadmap and item-bank issues for that level's Seasons only.
// Run: npx tsx scripts/academy-check-level.ts A1
import { ACADEMY_ROADMAP_ISSUES, ACADEMY_ITEM_ISSUES, ACADEMY_ROADMAP } from '../src/curriculum/academy';

const level = process.argv[2];
const plan = ACADEMY_ROADMAP.find((p) => p.level === level);
if (!plan) { console.log('usage: academy-check-level.ts A1|A2|B1|B2|C1'); process.exit(2); }
const mine = (id?: string) => !!id && id.startsWith(`${level}-`);
const issues = [...ACADEMY_ROADMAP_ISSUES, ...ACADEMY_ITEM_ISSUES].filter((i) => mine(i.seasonId));
console.log(`${level}: ${plan.seasons.length} Seasons; ${plan.seasons.reduce((a, s) => a + s.newItemBudget, 0)} new items`);
issues.forEach((i) => console.log(`${i.severity.toUpperCase()} ${i.seasonId} [${i.code}] ${i.message}`));
const errors = issues.filter((i) => i.severity === 'error');
console.log(errors.length ? `${errors.length} ERRORS` : 'no errors for this level (level-wide count/target checks are fixed up at the end)');
process.exit(errors.length ? 1 : 0);
