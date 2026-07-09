// Audit visuel Tania — capture 3 viewports + diagnostics automatisés
// Usage: node docs/audit/capture.mjs [avant|apres]
import pw from '/opt/node22/lib/node_modules/playwright/node_modules/playwright-core/index.js';
const { chromium } = pw;
import fs from 'node:fs';

const PHASE = process.argv[2] === 'apres' ? 'apres' : 'avant';
const BASE = 'http://127.0.0.1:8799';
const pages = JSON.parse(fs.readFileSync('/tmp/pages.json', 'utf8'));
const widths = [375, 768, 1440];
const outDir = `docs/audit/${PHASE}`;
fs.mkdirSync(outDir, { recursive: true });

const report = { console: {}, hscroll: {}, meta: {}, imgs: {} };
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });

for (const w of widths) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  for (const p of pages) {
    const errs = [];
    page.removeAllListeners('console'); page.removeAllListeners('pageerror');
    page.on('console', m => m.type() === 'error' && errs.push(m.text()));
    page.on('pageerror', e => errs.push(String(e)));
    const name = (p === '/' ? 'home' : p.replace(/\/$/,'').replaceAll('/', '_').replace(/^_/,'') || 'home');
    try {
      await page.goto(BASE + p, { waitUntil: 'networkidle', timeout: 20000 });
      // force la révélation (l'IntersectionObserver ne se déclenche pas en fullPage)
      await page.evaluate(() => {
        document.querySelectorAll('.reveal').forEach(e => e.classList.add('in'));
        document.querySelectorAll('.steps,.stage,.pill,.reply').forEach(e => e.classList.add('in'));
      });
      await page.waitForTimeout(350);
      await page.screenshot({ path: `${outDir}/${name}-${w}.png`, fullPage: true });
      // diagnostics (une seule fois, au plus large)
      if (w === 1440) {
        const diag = await page.evaluate(() => {
          const de = document.documentElement;
          const hscroll = de.scrollWidth > de.clientWidth ? de.scrollWidth - de.clientWidth : 0;
          const title = document.title || '';
          const desc = document.querySelector('meta[name=description]')?.content || '';
          const canonical = document.querySelector('link[rel=canonical]')?.href || '';
          const imgs = [...document.querySelectorAll('img')].map(i => ({
            src: i.getAttribute('src')||'', alt: i.getAttribute('alt'), w: i.getAttribute('width'), h: i.getAttribute('height'), loading: i.getAttribute('loading')
          }));
          return { hscroll, title, desc, canonical, imgs };
        });
        report.meta[name] = { title: diag.title, descLen: diag.desc.length, canonical: diag.canonical };
        report.imgs[name] = diag.imgs;
      }
      // hscroll par viewport
      const hs = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      if (hs > 0) report.hscroll[`${name}@${w}`] = hs;
    } catch (e) {
      errs.push('GOTO_FAIL: ' + String(e).slice(0,120));
    }
    if (errs.length) report.console[`${name}@${w}`] = errs;
  }
  await ctx.close();
}
await browser.close();
fs.writeFileSync(`docs/audit/diagnostics-${PHASE}.json`, JSON.stringify(report, null, 2));
console.log('=== CAPTURE', PHASE, 'OK ===');
console.log('scroll horizontal:', Object.keys(report.hscroll).length ? report.hscroll : 'AUCUN ✅');
console.log('erreurs console:', Object.keys(report.console).length ? Object.keys(report.console) : 'AUCUNE ✅');
