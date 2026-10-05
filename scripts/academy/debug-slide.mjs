/**
 * Debug helper: open ONE slide of a local (unpublished) Academy lesson in headless Chrome and print the bounding boxes of
 * everything matching a CSS selector, plus the fixed Back/Next bar. Handy for "control under the nav bar" findings.
 *   node scripts/academy/debug-slide.mjs <lessonId> <contentJson> <slideIndex0> "<css selector>" [laptop|mobile]
 */
import { createRequire } from 'module';
import fs from 'fs';
const require = createRequire(process.cwd() + '/package.json');
const puppeteer = require('puppeteer-core');
const [, , lessonId, contentPath, idx = '0', selector = 'button', mode = 'laptop'] = process.argv;
const content = JSON.parse(fs.readFileSync(contentPath, 'utf8'));
const [W, H] = mode === 'mobile' ? [390, 844] : [1280, 720];
const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--no-sandbox'],
  defaultViewport: { width: W, height: H, isMobile: mode === 'mobile', hasTouch: mode === 'mobile' },
});
const page = await browser.newPage();
await page.setRequestInterception(true);
page.on('request', (req) => {
  if (req.method() === 'GET' && /\/rest\/v1\/curriculum_lessons\?/.test(req.url()) && req.url().includes(`id=eq.${lessonId}`)) {
    const cors = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-expose-headers': '*' };
    return req.respond({ status: 200, contentType: 'application/json', headers: cors, body: JSON.stringify({ id: lessonId, title: 'Local', content }) });
  }
  return req.continue();
});
await page.goto(`http://localhost:8080/academy-scene/${lessonId}?dev_bypass=true&as_role=student`, { waitUntil: 'networkidle2', timeout: 60000 });
await page.evaluate((id, i) => sessionStorage.setItem('academy-scene-idx:' + id, i), lessonId, idx);
await page.reload({ waitUntil: 'networkidle2' });
await new Promise((r) => setTimeout(r, 2500));
const out = await page.evaluate((sel) => {
  const r = (el) => { const b = el.getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height), bottom: Math.round(b.bottom) }; };
  const nav = [...document.querySelectorAll('div.fixed')].find((d) => /Back/i.test(d.innerText) && /Next|Finish/i.test(d.innerText));
  const main = document.querySelector('main');
  return {
    viewport: { w: innerWidth, h: innerHeight },
    nav: nav && r(nav),
    main: main && r(main),
    mainChild: main && main.firstElementChild && r(main.firstElementChild),
    matches: [...document.querySelectorAll(sel)].slice(0, 12).map((el) => ({ t: (el.innerText || '').slice(0, 24), ...r(el), cls: String(el.className).slice(0, 50) })),
  };
}, selector);
console.log(JSON.stringify(out, null, 1));
await browser.close();
