// Usage: node gen.mjs <name> <promptFile> [refImagePath ...]
// Calls the project's own ai-image-generation function (Google image model + Picsart cutout) and saves the PNG.
import fs from 'node:fs';
import path from 'node:path';

const [name, promptFile, ...refs] = process.argv.slice(2);
const OUT = path.join(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), 'out');
fs.mkdirSync(OUT, { recursive: true });

const src = fs.readFileSync('C:/Users/engle/Downloads/engleuphoria (7)/src/integrations/supabase/client.ts', 'utf8');
const KEY = src.match(/supabaseAnonKey\s*=\s*"([^"]+)"/)[1];
const URL_ = 'https://dcoxpyzoqjvmuuygvlme.supabase.co/functions/v1/ai-image-generation';

const prompt = fs.readFileSync(promptFile, 'utf8').trim();
const referenceImages = refs.map((p) => ({ mimeType: 'image/png', data: fs.readFileSync(p).toString('base64') }));

const t0 = Date.now();
const res = await fetch(URL_, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', apikey: KEY, Authorization: `Bearer ${KEY}` },
  body: JSON.stringify({
    prompt,
    style: 'flat2d',
    aspectRatio: '1:1',
    postProcess: true, // transparent cutout + 2x upscale
    persist: false,
    referenceImages: referenceImages.length ? referenceImages : undefined,
  }),
});
const text = await res.text();
console.log(`${name}: HTTP ${res.status} in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
let json;
try { json = JSON.parse(text); } catch { console.log(text.slice(0, 300)); process.exit(1); }
if (!res.ok || !json.imageUrl) { console.log(JSON.stringify(json).slice(0, 400)); process.exit(1); }
console.log('picsartApplied:', json.picsartApplied);

let buf;
if (json.imageUrl.startsWith('data:')) buf = Buffer.from(json.imageUrl.split(',')[1], 'base64');
else buf = Buffer.from(await (await fetch(json.imageUrl)).arrayBuffer());
const file = path.join(OUT, `${name}.png`);
fs.writeFileSync(file, buf);
console.log(`saved ${file} (${(buf.length / 1024).toFixed(0)} KB)`);
