// Glued-text check: loads every page in Arabic and English and fails if two adjacent inline /
// inline-block siblings both carry visible text with no whitespace between them (that is how
// "نحوّل متابعيك" turned into "نحوّلمتابعيك" for crawlers, screen readers and copy/paste).
//
// Usage:
//   node scripts/check-glued.mjs            # source pages, rendered by the browser (JS on)
//   node scripts/check-glued.mjs --dist     # pre-rendered dist/ pages as shipped (JS off)
// Needs playwright-core (npm i --no-save playwright-core) and a Chrome/Edge binary:
//   CHROME_PATH=/usr/bin/google-chrome (default) or any Chromium-based browser.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = process.argv.includes('--dist');
const BASE = DIST ? path.join(ROOT, 'dist') : ROOT;
const PAGES = ['index', 'research', 'content', 'websites', 'consulting', 'portfolio', 'booking', 'privacy', 'terms', 'accessibility'];
const CHROME = process.env.CHROME_PATH || '/usr/bin/google-chrome';

let chromium;
try { ({ chromium } = await import(process.env.PLAYWRIGHT_CORE || 'playwright-core')); } catch {
  console.error('playwright-core is not installed: npm i --no-save playwright-core'); process.exit(2);
}

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.glb': 'model/gltf-binary' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const en = /^\/en(\/|$)/.test(p);
  // Source tree has no en/ folder: serve the root page with root-relative assets, like the dev server.
  if (en && !DIST) p = p.replace(/^\/en/, '');
  let rel = p.replace(/^\/+/, '');
  if (!rel || rel.endsWith('/')) rel += 'index.html';
  let f = path.join(BASE, rel);
  const isFile = (x) => fs.existsSync(x) && fs.statSync(x).isFile();
  if (!isFile(f) && isFile(f + '.html')) f += '.html'; // "content" is also a folder name
  if (!f.startsWith(BASE) || !fs.existsSync(f) || !fs.statSync(f).isFile()) { res.writeHead(404).end(); return; }
  let body = fs.readFileSync(f);
  if (en && !DIST && f.endsWith('.html')) body = body.toString('utf8').replace(/\b(href|src)="(assets|content)\//g, '$1="/$2/');
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' }).end(body);
});
await new Promise((r) => server.listen(0, r));
const origin = 'http://127.0.0.1:' + server.address().port;

const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
const ctx = await browser.newContext({ javaScriptEnabled: !DIST, viewport: { width: 1280, height: 900 } });
let total = 0;
for (const lang of ['ar', 'en']) {
  for (const name of PAGES) {
    const url = origin + (lang === 'en' ? '/en/' : '/') + (name === 'index' ? '' : name + (DIST || lang === 'ar' ? '.html' : ''));
    const page = await ctx.newPage();
    await page.goto(url, { waitUntil: 'load' });
    if (!DIST) await page.waitForTimeout(800);
    const found = await page.evaluate(() => {
      const INLINE = new Set(['inline', 'inline-block', 'inline-flex', 'inline-grid']);
      const out = [];
      const visText = (el) => (el.textContent || '');
      for (const parent of document.querySelectorAll('body *')) {
        const kids = parent.childNodes;
        for (let i = 0; i + 1 < kids.length; i++) {
          const a = kids[i], b = kids[i + 1];
          if (a.nodeType !== 1 || b.nodeType !== 1) continue; // any text node between them (even a space) is fine
          if (!INLINE.has(getComputedStyle(a).display) || !INLINE.has(getComputedStyle(b).display)) continue;
          const ta = visText(a), tb = visText(b);
          if (!ta.trim() || !tb.trim()) continue;
          if (/\S$/.test(ta) && /^\S/.test(tb)) out.push((parent.className || parent.tagName) + ': «' + ta.slice(-20) + '|' + tb.slice(0, 20) + '»');
        }
      }
      return out;
    });
    total += found.length;
    console.log((found.length ? 'FAIL ' : 'ok   ') + lang + ' ' + name + (found.length ? ' (' + found.length + ')' : ''));
    found.slice(0, 8).forEach((f) => console.log('       ' + f));
    await page.close();
  }
}
await browser.close();
server.close();
console.log(total ? `\n${total} glued pair(s) found` : '\nNo glued text found.');
process.exit(total ? 1 : 0);
