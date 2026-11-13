// Shared helpers: content access, language state and safe DOM building.
// Every piece of editable content is written with textContent / setAttribute,
// never innerHTML, so nothing from the content file can inject markup or script.

const LANG_KEY = 'mg-lang';

export const content = Object.freeze(window.MG_CONTENT || {});
export const settings = content.settings || {};
export const legal = content.legal || {};
export const LANGS = (Array.isArray(settings.languages) ? settings.languages : ['ar', 'en'])
  .filter((l) => /^[a-z]{2}$/.test(l) && content.i18n && content.i18n[l]);

// Language lives in the URL: the Arabic site is at / and the English site at /en/.
const isEnPath = () => /^\/en(\/|$)/.test(location.pathname);
/** The language the current URL belongs to. */
export const urlLang = () => (isEnPath() ? 'en' : 'ar');
const PAGE_RE = /^(index|research|content|websites|consulting|portfolio|booking|privacy|terms|accessibility)\.html(.*)$/;
/** Site-internal page links stay inside the English site when the visitor is on /en/. */
export function localizeHref(v) {
  if (!isEnPath()) return v;
  const m = PAGE_RE.exec(v);
  return m ? '/en/' + (m[1] === 'index' ? '' : m[1]) + m[2] : v;
}
/** The current page's address in another language. */
export function langUrl(l) {
  const slug = location.pathname.replace(/^\/en(?=\/|$)/, '').replace(/^\/+/, '').replace(/\.html$/, '').replace(/\/$/, '');
  const q = location.search.replace(/([?&])lang=[a-z]{2}&?/, '$1').replace(/[?&]$/, '');
  return (l === 'en' ? '/en/' : '/') + (slug === 'index' ? '' : slug) + q + location.hash;
}

let lang = pickInitialLang();

function pickInitialLang() {
  const fromUrl = new URLSearchParams(location.search).get('lang');
  if (LANGS.includes(fromUrl)) return fromUrl;
  if (isEnPath() && LANGS.includes('en')) return 'en';
  try {
    const stored = localStorage.getItem(LANG_KEY);
    if (LANGS.includes(stored)) return stored;
  } catch (_) { /* storage blocked: fall back to default */ }
  return LANGS.includes(settings.defaultLang) ? settings.defaultLang : LANGS[0] || 'ar';
}

export const getLang = () => lang;
export const isRTL = () => lang === 'ar';

// Only remembered when the visitor actively switches (strictly necessary storage).
export function setLang(next) {
  if (!LANGS.includes(next)) return;
  lang = next;
  try { localStorage.setItem(LANG_KEY, next); } catch (_) { /* ignore */ }
}

export function clearStoredLang() {
  try { localStorage.removeItem(LANG_KEY); } catch (_) { /* ignore */ }
}

export function t(path) {
  const dict = (content.i18n && content.i18n[lang]) || {};
  return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), dict);
}

export const str = (v) => (typeof v === 'string' ? v : v == null ? '' : String(v));

// Allow only links we can vouch for: same-site paths, anchors, https, mailto, tel.
export function safeUrl(raw, { allowExternal = true } = {}) {
  const v = str(raw).trim();
  if (!v) return '';
  if (/^#[\w-]*$/.test(v)) return v;
  if (/^(\.{0,2}\/)?[\w\-./]+(\?[\w=&-]*)?(#[\w-]*)?$/.test(v) && !v.includes('..') && !v.startsWith('//')) return v;
  if (allowExternal && /^https:\/\/[^\s"'<>]+$/i.test(v)) return v;
  if (/^mailto:[^\s"'<>]+$/i.test(v)) return v;
  if (/^tel:\+?[\d\s()/-]+$/i.test(v)) return v;
  return '';
}

// Images only from our own origin (uploads live in the repo).
export function safeImage(raw) {
  const v = str(raw).trim();
  return /^(\.\/|\/)?assets\/[\w\-./]+\.(png|jpe?g|webp|avif|svg)$/i.test(v) && !v.includes('..') ? v : '';
}

/**
 * h('a', { class: 'x', href: '/y' }, 'text', child)
 * Strings become text nodes. "on*" attributes are rejected; use addEventListener.
 */
export function h(tag, attrs = {}, ...children) {
  const el = document.createElementNS(
    attrs && attrs.ns ? attrs.ns : 'http://www.w3.org/1999/xhtml', tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false || k === 'ns') continue;
    if (/^on/i.test(k)) throw new Error('inline handlers are not allowed');
    if (k === 'href') {
      const url = safeUrl(v);
      if (url) el.setAttribute('href', localizeHref(url));
      continue;
    }
    if (k === 'src') {
      let url = safeImage(v) || (/^(\.\/)?assets\/[\w\-./]+$/.test(v) ? v : '');
      if (url && isEnPath() && !url.startsWith('/')) url = '/' + url.replace(/^\.\//, '');
      if (url) el.setAttribute('src', url);
      continue;
    }
    el.setAttribute(k, v === true ? '' : str(v));
  }
  append(el, children);
  return el;
}

function append(el, children) {
  for (const c of children.flat(Infinity)) {
    if (c == null || c === false) continue;
    el.append(c instanceof Node ? c : document.createTextNode(str(c)));
  }
}

const SVG_NS = 'http://www.w3.org/2000/svg';
const ICONS = {
  research: ['M10.5 4a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13z', 'M15.5 15.5L21 21', 'M7.5 12.5v-2', 'M10.5 12.5v-4', 'M13.5 12.5v-3'],
  content: ['M4 6h16v12H4z', 'M10 9.5v5l4.5-2.5z', 'M8 3l2 3', 'M16 3l-2 3'],
  websites: ['M3 5h18v11H3z', 'M8 20h8', 'M12 16v4', 'M12 7.5l3 1.6v3.3l-3 1.6-3-1.6V9.1z'],
  consulting: ['M4 5h11v8H8l-4 3z', 'M15 9h5v8l-3-2.5h-6v-1.5'],
  arrow: ['M5 12h14', 'M13 6l6 6-6 6'],
  check: ['M5 12l5 5 9-10'],
  layers: ['M12 3l9 5-9 5-9-5 9-5z', 'M3 13l9 5 9-5'],
  spark: ['M12 3l2 7 7 2-7 2-2 7-2-7-7-2 7-2z'],
  shield: ['M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z', 'M9 12l2 2 4-4'],
  target: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z', 'M12 7.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9z', 'M12 11.5a.5.5 0 1 0 0 1'],
  sofa: ['M4 11V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3', 'M2 13a2 2 0 0 1 4 0v2h12v-2a2 2 0 0 1 4 0v5H2z', 'M5 18v2', 'M19 18v2'],
  chart: ['M4 19V10', 'M10 19V5', 'M16 19v-6', 'M22 19H2'],
  calendar: ['M4 6h16v14H4z', 'M4 10h16', 'M8 3v4', 'M16 3v4'],
  clock: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z', 'M12 7v5l3 2'],
  video: ['M3 7h12v10H3z', 'M15 10l6-3v10l-6-3'],
  mail: ['M3 6h18v12H3z', 'M3 7l9 6 9-6'],
  phone: ['M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2'],
  pin: ['M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z', 'M12 9.5a.5.5 0 1 0 0 .01'],
  whatsapp: ['M4 20l1.3-4A8 8 0 1 1 8 18.7z', 'M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.6-2-1-1 .9a5 5 0 0 1-2.3-2.3l.9-1-1-2z'],
  linkedin: ['M4 9h4v11H4z', 'M6 4.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z', 'M11 9h4v2c.6-1.2 2-2 3.5-2 2 0 3.5 1.3 3.5 4v7h-4v-6c0-1.2-.7-2-1.8-2s-1.7.8-1.7 2v6H11z'],
  instagram: ['M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4z', 'M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z', 'M17.5 6.5h.01'],
  snapchat: ['M12 3c3 0 5 2.2 5 5v2.5l2 .8-1.6 1.4c.6 1.6 1.9 2.7 3.6 3.1-.7.9-2 1-3 1.2L17.5 19c-1.5-.3-2.8.2-3.8 1-1 .6-2.4.6-3.4 0-1-.8-2.3-1.3-3.8-1L6 17c-1-.2-2.3-.3-3-1.2 1.7-.4 3-1.5 3.6-3.1L5 11.3l2-.8V8c0-2.8 2-5 5-5z'],
  tiktok: ['M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5', 'M14 3c.5 3 2.5 5 5.5 5'],
  pinterest: ['M12 3a9 9 0 0 0-3.3 17.4', 'M12 3a9 9 0 0 1 0 18c-1 0-2-.2-3-.5', 'M10.5 9.5c.4-1.4 1.6-2 2.9-1.7 2 .5 2.3 3 1.3 4.8-.9 1.5-2.7 1.6-3.2.4L9 20']
  ,x: ['M4 4l16 16', 'M20 4L4 20']
};

export function icon(name, size = 24) {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', size);
  svg.setAttribute('height', size);
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  svg.setAttribute('class', 'icon icon--' + name);
  for (const d of ICONS[name] || []) {
    const p = document.createElementNS(SVG_NS, 'path');
    p.setAttribute('d', d);
    svg.append(p);
  }
  return svg;
}

export const reducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const SERVICE_KEYS = ['research', 'content', 'websites', 'consulting'];
export const SERVICE_PAGES = {
  research: 'research.html',
  content: 'content.html',
  websites: 'websites.html',
  consulting: 'consulting.html'
};
