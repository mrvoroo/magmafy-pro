// Small toolkit shared by the live demos on the service pages.
import { h, icon, getLang, reducedMotion, content } from '../core.js';

export { h, icon, getLang };
export const reduced = reducedMotion();

// Pick the current language from an { ar, en } dictionary.
export const L = (dict) => dict[getLang()] ?? dict.ar ?? dict.en;
export const isAr = () => getLang() === 'ar';

/* Showcase content (edited from /admin/ → "رحلة العميل"): before/after pairs, journey step visibility. */
const showcase = content.showcase || {};
const pct = (v) => (Number.isFinite(Number(v)) ? Math.max(0, Math.min(100, Number(v))) : 50);
export const compareItems = () => (Array.isArray(showcase.compare) ? showcase.compare : [])
  .filter((p) => p && p.visible !== false && p.before && p.after)
  .map((p) => ({ id: p.id, name: (p.name && (p.name[getLang()] || p.name.ar || p.name.en)) || '', before: p.before, after: p.after, fb: pct(p.beforeFocus), fa: pct(p.afterFocus) }));
export const stepVisible = (i) => !(Array.isArray(showcase.steps) && showcase.steps[i] && showcase.steps[i].visible === false);
export const clientInfo = () => ({ visible: !(showcase.client && showcase.client.visible === false), ...(showcase.client || {}), text: (showcase.client && showcase.client[getLang()]) || {} });
/** Points a before/after <img> pair at one item and keeps the product in frame. */
export function showPair(before, after, p) {
  // The English site lives at /en/, so asset paths must be root-relative there (same rule as core.h).
  const abs = (u) => (/^\/en(\/|$)/.test(location.pathname) && !u.startsWith('/') ? '/' + u : u);
  before.src = abs(p.before); after.src = abs(p.after);
  before.alt = p.name; after.alt = p.name;
  before.style.objectPosition = '50% ' + p.fb + '%'; after.style.objectPosition = '50% ' + p.fa + '%';
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Runs start() while the element is on screen and stop() when it leaves. */
export function onVisible(el, start, stop = () => {}) {
  let on = false;
  const io = new IntersectionObserver((entries) => {
    const vis = entries[0].isIntersecting;
    if (vis && !on) { on = true; start(); } else if (!vis && on) { on = false; stop(); }
  }, { threshold: 0.12 });
  io.observe(el);
  return io;
}

/** A repeating timer that only ticks while its element is visible. */
export function ticker(el, fn, ms) {
  let id = null;
  const tick = () => { fn(); id = setTimeout(tick, ms); };
  onVisible(el, () => { if (!id) id = setTimeout(tick, reduced ? ms * 2 : 200); }, () => { clearTimeout(id); id = null; });
}

export function section({ id, eyebrow, title, text, badge }, ...children) {
  return h('section', { class: 'section demo', id, 'aria-labelledby': id + '-title' },
    h('div', { class: 'container' },
      h('header', { class: 'demo__head', 'data-reveal': '' },
        h('div', {},
          eyebrow ? h('p', { class: 'eyebrow' }, eyebrow) : null,
          h('h2', { class: 'demo__title', id: id + '-title' }, title)),
        h('div', { class: 'demo__aside' },
          text ? h('p', { class: 'demo__text' }, text) : null,
          null)),
      ...children));
}

export function browser(url, ...children) {
  return h('div', { class: 'browser' },
    h('div', { class: 'browser__bar', 'aria-hidden': 'true' },
      h('span', { class: 'browser__dots' }, h('i'), h('i'), h('i')),
      h('span', { class: 'browser__url' }, icon('shield', 12), url)),
    h('div', { class: 'browser__body' }, ...children));
}

export function phone(...children) {
  return h('div', { class: 'phone' },
    h('div', { class: 'phone__notch', 'aria-hidden': 'true' }),
    h('div', { class: 'phone__screen' }, ...children));
}

// Western digits in both languages (as Saudi retail does), riyals as "ر.س" / "SAR".
export function num(v, digits = 0) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(v);
}
export function money(v, digits = 0) {
  return getLang() === 'ar' ? num(v, digits) + ' ر.س' : 'SAR ' + num(v, digits);
}

/** Animate a number inside an element. */
export function countTo(el, to, { format = (v) => num(v), duration = 900 } = {}) {
  const from = Number(el.dataset.v || 0);
  el.dataset.v = to;
  if (reduced) { el.textContent = format(to); return; }
  const t0 = performance.now();
  const step = (now) => {
    const p = Math.min(1, (now - t0) / duration);
    const e = 1 - Math.pow(1 - p, 3);
    el.textContent = format(from + (to - from) * e);
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/** Types text into an element; resolves when done. */
export async function typeInto(el, text, speed = 14) {
  if (reduced) { el.textContent = text; return; }
  el.textContent = '';
  const chunk = Math.max(1, Math.round(text.length / 220));
  for (let i = 0; i < text.length; i += chunk) {
    el.textContent = text.slice(0, i + chunk);
    await sleep(speed);
  }
}

const SVG = 'http://www.w3.org/2000/svg';
export function svg(tag, attrs = {}, ...kids) {
  const el = document.createElementNS(SVG, tag);
  for (const [k, v] of Object.entries(attrs)) if (v != null) el.setAttribute(k, v);
  kids.forEach((k) => k && el.append(k));
  return el;
}

/** Smooth SVG path through points [[x,y], ...]. */
export function smoothPath(pts) {
  if (!pts.length) return '';
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
    const cx = (x0 + x1) / 2;
    d += ` C${cx},${y0} ${cx},${y1} ${x1},${y1}`;
  }
  return d;
}

/** A chat log with bubbles; returns helpers to add messages. */
export function chatLog(cls = '') {
  const log = h('div', { class: 'chat__log ' + cls, role: 'log', 'aria-live': 'polite' });
  const scroll = () => { log.scrollTop = log.scrollHeight; };
  return {
    el: log,
    user(text) { log.append(h('div', { class: 'bubble bubble--user' }, text)); scroll(); },
    async bot(text, { label, typing = 650 } = {}) {
      const dots = h('div', { class: 'bubble bubble--bot bubble--typing', 'aria-hidden': 'true' }, h('i'), h('i'), h('i'));
      log.append(dots); scroll();
      await sleep(reduced ? 0 : typing);
      dots.remove();
      const body = h('span');
      const b = h('div', { class: 'bubble bubble--bot' }, label ? h('span', { class: 'bubble__label' }, label) : null, body);
      log.append(b); scroll();
      await typeInto(body, text, 10);
      scroll();
      return b;
    },
    note(text) { log.append(h('div', { class: 'chat__note' }, text)); scroll(); },
    clear() { log.replaceChildren(); }
  };
}

/** Lowercase, accent-free text for keyword matching. */
export const norm = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
