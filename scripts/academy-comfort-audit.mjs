#!/usr/bin/env node
/**
 * Student-comfort audit for an Academy (academy-v2) lesson.
 *
 * Plays every slide of /academy-scene/:id in a REAL headless Chrome (puppeteer-core) at a laptop and/or a
 * phone viewport, runs a DOM audit on each slide and saves a screenshot per slide, so a human (or Claude)
 * can look at what a student actually sees.
 *
 *   node scripts/academy-comfort-audit.mjs <lessonId> [laptop|mobile|both] [slideCount]
 *
 * Needs the dev server on http://localhost:8080 (npm run dev) and Chrome at the default Windows path
 * (override with CHROME_PATH). Output goes to ./academy-audit/<lessonId>/ (screenshots + audit-*.json).
 *
 * WHY a real browser and not the in-app preview pane: when the Claude desktop session is not on screen the
 * pane is throttled — framer-motion exit animations never finish, so the audit keeps measuring the
 * PREVIOUS slide while the counter advances, and screenshots catch half-faded frames. Headless Chrome has
 * real requestAnimationFrame, so what it reports is what a student sees.
 *
 * Checks per slide (see .claude/skills/lesson-quality-gate "Student comfort"):
 *   under-nav     a control sits underneath the fixed Back/Next bar (student cannot reach it)
 *   offscreen-x   a control is cut off at the side
 *   small-target  a labelled control is smaller than 36px (touch comfort)
 *   small-text    visible text under 13px (decorative badges are expected; body text is not)
 *   clipped       a container hides overflowing content (overflow hidden/clip)
 *   page-h-scroll the page scrolls sideways
 *   needs-scroll  informational: the content card needs an inner scroll
 */
import { createRequire } from 'module';
import path from 'path';
import fs from 'fs';

const require = createRequire(path.join(process.cwd(), 'package.json'));
const puppeteer = require('puppeteer-core');

const [, , lessonId, modeArg = 'both', countArg] = process.argv;
if (!lessonId) {
  console.error('usage: node scripts/academy-comfort-audit.mjs <lessonId> [laptop|mobile|both] [slideCount]');
  process.exit(1);
}
const base = process.env.BASE_URL || 'http://localhost:8080';
const chrome = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const outDir = path.join('academy-audit', lessonId);
fs.mkdirSync(outDir, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Quest overlays (level intro / level cleared) sit above the lesson; a student taps through them. Do the same.
async function dismissOverlays(page) {
  for (let n = 0; n < 4; n++) {
    const clicked = await page.evaluate(() => {
      const d = document.querySelector('[role="dialog"][aria-label]');
      const b = d && [...d.querySelectorAll('button')].find((x) => /Go!|Next level|Finish/i.test(x.innerText));
      if (!b) return false; b.click(); return true;
    });
    if (!clicked) return;
    await sleep(900);
  }
}
const modes = modeArg === 'both' ? ['laptop', 'mobile'] : [modeArg];

for (const mode of modes) {
  const [W, H, tag] = mode === 'mobile' ? [390, 844, 'mob'] : [1280, 720, 'lap'];
  const browser = await puppeteer.launch({
    executablePath: chrome, headless: 'new', args: ['--no-sandbox'],
    defaultViewport: { width: W, height: H, isMobile: tag === 'mob', hasTouch: tag === 'mob', deviceScaleFactor: 1 },
  });
  const page = await browser.newPage();
  // LOCAL_CONTENT=<path to a content.json>: audit an UNPUBLISHED lesson (hidden from students by RLS) by answering the
  // player's lesson request from the file instead of the database. Nothing is written anywhere.
  if (process.env.LOCAL_CONTENT) {
    const localContent = JSON.parse(fs.readFileSync(process.env.LOCAL_CONTENT, 'utf8'));
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      if (req.method() === 'GET' && /\/rest\/v1\/curriculum_lessons\?/.test(req.url()) && req.url().includes(`id=eq.${lessonId}`)) {
        const cors = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-expose-headers': '*' };
        return req.respond({ status: 200, contentType: 'application/json', headers: cors, body: JSON.stringify({ id: lessonId, title: 'Local preview', content: localContent }) });
      }
      return req.continue();
    });
  }
  const url = `${base}/academy-scene/${lessonId}?dev_bypass=true&as_role=student`;
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
  await page.evaluate((id) => sessionStorage.setItem('academy-scene-idx:' + id, '0'), lessonId);
  await page.reload({ waitUntil: 'networkidle2' });
  await sleep(2500);
  const navCounter = () => {
    const nav = [...document.querySelectorAll('div.fixed')].find((d) => /Back/i.test(d.innerText) && /Next|Finish/i.test(d.innerText));
    return ((nav && nav.innerText.match(/(\d+)\s*\/\s*(\d+)/)) || []);
  };
  const total = Number(countArg) || (await page.evaluate(() => { const nav = [...document.querySelectorAll('div.fixed')].find((d) => /Back/i.test(d.innerText) && /Next|Finish/i.test(d.innerText)); return Number(((nav && nav.innerText.match(/(\d+)\s*\/\s*(\d+)/)) || [])[2]) || 40; }));
  const results = [];
  for (let k = 0; k < total; k++) {
    await sleep(1500);
    await dismissOverlays(page);
    await sleep(300);
    const r = await page.evaluate(() => {
      const issues = [];
      const counter = (() => { const nv = [...document.querySelectorAll('div.fixed')].find((d) => /Back/i.test(d.innerText) && /Next|Finish/i.test(d.innerText)); return ((nv && nv.innerText.match(/(\d+)\s*\/\s*\d+/)) || [])[0]; })();
      const nav = [...document.querySelectorAll('div.fixed')].find((d) => /Back/i.test(d.innerText) && /Next|Finish/i.test(d.innerText));
      const navTop = nav ? nav.getBoundingClientRect().top : innerHeight - 70;
      const main = document.querySelector('main');
      const els = [...(main ? main.querySelectorAll('button,input,textarea,select') : [])];
      for (const e of els) {
        const b = e.getBoundingClientRect(); const cs = getComputedStyle(e);
        if (b.width === 0 || b.height === 0 || cs.visibility === 'hidden' || cs.display === 'none') continue;
        const nm = ((e.innerText || e.getAttribute('aria-label') || e.tagName) + '').trim().slice(0, 22);
        // A control below the fold INSIDE a scrolling card is reachable (the student scrolls the card);
        // only flag it when no scrollable ancestor could bring it into view.
        const scrollable = (() => { for (let a = e.parentElement; a && a !== document.body; a = a.parentElement) { const o = getComputedStyle(a).overflowY; if ((o === 'auto' || o === 'scroll') && a.scrollHeight > a.clientHeight + 4) return true; } return false; })();
        if (b.bottom > navTop - 2 && b.top < innerHeight && !scrollable) issues.push('under-nav:' + nm);
        if (b.right > innerWidth + 2 || b.left < -2) issues.push('offscreen-x:' + nm);
        if (Math.min(b.width, b.height) < 36 && (e.innerText || '').trim().length > 1) issues.push('small-target:' + nm + ' ' + Math.round(b.width) + 'x' + Math.round(b.height));
      }
      const small = new Set();
      if (main) for (const t of main.querySelectorAll('p,span,div,button,li,h1,h2,h3,label')) {
        if (t.children.length > 0) continue; const tx = (t.textContent || '').trim(); if (!tx) continue;
        const fs = parseFloat(getComputedStyle(t).fontSize); const b = t.getBoundingClientRect();
        if (fs < 13 && b.width > 0 && b.height > 0) small.add(tx.slice(0, 22) + '@' + fs);
      }
      if (small.size) issues.push('small-text:' + [...small].slice(0, 3).join(' | '));
      if (main) for (const c of main.querySelectorAll('*')) {
        const cs = getComputedStyle(c);
        if ((cs.overflowY === 'hidden' || cs.overflowY === 'clip') && c.scrollHeight > c.clientHeight + 6 && c.clientHeight > 50) { issues.push('clipped:' + c.tagName + ' ' + c.scrollHeight + '>' + c.clientHeight); break; }
      }
      if (document.documentElement.scrollWidth > innerWidth + 2) issues.push('page-h-scroll');
      if (main) for (const c of main.querySelectorAll('*')) {
        const cs = getComputedStyle(c);
        if (cs.overflowY === 'auto' && c.scrollHeight > c.clientHeight + 6 && c.clientHeight > 80) { issues.push('needs-scroll:' + c.scrollHeight + '>' + c.clientHeight); break; }
      }
      return { counter, issues };
    });
    await page.screenshot({ path: path.join(outDir, `${tag}-${String(k + 1).padStart(2, '0')}.png`) });
    results.push(r);
    // Click the LESSON's Next (inside the fixed bar), never a slide's own inner Next button.
    const advanced = await page.evaluate(() => {
      const navEl = [...document.querySelectorAll('div.fixed')].find((d) => /Back/i.test(d.innerText) && /Next|Finish/i.test(d.innerText));
      const n = navEl && [...navEl.querySelectorAll('button')].find((b) => /Next/i.test(b.innerText));
      if (!n) return false; n.click(); return true;
    });
    if (!advanced) break;
    await sleep(300);
    await dismissOverlays(page);
  }
  fs.writeFileSync(path.join(outDir, `audit-${tag}.json`), JSON.stringify(results, null, 1));
  console.log(`\n== ${mode} ${W}x${H}: ${results.length} slides ==`);
  const hard = results.filter((r) => r.issues.some((i) => /^(under-nav|offscreen-x|clipped|page-h-scroll)/.test(i)));
  console.log(hard.length ? 'BLOCKING (student cannot reach / see content):' : 'No blocking comfort issues.');
  for (const r of hard) console.log('  ', r.counter, r.issues.filter((i) => /^(under-nav|offscreen-x|clipped|page-h-scroll)/.test(i)).join(' ; '));
  const soft = results.filter((r) => r.issues.some((i) => /^(small-target|needs-scroll)/.test(i)));
  for (const r of soft) console.log('  note', r.counter, r.issues.filter((i) => /^(small-target|needs-scroll)/.test(i)).join(' ; '));
  await browser.close();
}
console.log(`\nScreenshots + JSON in ${outDir}/ — open them and LOOK at them (contrast, framing, art) before signing off.`);
