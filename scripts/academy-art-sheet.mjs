// Art review helper: lists every picture of a registered Academy lesson with its review status, and builds a contact sheet to LOOK at
// (zoom on hands, faces, feet, held objects; compare each character across plates), then record the result in src/academy-player-v2/artReview.ts.
//   npx tsx scripts/academy-art-sheet.mjs B1-S01-E1     -> docs/academy-player-v2-mockups/art-sheet-<id>.png
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadScript } from '../src/academy-player-v2/lessonScripts.ts';
import { artOf } from '../src/academy-player-v2/engine/artOf.ts';
import { ART_REVIEW } from '../src/academy-player-v2/artReview.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const id = process.argv[2];
const script = id && (await loadScript(id));
if (!script) { console.error('usage: npx tsx scripts/academy-art-sheet.mjs <lesson id>'); process.exit(2); }
const { all } = artOf(script);
for (const a of all) { const r = ART_REVIEW[a]; console.log(`${r ? (r.anatomy === 'ok' && r.cast !== 'inconsistent' ? 'OK    ' : 'REDO  ') : 'NEW   '} ${a}${r?.note ? `  (${r.note})` : ''}`); }
const out = path.join(ROOT, `docs/academy-player-v2-mockups/art-sheet-${id}.png`);
const py = `
import sys
from PIL import Image
files=sys.argv[2:]
ims=[Image.open(f).convert('RGB') for f in files]
w=640
ims=[i.resize((w,int(i.height*w/i.width))) for i in ims]
cols=3; rows=(len(ims)+cols-1)//cols; h=max(i.height for i in ims)
s=Image.new('RGB',(cols*w,rows*h),'white')
for k,i in enumerate(ims): s.paste(i,((k%cols)*w,(k//cols)*h))
s.save(sys.argv[1])`;
execFileSync('python3', ['-c', py, out, ...all.map((a) => path.join(ROOT, 'public/academy-art', `${a}.webp`))]);
console.log(`\ncontact sheet: ${out}`);
