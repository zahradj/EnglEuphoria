/**
 * Smoke test for the Academy lesson player (PlayAcademyLesson) in real headless Chrome.
 *   node scripts/academy-player-smoke.mjs <lessonId>      (dev server on :8080, Chrome installed)
 * Injects a crashing slide and an unsupported slide into the lesson as it loads and checks the player's safety
 * net: skip cards, saved progress / resume, student vs teacher lesson map, offline notice, retry after a failed
 * load. NOTE: never call localStorage.clear() in tests — the app's startup cleanup wipes sessionStorage when its
 * own localStorage marker is missing.
 */
import { createRequire } from 'module';
import fs from 'fs';
const require = createRequire(process.cwd() + '/package.json');
const puppeteer = require('puppeteer-core');
const ID = process.argv[2];
if (!ID) { console.error('usage: node scripts/academy-player-smoke.mjs <lessonId>'); process.exit(1); }
const KEY = fs.readFileSync(new URL('../src/integrations/supabase/client.ts', import.meta.url), 'utf8').match(/supabaseAnonKey\s*=\s*"([^"]+)"/)[1];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];
const check = (name, ok, extra = '') => results.push({ name, ok: !!ok, extra });
const safe = async (title, fn) => { try { await fn(); } catch (e) { check('BLOCK ERROR: ' + title, false, String(e).slice(0, 180)); } };

const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--no-sandbox'], defaultViewport: { width: 1280, height: 720 } });

async function openLesson({ role = 'student', inject = false, failFirst = false } = {}) {
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  let hits = 0;
  page.on('request', async (req) => {
    const url = req.url();
    if (req.method() === 'GET' && /\/rest\/v1\/curriculum_lessons\?/.test(url) && url.includes(`id=eq.${ID}`)) {
      hits += 1;
      const cors = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-expose-headers': '*' };
      if (failFirst && hits <= 2) return req.respond({ status: 500, contentType: 'application/json', headers: cors, body: JSON.stringify({ message: 'simulated outage' }) });
      try {
        const h = req.headers();
        const r = await fetch(url, { headers: { apikey: KEY, authorization: 'Bearer ' + KEY, accept: h['accept'] || 'application/json' } });
        let body = await r.text();
        if (inject) {
          const j = JSON.parse(body); const row = Array.isArray(j) ? j[0] : j;
          row.content.slides.splice(2, 0,
            { type: 'totally_unknown_type', block: 'warmup' },
            { type: 'matching', block: 'warmup', prompt: 'broken on purpose', pairs: null });
          body = JSON.stringify(Array.isArray(j) ? [row] : row);
        }
        return req.respond({ status: r.status, contentType: r.headers.get('content-type') || 'application/json', headers: cors, body });
      } catch (e) { return req.continue(); }
    }
    return req.continue();
  });
  await page.goto(`http://localhost:8080/academy-scene/${ID}?dev_bypass=true&as_role=${role}`, { waitUntil: 'networkidle2' });
  return page;
}
const counter = (page) => page.evaluate(() => { const n = [...document.querySelectorAll('div.fixed')].find((d) => /Back/.test(d.innerText) && /Next|Finish/.test(d.innerText)); return ((n && n.innerText.match(/(\d+)\s*\/\s*(\d+)/)) || []).slice(1).map(Number); });
const clickCounter = (page) => page.evaluate(() => { const n = [...document.querySelectorAll('div.fixed')].find((d) => /Back/.test(d.innerText) && /Next|Finish/.test(d.innerText)); const b = n && [...n.querySelectorAll('button')].find((x) => /\d+\s*\/\s*\d+/.test(x.innerText)); if (!b) return false; b.click(); return true; });
const clickIn = (page, scopeSel, re) => page.evaluate((sel, src) => { const root = document.querySelector(sel) || document; const b = [...root.querySelectorAll('button')].find((x) => new RegExp(src, 'i').test(x.innerText)); if (!b) return false; b.click(); return true; }, scopeSel, re.source);
const dismiss = async (page) => { for (let k = 0; k < 4; k++) { const ok = await clickIn(page, '[role="dialog"][aria-label]', /Go!|Next level|Finish/); if (!ok) return; await sleep(700); } };
const next = async (page) => { await page.evaluate(() => { const n = [...document.querySelectorAll('div.fixed')].find((d) => /Back/.test(d.innerText)); [...n.querySelectorAll('button')].find((x) => /Next|Finish/.test(x.innerText)).click(); }); await sleep(600); await dismiss(page); };
const fresh = async (page, idx) => { await page.evaluate((id, i) => { sessionStorage.setItem('academy-scene-idx:' + id, String(i)); localStorage.removeItem('academy-resume:' + id); }, ID, idx); await page.reload({ waitUntil: 'networkidle2' }); await sleep(2000); await dismiss(page); };

// which index is the escape room in the live lesson?
const live = await (await fetch(`https://dcoxpyzoqjvmuuygvlme.supabase.co/rest/v1/curriculum_lessons?id=eq.${ID}&select=content`, { headers: { apikey: KEY, authorization: 'Bearer ' + KEY } })).json();
const liveSlides = live[0].content.slides;
const escapeIdx = Math.max(0, liveSlides.findIndex((s) => s.type === 'escape_room_slot'));
const hasEscape = liveSlides.some((s) => s.type === 'escape_room_slot');

await safe('1) broken + unsupported slides', async () => {
  const page = await openLesson({ inject: true });
  const errs = []; page.on('pageerror', (e) => errs.push(String(e).slice(0, 120)));
  await fresh(page, 0);
  await next(page); await next(page); await sleep(1200);
  const a1 = await page.evaluate(() => document.querySelector('[role="alert"]')?.innerText || '');
  check('unsupported slide shows a skip card (not a blank screen)', /isn't available here yet/.test(a1), a1.slice(0, 60));
  await clickIn(page, '[role="alert"]', /Skip/); await sleep(1200);
  const a2 = await page.evaluate(() => document.querySelector('[role="alert"]')?.innerText || '');
  check('crashing slide shows try-again/skip card and the player stays alive', /didn't load/.test(a2), a2.slice(0, 60));
  await clickIn(page, '[role="alert"]', /Skip/); await sleep(1500);
  const c = await counter(page);
  check('skipping both lands on the next real slide', c[0] === 5, JSON.stringify(c));
  const unexpected = errs.filter((e) => !/slide\.pairs is not iterable/.test(e));
  check('no unexpected page errors (the deliberate crash is caught by the guard)', unexpected.length === 0, unexpected.join(' | '));
  const before = (await counter(page))[0];
  const saved = await page.evaluate((id) => localStorage.getItem('academy-resume:' + id), ID);
  check('progress saved to device storage', !!saved, saved || '');
  await page.evaluate((id) => sessionStorage.removeItem('academy-scene-idx:' + id), ID);
  await page.reload({ waitUntil: 'networkidle2' }); await sleep(2000); await dismiss(page);
  const after = (await counter(page))[0];
  check('closing the tab and returning resumes at the same slide', after === before, `${before} -> ${after}`);
  await page.close();
});

await safe('2) student lesson map', async () => {
  const page = await openLesson({ role: 'student' });
  await fresh(page, 6);
  await clickCounter(page); await sleep(700);
  const st = await page.evaluate(() => { const d = document.querySelector('[role="dialog"][aria-label="Lesson slides"]'); if (!d) return null; const bs = [...d.querySelectorAll('ol button')]; return { total: bs.length, locked: bs.filter((b) => b.disabled).length, current: bs.findIndex((b) => b.getAttribute('aria-current') === 'true') + 1 }; });
  check('student lesson map: later slides locked, current marked', st && st.locked > 20 && st.current === 7, JSON.stringify(st));
  await page.evaluate(() => { document.querySelector('[role="dialog"][aria-label="Lesson slides"]').querySelectorAll('ol button')[1].click(); }); await sleep(900); await dismiss(page);
  check('student can jump back to a reached slide', (await counter(page))[0] === 2, JSON.stringify(await counter(page)));
  await page.close();
});

await safe('3) teacher lesson map', async () => {
  const page = await openLesson({ role: 'teacher' });
  await fresh(page, 0);
  await clickCounter(page); await sleep(700);
  const tc = await page.evaluate(() => { const d = document.querySelector('[role="dialog"][aria-label="Lesson slides"]'); if (!d) return null; return { locked: [...d.querySelectorAll('ol button')].filter((b) => b.disabled).length }; });
  check('teacher lesson map: nothing locked', tc && tc.locked === 0, JSON.stringify(tc));
  await page.evaluate((n) => { document.querySelector('[role="dialog"][aria-label="Lesson slides"]').querySelectorAll('ol button')[n].click(); }, escapeIdx); await sleep(1000); await dismiss(page);
  check(`teacher can jump straight to the escape room (slide ${escapeIdx + 1})`, (await counter(page))[0] === escapeIdx + 1, JSON.stringify(await counter(page)));
  if (!hasEscape) { await page.close(); return; }
  const themed = await page.evaluate(() => /border-emerald-700/.test(document.querySelector('main')?.innerHTML || ''));
  check('academy escape room uses the themed card', themed);
  await page.type('main input', 'compass'); await clickIn(page, 'main', /Unlock/); await sleep(1800);
  check('escape room door 1 solves and moves to door 2', /DOOR 2/i.test(await page.evaluate(() => document.querySelector('main').innerText)));
  await page.close();
});

await safe('4) offline notice', async () => {
  const page = await openLesson();
  await sleep(1500);
  await page.setOfflineMode(true); await page.evaluate(() => window.dispatchEvent(new Event('offline'))); await sleep(500);
  check('offline notice appears', await page.evaluate(() => [...document.querySelectorAll('[role="status"]')].some((e) => /offline/i.test(e.innerText))));
  await page.setOfflineMode(false); await page.evaluate(() => window.dispatchEvent(new Event('online'))); await sleep(500);
  check('offline notice disappears when back online', await page.evaluate(() => ![...document.querySelectorAll('[role="status"]')].some((e) => /offline/i.test(e.innerText))));
  await page.close();
});

await safe('5) load failure then retry', async () => {
  const page = await openLesson({ failFirst: true });
  await sleep(2500);
  const errText = await page.evaluate(() => document.body.innerText);
  check('failed load shows a message with Try again', /Try again/.test(errText), errText.slice(0, 80).replace(/\n/g, ' '));
  await clickIn(page, 'body', /Try again/); await sleep(3500); await dismiss(page);
  const c = await counter(page);
  check('Try again loads the lesson', c.length === 2 && c[1] === liveSlides.length, JSON.stringify(c));
  await page.close();
});

console.log(results.map((r) => `${r.ok ? 'PASS' : 'FAIL'}  ${r.name}${r.ok ? '' : '   -> ' + r.extra}`).join('\n'));
console.log(`\n${results.filter((r) => r.ok).length}/${results.length} passed`);
await browser.close();
