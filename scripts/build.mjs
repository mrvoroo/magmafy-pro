// Build: copies the site to dist/ and pre-renders every page into plain HTML, in Arabic (/) and
// English (/en/), so search engines and AI crawlers can read it without running JavaScript.
// It also writes sitemap.xml, llms.txt and llms-full.txt, and adds hreflang + JSON-LD to every page.
// The browser still renders the page itself on load, exactly as before; this only adds the
// first copy. Content comes from content/site-content.js, so edits in /admin/ flow through.
// If anything fails for a page, that page is shipped unchanged.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { JSDOM } from 'jsdom';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'dist');
const SITE = 'https://magmafyogp.com';
const SKIP = new Set(['.git', '.github', 'node_modules', 'dist', 'scripts', 'package.json', 'package-lock.json', '.node-version', '.gitignore', 'README.md']);

// page key (body data-page) -> file slug
const PAGES = [
  { key: 'home', file: 'index', slug: '' },
  { key: 'research', file: 'research', slug: 'research' },
  { key: 'content', file: 'content', slug: 'content' },
  { key: 'websites', file: 'websites', slug: 'websites' },
  { key: 'consulting', file: 'consulting', slug: 'consulting' },
  { key: 'portfolio', file: 'portfolio', slug: 'portfolio' },
  { key: 'contact', file: 'booking', slug: 'booking' },
  { key: 'privacy', file: 'privacy', slug: 'privacy' },
  { key: 'terms', file: 'terms', slug: 'terms' },
  { key: 'accessibility', file: 'accessibility', slug: 'accessibility' }
];
const DESC_KEY = { contact: 'booking' };
const SERVICES = ['research', 'content', 'websites', 'consulting'];
const url = (lang, slug) => SITE + (lang === 'en' ? '/en/' : '/') + slug;

/* ---------- copy the site ---------- */
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
for (const name of fs.readdirSync(ROOT)) {
  if (!SKIP.has(name)) fs.cpSync(path.join(ROOT, name), path.join(OUT, name), { recursive: true });
}
fs.mkdirSync(path.join(OUT, 'en'), { recursive: true });

/* ---------- a DOM for the site's own render code ---------- */
const dom = new JSDOM('<!doctype html><html><body><header id="site-header"></header><main id="main"></main><footer id="site-footer"></footer></body></html>', { url: SITE + '/', pretendToBeVisual: true });
const w = dom.window;
w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
w.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} };
w.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
Object.assign(globalThis, { IntersectionObserver: w.IntersectionObserver, ResizeObserver: w.ResizeObserver, window: w, document: w.document, Node: w.Node, location: w.location, localStorage: w.localStorage, sessionStorage: w.sessionStorage, requestAnimationFrame: w.requestAnimationFrame.bind(w), cancelAnimationFrame: w.cancelAnimationFrame.bind(w), HTMLElement: w.HTMLElement, Element: w.Element, getComputedStyle: w.getComputedStyle.bind(w) });
new Function('window', fs.readFileSync(path.join(ROOT, 'content/site-content.js'), 'utf8'))(w);
const C = w.MG_CONTENT;
const S = C.settings || {};

const load = (f) => import(pathToFileURL(path.join(ROOT, 'assets/js', f)).href);
const core = await load('core.js');
const layout = await load('layout.js');
const pages = await load('pages.js');
const { t } = core;
const dict = (lang) => C.i18n[lang] || {};

function renderBody(lang, p) {
  dom.reconfigure({ url: SITE + (lang === 'en' ? '/en/' : '/') + p.slug });
  core.setLang(lang);
  w.document.body.dataset.page = p.key;
  layout.renderHeader(p.key, () => {});
  const main = w.document.getElementById('main');
  main.replaceChildren(...[pages.renderPage(p.key)].flat());
  layout.renderFooter();
  return {
    header: w.document.getElementById('site-header').innerHTML,
    main: main.innerHTML,
    footer: w.document.getElementById('site-footer').innerHTML,
    title: pages.pageTitle(p.key)
  };
}

/* ---------- structured data ---------- */
const brand = S.brand || 'Magmafy';
const sameAs = Object.values(S.social || {}).filter((v) => /^https:\/\//.test(v));
const phone = String(S.phone || '').replace(/[^\d+]/g, '');
const ld = (o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`;

function schema(lang, p, title, description) {
  const d = dict(lang);
  const org = {
    '@type': ['Organization', 'ProfessionalService'],
    '@id': SITE + '/#organization',
    name: brand,
    alternateName: ['ماجمافاي', 'Magmafy OGP'],
    url: SITE + '/',
    logo: SITE + '/assets/img/icon-512.png',
    image: SITE + '/assets/img/og-image.jpg',
    description: (d.meta && d.meta.desc && d.meta.desc.home) || '',
    email: S.email,
    ...(phone ? { telephone: phone } : {}),
    ...(sameAs.length ? { sameAs } : {}),
    knowsLanguage: ['ar', 'en'],
    areaServed: [
      { '@type': 'Country', name: 'Saudi Arabia' },
      { '@type': 'City', name: 'Riyadh' }, { '@type': 'City', name: 'Jeddah' }, { '@type': 'City', name: 'Dammam' },
      { '@type': 'AdministrativeArea', name: 'Gulf Cooperation Council (GCC)' }
    ],
    knowsAbout: ['Furniture marketing', 'Home décor marketing', 'Showroom marketing', 'AI-generated marketing content', '3D showroom websites', 'Meta, TikTok and Snapchat advertising'],
    contactPoint: { '@type': 'ContactPoint', contactType: 'sales', email: S.email, ...(phone ? { telephone: phone } : {}), availableLanguage: ['Arabic', 'English'] },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: lang === 'en' ? 'Services' : 'الخدمات',
      itemListElement: SERVICES.map((k) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: d.services[k].title, description: d.services[k].intro, url: url(lang, k), provider: { '@id': SITE + '/#organization' }, areaServed: 'Saudi Arabia' }
      }))
    }
  };
  const site = { '@type': 'WebSite', '@id': SITE + '/#website', url: SITE + '/', name: brand, inLanguage: ['ar', 'en'], publisher: { '@id': SITE + '/#organization' } };
  const graph = [org, site];
  const here = url(lang, p.slug);
  const page = { '@type': p.key === 'contact' ? 'ContactPage' : 'WebPage', '@id': here + '#webpage', url: here, name: title, description, inLanguage: lang, isPartOf: { '@id': SITE + '/#website' }, about: { '@id': SITE + '/#organization' } };
  graph.push(page);
  if (p.key !== 'home') {
    graph.push({ '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: t('nav.home'), item: url(lang, '') },
      { '@type': 'ListItem', position: 2, name: title.split(' — ')[0], item: here }
    ] });
  }
  if (SERVICES.includes(p.key)) {
    const s = d.services[p.key];
    graph.push({ '@type': 'Service', '@id': here + '#service', name: s.title, serviceType: s.title, description: s.intro, provider: { '@id': SITE + '/#organization' }, areaServed: 'Saudi Arabia', url: here, inLanguage: lang });
  }
  if (p.key === 'home' && d.faq && Array.isArray(d.faq.items)) {
    graph.push({ '@type': 'FAQPage', '@id': here + '#faq', inLanguage: lang, mainEntity: d.faq.items.map((i) => ({ '@type': 'Question', name: i.q, acceptedAnswer: { '@type': 'Answer', text: i.a } })) });
  }
  return ld({ '@context': 'https://schema.org', '@graph': graph });
}

/* ---------- page head + body ---------- */
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const setAttr = (html, re, value) => html.replace(re, (_, a, b) => a + esc(value) + b);

function buildPage(lang, p) {
  const file = path.join(ROOT, p.file + '.html');
  let html = fs.readFileSync(file, 'utf8');
  const out = renderBody(lang, p);
  const desc = ((dict(lang).meta || {}).desc || {})[DESC_KEY[p.key] || p.key] || '';
  const here = url(lang, p.slug);

  html = html.replace('<header class="site-header" id="site-header"></header>', `<header class="site-header" id="site-header">${out.header}</header>`);
  html = html.replace('<footer class="site-footer" id="site-footer"></footer>', `<footer class="site-footer" id="site-footer">${out.footer}</footer>`);
  html = html.replace(/<main id="main"([^>]*)>[\s\S]*?<\/main>/, (_, a) => `<main id="main"${a}>${out.main}</main>`);
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(out.title)}</title>`);
  html = setAttr(html, /(<meta name="description" content=")[^"]*(")/, desc);
  html = setAttr(html, /(<meta property="og:title" content=")[^"]*(")/, out.title);
  html = setAttr(html, /(<meta property="og:description" content=")[^"]*(")/, desc);
  html = setAttr(html, /(<link rel="canonical" href=")[^"]*(")/, here);
  html = setAttr(html, /(<meta property="og:url" content=")[^"]*(")/, here);
  html = html.replace(/(<meta property="og:locale" content=")[^"]*(">)/, `$1${lang === 'en' ? 'en_US' : 'ar_SA'}$2`);
  html = html.replace(/(<meta property="og:locale:alternate" content=")[^"]*(">)/, `$1${lang === 'en' ? 'ar_SA' : 'en_US'}$2`);
  if (!/twitter:title/.test(html)) html = html.replace('</head>', `  <meta name="twitter:title" content="${esc(out.title)}">\n  <meta name="twitter:description" content="${esc(desc)}">\n</head>`);
  const alt = `  <link rel="alternate" hreflang="ar" href="${url('ar', p.slug)}">\n  <link rel="alternate" hreflang="en" href="${url('en', p.slug)}">\n  <link rel="alternate" hreflang="x-default" href="${url('ar', p.slug)}">\n  ${schema(lang, p, out.title, desc)}\n`;
  html = html.replace('</head>', alt + '</head>');
  if (lang === 'en') {
    html = html.replace('<html lang="ar" dir="rtl">', '<html lang="en" dir="ltr">');
    html = html.replace(/\b(href|src)="(assets|content)\//g, '$1="/$2/'); // /en/ pages need root-relative files
  }
  return html;
}

for (const p of PAGES) {
  for (const lang of ['ar', 'en']) {
    const dest = lang === 'en' ? path.join(OUT, 'en', p.file + '.html') : path.join(OUT, p.file + '.html');
    try {
      fs.writeFileSync(dest, buildPage(lang, p));
      console.log('prerendered', lang, p.file);
    } catch (err) {
      console.warn('FAILED', lang, p.file, err && err.message);
      if (lang === 'ar') continue; // the original file is already in dist
      try { fs.rmSync(dest, { force: true }); } catch (_) { /* ignore */ }
    }
  }
}

/* ---------- sitemap ---------- */
const lastmod = (C.meta && /^\d{4}-\d{2}-\d{2}$/.test(C.meta.updated)) ? C.meta.updated : new Date().toISOString().slice(0, 10);
const prio = (p) => (p.key === 'home' ? '1.0' : SERVICES.includes(p.key) || p.key === 'contact' ? '0.8' : p.key === 'portfolio' ? '0.7' : '0.3');
const entries = [];
for (const p of PAGES) {
  for (const lang of ['ar', 'en']) {
    entries.push(`  <url>\n    <loc>${url(lang, p.slug)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <priority>${prio(p)}</priority>\n` +
      ['ar', 'en'].map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${url(l, p.slug)}"/>`).join('\n') +
      `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${url('ar', p.slug)}"/>\n  </url>`);
  }
}
fs.writeFileSync(path.join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${entries.join('\n')}\n</urlset>\n`);

/* ---------- llms.txt and llms-full.txt (plain-language summaries for AI assistants) ---------- */
const en = dict('en');
const ar = dict('ar');
const svcLine = (lang, k) => `- [${dict(lang).services[k].title}](${url(lang, k)}): ${dict(lang).services[k].tagline}.`;
fs.writeFileSync(path.join(OUT, 'llms.txt'), [
  `# ${brand}`,
  '',
  `> ${brand} (ماجمافاي) is a growth and marketing agency for furniture, décor and home-goods showrooms, online stores, factories and interior design studios in Saudi Arabia and the Gulf. Services: market research, AI-assisted content and ads, 3D websites and showrooms, and growth consulting. The site is available in English and Arabic.`,
  '',
  '## Services',
  ...SERVICES.map((k) => svcLine('en', k)),
  '',
  '## Key pages',
  `- [Home, about and FAQ](${url('en', '')}): who we are, how we work, answers to common questions.`,
  `- [Work and live demos](${url('en', 'portfolio')}): example 3D showrooms, content, ads and reports.`,
  `- [Book a free meeting](${url('en', 'booking')}): free 30-minute meeting on Google Meet or Zoom.`,
  '',
  '## بالعربي',
  ...SERVICES.map((k) => svcLine('ar', k)),
  `- [الرئيسية](${url('ar', '')}): من نحن وكيف نعمل وأجوبة الأسئلة الشائعة.`,
  `- [احجز اجتماعًا](${url('ar', 'booking')}): اجتماع مجاني 30 دقيقة.`,
  '',
  '## Optional',
  `- [Full site text in English and Arabic](${SITE}/llms-full.txt)`,
  `- [Contact](mailto:${S.email}): ${S.email}`,
  ''
].join('\n'));

const full = [`# ${brand}: full site text`, '', `Contact: ${S.email}${phone ? ' · ' + phone : ''} · ${SITE}/`, ''];
for (const lang of ['en', 'ar']) {
  const d = dict(lang);
  full.push(`# ${lang === 'en' ? 'English' : 'العربية'}`, '', `## ${lang === 'en' ? 'About' : 'من نحن'}`, '', ...(d.about.paragraphs || []).flatMap((x) => [x, '']));
  for (const k of SERVICES) {
    const s = d.services[k];
    full.push(`## ${s.title}`, '', `${s.tagline}.`, '', s.intro, '', ...(s.items || []).map((i) => '- ' + i), '', `Page: ${url(lang, k)}`, '');
  }
  if (d.why && d.why.items) full.push(`## ${[d.why.title, d.why.titleAccent].filter(Boolean).join(' ')}`, '', ...d.why.items.flatMap((i) => [`### ${i.title}`, i.text, '']));
  if (d.faq && d.faq.items) full.push(`## ${lang === 'en' ? 'Frequently asked questions' : 'الأسئلة الشائعة'}`, '', ...d.faq.items.flatMap((i) => [`### ${i.q}`, i.a, '']));
}
fs.writeFileSync(path.join(OUT, 'llms-full.txt'), full.join('\n'));

console.log('build complete');
process.exit(0);
