// Local dev server: serves the site as-is (no build) and also answers the English site at /en/ and /en/<page>,
// the same URLs the production build produces. Usage: node scripts/dev-server.mjs [port]
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.argv[2]) || 8080;
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.glb': 'model/gltf-binary', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml'
};
const file = (p) => { try { return fs.statSync(p).isFile() ? p : null; } catch { return null; } };

http.createServer((req, res) => {
  let { pathname } = new URL(req.url, 'http://x');
  pathname = decodeURIComponent(pathname);
  const en = /^\/en(\/|$)/.test(pathname);
  let rel = pathname.replace(/^\/en(?=\/|$)/, '').replace(/^\/+/, '');
  if (!rel || rel.endsWith('/')) rel += 'index.html';
  // Like production: under /en/ only the pages exist; assets are served from the root (/assets/...).
  if (en && path.extname(rel) && path.extname(rel) !== '.html') { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Not found: ' + pathname); return; }
  let target = path.join(ROOT, rel);
  if (!target.startsWith(ROOT)) { res.writeHead(403).end('Forbidden'); return; }
  target = file(target) || (en || !path.extname(rel) ? file(target + '.html') : null);
  if (!target) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Not found: ' + pathname); return; }
  const ext = path.extname(target);
  const headers = { 'Content-Type': TYPES[ext] || 'application/octet-stream', 'Cache-Control': 'no-store' };
  if (en && ext === '.html') {
    // English pages need root-relative asset paths (like the production build).
    const html = fs.readFileSync(target, 'utf8').replace(/\b(href|src)="(assets|content)\//g, '$1="/$2/');
    res.writeHead(200, headers).end(html);
    return;
  }
  res.writeHead(200, headers);
  fs.createReadStream(target).pipe(res);
}).listen(PORT, () => console.log('Magmafy dev server: http://localhost:' + PORT));
